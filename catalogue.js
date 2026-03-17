/* ═══════════════════════════════════════════
   GALY MARKET — catalogue.js
   Filtres, tri, grille, panier, pagination
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── ÉTAT ── */
  const state = {
    cat:       '',
    search:    '',
    minPrice:  0,
    maxPrice:  20000000,
    minRating: 0,
    inStock:   false,
    onSale:    false,
    flashOnly: false,
    isNew:     false,
    brands:    [],
    sort:      'default',
    view:      'grid',
    page:      1,
    perPage:   12,
  };

  let wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
  let cart     = JSON.parse(localStorage.getItem('GM_CART')     || '[]');

  const saveWishlist = () => localStorage.setItem('GM_WISHLIST', JSON.stringify(wishlist));
  const saveCart     = () => localStorage.setItem('GM_CART',     JSON.stringify(cart));

  /* ── ÉLÉMENTS DOM ── */
  const prodGrid     = document.getElementById('prodGrid');
  const emptyState   = document.getElementById('emptyState');
  const pagination   = document.getElementById('pagination');
  const bcCurrent    = document.getElementById('bcCurrent');
  const bcCount      = document.getElementById('bcCount');
  const activeFilters= document.getElementById('activeFilters');
  const filterBadge  = document.getElementById('filterBadge');
  const cartOverlay  = document.getElementById('cartOverlay');
  const cartBody     = document.getElementById('cartBody');
  const cartBadgeEl  = document.getElementById('cartBadge');
  const wishBadgeEl  = document.getElementById('wishBadge');

  /* ── INIT URL PARAMS ── */
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat'))       state.cat       = params.get('cat');
  if (params.get('q'))         state.search    = params.get('q');
  if (params.get('promo'))     state.onSale    = true;
  if (params.get('flash'))     state.flashOnly = true;
  if (params.get('nouveau'))   state.isNew     = true;
  if (params.get('brand'))     state.brands    = [params.get('brand')];

  // Sync UI avec l'état initial
  if (state.cat) {
    document.querySelectorAll('.cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === state.cat);
    });
  }
  if (state.onSale) {
    const el = document.getElementById('onSale');
    if (el) el.checked = true;
  }
  if (state.search) {
    const si = document.getElementById('searchInput');
    if (si) si.value = state.search;
  }

  /* ── FILTRAGE ── */
  function getAllProdsForCatalogue() {
    const ov = JSON.parse(localStorage.getItem('GM_PROD_OVERRIDES') || '{}');
    const cu = JSON.parse(localStorage.getItem('GM_CUSTOM_PRODS')   || '[]');
    const base = GM_PRODUCTS
      .filter(p => !ov[p.id]?._deleted)
      .map(p => ({ ...p, ...(ov[p.id] || {}) }));
    return [...base, ...cu.filter(p => !p._deleted)];
  }

  function getFiltered() {
    return getAllProdsForCatalogue().filter(p => {
      if (state.cat    && p.cat !== state.cat)                     return false;
      if (state.search && !p.name.toLowerCase().includes(state.search.toLowerCase()) &&
          !p.desc?.toLowerCase().includes(state.search.toLowerCase()))  return false;
      if (p.price < state.minPrice || p.price > state.maxPrice)   return false;
      if (p.rating < state.minRating)                              return false;
      if (state.inStock  && p.stock === 0)                         return false;
      if (state.onSale   && !p.old)                                return false;
      if (state.flashOnly && !p.flash)                             return false;
      if (state.isNew && !p.isNew)                                 return false;
      if (state.brands.length && !state.brands.includes(p.brand)) return false;
      return true;
    });
  }

  /* ── TRI ── */
  function getSorted(arr) {
    const a = [...arr];
    switch (state.sort) {
      case 'price-asc':  return a.sort((x,y) => x.price - y.price);
      case 'price-desc': return a.sort((x,y) => y.price - x.price);
      case 'rating':     return a.sort((x,y) => y.rating - x.rating);
      case 'newest':     return a.sort((x,y) => (y.isNew?1:0) - (x.isNew?1:0));
      case 'promo':      return a.sort((x,y) => {
        const dx = x.old ? Math.round((1-x.price/x.old)*100) : 0;
        const dy = y.old ? Math.round((1-y.price/y.old)*100) : 0;
        return dy - dx;
      });
      default: return a;
    }
  }

  /* ── FORMAT ── */
  const fmt = n => n.toLocaleString('fr-FR') + ' GNF';

  function renderStars(r) {
    const full  = Math.floor(r);
    const half  = r % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  /* ── RENDU CARTE ── */
  function makeCard(p, delay = 0) {
    const disc    = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    const inWish  = wishlist.includes(p.id);
    const catInfo = GM_CATS[p.cat] || { label: p.cat };

    const card = document.createElement('div');
    card.className = 'prod-card';
    card.style.animationDelay = `${delay}ms`;

    card.innerHTML = `
      <div class="card-img">
        ${(p.photos && p.photos[0]) || p.img
          ? `<img src="${(p.photos && p.photos[0]) || p.img}" alt="${p.name}" loading="lazy"
               onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
          : ''}
        <div class="card-emoji" ${(p.photos && p.photos[0]) || p.img ? 'style="display:none"' : ''}>${p.em||'📦'}</div>
        ${disc   ? `<div class="card-disc">-${disc}%</div>` : ''}
        ${p.flash ? `<div class="card-flash">⚡ FLASH</div>` : ''}
        ${p.isNew && !disc ? `<div class="card-new">✦ NEW</div>` : ''}
        <button class="card-wish ${inWish ? 'active' : ''}"
          data-id="${p.id}" title="Ajouter aux favoris">
          <i class="${inWish ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="card-quick">
          <button class="quick-cart" data-id="${p.id}">
            <i class="fas fa-cart-plus"></i> Ajouter au panier
          </button>
          <a href="produit.html?id=${p.id}" class="quick-view" title="Voir le produit">
            <i class="fas fa-eye"></i>
          </a>
        </div>
      </div>
      <div class="card-body">
        <div class="card-cat">${catInfo.label}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="rating-num">${p.rating}</span>
          <span class="rating-count">(${(p.reviews||0).toLocaleString('fr-FR')})</span>
        </div>
        <div class="card-prices">
          <span class="price-now">${fmt(p.price)}</span>
          ${p.old ? `<span class="price-old">${fmt(p.old)}</span>` : ''}
        </div>
      </div>
    `;

    // Wishlist
    card.querySelector('.card-wish').addEventListener('click', e => {
      e.stopPropagation();
      toggleWish(p.id, card.querySelector('.card-wish'));
    });

    // Add to cart
    card.querySelector('.quick-cart').addEventListener('click', e => {
      e.stopPropagation();
      addToCart(p);
    });

    return card;
  }

  /* ── RENDU GRILLE ── */
  function render() {
    const filtered = getSorted(getFiltered());
    const total    = filtered.length;
    const pages    = Math.ceil(total / state.perPage);
    if (state.page > pages) state.page = 1;
    const start    = (state.page - 1) * state.perPage;
    const pageProds = filtered.slice(start, start + state.perPage);

    // Breadcrumb
    const catLabel = state.cat ? (GM_CATS[state.cat]?.label || state.cat) : 'Catalogue';
    if (bcCurrent) bcCurrent.textContent = catLabel;
    if (bcCount)   bcCount.textContent   = `${total} produit${total > 1 ? 's' : ''}`;

    // Grille
    prodGrid.innerHTML = '';
    if (!pageProds.length) {
      emptyState.style.display = 'block';
      pagination.innerHTML = '';
    } else {
      emptyState.style.display = 'none';
      pageProds.forEach((p, i) => prodGrid.appendChild(makeCard(p, i * 55)));
      renderPagination(pages);
    }

    updateCatCounts();
    updateActiveFilters();
  }

  /* ── PAGINATION ── */
  function renderPagination(pages) {
    if (pages <= 1) { pagination.innerHTML = ''; return; }
    let html = `
      <button class="pg-btn" onclick="changePage(${state.page - 1})"
        ${state.page === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>`;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) {
        html += `<button class="pg-btn ${i === state.page ? 'active' : ''}"
          onclick="changePage(${i})">${i}</button>`;
      } else if (Math.abs(i - state.page) === 2) {
        html += `<span class="pg-dots">…</span>`;
      }
    }
    html += `
      <button class="pg-btn" onclick="changePage(${state.page + 1})"
        ${state.page === pages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>`;
    pagination.innerHTML = html;
  }

  window.changePage = (n) => {
    state.page = n;
    render();
    window.scrollTo({ top: document.querySelector('.cat-layout').offsetTop - 90, behavior: 'smooth' });
  };

  /* ── COMPTEURS CATÉGORIES ── */
  function updateCatCounts() {
    const orig = state.cat;
    Object.keys(GM_CATS).forEach(cat => {
      state.cat = cat;
      const el = document.getElementById(`cc-${cat}`);
      if (el) el.textContent = getFiltered().length;
    });
    state.cat = orig;
    const allEl = document.getElementById('cc-all');
    state.cat = '';
    if (allEl) allEl.textContent = getFiltered().length;
    state.cat = orig;
  }

  /* ── FILTRES ACTIFS ── */
  function updateActiveFilters() {
    const tags = [];
    if (state.cat)      tags.push({ label: GM_CATS[state.cat]?.label || state.cat, clear: () => { state.cat = ''; syncCatBtns(''); render(); } });
    if (state.search)   tags.push({ label: `"${state.search}"`, clear: () => { state.search = ''; const si = document.getElementById('searchInput'); if(si) si.value=''; render(); } });
    if (state.onSale)   tags.push({ label: 'En promotion', clear: () => { state.onSale = false; document.getElementById('onSale').checked=false; render(); } });
    if (state.flashOnly)tags.push({ label: '⚡ Flash Sale', clear: () => { state.flashOnly = false; document.getElementById('flashOnly').checked=false; render(); } });
    if (state.minRating > 0) tags.push({ label: `⭐ ${state.minRating}+`, clear: () => { state.minRating = 0; syncRatingBtns(0); render(); } });

    activeFilters.innerHTML = tags.map((t, i) => `
      <div class="filter-tag">
        ${t.label}
        <button onclick="clearFilterTag(${i})"><i class="fas fa-times"></i></button>
      </div>`).join('');

    window._filterTagClearFns = tags.map(t => t.clear);
    const count = tags.length;
    if (filterBadge) {
      filterBadge.textContent = count;
      filterBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  window.clearFilterTag = (i) => window._filterTagClearFns?.[i]?.();

  /* ── WISHLIST ── */
  function toggleWish(id, btn) {
    const idx = wishlist.indexOf(id);
    if (idx >= 0) {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.querySelector('i').className = 'far fa-heart';
      showToast('💔 Retiré des favoris');
    } else {
      wishlist.push(id);
      btn.classList.add('active');
      btn.querySelector('i').className = 'fas fa-heart';
      showToast('❤️ Ajouté aux favoris !');
    }
    saveWishlist();
    updateBadges();
  }

  /* ── PANIER ── */
  function addToCart(p) {
    const ex = cart.find(i => i.id === p.id);
    if (ex) ex.qty++;
    else cart.push({ id: p.id, name: p.name, price: p.price, em: p.em, img: p.img, qty: 1 });
    saveCart(); updateBadges(); renderCart();
    showToast(`🛒 ${p.name.slice(0, 28)}… ajouté !`);
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart(); updateBadges(); renderCart();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(); updateBadges(); renderCart();
  }

  function renderCart() {
    if (!cartBody) return;
    if (!cart.length) {
      cartBody.innerHTML = `<div class="cart-empty">
        <i class="fas fa-bag-shopping"></i>
        <p>Votre panier est vide</p>
      </div>`;
      document.getElementById('cartTotal').textContent = '0 GNF';
      document.getElementById('drawerCount').textContent = '';
      document.getElementById('cartSavings').textContent = '';
      return;
    }
    const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
    const qty      = cart.reduce((a, i) => a + i.qty, 0);

    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="ci-img">
          ${item.img
            ? `<img src="${item.img}" alt="${item.name}" onerror="this.style.display='none'">`
            : item.em}
        </div>
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-price">${fmt(item.price * item.qty)}</div>
          <div class="ci-qty">
            <button class="ci-qty-btn" onclick="cartQty(${item.id}, -1)">−</button>
            <span class="ci-qty-val">${item.qty}</span>
            <button class="ci-qty-btn" onclick="cartQty(${item.id}, +1)">+</button>
          </div>
        </div>
        <button class="ci-del" onclick="cartRemove(${item.id})"><i class="fas fa-times"></i></button>
      </div>`).join('');

    document.getElementById('cartTotal').textContent = fmt(subtotal);
    document.getElementById('drawerCount').textContent = `(${qty})`;

    // Économies
    const orig = cart.reduce((a, i) => {
      const prod = getAllProdsForCatalogue().find(p => p.id === i.id);
      return a + (prod?.old || i.price) * i.qty;
    }, 0);
    const saved = orig - subtotal;
    const savEl = document.getElementById('cartSavings');
    if (savEl) savEl.textContent = saved > 0 ? `🎉 Vous économisez ${fmt(saved)}` : '';
  }

  // Expose pour inline onclick
  window.cartQty    = (id, d) => changeQty(id, d);
  window.cartRemove = (id)    => removeFromCart(id);

  /* ── BADGES ── */
  function updateBadges() {
    const qty = cart.reduce((a, i) => a + i.qty, 0);
    if (cartBadgeEl) cartBadgeEl.textContent = qty > 0 ? qty : '';
    if (wishBadgeEl) wishBadgeEl.textContent = wishlist.length > 0 ? wishlist.length : '';
  }

  /* ── TOAST ── */
  function showToast(msg) {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (!t || !m) return;
    m.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── CART DRAWER ── */
  const cartToggle = document.getElementById('cartToggle');
  const cartClose  = document.getElementById('cartClose');

  cartToggle?.addEventListener('click', () => {
    renderCart();
    cartOverlay?.classList.add('open');
  });
  cartClose?.addEventListener('click', () => cartOverlay?.classList.remove('open'));
  cartOverlay?.addEventListener('click', e => {
    if (e.target === cartOverlay) cartOverlay.classList.remove('open');
  });

  /* ── FILTRES SIDEBAR ── */

  // Catégories
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.cat = btn.dataset.cat;
      state.page = 1;
      syncCatBtns(state.cat);
      render();
    });
  });

  function syncCatBtns(cat) {
    document.querySelectorAll('.cat-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.cat === cat));
  }

  // Prix
  const rangeMin  = document.getElementById('rangeMin');
  const rangeMax  = document.getElementById('rangeMax');
  const priceMinL = document.getElementById('priceMin');
  const priceMaxL = document.getElementById('priceMax');

  function updatePriceDisplay() {
    const lo = parseInt(rangeMin.value);
    const hi = parseInt(rangeMax.value);
    if (priceMinL) priceMinL.textContent = lo.toLocaleString('fr-FR');
    if (priceMaxL) priceMaxL.textContent = hi.toLocaleString('fr-FR');
  }

  rangeMin?.addEventListener('input', () => {
    if (parseInt(rangeMin.value) > parseInt(rangeMax.value))
      rangeMin.value = rangeMax.value;
    state.minPrice = parseInt(rangeMin.value);
    state.page = 1;
    updatePriceDisplay(); render();
  });
  rangeMax?.addEventListener('input', () => {
    if (parseInt(rangeMax.value) < parseInt(rangeMin.value))
      rangeMax.value = rangeMin.value;
    state.maxPrice = parseInt(rangeMax.value);
    state.page = 1;
    updatePriceDisplay(); render();
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.minPrice = parseInt(btn.dataset.min);
      state.maxPrice = parseInt(btn.dataset.max);
      if (rangeMin) rangeMin.value = state.minPrice;
      if (rangeMax) rangeMax.value = state.maxPrice;
      state.page = 1;
      updatePriceDisplay();
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  // Note
  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.minRating = parseFloat(btn.dataset.min);
      state.page = 1;
      syncRatingBtns(state.minRating);
      render();
    });
  });
  function syncRatingBtns(min) {
    document.querySelectorAll('.rating-btn').forEach(b =>
      b.classList.toggle('active', parseFloat(b.dataset.min) === min));
  }

  // Checkboxes
  document.getElementById('inStock')?.addEventListener('change', e => {
    state.inStock = e.target.checked; state.page = 1; render();
  });
  document.getElementById('onSale')?.addEventListener('change', e => {
    state.onSale = e.target.checked; state.page = 1; render();
  });
  document.getElementById('flashOnly')?.addEventListener('change', e => {
    state.flashOnly = e.target.checked; state.page = 1; render();
  });

  // Marques
  document.querySelectorAll('.brand-check').forEach(cb => {
    cb.addEventListener('change', () => {
      state.brands = [...document.querySelectorAll('.brand-check:checked')].map(c => c.value);
      state.page = 1; render();
    });
  });

  // Reset
  document.getElementById('resetFilters')?.addEventListener('click', resetAll);
  window.resetAll = function() {
    Object.assign(state, {
      cat: '', search: '', minPrice: 0, maxPrice: 20000000,
      minRating: 0, inStock: false, onSale: false, flashOnly: false, brands: [], page: 1
    });
    syncCatBtns(''); syncRatingBtns(0);
    if (rangeMin) rangeMin.value = 0;
    if (rangeMax) rangeMax.value = 2000000;
    updatePriceDisplay();
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    ['inStock','onSale','flashOnly'].forEach(id => { const el = document.getElementById(id); if(el) el.checked=false; });
    document.querySelectorAll('.brand-check').forEach(cb => cb.checked = false);
    const si = document.getElementById('searchInput'); if(si) si.value = '';
    render();
  };

  /* ── TRI ── */
  document.getElementById('sortSelect')?.addEventListener('change', e => {
    state.sort = e.target.value; state.page = 1; render();
  });

  /* ── VUE GRILLE / LISTE ── */
  document.getElementById('viewGrid')?.addEventListener('click', () => {
    state.view = 'grid';
    prodGrid.classList.remove('list-view');
    document.getElementById('viewGrid').classList.add('active');
    document.getElementById('viewList').classList.remove('active');
    render();
  });
  document.getElementById('viewList')?.addEventListener('click', () => {
    state.view = 'list';
    prodGrid.classList.add('list-view');
    document.getElementById('viewList').classList.add('active');
    document.getElementById('viewGrid').classList.remove('active');
    render();
  });

  /* ── SIDEBAR MOBILE ── */
  const sidebar     = document.getElementById('sidebar');
  const filterToggle= document.getElementById('filterToggle');
  const sbClose     = document.getElementById('sbClose');

  filterToggle?.addEventListener('click', () => sidebar?.classList.add('open'));
  sbClose?.addEventListener('click',      () => sidebar?.classList.remove('open'));

  /* ── COLLAPSE SECTIONS SIDEBAR ── */
  document.querySelectorAll('.sb-title').forEach(title => {
    title.addEventListener('click', () => {
      const body = document.getElementById(title.dataset.target);
      if (!body) return;
      title.classList.toggle('collapsed');
      body.classList.toggle('collapsed');
    });
  });

  /* ── SEARCH ── */
  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', e => {
    state.search = e.target.value.trim();
    state.page = 1;
    render();
  });
  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') render();
  });

  /* ── LANCEMENT ── */
  updatePriceDisplay();

  // Générer les marques dynamiquement depuis tous les produits (base + custom)
  function initBrandsFilter() {
    const sbBrands = document.getElementById('sbBrands');
    if (!sbBrands) return;
    const allProds = getAllProdsForCatalogue();
    const brands = [...new Set(allProds.map(p => p.brand).filter(Boolean))].sort();
    if (!brands.length) { sbBrands.innerHTML = '<p style="color:var(--muted);font-size:12px">Aucune marque</p>'; return; }
    sbBrands.innerHTML = brands.map(b => `
      <label class="sb-check">
        <input type="checkbox" class="brand-check" value="${b}" ${state.brands.includes(b)?'checked':''}>
        <span class="checkmark"></span>${b}
      </label>`).join('');
    // Rebind les listeners
    sbBrands.querySelectorAll('.brand-check').forEach(cb => {
      cb.addEventListener('change', () => {
        state.brands = [...document.querySelectorAll('.brand-check:checked')].map(c => c.value);
        state.page = 1;
        render();
      });
    });
  }

  // Mettre à jour les compteurs de catégories
  function updateCatCounts() {
    const allProds = getAllProdsForCatalogue();
    const cats = ['all','phones','mode','beaute','maison','sport','bijoux','informatique','electromenager','bebe','auto'];
    cats.forEach(cat => {
      const el = document.getElementById('cc-' + cat);
      if (!el) return;
      const count = cat === 'all' ? allProds.length : allProds.filter(p => p.cat === cat).length;
      el.textContent = count;
    });
  }

  initBrandsFilter();
  updateCatCounts();
  render();
  updateBadges();
  renderCart();

  // Loader
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 1800);

  // Header scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Burger
  const burger        = document.getElementById('burger');
  const mobileMenu    = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose   = document.getElementById('mobileClose');
  burger?.addEventListener('click', () => {
    burger.classList.add('open');
    mobileMenu?.classList.add('open');
    mobileOverlay?.classList.add('open');
  });
  [mobileClose, mobileOverlay].forEach(el => el?.addEventListener('click', () => {
    burger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
  }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      cartOverlay?.classList.remove('open');
      sidebar?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      mobileOverlay?.classList.remove('open');
      burger?.classList.remove('open');
    }
  });
});
