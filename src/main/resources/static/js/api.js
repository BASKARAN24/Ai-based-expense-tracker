/* Small fetch wrapper shared by every page. Stores the JWT in localStorage
   under 'aet_token' and attaches it as a Bearer token on every API call. */

const API_BASE = '/api';

const Auth = {
  getToken() { return localStorage.getItem('aet_token'); },
  getUser() {
    const raw = localStorage.getItem('aet_user');
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem('aet_token', token);
    localStorage.setItem('aet_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('aet_token');
    localStorage.removeItem('aet_user');
  },
  isLoggedIn() { return !!this.getToken(); },
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login.html';
    }
  },
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = '/dashboard.html';
    }
  }
};

async function apiRequest(path, options = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );

  const token = Auth.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE + path, { ...options, headers });

  // Token missing/expired anywhere in the app -> bounce to login
  if (response.status === 401 || response.status === 403) {
    if (path !== '/auth/login' && path !== '/auth/register') {
      Auth.clearSession();
      window.location.href = '/login.html';
      return Promise.reject(new Error('Session expired'));
    }
  }

  let data = null;
  try { data = await response.json(); } catch (e) { /* empty body */ }

  if (!response.ok) {
    const message = (data && data.message) || 'Something went wrong';
    throw new Error(message);
  }
  return data;
}

const Api = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/auth/me'),

  listExpenses: () => apiRequest('/expenses'),
  addExpense: (payload) => apiRequest('/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  updateExpense: (id, payload) => apiRequest(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExpense: (id) => apiRequest(`/expenses/${id}`, { method: 'DELETE' }),
  expenseSummary: () => apiRequest('/expenses/summary'),

  budgetPrediction: () => apiRequest('/budget/prediction'),

  investmentResearch: (topic) => apiRequest(`/investment/research?topic=${encodeURIComponent(topic || '')}`),
};

async function handleLogout() {
  try { await Api.logout(); } catch (e) { /* proceed regardless */ }
  Auth.clearSession();
  window.location.href = '/login.html';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
