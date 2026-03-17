/* ═══════════════════════════════════════════
   GALY MARKET — admin.js
   Étape 5 : Panneau d'administration
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('fr-FR') + ' GNF';

  /* ══════════════════════
     AUTH
  ══════════════════════ */
  // ═══ AUTH SYSTÈME ═══
  const SUPER_ADMIN = { user: 'admin', pass: 'admin2025' };
  const AUTH_KEY    = 'GM_ADMIN_AUTH';
  const AUTH_ROLE   = 'GM_ADMIN_ROLE';

  // ── Utiliser sessionStorage → déconnexion auto à la fermeture ──
  function getAdmins() {
    const s = JSON.parse(localStorage.getItem('GM_SETTINGS') || '{}');
    const admins = [{ user: SUPER_ADMIN.user, pass: s.adminMdp || SUPER_ADMIN.pass, role: 'super', perms: ['all'] }];
    const assoc = s.adminAssocies || [];
    assoc.forEach(a => admins.push(a));
    return admins;
  }

  function checkAuth() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  }

  function getCurrentRole() {
    return sessionStorage.getItem(AUTH_ROLE) || 'super';
  }

  function isSuperAdmin() {
    return getCurrentRole() === 'super';
  }

  function login() {
    const u = $('loginUser')?.value.trim();
    const p = $('loginPass')?.value.trim();
    const admins = getAdmins();
    const found = admins.find(a => a.user === u && a.pass === p);
    if (found) {
      // sessionStorage — effacé automatiquement à la fermeture
      sessionStorage.setItem(AUTH_KEY, '1');
      sessionStorage.setItem(AUTH_ROLE, found.role);
      // Nettoyer l'ancien localStorage au cas où
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('GM_ADMIN_ROLE');
      $('adminLogin').style.display = 'none';
      $('adminPanel').style.display = 'flex';
      if (found.role !== 'super') {
        const empNav = document.querySelector('[data-tab="employes"]');
        if (empNav) empNav.style.display = 'none';
      }
      renderAll();
    } else {
      const err = $('loginErr');
      if (err) { err.textContent = '❌ Identifiants incorrects.'; }
    }
  }

  // Déconnexion auto si l'utilisateur revient sur admin depuis une autre page
  // et que la session sessionStorage est vide
  if (checkAuth()) {
    $('adminLogin').style.display = 'none';
    $('adminPanel').style.display = 'flex';
    renderAll();
  } else {
    // Nettoyer localStorage si quelqu'un avait une ancienne session
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('GM_ADMIN_ROLE');
  }

  // Déconnexion automatique si l'onglet perd le focus (navigation vers autre page)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // On garde la session active tant que l'onglet est ouvert
      // sessionStorage s'efface automatiquement à la fermeture
    }
  });

  // Déconnexion si on quitte la page admin
  window.addEventListener('beforeunload', () => {
    // sessionStorage se nettoie auto — rien à faire
    // Mais on force la déco si navigation vers autre page
  });

  $('loginBtn')?.addEventListener('click', login);
  $('loginUser')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('loginPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('lfeye')?.addEventListener('click', () => {
    const inp = $('loginPass');
    const ic  = $('lfeye').querySelector('i');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    ic.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  });
  $('admLogout')?.addEventListener('click', () => {
    deconnecterAdmin();
  });

  window.deconnecterAdmin = function() {
    if (confirm('Voulez-vous vous déconnecter ?')) {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_ROLE);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('GM_ADMIN_ROLE');
      location.href = 'admin.html';
    }
  };

  window.voirBoutiqueEtDeconnecter = function() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_ROLE);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('GM_ADMIN_ROLE');
    location.href = 'index.html';
  };

  /* ══════════════════════
     DATA
  ══════════════════════ */
  function getOrders()  { return JSON.parse(localStorage.getItem('GM_ORDERS') || '[]'); }
  function saveOrders(o){ localStorage.setItem('GM_ORDERS', JSON.stringify(o)); }

  // Produits : système illimité — localStorage en priorité + produits de base
  const GM_CUSTOM_KEY = 'GM_CUSTOM_PRODUCTS';
  const GM_DELETED_KEY = 'GM_DELETED_PRODUCTS';
  const GM_OVERRIDES_KEY = 'GM_PROD_OVERRIDES';

  function getProds() {
    // Produits de base (products.js) avec overrides appliqués
    const overrides = JSON.parse(localStorage.getItem(GM_OVERRIDES_KEY) || '{}');
    const deleted   = JSON.parse(localStorage.getItem(GM_DELETED_KEY)  || '[]');
    const base = (typeof GM_PRODUCTS !== 'undefined' ? GM_PRODUCTS : [])
      .filter(p => !deleted.includes(String(p.id)))
      .map(p => ({ ...p, ...(overrides[p.id] || {}) }));
    // Produits personnalisés ajoutés via l'admin (illimité)
    const custom = JSON.parse(localStorage.getItem(GM_CUSTOM_KEY) || '[]');
    return [...base, ...custom];
  }

  function saveProdOverride(p) {
    const isCustom = String(p.id).startsWith('gm');
    if (isCustom) {
      // Mettre à jour dans les custom
      const custom = JSON.parse(localStorage.getItem(GM_CUSTOM_KEY) || '[]');
      const idx = custom.findIndex(x => String(x.id) === String(p.id));
      if (idx >= 0) custom[idx] = p; else custom.push(p);
      localStorage.setItem(GM_CUSTOM_KEY, JSON.stringify(custom));
    } else {
      // Override produit de base
      const ov = JSON.parse(localStorage.getItem(GM_OVERRIDES_KEY) || '{}');
      ov[p.id] = p;
      localStorage.setItem(GM_OVERRIDES_KEY, JSON.stringify(ov));
    }
  }

  function deleteProd(id) {
    const isCustom = String(id).startsWith('gm');
    if (isCustom) {
      let custom = JSON.parse(localStorage.getItem(GM_CUSTOM_KEY) || '[]');
      custom = custom.filter(p => String(p.id) !== String(id));
      localStorage.setItem(GM_CUSTOM_KEY, JSON.stringify(custom));
    } else {
      const deleted = JSON.parse(localStorage.getItem(GM_DELETED_KEY) || '[]');
      if (!deleted.includes(String(id))) deleted.push(String(id));
      localStorage.setItem(GM_DELETED_KEY, JSON.stringify(deleted));
    }
  }

  function newProdId() {
    return 'gm' + Date.now();
  }

  // Coupons
  const DEFAULT_COUPONS = {
    'GALY10':    { type:'percent',  value:10,    label:'10% de réduction',       active:true },
    'GALY20':    { type:'percent',  value:20,    label:'20% de réduction',       active:true },
    'BIENVENUE': { type:'percent',  value:15,    label:'15% — Bienvenue !',      active:true },
    'PROMO50K':  { type:'fixed',    value:50000, label:'50 000 GNF offerts',     active:true },
    'LIVRAISON': { type:'delivery', value:0,     label:'Livraison offerte',      active:true },
  };
  function getCoupons() {
    return JSON.parse(localStorage.getItem('GM_ADMIN_COUPONS') || JSON.stringify(DEFAULT_COUPONS));
  }

  // Zones
  const DEFAULT_ZONES = [
    { id:'conakry-centre',     name:'Conakry Centre',     price:0,      delay:'24h'      },
    { id:'conakry-periph',     name:'Conakry Périphérie', price:50000,  delay:'24-48h'   },
    { id:'basse-guinee',       name:'Basse Guinée',       price:100000, delay:'2-3 jours'},
    { id:'haute-guinee',       name:'Haute Guinée',       price:150000, delay:'3-5 jours'},
    { id:'guinee-forestiere',  name:'Guinée Forestière',  price:150000, delay:'3-5 jours'},
    { id:'moyenne-guinee',     name:'Moyenne Guinée',     price:150000, delay:'3-5 jours'},
  ];

  /* ══════════════════════
     NAVIGATION TABS
  ══════════════════════ */
  document.querySelectorAll('.adm-link[data-tab]').forEach(link => {
    // touchstart pour mobile — réaction instantanée
    link.addEventListener('touchstart', e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    }, { passive: false });
    // click pour desktop
    link.addEventListener('click', e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  window.switchTab = function(tab) {
    // Changement visuel immédiat
    document.querySelectorAll('.adm-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const link = document.querySelector(`.adm-link[data-tab="${tab}"]`);
    if (link) link.classList.add('active');
    $(`tab-${tab}`)?.classList.add('active');
    const titles = {
      dashboard:'Dashboard', commandes:'Commandes', produits:'Produits',
      coupons:'Coupons', clients:'Clients', livraison:'Livraison',
      reglages:'Réglages', marketing:'Marketing', employes:'Employés',
      affiliation:'Affiliation', vendeurs:'Vendeurs', annonces:'Annonces',
      abonnements:'Abonnements', fidelite:'Fidélité', moderation:'Modération'
    };
    if ($('tabTitle')) $('tabTitle').textContent = titles[tab] || tab;
    // Fermer sidebar mobile
    closeAdmSidebar();
    // Render on switch
    if (tab === 'commandes')  renderCommandes();
    if (tab === 'produits')   renderProduits();
    if (tab === 'coupons')    renderCoupons();
    if (tab === 'clients')    renderClients();
    if (tab === 'livraison')  renderLivraison();
    if (tab === 'marketing')  { if (typeof mktInit === 'function') mktInit(); }
    if (tab === 'affiliation'){ if (typeof renderAffiliation === 'function') renderAffiliation(); }
    if (tab === 'boosts')     { renderBoosts(); }
    if (tab === 'vendeurs')   { if (typeof renderVendeurs === 'function') renderVendeurs(); }
    if (tab === 'annonces')   { if (typeof renderAdminAnnonces === 'function') renderAdminAnnonces(); }
    if (tab === 'abonnements'){ if (typeof renderAbonnements === 'function') renderAbonnements(); }
  };

  /* ══════════════════════
     RENDER ALL
  ══════════════════════ */
  window.renderAll = function() {
    renderDashboard();
    renderCommandes();
    renderProduits();
    renderCoupons();
    renderClients();
    renderLivraison();
    // Affiliation et vendeurs (définis dans admin.html inline)
    if (typeof renderAffiliation === 'function') renderAffiliation();
    if (typeof renderVendeurs === 'function') renderVendeurs();
    if (typeof renderFidelite === 'function') renderFidelite();
    if (typeof renderAdminAnnonces === 'function') renderAdminAnnonces();
    if (typeof renderAdminAbonnements === 'function') renderAdminAbonnements();
    if (typeof renderModeration === 'function') renderModeration();
  };

  /* ══════════════════════
     DASHBOARD
  ══════════════════════ */
  function renderDashboard() {
    // Date
    const now = new Date();
    if ($('admDate')) $('admDate').textContent = now.toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    const orders = getOrders();
    const ca     = orders.reduce((a, o) => a + (o.total || 0), 0);
    const clients = [...new Set(orders.map(o => o.client?.tel))].length;

    if ($('kpiCA'))      $('kpiCA').textContent      = fmt(ca);
    if ($('kpiOrders'))  $('kpiOrders').textContent  = orders.length;
    if ($('kpiClients')) $('kpiClients').textContent = clients;
    if ($('nbCommandes'))$('nbCommandes').textContent= orders.filter(o => !o.status || o.status === 'nouvelle').length || '';

    // Dernières commandes
    const dc = $('dashOrders');
    if (dc) {
      if (!orders.length) {
        dc.innerHTML = '<div style="padding:20px;text-align:center;color:var(--adm-muted);font-size:13px">Aucune commande pour l\'instant</div>';
      } else {
        dc.innerHTML = orders.slice(0,5).map(o => `
          <div class="dash-order-row">
            <span class="dor-ref">${o.ref}</span>
            <span class="dor-client">${o.client?.prenom} ${o.client?.nom}</span>
            <span class="dor-total">${fmt(o.total)}</span>
            <span class="dor-status">${statusPill(o.status || 'nouvelle')}</span>
          </div>`).join('');
      }
    }

    // Top produits
    const tp = $('dashTopProds');
    if (tp) {
      const prods = getProds().slice(0, 5);
      tp.innerHTML = prods.map(p => `
        <div class="dash-prod-row">
          <span class="dpr-em">${p.em}</span>
          <span class="dpr-name">${p.name}</span>
          <span class="dpr-price">${fmt(p.price)}</span>
        </div>`).join('');
    }

    // Charts
    drawCharts(orders);
  }

  /* ══════════════════════
     CHARTS (Canvas)
  ══════════════════════ */
  function drawCharts(orders) {
    drawSalesChart(orders);
    drawCatChart();
  }

  function drawSalesChart(orders) {
    const canvas = $('salesChart'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const days = 7;
    const labels = [];
    const data   = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric' }));
      const dayOrders = orders.filter(o => {
        const od = new Date(o.date);
        return od.toDateString() === d.toDateString();
      });
      data.push(dayOrders.reduce((a, o) => a + (o.total || 0), 0));
    }

    // Simple canvas bar chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.offsetWidth || 600, H = 180;
    canvas.width = W; canvas.height = H;
    const max = Math.max(...data, 1);
    const barW = (W / days) * 0.55;
    const gap  = (W / days) * 0.45;

    data.forEach((val, i) => {
      const x = i * (W / days) + gap / 2;
      const barH = (val / max) * (H - 44);
      const y = H - barH - 30;

      // Bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, H - 30);
      grad.addColorStop(0, '#f68b1e');
      grad.addColorStop(1, 'rgba(246,139,30,.2)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();

      // Label day
      ctx.fillStyle = '#8a7a6a';
      ctx.font = '11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, H - 8);

      // Value
      if (val > 0) {
        ctx.fillStyle = '#1a1206';
        ctx.font = 'bold 10px DM Sans, sans-serif';
        ctx.fillText(val >= 1000000 ? (val/1000000).toFixed(1)+'M' : val >= 1000 ? (val/1000).toFixed(0)+'K' : val, x + barW / 2, y - 4);
      }
    });
  }

  function drawCatChart() {
    const canvas = $('catChart'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prods = getProds();
    const cats = {};
    prods.forEach(p => { cats[p.cat] = (cats[p.cat] || 0) + 1; });
    const labels = Object.keys(cats).map(c => (GM_CATS?.[c]?.label || c).split(' ')[0]);
    const data   = Object.values(cats);
    const colors = ['#f68b1e','#27ae60','#3498db','#9b59b6','#e74c3c','#f1c40f'];

    const W = canvas.offsetWidth || 280, H = 200;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2 - 10, R = Math.min(cx, cy) - 20;
    const total = data.reduce((a,b) => a+b, 0);
    let start = -Math.PI / 2;

    data.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const midAngle = start + slice / 2;
      const lx = cx + Math.cos(midAngle) * (R * 0.65);
      const ly = cy + Math.sin(midAngle) * (R * 0.65);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, lx, ly + 4);

      start += slice;
    });

    // Legend
    ctx.font = '11px DM Sans, sans-serif';
    labels.forEach((lb, i) => {
      const lx = (i % 3) * (W / 3) + 10;
      const ly = H - 28 + Math.floor(i / 3) * 14;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(lx, ly, 10, 10);
      ctx.fillStyle = '#8a7a6a';
      ctx.textAlign = 'left';
      ctx.fillText(lb, lx + 14, ly + 9);
    });
  }

  /* ══════════════════════
     COMMANDES
  ══════════════════════ */
  function renderCommandes(filter = '') {
    let orders = getOrders();
    if (filter) orders = orders.filter(o => (o.status || 'nouvelle') === filter);
    const tbody = $('ordersTbody'), empty = $('ordersEmpty');
    if (!tbody) return;
    if (!orders.length) {
      tbody.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    tbody.innerHTML = orders.map((o, i) => `
      <tr>
        <td><strong style="color:var(--adm-gold)">${o.ref}</strong></td>
        <td><div>${o.client?.prenom} ${o.client?.nom}</div><div style="font-size:11px;color:var(--adm-muted)">${o.client?.tel}</div></td>
        <td>${o.items?.length || 0} article${(o.items?.length || 0) > 1 ? 's' : ''}</td>
        <td><strong style="font-family:'Cormorant Garamond',serif;font-size:15px">${fmt(o.total)}</strong></td>
        <td>${o.zone?.zone || '—'}</td>
        <td>${o.payment || '—'}</td>
        <td>${statusPill(o.status || 'nouvelle')}</td>
        <td style="font-size:12px;color:var(--adm-muted)">${new Date(o.date).toLocaleDateString('fr-FR')}</td>
        <td>
          <button class="tbl-btn" onclick="openOrderModal(${i})" title="Voir"><i class="fas fa-eye"></i></button>
          <button class="tbl-btn" onclick="whatsappOrder(${i})" title="WhatsApp"><i class="fab fa-whatsapp" style="color:#25d366"></i></button>
          <button class="tbl-btn danger" onclick="deleteOrder(${i})" title="Supprimer"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');
  }

  $('filterStatus')?.addEventListener('change', e => renderCommandes(e.target.value));
  $('exportOrders')?.addEventListener('click', exportOrders);

  window.deleteOrder = function(i) {
    if (!confirm('Supprimer cette commande ?')) return;
    const orders = getOrders(); orders.splice(i, 1); saveOrders(orders);
    renderCommandes(); renderDashboard();
    showToastAdm('🗑️ Commande supprimée');
  };

  window.whatsappOrder = function(i) {
    const o = getOrders()[i]; if (!o) return;
    const items = o.items.map(it => `• ${it.name} ×${it.qty} = ${fmt(it.price*it.qty)}`).join('\n');
    const msg = `*Commande Galy Market*\nRéf: ${o.ref}\nClient: ${o.client?.prenom} ${o.client?.nom}\nTél: ${o.client?.tel}\nAdresse: ${o.adresse?.adresse}, ${o.adresse?.ville}\n\nArticles:\n${items}\n\nTotal: ${fmt(o.total)}`;
    window.open(`https://wa.me/224620000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  function exportOrders() {
    const orders = getOrders();
    if (!orders.length) { showToastAdm('⚠️ Aucune commande à exporter'); return; }
    const rows = [['Réf','Prénom','Nom','Téléphone','Ville','Adresse','Zone','Paiement','Statut','Total','Date']];
    orders.forEach(o => rows.push([
      o.ref, o.client?.prenom, o.client?.nom, o.client?.tel,
      o.adresse?.ville, o.adresse?.adresse, o.zone?.zone,
      o.payment, o.status || 'nouvelle', o.total,
      new Date(o.date).toLocaleDateString('fr-FR'),
    ]));
    const csv = rows.map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    a.download = `galy-market-commandes-${Date.now()}.csv`;
    a.click(); showToastAdm('📥 Export CSV téléchargé');
  }

  /* ── MODAL COMMANDE ── */
  window.openOrderModal = function(i) {
    const o = getOrders()[i]; if (!o) return;
    if ($('orderModalRef')) $('orderModalRef').textContent = o.ref;
    const body = $('orderModalBody'); if (!body) return;

    const PAY_LABELS = { orange:'Orange Money', mtn:'MTN Money', wave:'Mastercard', cash:'À la livraison', whatsapp:'Via WhatsApp' };
    body.innerHTML = `
      <div class="order-detail-grid">
        <div class="od-card">
          <h5>Client</h5>
          <div class="od-row"><span>Nom</span><strong>${o.client?.prenom} ${o.client?.nom}</strong></div>
          <div class="od-row"><span>Téléphone</span><strong>${o.client?.tel}</strong></div>
          <div class="od-row"><span>Email</span><strong>${o.client?.email || '—'}</strong></div>
        </div>
        <div class="od-card">
          <h5>Livraison</h5>
          <div class="od-row"><span>Ville</span><strong>${o.adresse?.ville}</strong></div>
          <div class="od-row"><span>Adresse</span><strong>${o.adresse?.adresse}</strong></div>
          <div class="od-row"><span>Zone</span><strong>${o.zone?.zone}</strong></div>
          <div class="od-row"><span>Délai</span><strong>${o.zone?.delay}</strong></div>
        </div>
        <div class="od-card">
          <h5>Paiement</h5>
          <div class="od-row"><span>Mode</span><strong>${PAY_LABELS[o.payment] || o.payment}</strong></div>
          <div class="od-row"><span>Coupon</span><strong>${o.coupon || 'Aucun'}</strong></div>
          <div class="od-row"><span>Remise</span><strong style="color:var(--adm-green)">${o.discount > 0 ? '− '+fmt(o.discount) : '—'}</strong></div>
        </div>
        <div class="od-card">
          <h5>Résumé</h5>
          <div class="od-row"><span>Sous-total</span><strong>${fmt(o.subtotal)}</strong></div>
          <div class="od-row"><span>Livraison</span><strong>${o.delivery === 0 ? 'Gratuit' : fmt(o.delivery)}</strong></div>
          <div class="od-row"><span>Date</span><strong>${new Date(o.date).toLocaleString('fr-FR')}</strong></div>
        </div>
      </div>
      <div class="od-items">
        <h5>Articles commandés</h5>
        ${(o.items || []).map(it => `
          <div class="od-item">
            <span class="od-item-em">${it.em || '📦'}</span>
            <span class="od-item-name">${it.name}</span>
            <span class="od-item-qty">× ${it.qty}</span>
            <span class="od-item-price">${fmt(it.price * it.qty)}</span>
          </div>`).join('')}
        <div class="od-total"><span>Total TTC</span><strong>${fmt(o.total)}</strong></div>
      </div>
      ${o.note ? `<div style="margin-top:16px;padding:14px;background:#fffbf5;border-radius:10px;border:1px solid var(--adm-border)"><strong style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:var(--adm-muted)">Note vendeur :</strong><p style="margin-top:6px;font-size:13px">${o.note}</p></div>` : ''}`;

    const statusSel = $('orderStatusSelect');
    if (statusSel) {
      statusSel.innerHTML = ['nouvelle','confirmee','en-cours','livree','annulee'].map(s =>
        `<option value="${s}" ${(o.status||'nouvelle') === s ? 'selected' : ''}>${s.replace('-',' ').replace(/^\w/, c => c.toUpperCase())}</option>`
      ).join('');
    }

    $('saveOrderStatus')?.addEventListener('click', () => {
      const orders = getOrders();
      orders[i].status = statusSel.value;
      saveOrders(orders); closeOrderModal();
      renderCommandes(); renderDashboard();
      showToastAdm('✅ Statut mis à jour');
    }, { once: true });

    $('orderModal')?.classList.add('open');
    $('admOverlay')?.classList.add('open');
  };
  window.closeOrderModal = function() {
    $('orderModal')?.classList.remove('open');
    $('admOverlay')?.classList.remove('open');
  };

  /* ══════════════════════
     PRODUITS
  ══════════════════════ */
  function renderProduits(search = '', cat = '') {
    let prods = getProds();
    if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (cat)    prods = prods.filter(p => p.cat === cat);
    const tbody = $('prodsTbody'); if (!tbody) return;
    const catMap = (typeof GM_CATS !== 'undefined') ? GM_CATS : {};
    // Compteur illimité
    const badge = $('prodCountBadge');
    if (badge) badge.textContent = getProds().length + ' produits';
    if (!prods.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--adm-muted)"><i class="fas fa-box-open" style="font-size:32px;display:block;margin-bottom:10px;opacity:.3"></i>Aucun produit. Cliquez sur "Nouveau produit" pour commencer !</td></tr>`;
      return;
    }
    tbody.innerHTML = prods.map(p => {
      const disc = p.old ? Math.round((1-p.price/p.old)*100) : 0;
      const imgHtml = p.img
        ? `<img src="${p.img}" style="width:38px;height:38px;object-fit:cover;border-radius:6px;border:1px solid rgba(246,139,30,.2)">`
        : `<span style="font-size:26px">${p.em||'📦'}</span>`;
      const stockHtml = p.stock <= 0
        ? `<span style="background:rgba(239,68,68,.15);color:#ef4444;padding:2px 7px;border-radius:6px;font-size:10px;font-weight:800">Rupture</span>`
        : `<span style="font-weight:700;color:${p.stock <= 5 ? '#ef4444' : p.stock <= 15 ? '#f59e0b' : '#22c55e'}">${p.stock}</span>`;
      return `<tr>
        <td>
          <div class="prod-info" style="display:flex;align-items:center;gap:10px">
            ${imgHtml}
            <div><div class="prod-name" style="font-size:13px;font-weight:700">${p.name}</div><div class="prod-brand" style="font-size:11px;color:var(--adm-muted)">${p.brand || '—'}</div></div>
          </div>
        </td>
        <td style="font-size:12px">${catMap[p.cat]?.label || p.cat || '—'}</td>
        <td><strong style="color:var(--adm-gold);font-size:14px">${fmt(p.price)}</strong></td>
        <td style="font-size:12px">${p.old ? `<span style="text-decoration:line-through;color:var(--adm-muted);font-size:11px">${fmt(p.old)}</span><br><span style="color:var(--adm-red);font-size:11px;font-weight:800">-${disc}%</span>` : '—'}</td>
        <td>${stockHtml}</td>
        <td style="font-size:12px">⭐ ${p.rating}</td>
        <td>${p.flash ? '<span style="color:var(--adm-gold);font-weight:800;font-size:12px">⚡ Oui</span>' : '<span style="color:var(--adm-muted);font-size:12px">—</span>'}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="tbl-btn" onclick="editProd('${p.id}')" title="Modifier"><i class="fas fa-pen"></i></button>
            <a href="produit.html?id=${p.id}" target="_blank" class="tbl-btn" title="Voir"><i class="fas fa-eye"></i></a>
            <button class="tbl-btn" style="background:rgba(239,68,68,.1);color:#ef4444;border-color:rgba(239,68,68,.2)" onclick="deleteProdAdmin('${p.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  $('prodSearch')?.addEventListener('input',  e => renderProduits(e.target.value, $('prodCatFilter')?.value));
  $('prodCatFilter')?.addEventListener('change', e => renderProduits($('prodSearch')?.value, e.target.value));
  $('btnAddProd')?.addEventListener('click', () => openProdModal());

  window.editProd = function(id) {
    const p = getProds().find(x => String(x.id) === String(id)); if (!p) return;
    if ($('prodModalTitle')) $('prodModalTitle').textContent = 'Modifier le produit';
    if ($('pmId'))    $('pmId').value    = p.id;
    if ($('pmName'))  $('pmName').value  = p.name;
    if ($('pmCat'))   $('pmCat').value   = p.cat;
    if ($('pmBrand')) $('pmBrand').value = p.brand || '';
    if ($('pmPrice')) $('pmPrice').value = p.price;
    if ($('pmOld'))   $('pmOld').value   = p.old || '';
    if ($('pmStock')) $('pmStock').value = p.stock;
    if ($('pmEm'))    $('pmEm').value    = p.em || '📦';
    if ($('pmRating'))$('pmRating').value= p.rating;
    if ($('pmDesc'))  $('pmDesc').value  = p.desc || '';
    if ($('pmDescFull'))$('pmDescFull').value = p.descFull || '';
    if ($('pmFlash')) $('pmFlash').checked = !!p.flash;
    if ($('pmNew'))   $('pmNew').checked   = !!p.isNew;
    if ($('pmVideoUrl'))$('pmVideoUrl').value = p.videoUrl || '';
    // Charger les photos existantes
    window._pmPhotos = p.imgs || (p.img ? [p.img] : []);
    if (typeof pmRenderPhotos === 'function') pmRenderPhotos();
    $('prodModal')?.classList.add('open');
    $('admOverlay')?.classList.add('open');
  };

  function openProdModal() {
    if ($('prodModalTitle')) $('prodModalTitle').textContent = 'Ajouter un produit';
    ['pmId','pmName','pmBrand','pmPrice','pmOld','pmStock','pmEm','pmRating','pmDesc','pmDescFull','pmVideoUrl'].forEach(id => {
      const el = $(id); if (el) el.value = '';
    });
    if ($('pmCat'))   $('pmCat').value   = 'phones';
    if ($('pmEm'))    $('pmEm').value    = '📦';
    if ($('pmRating'))$('pmRating').value = '4.5';
    if ($('pmFlash')) $('pmFlash').checked = false;
    if ($('pmNew'))   $('pmNew').checked   = false;
    if ($('pmPromo')) $('pmPromo').checked  = false;
    // Réinitialiser les photos
    window._pmPhotos = [];
    const photosGrid = $('pmPhotosGrid');
    if (photosGrid) photosGrid.innerHTML = '';
    $('prodModal')?.classList.add('open');
    $('admOverlay')?.classList.add('open');
  }

  window.closeProdModal = function() {
    $('prodModal')?.classList.remove('open');
    $('admOverlay')?.classList.remove('open');
  };

  $('saveProdBtn')?.addEventListener('click', () => {
    const existingId = $('pmId')?.value.trim();
    const id    = existingId || newProdId();
    const name  = $('pmName')?.value.trim();
    if (!name) { showToastAdm('⚠️ Le nom est requis'); return; }

    // pmPhotos vient de produits-admin.js
    const photos = (typeof pmPhotos !== 'undefined' ? pmPhotos : []);
    const imgMain = photos[0] || '';

    const prod = {
      id, name, cat: $('pmCat')?.value,
      brand:   $('pmBrand')?.value.trim(),
      price:   parseInt($('pmPrice')?.value)  || 0,
      old:     parseInt($('pmOld')?.value)    || null,
      stock:   parseInt($('pmStock')?.value)  || 0,
      em:      $('pmEm')?.value               || '📦',
      rating:  parseFloat($('pmRating')?.value) || 4.5,
      reviews: 0,
      desc:    $('pmDesc')?.value.trim()      || '',
      descFull:$('pmDescFull')?.value.trim()  || '',
      flash:   $('pmFlash')?.checked          || false,
      isNew:   $('pmNew')?.checked            || false,
      promo:   $('pmPromo')?.checked          || false,
      img:     imgMain,
      imgs:    [...photos],
      photos:  [...photos],
      videoUrl:$('pmVideoUrl')?.value.trim()  || '',
      _custom: true,
      dateAjout: existingId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProdOverride(prod);
    closeProdModal();
    renderProduits();
    const total = getProds().length;
    showToastAdm(`✅ Produit sauvegardé ! (${total} produit${total>1?'s':''} au total)`);
  });

  /* ══════════════════════
     COUPONS
  ══════════════════════ */
  function renderCoupons() {
    const coupons = getCoupons();
    const grid = $('couponsGrid'); if (!grid) return;
    const TYPE_LABELS = { percent:'% réduction', fixed:'Montant fixe', delivery:'Livraison offerte' };
    grid.innerHTML = Object.entries(coupons).map(([code, c]) => `
      <div class="coupon-adm-card">
        <div class="cac-code">${code}</div>
        <div class="cac-label">${c.label}</div>
        <div class="cac-type">${TYPE_LABELS[c.type] || c.type} ${c.value ? '· Valeur : '+c.value+(c.type==='percent'?'%':' GNF') : ''}</div>
        <span class="cac-badge cac-active">✓ Actif</span>
      </div>`).join('');
  }

  $('btnAddCoupon')?.addEventListener('click', () => {
    const code = prompt('Code promo (ex: SUMMER25) :')?.toUpperCase().trim();
    if (!code) return;
    const val = prompt('Valeur (%) ou montant fixe (GNF) :');
    if (!val) return;
    const coupons = getCoupons();
    const isPercent = parseInt(val) <= 100;
    coupons[code] = { type: isPercent ? 'percent' : 'fixed', value: parseInt(val), label: `${val}${isPercent?'%':' GNF'} de réduction`, active: true };
    localStorage.setItem('GM_ADMIN_COUPONS', JSON.stringify(coupons));
    renderCoupons(); showToastAdm(`✅ Coupon ${code} créé`);
  });

  /* ══════════════════════
     CLIENTS
  ══════════════════════ */
  function renderClients() {
    const orders = getOrders();
    const clientMap = {};
    orders.forEach(o => {
      const key = o.client?.tel;
      if (!key) return;
      if (!clientMap[key]) clientMap[key] = { ...o.client, orders: 0, total: 0, last: o.date };
      clientMap[key].orders++;
      clientMap[key].total += o.total || 0;
      if (new Date(o.date) > new Date(clientMap[key].last)) clientMap[key].last = o.date;
    });
    const clients = Object.values(clientMap);
    const tbody = $('clientsTbody'), empty = $('clientsEmpty');
    if (!tbody) return;
    if (!clients.length) {
      tbody.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    tbody.innerHTML = clients.sort((a,b) => b.total - a.total).map(c => `
      <tr>
        <td><strong>${c.prenom} ${c.nom}</strong></td>
        <td>${c.tel}</td>
        <td>—</td>
        <td>${c.orders}</td>
        <td><strong style="color:var(--adm-gold);font-family:'Cormorant Garamond',serif">${fmt(c.total)}</strong></td>
        <td style="font-size:12px;color:var(--adm-muted)">${new Date(c.last).toLocaleDateString('fr-FR')}</td>
      </tr>`).join('');
  }

  /* ══════════════════════
     LIVRAISON
  ══════════════════════ */
  function renderLivraison() {
    const grid = $('zonesAdmin'); if (!grid) return;

    const ZONE_ICONS = {
      'conakry-centre':    { icon:'fa-city',          color:'#22c55e', bg:'rgba(34,197,94,.1)',    badge:'Gratuit' },
      'conakry-periph':    { icon:'fa-map-location-dot', color:'#3b82f6', bg:'rgba(59,130,246,.1)',  badge:'Express' },
      'basse-guinee':      { icon:'fa-water',          color:'#06b6d4', bg:'rgba(6,182,212,.1)',   badge:'Régional' },
      'haute-guinee':      { icon:'fa-mountain-sun',   color:'#f59e0b', bg:'rgba(245,158,11,.1)',  badge:'Régional' },
      'guinee-forestiere': { icon:'fa-tree',           color:'#84cc16', bg:'rgba(132,204,22,.1)',  badge:'Régional' },
      'moyenne-guinee':    { icon:'fa-compass',        color:'#a78bfa', bg:'rgba(167,139,250,.1)', badge:'Régional' },
    };

    grid.innerHTML = `
      <div style="margin-bottom:24px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div>
            <h2 style="font-size:22px;font-weight:800;color:#fdf8f0;margin-bottom:4px"><i class="fas fa-truck-fast" style="color:#f68b1e"></i> Zones de livraison</h2>
            <p style="font-size:13px;color:#8a7560">Définissez les tarifs et délais pour chaque région de Guinée</p>
          </div>
          <div style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);color:#22c55e;padding:6px 14px;border-radius:50px;font-size:12px;font-weight:700">
            <i class="fas fa-circle-check"></i> ${DEFAULT_ZONES.length} zones actives
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
          ${DEFAULT_ZONES.map(z => {
            const zi = ZONE_ICONS[z.id] || { icon:'fa-location-dot', color:'#f68b1e', bg:'rgba(246,139,30,.1)', badge:'Zone' };
            const saved = JSON.parse(localStorage.getItem('GM_ZONES') || '{}');
            const price = saved[z.id]?.price ?? z.price;
            const delay = saved[z.id]?.delay ?? z.delay;
            return `
            <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px;transition:all .2s"
                 onmouseover="this.style.borderColor='${zi.color}40';this.style.background='${zi.bg}'"
                 onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.background='rgba(255,255,255,.03)'">

              <!-- Header carte -->
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:42px;height:42px;border-radius:12px;background:${zi.bg};border:1px solid ${zi.color}30;display:flex;align-items:center;justify-content:center">
                    <i class="fas ${zi.icon}" style="color:${zi.color};font-size:18px"></i>
                  </div>
                  <div>
                    <div style="font-weight:800;font-size:15px;color:#fdf8f0">${z.name}</div>
                    <div style="font-size:10px;font-weight:700;color:${zi.color};text-transform:uppercase;letter-spacing:.5px">${zi.badge}</div>
                  </div>
                </div>
                ${price === 0 ? `<span style="background:rgba(34,197,94,.15);color:#22c55e;font-size:10px;font-weight:800;padding:3px 10px;border-radius:50px;border:1px solid rgba(34,197,94,.2)">GRATUIT</span>` : ''}
              </div>

              <!-- Prix -->
              <div style="margin-bottom:12px">
                <label style="font-size:11px;font-weight:700;color:#8a7560;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px">
                  <i class="fas fa-tag" style="color:${zi.color};margin-right:4px"></i> Prix de livraison (GNF)
                </label>
                <div style="position:relative">
                  <input type="number" value="${price}" id="zp-${z.id}"
                    style="width:100%;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;font-size:15px;font-weight:700;color:#fdf8f0;outline:none;font-family:'DM Sans',sans-serif;box-sizing:border-box"
                    onfocus="this.style.borderColor='${zi.color}'"
                    onblur="this.style.borderColor='rgba(255,255,255,.1)'"
                  />
                </div>
              </div>

              <!-- Délai -->
              <div style="margin-bottom:16px">
                <label style="font-size:11px;font-weight:700;color:#8a7560;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px">
                  <i class="fas fa-clock" style="color:${zi.color};margin-right:4px"></i> Délai estimé
                </label>
                <input type="text" value="${delay}" id="zd-${z.id}"
                  style="width:100%;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;font-size:14px;color:#fdf8f0;outline:none;font-family:'DM Sans',sans-serif;box-sizing:border-box"
                  onfocus="this.style.borderColor='${zi.color}'"
                  onblur="this.style.borderColor='rgba(255,255,255,.1)'"
                />
              </div>

              <!-- Bouton -->
              <button onclick="saveZone('${z.id}')"
                style="width:100%;background:linear-gradient(135deg,${zi.color},${zi.color}cc);color:#fff;border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s"
                onmouseover="this.style.opacity='.85'"
                onmouseout="this.style.opacity='1'">
                <i class="fas fa-floppy-disk"></i> Sauvegarder
              </button>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  window.saveZone = function(id) {
    const price = parseInt(document.getElementById('zp-'+id)?.value) || 0;
    const delay = document.getElementById('zd-'+id)?.value.trim() || '';
    const saved = JSON.parse(localStorage.getItem('GM_ZONES') || '{}');
    saved[id] = { price, delay };
    localStorage.setItem('GM_ZONES', JSON.stringify(saved));
    showToastAdm('✅ Zone sauvegardée !');
  };

  /* ══════════════════════
     STATUS PILL
  ══════════════════════ */
  function statusPill(status) {
    const map = { nouvelle:'sp-nouvelle', confirmee:'sp-confirmee', 'en-cours':'sp-en-cours', livree:'sp-livree', annulee:'sp-annulee' };
    const labels = { nouvelle:'Nouvelle', confirmee:'Confirmée', 'en-cours':'En cours', livree:'Livrée', annulee:'Annulée' };
    return `<span class="status-pill ${map[status]||'sp-nouvelle'}">${labels[status]||status}</span>`;
  }

  /* ══════════════════════
     TOAST
  ══════════════════════ */
  window.showToastAdm = function(msg) {
    const t = $('admToast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3000);
  };

  /* ══════════════════════
     BURGER & OVERLAY
  ══════════════════════ */
  $('admBurger')?.addEventListener('click', () => {
    $('admSidebar')?.classList.add('open');
    $('admOverlay')?.classList.add('open');
  });
  $('admSidebarClose')?.addEventListener('click', closeAdmSidebar);
  $('admOverlay')?.addEventListener('click', () => {
    closeAdmSidebar();
    closeOrderModal();
    closeProdModal();
  });
  function closeAdmSidebar() {
    $('admSidebar')?.classList.remove('open');
    if (!$('orderModal')?.classList.contains('open') && !$('prodModal')?.classList.contains('open'))
      $('admOverlay')?.classList.remove('open');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeOrderModal(); closeProdModal(); closeAdmSidebar(); }
  });

  /* ══════════════════════
     RECHERCHE GLOBALE
  ══════════════════════ */
  $('admSearch')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    if (!q) return;
    // Basculer vers produits et filtrer
    switchTab('produits');
    renderProduits(q);
    const pi = $('prodSearch'); if (pi) pi.value = q;
  });

  /* ══════════════════════
     INIT
  ══════════════════════ */
  if (checkAuth()) {
    // Déjà appelé plus haut dans renderAll()
  }
});

  // Suppression produit (ajout fin fichier)
  window.deleteProdAdmin = function(id) {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    deleteProd(id);
    renderProduits();
    showToastAdm('🗑️ Produit supprimé');
  };

  /* ══════════════════════
     BOOSTS VENDEURS
  ══════════════════════ */
  function renderBoosts() {
    const grid = $('boostsList'); if(!grid) return;
    const boosts = JSON.parse(localStorage.getItem('GM_BOOSTS')||'[]');
    const badge = $('nbBoosts');
    const enAttente = boosts.filter(b=>b.statut==='en_attente').length;
    if(badge) badge.textContent = enAttente;

    if(!boosts.length) {
      grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--adm-muted)"><i class="fas fa-rocket" style="font-size:32px;display:block;margin-bottom:10px;opacity:.3"></i>Aucune demande de boost</div>';
      return;
    }

    const statColors = { en_attente:'#f59e0b', actif:'#22c55e', refuse:'#ef4444', termine:'#8a7560' };
    const statLabels = { en_attente:'⏳ En attente', actif:'✅ Actif', refuse:'❌ Refusé', termine:'✔ Terminé' };
    const reseaux = { facebook:'📘', instagram:'📸', tiktok:'🎵', whatsapp:'💬', telegram:'✈️' };

    grid.innerHTML = [...boosts].reverse().map((b,i) => `
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(246,139,30,.15);border-radius:14px;padding:18px;margin-bottom:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:15px;font-weight:800;color:#fdf8f0">${b.produitNom||'—'}</div>
            <div style="font-size:12px;color:#8a7560">Vendeur : ${b.vendeurNom||'—'} · ${new Date(b.date).toLocaleDateString('fr-FR')}</div>
          </div>
          <span style="background:rgba(0,0,0,.2);color:${statColors[b.statut]||'#8a7560'};padding:4px 12px;border-radius:50px;font-size:12px;font-weight:700">
            ${statLabels[b.statut]||b.statut}
          </span>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
          <div style="font-size:12px;color:#8a7560">📦 <strong style="color:#fdf8f0">Forfait:</strong> ${b.forfaitNom||'—'}</div>
          <div style="font-size:12px;color:#8a7560">💰 <strong style="color:#f68b1e">${(b.montant||0).toLocaleString('fr-FR')} GNF</strong></div>
          <div style="font-size:12px;color:#8a7560">💳 <strong style="color:#fdf8f0">${b.methode||'—'}</strong></div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
          ${(b.reseaux||[]).map(r=>`<span style="font-size:12px">${reseaux[r]||'🌐'} ${r}</span>`).join('')}
        </div>
        ${b.statut==='en_attente' ? `
        <div style="display:flex;gap:8px">
          <button onclick="validerBoost('${b.id}')"
            style="flex:1;background:rgba(34,197,94,.15);color:#22c55e;border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
            <i class="fas fa-check"></i> Valider — Commencer le boost
          </button>
          <button onclick="refuserBoost('${b.id}')"
            style="flex:1;background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
            <i class="fas fa-times"></i> Refuser
          </button>
        </div>` : b.statut==='actif' ? `
        <div style="display:flex;gap:8px">
          <button onclick="terminerBoost('${b.id}')"
            style="background:rgba(246,139,30,.15);color:#f68b1e;border:1px solid rgba(246,139,30,.3);border-radius:8px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
            <i class="fas fa-flag-checkered"></i> Marquer comme terminé
          </button>
        </div>` : ''}
      </div>`).join('');
  }

  window.validerBoost = function(id) {
    const boosts = JSON.parse(localStorage.getItem('GM_BOOSTS')||'[]');
    const b = boosts.find(x=>x.id===id); if(!b) return;
    b.statut = 'actif'; b.dateValidation = new Date().toISOString();
    localStorage.setItem('GM_BOOSTS', JSON.stringify(boosts));
    renderBoosts();
    showToastAdm('✅ Boost validé ! Commencez la promotion sur les réseaux.');
  };

  window.refuserBoost = function(id) {
    if(!confirm('Refuser cette demande de boost ?')) return;
    const boosts = JSON.parse(localStorage.getItem('GM_BOOSTS')||'[]');
    const b = boosts.find(x=>x.id===id); if(!b) return;
    b.statut = 'refuse';
    localStorage.setItem('GM_BOOSTS', JSON.stringify(boosts));
    renderBoosts();
    showToastAdm('❌ Boost refusé.');
  };

  window.terminerBoost = function(id) {
    const boosts = JSON.parse(localStorage.getItem('GM_BOOSTS')||'[]');
    const b = boosts.find(x=>x.id===id); if(!b) return;
    b.statut = 'termine';
    localStorage.setItem('GM_BOOSTS', JSON.stringify(boosts));
    renderBoosts();
    showToastAdm('✔ Boost marqué comme terminé.');
  };
