import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  Coins, 
  Check, 
  RefreshCw
} from 'lucide-react';
import { fetchAllocationAdvice } from '../api';

export default function SmartAllocator({ clientId, currency = 'INR', actualIncome = 95000, actualExpenses = 39000 }) {
  const [customIncome, setCustomIncome] = useState(actualIncome);
  const [customExpenses, setCustomExpenses] = useState(actualExpenses);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);

  const currencySymbol = currency === 'USD' ? '$' : '₹';

  const loadAdvice = async (inc, exp) => {
    setLoading(true);
    try {
      const res = await fetchAllocationAdvice(clientId, inc, exp);
      if (res.success) {
        setAdvice(res.advice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvice(customIncome, customExpenses);
  }, [clientId]);

  const handleSyncActuals = () => {
    setCustomIncome(actualIncome);
    setCustomExpenses(actualExpenses);
    loadAdvice(actualIncome, actualExpenses);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    loadAdvice(customIncome, customExpenses);
  };

  if (!advice) {
    return (
      <div className="p-8 text-center text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-emerald-600" />
        <p>Analyzing earnings and generating smart allocation model...</p>
      </div>
    );
  }

  const { fiftyThirtyTwenty, investmentBaskets, emergencyFund, streamAnalysis, incomeStreamSuggestions } = advice;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Hero Banner (Bright & Uplifting) */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border border-emerald-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-2.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Financial Allocation & Income Stream Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Where Should I Put My Earnings?
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
              Data-backed financial distribution across <span className="text-emerald-700 font-bold">50/30/20 life buckets</span>, <span className="text-emerald-700 font-bold">liquid emergency safety</span>, and <span className="text-emerald-700 font-bold">compounding investment streams</span>.
            </p>
          </div>

          <button
            onClick={handleSyncActuals}
            className="self-start md:self-auto flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
          >
            <RefreshCw className="h-4 w-4 text-emerald-600" />
            <span>Sync Month Actuals</span>
          </button>
        </div>
      </div>

      {/* Simulator / Earnings Adjuster */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleApplyCustom} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monthly Inflow / Earnings ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={customIncome}
              onChange={(e) => setCustomIncome(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monthly Living Expenses ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={customExpenses}
              onChange={(e) => setCustomExpenses(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center space-x-1.5"
            >
              <span>Recalculate Strategy</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Metric Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Total Inflow:</span>
            <p className="text-sm font-black text-slate-900">{currencySymbol}{advice.monthlyIncome.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Living Expenses:</span>
            <p className="text-sm font-black text-rose-600">{currencySymbol}{advice.monthlyExpenses.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Monthly Net Surplus:</span>
            <p className="text-sm font-black text-emerald-600">{currencySymbol}{advice.monthlyNetSurplus.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Savings Potential:</span>
            <p className="text-sm font-black text-blue-600">{advice.savingsRate}% of Income</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: 50/30/20 Rule Allocation Framework */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <PieIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900">1. The 50/30/20 Baseline Allocation Framework</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Needs (50%) */}
          <div className="bg-blue-50/60 border border-blue-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-800">Needs (50%)</span>
                <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Essentials</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {currencySymbol}{fiftyThirtyTwenty.needs.targetAmount.toLocaleString()}
                <span className="text-xs font-semibold text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-4 font-medium">
                {fiftyThirtyTwenty.needs.description}
              </p>
            </div>
            <div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <div className="text-[11px] text-blue-800 font-medium flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5 text-blue-600" />
                <span>Rent, Food, EMIs, Bills, Healthcare</span>
              </div>
            </div>
          </div>

          {/* Wants (30%) */}
          <div className="bg-purple-50/60 border border-purple-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-800">Wants (30%)</span>
                <span className="text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Lifestyle</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {currencySymbol}{fiftyThirtyTwenty.wants.targetAmount.toLocaleString()}
                <span className="text-xs font-semibold text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-4 font-medium">
                {fiftyThirtyTwenty.wants.description}
              </p>
            </div>
            <div>
              <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden mb-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="text-[11px] text-purple-800 font-medium flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5 text-purple-600" />
                <span>Dining out, Weekend trips, Gadgets</span>
              </div>
            </div>
          </div>

          {/* Savings & Investments (20%+) */}
          <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Wealth (20%+)</span>
                <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Future Capital</span>
              </div>
              <div className="text-2xl font-black text-emerald-900 mb-1">
                {currencySymbol}{fiftyThirtyTwenty.savingsAndInvestments.targetAmount.toLocaleString()}
                <span className="text-xs font-semibold text-emerald-700"> / month min</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-4 font-medium">
                {fiftyThirtyTwenty.savingsAndInvestments.description}
              </p>
            </div>
            <div>
              <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden mb-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <div className="text-[11px] text-emerald-800 font-bold flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Direct allocation buckets below</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Emergency Fund Health Meter */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
            emergencyFund.isFullyFunded ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-base">Emergency Safety Cushion</h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                emergencyFund.currentCoverageMonths >= 6 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {emergencyFund.currentCoverageMonths} Months Runway
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: 6 months living burn ({currencySymbol}{emergencyFund.targetAmount.toLocaleString()}) in instant liquid cash or sweep-in FD.
            </p>
          </div>
        </div>

        <div className="w-full md:w-48 text-right flex-shrink-0">
          <div className="text-xs text-slate-500 mb-1">
            {emergencyFund.deficit > 0 ? (
              <span className="text-amber-700 font-bold">Deficit: {currencySymbol}{emergencyFund.deficit.toLocaleString()}</span>
            ) : (
              <span className="text-emerald-700 font-bold">Fully Funded!</span>
            )}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${emergencyFund.isFullyFunded ? 'bg-emerald-600' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, (emergencyFund.currentCoverageMonths / 6) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 4-Tier Smart Investment Allocation Baskets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-900">2. Actionable Monthly Investment Buckets</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Allocates surplus of {currencySymbol}{advice.monthlyNetSurplus.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investmentBaskets.map((basket) => (
            <div 
              key={basket.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    {basket.title}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    {basket.percentage}% Share
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-black text-slate-900">
                    {currencySymbol}{basket.amount.toLocaleString()}
                    <span className="text-xs font-semibold text-slate-500"> / month</span>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    Return: {basket.expectedReturn}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                  {basket.rationale}
                </p>

                {/* Specific Recommended Instruments */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Recommended Vehicles:
                  </span>
                  <div className="space-y-1.5">
                    {basket.vehicles.map((v, i) => (
                      <div key={i} className="flex items-center text-xs text-slate-800 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2"></span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Risk: <strong className="text-slate-800">{basket.risk}</strong></span>
                <span className="text-emerald-700 font-bold">SIP Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Income Stream Suggester */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Coins className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-black text-slate-900">3. Income Stream Suggestions & Diversification</h2>
        </div>

        {/* Alert */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-4 flex items-start space-x-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900 text-sm">Income Assessment: {streamAnalysis.riskLevel}</h4>
            <p className="text-slate-700 mt-1 font-medium">{streamAnalysis.advice}</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomeStreamSuggestions.map((stream) => (
            <div 
              key={stream.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    {stream.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    Difficulty: <strong className="text-slate-800">{stream.difficulty}</strong>
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1">{stream.title}</h3>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 my-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Projected Yield:</span>
                    <span className="font-bold text-emerald-700">{stream.projectedYield}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capital Needed:</span>
                    <span className="font-semibold text-slate-800">{stream.capitalRequired}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <p className="leading-relaxed"><strong className="text-slate-800">Action:</strong> {stream.actionPlan}</p>
                  <p className="text-slate-500 italic">Target: {stream.suitability}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Status: <strong className="text-emerald-700">Recommended</strong></span>
                <span className="inline-flex items-center text-blue-600 font-bold hover:underline cursor-pointer">
                  <span>Explore Blueprint</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
