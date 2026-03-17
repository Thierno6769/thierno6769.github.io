/**
 * GALY MARKET — SYSTÈME D'ABONNEMENT VENDEURS
 * Plans · Paiement · Activation · Contrôle · Expiration
 */

'use strict';

// ══════════════════════════════════════════════════════
//  PLANS D'ABONNEMENT
// ══════════════════════════════════════════════════════

const PLANS = [
  {
    id: 'gratuit',
    nom: 'Gratuit',
    emoji: '🆓',
    color: '#6b7280',
    prix_mensuel: 0,
    prix_annuel: 0,
    duree_jours: null,
    avantages: [
      '3 annonces maximum',
      'Recherche standard',
      'Messagerie de base',
    ],
    limites: [
      'Pas de boutique vendeur',
      'Pas de boost',
      'Pas de badge vérifié',
    ],
    max_annonces: 3,
    boost_mensuel: 0,
    boutique: false,
    badge: false,
    stats: false,
    top: false,
    pub: false,
    support: 'standard',
    populaire: false,
  },
  {
    id: 'basic',
    nom: 'Basic',
    emoji: '⭐',
    color: '#3b82f6',
    prix_mensuel: 50000,
    prix_annuel: 480000,
    duree_jours: 30,
    avantages: [
      '20 annonces par mois',
      '1 boost offert/mois',
      'Statistiques basiques',
      'Renouvellement automatique',
    ],
    limites: [
      'Pas de boutique vendeur',
      'Pas de badge vérifié',
    ],
    max_annonces: 20,
    boost_mensuel: 1,
    boutique: false,
    badge: false,
    stats: 'basic',
    top: false,
    pub: false,
    support: 'standard',
    populaire: false,
  },
  {
    id: 'pro',
    nom: 'Pro',
    emoji: '🚀',
    color: '#8b5cf6',
    prix_mensuel: 100000,
    prix_annuel: 960000,
    duree_jours: 30,
    avantages: [
      '50 annonces par mois',
      '5 boosts offerts/mois',
      'Boutique vendeur personnalisée',
      'Badge vendeur vérifié ✔️',
      'Statistiques avancées',
      'Messagerie avancée',
      'Catégories professionnelles',
      'Support standard',
    ],
    limites: [],
    max_annonces: 50,
    boost_mensuel: 5,
    boutique: true,
    badge: true,
    stats: 'advanced',
    top: false,
    pub: false,
    support: 'standard',
    populaire: true,
  },
  {
    id: 'premium',
    nom: 'Premium',
    emoji: '👑',
    color: '#f68b1e',
    prix_mensuel: 200000,
    prix_annuel: 1920000,
    duree_jours: 30,
    avantages: [
      'Annonces illimitées',
      'Boosts illimités',
      'Annonces EN TÊTE des résultats',
      'Boutique vendeur Premium',
      'Badge vérifié + Badge Premium',
      'Statistiques complètes',
      'Publicité interne',
      'Mise en avant automatique',
      'Support prioritaire 24h/7j',
      'Catégories professionnelles',
    ],
    limites: [],
    max_annonces: Infinity,
    boost_mensuel: Infinity,
    boutique: true,
    badge: true,
    stats: 'full',
    top: true,
    pub: true,
    support: 'prioritaire',
    populaire: false,
  },
];

// ══════════════════════════════════════════════════════
//  STORAGE
// ══════════════════════════════════════════════════════

const ABO_KEY  = 'GM_ABONNEMENTS';
const PAY_KEY  = 'GM_PAIEMENTS';

function getAbonnements() { return JSON.parse(localStorage.getItem(ABO_KEY) || '[]'); }
function saveAbonnements(a) { localStorage.setItem(ABO_KEY, JSON.stringify(a)); }
function getPaiements() { return JSON.parse(localStorage.getItem(PAY_KEY) || '[]'); }
function savePaiements(p) { localStorage.setItem(PAY_KEY, JSON.stringify(p)); }

