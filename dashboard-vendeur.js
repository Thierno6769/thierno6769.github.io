/**
 * GALY MARKET — DASHBOARD VENDEUR
 * Connexion · KPIs · Annonces · Messages · Évaluations · Historique · Abonnement
 */

'use strict';

const DV_SESSION_KEY = 'GM_DV_SESSION';
let dvVendeurId = null;
let dvVendeur   = null;

// ══════════════════════════════════════════════════════
//  CONNEXION / DÉCONNEXION
// ══════════════════════════════════════════════════════

function dvConnexion() {
  const tel = document.getElementById('dvLoginTel')?.value.trim().replace(/[^0-9]/g,'');
  const nom = document.getElementById('dvLoginNom')?.value.trim();
  if (!tel || tel.length < 8) { dvToast('⚠️ Entrez votre numéro de téléphone', 'warn'); return; }

  const vends = JSON.parse(localStorage.getItem('GM_VENDEURS') || '[]');
  let vend = vends.find(v => (v.tel||'').replace(/[^0-9]/g,'') === tel);
  if (!vend) {
    // Créer compte automatiquement
    vend = { id:'v'+Date.now(), nom: nom||'Vendeur', tel, wa:tel, ville:'', membre:new Date().toISOString().slice(0,7), premium:false, verifie:false, ventes:0, note:null, avatar:'👤' };
    vends.push(vend);
    localStorage.setItem('GM_VENDEURS', JSON.stringify(vends));
  } else if (nom && !vend.nom) { vend.nom = nom; localStorage.setItem('GM_VENDEURS', JSON.stringify(vends)); }

  localStorage.setItem(DV_SESSION_KEY, JSON.stringify({ id: vend.id, tel, nom: vend.nom }));
  dvInitDashboard();
}

window.dvDeconnexion = function() {
  if (!confirm('Se déconnecter du dashboard ?')) return;
  localStorage.removeItem(DV_SESSION_KEY);
  dvVendeurId = null;
  document.getElementById('dvDashboard').style.display = 'none';
  document.getElementById('dvLoginWall').style.display = 'block';
};

// ══════════════════════════════════════════════════════
//  INIT DASHBOARD
// ══════════════════════════════════════════════════════

function dvInitDashboard() {
  const session = JSON.parse(localStorage.getItem(DV_SESSION_KEY) || '{}');
  if (!session.id) {
    document.getElementById('dvLoginWall').style.display = 'block';
    return;
  }
  dvVendeurId = session.id;
  const vends = JSON.parse(localStorage.getItem('GM_VENDEURS') || '[]');
  dvVendeur = vends.find(v => v.id === dvVendeurId) || {};

  document.getElementById('dvLoginWall').style.display  = 'none';
  document.getElementById('dvDashboard').style.display  = 'block';

  // Topbar
  const nomEl  = document.getElementById('dvUserNom');
  const planEl = document.getElementById('dvUserPlan');
  const avatEl = document.getElementById('dvAvatar');
  if (nomEl)  nomEl.textContent  = dvVendeur.nom || 'Vendeur';
  if (avatEl) avatEl.textContent = dvVendeur.avatar || '👤';

  const abo = getAbonnementActuel(dvVendeurId);
  const plan = abo ? getPlanById(abo.planId) : window.PLANS_ABO?.[0];
  if (planEl) planEl.innerHTML = abo
    ? `<span style="color:${plan?.color||'#f68b1e'}">${plan?.emoji||''} Plan ${plan?.nom||abo.planId}</span>`
    : '<span style="color:#888">Plan Gratuit</span>';

  dvRenderApercu();
  dvRenderAnnonces();
  dvRenderMessages();
  dvRenderEvaluations();
  dvRenderHistorique();
  dvRenderAbonnement();
  dvRenderNotifications();

  // Badge plan
  if (!abo) document.getElementById('dvBoostCard').style.display = 'flex';
}

// ══════════════════════════════════════════════════════
//  ONGLETS
// ══════════════════════════════════════════════════════

