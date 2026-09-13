import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive
} from 'lucide-react';
import { createClient } from '../api';

export default function ClientManager({ 
  clients, 
  activeClient, 
  onSelectClient, 
  onClientCreated 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await createClient({ name, email, currency, notes });
      if (res.success) {
        onClientCreated(res.client);
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setNotes('');
      } else {
        setError(res.error || 'Failed to create client');
      }
    } catch (err) {
      setError(err.message || 'Error creating client');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDb = (clientId) => {
    window.open(`/api/clients/${clientId}/export-db`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Strict Physical Database Isolation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Client Profile & Database Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Each client has an independent SQLite database file (`data/clients/{'{id}'}.sqlite`) with complete data isolation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Client Database</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Zero Data Leakage Architecture</h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl font-medium">
              Transactions, account balances, and financial budgets are stored in distinct physical files on disk. Clients cannot see or access other clients' transaction history.
            </p>
          </div>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 shadow-xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Isolated Storage</span>
          <span className="font-mono text-emerald-700 font-bold">{activeClient?.dbFileName || 'active.sqlite'}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((client) => {
          const isActive = client.id === activeClient?.id;

          return (
            <div
              key={client.id}
              className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-md relative overflow-hidden ${
                isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/90'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center space-x-1 shadow-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Active Ledger</span>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-tight">{client.name}</h3>
                    <p className="text-xs text-slate-500">{client.email || 'No email registered'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Database File:</span>
                    <span className="font-mono font-bold text-slate-800">{client.dbFileName || `${client.id}.sqlite`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Physical Size:</span>
                    <span className="font-bold text-emerald-700">{client.dbSizeKb || 16} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Currency:</span>
                    <span className="font-bold text-slate-900">{client.currency || 'INR'}</span>
                  </div>
                </div>

                {client.notes && (
                  <p className="text-xs text-slate-500 italic mb-4">
                    "{client.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectClient(client.id)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                  disabled={isActive}
                >
                  {isActive ? 'Current Active' : 'Switch to Ledger'}
                </button>

                <button
                  onClick={() => handleDownloadDb(client.id)}
                  title="Download .sqlite database file"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl border border-slate-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Database className="h-5 w-5 text-emerald-600" />
              <span>Create Client Database</span>
            </h3>
            <p className="text-xs text-slate-600">
              A dedicated, isolated SQLite database file will be provisioned on disk immediately.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Client / Profile Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe / Consulting Client"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email / Identifier
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Primary freelance client accounts and retainers"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-emerald-600/20"
                >
                  {loading ? 'Creating...' : 'Provision Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
