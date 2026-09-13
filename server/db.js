import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
export const CLIENTS_DB_DIR = path.join(DATA_DIR, 'clients');

if (!fs.existsSync(CLIENTS_DB_DIR)) {
  fs.mkdirSync(CLIENTS_DB_DIR, { recursive: true });
}

// Master DB for Clients
const masterDbPath = path.join(DATA_DIR, 'master.db');
const masterDb = new DatabaseSync(masterDbPath);

// Initialize Master Tables
masterDb.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    pin TEXT DEFAULT '1234',
    currency TEXT DEFAULT 'INR',
    risk_profile TEXT DEFAULT 'balanced', -- 'conservative', 'balanced', 'aggressive'
    monthly_income_target REAL DEFAULT 95000,
    monthly_expense_baseline REAL DEFAULT 38000,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Alter existing table columns if upgrading
try {
  masterDb.exec("ALTER TABLE clients ADD COLUMN phone TEXT;");
} catch (e) {}
try {
  masterDb.exec("ALTER TABLE clients ADD COLUMN pin TEXT DEFAULT '1234';");
} catch (e) {}
try {
  masterDb.exec("ALTER TABLE clients ADD COLUMN risk_profile TEXT DEFAULT 'balanced';");
} catch (e) {}
try {
  masterDb.exec("ALTER TABLE clients ADD COLUMN monthly_income_target REAL DEFAULT 95000;");
} catch (e) {}
try {
  masterDb.exec("ALTER TABLE clients ADD COLUMN monthly_expense_baseline REAL DEFAULT 38000;");
} catch (e) {}

// Seed default clients if empty
const countStmt = masterDb.prepare('SELECT COUNT(*) as count FROM clients');
const { count } = countStmt.get();

