import React from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PiggyBank, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';

const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

export default function Dashboard({ 
  dashboardData, 
  activeClient, 
  onOpenGPayModal, 
  onOpenAddModal, 
  onOpenAddAccountModal,
  onNavigateToTransactions,
  onNavigateToAllocator 
}) {
  if (!dashboardData) return null;

  const { summary, accounts, categorySpending, recentTransactions, monthlyTrends } = dashboardData;
  const currencySymbol = activeClient?.currency === 'USD' ? '$' : '₹';

  const chartData = monthlyTrends && monthlyTrends.length > 0 ? monthlyTrends : [
    { month: '2026-05', income: 80000, expenses: 38000 },
    { month: '2026-06', income: 85000, expenses: 41000 },
    { month: '2026-07', income: 90000, expenses: 39500 },
    { month: '2026-08', income: 92000, expenses: 42000 },
    { month: '2026-09', income: summary.monthlyIncome, expenses: summary.monthlyExpenses }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Financial Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Client: <strong className="text-slate-800">{activeClient?.name}</strong> • Isolated DB: <code className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">{activeClient?.dbFileName || 'active.sqlite'}</code>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenGPayModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 transition-all"
          >
            <Smartphone className="h-4 w-4" />
            <span>+ GPay / UPI</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards (Bright, High-Contrast) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Net Worth */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Net Worth</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {currencySymbol}{summary.netWorth?.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>Across {accounts.length} accounts</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Monthly Inflow</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {currencySymbol}{summary.monthlyIncome?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Active & side earnings
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Monthly Outflow</span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {currencySymbol}{summary.monthlyExpenses?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Living expenses & bills
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Savings Rate</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600">
            {summary.savingsRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Surplus: {currencySymbol}{summary.netCashflow?.toLocaleString()}</span>
            <span 
              onClick={onNavigateToAllocator} 
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Allocate →
            </span>
          </div>
        </div>

      </div>

      {/* Quick GPay Notification Banner (Bright & Inviting) */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Have a Google Pay / UPI Transaction?</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Instant Auto-Extract
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Paste SMS or push alert from your phone, and our parser will auto-extract Amount, Merchant, and Category.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenGPayModal}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Paste GPay SMS / Log</span>
        </button>
      </div>

      {/* Charts: Cashflow Trend Area Chart & Spending Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cashflow Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cash Flow Trends</h3>
              <p className="text-xs text-slate-500">Monthly Inflow vs Outflow</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700">Income</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-700">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradBright" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradBright" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  formatter={(val) => [`${currencySymbol}${val.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGradBright)" />
                <Area type="monotone" dataKey="expenses" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGradBright)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category Donut */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Spending Breakdown</h3>
            <p className="text-xs text-slate-500 mb-3">Expenses by category this month</p>
          </div>

          {categorySpending && categorySpending.length > 0 ? (
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                    formatter={(val) => [`${currencySymbol}${val.toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No expenses recorded this month
            </div>
          )}

          {/* Mini Category list */}
          <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto pr-1">
            {categorySpending && categorySpending.slice(0, 4).map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  <span className="text-slate-700 font-medium truncate">{cat.category}</span>
                </div>
                <span className="font-bold text-slate-900 ml-2">{currencySymbol}{cat.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Accounts & Wallets Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">Accounts & Wallets</h2>
          </div>
          <button 
            onClick={onOpenAddAccountModal}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {accounts.map((acc) => (
            <div 
              key={acc.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {acc.type === 'gpay_upi' ? 'UPI / GPay' : acc.type}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{acc.name}</h4>
                  <p className="text-[11px] text-slate-500">{acc.bank_name || 'Personal Account'}</p>
                </div>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  acc.type === 'gpay_upi' ? 'bg-blue-50 text-blue-600' :
                  acc.type === 'credit_card' ? 'bg-purple-50 text-purple-600' :
                  acc.type === 'investment' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {acc.type === 'gpay_upi' ? <Smartphone className="h-4 w-4" /> :
                   acc.type === 'credit_card' ? <CreditCard className="h-4 w-4" /> :
                   <Building2 className="h-4 w-4" />}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Balance</span>
                <span className={`text-base font-black ${
                  acc.balance < 0 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {currencySymbol}{acc.balance.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest entries logged in client database</p>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions && recentTransactions.length > 0 ? (
            recentTransactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{tx.payee}</span>
                      {tx.payment_mode === 'gpay' && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">
                          GPay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                  </span>
                  {tx.account_name && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{tx.account_name}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions logged yet. Click "+ Add Entry" or "+ GPay" to get started!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
