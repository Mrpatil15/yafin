/**
 * Google Pay and UPI SMS / Receipt Parser & Auto-Categorizer
 */

const CATEGORY_RULES = [
  {
    category: 'Food & Dining',
    patterns: [
      /swiggy/i, /zomato/i, /mcdonald/i, /starbucks/i, /dominos/i, /pizza/i, /burger/i,
      /cafe/i, /coffee/i, /restaurant/i, /diner/i, /chai/i, /bakery/i, /subway/i, /kfc/i,
      /blue tokai/i, /third wave/i, /eats/i
    ]
  },
  {
    category: 'Groceries & Shopping',
    patterns: [
      /blinkit/i, /zepto/i, /instamart/i, /bigbasket/i, /dmart/i, /supermarket/i, /kirana/i,
      /grocery/i, /amazon/i, /flipkart/i, /myntra/i, /ajio/i, /zara/i, /h&m/i, /ikea/i,
      /reliance retail/i, /mart/i
    ]
  },
  {
    category: 'Transportation',
    patterns: [
      /uber/i, /ola/i, /rapido/i, /petrol/i, /fuel/i, /hpcl/i, /bpcl/i, /iocl/i, /shell/i,
      /metro/i, /fastag/i, /toll/i, /railway/i, /irctc/i, /flight/i, /indigo/i, /air india/i
    ]
  },
  {
    category: 'Bills & Utilities',
    patterns: [
      /airtel/i, /jio/i, /vi /i, /broadband/i, /bescom/i, /electricity/i, /power/i,
      /water/i, /gas/i, /igl/i, /recharge/i, /billdesk/i, /rent/i, /society/i, /maintenance/i
    ]
  },
  {
    category: 'Entertainment',
    patterns: [
      /netflix/i, /spotify/i, /prime/i, /hotstar/i, /pvr/i, /inox/i, /bookmyshow/i,
      /youtube/i, /gaming/i, /steam/i, /playstation/i
    ]
  },
  {
    category: 'Healthcare & Wellness',
    patterns: [
      /apollo/i, /pharmeasy/i, /medplus/i, /1mg/i, /pharmacy/i, /hospital/i, /clinic/i,
      /doctor/i, /dental/i, /cult\.fit/i, /gym/i, /fitness/i, /lab/i
    ]
  },
  {
    category: 'Investments & Savings',
    patterns: [
      /zerodha/i, /groww/i, /kuvera/i, /angelone/i, /upstox/i, /mutual fund/i, /sip/i,
      /ppf/i, /nps/i, /gold/i, /fd /i, /fixed deposit/i
    ]
  },
  {
    category: 'Income & Salary',
    patterns: [
      /salary/i, /payroll/i, /stipend/i, /dividend/i, /interest credited/i, /freelance/i,
      /client payout/i, /upwork/i, /fiverr/i
    ]
  }
];

export function autoCategorize(text) {
  for (const rule of CATEGORY_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return rule.category;
      }
    }
  }
  return 'General Expenses';
}

/**
 * Parses raw SMS / GPay notification text
 * Sample inputs:
 * 1. "Paid Rs. 485 to Swiggy using Google Pay. UPI Ref: 425983719283"
 * 2. "Dear UPI user A/C *4829 debited by 1250.00 on 12-09-26 to BLINKIT UPI Ref 426019283746."
 * 3. "Sent Rs. 650.00 to Uber India via Google Pay. UPI transaction ID 426102938475"
 * 4. "You received Rs. 5,000 from Rahul Sharma via Google Pay UPI Ref 994821038472"
 * 5. "A/C XX4829 Credited with Rs. 95,000.00 on 01-Sep-26 by Tech Corp Global."
 */
export function parseGPayText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Input text is required for GPay parser');
  }

  const text = rawText.trim();
  let type = 'expense';
  let amount = null;
  let payee = '';
  let upiRef = '';
  let date = new Date().toISOString().split('T')[0];

  // Determine income vs expense
  const isCredit = /credit|credited|received|deposit|deposited|refund/i.test(text);
  const isDebit = /paid|sent|debited|spent|transferred to/i.test(text);

  if (isCredit && !isDebit) {
    type = 'income';
  } else {
    type = 'expense';
  }

  // Extract Amount: e.g. "Rs. 1,250.00" or "Rs 450" or "INR 500" or "₹ 800"
  const amountMatch = text.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
                      text.match(/(?:debited by|credited with|paid|sent)\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
                      text.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:debited|credited)/i);

  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // Extract UPI Reference / UTR (typically 12 digits or alphanumeric ID)
  const upiRefMatch = text.match(/(?:UPI\s*Ref(?:\s*no\.?)?|Ref\s*no\.?|UTR|transaction ID|Txn\s*ID)[\s:]*([A-Za-z0-9]{6,20})/i);
  if (upiRefMatch && upiRefMatch[1]) {
    upiRef = upiRefMatch[1].trim();
  }

  // Extract Payee / Merchant / Sender
  if (type === 'income') {
    const fromMatch = text.match(/(?:received.*?from|by)\s+([A-Za-z0-9\s&'-]+?)(?:\s+via|\s+on|\s+UPI|\s+Ref|\.|\n|$)/i);
    if (fromMatch && fromMatch[1]) {
      payee = fromMatch[1].trim();
    } else {
      payee = 'Incoming Payment';
    }
  } else {
    const toMatch = text.match(/(?:paid(?:\s+Rs\.?\s*[\d,.]+)?\s+to|sent(?:\s+Rs\.?\s*[\d,.]+)?\s+to|debited.*?to|towards)\s+([A-Za-z0-9\s&'-]+?)(?:\s+using|\s+via|\s+on|\s+UPI|\s+Ref|\.|\n|$)/i);
    if (toMatch && toMatch[1]) {
      payee = toMatch[1].trim();
    } else {
      payee = 'Google Pay Merchant';
    }
  }

  // Clean payee string
  payee = payee.replace(/\s+/g, ' ').trim();
  if (payee.length > 50) {
    payee = payee.substring(0, 50);
  }

  // Determine Category
  const category = autoCategorize(`${payee} ${text}`);

  return {
    rawText: text,
    amount: amount || 0,
    type,
    payee: payee || (type === 'income' ? 'Income Transfer' : 'GPay Payment'),
    category,
    payment_mode: 'gpay',
    upi_ref: upiRef,
    date,
    notes: `Parsed from GPay / UPI alert`
  };
}
