/* ═══════════════════════════════════════════
   GALY MARKET — 404.js
   Étape 9 : Page 404
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  /* ── COUNTDOWN RETOUR AUTO ── */
  let seconds = 15;
  let cancelled = false;
  const timerEl = $('errTimer');

  const countdown = setInterval(() => {
    if (cancelled) { clearInterval(countdown); return; }
    seconds--;
    if (timerEl) timerEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(countdown);
      window.location.href = 'index.html';
    }
  }, 1000);

  $('errCancel')?.addEventListener('click', () => {
    cancelled = true;
    clearInterval(countdown);
    const wrap = document.querySelector('.err-countdown');
    if (wrap) wrap.innerHTML = '<i class="fas fa-check" style="color:var(--gold,#f68b1e)"></i> Redirection annulée';
  });

  /* ── RECHERCHE ── */
  $('errSearchBtn')?.addEventListener('click', doSearch);
  $('errSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  function doSearch() {
    const q = $('errSearch')?.value.trim();
    if (!q) return;
    window.location.href = `catalogue.html?q=${encodeURIComponent(q)}`;
  }

  /* ── HEADER SCROLL ── */
  window.addEventListener('scroll', () => {
    document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
});
