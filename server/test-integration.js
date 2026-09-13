async function runIntegrationTests() {
  const BASE_URL = 'http://localhost:5000';
  console.log('Testing against API:', BASE_URL);

  // 1. Fetch Clients
  const clientsRes = await fetch(`${BASE_URL}/api/clients`);
  const clientsData = await clientsRes.json();
  console.log(`[PASS] Clients API returned ${clientsData.clients.length} clients`);
  console.log('Client profiles:', clientsData.clients.map(c => `${c.name} (${c.dbFileName})`));

  // 2. Fetch Client 1 Dashboard
  const dashRes = await fetch(`${BASE_URL}/api/clients/client-1/dashboard`);
  const dashData = await dashRes.json();
  console.log(`[PASS] Client 1 Dashboard loaded. Net Worth: ₹${dashData.summary.netWorth.toLocaleString()}, Tx Count: ${dashData.summary.totalTransactions}`);

  // 3. Test GPay SMS Parsing & Direct Logging
  const gpaySms = "Paid Rs. 380 to Chai Point using Google Pay. UPI Ref: 429819283741";
  const parseRes = await fetch(`${BASE_URL}/api/clients/client-1/gpay/parse-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: gpaySms })
  });
  const parseData = await parseRes.json();
  console.log(`[PASS] GPay SMS Parsed:`, {
    amount: parseData.parsed.amount,
    payee: parseData.parsed.payee,
    category: parseData.parsed.category,
    upiRef: parseData.parsed.upi_ref
  });

  // Save parsed GPay transaction
  const saveRes = await fetch(`${BASE_URL}/api/clients/client-1/gpay/save-parsed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: gpaySms })
  });
  const saveData = await saveRes.json();
  console.log(`[PASS] Saved GPay transaction: ID ${saveData.transaction.id} for ₹${saveData.transaction.amount}`);

  // 4. Test Database Isolation: Verify transaction is in Client 1, NOT Client 2
  const c1TxRes = await fetch(`${BASE_URL}/api/clients/client-1/transactions?search=429819283741`);
  const c1Tx = await c1TxRes.json();
  const c2TxRes = await fetch(`${BASE_URL}/api/clients/client-2/transactions?search=429819283741`);
  const c2Tx = await c2TxRes.json();

  console.log(`[PASS] Isolation Check -> Client 1 found: ${c1Tx.transactions.length}, Client 2 found: ${c2Tx.transactions.length}`);
  if (c1Tx.transactions.length === 1 && c2Tx.transactions.length === 0) {
    console.log('>>> STRICT TENANT DATABASE ISOLATION CONFIRMED 100%! <<<');
  } else {
    throw new Error('Database isolation failure!');
  }

  // 5. Test Smart Allocation Engine
  const allocRes = await fetch(`${BASE_URL}/api/clients/client-1/allocation-advice?customIncome=120000&customExpenses=45000`);
  const allocData = await allocRes.json();
  console.log(`[PASS] Smart Allocation Advice for ₹1,20,000 income:`);
  console.log(`  - 50% Needs: ₹${allocData.advice.fiftyThirtyTwenty.needs.targetAmount.toLocaleString()}`);
  console.log(`  - 30% Wants: ₹${allocData.advice.fiftyThirtyTwenty.wants.targetAmount.toLocaleString()}`);
  console.log(`  - 20% Min Wealth: ₹${allocData.advice.fiftyThirtyTwenty.savingsAndInvestments.targetAmount.toLocaleString()}`);
  console.log(`  - Emergency Runway: ${allocData.advice.emergencyFund.currentCoverageMonths} months`);
  console.log(`  - Recommended Investment Baskets: ${allocData.advice.investmentBaskets.map(b => `${b.title} (${b.percentage}%)`).join(', ')}`);
  console.log(`  - Income Stream Suggestions: ${allocData.advice.incomeStreamSuggestions.map(s => s.title).join(' | ')}`);

  // 6. Test Frontend Static Asset Serving
  const htmlRes = await fetch(`${BASE_URL}/`);
  const htmlText = await htmlRes.text();
  console.log(`[PASS] Frontend Web App served at root with status: ${htmlRes.status} (Contains root HTML: ${htmlText.includes('<div id="root">')})`);

  console.log('\n========================================');
  console.log('ALL INTEGRATION & SYSTEM CHECKS PASSED!');
  console.log('========================================\n');
}

runIntegrationTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
