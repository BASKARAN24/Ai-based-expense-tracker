document.addEventListener('DOMContentLoaded', () => {
  initAppShell();
  bindInvestmentPageActions();
});

function bindInvestmentPageActions() {
  document.getElementById('research-form').addEventListener('submit', submitResearch);
  document.querySelectorAll('.topic-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('research-topic').value = chip.dataset.topic;
      submitResearch(null, chip.dataset.topic);
    });
  });
}

async function submitResearch(e, presetTopic) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('research-topic');
  const topic = presetTopic || input.value.trim() || 'general market conditions';
  const resultBox = document.getElementById('research-result');
  const button = document.getElementById('research-submit');

  resultBox.innerHTML = '<div class="skeleton" style="height:70px;"></div>';
  button.disabled = true;

  try {
    const res = await Api.investmentResearch(topic);
    resultBox.innerHTML = `
      <div>${escapeHtml(res.summary)}</div>
      <div class="research-meta">Topic: ${escapeHtml(res.topic)} · Generated ${res.generatedAt} · Source: ${res.source === 'groq-ai' ? 'AI-generated summary' : 'local fallback (no API key configured)'}</div>
    `;
  } catch (err) {
    resultBox.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  } finally {
    button.disabled = false;
  }
}