const fmt = n => (n||0).toLocaleString('fr-FR') + ' GNF';

// ══════════════════════════════════════════════════════
//  ABONNEMENT ACTUEL DU VENDEUR
// ══════════════════════════════════════════════════════

function getAbonnementActuel(vendeurId) {
  const abos = getAbonnements();
  const now = new Date();
  return abos.find(a =>
    a.vendeurId === vendeurId &&
    a.statut === 'actif' &&
    new Date(a.date_fin) > now
  ) || null;
}

function getPlanById(id) { return PLANS.find(p => p.id === id) || PLANS[0]; }

// Vérifier si un vendeur peut publier une annonce
function peutPublier(vendeurId) {
  const abo = getAbonnementActuel(vendeurId);
  const plan = abo ? getPlanById(abo.planId) : PLANS[0];
  const anns = JSON.parse(localStorage.getItem('GM_ANNONCES') || '[]');
  const nbAnns = anns.filter(a => a.vendeurId === vendeurId && a.dispo !== false).length;
  if (plan.max_annonces === Infinity) return { ok: true, plan };
  return { ok: nbAnns < plan.max_annonces, nbActuel: nbAnns, max: plan.max_annonces, plan };
}

window.verifierPublicationAnnonce = peutPublier;

// ══════════════════════════════════════════════════════
//  RENDU DES PLANS
// ══════════════════════════════════════════════════════

let dureeMode = 'mensuel';

function setDuree(mode) {
  dureeMode = mode;
  document.getElementById('toggleMensuel')?.classList.toggle('active', mode === 'mensuel');
  document.getElementById('toggleAnnuel')?.classList.toggle('active', mode === 'annuel');
  const ball = document.getElementById('toggleBall');
  if (ball) ball.style.transform = mode === 'annuel' ? 'translateX(24px)' : 'translateX(0)';
  renderPlans();
}

function switchDuree() { setDuree(dureeMode === 'mensuel' ? 'annuel' : 'mensuel'); }

function renderPlans() {
  const grid = document.getElementById('aboPlansGrid');
  if (!grid) return;

  // Abonnement actuel
  const session = JSON.parse(localStorage.getItem('GM_SESSION') || '{}');
  const vendId = session.id || null;
  const aboActuel = vendId ? getAbonnementActuel(vendId) : null;

  grid.innerHTML = PLANS.map(plan => {
    const prix = dureeMode === 'annuel' ? plan.prix_annuel : plan.prix_mensuel;
    const prixMois = dureeMode === 'annuel' && plan.prix_annuel ? Math.round(plan.prix_annuel / 12) : null;
    const isActuel = aboActuel?.planId === plan.id;
    const isMeilleur = plan.populaire;

    return `
    <div class="abo-plan-card ${plan.id === 'premium' ? 'plan-premium' : ''} ${isMeilleur ? 'plan-populaire' : ''} ${isActuel ? 'plan-actuel' : ''}"
         style="--plan-color:${plan.color}">
      ${isMeilleur ? '<div class="abo-plan-badge-pop">⭐ PLUS POPULAIRE</div>' : ''}
      ${isActuel  ? '<div class="abo-plan-badge-actuel">✅ VOTRE PLAN</div>' : ''}

      <div class="abo-plan-header">
        <div class="abo-plan-emoji">${plan.emoji}</div>
        <div class="abo-plan-nom">${plan.nom}</div>
        <div class="abo-plan-prix">
          ${prix === 0
            ? '<span class="prix-gratuit">Gratuit</span>'
            : `<span class="prix-val">${fmt(prix)}</span><span class="prix-per">/${dureeMode === 'annuel' ? 'an' : 'mois'}</span>`
          }
          ${prixMois ? `<div class="prix-mois-eq">soit ${fmt(prixMois)}/mois</div>` : ''}
        </div>
      </div>

      <div class="abo-plan-avantages">
        ${plan.avantages.map(a => `
          <div class="abo-avantage yes"><i class="fas fa-check"></i> ${a}</div>`).join('')}
        ${plan.limites.map(l => `
          <div class="abo-avantage no"><i class="fas fa-times"></i> ${l}</div>`).join('')}
      </div>

      <div class="abo-plan-footer">
        ${isActuel
          ? `<button class="abo-btn-actuel" disabled>✅ Plan actuel</button>`
          : plan.id === 'gratuit'
          ? `<button class="abo-btn-gratuit" onclick="resterGratuit()">Continuer gratuitement</button>`
          : `<button class="abo-btn-souscrire" style="background:${plan.color}"
               onclick="ouvrirPaiement('${plan.id}','${dureeMode}')">
               S'abonner maintenant <i class="fas fa-arrow-right"></i>
             </button>`
        }
      </div>
    </div>`;
  }).join('');

  // Afficher abonnement actuel
  afficherAboActuel(aboActuel);
}

