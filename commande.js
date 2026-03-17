/* ═══════════════════════════════════════════
   GALY MARKET — commande.js
   Étape 4 : Panier + Commande
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const $   = id => document.getElementById(id);
  const fmt = n  => n.toLocaleString('fr-FR') + ' GNF';
  const PAGE = window.location.pathname.includes('commande') ? 'commande' : 'panier';

  let cart     = JSON.parse(localStorage.getItem('GM_CART')    || '[]');
  let wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST')|| '[]');
  let coupon   = JSON.parse(localStorage.getItem('GM_COUPON')  || 'null');
  // Lire les prix depuis GM_SETTINGS (modifiables par l'admin)
  function getLivPrix() {
    const s = JSON.parse(localStorage.getItem('GM_SETTINGS') || '{}');
    return {
      'conakry-centre': s.livConakryCentre  || 0,
      'conakry-periph': s.livConakryPeriph  || 25000,
      'basse':          s.livBasse          || 50000,
      'moyen':          s.livMoyen          || 50000,
      'haute':          s.livHaute          || 70000,
      'forestiere':     s.livForestiere     || 80000,
    };
  }
  let selectedZone = { zone: 'conakry-centre', price: getLivPrix()['conakry-centre'], delay: '24h' };
  let selectedPay  = 'cash';

  const saveCart   = () => localStorage.setItem('GM_CART',   JSON.stringify(cart));
  const saveCoupon = () => localStorage.setItem('GM_COUPON', JSON.stringify(coupon));

  const COUPONS = {
    'GALY10':   { type: 'percent',  value: 10,    label: '10% de réduction' },
    'GALY20':   { type: 'percent',  value: 20,    label: '20% de réduction' },
    'BIENVENUE':{ type: 'percent',  value: 15,    label: '15% — Bienvenue !' },
    'PROMO50K': { type: 'fixed',    value: 50000, label: '50 000 GNF offerts' },
    'LIVRAISON':{ type: 'delivery', value: 0,     label: 'Livraison offerte' },
  };

  function getSubtotal() { return cart.reduce((a,i) => a + i.price * i.qty, 0); }
  function getDiscount(sub) {
    if (!coupon) return 0;
    const c = COUPONS[coupon]; if (!c) return 0;
    if (c.type === 'percent')  return Math.round(sub * c.value / 100);
    if (c.type === 'fixed')    return Math.min(c.value, sub);
    if (c.type === 'delivery') return selectedZone.price;
    return 0;
  }
  function getDelivery() {
    if (coupon && COUPONS[coupon]?.type === 'delivery') return 0;
    if (getSubtotal() >= 2000000) return 0;
    return selectedZone.price;
  }
  function getTotal() {
    return Math.max(0, getSubtotal() - getDiscount(getSubtotal()) + getDelivery());
  }

  /* ──────────────────────────────
     PAGE PANIER
  ────────────────────────────── */
  if (PAGE === 'panier') {

    function renderPanier() {
      const items = $('cartItems'), empty = $('panierEmpty'), cb = $('couponBlock');
      if (!items) return;
      if (!cart.length) {
        items.innerHTML = '';
        if (empty) empty.style.display = 'block';
        if (cb) cb.style.display = 'none';
        renderSummaryP(); return;
      }
      if (empty) empty.style.display = 'none';
      if (cb) cb.style.display = 'block';
      const catMap = (typeof GM_CATS !== 'undefined') ? GM_CATS : {};
      items.innerHTML = cart.map(item => {
        const prod = (typeof GM_PRODUCTS !== 'undefined') ? GM_PRODUCTS.find(p => p.id === item.id) : null;
        const cat  = catMap[prod?.cat]?.label || '';
        const old  = prod?.old;
        const saving = old ? (old - item.price) * item.qty : 0;
        return `<div class="panier-item">
          <div class="pi-img">${item.img ? `<img src="${item.img}" onerror="this.style.display='none'">` : item.em}</div>
          <div class="pi-details">
            ${cat ? `<div class="pi-cat">${cat}</div>` : ''}
            <div class="pi-name"><a href="produit.html?id=${item.id}">${item.name}</a></div>
            <div class="pi-price-row">
              <span class="pi-price">${fmt(item.price)}</span>
              ${old ? `<span class="pi-old">${fmt(old)}</span>` : ''}
              ${saving > 0 ? `<span class="pi-saving">Éco. ${fmt(saving)}</span>` : ''}
            </div>
            <div class="pi-qty-ctrl">
              <button class="pi-qty-btn" onclick="pQty(${item.id},-1)"><i class="fas fa-minus"></i></button>
              <span class="pi-qty-val">${item.qty}</span>
              <button class="pi-qty-btn" onclick="pQty(${item.id},+1)"><i class="fas fa-plus"></i></button>
            </div>
          </div>
          <div class="pi-total-col">
            <div class="pi-total">${fmt(item.price * item.qty)}</div>
            <button class="pi-del-btn" onclick="pDel(${item.id})"><i class="fas fa-times"></i></button>
          </div>
        </div>`;
      }).join('');
      renderSummaryP();
    }

    function renderSummaryP() {
      const sub  = getSubtotal();
      const disc = getDiscount(sub);
      const del  = getDelivery();
      const total= getTotal();
      const qty  = cart.reduce((a,i) => a+i.qty, 0);

      if ($('bcCount'))    $('bcCount').textContent    = `${qty} article${qty>1?'s':''}`;
      if ($('cartBadge'))  $('cartBadge').textContent  = qty > 0 ? qty : '';
      if ($('wishBadge'))  $('wishBadge').textContent  = wishlist.length > 0 ? wishlist.length : '';
      if ($('sumSubtotal'))$('sumSubtotal').textContent= fmt(sub);
      const dr = $('discountRow');
      if (dr) dr.style.display = disc > 0 ? 'flex' : 'none';
      if ($('sumDiscount'))$('sumDiscount').textContent= `− ${fmt(disc)}`;
      if ($('sumDelivery'))$('sumDelivery').textContent= del === 0 ? 'Gratuit ✓' : fmt(del);

      // Économies barré
      const orig = (typeof GM_PRODUCTS !== 'undefined')
        ? cart.reduce((a,i)=>{ const p=GM_PRODUCTS.find(x=>x.id===i.id); return a+(p?.old||i.price)*i.qty; }, 0) : sub;
      const savRow = $('savingRow');
      if (savRow) savRow.style.display = (orig-sub) > 0 ? 'flex' : 'none';
      if ($('sumSaving')) $('sumSaving').textContent = `${fmt(orig-sub)} économisés`;
      if ($('sumTotal'))  $('sumTotal').textContent  = fmt(total);

      // Barre livraison gratuite
      const FREE = 2000000;
      const fill = $('fdbFill'), txt = $('fdbText'), amt = $('fdbAmt');
      if (fill) {
        if (sub >= FREE) {
          if (txt) txt.innerHTML = '🎉 <strong>Livraison offerte</strong> pour cette commande !';
          fill.style.width = '100%';
        } else {
          if (amt) amt.textContent = fmt(FREE - sub);
          fill.style.width = `${Math.min(100, sub/FREE*100)}%`;
        }
      }

      const btn = $('btnCheckout');
      if (btn) { btn.style.opacity = cart.length ? '1' : '.4'; btn.style.pointerEvents = cart.length ? 'auto' : 'none'; }
    }

    window.pQty = (id, d) => {
      const it = cart.find(i => i.id === id); if (!it) return;
      it.qty += d;
      if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
      saveCart(); renderPanier();
    };
    window.pDel = (id) => {
      cart = cart.filter(i => i.id !== id);
      saveCart(); renderPanier(); showToast('🗑️ Article retiré');
    };

    $('clearCart')?.addEventListener('click', () => {
      if (confirm('Vider tout le panier ?')) { cart = []; saveCart(); renderPanier(); showToast('🗑️ Panier vidé'); }
    });

    if (coupon && $('couponInput')) { $('couponInput').value = coupon; showCouponMsg(true); }
    $('applyCoupon')?.addEventListener('click', applyCoupon);
    $('couponInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyCoupon(); });

    renderPanier();
  }

  /* ──────────────────────────────
     PAGE COMMANDE
  ────────────────────────────── */
  if (PAGE === 'commande') {

    function renderMiniCart() {
      const mc = $('miniCart'); if (!mc) return;
      mc.innerHTML = cart.length
        ? cart.map(it => `<div class="mc-item">
            <div class="mc-img">${it.img ? `<img src="${it.img}" onerror="this.style.display='none'">` : it.em}</div>
            <div class="mc-info"><div class="mc-name">${it.name}</div><div class="mc-qty">× ${it.qty}</div></div>
            <div class="mc-price">${fmt(it.price * it.qty)}</div>
          </div>`).join('')
        : '<p style="text-align:center;color:var(--muted);font-size:13px;padding:12px 0">Panier vide</p>';
    }

    function renderSummaryCmd() {
      const sub  = getSubtotal();
      const disc = getDiscount(sub);
      const del  = getDelivery();
      const total= getTotal();
      const qty  = cart.reduce((a,i)=>a+i.qty,0);
      if ($('cartBadge'))  $('cartBadge').textContent  = qty > 0 ? qty : '';
      if ($('sumSubtotal'))$('sumSubtotal').textContent = fmt(sub);
      const dr = $('discountRow'); if (dr) dr.style.display = disc > 0 ? 'flex' : 'none';
      if ($('sumDiscount'))$('sumDiscount').textContent = `− ${fmt(disc)}`;
      if ($('sumDelivery'))$('sumDelivery').textContent = del === 0 ? 'Gratuit ✓' : fmt(del);
      if ($('sumTotal'))   $('sumTotal').textContent    = fmt(total);
    }

    function bindZoneCards() {
      document.querySelectorAll('.zone-card').forEach(card => {
        card.addEventListener('click', () => {
          // Retirer active uniquement dans la même grille
          card.closest('.zones-grid').querySelectorAll('.zone-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          selectedZone = { zone: card.dataset.zone, price: parseInt(card.dataset.price), delay: card.dataset.delay };
          renderSummaryCmd();
        });
      });
    }
    bindZoneCards();

    // Gestion sélection quartier / hors Conakry
    window.onQuartierChange = function(val) {
      const blocConakry = document.getElementById('blocConakry');
      const blocHors    = document.getElementById('blocHors');
      const pmCash      = document.getElementById('pmCash');
      const pmWhatsapp  = document.getElementById('pmWhatsapp');
      if (!blocConakry || !blocHors) return;

      if (val === 'hors-conakry') {
        // Afficher bloc hors Conakry
        blocConakry.style.display = 'none';
        blocHors.style.display    = '';

        // Zone par défaut : première carte hors Conakry
        selectedZone = { zone: 'conakry-periph', price: getLivPrix()['conakry-periph'], delay: '24-48h' };
        blocHors.querySelectorAll('.zone-card').forEach(c => c.classList.remove('active'));
        const firstCard = blocHors.querySelector('.zone-card');
        if (firstCard) firstCard.classList.add('active');

        // Masquer "Paiement à la livraison" + "WhatsApp", basculer sur Orange Money
        if (pmCash)     pmCash.style.display     = 'none';
        if (pmWhatsapp) pmWhatsapp.style.display  = 'none';
        if (selectedPay === 'cash' || selectedPay === 'whatsapp') {
          selectedPay = 'orange';
          document.querySelectorAll('.pm-card').forEach(c => c.classList.remove('active'));
          const pmOrange = document.querySelector('[data-pm="orange"]');
          if (pmOrange) {
            pmOrange.classList.add('active');
            const radio = pmOrange.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
          }
        }

      } else {
        // Retour Conakry
        blocConakry.style.display = '';
        blocHors.style.display    = 'none';
        selectedZone = { zone: 'conakry-centre', price: getLivPrix()['conakry-centre'], delay: '24h' };
        blocConakry.querySelectorAll('.zone-card').forEach(c => c.classList.remove('active'));
        const firstCard = blocConakry.querySelector('.zone-card');
        if (firstCard) firstCard.classList.add('active');

        // Réafficher "Paiement à la livraison" + "WhatsApp" + resélectionner cash
        if (pmCash) {
          pmCash.style.display = '';
          selectedPay = 'cash';
          document.querySelectorAll('.pm-card').forEach(c => c.classList.remove('active'));
          pmCash.classList.add('active');
          const radio = pmCash.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        }
        if (pmWhatsapp) pmWhatsapp.style.display = '';
      }
      renderSummaryCmd();
      bindZoneCards();
    };

    // ── CONFIRMER COMMANDE ──
    $('btnConfirm')?.addEventListener('click', () => {
      const prenom  = $('fPrenom')?.value.trim();
      const nom     = $('fNom')?.value.trim();
      const cc      = $('fCountryCode')?.value || '+224';
      const tel     = $('fTel')?.value.trim();
      const adresse = $('fAdresse')?.value.trim() || '';
      const ville   = $('fVille')?.value.trim() || selectedZone?.zone || 'Conakry';

      if (!prenom || !nom) { showToast('⚠️ Veuillez entrer votre prénom et nom.'); return; }
      if (!tel || tel.length < 6) { showToast('⚠️ Veuillez entrer un numéro de téléphone valide.'); return; }
      if (!selectedZone) { showToast('⚠️ Veuillez choisir une zone de livraison.'); return; }
      if (cart.length === 0) { showToast('⚠️ Votre panier est vide.'); return; }

      const order = {
        ref: 'GM-' + Date.now(),
        date: new Date().toLocaleDateString('fr-FR'),
        client: { prenom, nom, tel: cc + ' ' + tel },
        adresse: { adresse, ville },
        zone: selectedZone,
        payment: selectedPay || 'cash',
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal: getSubtotal(),
        discount: getDiscount(getSubtotal()),
        delivery: getDelivery(),
        total: getTotal(),
        status: 'en_attente',
        coupon: coupon || null,
      };

        orders.unshift(order); localStorage.setItem('GM_ORDERS', JSON.stringify(orders));
      cart = []; saveCart(); coupon = null; saveCoupon();
      // ✅ POINTS FIDÉLITÉ
      ajouterPointsFidelite(order);
      // ✅ NOTIF WHATSAPP AUTO
      envoyerNotifWhatsAppAuto(order, { orange:'Orange Money', mtn:'MTN Money', kulu:'KULU', wave:'Mastercard', cash:'Paiement livraison', whatsapp:'Via WhatsApp' });
      openModal(order);
    });
  }

  function openModal(o) {
    const PAY = { orange:'Orange Money', mtn:'MTN Money', wave:'Mastercard', cash:'Paiement à la livraison', whatsapp:'Via WhatsApp' };
    if ($('cmName'))  $('cmName').textContent  = `${o.client.prenom} ${o.client.nom}`;
    if ($('cmRef'))   $('cmRef').textContent   = o.ref;
    if ($('cmDelay')) $('cmDelay').textContent = o.zone.delay + ' après confirmation';
    if ($('cmTel'))   $('cmTel').textContent   = o.client.tel;
    if ($('cmAddr'))  $('cmAddr').textContent  = `${o.adresse.adresse}, ${o.adresse.ville}`;
    if ($('cmPay'))   $('cmPay').textContent   = PAY[o.payment] || o.payment;
    if ($('cmTotal')) $('cmTotal').textContent = fmt(o.total);
    $('confirmModal')?.classList.add('open');
    // ✅ WHATSAPP AUTOMATIQUE
    setTimeout(() => envoyerNotifWhatsAppAuto(o, PAY), 800);
    $('cmWhatsapp')?.addEventListener('click', () => {
      const items = o.items.map(i=>`• ${i.name} ×${i.qty} = ${fmt(i.price*i.qty)}`).join('\n');
      const msg = `*Commande Galy Market*\n\nRéf: ${o.ref}\nClient: ${o.client.prenom} ${o.client.nom}\nTél: ${o.client.tel}\nAdresse: ${o.adresse.adresse}, ${o.adresse.ville}\nPaiement: ${PAY[o.payment]}\n\n*Articles:*\n${items}\n\n*Total: ${fmt(o.total)}*`;
      const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
      const waNum = (s.shopWa||'+224627900578').replace(/[^0-9]/g,'');
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
    }, { once: true });
  }

  /* ── TOAST ── */
  function showToast(msg) {
    const t = $('toast'), m = $('toastMsg'); if (!t||!m) return;
    m.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── HEADER & BURGER ── */
  window.addEventListener('scroll', () => { $('header')?.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true });
  const burger=$('burger'), mMenu=$('mobileMenu'), mOv=$('mobileOverlay'), mClose=$('mobileClose');
  burger?.addEventListener('click', ()=>{ burger.classList.add('open'); mMenu?.classList.add('open'); mOv?.classList.add('open'); });
  [mClose,mOv].forEach(el=>el?.addEventListener('click',()=>{ burger?.classList.remove('open'); mMenu?.classList.remove('open'); mOv?.classList.remove('open'); }));
  document.addEventListener('keydown', e => { if (e.key==='Escape') $('confirmModal')?.classList.remove('open'); });
});


  // ══════════════════════════════════════════
  //  WHATSAPP AUTOMATIQUE — NOTIFICATION
  // ══════════════════════════════════════════
  function envoyerNotifWhatsAppAuto(o, PAY) {
    const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
    const waNum = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');
    const items = o.items.map(i=>`• ${i.name} ×${i.qty} = ${fmt(i.price*i.qty)}`).join('\n');
    const pts = Math.floor(o.total / 1000);
    const msg = `🛍️ *NOUVELLE COMMANDE — GALY MARKET*

📋 Réf: *${o.ref}*
👤 Client: *${o.client.prenom} ${o.client.nom}*
📞 Tél: *${o.client.tel}*
📍 Adresse: ${o.adresse?.adresse||''}, ${o.adresse?.ville||''}
💳 Paiement: ${PAY[o.payment]||o.payment}

🛒 *Articles commandés:*
${items}

💰 *TOTAL: ${fmt(o.total)}*
🎁 Points fidélité client: +${pts} pts

✅ Merci de confirmer la commande !`;
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ══════════════════════════════════════════
  //  SYSTÈME FIDÉLITÉ — POINTS & NIVEAUX
  // ══════════════════════════════════════════
  function getFidelite() {
    return JSON.parse(localStorage.getItem('GM_FIDELITE')||'{"points":0,"total_depense":0,"niveau":"Bronze","historique":[]}');
  }
  function saveFidelite(f) {
    localStorage.setItem('GM_FIDELITE', JSON.stringify(f));
  }

  function ajouterPointsFidelite(order) {
    const f = getFidelite();
    const pts = Math.floor(order.total / 1000); // 1 point par 1000 GNF
    f.points += pts;
    f.total_depense += order.total;
    // Calcul niveau
    if (f.total_depense >= 5000000)      f.niveau = 'Or';
    else if (f.total_depense >= 2000000) f.niveau = 'Argent';
    else                                  f.niveau = 'Bronze';
    // Historique
    f.historique.unshift({
      date: new Date().toISOString(),
      ref: order.ref,
      montant: order.total,
      points: pts,
      type: 'gain'
    });
    saveFidelite(f);
    // Afficher notification fidélité
    afficherNotifFidelite(pts, f);
  }

  function afficherNotifFidelite(pts, f) {
    // Créer notification visuelle
    const notif = document.createElement('div');
    const niveauEmoji = {Bronze:'🥉', Argent:'🥈', Or:'🥇'}[f.niveau] || '🥉';
    notif.innerHTML = `
      <div style="position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
        background:linear-gradient(135deg,#f68b1e,#e07b0e);color:#fff;
        padding:16px 24px;border-radius:16px;z-index:99999;text-align:center;
        box-shadow:0 8px 32px rgba(246,139,30,.4);animation:slideUpFid .4s ease;
        min-width:260px">
        <div style="font-size:24px;margin-bottom:4px">🎉 +${pts} points gagnés !</div>
        <div style="font-size:13px;opacity:.9">Total: <strong>${f.points} pts</strong> · Niveau: ${niveauEmoji} <strong>${f.niveau}</strong></div>
      </div>`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
  }

  // CSS animation fidélité
  if (!document.getElementById('fidelite-css')) {
    const style = document.createElement('style');
    style.id = 'fidelite-css';
    style.textContent = `
      @keyframes slideUpFid {
        from { opacity:0; transform:translateX(-50%) translateY(20px); }
        to   { opacity:1; transform:translateX(-50%) translateY(0); }
      }`;
    document.head.appendChild(style);
  }
