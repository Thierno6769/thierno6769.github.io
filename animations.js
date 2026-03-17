/* ═══════════════════════════════════════════
   GALY MARKET — animations.js
   Étape 8 : Animations complètes style Jumia
   À inclure dans TOUTES les pages avant </body>
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ════════════════════════════════
     1. LOADER / SPLASH SCREEN
  ════════════════════════════════ */
  function initLoader() {
    // Ne pas afficher le loader si déjà chargé dans la session
    const seen = sessionStorage.getItem('GM_LOADER_SEEN');
    const loader = document.createElement('div');
    loader.id = 'gm-loader';
    loader.innerHTML = `
      <div class="loader-logo">GALY<span>MARKET</span></div>
      <div class="loader-tagline">La boutique de référence en Guinée</div>
      <div class="loader-bar-wrap"><div class="loader-bar" id="loaderBar"></div></div>
      <div class="loader-pct" id="loaderPct">0%</div>
      <div class="loader-dots">
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
      </div>`;
    document.body.prepend(loader);

    if (seen) {
      // Loader express (0.3s) pour pages suivantes
      setTimeout(() => hideLoader(loader), 300);
      return;
    }

    // Premier chargement — loader complet 2s
    let pct = 0;
    const pctEl = document.getElementById('loaderPct');
    const interval = setInterval(() => {
      pct += Math.random() * 18 + 4;
      if (pct >= 100) { pct = 100; clearInterval(interval); }
      if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    }, 120);

    setTimeout(() => {
      sessionStorage.setItem('GM_LOADER_SEEN', '1');
      hideLoader(loader);
    }, 2000);
  }

  function hideLoader(loader) {
    if (!loader) return;
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 600);
  }

  /* ════════════════════════════════
     2. PAGE TRANSITION
  ════════════════════════════════ */
  function initPageTransition() {
    const trans = document.createElement('div');
    trans.id = 'gm-transition';
    trans.innerHTML = '<div class="gm-curtain"></div>';
    document.body.prepend(trans);

    // Exit animation au clic sur les liens internes
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          href.startsWith('https') || link.target === '_blank') return;
      e.preventDefault();
      trans.classList.add('enter');
      setTimeout(() => { window.location.href = href; }, 420);
    });

    // Entry animation
    window.addEventListener('pageshow', () => {
      trans.classList.remove('enter');
      trans.classList.add('exit');
      setTimeout(() => trans.classList.remove('exit'), 500);
    });
  }

  /* ════════════════════════════════
     3. SCROLL REVEAL
  ════════════════════════════════ */
  function initScrollReveal() {
    // Auto-appliquer sr aux éléments clés
    const selectors = [
      '.prod-card',
      '.kpi-card',
      '.ci-card',
      '.form-section',
      '.qc-card',
      '.trust-item',
      '.hero-content',
      '.category-card',
      '.chart-card',
      '.dash-table-card',
      '.reglage-card',
      '.zone-adm-card',
      '.coupon-adm-card',
      '.auth-split',
      '.contact-form-card',
      '.panier-item',
      '.order-card',
    ];

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (el.classList.contains('sr')) return; // déjà tagué
        el.classList.add('sr', 'sr-up');
        const delay = Math.min(i, 5);
        if (delay > 0) el.classList.add(`sr-d${delay}`);
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.sr').forEach(el => observer.observe(el));
  }

  /* ════════════════════════════════
     4. RIPPLE EFFECT (boutons)
  ════════════════════════════════ */
  function initRipple() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-primary, .af-btn-primary, .cf-btn-primary, .btn-adm-primary, .login-btn, .cf-btn-wa');
      if (!btn) return;
      btn.classList.add('ripple-btn');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.classList.add('gm-ripple');
      ripple.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }

  /* ════════════════════════════════
     5. FLYING ITEM (ajout panier)
  ════════════════════════════════ */
  function flyToCart(sourceEl, emoji) {
    const cartIcon = document.querySelector('#cartBadge') || document.querySelector('.haction .fa-bag-shopping');
    if (!cartIcon || !sourceEl) return;

    const src  = sourceEl.getBoundingClientRect();
    const dest = cartIcon.getBoundingClientRect();

    const fly = document.createElement('div');
    fly.className = 'flying-item';
    fly.textContent = emoji || '🛍️';
    fly.style.cssText = `
      left: ${src.left + src.width/2 - 30}px;
      top:  ${src.top  + src.height/2 - 30 + window.scrollY}px;
    `;
    document.body.appendChild(fly);

    const dx = dest.left + dest.width/2  - (src.left + src.width/2);
    const dy = dest.top  + dest.height/2 - (src.top  + src.height/2);

    fly.animate([
      { transform: 'scale(1) translate(0,0)',           opacity: 1 },
      { transform: `scale(.6) translate(${dx*.5}px, ${dy*.3 - 60}px)`, opacity: .9, offset: .4 },
      { transform: `scale(.3) translate(${dx}px, ${dy}px)`, opacity: 0 },
    ], { duration: 700, easing: 'cubic-bezier(.55,.09,.68,.53)' })
      .finished.then(() => fly.remove());

    // Pop le badge
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.classList.remove('badge-pop');
      void badge.offsetWidth;
      badge.classList.add('badge-pop');
      setTimeout(() => badge.classList.remove('badge-pop'), 500);
    }
  }

  window.GMFlyToCart = flyToCart;

  /* ════════════════════════════════
     6. CONFETTIS
  ════════════════════════════════ */
  function launchConfetti(duration = 3000) {
    const canvas = document.createElement('canvas');
    canvas.className = 'gm-confetti-canvas';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const COLORS = ['#f68b1e','#ffb347','#27ae60','#3498db','#e74c3c','#9b59b6','#f1c40f','#ffffff'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 8 + 4,
      d: Math.random() * 6 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 20 - 10,
      tiltAngle: 0,
      tiltSpeed: Math.random() * .1 + .05,
      shape: Math.random() > .5 ? 'circle' : 'rect',
    }));

    let frame;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        } else {
          ctx.rect(p.x - p.r/2, p.y - p.r/2, p.r, p.r * 1.5);
        }
        ctx.fill();
        ctx.restore();
        p.y += p.d;
        p.x += Math.sin(p.tiltAngle) * 2;
        p.tiltAngle += p.tiltSpeed;
        p.tilt = Math.sin(p.tiltAngle) * 12;
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => {
      cancelAnimationFrame(frame);
      canvas.remove();
    }, duration);
  }

  window.GMConfetti = launchConfetti;

  /* ════════════════════════════════
     7. TOAST AMÉLIORÉ
  ════════════════════════════════ */
  function showToast(msg, type = 'default') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.innerHTML = '<i class="fas fa-check-circle"></i><span id="toastMsg"></span>';
      document.body.appendChild(toast);
    }
    const icons = { success: 'fa-check-circle', error: 'fa-circle-xmark', warn: 'fa-triangle-exclamation', info: 'fa-circle-info', default: 'fa-check-circle' };
    const icon = toast.querySelector('i');
    if (icon) icon.className = `fas ${icons[type] || icons.default}`;
    const msgEl = document.getElementById('toastMsg');
    if (msgEl) msgEl.textContent = msg;

    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  window.GMToast = showToast;

  /* ════════════════════════════════
     8. NOTIFICATION POPUP (type Jumia)
  ════════════════════════════════ */
  const FAKE_BUYERS = [
    { name: 'Mamadou D.', city: 'Conakry', item: 'iPhone 15 Pro' },
    { name: 'Aissatou B.', city: 'Kaloum',  item: 'Parfum Versace' },
    { name: 'Ibrahima S.', city: 'Ratoma',  item: 'Samsung Galaxy S24' },
    { name: 'Fatoumata C.', city: 'Matam',  item: 'Nike Air Max' },
    { name: 'Alpha O.', city: 'Dixinn',     item: 'Montre Or 18K' },
    { name: 'Kadiatou T.', city: 'Lambanyi',item: 'Huawei Watch GT4' },
    { name: 'Souleymane K.', city: 'Coleah',item: 'Robe Wax Premium' },
  ];

  function showSocialProof() {
    const buyer = FAKE_BUYERS[Math.floor(Math.random() * FAKE_BUYERS.length)];
    let notif = document.getElementById('gm-social-proof');
    if (!notif) {
      notif = document.createElement('div');
      notif.id = 'gm-social-proof';
      notif.className = 'gm-notif';
      document.body.appendChild(notif);
    }
    notif.innerHTML = `
      <div class="gm-notif-icon">🛒</div>
      <div class="gm-notif-body">
        <strong>${buyer.name} — ${buyer.city}</strong>
        <span>Vient d'acheter : ${buyer.item}</span>
      </div>`;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 4000);
  }

  function initSocialProof() {
    // Afficher après 8s, puis toutes les 25s
    setTimeout(() => {
      showSocialProof();
      setInterval(showSocialProof, 25000);
    }, 8000);
  }

  /* ════════════════════════════════
     9. SKELETON LOADING (grilles)
  ════════════════════════════════ */
  function showSkeletons(container, count = 8) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="sk-card">
        <div class="skeleton sk-img"></div>
        <div class="skeleton sk-title"></div>
        <div class="skeleton sk-price"></div>
        <div class="skeleton sk-tag"></div>
      </div>`).join('');
  }
  window.GMSkeletons = showSkeletons;

  /* ════════════════════════════════
     10. HEART ANIMATION (wishlist)
  ════════════════════════════════ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.card-wish, .wish-btn, [data-wish]');
    if (!btn) return;
    const icon = btn.querySelector('i') || btn;
    icon.classList.remove('heart-beat');
    void icon.offsetWidth;
    icon.classList.add('heart-beat');
    setTimeout(() => icon.classList.remove('heart-beat'), 600);
  });

  /* ════════════════════════════════
     11. COUNTER ANIMATION (chiffres)
  ════════════════════════════════ */
  function animateCounter(el, target, duration = 1500) {
    if (!el) return;
    const start = 0;
    const step  = target / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.round(current).toLocaleString('fr-FR');
    }, 16);
  }
  window.GMCounter = animateCounter;

  /* ════════════════════════════════
     12. INTERCEPT AJOUT PANIER
  ════════════════════════════════ */
  function interceptCartAdds() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-add-cart], .add-cart-btn');
      if (!btn) return;
      const card  = btn.closest('.prod-card');
      const emoji = card?.querySelector('.card-emoji')?.textContent || '🛍️';
      const srcEl = card?.querySelector('.card-img') || btn;
      flyToCart(srcEl, emoji);
    });
  }

  /* ════════════════════════════════
     13. SCROLL PROGRESS BAR
  ════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.style.cssText = `
      position:fixed; top:0; left:0; z-index:99998;
      height:3px; width:0%; background:linear-gradient(90deg,#f68b1e,#ffb347);
      transition:width .1s linear; pointer-events:none;
    `;
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      bar.style.width = Math.min(100, scrolled) + '%';
    }, { passive: true });
  }

  /* ════════════════════════════════
     14. HOVER 3D TILT SUR CARTES
  ════════════════════════════════ */
  function init3DTilt() {
    document.querySelectorAll('.prod-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-8px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform .4s ease';
      });
    });
  }

  /* ════════════════════════════════
     15. CONFETTI SUR CONFIRMATION
  ════════════════════════════════ */
  function watchOrderConfirm() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    const observer = new MutationObserver(() => {
      if (modal.classList.contains('open')) {
        setTimeout(() => launchConfetti(4000), 300);
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  /* ════════════════════════════════
     INIT GLOBAL
  ════════════════════════════════ */
  function init() {
    // Loader sur toutes les pages
    initLoader();

    // Page transition
    initPageTransition();

    // Scroll progress
    initScrollProgress();

    // Ripple
    initRipple();

    // Intercept panier
    interceptCartAdds();

    // Heart wishlist
    // (géré via event delegation au-dessus)

    // Confetti sur confirmation commande
    watchOrderConfirm();

    // Social proof notifications
    initSocialProof();

    // Scroll reveal (après que le DOM soit peint)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initScrollReveal();
        init3DTilt();
      });
    } else {
      initScrollReveal();
      init3DTilt();
      // Re-observer si grille rechargée dynamiquement
      const grid = document.getElementById('prodsGrid') || document.getElementById('cartItems');
      if (grid) {
        const mo = new MutationObserver(() => { initScrollReveal(); init3DTilt(); });
        mo.observe(grid, { childList: true });
      }
    }

    // Resize canvas confetti
    window.addEventListener('resize', () => {
      const canvas = document.querySelector('.gm-confetti-canvas');
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    });
  }

  // Lancer immédiatement pour le loader
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ════════════════════════════════
     API PUBLIQUE
  ════════════════════════════════ */
  window.GalyAnimations = {
    flyToCart,
    confetti:    launchConfetti,
    toast:       showToast,
    skeletons:   showSkeletons,
    counter:     animateCounter,
    socialProof: showSocialProof,
    scrollReveal: initScrollReveal,
  };

})();
