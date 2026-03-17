/* ═══════════════════════════════════════════
   GALY MARKET — main.js
   Étape 1 : Header + Nav + Hero
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── LOADER ── */
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 2600);
  }

  /* ── HEADER SCROLL ── */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ── BURGER / MENU MOBILE ── */
  const burger        = document.getElementById('burger');
  const mobileMenu    = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose   = document.getElementById('mobileClose');

  function openMenu() {
    burger?.classList.add('open');
    mobileMenu?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    burger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  burger?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);

  /* ── HERO SLIDER ── */
  const slides   = document.querySelectorAll('.slide');
  const dots     = document.querySelectorAll('.hero-dot');
  const prevBtn  = document.getElementById('heroPrev');
  const nextBtn  = document.getElementById('heroNext');
  let current    = 0;
  let autoTimer  = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => { goTo(+dot.dataset.i); startAuto(); });
  });

  // Swipe mobile
  let touchStartX = 0;
  const heroEl = document.querySelector('.hero');
  heroEl?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  startAuto();

  /* ── COUNTDOWN FLASH ── */
  const cdH = document.getElementById('cdH');
  const cdM = document.getElementById('cdM');
  const cdS = document.getElementById('cdS');

  function startCountdown() {
    // Heure de fin : aujourd'hui à minuit
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 0);
    let remaining = Math.floor((end - now) / 1000);

    const tick = () => {
      if (remaining <= 0) { remaining = 86399; } // repart à minuit
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      if (cdH) cdH.textContent = String(h).padStart(2, '0');
      if (cdM) cdM.textContent = String(m).padStart(2, '0');
      if (cdS) cdS.textContent = String(s).padStart(2, '0');
      remaining--;
    };
    tick();
    setInterval(tick, 1000);
  }
  startCountdown();

  /* ── CART / WISHLIST BADGES ── */
  function updateBadges() {
    const cart     = JSON.parse(localStorage.getItem('GM_CART')     || '[]');
    const wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
    const qty      = cart.reduce((a, i) => a + i.qty, 0);

    const cartBadge = document.getElementById('cartBadge');
    const wishBadge = document.getElementById('wishBadge');
    if (cartBadge) cartBadge.textContent = qty > 0 ? qty : '';
    if (wishBadge) wishBadge.textContent = wishlist.length > 0 ? wishlist.length : '';
  }
  updateBadges();
  window.addEventListener('storage', updateBadges);

  /* ── SEARCH ── */
  const searchInput = document.getElementById('searchInput');

  // Créer le dropdown de suggestions
  const suggestBox = document.createElement('div');
  suggestBox.id = 'searchSuggest';
  suggestBox.style.cssText = `
    position:absolute; top:100%; left:0; right:0; z-index:9999;
    background:#fff; border:1.5px solid rgba(246,139,30,.3);
    border-top:none; border-radius:0 0 12px 12px;
    box-shadow:0 8px 24px rgba(0,0,0,.12);
    max-height:320px; overflow-y:auto; display:none;
  `;
  searchInput?.parentElement?.style && (searchInput.parentElement.style.position = 'relative');
  searchInput?.parentElement?.appendChild(suggestBox);

  function showSuggestions(query) {
    if (!suggestBox || !query || query.length < 2) {
      suggestBox.style.display = 'none';
      return;
    }
    if (typeof GM_PRODUCTS === 'undefined') return;

    // Fusionner produits base + custom + overrides
    const ov = JSON.parse(localStorage.getItem('GM_PROD_OVERRIDES') || '{}');
    const cu = JSON.parse(localStorage.getItem('GM_CUSTOM_PRODS')   || '[]');
    const allProds = [
      ...GM_PRODUCTS.filter(p => !ov[p.id]?._deleted).map(p => ({ ...p, ...(ov[p.id]||{}) })),
      ...cu.filter(p => !p._deleted)
    ];

    const q = query.toLowerCase();
    const results = allProds.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.desc && p.desc.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.cat && p.cat.toLowerCase().includes(q))
    ).slice(0, 6);

    if (!results.length) {
      suggestBox.style.display = 'none';
      return;
    }

    suggestBox.innerHTML = results.map(p => {
      const prix = p.price.toLocaleString('fr-FR') + ' GNF';
      const name = p.name.replace(new RegExp(`(${query})`, 'gi'), '<strong style="color:#f68b1e">$1</strong>');
      const photo = (p.photos && p.photos[0]) || p.img || '';
      const thumb = photo
        ? `<img src="${photo}" style="width:36px;height:36px;object-fit:cover;border-radius:6px">`
        : `<span style="font-size:24px;width:36px;text-align:center">${p.em||'📦'}</span>`;
      return `
        <div onclick="window.location.href='produit.html?id=${p.id}'"
          style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06);transition:background .15s"
          onmouseover="this.style.background='rgba(246,139,30,.06)'"
          onmouseout="this.style.background='transparent'">
          ${thumb}
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#1a1206;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
            <div style="font-size:11px;color:#8a7560;margin-top:2px">${p.brand || ''} · ${prix}</div>
          </div>
          <i class="fas fa-arrow-right" style="color:#f68b1e;font-size:11px;opacity:.6"></i>
        </div>`;
    }).join('') +
    `<div onclick="window.location.href='catalogue.html?q=${encodeURIComponent(query)}'"
      style="padding:10px 16px;font-size:12px;font-weight:700;color:#f68b1e;cursor:pointer;text-align:center;border-top:1px solid rgba(246,139,30,.1)"
      onmouseover="this.style.background='rgba(246,139,30,.06)'"
      onmouseout="this.style.background='transparent'">
      🔍 Voir tous les résultats pour "${query}"
    </div>`;

    suggestBox.style.display = 'block';
  }

  searchInput?.addEventListener('input', e => showSuggestions(e.target.value.trim()));

  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      suggestBox.style.display = 'none';
      window.location.href = `catalogue.html?q=${encodeURIComponent(searchInput.value.trim())}`;
    }
    if (e.key === 'Escape') suggestBox.style.display = 'none';
  });

  // Bouton Chercher
  document.querySelector('.search-btn')?.addEventListener('click', () => {
    if (searchInput?.value.trim()) {
      suggestBox.style.display = 'none';
      window.location.href = `catalogue.html?q=${encodeURIComponent(searchInput.value.trim())}`;
    }
  });

  // Fermer suggestions si clic ailleurs
  document.addEventListener('click', e => {
    if (!searchInput?.parentElement?.contains(e.target)) {
      suggestBox.style.display = 'none';
    }
  });

  /* ── KEYBOARD ESC ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMenu();
      fermerMenuCats();
    }
  });

});

/* ── MENU CATÉGORIES (fonctions globales appelées depuis le HTML) ── */
function toggleMenuCats() {
  const sidebar = document.getElementById('catsSidebar');
  const overlay = document.getElementById('catsOverlay');
  const arr     = document.querySelector('.nav-arr');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay?.classList.remove('open');
    arr?.classList.remove('rotated');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.add('open');
    overlay?.classList.add('open');
    arr?.classList.add('rotated');
    document.body.style.overflow = 'hidden';
  }
}

function fermerMenuCats() {
  const sidebar = document.getElementById('catsSidebar');
  const overlay = document.getElementById('catsOverlay');
  const arr     = document.querySelector('.nav-arr');
  sidebar?.classList.remove('open');
  overlay?.classList.remove('open');
  arr?.classList.remove('rotated');
  document.body.style.overflow = '';
}
