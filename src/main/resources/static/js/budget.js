document.addEventListener('DOMContentLoaded', () => {
  initAppShell();
  loadBudgetPrediction();
});

async function loadBudgetPrediction() {
  const panel = document.getElementById('budget-panel-body');
  panel.innerHTML = `
    <div class="skeleton" style="height:36px; width:220px; margin-bottom:14px;"></div>
    <div class="skeleton" style="height:60px; margin-bottom:14px;"></div>
    <div class="skeleton" style="height:120px;"></div>
  `;

  try {
    const prediction = await Api.budgetPrediction();

    if (!prediction.hasData) {
      panel.innerHTML = `<div class="empty-state">${escapeHtml(prediction.message)}</div>`;
      return;
    }

    const rows = Object.entries(prediction.predictedByCategory || {})
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => {
        const meta = categoryMeta(cat);
        return `<div class="category-row">
                  <span><span class="category-dot" style="background:${meta.color}"></span>${meta.label}</span>
                  <span class="amount">₹${formatMoney(amt)}</span>
                </div>`;
      }).join('');

    panel.innerHTML = `
      <div class="card-eyebrow">Predicted next month</div>
      <div class="predicted-total">₹${formatMoney(prediction.predictedNextMonthTotal)}</div>
      <p class="insight-text">${escapeHtml(prediction.insight)}</p>
      <div class="stub-divider"></div>
      <div class="card-eyebrow" style="margin-bottom:6px;">By category</div>
      <div class="category-breakdown">${rows}</div>
    `;
  } catch (err) {
    panel.innerHTML = `<div class="empty-state">Couldn't load your prediction right now.</div>`;
  }
}
