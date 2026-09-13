# YAFIN - Personal Finance & Multi-Client Ledger

A bright, modern, responsive full-stack Personal Finance application built for **Mobile and PC** with **isolated SQLite databases per client**, a **Smart Earnings Allocation & Income Stream Recommender**, and **Google Pay / UPI transaction integration**.

---

## 🚀 Quick Start

The app is currently running at:
👉 **[http://localhost:5000](http://localhost:5000)**

To run it anytime:

```bash
# In Windows PowerShell:
cd "C:\Users\Yash patil\.gemini\antigravity\scratch\personal-finance-tracker\server"
node index.js
```

Then open `http://localhost:5000` in your web browser or mobile browser on the same network!

---

## ✨ Features

### 1. 🗄️ Physical Database Isolation Per Client
- Every client or financial profile gets their own dedicated SQLite file:
  `server/data/clients/{clientId}.sqlite`
- **Zero data leakage**: Transactions, balances, budgets, and accounts are stored in completely separate database files on disk.
- One-click profile switcher in the header.
- **Offline backup**: Download your client `.sqlite` file anytime directly from the UI.

### 2. 💡 "Where Should I Put My Earnings?" (Smart Allocator)
- **50/30/20 Rule Breakdown**:
  - **Needs (50%)**: Essential living expenses (Rent, groceries, utilities, EMIs).
  - **Wants (30%)**: Lifestyle & discretionary (Dining, entertainment, shopping).
  - **Investments & Wealth (20%+)**: Future financial freedom & compounding.
- **Emergency Fund Runway Meter**:
  - Computes exact months of living expenses covered.
  - Warns if runway is under 6 months and prioritizes high-yield liquid capital.
- **4-Tier Actionable Investment Buckets**:
  - **Tier 1**: High-Yield Liquid Reserve (Liquid Mutual Funds, Auto-sweep FD).
  - **Tier 2**: Core Wealth Equity Index SIP (Nifty 50, S&P 500, Flexicap).
  - **Tier 3**: Capital Preservation & Gold (Sovereign Gold Bonds / SGB, PPF).
  - **Tier 4**: Tactical & Satellite Growth (Next 50, Technology ETFs).

### 3. 🪙 Income Stream Suggester
- Evaluates income concentration risk (warns if 100% dependent on single salary).
- Actionable blueprints with difficulty, projected yield, and step-by-step guides:
  - Dividend-Paying Aristocrat Portfolio (3.5% - 5.5% passive cashflow).
  - Specialized Micro-Consulting / Freelancing (₹25,000 - ₹1,00,000+/mo).
  - Digital Assets & Micro-SaaS (Scalable upside).
  - Commercial Real Estate Fractional REITs (6.5% - 7.8% regular rental yield).

### 4. 📱 Google Pay & UPI Transaction Integration
- **Instant SMS / Push Alert Parser**: Paste any GPay or bank notification text (e.g. *"Paid Rs. 485 to Swiggy using Google Pay. UPI Ref: 425983719283"*). The app instantly extracts:
  - Amount
  - Merchant / Payee
  - Auto-categorized Expense Category
  - UPI Reference (UTR)
  - Date
- **Quick GPay Logger**: Pre-filled quick buttons for popular merchants (Swiggy, Zomato, Blinkit, Uber, Petrol, Amazon).
- **Statement CSV Importer**: Upload bank or Google Pay CSV statements to batch-import transactions with automatic category tagging.

### 5. 📱 Mobile & 💻 PC Responsive Design
- **Mobile**: Bottom navigation bar with touch-friendly cards and elevated "+ GPay" quick button for fast one-handed logging on your phone.
- **Desktop / PC**: Multi-column dashboard with interactive Recharts (Cashflow Trend, Category Donut), multi-filtered transaction ledger, search bar, and CSV export.

---

## 🛠️ Tech Stack

- **Backend**: Node.js 24 (native `node:sqlite` for high performance with zero C++ compilation dependencies), Express.js, Multer, CSV-parse.
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts.
- **Storage**: Master database (`master.db`) + Isolated Tenant databases (`server/data/clients/{id}.sqlite`).
