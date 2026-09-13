import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { updateClientProfile } from '../api';

export default function ProfileSettingsModal({ isOpen, onClose, client, onProfileUpdated }) {
  if (!isOpen || !client) return null;

  const [name, setName] = useState(client.name || '');
  const [email, setEmail] = useState(client.email || '');
  const [phone, setPhone] = useState(client.phone || '');
  const [pin, setPin] = useState(client.pin || '1234');
  const [currency, setCurrency] = useState(client.currency || 'INR');
  const [riskProfile, setRiskProfile] = useState(client.risk_profile || 'balanced');
  const [monthlyIncome, setMonthlyIncome] = useState(client.monthly_income_target || 95000);
  const [monthlyExpense, setMonthlyExpense] = useState(client.monthly_expense_baseline || 38000);
  const [notes, setNotes] = useState(client.notes || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateClientProfile(client.id, {
        name,
        email,
        phone,
        pin,
        currency,
        risk_profile: riskProfile,
        monthly_income_target: parseFloat(monthlyIncome),
        monthly_expense_baseline: parseFloat(monthlyExpense),
        notes
      });
      if (res.success) {
        setSuccess('Profile details successfully updated!');
        onProfileUpdated(res.client);
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open(`/api/clients/${client.id}/export-db`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Client Profile & Settings
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Database: {client.dbFileName || `${client.id}.sqlite`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2 font-bold">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Security PIN (4 Digits)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Financial Baseline (For Smart Allocator)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Monthly Earnings Inflow</label>
                  <input
                    type="number"
                    step="1000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Monthly Living Expenses</label>
                  <input
                    type="number"
                    step="1000"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Investment Risk Appetite</label>
                <select
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                >
                  <option value="conservative">Conservative (Debt & Gold preservation)</option>
                  <option value="balanced">Balanced (50/30/20 & Core Index Funds)</option>
                  <option value="aggressive">Aggressive (High Equity & Tactical Growth)</option>
                </select>
              </div>
            </div>

            {/* Offline DB Backup */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-blue-600" />
                  <span>Download Private Database</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Offline .sqlite file for 100% data ownership</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm shadow-emerald-600/20"
              >
                {loading ? 'Saving...' : 'Update Details'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
