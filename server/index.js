import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'node:url';
import {
  getAllClients,
  getClientById,
  createClient,
  deleteClient,
  getClientDb,
  getClientDatabasePath,
  CLIENTS_DB_DIR,
  authenticateClient,
  registerNewClientFull,
  updateClientProfile
} from './db.js';
import { parseGPayText, autoCategorize } from './services/gpayParser.js';
import { calculateAllocationAdvice } from './services/allocator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up file upload for CSV statement importing
const upload = multer({ dest: 'data/temp-uploads/' });
if (!fs.existsSync('data/temp-uploads/')) {
  fs.mkdirSync('data/temp-uploads/', { recursive: true });
}

// -----------------------------------------------------------------------------
// AUTHENTICATION & CLIENT ONBOARDING PORTAL
// -----------------------------------------------------------------------------

// Client Login (by email/name + 4-digit PIN)
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, pin } = req.body;
    if (!identifier || !pin) {
      return res.status(400).json({ success: false, error: 'Identifier and 4-digit PIN are required' });
    }
    const client = authenticateClient(identifier, pin);
    const dbPath = getClientDatabasePath(client.id);
    let dbSizeKb = 0;
    if (fs.existsSync(dbPath)) {
      dbSizeKb = (fs.statSync(dbPath).size / 1024).toFixed(1);
    }
    res.json({
      success: true,
      client: {
        ...client,
        dbSizeKb,
        dbFileName: `${client.id}.sqlite`
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// New Client Registration & Onboarding
app.post('/api/auth/register', (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      pin,
      currency,
      risk_profile,
      monthly_income_target,
      monthly_expense_baseline,
      bank_name,
      initial_bank_balance,
      gpay_balance,
      notes
    } = req.body;

    const newClient = registerNewClientFull({
      name,
      email,
      phone,
      pin: pin || '1234',
      currency: currency || 'INR',
      risk_profile: risk_profile || 'balanced',
      monthly_income_target,
      monthly_expense_baseline,
      bank_name: bank_name || 'Primary Bank',
      initial_bank_balance,
      gpay_balance,
      notes
    });

    const dbPath = getClientDatabasePath(newClient.id);
    const dbSizeKb = fs.existsSync(dbPath) ? (fs.statSync(dbPath).size / 1024).toFixed(1) : 0;

    res.status(201).json({
      success: true,
      client: {
        ...newClient,
        dbSizeKb,
        dbFileName: `${newClient.id}.sqlite`
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update Client Profile / Settings
app.put('/api/clients/:clientId/profile', (req, res) => {
  try {
    const { clientId } = req.params;
    const updated = updateClientProfile(clientId, req.body);
    res.json({ success: true, client: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// CLIENT PROFILE MANAGEMENT (Multi-Tenant Master DB)
// -----------------------------------------------------------------------------

// List all clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = getAllClients();
    const enriched = clients.map(client => {
      const dbPath = getClientDatabasePath(client.id);
      let dbSizeKb = 0;
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        dbSizeKb = (stats.size / 1024).toFixed(1);
      }
      return {
        ...client,
        dbSizeKb,
        dbFileName: `${client.id}.sqlite`
      };
    });
    res.json({ success: true, clients: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new client profile (creates isolated database)
app.post('/api/clients', (req, res) => {
  try {
    const { name, email, currency, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Client name is required' });
    }
    const newClient = createClient({ name, email, currency: currency || 'INR', notes });
    res.status(201).json({ success: true, client: newClient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download / backup isolated client database file
app.get('/api/clients/:clientId/export-db', (req, res) => {
  try {
    const { clientId } = req.params;
    const client = getClientById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    const dbPath = getClientDatabasePath(clientId);
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ success: false, error: 'Database file not found' });
    }
    res.download(dbPath, `${client.name.replace(/[^a-z0-9]/gi, '_')}_ledger.sqlite`);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// CLIENT DASHBOARD & ANALYTICS
// -----------------------------------------------------------------------------

app.get('/api/clients/:clientId/dashboard', (req, res) => {
  try {
    const { clientId } = req.params;
    const client = getClientById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const db = getClientDb(clientId);

    // Accounts & Net Worth
    const accounts = db.prepare('SELECT * FROM accounts').all();
    const netWorth = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // Current Month Cash Flow
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthlyStats = db.prepare(`
      SELECT
        type,
        SUM(amount) as total
      FROM transactions
      WHERE date LIKE ?
      GROUP BY type
    `).all(`${currentMonthPrefix}%`);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    monthlyStats.forEach(stat => {
      if (stat.type === 'income') monthlyIncome = stat.total;
      if (stat.type === 'expense') monthlyExpenses = stat.total;
    });

    // Spending by Category
    const categorySpending = db.prepare(`
      SELECT
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE type = 'expense' AND date LIKE ?
      GROUP BY category
      ORDER BY total DESC
    `).all(`${currentMonthPrefix}%`);

    // Recent Transactions
    const recentTransactions = db.prepare(`
      SELECT t.*, a.name as account_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT 10
    `).all();

    // 6-Month Cash Flow Trend
    const monthlyTrends = db.prepare(`
      SELECT
        SUBSTR(date, 1, 7) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      GROUP BY SUBSTR(date, 1, 7)
      ORDER BY month DESC
      LIMIT 6
    `).all().reverse();

    // Income streams
    const incomeStreams = db.prepare('SELECT * FROM income_streams').all();

    // Goals
    const goals = db.prepare('SELECT * FROM goals').all();

    res.json({
      success: true,
      client,
      summary: {
        netWorth,
        monthlyIncome,
        monthlyExpenses,
        netCashflow: monthlyIncome - monthlyExpenses,
        savingsRate: monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0,
        totalAccounts: accounts.length,
        totalTransactions: db.prepare('SELECT COUNT(*) as count FROM transactions').get().count
      },
      accounts,
      categorySpending,
      recentTransactions,
      monthlyTrends,
      incomeStreams,
      goals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// TRANSACTIONS LEDGER (CRUD & Filters)
// -----------------------------------------------------------------------------

app.get('/api/clients/:clientId/transactions', (req, res) => {
  try {
    const { clientId } = req.params;
    const { search, category, type, payment_mode, startDate, endDate, limit = 100 } = req.query;
    const db = getClientDb(clientId);

    let query = `
      SELECT t.*, a.name as account_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (t.payee LIKE ? OR t.notes LIKE ? OR t.upi_ref LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category && category !== 'All') {
      query += ` AND t.category = ?`;
      params.push(category);
    }
    if (type && type !== 'All') {
      query += ` AND t.type = ?`;
      params.push(type);
    }
    if (payment_mode && payment_mode !== 'All') {
      query += ` AND t.payment_mode = ?`;
      params.push(payment_mode);
    }
    if (startDate) {
      query += ` AND t.date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND t.date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY t.date DESC, t.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const transactions = db.prepare(query).all(...params);

    // Get unique categories for filter
    const categories = db.prepare('SELECT DISTINCT category FROM transactions ORDER BY category').all().map(c => c.category);

    res.json({ success: true, transactions, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new transaction
app.post('/api/clients/:clientId/transactions', (req, res) => {
  try {
    const { clientId } = req.params;
    const { date, amount, type, category, account_id, payee, payment_mode = 'gpay', notes = '', upi_ref = '' } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ success: false, error: 'Amount, type, and category are required' });
    }

    const db = getClientDb(clientId);
    const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const txDate = date || new Date().toISOString().split('T')[0];

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, date, amount, type, category, account_id, payee, payment_mode, notes, upi_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTx.run(txId, txDate, Number(amount), type, category, account_id || null, payee || 'Payment', payment_mode, notes, upi_ref);

    // Update account balance
    if (account_id) {
      const balanceDelta = type === 'income' ? Number(amount) : -Number(amount);
      db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(balanceDelta, account_id);
    }

    const savedTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
    res.status(201).json({ success: true, transaction: savedTx });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete transaction
app.delete('/api/clients/:clientId/transactions/:txId', (req, res) => {
  try {
    const { clientId, txId } = req.params;
    const db = getClientDb(clientId);

    const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Revert account balance
    if (tx.account_id) {
      const balanceDelta = tx.type === 'income' ? -tx.amount : tx.amount;
      db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(balanceDelta, tx.account_id);
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(txId);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// GOOGLE PAY & UPI INTEGRATION (SMS / Receipt Parser & Batch Importer)
// -----------------------------------------------------------------------------

// Parse GPay / UPI notification text without saving
app.post('/api/clients/:clientId/gpay/parse-text', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'No text provided to parse' });
    }
    const parsed = parseGPayText(text);
    res.json({ success: true, parsed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Parse and directly save GPay transaction
app.post('/api/clients/:clientId/gpay/save-parsed', (req, res) => {
  try {
    const { clientId } = req.params;
    const { text, account_id } = req.body;
    const parsed = parseGPayText(text);

    const db = getClientDb(clientId);
    const txId = `gpay-${Date.now()}`;

    // Target default GPay account if none supplied
    let targetAccountId = account_id;
    if (!targetAccountId) {
      const defaultGpayAcc = db.prepare("SELECT id FROM accounts WHERE type = 'gpay_upi' LIMIT 1").get();
      if (defaultGpayAcc) {
        targetAccountId = defaultGpayAcc.id;
      } else {
        const firstAcc = db.prepare('SELECT id FROM accounts LIMIT 1').get();
        if (firstAcc) targetAccountId = firstAcc.id;
      }
    }

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, date, amount, type, category, account_id, payee, payment_mode, notes, upi_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTx.run(
      txId,
      parsed.date,
      parsed.amount,
      parsed.type,
      parsed.category,
      targetAccountId,
      parsed.payee,
      'gpay',
      parsed.notes,
      parsed.upi_ref
    );

    if (targetAccountId && parsed.amount > 0) {
      const balanceDelta = parsed.type === 'income' ? parsed.amount : -parsed.amount;
      db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(balanceDelta, targetAccountId);
    }

    const savedTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
    res.status(201).json({ success: true, transaction: savedTx, parsed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch CSV Statement Importer (Bank / GPay export)
app.post('/api/clients/:clientId/transactions/import-csv', upload.single('statement'), (req, res) => {
  try {
    const { clientId } = req.params;
    const { account_id } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const db = getClientDb(clientId);
    let importedCount = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, date, amount, type, category, account_id, payee, payment_mode, notes, upi_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of records) {
      // Flexible column matcher (Date, Txn Date, Transaction Date)
      const rawDate = row['Date'] || row['Txn Date'] || row['Transaction Date'] || row['date'] || new Date().toISOString().split('T')[0];
      const rawDescription = row['Description'] || row['Narration'] || row['Remarks'] || row['Payee'] || row['details'] || 'Imported Entry';
      const rawDebit = parseFloat((row['Debit'] || row['Withdrawal'] || row['debit'] || '0').replace(/,/g, '')) || 0;
      const rawCredit = parseFloat((row['Credit'] || row['Deposit'] || row['credit'] || '0').replace(/,/g, '')) || 0;
      const rawRef = row['Ref No'] || row['UTR'] || row['Chq/Ref No'] || row['Reference'] || '';

      const isExpense = rawDebit > 0;
      const amount = isExpense ? rawDebit : rawCredit;

      if (amount <= 0) continue;

      const type = isExpense ? 'expense' : 'income';
      const category = autoCategorize(rawDescription);
      const isGpay = /upi|gpay|google pay/i.test(rawDescription) || /upi/i.test(rawRef);
      const paymentMode = isGpay ? 'gpay' : 'netbanking';

      const txId = `csv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      insertTx.run(
        txId,
        rawDate,
        amount,
        type,
        category,
        account_id || null,
        rawDescription.substring(0, 60),
        paymentMode,
        'Imported via CSV statement',
        rawRef
      );

      if (isExpense) totalDebit += amount;
      else totalCredit += amount;

      importedCount++;
    }

    // Clean up uploaded temp file
    fs.unlinkSync(req.file.path);

    // Update account balance
    if (account_id) {
      const netDelta = totalCredit - totalDebit;
      db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(netDelta, account_id);
    }

    res.json({
      success: true,
      importedCount,
      totalCredit,
      totalDebit,
      message: `Successfully imported ${importedCount} transactions`
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// SMART ALLOCATION & INCOME STREAM SUGGESTER
// -----------------------------------------------------------------------------

app.get('/api/clients/:clientId/allocation-advice', (req, res) => {
  try {
    const { clientId } = req.params;
    const { customIncome, customExpenses } = req.query;
    const db = getClientDb(clientId);

    // Compute defaults from database if not overridden
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthIncomeRow = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date LIKE ?").get(`${currentMonthPrefix}%`);
    const monthExpenseRow = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date LIKE ?").get(`${currentMonthPrefix}%`);

    const accounts = db.prepare('SELECT * FROM accounts').all();
    const liquidSavings = accounts
      .filter(a => ['bank', 'gpay_upi', 'cash', 'wallet'].includes(a.type))
      .reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);

    const streams = db.prepare('SELECT * FROM income_streams').all();

    const monthlyIncome = customIncome ? Number(customIncome) : (monthIncomeRow.total || 95000);
    const monthlyExpenses = customExpenses ? Number(customExpenses) : (monthExpenseRow.total || 42000);

    const advice = calculateAllocationAdvice({
      monthlyIncome,
      monthlyExpenses,
      currentSavings: liquidSavings,
      currentStreams: streams
    });

    res.json({ success: true, advice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// ACCOUNTS & INCOME STREAMS MANAGEMENT
// -----------------------------------------------------------------------------

app.get('/api/clients/:clientId/accounts', (req, res) => {
  try {
    const { clientId } = req.params;
    const db = getClientDb(clientId);
    const accounts = db.prepare('SELECT * FROM accounts ORDER BY created_at ASC').all();
    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/clients/:clientId/accounts', (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, type, balance = 0, account_number = '', bank_name = '' } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Name and type are required' });
    }
    const db = getClientDb(clientId);
    const id = `acc-${Date.now()}`;
    db.prepare(`
      INSERT INTO accounts (id, name, type, balance, account_number, bank_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, type, Number(balance), account_number, bank_name);

    res.status(201).json({ success: true, account: db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/clients/:clientId/income-streams', (req, res) => {
  try {
    const { clientId } = req.params;
    const db = getClientDb(clientId);
    const streams = db.prepare('SELECT * FROM income_streams ORDER BY expected_monthly DESC').all();
    res.json({ success: true, streams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/clients/:clientId/income-streams', (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, type, expected_monthly, actual_received = 0, stability_score = 8, notes = '' } = req.body;
    const db = getClientDb(clientId);
    const id = `stream-${Date.now()}`;
    db.prepare(`
      INSERT INTO income_streams (id, name, type, expected_monthly, actual_received, stability_score, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, type, Number(expected_monthly), Number(actual_received), Number(stability_score), notes);

    res.status(201).json({ success: true, stream: db.prepare('SELECT * FROM income_streams WHERE id = ?').get(id) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static files from client/dist if built
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`[Finance Tracker Server] Running at http://localhost:${PORT}`);
  console.log(`[Database Isolation] Multi-client SQLite storage active in ${CLIENTS_DB_DIR}`);
});
