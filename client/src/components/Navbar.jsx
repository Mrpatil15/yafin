import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  ArrowLeftRight, 
  Sparkles, 
  Database, 
  PlusCircle, 
  Smartphone,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

import YafinLogo from './YafinLogo';

export default function Navbar({ 
  currentUser, 
  onLogout,
  onOpenSettings,
  activeTab, 
  setActiveTab, 
  onOpenGPayModal, 
  onOpenAddModal,
  isDark,
  onToggleTheme
}) {
  const currencySymbol = currentUser?.currency === 'USD' ? '$' : '₹';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & YAFIN Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <YafinLogo className="h-10 w-10" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl text-slate-900 tracking-tight">
                  YA<span className="text-emerald-600">FIN</span>
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold hidden sm:inline-flex">
                  Tenant DB
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hidden sm:block">
                Personal Finance & Allocator
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() => setActiveTab('allocator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'allocator'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Smart Allocator</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'clients'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Databases</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Authenticated Client Profile Card */}
            <div 
              onClick={onOpenSettings}
              className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-xl cursor-pointer transition-all group shadow-xs"
              title="Click to view/edit financial profile & settings"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.name?.substring(0, 2).toUpperCase() || 'CL'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 flex items-center space-x-1">
                  <span className="truncate max-w-[110px]">{currentUser?.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentUser?.dbFileName || `${currentUser?.id}.sqlite`}
                </div>
              </div>
              <Settings className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 ml-0.5" />
            </div>

            {/* GPay Quick Log Button */}
            <button
              onClick={onOpenGPayModal}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-600/20 transition-all transform active:scale-95"
              title="Paste or Log GPay / UPI Transaction"
            >
              <Smartphone className="h-4 w-4" />
              <span>GPay</span>
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Quick Add Transaction */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all transform active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add</span>
            </button>

            {/* Lock / Switch Client (Logout) */}
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
              title="Lock Ledger & Switch Client Profile"
            >
              <LogOut className="h-4 w-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