function afficherAboActuel(abo) {
  const sec = document.getElementById('aboCurrentSection');
  const card = document.getElementById('aboCurrentCard');
  if (!sec || !card || !abo) { if(sec) sec.style.display='none'; return; }

  const plan = getPlanById(abo.planId);
  const fin = new Date(abo.date_fin);
  const now = new Date();
  const joursRestants = Math.ceil((fin - now) / 86400000);
  const pct = Math.min(100, Math.round(joursRestants / 30 * 100));

  sec.style.display = 'block';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="font-size:48px">${plan.emoji}</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:800;color:#fff">Plan ${plan.nom} actif</div>
        <div style="font-size:13px;color:#888;margin-top:4px">
          Expire le <strong style="color:#f68b1e">${fin.toLocaleDateString('fr-FR')}</strong>
          · <strong style="color:${joursRestants <= 5 ? '#ef4444':'#22c55e'}">${joursRestants} jours restants</strong>
        </div>
        <div style="margin-top:10px;background:rgba(255,255,255,.08);border-radius:50px;height:6px">
          <div style="background:${joursRestants<=5?'#ef4444':'#f68b1e'};width:${pct}%;height:6px;border-radius:50px;transition:width 1s"></div>
        </div>
      </div>
      <button onclick="ouvrirPaiement('${plan.id}','mensuel')"
        style="background:${plan.color};color:#fff;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px">
        🔄 Renouveler
      </button>
    </div>
    ${joursRestants <= 5 ? `
    <div style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:12px;margin-top:14px;font-size:13px;color:#ef4444">
      <i class="fas fa-exclamation-triangle"></i> Votre abonnement expire dans <strong>${joursRestants} jours</strong> !
      Renouvelez maintenant pour ne pas perdre vos avantages.
    </div>` : ''}`;
}

// ══════════════════════════════════════════════════════
//  MODAL PAIEMENT
// ══════════════════════════════════════════════════════

let planSelectionne = null;
let dureeSelectionnee = 'mensuel';

function ouvrirPaiement(planId, duree) {
  planSelectionne = planId;
  dureeSelectionnee = duree;
  const plan = getPlanById(planId);
  const prix = duree === 'annuel' ? plan.prix_annuel : plan.prix_mensuel;

  document.getElementById('aboPayContent').innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:48px;margin-bottom:8px">${plan.emoji}</div>
      <h2 style="color:#fff;margin-bottom:4px">Plan ${plan.nom}</h2>
      <div style="font-size:28px;font-weight:800;color:${plan.color}">${fmt(prix)}</div>
      <div style="color:#888;font-size:13px">/${duree === 'annuel' ? 'an' : 'mois'}</div>
    </div>

    <div style="margin-bottom:20px">
      <div style="font-size:13px;font-weight:600;color:#888;margin-bottom:10px;text-transform:uppercase">Choisir le mode de paiement</div>
      <div style="display:grid;gap:10px">
        <div class="pay-method" onclick="selectionnerMethode('orange',this)" style="--m-color:#ff6600">
          <div style="font-size:28px">🟠</div>
          <div><strong>Orange Money</strong><br><small style="color:#888">Paiement mobile sécurisé</small></div>
          <i class="fas fa-chevron-right" style="color:#888;margin-left:auto"></i>
        </div>
        <div class="pay-method" onclick="selectionnerMethode('mtn',this)" style="--m-color:#ffd700">
          <div style="font-size:28px">🟡</div>
          <div><strong>MTN MoMo</strong><br><small style="color:#888">Mobile Money</small></div>
          <i class="fas fa-chevron-right" style="color:#888;margin-left:auto"></i>
        </div>
      </div>
    </div>

    <div id="payDetails" style="display:none"></div>

    <div style="font-size:11px;color:#666;text-align:center;margin-top:12px">
      <i class="fas fa-shield-check" style="color:#22c55e"></i>
      Paiement sécurisé · Activation sous 24h · Support: +224 627 90 05 78
    </div>`;

  document.getElementById('aboPayModal').classList.add('open');
}

