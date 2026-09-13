import React from 'react';
import { 
  Layers, 
  ArrowLeftRight, 
  Sparkles, 
  Database, 
  Plus
} from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenGPayModal }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-md">
      <div className="flex items-center justify-around relative">
        
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">Dashboard</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'transactions' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowLeftRight className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">History</span>
        </button>

        {/* Center Floating GPay Action */}
        <div className="relative -top-4">
          <button
            onClick={onOpenGPayModal}
            className="h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transform active:scale-90 border-2 border-white"
            aria-label="Add GPay Transaction"
          >
            <Plus className="h-6 w-6 stroke-[2.8]" />
          </button>
        </div>

        {/* Allocator */}
        <button
          onClick={() => setActiveTab('allocator')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'allocator' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">Allocator</span>
        </button>

        {/* Databases / Clients */}
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'clients' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-bold">Clients</span>
        </button>

      </div>
    </div>
  );
}
