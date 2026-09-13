import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Smartphone, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X
} from 'lucide-react';
import { fetchTransactions, deleteTransaction, importCsvStatement } from '../api';

export default function TransactionsLedger({ 
  clientId, 
  currency = 'INR', 
  accounts = [], 
  onOpenAddModal, 
  onOpenGPayModal, 
  onTransactionsUpdated 
}) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(false);

  // CSV Import State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvAccountId, setCsvAccountId] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvStatusMessage, setCsvStatusMessage] = useState('');

  const currencySymbol = currency === 'USD' ? '$' : '₹';

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedPaymentMode !== 'All') params.payment_mode = selectedPaymentMode;
      if (selectedType !== 'All') params.type = selectedType;

      const res = await fetchTransactions(clientId, params);
      if (res.success) {
        setTransactions(res.transactions);
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [clientId, selectedCategory, selectedPaymentMode, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTransactions();
  };

  const handleDelete = async (txId) => {
    if (!window.confirm('Delete this transaction? The account balance will be restored.')) return;
    try {
      const res = await deleteTransaction(clientId, txId);
      if (res.success) {
        loadTransactions();
        onTransactionsUpdated();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCsvImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setCsvUploading(true);
    setCsvStatusMessage('');
    try {
      const res = await importCsvStatement(clientId, csvFile, csvAccountId);
      if (res.success) {
        setCsvStatusMessage(`Success! ${res.importedCount} transactions imported.`);
        loadTransactions();
        onTransactionsUpdated();
        setTimeout(() => {
          setIsCsvModalOpen(false);
          setCsvFile(null);
          setCsvStatusMessage('');
        }, 1500);
      } else {
        setCsvStatusMessage(`Error: ${res.error}`);
      }
    } catch (err) {
      setCsvStatusMessage(`Upload failed: ${err.message}`);
    } finally {
      setCsvUploading(false);
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Payee', 'Type', 'Category', 'Amount', 'Payment Mode', 'UPI Ref', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${t.payee.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount,
      t.payment_mode,
      `"${t.upi_ref || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_${clientId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Full history stored securely in this client's isolated SQLite database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenGPayModal}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 transition-all"
          >
            <Smartphone className="h-4 w-4" />
            <span>+ GPay / UPI</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Payee, Notes, UPI Reference..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={selectedPaymentMode}
              onChange={(e) => setSelectedPaymentMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All Modes</option>
              <option value="gpay">Google Pay / UPI</option>
              <option value="card">Card / Credit</option>
              <option value="netbanking">Net Banking / NEFT</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="All">All (In & Out)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-600">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payee & Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono">{tx.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{tx.payee}</div>
                      {tx.upi_ref && (
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {tx.upi_ref}</div>
                      )}
                      {tx.notes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{tx.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.payment_mode === 'gpay' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : tx.payment_mode === 'card'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.payment_mode === 'gpay' ? 'GPay UPI' : tx.payment_mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{tx.account_name || '—'}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`text-sm font-black ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">{tx.payee}</h4>
                      {tx.payment_mode === 'gpay' && (
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-1 rounded font-bold border border-blue-200">GPay</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`text-sm font-black ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">{tx.account_name || ''}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions found.
            </div>
          )}
        </div>

      </div>

      {/* CSV Modal (Bright) */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Upload className="h-5 w-5 text-emerald-600" />
                <span>Import Statement (CSV)</span>
              </h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Upload your Bank statement or Google Pay CSV export. Our smart categorizer will automatically tag each transaction.
            </p>

            <form onSubmit={handleCsvImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Account
                </label>
                <select
                  value={csvAccountId}
                  onChange={(e) => setCsvAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Auto-assign / Unassigned</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {csvStatusMessage && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                  {csvStatusMessage}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={csvUploading || !csvFile}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-emerald-600/20"
                >
                  {csvUploading ? 'Importing...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