function selectionnerMethode(methode, el) {
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');

  const plan = getPlanById(planSelectionne);
  const prix = dureeSelectionnee === 'annuel' ? plan.prix_annuel : plan.prix_mensuel;
  const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
  const waShop = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');
  const detailsDiv = document.getElementById('payDetails');

  // Numéro de dépôt (pour recevoir les paiements)
  const MON_NUMERO_ORANGE = '627 90 05 78';
  const MON_NUMERO_MTN    = '627 90 05 78';

  if (methode === 'orange' || methode === 'mtn') {
    const isOrange = methode === 'orange';
    const couleur  = isOrange ? '#ff6600' : '#ffd700';
    const icone    = isOrange ? '🟠' : '🟡';
    const nom      = isOrange ? 'Orange Money' : 'MTN MoMo';
    const monNum   = isOrange ? MON_NUMERO_ORANGE : MON_NUMERO_MTN;
    const ussd     = isOrange ? 'Composez *144# sur votre téléphone Orange' : 'Ouvrez l\'app MTN MoMo';

    detailsDiv.style.display = 'block';
    detailsDiv.innerHTML = `
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:20px;margin-top:4px">
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:14px">${icone} Instructions de paiement</div>

        ${[
          ussd,
          `Envoyez <strong style="color:${couleur}">${fmt(prix)}</strong> au numéro : <strong style="color:#fff">+224 ${monNum}</strong>`,
          'Prenez une <strong style="color:#fff">capture d\'écran</strong> de la confirmation',
          'Appuyez sur le bouton ci-dessous pour m\'envoyer la capture sur WhatsApp',
          'Activation de votre abonnement dans les <strong style="color:#fff">24h</strong>'
        ].map((e, i) => `
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;font-size:13px">
            <span style="width:22px;height:22px;min-width:22px;background:${couleur};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${i+1}</span>
            <span style="color:#ccc;line-height:1.5">${e}</span>
          </div>`).join('')}

        <button onclick="confirmerDemandeAbo('${methode}')"
          style="width:100%;background:linear-gradient(135deg,${couleur},${isOrange ? '#d4780f' : '#b8a000'});
          color:#fff;border:none;padding:15px;border-radius:12px;font-size:15px;font-weight:700;
          cursor:pointer;font-family:'DM Sans',sans-serif;margin-top:8px;
          display:flex;align-items:center;justify-content:center;gap:10px">
          <i class="fab fa-whatsapp"></i> J'ai effectué le paiement — Envoyer la capture
        </button>
      </div>`;
    return;
  }

  detailsDiv.style.display = 'none';
}