if (count === 0) {
  const insertClient = masterDb.prepare(`
    INSERT INTO clients (id, name, email, currency, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertClient.run('client-1', 'Personal (Yash)', 'yash@personal.app', 'INR', 'Primary personal finance account');
  insertClient.run('client-2', 'Consulting & Freelance', 'yash@business.app', 'INR', 'Client & business cashflows');
}

// Cache of open client DB connections
const clientDbCache = new Map();

/**
 * Get or initialize an isolated database connection for a specific client
 * Each client has a physically isolated .sqlite file.
 */
export function getClientDb(clientId) {
  // Validate client exists in master
  const clientQuery = masterDb.prepare('SELECT * FROM clients WHERE id = ?');
  const client = clientQuery.get(clientId);
  if (!client) {
    throw new Error(`Client with id "${clientId}" not found.`);
  }

  if (clientDbCache.has(clientId)) {
    return clientDbCache.get(clientId);
  }

  const clientDbPath = path.join(CLIENTS_DB_DIR, `${clientId}.sqlite`);
  const isNewDb = !fs.existsSync(clientDbPath);
  const db = new DatabaseSync(clientDbPath);

  // Enable WAL mode for high concurrency & integrity
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Initialize schema for client DB
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'bank', 'gpay_upi', 'wallet', 'credit_card', 'cash', 'investment'
      balance REAL DEFAULT 0,
      account_number TEXT,
      bank_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
      category TEXT NOT NULL,
      account_id TEXT,
      payee TEXT,
      payment_mode TEXT DEFAULT 'gpay', -- 'gpay', 'upi', 'card', 'cash', 'netbanking'
      notes TEXT,
      upi_ref TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT UNIQUE NOT NULL,
      monthly_limit REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      category TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS income_streams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'salary', 'freelance', 'dividend', 'rental', 'business', 'passive'
      expected_monthly REAL NOT NULL,
      actual_received REAL DEFAULT 0,
      stability_score INTEGER DEFAULT 8, -- 1-10
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (isNewDb) {
    seedClientInitialData(db, clientId);
  }

  clientDbCache.set(clientId, db);
  return db;
}

function seedClientInitialData(db, clientId) {
  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, name, type, balance, account_number, bank_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, date, amount, type, category, account_id, payee, payment_mode, notes, upi_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, category, monthly_limit)
    VALUES (?, ?, ?)
  `);

  const insertGoal = db.prepare(`
    INSERT INTO goals (id, name, target_amount, current_amount, deadline, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertStream = db.prepare(`
    INSERT INTO income_streams (id, name, type, expected_monthly, actual_received, stability_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const d = (day) => `${year}-${month}-${String(day).padStart(2, '0')}`;

  if (clientId === 'client-1') {
    // Accounts
    insertAccount.run('acc-1', 'HDFC Salary Account', 'bank', 84500, 'XX4829', 'HDFC Bank');
    insertAccount.run('acc-2', 'Google Pay (UPI linked)', 'gpay_upi', 12500, 'UPI-GPay', 'UPI');
    insertAccount.run('acc-3', 'ICICI Amazon Pay Card', 'credit_card', -4350, 'XX9012', 'ICICI Bank');
    insertAccount.run('acc-4', 'Groww / Zerodha Investments', 'investment', 175000, 'INV-889', 'BSE/NSE');
    insertAccount.run('acc-5', 'Emergency Liquid Cash', 'cash', 25000, '', 'Cash');

    // Transactions
    insertTx.run('tx-1', d(1), 95000, 'income', 'Salary', 'acc-1', 'Tech Corp Global', 'netbanking', 'Monthly Salary Deposit', 'SAL-2026-09');
    insertTx.run('tx-2', d(2), 22000, 'expense', 'Rent & Housing', 'acc-1', 'Skyline Residency', 'netbanking', 'Apartment Rent', 'NEFT-88910');
    insertTx.run('tx-3', d(3), 485, 'expense', 'Food & Dining', 'acc-2', 'Swiggy', 'gpay', 'Lunch delivery via GPay', '425983719283');
    insertTx.run('tx-4', d(4), 1450, 'expense', 'Groceries & Shopping', 'acc-2', 'Blinkit Mart', 'gpay', 'Weekly household groceries', '426019283746');
    insertTx.run('tx-5', d(5), 650, 'expense', 'Transportation', 'acc-2', 'Uber India', 'gpay', 'Commute to co-working space', '426102938475');
    insertTx.run('tx-6', d(7), 15000, 'income', 'Freelance & Side Income', 'acc-1', 'Stripe Client Payout', 'netbanking', 'UI/UX Mobile App Design Milestone', 'STR-99482');
    insertTx.run('tx-7', d(8), 2499, 'expense', 'Bills & Utilities', 'acc-3', 'Airtel Broadband & Fiber', 'card', 'Quarterly Internet Bill', 'AIR-4819');
    insertTx.run('tx-8', d(9), 350, 'expense', 'Food & Dining', 'acc-2', 'Blue Tokai Coffee', 'gpay', 'Coffee meeting with client', '426391029485');
    insertTx.run('tx-9', d(10), 12000, 'expense', 'Investments & SIP', 'acc-1', 'Nifty 50 Index Fund', 'netbanking', 'Auto-SIP Mutual Fund', 'SIP-9910');

    // Budgets
    insertBudget.run('b-1', 'Food & Dining', 12000);
    insertBudget.run('b-2', 'Groceries & Shopping', 15000);
    insertBudget.run('b-3', 'Transportation', 6000);
    insertBudget.run('b-4', 'Entertainment', 5000);
    insertBudget.run('b-5', 'Bills & Utilities', 8000);

    // Goals
    insertGoal.run('g-1', '6-Month Emergency Safety Fund', 250000, 125000, `${year}-12-31`, 'Emergency');
    insertGoal.run('g-2', 'New MacBook Pro / Workstation', 180000, 110000, `${year}-11-15`, 'Gadgets');
    insertGoal.run('g-3', 'Japan Travel Fund', 200000, 45000, `${year + 1}-04-30`, 'Travel');

    // Income Streams
    insertStream.run('is-1', 'Primary Tech Job (Full-Time)', 'salary', 95000, 95000, 9, 'Consistent direct deposit');
    insertStream.run('is-2', 'Freelance Consulting & Web Apps', 'freelance', 25000, 15000, 6, '2-3 ongoing retainer clients');
    insertStream.run('is-3', 'Dividend Portfolio & SGB Interest', 'dividend', 2500, 2100, 8, 'Quarterly payouts reinvested');
  } else {
    // Client 2 (Business / Freelance)
    insertAccount.run('acc-b1', 'Current Business Account (Axis)', 'bank', 142000, 'XX7719', 'Axis Bank');
    insertAccount.run('acc-b2', 'Business GPay UPI Merchant', 'gpay_upi', 34500, 'MERCHANT-UPI', 'Google Pay for Business');
    insertTx.run('tx-b1', d(1), 85000, 'income', 'Client Retainer', 'acc-b1', 'Acme Corp', 'netbanking', 'Monthly DevOps Consulting', 'RET-01');
    insertTx.run('tx-b2', d(3), 14000, 'expense', 'Software & Cloud Tools', 'acc-b1', 'AWS & Vercel Services', 'card', 'Server hosting bills', 'AWS-482');
    insertBudget.run('bb-1', 'Software & Cloud Tools', 20000);
    insertGoal.run('gb-1', 'Annual Business Tax Reserve', 150000, 80000, `${year}-12-31`, 'Taxes');
    insertStream.run('is-b1', 'Client Contracts', 'business', 120000, 85000, 7, 'B2B monthly contracts');
  }
}

export function getAllClients() {
  return masterDb.prepare('SELECT * FROM clients ORDER BY created_at ASC').all();
}

export function getClientById(id) {
  return masterDb.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

export function authenticateClient(identifier, pin) {
  if (!identifier || !pin) {
    throw new Error('Email/Client ID and 4-digit PIN are required');
  }
  const cleanId = identifier.trim();
  const cleanPin = pin.trim();

  const client = masterDb.prepare(`
    SELECT * FROM clients 
    WHERE (id = ? OR email = ? OR LOWER(name) = LOWER(?))
  `).get(cleanId, cleanId, cleanId);

  if (!client) {
    throw new Error('Client account not found');
  }

  // Check PIN (default '1234' for seeded clients if not changed)
  const storedPin = client.pin || '1234';
  if (storedPin !== cleanPin) {
    throw new Error('Incorrect Security PIN');
  }

  return client;
}

export function registerNewClientFull({
  name,
  email,
  phone = '',
  pin = '1234',
  currency = 'INR',
  risk_profile = 'balanced',
  monthly_income_target = 85000,
  monthly_expense_baseline = 35000,
  bank_name = 'Primary Bank',
  initial_bank_balance = 50000,
  gpay_balance = 5000,
  notes = ''
}) {
  if (!name) throw new Error('Client name is required');
  if (!pin || pin.length < 4) throw new Error('A 4-digit PIN is required');

  const id = `client-${Date.now()}`;
  const stmt = masterDb.prepare(`
    INSERT INTO clients (
      id, name, email, phone, pin, currency, 
      risk_profile, monthly_income_target, monthly_expense_baseline, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    name.trim(),
    email ? email.trim() : null,
    phone ? phone.trim() : '',
    pin.trim(),
    currency,
    risk_profile,
    Number(monthly_income_target) || 85000,
    Number(monthly_expense_baseline) || 35000,
    notes
  );

  // Initialize client DB
  const db = getClientDb(id);

  // Auto-seed starter accounts for new client
  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, name, type, balance, account_number, bank_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAccount.run('acc-p1', `${bank_name} Salary A/C`, 'bank', Number(initial_bank_balance) || 0, 'XX1001', bank_name);
  insertAccount.run('acc-p2', 'Google Pay (UPI)', 'gpay_upi', Number(gpay_balance) || 0, 'UPI-PRIMARY', 'Google Pay');

  // Starter income stream
  const insertStream = db.prepare(`
    INSERT INTO income_streams (id, name, type, expected_monthly, actual_received, stability_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertStream.run('is-init', 'Primary Income Source', 'salary', Number(monthly_income_target) || 85000, Number(monthly_income_target) || 85000, 8, 'Initial registered stream');

  // Starter budget categories
  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, category, monthly_limit)
    VALUES (?, ?, ?)
  `);
  insertBudget.run('b-init-1', 'Food & Dining', Math.round((monthly_expense_baseline || 35000) * 0.3));
  insertBudget.run('b-init-2', 'Groceries & Shopping', Math.round((monthly_expense_baseline || 35000) * 0.35));
  insertBudget.run('b-init-3', 'Bills & Utilities', Math.round((monthly_expense_baseline || 35000) * 0.2));

  return getClientById(id);
}

export function updateClientProfile(clientId, data) {
  const { name, email, phone, pin, currency, risk_profile, monthly_income_target, monthly_expense_baseline, notes } = data;
  const current = getClientById(clientId);
  if (!current) throw new Error('Client not found');

  masterDb.prepare(`
    UPDATE clients 
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        pin = COALESCE(?, pin),
        currency = COALESCE(?, currency),
        risk_profile = COALESCE(?, risk_profile),
        monthly_income_target = COALESCE(?, monthly_income_target),
        monthly_expense_baseline = COALESCE(?, monthly_expense_baseline),
        notes = COALESCE(?, notes)
    WHERE id = ?
  `).run(
    name || null,
    email || null,
    phone !== undefined ? phone : null,
    pin || null,
    currency || null,
    risk_profile || null,
    monthly_income_target ? Number(monthly_income_target) : null,
    monthly_expense_baseline ? Number(monthly_expense_baseline) : null,
    notes !== undefined ? notes : null,
    clientId
  );

  return getClientById(clientId);
}

export function createClient({ name, email, currency = 'INR', notes = '' }) {
  return registerNewClientFull({ name, email, currency, notes });
}

export function deleteClient(id) {
  if (clientDbCache.has(id)) {
    clientDbCache.delete(id);
  }
  masterDb.prepare('DELETE FROM clients WHERE id = ?').run(id);
  const clientDbPath = path.join(CLIENTS_DB_DIR, `${id}.sqlite`);
  if (fs.existsSync(clientDbPath)) {
    try {
      fs.unlinkSync(clientDbPath);
    } catch (e) {
      console.error('Error deleting client db file:', e);
    }
  }
  return true;
}

export function getClientDatabasePath(clientId) {
  return path.join(CLIENTS_DB_DIR, `${clientId}.sqlite`);
}
