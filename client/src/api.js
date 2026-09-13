const API_BASE = '/api';

export async function loginClient(identifier, pin) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, pin })
  });
  return res.json();
}

export async function registerClientFull(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateClientProfile(clientId, data) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function createClient(data) {
  return registerClientFull(data);
}

export async function fetchClients() {
  const res = await fetch(`${API_BASE}/clients`);
  return res.json();
}

export async function fetchDashboard(clientId) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/dashboard`);
  return res.json();
}

export async function fetchTransactions(clientId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/clients/${clientId}/transactions?${query}`);
  return res.json();
}

export async function addTransaction(clientId, data) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteTransaction(clientId, txId) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/transactions/${txId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function parseGPayText(clientId, text) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/gpay/parse-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
}

export async function saveGPayParsed(clientId, text, account_id) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/gpay/save-parsed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, account_id })
  });
  return res.json();
}

export async function importCsvStatement(clientId, file, account_id) {
  const formData = new FormData();
  formData.append('statement', file);
  if (account_id) formData.append('account_id', account_id);

  const res = await fetch(`${API_BASE}/clients/${clientId}/transactions/import-csv`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function fetchAllocationAdvice(clientId, customIncome, customExpenses) {
  let url = `${API_BASE}/clients/${clientId}/allocation-advice`;
  const params = [];
  if (customIncome) params.push(`customIncome=${customIncome}`);
  if (customExpenses) params.push(`customExpenses=${customExpenses}`);
  if (params.length) url += `?${params.join('&')}`;

  const res = await fetch(url);
  return res.json();
}

export async function fetchAccounts(clientId) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/accounts`);
  return res.json();
}

export async function addAccount(clientId, data) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function addIncomeStream(clientId, data) {
  const res = await fetch(`${API_BASE}/clients/${clientId}/income-streams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
