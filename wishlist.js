/* ═══════════════════════════════════════════
   GALY MARKET — wishlist.js
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const $   = id => document.getElementById(id);
  const fmt = n  => n.toLocaleString('fr-FR') + ' GNF';

  let wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
  let cart     = JSON.parse(localStorage.getItem('GM_CART')     || '[]');

  const saveWish = () => localStorage.setItem('GM_WISHLIST', JSON.stringify(wishlist));
  const saveCart = () => localStorage.setItem('GM_CART',     JSON.stringify(cart));

  const GM_CATS_MAP = {
    phones:'Téléphones & Tech', mode:'Mode & Vêtements',
    beaute:'Beauté & Parfums',  maison:'Maison & Jardin',
    sport:'Sport & Fitness',    bijoux:'Bijoux & Montres',
    informatique:'Informatique', electromenager:'Électroménager',
    bebe:'Bébé & Enfants',      auto:'Auto & Moto',
  };

  // Fusionner produits base + custom + overrides
  function getAllProds() {
    const ov = JSON.parse(localStorage.getItem('GM_PROD_OVERRIDES') || '{}');
    const cu = JSON.parse(localStorage.getItem('GM_CUSTOM_PRODS')   || '[]');
    const base = (typeof GM_PRODUCTS !== 'undefined')
      ? GM_PRODUCTS.filter(p => !ov[p.id]?._deleted).map(p => ({ ...p, ...(ov[p.id]||{}) }))
      : [];
    return [...base, ...cu.filter(p => !p._deleted)];
  }

  /* ── BADGES ── */
  function updateBadges() {
    const qty = cart.reduce((a, i) => a + i.qty, 0);
    if ($('cartBadge')) $('cartBadge').textContent = qty > 0 ? qty : '';
    if ($('wishBadge')) $('wishBadge').textContent = wishlist.length > 0 ? wishlist.length : '';
  }

  /* ── RENDER ── */
  function render() {
    const allProds = getAllProds();
    const prods = allProds.filter(p => wishlist.includes(String(p.id)) || wishlist.includes(p.id));

    const grid    = $('wishGrid');
    const empty   = $('wishEmpty');
    const toolbar = $('wishToolbar');

    if ($('bcCount')) $('bcCount').textContent = prods.length ? `${prods.length} produit${prods.length>1?'s':''}` : '';
    if ($('wtCount')) $('wtCount').innerHTML = prods.length
      ? `<strong>${prods.length}</strong> produit${prods.length>1?'s':''} sauvegardé${prods.length>1?'s':''}`
      : '';

    if (!prods.length) {
      if (grid)    grid.innerHTML = '';
      if (empty)   empty.style.display = 'block';
      if (toolbar) toolbar.style.display = 'none';
      renderSuggestions();
      updateBadges();
      return;
    }

    if (empty)   empty.style.display   = 'none';
    if (toolbar) toolbar.style.display = 'flex';

    grid.innerHTML = prods.map(p => {
      const disc   = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
      const inCart = cart.find(i => String(i.id) === String(p.id));
      const photo  = (p.photos && p.photos[0]) || p.img || '';
      return `
        <div class="wish-card" id="wc-${p.id}">
          <div class="wc-img">
            ${photo ? `<img src="${photo}" alt="${p.name}" onerror="this.style.display='none';this.nextSibling.style.display='flex'">` : ''}
            <span style="${photo?'display:none':'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:52px'}">${p.em||'📦'}</span>
            ${disc ? `<div class="wc-disc">-${disc}%</div>` : ''}
            ${p.flash ? `<div class="wc-disc" style="background:#f68b1e">⚡</div>` : ''}
            <button class="wc-remove" onclick="removeWish('${p.id}')" title="Retirer des favoris">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="wc-body">
            <div class="wc-cat">${GM_CATS_MAP[p.cat] || p.cat || ''}</div>
            <div class="wc-name"><a href="produit.html?id=${p.id}">${p.name}</a></div>
            <div class="wc-prices">
              <span class="wc-price">${fmt(p.price)}</span>
              ${p.old ? `<span class="wc-old">${fmt(p.old)}</span>` : ''}
            </div>
            <div class="wc-actions">
              <button class="wc-add ${inCart?'in-cart':''}" onclick="addToCart('${p.id}')" id="wca-${p.id}">
                <i class="fas ${inCart?'fa-check':'fa-bag-shopping'}"></i>
                ${inCart ? 'Dans le panier' : 'Ajouter au panier'}
              </button>
              <a href="produit.html?id=${p.id}" class="wc-view" title="Voir le produit">
                <i class="fas fa-eye"></i>
              </a>
            </div>
          </div>
        </div>`;
    }).join('');

    updateBadges();
  }

  function renderSuggestions() {
    const grid = $('suggGrid'); if (!grid) return;
    const allProds = getAllProds();
    const prods = allProds
      .filter(p => !wishlist.includes(String(p.id)) && !wishlist.includes(p.id))
      .slice(0, 4);
    if (!prods.length) return;

    grid.innerHTML = prods.map(p => {
      const photo = (p.photos && p.photos[0]) || p.img || '';
      return `
        <div class="wish-card sr sr-up">
          <div class="wc-img" style="height:160px">
            ${photo ? `<img src="${photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextSibling.style.display='flex'">` : ''}
            <span style="${photo?'display:none':'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:52px'}">${p.em||'📦'}</span>
          </div>
          <div class="wc-body">
            <div class="wc-name" style="font-size:13px"><a href="produit.html?id=${p.id}">${p.name}</a></div>
            <div class="wc-prices">
              <span class="wc-price" style="font-size:16px">${fmt(p.price)}</span>
            </div>
            <div class="wc-actions">
              <button class="wc-add" onclick="addWish('${p.id}')" style="font-size:12px">
                <i class="fas fa-heart"></i> Ajouter aux favoris
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── ACTIONS ── */
  window.removeWish = function(id) {
    const card = $(`wc-${id}`);
    if (card) {
      card.style.transform = 'scale(.8)';
      card.style.opacity   = '0';
      card.style.transition = 'all .3s ease';
      setTimeout(() => {
        wishlist = wishlist.filter(x => String(x) !== String(id));
        saveWish(); render();
      }, 300);
    }
    showToast('💔 Retiré des favoris');
  };

  window.addWish = function(id) {
    const sid = String(id);
    if (!wishlist.map(String).includes(sid)) {
      wishlist.push(sid); saveWish(); render();
      showToast('❤️ Ajouté aux favoris !');
    }
  };

  window.addToCart = function(id) {
    const allProds = getAllProds();
    const p = allProds.find(x => String(x.id) === String(id));
    if (!p) return;
    const existing = cart.find(i => String(i.id) === String(id));
    if (existing) existing.qty++;
    else cart.push({ id:p.id, name:p.name, price:p.price, em:p.em||'📦', img:p.img||'', qty:1 });
    saveCart(); updateBadges();
    const btn = $(`wca-${id}`);
    if (btn) { btn.innerHTML = '<i class="fas fa-check"></i> Dans le panier'; btn.style.background = 'var(--green)'; }
    const card = $(`wc-${id}`);
    if (window.GalyAnimations && card) GalyAnimations.flyToCart(card, p.em||'📦');
    showToast(`🛍️ ${p.name} ajouté au panier !`);
  };

  /* ── TOOLBAR ── */
  $('btnAddAllCart')?.addEventListener('click', () => {
    const allProds = getAllProds();
    const prods = allProds.filter(p => wishlist.map(String).includes(String(p.id)));
    if (!prods.length) return;
    prods.forEach(p => {
      const ex = cart.find(i => String(i.id) === String(p.id));
      if (ex) ex.qty++;
      else cart.push({ id:p.id, name:p.name, price:p.price, em:p.em||'📦', img:p.img||'', qty:1 });
    });
    saveCart(); updateBadges(); render();
    showToast(`🛍️ ${prods.length} produit${prods.length>1?'s':''} ajouté${prods.length>1?'s':''} au panier !`);
    if (window.GalyAnimations) GalyAnimations.confetti(2500);
  });

  $('btnClearWish')?.addEventListener('click', () => {
    if (!confirm('Vider toute la liste de favoris ?')) return;
    wishlist = []; saveWish(); render();
    showToast('🗑️ Favoris vidés');
  });

  /* ── TOAST ── */
  function showToast(msg) {
    const t = $('toast'), m = $('toastMsg'); if (!t||!m) return;
    m.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── HEADER & BURGER ── */
  window.addEventListener('scroll', () => {
    $('header')?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive:true });
  const burger = $('burger'), mMenu = $('mobileMenu'), mOv = $('mobileOverlay'), mClose = $('mobileClose');
  burger?.addEventListener('click', () => { burger.classList.add('open'); mMenu?.classList.add('open'); mOv?.classList.add('open'); });
  [mClose, mOv].forEach(el => el?.addEventListener('click', () => { burger?.classList.remove('open'); mMenu?.classList.remove('open'); mOv?.classList.remove('open'); }));

  /* ── INIT ── */
  render();
});

document.addEventListener('DOMContentLoaded', () => {
  const $   = id => document.getElementById(id);
  const fmt = n  => n.toLocaleString('fr-FR') + ' GNF';

  let wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
  let cart     = JSON.parse(localStorage.getItem('GM_CART')     || '[]');

  const saveWish = () => localStorage.setItem('GM_WISHLIST', JSON.stringify(wishlist));
  const saveCart = () => localStorage.setItem('GM_CART',     JSON.stringify(cart));

  const GM_CATS_MAP = {
    phones: 'Téléphones & Tech', mode: 'Mode & Vêtements',
    beaute: 'Beauté & Parfums',  maison: 'Maison & Jardin',
    sport:  'Sport & Fitness',   bijoux: 'Bijoux & Montres',
  };

  /* ── BADGES ── */
  function updateBadges() {
    const qty = cart.reduce((a, i) => a + i.qty, 0);
    if ($('cartBadge')) $('cartBadge').textContent = qty > 0 ? qty : '';
    if ($('wishBadge')) $('wishBadge').textContent = wishlist.length > 0 ? wishlist.length : '';
  }

  /* ── RENDER ── */
  function render() {
    const prods = (typeof GM_PRODUCTS !== 'undefined')
      ? GM_PRODUCTS.filter(p => wishlist.includes(p.id))
      : [];

    const grid  = $('wishGrid');
    const empty = $('wishEmpty');
    const toolbar = $('wishToolbar');

    // Breadcrumb count
    if ($('bcCount')) $('bcCount').textContent = prods.length ? `${prods.length} produit${prods.length > 1 ? 's' : ''}` : '';

    // Toolbar count
    if ($('wtCount')) $('wtCount').innerHTML = prods.length
      ? `<strong>${prods.length}</strong> produit${prods.length > 1 ? 's' : ''} sauvegardé${prods.length > 1 ? 's' : ''}`
      : '';

    if (!prods.length) {
      if (grid)    grid.innerHTML = '';
      if (empty)   empty.style.display = 'block';
      if (toolbar) toolbar.style.display = 'none';
      renderSuggestions();
      updateBadges();
      return;
    }

    if (empty)   empty.style.display   = 'none';
    if (toolbar) toolbar.style.display = 'flex';

    grid.innerHTML = prods.map(p => {
      const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
      const inCart = cart.find(i => i.id === p.id);
      return `
        <div class="wish-card" id="wc-${p.id}">
          <div class="wc-img">
            ${p.img ? `<img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
            <span style="${p.img ? 'display:none' : ''}">${p.em}</span>
            ${disc ? `<div class="wc-disc">-${disc}%</div>` : ''}
            <button class="wc-remove" onclick="removeWish(${p.id})" title="Retirer des favoris">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="wc-body">
            <div class="wc-cat">${GM_CATS_MAP[p.cat] || p.cat}</div>
            <div class="wc-name"><a href="produit.html?id=${p.id}">${p.name}</a></div>
            <div class="wc-prices">
              <span class="wc-price">${fmt(p.price)}</span>
              ${p.old ? `<span class="wc-old">${fmt(p.old)}</span>` : ''}
            </div>
            <div class="wc-actions">
              <button class="wc-add ${inCart ? 'in-cart' : ''}" onclick="addToCart(${p.id})" id="wca-${p.id}">
                <i class="fas ${inCart ? 'fa-check' : 'fa-bag-shopping'}"></i>
                ${inCart ? 'Dans le panier' : 'Ajouter au panier'}
              </button>
              <a href="produit.html?id=${p.id}" class="wc-view" title="Voir le produit">
                <i class="fas fa-eye"></i>
              </a>
            </div>
          </div>
        </div>`;
    }).join('');

    updateBadges();
  }

  function renderSuggestions() {
    const grid = $('suggGrid'); if (!grid) return;
    const prods = (typeof GM_PRODUCTS !== 'undefined')
      ? GM_PRODUCTS.filter(p => !wishlist.includes(p.id)).slice(0, 4)
      : [];
    if (!prods.length) return;

    grid.innerHTML = prods.map(p => `
      <div class="wish-card sr sr-up">
        <div class="wc-img" style="height:160px;font-size:56px">${p.em}</div>
        <div class="wc-body">
          <div class="wc-name" style="font-size:13px"><a href="produit.html?id=${p.id}">${p.name}</a></div>
          <div class="wc-prices">
            <span class="wc-price" style="font-size:16px">${p.price.toLocaleString('fr-FR')} GNF</span>
          </div>
          <div class="wc-actions">
            <button class="wc-add" onclick="addWish(${p.id})" style="font-size:12px">
              <i class="fas fa-heart"></i> Ajouter aux favoris
            </button>
          </div>
        </div>
      </div>`).join('');
  }

  /* ── ACTIONS ── */
  window.removeWish = function(id) {
    const card = $(`wc-${id}`);
    if (card) {
      card.style.transform = 'scale(.8)';
      card.style.opacity   = '0';
      card.style.transition = 'all .3s ease';
      setTimeout(() => {
        wishlist = wishlist.filter(x => x !== id);
        saveWish(); render();
      }, 300);
    }
    showToast('💔 Retiré des favoris');
  };

  window.addWish = function(id) {
    if (!wishlist.includes(id)) {
      wishlist.push(id); saveWish(); render();
      showToast('❤️ Ajouté aux favoris !');
    }
  };

  window.addToCart = function(id) {
    const p = (typeof GM_PRODUCTS !== 'undefined') ? GM_PRODUCTS.find(x => x.id === id) : null;
    if (!p) return;
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id: p.id, name: p.name, price: p.price, em: p.em, img: p.img || '', qty: 1 });
    }
    saveCart(); updateBadges();

    // Mise à jour bouton
    const btn = $(`wca-${id}`);
    if (btn) {
      btn.innerHTML = '<i class="fas fa-check"></i> Dans le panier';
      btn.style.background = 'var(--green)';
    }

    // Animation fly
    const card = $(`wc-${id}`);
    if (window.GalyAnimations && card) {
      GalyAnimations.flyToCart(card, p.em);
    }
    showToast(`🛍️ ${p.name} ajouté au panier !`);
  };

  /* ── TOOLBAR ACTIONS ── */
  $('btnAddAllCart')?.addEventListener('click', () => {
    const prods = (typeof GM_PRODUCTS !== 'undefined')
      ? GM_PRODUCTS.filter(p => wishlist.includes(p.id)) : [];
    if (!prods.length) return;
    prods.forEach(p => {
      const existing = cart.find(i => i.id === p.id);
      if (existing) existing.qty++;
      else cart.push({ id: p.id, name: p.name, price: p.price, em: p.em, img: p.img || '', qty: 1 });
    });
    saveCart(); updateBadges(); render();
    showToast(`🛍️ ${prods.length} produit${prods.length > 1 ? 's' : ''} ajouté${prods.length > 1 ? 's' : ''} au panier !`);
    if (window.GalyAnimations) GalyAnimations.confetti(2500);
  });

  $('btnClearWish')?.addEventListener('click', () => {
    if (!confirm('Vider toute la liste de favoris ?')) return;
    wishlist = []; saveWish(); render();
    showToast('🗑️ Favoris vidés');
  });

  /* ── NEWSLETTER ── */
  $('nlBtn')?.addEventListener('click', () => {
    const tel = $('nlTel')?.value.trim();
    const msg = $('nlMsg');
    if (!tel || tel.length < 8) { if (msg) { msg.textContent = '⚠️ Numéro invalide'; msg.style.color = 'var(--red)'; } return; }
    const subs = JSON.parse(localStorage.getItem('GM_NEWSLETTER') || '[]');
    if (!subs.includes(tel)) { subs.push(tel); localStorage.setItem('GM_NEWSLETTER', JSON.stringify(subs)); }
    if (msg) { msg.textContent = '✅ Inscrit !'; msg.style.color = 'var(--green)'; }
    if ($('nlTel')) $('nlTel').value = '';
    setTimeout(() => { if (msg) msg.textContent = ''; }, 4000);
  });

  /* ── TOAST ── */
  function showToast(msg) {
    const t = $('toast'), m = $('toastMsg'); if (!t || !m) return;
    m.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── HEADER & BURGER ── */
  window.addEventListener('scroll', () => {
    $('header')?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
  const burger = $('burger'), mMenu = $('mobileMenu'), mOv = $('mobileOverlay'), mClose = $('mobileClose');
  burger?.addEventListener('click', () => { burger.classList.add('open'); mMenu?.classList.add('open'); mOv?.classList.add('open'); });
  [mClose, mOv].forEach(el => el?.addEventListener('click', () => { burger?.classList.remove('open'); mMenu?.classList.remove('open'); mOv?.classList.remove('open'); }));

  /* ── INIT ── */
  render();
});
