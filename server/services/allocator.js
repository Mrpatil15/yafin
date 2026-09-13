/**
 * Smart Earnings Allocation Engine & Income Stream Suggester
 */

export function calculateAllocationAdvice({ monthlyIncome, monthlyExpenses = 0, currentSavings = 0, currentStreams = [] }) {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const expenses = Math.max(0, Number(monthlyExpenses) || 0);
  const savings = Math.max(0, Number(currentSavings) || 0);
  const netSurplus = Math.max(0, income - expenses);

  // 50/30/20 Rule Breakdown
  const fiftyThirtyTwenty = {
    needs: {
      percentage: 50,
      targetAmount: Math.round(income * 0.50),
      description: 'Essential Living Expenses (Housing, Groceries, Utilities, Healthcare, Debt EMIs)',
      status: expenses <= (income * 0.50) ? 'Optimal' : 'High Essential Spend'
    },
    wants: {
      percentage: 30,
      targetAmount: Math.round(income * 0.30),
      description: 'Lifestyle & Discretionary (Dining out, Entertainment, Subscriptions, Shopping)',
    },
    savingsAndInvestments: {
      percentage: 20,
      targetAmount: Math.round(income * 0.20),
      description: 'Wealth Building & Future Security (Index Funds, SIP, Emergency Reserve, Gold)',
    }
  };

  // Emergency Fund Analysis
  const emergencyTargetMonths = 6;
  const emergencyTargetAmount = Math.round((expenses > 0 ? expenses : (income * 0.5)) * emergencyTargetMonths);
  const emergencyFundCoverageMonths = expenses > 0 ? (savings / expenses).toFixed(1) : 0;
  const emergencyFundDeficit = Math.max(0, emergencyTargetAmount - savings);

  // Investment Allocation Buckets based on surplus & emergency readiness
  let emergencyAllocPct = 0;
  let debtAllocPct = 0;
  let indexEquityAllocPct = 0;
  let growthEquityAllocPct = 0;

  if (emergencyFundCoverageMonths < 3) {
    // Under-funded emergency: heavily prioritize liquidity
    emergencyAllocPct = 50;
    debtAllocPct = 20;
    indexEquityAllocPct = 25;
    growthEquityAllocPct = 5;
  } else if (emergencyFundCoverageMonths < 6) {
    // Moderate emergency coverage: balanced wealth building
    emergencyAllocPct = 25;
    debtAllocPct = 20;
    indexEquityAllocPct = 40;
    growthEquityAllocPct = 15;
  } else {
    // Robust emergency fund: focus on growth & compounding
    emergencyAllocPct = 10;
    debtAllocPct = 15;
    indexEquityAllocPct = 55;
    growthEquityAllocPct = 20;
  }

  const investableSurplus = netSurplus > 0 ? netSurplus : Math.round(income * 0.20);

  const investmentBaskets = [
    {
      id: 'emergency-reserve',
      title: 'Tier 1: High-Yield Liquid Reserve',
      percentage: emergencyAllocPct,
      amount: Math.round(investableSurplus * (emergencyAllocPct / 100)),
      vehicles: ['Liquid Mutual Funds (Overnight / Ultra-Short)', 'Bank Auto-Sweep Fixed Deposit', 'High-Yield Savings A/C'],
      expectedReturn: '6.5% - 7.5% p.a.',
      risk: 'Very Low / Instant Access',
      rationale: emergencyFundCoverageMonths < 6
        ? `Emergency cushion is at ${emergencyFundCoverageMonths} months. Build up to 6 months (₹${emergencyTargetAmount.toLocaleString()}) before taking heavy market risks.`
        : 'Emergency reserves are solid. Maintain liquidity for unplanned cash needs.'
    },
    {
      id: 'core-equity-index',
      title: 'Tier 2: Core Wealth Equity Index SIP',
      percentage: indexEquityAllocPct,
      amount: Math.round(investableSurplus * (indexEquityAllocPct / 100)),
      vehicles: ['Nifty 50 Index Fund', 'S&P 500 Index ETF', 'Parag Parikh Flexi Cap Fund'],
      expectedReturn: '12.0% - 14.0% p.a. (Historical)',
      risk: 'Moderate - High (Long Term > 5 yrs)',
      rationale: 'The bedrock of wealth creation. Low expense ratios, automatic compounding, and protection against inflation.'
    },
    {
      id: 'capital-preservation-gold',
      title: 'Tier 3: Debt & Sovereign Gold (SGB)',
      percentage: debtAllocPct,
      amount: Math.round(investableSurplus * (debtAllocPct / 100)),
      vehicles: ['Sovereign Gold Bonds (SGB) / Gold ETF', 'Public Provident Fund (PPF / 7.1%)', 'Corporate Bond Funds'],
      expectedReturn: '7.5% - 9.0% p.a. + Gold Upside',
      risk: 'Low - Capital Preservation',
      rationale: 'Hedges equity volatility and currency depreciation. SGB provides 2.5% annual interest plus gold price appreciation.'
    },
    {
      id: 'growth-tactical',
      title: 'Tier 4: Tactical & Satellite Growth',
      percentage: growthEquityAllocPct,
      amount: Math.round(investableSurplus * (growthEquityAllocPct / 100)),
      vehicles: ['Nifty Next 50 / Mid-Cap Fund', 'Individual Blue-chip Quality Stocks', 'Direct Technology & Global ETFs'],
      expectedReturn: '14.0% - 18.0% p.a.',
      risk: 'High (Aggressive)',
      rationale: 'Generates alpha over index benchmarks. Rebalance annually or when target yields are achieved.'
    }
  ];

  // Income Stream Analysis & Suggestions
  const activeStreamsCount = currentStreams.length;
  const isConcentrated = activeStreamsCount <= 1;

  const incomeStreamSuggestions = [
    {
      id: 'stream-dividend',
      title: 'Dividend-Paying Aristocrat Portfolio',
      category: 'Passive Investment Stream',
      difficulty: 'Easy (Passive)',
      projectedYield: '3.5% - 5.5% annual dividend + capital appreciation',
      capitalRequired: 'Low (Start with ₹5,000/mo SIP)',
      actionPlan: 'Invest monthly in dividend-paying powerhouses (e.g., ITC, TCS, Coal India, REITs like Embassy Office Parks) to receive predictable quarterly cash dividends.',
      suitability: 'Ideal for building cashflow without managing a side business.'
    },
    {
      id: 'stream-freelance',
      title: 'Specialized Freelance / Micro-Consulting',
      category: 'Active High-Yield Stream',
      difficulty: 'Moderate (Active)',
      projectedYield: '₹25,000 - ₹1,00,000+ / month extra',
      capitalRequired: 'Zero capital (Time & existing professional skills)',
      actionPlan: 'Package your core job expertise (e.g. software development, finance consulting, marketing, UI design) into weekly 5-10 hour advisory retainers.',
      suitability: 'Fastest way to double your investable surplus within 90 days.'
    },
    {
      id: 'stream-digital-assets',
      title: 'Digital Products & SaaS / Info Products',
      category: 'Scalable Hybrid Stream',
      difficulty: 'Challenging to start, 100% passive once built',
      projectedYield: 'Asymmetric upside (₹10,000 to uncapped/month)',
      capitalRequired: 'Minimal (Domain + Hosting)',
      actionPlan: 'Create reusable tools, Notion templates, specialized financial spreadsheets, or micro-SaaS web apps solving specific niche problems.',
      suitability: 'Unlocks decoupling time from money.'
    },
    {
      id: 'stream-reit',
      title: 'REITs (Real Estate Investment Trusts)',
      category: 'Passive Real Estate Stream',
      difficulty: 'Very Easy',
      projectedYield: '6.5% - 7.8% distributed rental yields',
      capitalRequired: 'Starts from ₹350 per unit',
      actionPlan: 'Buy fractional units of Grade-A IT parks and commercial offices through listed REITs (Embassy, Mindspace, Nexus Malls) to earn regular rental payouts.',
      suitability: 'Real estate rental exposure without the hassle of property management or large down payments.'
    }
  ];

  return {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    monthlyNetSurplus: netSurplus,
    savingsRate: income > 0 ? Math.round((netSurplus / income) * 100) : 0,
    emergencyFund: {
      targetMonths: emergencyTargetMonths,
      targetAmount: emergencyTargetAmount,
      currentCoverageMonths: emergencyFundCoverageMonths,
      deficit: emergencyFundDeficit,
      isFullyFunded: emergencyFundCoverageMonths >= emergencyTargetMonths
    },
    fiftyThirtyTwenty,
    investmentBaskets,
    streamAnalysis: {
      activeStreamsCount,
      riskLevel: isConcentrated ? 'High Concentration (Single Income Dependency)' : 'Diversified',
      advice: isConcentrated
        ? 'You are heavily dependent on a single income source. Establishing a secondary passive or active stream protects against unexpected economic shocks.'
        : 'Good income diversification. Focus on scaling passive dividend and asset yields.'
    },
    incomeStreamSuggestions
  };
}
