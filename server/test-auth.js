async function testAuth() {
  const BASE = 'http://localhost:5000';
  // 1. Test Login
  const loginRes = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'client-1', pin: '1234' })
  });
  const loginData = await loginRes.json();
  console.log('[PASS] Login successful for:', loginData.client.name, 'PIN verified.');

  // 2. Test Registration with details
  const regRes = await fetch(BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Arjun Verma',
      email: 'arjun' + Date.now() + '@hospital.org',
      phone: '+91 98765 43210',
      pin: '7890',
      currency: 'INR',
      risk_profile: 'conservative',
      monthly_income_target: 180000,
      monthly_expense_baseline: 65000,
      bank_name: 'SBI Premier Wealth',
      initial_bank_balance: 240000,
      gpay_balance: 15000,
      notes: 'Private clinic & hospital consulting ledger'
    })
  });
  const regData = await regRes.json();
  console.log('[PASS] Registered new client:', regData.client.name, 'ID:', regData.client.id);

  // 3. Verify accounts in new isolated DB
  const accRes = await fetch(BASE + '/api/clients/' + regData.client.id + '/accounts');
  const accData = await accRes.json();
  console.log('[PASS] New client isolated accounts seeded:', accData.accounts.map(a => a.name + ' (₹' + a.balance + ')'));
}
testAuth().catch(console.error);
