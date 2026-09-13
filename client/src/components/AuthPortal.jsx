import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { loginClient, registerClientFull } from '../api';

import YafinLogo from './YafinLogo';

export default function AuthPortal({ clients = [], onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [customIdentifier, setCustomIdentifier] = useState('');
  const [pin, setPin] = useState('1234');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Registration State
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('1234');
  const [regCurrency, setRegCurrency] = useState('INR');
  const [regRiskProfile, setRegRiskProfile] = useState('balanced');
  const [regMonthlyIncome, setRegMonthlyIncome] = useState('95000');
  const [regMonthlyExpense, setRegMonthlyExpense] = useState('38000');
  const [regBankName, setRegBankName] = useState('HDFC Bank');
  const [regBankBalance, setRegBankBalance] = useState('75000');
  const [regGpayBalance, setRegGpayBalance] = useState('10000');
  const [regNotes, setRegNotes] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const identifier = customIdentifier.trim() || selectedClientId || (clients[0]?.id);
      const res = await loginClient(identifier, pin);
      if (res.success && res.client) {
        onAuthenticated(res.client);
      } else {
        setLoginError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setLoginError(err.message || 'Error authenticating client');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickDemoLogin = (client) => {
    setSelectedClientId(client.id);
    setCustomIdentifier('');
    setPin(client.pin || '1234');
    loginClient(client.id, client.pin || '1234').then(res => {
      if (res.success) onAuthenticated(res.client);
    }).catch(err => setLoginError(err.message));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Client full name is required');
      return;
    }
    if (regPin.length < 4) {
      setRegError('4-digit PIN is required');
      return;
    }

    setRegLoading(true);
    setRegError('');
    try {
      const payload = {
        name: regName,
        email: regEmail,
        phone: regPhone,
        pin: regPin,
        currency: regCurrency,
        risk_profile: regRiskProfile,
        monthly_income_target: parseFloat(regMonthlyIncome) || 85000,
        monthly_expense_baseline: parseFloat(regMonthlyExpense) || 35000,
        bank_name: regBankName || 'Primary Bank',
        initial_bank_balance: parseFloat(regBankBalance) || 0,
        gpay_balance: parseFloat(regGpayBalance) || 0,
        notes: regNotes
      };

      const res = await registerClientFull(payload);
      if (res.success && res.client) {
        onAuthenticated(res.client);
      } else {
        setRegError(res.error || 'Registration failed');
      }
    } catch (err) {
      setRegError(err.message || 'Error setting up client ledger');
    } finally {
      setRegLoading(false);
    }
  };

  const currencySymbol = regCurrency === 'USD' ? '$' : '₹';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-emerald-50/30 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 relative overflow-hidden">
      
      {/* Top Daylight Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-emerald-100/40 via-blue-100/30 to-transparent blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-lg">
        
        {/* YAFIN Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <YafinLogo className="h-16 w-16 mb-2.5" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            YA<span className="text-emerald-600">FIN</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
            Multi-Client Personal Finance & Isolated Ledger System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative">
          
          {/* Top Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Client Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setRegError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>New Client Setup</span>
            </button>
          </div>

          {/* SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Client Profile
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setCustomIdentifier('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.dbFileName || `${c.id}.sqlite`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Or Email Address
                </label>
                <input
                  type="text"
                  value={customIdentifier}
                  onChange={(e) => setCustomIdentifier(e.target.value)}
                  placeholder="e.g. yash@personal.app"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    4-Digit Security PIN
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Default: 1234</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-center text-lg tracking-[0.4em] font-mono text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all mt-2"
              >
                {loginLoading ? (
                  <span>Accessing Isolated Ledger...</span>
                ) : (
                  <>
                    <span>Sign In to Ledger</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Quick 1-Click Access Tags */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  Quick 1-Click Demo Profiles
                </span>
                <div className="flex flex-col gap-2">
                  {clients.slice(0, 3).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(c)}
                      className="text-left bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 p-2.5 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          {c.name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.currency || 'INR'} • PIN: {c.pin || '1234'}</div>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-700 font-bold">Open →</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* NEW CLIENT ONBOARDING */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Wizard Steps */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  className={`flex items-center space-x-1.5 ${regStep === 1 ? 'text-emerald-700' : ''}`}
                >
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-xs flex items-center justify-center">1</span>
                  <span>Personal & Security</span>
                </button>
                <span>→</span>
                <button
                  type="button"
                  onClick={() => setRegStep(2)}
                  className={`flex items-center space-x-1.5 ${regStep === 2 ? 'text-emerald-700' : ''}`}
                >
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-xs flex items-center justify-center">2</span>
                  <span>Financial Details</span>
                </button>
              </div>

              {/* Step 1 */}
              {regStep === 1 ? (
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="client@work.com"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Set 4-Digit Security PIN *
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">Used to unlock ledger</span>
                    </div>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      placeholder="4-digit PIN"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!regName) setRegError('Please enter your full name');
                      else { setRegError(''); setRegStep(2); }
                    }}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 mt-2 shadow-xs"
                  >
                    <span>Proceed to Financial Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Step 2 */
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Monthly Inflow
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={regMonthlyIncome}
                        onChange={(e) => setRegMonthlyIncome(e.target.value)}
                        placeholder="e.g. 95000"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Monthly Living Burn
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={regMonthlyExpense}
                        onChange={(e) => setRegMonthlyExpense(e.target.value)}
                        placeholder="e.g. 38000"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Currency
                      </label>
                      <select
                        value={regCurrency}
                        onChange={(e) => setRegCurrency(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="INR">INR (₹) Indian Rupee</option>
                        <option value="USD">USD ($) US Dollar</option>
                        <option value="EUR">EUR (€) Euro</option>
                        <option value="GBP">GBP (£) British Pound</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Risk Appetite
                      </label>
                      <select
                        value={regRiskProfile}
                        onChange={(e) => setRegRiskProfile(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="balanced">Balanced (50/30/20 & Index)</option>
                        <option value="conservative">Conservative (Capital Shield)</option>
                        <option value="aggressive">Aggressive (Maximum Growth)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Initial Bank & GPay Setup
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Bank Name:</span>
                        <input
                          type="text"
                          value={regBankName}
                          onChange={(e) => setRegBankName(e.target.value)}
                          placeholder="e.g. HDFC / SBI"
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500">Opening Balance ({currencySymbol}):</span>
                        <input
                          type="number"
                          value={regBankBalance}
                          onChange={(e) => setRegBankBalance(e.target.value)}
                          placeholder="50000"
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center space-x-1.5"
                    >
                      {regLoading ? <span>Provisioning Database...</span> : <span>Complete Setup & Launch</span>}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

        </div>

        {/* Security Badge */}
        <div className="mt-5 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Each client ledger is isolated in a private SQLite database</span>
        </div>

      </div>

    </div>
  );
}
