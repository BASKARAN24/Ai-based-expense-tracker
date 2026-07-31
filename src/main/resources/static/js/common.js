/* Shared by dashboard.html, expenses.html, budget.html, investment.html */

const CATEGORY_META = {
  FOOD:               { label: 'Food & Dining',   color: '#B45309' },
  TRANSPORT:          { label: 'Transport',       color: '#3B5BDB' },
  RENT:               { label: 'Rent & Housing',  color: '#10172A' },
  UTILITIES:          { label: 'Utilities',       color: '#0E7490' },
  HEALTHCARE:         { label: 'Healthcare',      color: '#C0392B' },
  ENTERTAINMENT:      { label: 'Entertainment',   color: '#7C3AED' },
  SHOPPING:           { label: 'Shopping',        color: '#DB2777' },
  EDUCATION:          { label: 'Education',       color: '#0891B2' },
  SAVINGS_INVESTMENT: { label: 'Savings & Invest',color: '#1F7A5C' },
  OTHER:              { label: 'Other',           color: '#6B7280' },
};

/** Call once per page, after DOMContentLoaded. Guards the page and wires the sidebar. */
function initAppShell() {
  Auth.requireAuth();
  hydrateUserChip();
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

function hydrateUserChip() {
  const user = Auth.getUser();
  if (!user) return;
  const nameEl = document.getElementById('user-name');
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  const greetingEl = document.getElementById('greeting-name');
  if (nameEl) nameEl.textContent = user.fullName;
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.fullName.slice(0, 1).toUpperCase();
  if (greetingEl) greetingEl.textContent = user.fullName.split(' ')[0];
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function categoryMeta(key) {
  return CATEGORY_META[key] || CATEGORY_META.OTHER;
}