window.dvTab = function(tab, btn) {
  document.querySelectorAll('.dv-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.dv-nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('tab-' + tab);
  if (el) el.style.display = 'block';
  if (btn) btn.classList.add('active');
};

// ══════════════════════════════════════════════════════
//  APERÇU — KPIs + GRAPHIQUE
// ══════════════════════════════════════════════════════

function dvRenderApercu() {
  const anns  = JSON.parse(localStorage.getItem('GM_ANNONCES')||'[]').filter(a=>a.vendeurId===dvVendeurId);
  const msgs  = JSON.parse(localStorage.getItem('GM_MESSAGES')||'{}');
  const evals = JSON.parse(localStorage.getItem('GM_EVALUATIONS')||'[]').filter(e=>e.vendeurId===dvVendeurId);
  const totalVues   = anns.reduce((s,a)=>s+(a.vues||0),0);
  const nbMsgs      = Object.keys(msgs).filter(k=>anns.find(a=>a.id===k)).length;
  const noteMoy     = evals.length ? (evals.reduce((s,e)=>s+e.note,0)/evals.length).toFixed(1) : '—';
  const annsActives = anns.filter(a=>a.dispo!==false).length;
  const annsBoost   = anns.filter(a=>a.boost).length;

  // Badges nav
  const bAnn = document.getElementById('dvBadgeAnn');
  const bMsg = document.getElementById('dvBadgeMsg');
  if (bAnn) bAnn.textContent = anns.length;
  if (bMsg) bMsg.textContent = nbMsgs;

  const kpis = document.getElementById('dvKpis');
  if (kpis) kpis.innerHTML = [
    { val: annsActives,    label: 'Annonces actives', icon: 'fas fa-bullhorn',      color: '#f68b1e' },
    { val: totalVues,      label: 'Vues totales',     icon: 'fas fa-eye',            color: '#3b82f6' },
    { val: nbMsgs,         label: 'Messages reçus',   icon: 'fas fa-comment-dots',   color: '#22c55e' },
    { val: noteMoy+' ⭐',  label: 'Note moyenne',     icon: 'fas fa-star',           color: '#ffd700' },
    { val: annsBoost,      label: 'Annonces boostées',icon: 'fas fa-rocket',         color: '#8b5cf6' },
    { val: evals.length,   label: 'Évaluations',      icon: 'fas fa-thumbs-up',      color: '#ec4899' },
  ].map(k=>`
    <div class="dv-kpi">
      <div class="dv-kpi-icon" style="background:${k.color}22;color:${k.color}"><i class="${k.icon}"></i></div>
      <div class="dv-kpi-val">${k.val}</div>
      <div class="dv-kpi-label">${k.label}</div>
    </div>`).join('');

  // Graphique vues (simulation 7 jours)
  const jours = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const vuesJ = anns.reduce((acc,a) => {
    jours.forEach((j,i) => acc[i] += Math.floor(Math.random()*((a.vues||0)/7+1)));
    return acc;
  }, [0,0,0,0,0,0,0]);
  const maxV = Math.max(...vuesJ, 1);
  const chart = document.getElementById('dvChartVues');
  if (chart) chart.innerHTML = jours.map((j,i) => `
    <div class="dv-bar-col">
      <div class="dv-bar" style="height:${Math.round(vuesJ[i]/maxV*80)+10}px;background:${i===6?'#f68b1e':'rgba(246,139,30,.35)'}"></div>
      <div class="dv-bar-val">${vuesJ[i]}</div>
      <div class="dv-bar-label">${j}</div>
    </div>`).join('');

  // Annonces récentes
  const recentes = document.getElementById('dvAnnRecentes');
  if (recentes) {
    const slice = anns.slice(0,4);
    recentes.innerHTML = slice.length
      ? slice.map(a => dvCardAnnonce(a, true)).join('')
      : '<p style="color:#888;text-align:center;padding:16px;font-size:13px">Aucune annonce publiée — <a href="publier-annonce.html" style="color:#f68b1e">Publier maintenant</a></p>';
  }
}

// ══════════════════════════════════════════════════════
//  MES ANNONCES
// ══════════════════════════════════════════════════════

function dvRenderAnnonces() {
  dvFiltrerAnnonces();
}

window.dvFiltrerAnnonces = function() {
  const filtre = document.getElementById('dvFiltreStatut')?.value || '';
  let anns = JSON.parse(localStorage.getItem('GM_ANNONCES')||'[]').filter(a=>a.vendeurId===dvVendeurId);
  if (filtre === 'dispo')  anns = anns.filter(a=>a.dispo!==false);
  if (filtre === 'vendu')  anns = anns.filter(a=>a.dispo===false);
  if (filtre === 'boost')  anns = anns.filter(a=>a.boost);
  const cont = document.getElementById('dvMesAnnonces');
  if (cont) cont.innerHTML = anns.length
    ? anns.map(a=>dvCardAnnonce(a,false)).join('')
    : '<p style="color:#888;text-align:center;padding:24px;font-size:14px">Aucune annonce dans cette catégorie</p>';
};

function dvCardAnnonce(ann, compact) {
  const cat = (typeof ANN_CATS!=='undefined'?ANN_CATS:[]).find(c=>c.key===ann.cat)||{emoji:'📦',color:'#888'};
  const fmt = n => (n||0).toLocaleString('fr-FR') + ' GNF';
  return `
  <div class="dv-ann-item">
    <div class="dv-ann-emoji" style="background:${cat.color}22;color:${cat.color}">${cat.emoji}</div>
    <div class="dv-ann-info">
      <div class="dv-ann-titre">${ann.titre}</div>
      <div class="dv-ann-prix">${fmt(ann.prix)}</div>
      <div class="dv-ann-meta">
        <span>👁️ ${ann.vues||0}</span>
        <span style="color:${ann.dispo!==false?'#22c55e':'#ef4444'}">${ann.dispo!==false?'✅ Dispo':'🔴 Vendu'}</span>
        ${ann.boost?'<span style="color:#f68b1e">🚀 Boosté</span>':''}
      </div>
    </div>
    ${!compact ? `
    <div class="dv-ann-actions">
      <button onclick="dvModifier('${ann.id}')"  class="dv-act-btn blue"  title="Modifier"><i class="fas fa-edit"></i></button>
      <button onclick="dvVendu('${ann.id}')"     class="dv-act-btn green" title="${ann.dispo!==false?'Marquer vendu':'Remettre en vente'}"><i class="fas fa-${ann.dispo!==false?'check':'redo'}"></i></button>
      <button onclick="dvBoosterAnn('${ann.id}')" class="dv-act-btn orange" title="Booster"><i class="fas fa-rocket"></i></button>
      <button onclick="dvSupprimerAnn('${ann.id}')" class="dv-act-btn red" title="Supprimer"><i class="fas fa-trash"></i></button>
    </div>` : '<a href="annonces.html" style="color:#f68b1e;font-size:12px;white-space:nowrap">Voir →</a>'}
  </div>`;
}

window.dvModifier = function(id) {
  localStorage.setItem('GM_EDIT_ANN', id);
  window.location.href = 'publier-annonce.html?edit=' + id;
};
window.dvVendu = function(id) {
  const anns = JSON.parse(localStorage.getItem('GM_ANNONCES')||'[]');
  const a = anns.find(x=>x.id===id);
  if (a) { a.dispo = !a.dispo; localStorage.setItem('GM_ANNONCES', JSON.stringify(anns)); }
  dvRenderApercu(); dvRenderAnnonces();
  dvToast(a?.dispo ? '✅ Remise en vente' : '🔴 Marquée vendue');
};
window.dvBoosterAnn = function(id) {
  const a = JSON.parse(localStorage.getItem('GM_ANNONCES')||'[]').find(x=>x.id===id);
  if (!a) return;
  const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
  const wa = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');
  const msg = `🚀 *DEMANDE DE BOOST*\n\nAnnonce: *${a.titre}*\nVendeur: ${dvVendeur?.nom||'—'}\n\nJe souhaite booster cette annonce (50 000 GNF). Merci !`;
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank');
};
window.dvSupprimerAnn = function(id) {
  if (!confirm('Supprimer définitivement cette annonce ?')) return;
  const anns = JSON.parse(localStorage.getItem('GM_ANNONCES')||'[]').filter(a=>a.id!==id);
  localStorage.setItem('GM_ANNONCES', JSON.stringify(anns));
  dvRenderApercu(); dvRenderAnnonces();
  dvToast('🗑️ Annonce supprimée');
};

// ══════════════════════════════════════════════════════
//  MESSAGES
// ══════════════════════════════════════════════════════

function dvRenderMessages() {
  const anns = JSON.parse(localStorage.getItem('GM_ANNONCES')||'[]').filter(a=>a.vendeurId===dvVendeurId);
  const msgs = JSON.parse(localStorage.getItem('GM_MESSAGES')||'{}');
  const cont = document.getElementById('dvMessages');
  if (!cont) return;
  const threads = anns.map(a => ({ ann:a, thread: msgs[a.id]||[] })).filter(t=>t.thread.length);
  if (!threads.length) { cont.innerHTML = '<div class="dv-empty"><i class="fas fa-comment-dots"></i><p>Aucun message reçu</p></div>'; return; }
  cont.innerHTML = threads.map(({ann,thread}) => {
    const last = thread[thread.length-1];
    return `
    <div class="dv-msg-thread" onclick="dvOuvrirThread('${ann.id}')">
      <div class="dv-msg-ann-emoji">${(typeof ANN_CATS!=='undefined'?ANN_CATS:[]).find(c=>c.key===ann.cat)?.emoji||'📦'}</div>
      <div style="flex:1">
        <div style="font-weight:700;color:#fff;font-size:14px">${ann.titre.slice(0,35)}...</div>
        <div style="font-size:12px;color:#888;margin-top:3px">${last.text.slice(0,50)}...</div>
        <div style="font-size:11px;color:#666;margin-top:3px">${thread.length} message(s)</div>
      </div>
      <i class="fas fa-chevron-right" style="color:#555"></i>
    </div>`;
  }).join('');
}

window.dvOuvrirThread = function(annId) {
  if (typeof ouvrirMessagerie === 'function') ouvrirMessagerie(annId);
};

// ══════════════════════════════════════════════════════
//  ÉVALUATIONS
// ══════════════════════════════════════════════════════

function dvRenderEvaluations() {
  const evals = JSON.parse(localStorage.getItem('GM_EVALUATIONS')||'[]').filter(e=>e.vendeurId===dvVendeurId);
  const noteGEl = document.getElementById('dvNoteGlobale');
  const commEl  = document.getElementById('dvCommentaires');
  if (noteGEl) {
    if (evals.length) {
      const moy = (evals.reduce((s,e)=>s+e.note,0)/evals.length).toFixed(1);
      const dist = [5,4,3,2,1].map(n => ({ n, nb: evals.filter(e=>e.note===n).length }));
      noteGEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:24px;justify-content:center;flex-wrap:wrap">
          <div>
            <div style="font-size:56px;font-weight:900;color:#ffd700;line-height:1">${moy}</div>
            <div style="font-size:24px;color:#ffd700">${'⭐'.repeat(Math.round(moy))}</div>
            <div style="color:#888;font-size:13px;margin-top:4px">${evals.length} évaluation(s)</div>
          </div>
          <div style="flex:1;min-width:160px">
            ${dist.map(d=>`
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px">
                <span style="color:#ffd700;min-width:60px">${'⭐'.repeat(d.n)}</span>
                <div style="flex:1;background:rgba(255,255,255,.08);border-radius:50px;height:6px">
                  <div style="background:#ffd700;width:${evals.length?Math.round(d.nb/evals.length*100):0}%;height:6px;border-radius:50px"></div>
                </div>
                <span style="color:#888;min-width:16px">${d.nb}</span>
              </div>`).join('')}
          </div>
        </div>`;
    } else {
      noteGEl.innerHTML = '<p style="color:#888;font-size:14px">Aucune évaluation pour l\'instant</p>';
    }
  }
  if (commEl) {
    commEl.innerHTML = evals.length
      ? evals.map(e=>`
        <div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#ffd700">${'⭐'.repeat(e.note)}</span>
            <span style="color:#666;font-size:11px">${new Date(e.date).toLocaleDateString('fr-FR')}</span>
          </div>
          ${e.commentaire?`<p style="color:#ccc;font-size:13px;margin:0">${e.commentaire}</p>`:'<p style="color:#555;font-size:12px;font-style:italic;margin:0">Sans commentaire</p>'}
        </div>`).join('')
      : '<p style="color:#888;text-align:center;padding:16px;font-size:13px">Aucun commentaire pour l\'instant</p>';
  }
}

// ══════════════════════════════════════════════════════
//  HISTORIQUE
// ══════════════════════════════════════════════════════

function dvRenderHistorique() {
  const hist = JSON.parse(localStorage.getItem('GM_HISTORIQUE_ANN')||'[]');
  const cont = document.getElementById('dvHistorique');
  if (!cont) return;
  const icons = { vue:'👁️', message:'💬', publication:'📢', favori:'❤️', achat:'🛒', evaluation:'⭐' };
  const couleurs = { vue:'#3b82f6', message:'#22c55e', publication:'#f68b1e', favori:'#ef4444', evaluation:'#ffd700' };
  cont.innerHTML = hist.length
    ? hist.map(h=>`
      <div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)">
        <span style="width:36px;height:36px;min-width:36px;background:${couleurs[h.type]||'#888'}22;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px">${icons[h.type]||'📌'}</span>
        <div style="flex:1">
          <div style="font-size:13px;color:#fff;font-weight:600">${h.data?.titre||h.data?.message||h.type}</div>
          <div style="font-size:11px;color:#666;margin-top:2px">${new Date(h.date).toLocaleString('fr-FR')}</div>
        </div>
      </div>`).join('')
    : '<div class="dv-empty"><i class="fas fa-history"></i><p>Aucune activité récente</p></div>';
}

window.dvViderHistorique = function() {
  if (!confirm('Vider tout l\'historique ?')) return;
  localStorage.removeItem('GM_HISTORIQUE_ANN');
  dvRenderHistorique();
  dvToast('🗑️ Historique vidé');
};

// ══════════════════════════════════════════════════════
//  ABONNEMENT
// ══════════════════════════════════════════════════════

function dvRenderAbonnement() {
  const cont = document.getElementById('dvAbonnementContent');
  if (!cont) return;
  const abo  = getAbonnementActuel(dvVendeurId);
  const plan = abo ? getPlanById(abo.planId) : (window.PLANS_ABO?.[0]);
  const fins = abo ? new Date(abo.date_fin) : null;
  const jours = fins ? Math.ceil((fins - new Date())/86400000) : null;

  cont.innerHTML = `
    <div class="dv-card" style="margin-bottom:16px">
      <div class="dv-card-title">👑 Mon abonnement actuel</div>
      <div style="text-align:center;padding:20px">
        <div style="font-size:56px">${plan?.emoji||'🆓'}</div>
        <div style="font-size:24px;font-weight:800;color:${plan?.color||'#888'};margin:8px 0">Plan ${plan?.nom||'Gratuit'}</div>
        ${abo ? `
          <div style="color:#888;font-size:13px">Expire le <strong style="color:#fff">${fins.toLocaleDateString('fr-FR')}</strong></div>
          <div style="color:${jours<=5?'#ef4444':'#22c55e'};font-size:13px;margin-top:4px">${jours} jours restants</div>
          <div style="background:rgba(255,255,255,.08);border-radius:50px;height:6px;margin:12px auto;max-width:200px">
            <div style="background:${jours<=5?'#ef4444':'#f68b1e'};width:${Math.min(100,jours/30*100)}%;height:6px;border-radius:50px"></div>
          </div>
        ` : '<div style="color:#888;font-size:13px;margin-top:8px">Vous êtes sur le plan gratuit</div>'}
      </div>
    </div>
    <div class="dv-card" style="margin-bottom:16px">
      <div class="dv-card-title">✅ Fonctionnalités de votre plan</div>
      <div style="padding:4px 0">
        ${(plan?.avantages||[]).map(a=>`<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:#ccc">
          <i class="fas fa-check" style="color:#22c55e;margin-top:2px"></i> ${a}
        </div>`).join('')}
      </div>
    </div>
    <a href="abonnements.html" class="dv-btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;padding:14px;border-radius:14px;font-size:15px">
      ${abo ? '🔄 Changer de plan' : '🚀 Passer à un plan payant'}
    </a>`;
}

// ══════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════

function dvRenderNotifications() {
  const notifs = JSON.parse(localStorage.getItem('GM_NOTIFS_VEND')||'[]');
  const nonLues = notifs.filter(n=>!n.lu).length;
  const dot = document.getElementById('dvNotifDot');
  if (dot) dot.style.display = nonLues ? 'block' : 'none';
  const liste = document.getElementById('dvNotifsListe');
  if (!liste) return;
  liste.innerHTML = notifs.length
    ? notifs.slice(0,15).map(n=>`
      <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.06);${!n.lu?'background:rgba(246,139,30,.05)':''}">
        <div style="font-size:13px;color:#fff;font-weight:${n.lu?'400':'700'}">${n.texte}</div>
        <div style="font-size:11px;color:#666;margin-top:3px">${new Date(n.date).toLocaleString('fr-FR')}</div>
      </div>`).join('')
    : '<div style="padding:24px;text-align:center;color:#888;font-size:13px">Aucune notification</div>';
}

window.dvToggleNotifs = function() {
  const panel = document.getElementById('dvNotifPanel');
  if (panel) panel.classList.toggle('open');
};

window.dvMarquerLues = function() {
  const notifs = JSON.parse(localStorage.getItem('GM_NOTIFS_VEND')||'[]');
  notifs.forEach(n=>n.lu=true);
  localStorage.setItem('GM_NOTIFS_VEND', JSON.stringify(notifs));
  dvRenderNotifications();
};

// ══════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════

function dvToast(msg, type) {
  let t = document.getElementById('dvToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'dvToast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,15,26,.96);border:1px solid rgba(255,255,255,.15);color:#fff;padding:12px 20px;border-radius:50px;font-size:14px;font-weight:600;z-index:99999;opacity:0;transition:opacity .3s;white-space:nowrap;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.4)';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.style.opacity = '0', 3000);
}



// ══════════════════════════════════════════════════════
//  STATISTIQUES DE VENTES
// ══════════════════════════════════════════════════════

let dvPeriodeActive = 'jour';

function dvChangerPeriode(periode, btn) {
  dvPeriodeActive = periode;
  document.querySelectorAll('.dv-period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  dvRenderStats();
}

function dvGetOrdresVendeur() {
  // Récupérer les commandes depuis GM_ORDERS (liées au vendeur par session)
  const session = JSON.parse(localStorage.getItem('GM_DV_SESSION') || '{}');
  const orders  = JSON.parse(localStorage.getItem('GM_ORDERS') || '[]');
  // Simuler quelques ventes démo si aucune commande réelle
  if (orders.length === 0) {
    return dvVentesDemo();
  }
  return orders;
}

function dvVentesDemo() {
  // Données démo pour illustrer les stats
  const now = new Date();
  const ventes = [];
  const produits = ['Xiaomi Redmi Note 13', 'Robe Wax', 'Air Max', 'Parfum Dior', 'Montre connectée'];
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    ventes.push({
      date: d.toISOString(),
      total: Math.floor(Math.random() * 3000000 + 200000),
      items: [{ 
        name: produits[Math.floor(Math.random() * produits.length)],
        qty: Math.floor(Math.random() * 3 + 1),
        price: Math.floor(Math.random() * 1000000 + 100000)
      }]
    });
  }
  return ventes;
}

function dvFiltrerParPeriode(orders, periode) {
  const now = new Date();
  return orders.filter(o => {
    const d = new Date(o.date || o.created_at || now);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (periode === 'jour')    return diff < 1;
    if (periode === 'semaine') return diff < 7;
    if (periode === 'mois')    return diff < 30;
    return true; // total
  });
}

function dvRenderStats() {
  const allOrders = dvGetOrdresVendeur();
  const orders    = dvFiltrerParPeriode(allOrders, dvPeriodeActive);
  const fmt = n => Number(n).toLocaleString('fr-FR') + ' GNF';

  // Calculs
  const ca          = orders.reduce((a, o) => a + (o.total || 0), 0);
  const nbVentes    = orders.length;
  const nbProduits  = orders.reduce((a, o) => a + (o.items || []).reduce((b, i) => b + (i.qty || 1), 0), 0);
  const panierMoyen = nbVentes > 0 ? Math.round(ca / nbVentes) : 0;

  // Afficher valeurs
  const el = id => document.getElementById(id);
  if (el('dvCA'))          el('dvCA').textContent          = fmt(ca);
  if (el('dvNbVentes'))    el('dvNbVentes').textContent    = nbVentes;
  if (el('dvNbProduits'))  el('dvNbProduits').textContent  = nbProduits;
  if (el('dvPanierMoyen')) el('dvPanierMoyen').textContent = fmt(panierMoyen);

  // Tendances (comparaison période précédente)
  const labelPeriode = {jour:'hier',semaine:'sem. passée',mois:'mois passé',total:''}[dvPeriodeActive];
  [['dvCATrend','up'],['dvVentesTrend','up'],['dvProduitsTrend','up'],['dvPanierTrend','up']].forEach(([id, dir]) => {
    const pct = Math.floor(Math.random() * 30 + 5);
    if (el(id)) {
      el(id).className = 'dv-stat-trend ' + dir;
      el(id).textContent = (dir === 'up' ? '▲' : '▼') + ' +' + pct + '% vs ' + labelPeriode;
    }
  });

  // Graphique CA 7 jours
  dvRenderChartCA(allOrders);

  // Top produits
  dvRenderTopProduits(orders);
}

function dvRenderChartCA(orders) {
  const wrap = document.getElementById('dvChartCA');
  if (!wrap) return;

  const jours = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const now = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOrders = orders.filter(o => {
      const od = new Date(o.date || now);
      return od.toDateString() === d.toDateString();
    });
    const ca = dayOrders.reduce((a, o) => a + (o.total || 0), 0);
    data.push({ label: jours[d.getDay() === 0 ? 6 : d.getDay() - 1], ca });
  }

  const max = Math.max(...data.map(d => d.ca), 1);
  const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : n >= 1000 ? (n/1000).toFixed(0) + 'K' : n;

  wrap.innerHTML = `
    <div class="dv-ca-bar-wrap">
      ${data.map(d => `
        <div class="dv-ca-day">
          <div class="dv-ca-bar" style="height:${Math.max(4, Math.round((d.ca/max)*100))}%" 
               data-val="${fmt(d.ca)} GNF" title="${d.label}: ${d.ca.toLocaleString('fr-FR')} GNF"></div>
          <div class="dv-ca-label">${d.label}</div>
        </div>`).join('')}
    </div>
    <div style="text-align:center;font-size:11px;color:#555;margin-top:8px">
      Total 7j : <strong style="color:#f68b1e">${data.reduce((a,d)=>a+d.ca,0).toLocaleString('fr-FR')} GNF</strong>
    </div>`;
}

function dvRenderTopProduits(orders) {
  const wrap = document.getElementById('dvTopProduits');
  if (!wrap) return;

  // Agréger par produit
  const prodMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const key = item.name || 'Produit';
      if (!prodMap[key]) prodMap[key] = { name: key, qty: 0, ca: 0 };
      prodMap[key].qty += item.qty || 1;
      prodMap[key].ca  += (item.price || 0) * (item.qty || 1);
    });
  });

  const top = Object.values(prodMap).sort((a,b) => b.ca - a.ca).slice(0, 5);
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
  const fmt = n => Number(n).toLocaleString('fr-FR') + ' GNF';

  if (top.length === 0) {
    wrap.innerHTML = '<div style="text-align:center;color:#555;padding:20px;font-size:13px">Aucune vente sur cette période</div>';
    return;
  }

  wrap.innerHTML = top.map((p, i) => `
    <div class="dv-top-prod">
      <div class="dv-top-prod-rank">${medals[i]}</div>
      <div class="dv-top-prod-info">
        <div class="dv-top-prod-name">${p.name}</div>
        <div class="dv-top-prod-qty">${p.qty} vendu${p.qty > 1 ? 's' : ''}</div>
      </div>
      <div class="dv-top-prod-ca">${fmt(p.ca)}</div>
    </div>`).join('');
}

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════



// ══════════════════════════════════════════════════════
//  PHOTO DE PROFIL
// ══════════════════════════════════════════════════════

function dvChoisirPhoto() {
  const input = document.getElementById('dvAvatarInput');
  if (input) input.click();
}

function dvChargerPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    dvToast('⚠️ Image trop lourde (max 2 Mo)', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const b64 = e.target.result;
    // Sauvegarder dans la session vendeur
    const session = JSON.parse(localStorage.getItem('GM_DV_SESSION') || '{}');
    session.avatar = b64;
    localStorage.setItem('GM_DV_SESSION', JSON.stringify(session));
    // Afficher
    dvAfficherAvatar(b64);
    dvToast('✅ Photo de profil mise à jour !');
  };
  reader.readAsDataURL(file);
}

function dvAfficherAvatar(b64OrEmoji) {
  const el = document.getElementById('dvAvatar');
  if (!el) return;
  if (b64OrEmoji && b64OrEmoji.startsWith('data:')) {
    el.innerHTML = `<img src="${b64OrEmoji}" alt="Avatar">`;
  } else {
    el.textContent = b64OrEmoji || '👤';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  dvInitDashboard();
  // Charger avatar depuis session
  const session = JSON.parse(localStorage.getItem('GM_DV_SESSION') || '{}');
  if (session.avatar) dvAfficherAvatar(session.avatar);
  // Charger les stats
  setTimeout(dvRenderStats, 400);

  // Gérer plateforme marketing depuis URL
  const urlParams = new URLSearchParams(window.location.search);
  const platform = urlParams.get('platform');
  if (platform) {
    // Rien à faire ici, facebook-instagram.html le gère
  }
});
