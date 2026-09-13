import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { parseGPayText, saveGPayParsed, addTransaction } from '../api';

const QUICK_MERCHANTS = [
  { name: 'Swiggy', category: 'Food & Dining', icon: '🍔' },
  { name: 'Zomato', category: 'Food & Dining', icon: '🍕' },
  { name: 'Blinkit', category: 'Groceries & Shopping', icon: '⚡' },
  { name: 'Uber India', category: 'Transportation', icon: '🚗' },
  { name: 'Petrol / Fuel', category: 'Transportation', icon: '⛽' },
  { name: 'Blue Tokai Cafe', category: 'Food & Dining', icon: '☕' },
  { name: 'Amazon India', category: 'Groceries & Shopping', icon: '📦' }
];

const SAMPLE_TEXTS = [
  "Paid Rs. 485 to Swiggy using Google Pay. UPI Ref: 425983719283",
  "Sent Rs. 650.00 to Uber India via Google Pay. UPI transaction ID 426102938475",
  "You received Rs. 25,000 from Acme Client via Google Pay UPI Ref 994821038472",
  "Dear UPI user A/C *4829 debited by 1250.00 on 12-09-26 to BLINKIT UPI Ref 426019283746."
];

export default function GPayModal({ isOpen, onClose, clientId, accounts, onTransactionAdded }) {
  const [activeMode, setActiveMode] = useState('paste'); // 'paste' | 'manual'
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Manual Form State
  const [manualAmount, setManualAmount] = useState('');
  const [manualPayee, setManualPayee] = useState('');
  const [manualCategory, setManualCategory] = useState('Food & Dining');
  const [manualType, setManualType] = useState('expense');
  const [manualUpiRef, setManualUpiRef] = useState('');

  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccountId) {
      const gpayAcc = accounts.find(a => a.type === 'gpay_upi') || accounts[0];
      setSelectedAccountId(gpayAcc.id);
    }
  }, [accounts]);

  useEffect(() => {
    if (activeMode === 'paste' && rawText.trim().length > 10) {
      const timer = setTimeout(async () => {
        try {
          const res = await parseGPayText(clientId, rawText);
          if (res.success) {
            setParsedData(res.parsed);
            setErrorMessage('');
          }
        } catch (err) {
          // typing
        }
      }, 250);
      return () => clearTimeout(timer);
    } else if (rawText.trim().length === 0) {
      setParsedData(null);
    }
  }, [rawText, clientId, activeMode]);

  if (!isOpen) return null;

  const handleSaveParsed = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await saveGPayParsed(clientId, rawText, selectedAccountId);
      if (res.success) {
        setSuccessMessage(`Logged ₹${res.parsed.amount} for ${res.parsed.payee}!`);
        onTransactionAdded();
        setTimeout(() => {
          setSuccessMessage('');
          setRawText('');
          setParsedData(null);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Failed to save GPay transaction');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualAmount || !manualPayee) {
      setErrorMessage('Amount and Payee are required');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const payload = {
        amount: parseFloat(manualAmount),
        type: manualType,
        category: manualCategory,
        payee: manualPayee,
        payment_mode: 'gpay',
        account_id: selectedAccountId,
        upi_ref: manualUpiRef || `UPI-${Date.now().toString().slice(-8)}`,
        notes: 'Logged via GPay Quick Entry'
      };
      const res = await addTransaction(clientId, payload);
      if (res.success) {
        setSuccessMessage(`Logged ₹${manualAmount} to ${manualPayee}!`);
        onTransactionAdded();
        setTimeout(() => {
          setSuccessMessage('');
          setManualAmount('');
          setManualPayee('');
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Failed to save transaction');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                <span>Google Pay / UPI Integration</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase">
                  Auto-Sync
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Paste SMS alert or quick log a payment</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-sm font-bold bg-slate-50">
          <button
            onClick={() => setActiveMode('paste')}
            className={`py-3 text-center transition-all flex items-center justify-center space-x-2 border-b-2 ${
              activeMode === 'paste'
                ? 'text-blue-700 border-blue-600 bg-white'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Paste SMS Alert</span>
          </button>
          <button
            onClick={() => setActiveMode('manual')}
            className={`py-3 text-center transition-all flex items-center justify-center space-x-2 border-b-2 ${
              activeMode === 'manual'
                ? 'text-blue-700 border-blue-600 bg-white'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>Quick GPay Log</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Account Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Target Account / Wallet
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type}) - Balance: ₹{a.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-center space-x-2 font-bold animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-center space-x-2 font-medium">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeMode === 'paste' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Paste Google Pay / UPI SMS Text
                  </label>
                  <span className="text-[11px] text-blue-700 font-bold flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-Extracts Amount & Category</span>
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="e.g. Paid Rs. 485 to Swiggy using Google Pay. UPI Ref: 425983719283"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Sample Quick Chips */}
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium">Or test with one of these samples:</p>
                <div className="flex flex-col space-y-1.5">
                  {SAMPLE_TEXTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawText(sample)}
                      className="text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg p-2.5 transition-colors truncate font-medium"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Extracted Preview */}
              {parsedData && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Extracted Transaction Details
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      parsedData.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {parsedData.type === 'income' ? 'Received (Income)' : 'Debited (Expense)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Amount:</span>
                      <p className="text-base font-black text-slate-900">₹{parsedData.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Payee / Merchant:</span>
                      <p className="font-bold text-slate-800 truncate">{parsedData.payee}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Category:</span>
                      <p className="font-bold text-emerald-700">{parsedData.category}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">UPI Ref (UTR):</span>
                      <p className="font-mono text-slate-700 truncate">{parsedData.upi_ref || 'Auto-generated'}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveParsed}
                disabled={loading || !rawText.trim() || !parsedData}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? (
                  <span>Saving to Client Database...</span>
                ) : (
                  <>
                    <span>Confirm & Add GPay Transaction</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Quick Pick Merchant
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_MERCHANTS.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => {
                        setManualPayee(m.name);
                        setManualCategory(m.category);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold flex items-center space-x-1.5 ${
                        manualPayee === m.name
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expense">Paid (Expense)</option>
                    <option value="income">Received (Income)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payee / Merchant Name</label>
                <input
                  type="text"
                  required
                  value={manualPayee}
                  onChange={(e) => setManualPayee(e.target.value)}
                  placeholder="e.g. Zomato / Blue Tokai"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries & Shopping">Groceries & Shopping</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare & Wellness">Healthcare</option>
                    <option value="Investments & Savings">Investments</option>
                    <option value="Income & Salary">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI Ref (Optional)</label>
                  <input
                    type="text"
                    value={manualUpiRef}
                    onChange={(e) => setManualUpiRef(e.target.value)}
                    placeholder="e.g. 425983719283"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all mt-4"
              >
                {loading ? <span>Logging Transaction...</span> : <span>Save to Ledger</span>}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