function confirmerPaiementMobile(methode, monNumero, couleur) {
  const numero = document.getElementById('payNumero')?.value.trim().replace(/[^0-9]/g,'');
  if (!numero || numero.length < 8) {
    alert('⚠️ Veuillez entrer votre numéro de téléphone valide.');
    return;
  }
  const plan    = getPlanById(planSelectionne);
  const prix    = dureeSelectionnee === 'annuel' ? plan.prix_annuel : plan.prix_mensuel;
  const isOrange = methode === 'orange';
  const nomPay  = isOrange ? 'Orange Money' : 'MTN MoMo';
  const s       = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
  const waShop  = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');

  const msg = `💳 *PAIEMENT ABONNEMENT — GALY MARKET*\n\n📋 Plan : *${plan.nom}*\n💰 Montant : *${fmt(prix)}*\n📅 Durée : *${dureeSelectionnee === 'annuel' ? '1 an' : '1 mois'}*\n\n📱 Méthode : *${nomPay}*\n📞 Mon numéro : *+224 ${numero}*\n🎯 Numéro destinataire : *${monNumero}*\n\n✅ Je confirme avoir effectué le paiement. Merci d'activer mon abonnement !`;

  window.open(`https://wa.me/${waShop}?text=${encodeURIComponent(msg)}`, '_blank');
  confirmerDemandeAbo(methode);
}

function confirmerDemandeAbo(methode) {
  const plan = getPlanById(planSelectionne);
  const prix = dureeSelectionnee === 'annuel' ? plan.prix_annuel : plan.prix_mensuel;
  const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
  const waShop = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');

  // Enregistrer demande en attente
  const paiements = getPaiements();
  const ref = 'PAY' + Date.now();
  const session = JSON.parse(localStorage.getItem('GM_SESSION')||'{}');

  paiements.push({
    id: ref,
    vendeurId: session.id || 'unknown',
    vendeurNom: session.nom || 'Vendeur',
    planId: planSelectionne,
    montant: prix,
    duree: dureeSelectionnee,
    methode,
    statut: 'en_attente',
    date: new Date().toISOString(),
  });
  savePaiements(paiements);

  // WhatsApp — demander la capture d'écran du paiement
  const nomPay = methode === 'orange' ? 'Orange Money' : 'MTN MoMo';
  const numDepot = '627 90 05 78';
  const msg = `📸 *CONFIRMATION DE PAIEMENT — GALY MARKET*\n\n👤 Nom : ${session.nom || 'Inconnu'}\n📞 Tél : ${session.tel || '—'}\n\n📋 Plan : *${plan.nom}*\n💰 Montant : *${fmt(prix)}*\n📅 Durée : *${dureeSelectionnee === 'annuel' ? '1 an' : '1 mois'}*\n💳 Méthode : *${nomPay}*\n🎯 Numéro dépôt : *+224 ${numDepot}*\n🔖 Réf : ${ref}\n\n📎 *Veuillez trouver ci-joint la capture d'écran de ma confirmation de paiement.*\n\nMerci d'activer mon abonnement !`;
  window.open(`https://wa.me/${waShop}?text=${encodeURIComponent(msg)}`, '_blank');

  fermerAboModal();
  alert(`✅ Votre demande a été envoyée !\n\nRéférence: ${ref}\n\nNotre équipe activera votre abonnement dans les 24h après vérification du paiement.\n\nMerci de garder votre WhatsApp actif.`);
}

function fermerAboModal() {
  document.getElementById('aboPayModal')?.classList.remove('open');
}

function resterGratuit() {
  window.location.href = 'publier-annonce.html';
}

// ══════════════════════════════════════════════════════
//  ACTIVATION (par l'admin)
// ══════════════════════════════════════════════════════

window.activerAbonnement = function(vendeurId, planId, duree) {
  const plan = getPlanById(planId);
  const debut = new Date();
  const fin = new Date();
  const jours = duree === 'annuel' ? 365 : (plan.duree_jours || 30);
  fin.setDate(fin.getDate() + jours);

  const abos = getAbonnements();
  // Désactiver l'ancien
  abos.forEach(a => { if (a.vendeurId === vendeurId) a.statut = 'expiré'; });

  abos.push({
    id: 'abo' + Date.now(),
    vendeurId, planId,
    date_debut: debut.toISOString(),
    date_fin:   fin.toISOString(),
    duree, statut: 'actif',
    jours,
  });
  saveAbonnements(abos);

  // Mettre à jour le vendeur
  const vends = JSON.parse(localStorage.getItem('GM_VENDEURS')||'[]');
  const vend = vends.find(v => v.id === vendeurId);
  if (vend) {
    vend.premium  = planId === 'premium';
    vend.verifie  = ['pro','premium'].includes(planId);
    vend.planId   = planId;
    vend.abo_fin  = fin.toISOString();
    localStorage.setItem('GM_VENDEURS', JSON.stringify(vends));
  }

  return true;
};

