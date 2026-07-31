let allExpenses = [];
let editingExpenseId = null;

document.addEventListener('DOMContentLoaded', () => {
  initAppShell();
  populateCategorySelect();
  bindExpensePageActions();
  loadExpenses();
});

function populateCategorySelect() {
  const select = document.getElementById('expense-category');
  select.innerHTML = Object.entries(CATEGORY_META)
    .map(([key, meta]) => `<option value="${key}">${meta.label}</option>`)
    .join('');
}

function bindExpensePageActions() {
  document.getElementById('add-expense-btn').addEventListener('click', () => openExpenseModal());
  document.getElementById('modal-cancel').addEventListener('click', closeExpenseModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeExpenseModal();
  });
  document.getElementById('expense-form').addEventListener('submit', submitExpenseForm);
}

async function loadExpenses() {
  try {
    allExpenses = await Api.listExpenses();
    renderLedger(allExpenses);
  } catch (err) {
    showToast(err.message);
  }
}

function renderLedger(expenses) {
  const tbody = document.getElementById('ledger-body');
  const emptyState = document.getElementById('ledger-empty');

  if (!expenses.length) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  tbody.innerHTML = expenses.map(exp => {
    const meta = categoryMeta(exp.category);
    return `
      <tr>
        <td>${formatDate(exp.expenseDate)}</td>
        <td>${escapeHtml(exp.description || '—')}</td>
        <td><span class="category-pill"><span class="category-dot" style="background:${meta.color}"></span>${meta.label}</span></td>
        <td class="amount-cell">₹${formatMoney(exp.amount)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Edit" onclick="openExpenseModal(${exp.id})">Edit</button>
            <button class="icon-btn" title="Delete" onclick="confirmDeleteExpense(${exp.id})">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openExpenseModal(id) {
  editingExpenseId = id || null;
  const form = document.getElementById('expense-form');
  form.reset();

  document.getElementById('modal-title').textContent = id ? 'Edit expense' : 'Add expense';
  document.getElementById('expense-date').value = new Date().toISOString().slice(0, 10);

  if (id) {
    const exp = allExpenses.find(e => e.id === id);
    if (exp) {
      document.getElementById('expense-amount').value = exp.amount;
      document.getElementById('expense-category').value = exp.category;
      document.getElementById('expense-description').value = exp.description || '';
      document.getElementById('expense-date').value = exp.expenseDate;
    }
  }
  document.getElementById('modal-overlay').classList.add('show');
}

function closeExpenseModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  editingExpenseId = null;
}

async function submitExpenseForm(e) {
  e.preventDefault();
  const payload = {
    amount: Number(document.getElementById('expense-amount').value),
    category: document.getElementById('expense-category').value,
    description: document.getElementById('expense-description').value.trim(),
    expenseDate: document.getElementById('expense-date').value,
  };

  try {
    if (editingExpenseId) {
      await Api.updateExpense(editingExpenseId, payload);
      showToast('Expense updated');
    } else {
      await Api.addExpense(payload);
      showToast('Expense added');
    }
    closeExpenseModal();
    await loadExpenses();
  } catch (err) {
    showToast(err.message);
  }
}

async function confirmDeleteExpense(id) {
  if (!window.confirm('Delete this expense? This cannot be undone.')) return;
  try {
    await Api.deleteExpense(id);
    showToast('Expense deleted');
    await loadExpenses();
  } catch (err) {
    showToast(err.message);
  }
}
