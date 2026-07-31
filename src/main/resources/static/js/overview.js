let overviewChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initAppShell();
  loadOverview();
});

async function loadOverview() {
  await Promise.all([loadSummary(), loadRecentActivity()]);
}

async function loadSummary() {
  try {
    const summary = await Api.expenseSummary();
    document.getElementById('stat-total').textContent = '₹' + formatMoney(summary.totalSpent);
    document.getElementById('stat-month').textContent = '₹' + formatMoney(summary.thisMonthSpent);
    document.getElementById('stat-count').textContent = summary.transactionCount;

    const topEntry = Object.entries(summary.byCategory || {}).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('stat-top-category').textContent = topEntry ? categoryMeta(topEntry[0]).label : '—';

    renderChart(summary.byCategory || {});
  } catch (err) {
    showToast(err.message);
  }
}

function renderChart(byCategory) {
  const entries = Object.entries(byCategory).filter(([, amt]) => Number(amt) > 0);
  const labels = entries.map(([k]) => categoryMeta(k).label);
  const colors = entries.map(([k]) => categoryMeta(k).color);
  const data = entries.map(([, v]) => v);

  const canvas = document.getElementById('expense-chart');
  const emptyState = document.getElementById('chart-empty');
  const ctx = canvas.getContext('2d');
  if (overviewChart) overviewChart.destroy();

  if (!data.length) {
    canvas.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  canvas.style.display = 'block';
  emptyState.style.display = 'none';

  overviewChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 11 }, usePointStyle: true } }
      }
    }
  });
}

async function loadRecentActivity() {
  const list = document.getElementById('recent-list');
  const emptyState = document.getElementById('recent-empty');
  try {
    const expenses = await Api.listExpenses();

    if (!expenses.length) {
      list.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    list.innerHTML = expenses.slice(0, 5).map(exp => {
      const meta = categoryMeta(exp.category);
      return `
        <div class="mini-row">
          <div>
            <div class="mini-desc"><span class="category-dot" style="background:${meta.color}"></span>${escapeHtml(exp.description || meta.label)}</div>
            <div class="mini-date">${formatDate(exp.expenseDate)} · ${meta.label}</div>
          </div>
          <div class="mini-amount">₹${formatMoney(exp.amount)}</div>
        </div>`;
    }).join('');
  } catch (err) {
    showToast(err.message);
  }
}