// ══════════════════════════════════════════════════════
//  VÉRIFICATION EXPIRATION (appelée au chargement)
// ══════════════════════════════════════════════════════

function verifierExpirations() {
  const abos = getAbonnements();
  const now = new Date();
  let changed = false;

  abos.forEach(a => {
    if (a.statut === 'actif' && new Date(a.date_fin) <= now) {
      a.statut = 'expiré';
      changed = true;
      // Notifier si c'est le vendeur connecté
      const session = JSON.parse(localStorage.getItem('GM_SESSION')||'{}');
      if (a.vendeurId === session.id) {
        afficherNotifExpiration();
      }
    }
    // Alerte 5 jours avant
    if (a.statut === 'actif') {
      const joursRestants = Math.ceil((new Date(a.date_fin) - now) / 86400000);
      if (joursRestants <= 5 && joursRestants > 0) {
        const session = JSON.parse(localStorage.getItem('GM_SESSION')||'{}');
        if (a.vendeurId === session.id) {
          afficherAlertExpiration(joursRestants, a.planId);
        }
      }
    }
  });

  if (changed) saveAbonnements(abos);
}

function afficherNotifExpiration() {
  const notif = document.createElement('div');
  notif.innerHTML = `
    <div style="position:fixed;top:80px;right:20px;background:#ef4444;color:#fff;
      padding:14px 20px;border-radius:14px;z-index:99999;max-width:300px;
      box-shadow:0 8px 24px rgba(239,68,68,.4);animation:slideIn .4s ease">
      <div style="font-weight:700;margin-bottom:4px">⚠️ Abonnement expiré !</div>
      <div style="font-size:12px;opacity:.9">Votre abonnement a expiré. Renouvelez pour garder vos avantages.</div>
      <a href="abonnements.html" style="display:block;margin-top:8px;background:rgba(255,255,255,.2);
        color:#fff;text-align:center;padding:8px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12px">
        Renouveler maintenant
      </a>
    </div>`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 8000);
}

function afficherAlertExpiration(jours, planId) {
  const plan = getPlanById(planId);
  const notif = document.createElement('div');
  notif.innerHTML = `
    <div style="position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#f68b1e,#e07b0e);
      color:#fff;padding:14px 20px;border-radius:14px;z-index:99999;max-width:300px;
      box-shadow:0 8px 24px rgba(246,139,30,.4)">
      <div style="font-weight:700;margin-bottom:4px">🔔 Abonnement bientôt expiré</div>
      <div style="font-size:12px;opacity:.9">Plan ${plan.nom} — expire dans <strong>${jours} jours</strong></div>
      <a href="abonnements.html" style="display:block;margin-top:8px;background:rgba(255,255,255,.2);
        color:#fff;text-align:center;padding:8px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12px">
        Renouveler
      </a>
    </div>`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 6000);
}

// ══════════════════════════════════════════════════════
//  FAQ
// ══════════════════════════════════════════════════════

function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const icon = el.querySelector('i');
  const isOpen = answer.style.display === 'block';
  answer.style.display = isOpen ? 'none' : 'block';
  if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  verifierExpirations();
  renderPlans();
});

// Exporter pour utilisation globale
window.PLANS_ABO = PLANS;
window.getPlanVendeur = function(vendeurId) {
  const abo = getAbonnementActuel(vendeurId);
  return abo ? getPlanById(abo.planId) : PLANS[0];
};
window.peutPublierAnnonce = peutPublier;
window.getAbonnementActuel = getAbonnementActuel;
