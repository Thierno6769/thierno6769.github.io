/**
 * GALY MARKET — ANNONCES (Style Guineezone)
 * Annonces · Publication · Boutique · Messagerie · Boost · Premium
 */

'use strict';

// ══════════════════════════════════════════════════════
//  CONSTANTES & DONNÉES
// ══════════════════════════════════════════════════════

const ANN_KEY       = 'GM_ANNONCES';
const VEND_KEY      = 'GM_VENDEURS';
const MSG_KEY       = 'GM_MESSAGES';
const PREM_KEY      = 'GM_PREMIUM';
const FOLLOW_KEY    = 'GM_FOLLOWS';

const ANN_CATS = [
  { key:'immobilier',   label:'Immobilier',         emoji:'🏠', color:'#3b82f6' },
  { key:'vehicules',    label:'Véhicules',           emoji:'🚗', color:'#ef4444' },
  { key:'phones',       label:'Téléphones & Tech',   emoji:'📱', color:'#8b5cf6' },
  { key:'informatique', label:'Informatique',        emoji:'💻', color:'#06b6d4' },
  { key:'mode',         label:'Mode & Vêtements',    emoji:'👕', color:'#ec4899' },
  { key:'electromenager',label:'Électroménager',     emoji:'🔌', color:'#f59e0b' },
  { key:'emploi',       label:'Emploi & Services',   emoji:'💼', color:'#10b981' },
  { key:'meubles',      label:'Meubles & Déco',      emoji:'🪑', color:'#84cc16' },
  { key:'alimentation', label:'Alimentation',        emoji:'🍎', color:'#f97316' },
  { key:'animaux',      label:'Animaux',             emoji:'🐾', color:'#a78bfa' },
  { key:'sport',        label:'Sport & Fitness',     emoji:'⚽', color:'#22c55e' },
  { key:'auto',         label:'Auto & Moto',         emoji:'🏍️', color:'#dc2626' },
  { key:'bebe',         label:'Bébé & Enfant',       emoji:'👶', color:'#fb7185' },
  { key:'bijoux',       label:'Bijoux & Montres',    emoji:'💍', color:'#fbbf24' },
  { key:'beaute',       label:'Beauté & Soins',      emoji:'💄', color:'#f472b6' },
  { key:'livres',       label:'Livres & Culture',    emoji:'📚', color:'#6366f1' },
  { key:'autres',       label:'Autres',              emoji:'📦', color:'#6b7280' },
];

const ANNONCES_DEMO = [
  { id:'ann1', titre:'iPhone 14 Pro Max 256GB Neuf sous blister', cat:'phones', prix:18000000, ville:'Conakry', quartier:'Kaloum', etat:'neuf', nego:'non', desc:'iPhone 14 Pro Max 256GB couleur noir sidéral. Neuf, jamais utilisé, sous blister original. Livraison possible.', photos:[], vendeurId:'v1', vues:245, date:'2026-03-10', boost:true, dispo:true },
  { id:'ann2', titre:'Appartement F3 à louer Ratoma meublé', cat:'immobilier', prix:2500000, ville:'Conakry', quartier:'Ratoma', etat:'bon', nego:'oui', desc:'Bel appartement F3 entièrement meublé, climatisé. Quartier calme. 2 chambres, salon, cuisine équipée.', photos:[], vendeurId:'v2', vues:187, date:'2026-03-09', boost:false, dispo:true },
  { id:'ann3', titre:'Toyota Corolla 2019 essence climatisée', cat:'vehicules', prix:85000000, ville:'Conakry', quartier:'Matam', etat:'excellent', nego:'oui', desc:'Toyota Corolla 2019, essence, automatique, climatisée, très bon état. Papiers complets. Visite possible.', photos:[], vendeurId:'v1', vues:312, date:'2026-03-08', boost:true, dispo:true },
  { id:'ann4', titre:'Samsung Galaxy S23 Ultra 256GB', cat:'phones', prix:15000000, ville:'Labé', quartier:'Centre', etat:'excellent', nego:'oui', desc:'Samsung S23 Ultra 256GB noir, en excellent état. Avec chargeur original et coque de protection.', photos:[], vendeurId:'v3', vues:98, date:'2026-03-07', boost:false, dispo:true },
  { id:'ann5', titre:'Réfrigérateur Samsung 300L No Frost', cat:'electromenager', prix:8500000, ville:'Conakry', quartier:'Lambanyi', etat:'bon', nego:'non', desc:'Réfrigérateur Samsung 300L, No Frost, moins de 2 ans. Fonctionne parfaitement. Livraison possible.', photos:[], vendeurId:'v2', vues:76, date:'2026-03-06', boost:false, dispo:true },
  { id:'ann6', titre:'Terrain 500m² à vendre Dubréka', cat:'immobilier', prix:120000000, ville:'Kindia', quartier:'Dubréka', etat:'neuf', nego:'oui', desc:'Terrain de 500m², titre foncier, quartier résidentiel en développement. Idéal construction villa.', photos:[], vendeurId:'v3', vues:203, date:'2026-03-05', boost:false, dispo:true },
];

const VENDEURS_DEMO = [
  { id:'v1', nom:'Mamadou Diallo', ville:'Conakry', tel:'224620123456', wa:'224620123456', membre:'2025-01', premium:true, verifie:true, ventes:47, note:4.8, avatar:'👨‍💼' },
  { id:'v2', nom:'Fatoumata Camara', ville:'Conakry', tel:'224622654321', wa:'224622654321', membre:'2025-06', premium:false, verifie:true, ventes:23, note:4.5, avatar:'👩‍💼' },
  { id:'v3', nom:'Ibrahim Bah', ville:'Labé', tel:'224628111222', wa:'224628111222', membre:'2026-01', premium:false, verifie:false, ventes:8, note:4.2, avatar:'👨' },
];

// ══════════════════════════════════════════════════════
//  INIT & STORAGE
// ══════════════════════════════════════════════════════

function getAnnonces() {
  const stored = JSON.parse(localStorage.getItem(ANN_KEY) || '[]');
  return stored.length ? stored : ANNONCES_DEMO;
}
function saveAnnonces(a) { localStorage.setItem(ANN_KEY, JSON.stringify(a)); }
function getVendeurs() {
  const stored = JSON.parse(localStorage.getItem(VEND_KEY) || '[]');
  return stored.length ? stored : VENDEURS_DEMO;
}
function saveVendeurs(v) { localStorage.setItem(VEND_KEY, JSON.stringify(v)); }
function getMessages() { return JSON.parse(localStorage.getItem(MSG_KEY) || '{}'); }
function saveMessages(m) { localStorage.setItem(MSG_KEY, JSON.stringify(m)); }

const fmt = n => (n||0).toLocaleString('fr-FR') + ' GNF';
const timeAgo = d => {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff/3600000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  const j = Math.floor(h/24);
  if (j < 7) return `Il y a ${j}j`;
  return new Date(d).toLocaleDateString('fr-FR');
};

// Récupérer l'abonnement actif d'un vendeur
function getAbonnementVendeur(vendeurId) {
  const abos = JSON.parse(localStorage.getItem('GM_ABONNEMENTS') || '[]');
  return abos.find(a => a.vendeurId === vendeurId && a.statut === 'actif') || null;
}

// Ajouter annonce au panier
window.ajouterAnnAuPanier = function(annId) {
  const anns = getAnnonces();
  const ann = anns.find(a => a.id === annId);
  if (!ann) return;
  const cart = JSON.parse(localStorage.getItem('GM_CART') || '[]');
  const exist = cart.find(i => i.id === annId);
  if (exist) { exist.qty++; }
  else { cart.push({ id: annId, name: ann.titre, price: ann.prix, qty: 1, em: ANN_CATS.find(c=>c.key===ann.cat)?.emoji||'📦' }); }
  localStorage.setItem('GM_CART', JSON.stringify(cart));
  // Toast
  const t = document.getElementById('toast'), m = document.getElementById('toastMsg');
  if (t && m) { m.textContent = '✅ Ajouté au panier !'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
};

// Toggle favori annonce
window.toggleAnnFav = function(annId, btn) {
  const favs = JSON.parse(localStorage.getItem('GM_ANN_FAVS') || '[]');
  const idx = favs.indexOf(annId);
  if (idx >= 0) { favs.splice(idx,1); btn.innerHTML='<i class="far fa-heart" style="color:#ccc"></i>'; }
  else { favs.push(annId); btn.innerHTML='<i class="fas fa-heart" style="color:#e53935"></i>'; }
  localStorage.setItem('GM_ANN_FAVS', JSON.stringify(favs));
};

// ══════════════════════════════════════════════════════
//  RENDU CARTE ANNONCE
// ══════════════════════════════════════════════════════

let currentAnnId = null;
let currentVendWa = null;
let pageAnn = 0;
const PER_PAGE = 12;

function makeAnnCard(ann) {
  const vendeurs = getVendeurs();
  const vend = vendeurs.find(v => v.id === ann.vendeurId) || {};
  const cat = ANN_CATS.find(c => c.key === ann.cat) || { emoji:'📦', color:'#888', label:'Autre' };

  // Priorité d'affichage selon forfait
  const abo = getAbonnementVendeur(ann.vendeurId);
  const forfait = abo?.planId || 'gratuit';
  const isVendeurPro = ['basic','pro','premium'].includes(forfait);
  const isUrgent = ann.boost || forfait === 'premium';
  const isVenteFlash = ann.flash || forfait === 'pro';

  // Badge forfait
  const vendeurBadge = isVendeurPro
    ? `<span style="background:#e8f5e9;color:#2e7d32;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;border:1px solid #a5d6a7">Vendeur pro</span>`
    : '';

  // Badges urgence/flash
  const urgentBadge = isUrgent ? `<div style="position:absolute;top:8px;left:8px;background:#e53935;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;z-index:2">URGENTE</div>` : '';
  const flashBadge  = isVenteFlash && !isUrgent ? `<div style="position:absolute;top:8px;left:8px;background:#ff6f00;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;z-index:2">VENTE FLASH</div>` : '';

  // Prix
  const prixHtml = ann.prix > 0
    ? `<div style="font-size:16px;font-weight:800;color:#1a1a1a;margin:6px 0">${fmt(ann.prix)}</div>`
    : `<div style="font-size:15px;font-weight:700;color:#2e7d32;margin:6px 0">Gratuit</div>`;

  // Photo
  const photoHtml = ann.photos && ann.photos[0]
    ? `<img src="${ann.photos[0]}" alt="${ann.titre}" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;font-size:56px">${cat.emoji}</div>`;

  return `
    <div onclick="ouvrirAnnonce('${ann.id}')" style="
      background:#fff;border-radius:12px;overflow:hidden;cursor:pointer;
      box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #f0f0f0;
      transition:transform .2s,box-shadow .2s;
    "
    onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.15)'"
    onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,.08)'">

      <!-- Image -->
      <div style="position:relative;height:180px;overflow:hidden">
        ${photoHtml}
        ${urgentBadge}${flashBadge}
        <!-- Favoris -->
        <button onclick="event.stopPropagation();toggleAnnFav('${ann.id}',this)"
          style="position:absolute;top:8px;right:8px;width:34px;height:34px;border-radius:50%;
          background:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,.15);font-size:16px;z-index:2">
          <i class="far fa-heart" style="color:#ccc"></i>
        </button>
      </div>

      <!-- Body -->
      <div style="padding:10px 12px 12px">
        <!-- Titre -->
        <div style="font-size:13px;font-weight:600;color:#1a1a1a;line-height:1.4;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
          min-height:36px;margin-bottom:4px">${ann.titre}</div>

        <!-- Localisation + badge vendeur -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;gap:6px">
          <span style="font-size:11px;color:#e53935;display:flex;align-items:center;gap:3px">
            <i class="fas fa-map-marker-alt"></i> ${ann.ville}
          </span>
          ${vendeurBadge}
        </div>

        <!-- Prix -->
        ${prixHtml}

        <!-- Bouton Ajouter -->
        <button onclick="event.stopPropagation();ajouterAnnAuPanier('${ann.id}')"
          style="width:100%;background:#2e7d32;color:#fff;border:none;border-radius:8px;
          padding:10px;font-size:13px;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          font-family:'DM Sans',sans-serif;transition:background .2s;margin-top:4px"
          onmouseover="this.style.background='#1b5e20'"
          onmouseout="this.style.background='#2e7d32'">
          <i class="fas fa-cart-plus"></i> Ajouter
        </button>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════
//  PAGE ANNONCES — INIT
// ══════════════════════════════════════════════════════

function initPageAnnonces() {
  if (!document.getElementById('annCatsGrid')) return;
  const anns = getAnnonces();
  const vends = getVendeurs();

  // Stats
  const sTA = document.getElementById('statTotalAnn');
  const sTV = document.getElementById('statTotalVend');
  if (sTA) sTA.textContent = anns.length;
  if (sTV) sTV.textContent = vends.length;

  // Catégories
  const cGrid = document.getElementById('annCatsGrid');
  if (cGrid) {
    cGrid.innerHTML = ANN_CATS.map(c => {
      const nb = anns.filter(a => a.cat === c.key).length;
      return `<div class="ann-cat-card" onclick="filtrerParCat('${c.key}')" style="--cat-color:${c.color}">
        <span class="ann-cat-emoji">${c.emoji}</span>
        <span class="ann-cat-label">${c.label}</span>
        <span class="ann-cat-nb">${nb}</span>
      </div>`;
    }).join('');
  }

  // Annonces boostées
  const boostees = anns.filter(a => a.boost && a.dispo);
  const secBoost = document.getElementById('secBoost');
  const gridBoost = document.getElementById('gridBoost');
  if (boostees.length && secBoost && gridBoost) {
    secBoost.style.display = 'block';
    gridBoost.innerHTML = boostees.map(makeAnnCard).join('');
  }

  filtrerAnnonces();
}

function filtrerAnnonces() {
  const anns = getAnnonces();
  const cat   = document.getElementById('filtreCat')?.value || '';
  const prix  = document.getElementById('filtrePrix')?.value || '';
  const ville = document.getElementById('filtreVille')?.value || '';
  const tri   = document.getElementById('filtreTri')?.value || 'recent';
  const q     = document.getElementById('annSearchInput')?.value.toLowerCase() || '';

  let filtered = anns.filter(a => a.dispo !== false);
  if (cat)   filtered = filtered.filter(a => a.cat === cat);
  if (ville) filtered = filtered.filter(a => a.ville === ville);
  if (q)     filtered = filtered.filter(a => a.titre.toLowerCase().includes(q) || a.desc?.toLowerCase().includes(q));
  if (prix) {
    const [min, max] = prix.split('-').map(Number);
    filtered = filtered.filter(a => max ? (a.prix >= min && a.prix <= max) : a.prix >= min);
  }

  // Tri par forfait (Premium → Pro → Basic → Gratuit) puis par date
  const FORFAIT_POIDS = { premium: 4, pro: 3, basic: 2, gratuit: 1 };
  filtered.sort((a, b) => {
    const aboA = getAbonnementVendeur(a.vendeurId);
    const aboB = getAbonnementVendeur(b.vendeurId);
    const poidsA = FORFAIT_POIDS[aboA?.planId] || 1;
    const poidsB = FORFAIT_POIDS[aboB?.planId] || 1;
    // D'abord boost manuel
    if (b.boost !== a.boost) return (b.boost ? 1 : 0) - (a.boost ? 1 : 0);
    // Puis forfait
    if (poidsB !== poidsA) return poidsB - poidsA;
    // Puis tri choisi
    if (tri === 'prix_asc')  return a.prix - b.prix;
    if (tri === 'prix_desc') return b.prix - a.prix;
    if (tri === 'vues')      return (b.vues||0) - (a.vues||0);
    return new Date(b.date) - new Date(a.date);
  });

  const grid = document.getElementById('gridAnnonces');
  const empty = document.getElementById('annEmpty');
  const more = document.getElementById('annLoadMore');
  if (!grid) return;

  pageAnn = 0;
  const slice = filtered.slice(0, PER_PAGE);
  grid.innerHTML = slice.map(makeAnnCard).join('');
  if (empty) empty.style.display = filtered.length ? 'none' : 'block';
  if (more)  more.style.display  = filtered.length > PER_PAGE ? 'block' : 'none';
  grid._allFiltered = filtered;
}

function filtrerParCat(cat) {
  const sel = document.getElementById('filtreCat');
  if (sel) { sel.value = cat; filtrerAnnonces(); }
  document.getElementById('gridAnnonces')?.scrollIntoView({ behavior:'smooth', block:'start' });
}

function rechercherAnnonces() {
  const q = document.getElementById('annSearchInput')?.value;
  const ville = document.getElementById('annSearchVille')?.value;
  const filtreVille = document.getElementById('filtreVille');
  if (filtreVille && ville) filtreVille.value = ville;
  filtrerAnnonces();
  document.getElementById('gridAnnonces')?.scrollIntoView({ behavior:'smooth' });
}

function chargerPlus() {
  const grid = document.getElementById('gridAnnonces');
  if (!grid || !grid._allFiltered) return;
  pageAnn++;
  const slice = grid._allFiltered.slice(0, (pageAnn+1)*PER_PAGE);
  grid.innerHTML = slice.map(makeAnnCard).join('');
  const more = document.getElementById('annLoadMore');
  if (more) more.style.display = slice.length < grid._allFiltered.length ? 'block' : 'none';
}

// ══════════════════════════════════════════════════════
//  MODAL DÉTAIL ANNONCE
// ══════════════════════════════════════════════════════

function ouvrirAnnonce(id) {
  const anns = getAnnonces();
  const vends = getVendeurs();
  const ann = anns.find(a => a.id === id);
  if (!ann) return;
  const vend = vends.find(v => v.id === ann.vendeurId) || {};
  const cat = ANN_CATS.find(c => c.key === ann.cat) || { emoji:'📦', label:'Autre', color:'#888' };
  currentAnnId = id;
  currentVendWa = vend.wa || vend.tel || '';

  // Incrémenter vues
  ann.vues = (ann.vues||0) + 1;
  saveAnnonces(anns);

  const etatColors = { neuf:'#22c55e', excellent:'#3b82f6', bon:'#f59e0b', usage:'#6b7280' };
  const etatLabels = { neuf:'Neuf', excellent:'Excellent état', bon:'Bon état', usage:'Usagé' };

  document.getElementById('annModalContent').innerHTML = `
    <div class="ann-detail">
      <!-- Photos -->
      <div class="ann-detail-img" style="background:linear-gradient(135deg,${cat.color}22,${cat.color}11);min-height:220px;display:flex;align-items:center;justify-content:center;border-radius:12px;margin-bottom:16px">
        ${ann.photos && ann.photos[0]
          ? `<img src="${ann.photos[0]}" style="width:100%;height:220px;object-fit:cover;border-radius:12px">`
          : `<span style="font-size:80px">${cat.emoji}</span>`}
      </div>

      <!-- Titre & Prix -->
      <div style="margin-bottom:12px">
        ${ann.boost ? '<span style="background:#f68b1e;color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;margin-bottom:8px;display:inline-block"><i class="fas fa-bolt"></i> À LA UNE</span>' : ''}
        <h2 style="font-size:20px;font-weight:700;color:#fff;margin:8px 0">${ann.titre}</h2>
        <div style="font-size:24px;font-weight:800;color:#f68b1e">${fmt(ann.prix)}</div>
        ${ann.nego==='oui' ? '<span style="background:rgba(34,197,94,.15);color:#22c55e;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">✅ Prix négociable</span>' : ''}
      </div>

      <!-- Infos -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px;font-size:13px">
          <div style="color:#888;font-size:11px">CATÉGORIE</div>
          <div>${cat.emoji} ${cat.label}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px;font-size:13px">
          <div style="color:#888;font-size:11px">ÉTAT</div>
          <div style="color:${etatColors[ann.etat]||'#888'}">${etatLabels[ann.etat]||ann.etat}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px;font-size:13px">
          <div style="color:#888;font-size:11px">LOCALISATION</div>
          <div>📍 ${ann.ville}${ann.quartier?', '+ann.quartier:''}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px;font-size:13px">
          <div style="color:#888;font-size:11px">PUBLIÉE</div>
          <div>${timeAgo(ann.date)}</div>
        </div>
      </div>

      <!-- Description -->
      <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:14px;margin-bottom:16px">
        <div style="color:#888;font-size:11px;margin-bottom:6px">DESCRIPTION</div>
        <p style="font-size:14px;line-height:1.7;color:#ccc">${ann.desc}</p>
      </div>

      <!-- Vendeur -->
      <div class="ann-detail-vend" onclick="voirBoutiqueVendeur('${vend.id}')">
        <span style="font-size:32px">${vend.avatar||'👤'}</span>
        <div style="flex:1">
          <div style="font-weight:700;font-size:15px">${vend.nom||'Vendeur'}
            ${vend.premium?'<span style="background:#ffd700;color:#000;padding:1px 8px;border-radius:20px;font-size:10px;font-weight:700;margin-left:6px">👑 PREMIUM</span>':''}
            ${vend.verifie?'<span style="color:#22c55e;font-size:13px;margin-left:4px"><i class="fas fa-check-circle"></i></span>':''}
          </div>
          <div style="color:#888;font-size:12px">📍 ${vend.ville||''} · ${vend.ventes||0} ventes · ⭐ ${vend.note||'—'}</div>
        </div>
        <i class="fas fa-chevron-right" style="color:#888"></i>
      </div>

      <!-- Boutons action -->
      <div style="display:grid;gap:10px;margin-top:16px">
        <button onclick="ouvrirMessagerie('${ann.id}')" style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;border:1px solid rgba(255,255,255,.15);padding:14px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px">
          <i class="fas fa-comment-dots" style="font-size:18px"></i> Envoyer un message
        </button>
        <button onclick="contactWhatsApp('${ann.id}')" style="background:linear-gradient(135deg,#25d366,#1ebe5d);color:#fff;border:none;padding:14px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px">
          <i class="fab fa-whatsapp" style="font-size:20px"></i> Contacter sur WhatsApp
        </button>
        <button onclick="boosterAnnonce('${ann.id}')" style="background:linear-gradient(135deg,#f68b1e,#e07b0e);color:#fff;border:none;padding:12px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
          <i class="fas fa-rocket"></i> Booster cette annonce — 50 000 GNF
        </button>
      </div>
    </div>`;

  document.getElementById('annModal').classList.add('open');
}

function fermerModal() {
  document.getElementById('annModal')?.classList.remove('open');
}

// ══════════════════════════════════════════════════════
//  CONTACT WHATSAPP
// ══════════════════════════════════════════════════════

function contactWhatsApp(annId) {
  const ann = getAnnonces().find(a => a.id === annId);
  const vend = getVendeurs().find(v => v.id === ann?.vendeurId);
  if (!ann || !vend) return;
  const wa = (vend.wa || vend.tel || '').replace(/[^0-9]/g,'');
  const msg = `Bonjour ! 👋\n\nJe suis intéressé(e) par votre annonce sur *Galy Market* :\n\n📢 *${ann.titre}*\n💰 Prix: ${fmt(ann.prix)}\n📍 ${ann.ville}\n\nEst-ce que c'est toujours disponible ?`;
  if (wa) window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ══════════════════════════════════════════════════════
//  MESSAGERIE INTERNE
// ══════════════════════════════════════════════════════

function ouvrirMessagerie(annId) {
  const ann = getAnnonces().find(a => a.id === annId);
  const vend = getVendeurs().find(v => v.id === ann?.vendeurId);
  if (!ann) return;
  currentAnnId = annId;
  currentVendWa = vend?.wa || vend?.tel || '';

  const modal = document.getElementById('msgModal');
  const title = document.getElementById('msgTitle');
  const sub   = document.getElementById('msgSub');
  if (title) title.textContent = `Message à ${vend?.nom||'Vendeur'}`;
  if (sub)   sub.textContent   = ann.titre.slice(0, 40) + (ann.titre.length>40?'...':'');

  renderMessages(annId);
  modal?.classList.add('open');
  fermerModal();
}

function renderMessages(annId) {
  const msgs = getMessages();
  const thread = msgs[annId] || [];
  const body = document.getElementById('msgBody');
  if (!body) return;

  if (!thread.length) {
    body.innerHTML = `
      <div style="text-align:center;padding:24px;color:#888">
        <i class="fas fa-comment-dots" style="font-size:36px;opacity:.3;display:block;margin-bottom:10px"></i>
        <p style="font-size:14px">Démarrez la conversation !</p>
        <p style="font-size:12px;margin-top:4px">Le vendeur recevra votre message</p>
      </div>`;
    return;
  }

  body.innerHTML = thread.map(m => `
    <div class="msg-bubble ${m.moi ? 'msg-moi' : 'msg-eux'}">
      <div class="msg-text">${m.text}</div>
      <div class="msg-time">${new Date(m.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
    </div>`).join('');
  body.scrollTop = body.scrollHeight;
}

function envoyerMessage() {
  const input = document.getElementById('msgInput');
  if (!input || !input.value.trim() || !currentAnnId) return;
  const msgs = getMessages();
  if (!msgs[currentAnnId]) msgs[currentAnnId] = [];
  msgs[currentAnnId].push({ text: input.value.trim(), moi: true, date: new Date().toISOString() });
  saveMessages(msgs);
  input.value = '';
  renderMessages(currentAnnId);
}

function discuterWhatsApp() {
  if (currentVendWa) {
    const msg = `Bonjour ! Je vous écris depuis Galy Market. 👋`;
    window.open(`https://wa.me/${currentVendWa.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
  }
}

function fermerMsg() {
  document.getElementById('msgModal')?.classList.remove('open');
}

// ══════════════════════════════════════════════════════
//  BOOST ANNONCE
// ══════════════════════════════════════════════════════

function boosterAnnonce(annId) {
  const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
  const waShop = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');
  const ann = getAnnonces().find(a => a.id === annId);
  if (!ann) return;
  const msg = `Bonjour Galy Market ! 🚀\n\nJe voudrais *booster* mon annonce :\n\n📢 *${ann.titre}*\n\nMerci de m'indiquer comment procéder au paiement des *50 000 GNF* pour le boost.`;
  window.open(`https://wa.me/${waShop}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ══════════════════════════════════════════════════════
//  BOUTIQUE VENDEUR
// ══════════════════════════════════════════════════════

function voirBoutiqueVendeur(vendId) {
  fermerModal();
  window.location.href = `boutique-vendeur.html?id=${vendId}`;
}

function initBoutiqueVendeur() {
  if (!document.getElementById('vendHero')) return;
  const params = new URLSearchParams(window.location.search);
  const vendId = params.get('id');
  if (!vendId) return;

  const vend = getVendeurs().find(v => v.id === vendId);
  if (!vend) return;

  const el = id => document.getElementById(id);
  if (el('vendNom'))    el('vendNom').textContent    = vend.nom;
  if (el('vendAvatar')) el('vendAvatar').textContent = vend.avatar||'👤';
  if (el('vendVille'))  el('vendVille').innerHTML    = `<i class="fas fa-map-pin"></i> ${vend.ville||'—'}`;
  if (el('vendMembre')) el('vendMembre').innerHTML   = `<i class="fas fa-calendar"></i> Membre depuis ${vend.membre||'—'}`;
  if (el('vsVentes'))   el('vsVentes').textContent   = vend.ventes||0;
  if (el('vsNote'))     el('vsNote').textContent     = vend.note||'—';

  if (vend.premium && el('vendBadge'))  el('vendBadge').style.display  = 'inline-flex';
  if (vend.verifie && el('vendVerif'))  el('vendVerif').style.display  = 'inline-flex';

  // Annonces du vendeur
  const annVend = getAnnonces().filter(a => a.vendeurId === vendId);
  if (el('vsTotalAnn')) el('vsTotalAnn').textContent = annVend.length;

  const vues = annVend.reduce((s,a) => s+(a.vues||0), 0);
  if (el('vsVues')) el('vsVues').textContent = vues;

  const grid = el('gridVendeurAnn');
  const empty = el('vendEmpty');
  if (grid) {
    grid.innerHTML = annVend.length ? annVend.map(makeAnnCard).join('') : '';
    if (empty) empty.style.display = annVend.length ? 'none' : 'block';
  }

  // Bouton contacter
  el('btnMsgVendeur')?.addEventListener('click', () => {
    const wa = (vend.wa||vend.tel||'').replace(/[^0-9]/g,'');
    if (wa) window.open(`https://wa.me/${wa}`, '_blank');
  });
}

function toggleFollow() {
  const btn = document.getElementById('btnFollow');
  if (!btn) return;
  btn.classList.toggle('active');
  btn.innerHTML = btn.classList.contains('active')
    ? '<i class="fas fa-heart"></i> Suivi'
    : '<i class="far fa-heart"></i> Suivre';
}

// ══════════════════════════════════════════════════════
//  PUBLICATION ANNONCE
// ══════════════════════════════════════════════════════

let pubCatSelected = '';
let pubPhotosData  = [];
let boostSelected  = false;
let etapeActuelle  = 1;

function initPublierAnnonce() {
  if (!document.getElementById('pubCatsGrid')) return;

  const grid = document.getElementById('pubCatsGrid');
  if (grid) {
    grid.innerHTML = ANN_CATS.map(c => `
      <div class="pub-cat-item" onclick="selectionnerCat('${c.key}','${c.emoji}','${c.label}')" style="--cat-color:${c.color}">
        <span style="font-size:32px">${c.emoji}</span>
        <span style="font-size:12px;font-weight:600;text-align:center">${c.label}</span>
      </div>`).join('');
  }

  // Compteurs caractères
  document.getElementById('pubTitre')?.addEventListener('input', function() {
    document.getElementById('titreCount').textContent = this.value.length;
  });
  document.getElementById('pubDesc')?.addEventListener('input', function() {
    document.getElementById('descCount').textContent = this.value.length;
  });

  // Pré-remplir si connecté
  const session = JSON.parse(localStorage.getItem('GM_SESSION')||'{}');
  if (session.nom)   document.getElementById('pubNom').value   = session.nom;
  if (session.tel)   document.getElementById('pubTel').value   = session.tel;
  if (session.email) document.getElementById('pubEmail').value = session.email;
}

function selectionnerCat(key, emoji, label) {
  pubCatSelected = key;
  document.querySelectorAll('.pub-cat-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  setTimeout(() => allerEtape(2), 300);
}

function allerEtape(n) {
  // Validation
  if (n === 2 && !pubCatSelected) { alert('Veuillez choisir une catégorie'); return; }
  if (n === 4) {
    if (!document.getElementById('pubTitre').value.trim()) { alert('Titre obligatoire'); return; }
    if (!document.getElementById('pubDesc').value.trim())  { alert('Description obligatoire'); return; }
    if (!document.getElementById('pubPrix').value)         { alert('Prix obligatoire'); return; }
    if (!document.getElementById('pubVille').value)        { alert('Ville obligatoire'); return; }
  }

  etapeActuelle = n;
  [1,2,3,4].forEach(i => {
    const sc = document.getElementById('stepContent'+i);
    const st = document.getElementById('step'+i);
    if (sc) sc.style.display = i===n ? 'block' : 'none';
    if (st) {
      st.classList.toggle('active', i===n);
      st.classList.toggle('done', i<n);
    }
  });
}

function ajouterPhotos(input) {
  const files = Array.from(input.files).slice(0, 8 - pubPhotosData.length);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      pubPhotosData.push(e.target.result);
      renderPhotosGrid();
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotosGrid() {
  const grid = document.getElementById('pubPhotosGrid');
  if (!grid) return;
  grid.innerHTML = pubPhotosData.map((src, i) => `
    <div class="pub-photo-item">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">
      <button class="pub-photo-del" onclick="supprimerPhoto(${i})"><i class="fas fa-times"></i></button>
      ${i===0?'<span class="pub-photo-main">Principale</span>':''}
    </div>`).join('') +
    (pubPhotosData.length < 8 ? `
    <label class="pub-photo-add" for="pubPhotoInput">
      <i class="fas fa-plus" style="font-size:28px;color:#f68b1e"></i>
      <span>Ajouter</span>
    </label>
    <input type="file" id="pubPhotoInput" accept="image/*" multiple style="display:none" onchange="ajouterPhotos(this)">` : '');
}

function supprimerPhoto(i) {
  pubPhotosData.splice(i, 1);
  renderPhotosGrid();
}

function toggleBoost(el) {
  boostSelected = !boostSelected;
  el.classList.toggle('boost-on', boostSelected);
  document.getElementById('boostToggle').style.background = boostSelected ? '#f68b1e' : 'rgba(255,255,255,.1)';
}

function publierAnnonce() {
  const nom   = document.getElementById('pubNom')?.value.trim();
  const tel   = document.getElementById('pubTel')?.value.trim();
  const titre = document.getElementById('pubTitre')?.value.trim();
  if (!nom || !tel) { alert('Nom et téléphone obligatoires'); return; }

  const vends = getVendeurs();
  let vend = vends.find(v => v.tel?.replace(/[^0-9]/g,'') === tel.replace(/[^0-9]/g,''));
  if (!vend) {
    vend = {
      id: 'v' + Date.now(),
      nom, tel: tel.replace(/[^0-9]/g,''),
      wa: (document.getElementById('pubWa')?.value||tel).replace(/[^0-9]/g,''),
      email: document.getElementById('pubEmail')?.value||'',
      ville: document.getElementById('pubVille')?.value||'',
      membre: new Date().toISOString().slice(0,7),
      premium: false, verifie: false, ventes:0, note:null, avatar:'👤'
    };
    vends.push(vend);
    saveVendeurs(vends);
  }

  const annonce = {
    id:        'ann' + Date.now(),
    titre,
    cat:       pubCatSelected,
    prix:      parseInt(document.getElementById('pubPrix')?.value)||0,
    nego:      document.getElementById('pubNego')?.value||'non',
    etat:      document.getElementById('pubEtat')?.value||'bon',
    ville:     document.getElementById('pubVille')?.value||'',
    quartier:  document.getElementById('pubQuartier')?.value||'',
    desc:      document.getElementById('pubDesc')?.value||'',
    photos:    pubPhotosData,
    vendeurId: vend.id,
    vues:      0,
    date:      new Date().toISOString(),
    boost:     boostSelected,
    dispo:     true,
  };

  const anns = getAnnonces();
  anns.unshift(annonce);
  saveAnnonces(anns);

  // Notification WhatsApp à Galy Market si boost
  if (boostSelected) {
    const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
    const waShop = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');
    const msg = `🚀 *DEMANDE DE BOOST — GALY MARKET*\n\nVendeur: ${nom}\nTél: ${tel}\nAnnonce: ${titre}\n\nMerci de contacter le vendeur pour confirmer le paiement du boost (50 000 GNF).`;
    window.open(`https://wa.me/${waShop}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Confirmation
  alert(`✅ Votre annonce "${titre}" a été publiée avec succès !\n\nElle sera visible immédiatement sur Galy Market.`);
  window.location.href = 'annonces.html';
}

// ══════════════════════════════════════════════════════
//  PREMIUM
// ══════════════════════════════════════════════════════

function voirPremium() {
  document.getElementById('premiumModal')?.classList.add('open');
}

function souscrirePremium(plan) {
  const s = JSON.parse(localStorage.getItem('GM_SETTINGS')||'{}');
  const waShop = (s.shopWa||'224627900578').replace(/[^0-9]/g,'');
  const prix = plan === 'annuel' ? '1 200 000 GNF/an' : '150 000 GNF/mois';
  const msg = `Bonjour Galy Market ! 👑\n\nJe souhaite souscrire à l'abonnement *Premium Vendeur* :\n\n📅 Plan: *${plan === 'annuel' ? 'Annuel' : 'Mensuel'}*\n💰 Tarif: *${prix}*\n\nMerci de m'indiquer comment procéder !`;
  window.open(`https://wa.me/${waShop}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ══════════════════════════════════════════════════════
//  INIT GLOBAL
// ══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initPageAnnonces();
  initBoutiqueVendeur();
  initPublierAnnonce();

  // Ajouter "Annonces" dans le menu nav si présent
  const navLinks = document.querySelector('.nav-links');
  if (navLinks && !navLinks.querySelector('[href="annonces.html"]')) {
    const li = document.createElement('a');
    li.href = 'annonces.html';
    li.className = 'nav-link';
    li.innerHTML = '📢 Annonces';
    navLinks.appendChild(li);
  }
});

// ══════════════════════════════════════════════════════
//  1️⃣ GÉOLOCALISATION — Annonces près de moi
// ══════════════════════════════════════════════════════

window.activerGeoLocalisation = function() {
  if (!navigator.geolocation) {
    alert('Géolocalisation non supportée par votre navigateur.');
    return;
  }
  const btn = document.getElementById('btnGeoLoc');
  if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localisation...'; btn.disabled = true; }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      localStorage.setItem('GM_USER_COORDS', JSON.stringify({ lat: latitude, lng: longitude }));
      // Mapping coordonnées → villes guinéennes
      const villes = [
        { nom:'Conakry',    lat:9.6412,  lng:-13.5784 },
        { nom:'Labé',       lat:11.3181, lng:-12.2853 },
        { nom:'Kankan',     lat:10.3832, lng:-9.3058  },
        { nom:'N\'Zérékoré',lat:7.7562,  lng:-8.8251  },
        { nom:'Kindia',     lat:10.0564, lng:-12.8676 },
        { nom:'Boké',       lat:10.9408, lng:-14.2988 },
        { nom:'Faranah',    lat:10.0356, lng:-10.7415 },
        { nom:'Mamou',      lat:10.3742, lng:-12.0836 },
      ];
      let villeProche = 'Conakry', minDist = Infinity;
      villes.forEach(v => {
        const d = Math.sqrt(Math.pow(v.lat - latitude, 2) + Math.pow(v.lng - longitude, 2));
        if (d < minDist) { minDist = d; villeProche = v.nom; }
      });
      // Filtrer annonces par ville proche
      const sel = document.getElementById('filtreVille');
      if (sel) { sel.value = villeProche; filtrerAnnonces(); }
      const selSearch = document.getElementById('annSearchVille');
      if (selSearch) selSearch.value = villeProche;
      if (btn) { btn.innerHTML = `<i class="fas fa-map-pin"></i> ${villeProche}`; btn.disabled = false; btn.style.color = '#22c55e'; }
      afficherToastAnnonce(`📍 Annonces près de ${villeProche} affichées`);
    },
    () => {
      if (btn) { btn.innerHTML = '<i class="fas fa-map-pin"></i> Ma position'; btn.disabled = false; }
      alert('Impossible d\'accéder à votre position. Activez la localisation.');
    }
  );
};

// ══════════════════════════════════════════════════════
//  2️⃣ SIGNALEMENT D'ANNONCE
// ══════════════════════════════════════════════════════

window.signalerAnnonce = function(annId) {
  const raisons = [
    'Produit faux ou contrefait',
    'Arnaque / Escroquerie',
    'Prix abusif / Trompeur',
    'Contenu interdit',
    'Annonce en double',
    'Coordonnées incorrectes',
    'Autre raison',
  ];
  const modal = document.createElement('div');
  modal.id = 'signalModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,.1);border-radius:24px 24px 20px 20px;width:100%;max-width:480px;padding:24px;animation:slideUp .3s ease">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="color:#ef4444;margin:0"><i class="fas fa-flag"></i> Signaler cette annonce</h3>
        <button onclick="document.getElementById('signalModal').remove()" style="background:none;border:none;color:#888;cursor:pointer;font-size:20px">×</button>
      </div>
      <p style="color:#888;font-size:13px;margin-bottom:16px">Choisissez la raison du signalement :</p>
      ${raisons.map((r,i) => `
        <div onclick="envoyerSignalement('${annId}','${r}',this)"
          style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);border-radius:10px;cursor:pointer;margin-bottom:8px;
          font-size:14px;color:#ccc;transition:all .2s"
          onmouseover="this.style.borderColor='#ef4444';this.style.color='#fff'"
          onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.color='#ccc'">
          <i class="fas fa-exclamation-circle" style="color:#ef4444"></i> ${r}
        </div>`).join('')}
      <div style="margin-top:12px">
        <textarea id="signalDetails" placeholder="Détails supplémentaires (optionnel)..."
          style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
          border-radius:10px;padding:12px;color:#fff;font-size:13px;resize:none;height:70px;box-sizing:border-box"></textarea>
      </div>
    </div>`;
  document.body.appendChild(modal);
};

window.envoyerSignalement = function(annId, raison, el) {
  const ann = getAnnonces().find(a => a.id === annId);
  if (!ann) return;
  // Enregistrer le signalement
  const signalements = JSON.parse(localStorage.getItem('GM_SIGNALEMENTS') || '[]');
  signalements.push({
    id: 'sig' + Date.now(),
    annId, raison,
    details: document.getElementById('signalDetails')?.value || '',
    date: new Date().toISOString(),
    statut: 'en_attente',
  });
  localStorage.setItem('GM_SIGNALEMENTS', JSON.stringify(signalements));
  // WhatsApp admin
  const s = JSON.parse(localStorage.getItem('GM_SETTINGS') || '{}');
  const waShop = (s.shopWa || '224627900578').replace(/[^0-9]/g, '');
  const msg = `🚨 *SIGNALEMENT D'ANNONCE — GALY MARKET*\n\n📢 Annonce: *${ann.titre}*\n⚠️ Raison: *${raison}*\n📅 Date: ${new Date().toLocaleString('fr-FR')}\n\nMerci de vérifier cette annonce.`;
  window.open(`https://wa.me/${waShop}?text=${encodeURIComponent(msg)}`, '_blank');
  document.getElementById('signalModal')?.remove();
  afficherToastAnnonce('✅ Signalement envoyé à l\'administration');
};

// ══════════════════════════════════════════════════════
//  3️⃣ SYSTÈME D'ÉVALUATION (RATING)
// ══════════════════════════════════════════════════════

window.ouvrirEvaluation = function(vendeurId) {
  const vend = getVendeurs().find(v => v.id === vendeurId);
  if (!vend) return;
  const evals = JSON.parse(localStorage.getItem('GM_EVALUATIONS') || '[]');
  const vendEvals = evals.filter(e => e.vendeurId === vendeurId);
  const moy = vendEvals.length ? (vendEvals.reduce((s,e) => s + e.note, 0) / vendEvals.length).toFixed(1) : null;

  const modal = document.createElement('div');
  modal.id = 'evalModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,.1);border-radius:24px 24px 20px 20px;width:100%;max-width:480px;padding:24px;animation:slideUp .3s ease">
      <div style="display:flex;justify-content:space-between;margin-bottom:16px">
        <h3 style="color:#ffd700;margin:0">⭐ Évaluer ${vend.nom}</h3>
        <button onclick="document.getElementById('evalModal').remove()" style="background:none;border:none;color:#888;cursor:pointer;font-size:20px">×</button>
      </div>
      ${moy ? `<div style="text-align:center;margin-bottom:16px;padding:12px;background:rgba(255,215,0,.08);border-radius:12px">
        <span style="font-size:32px;font-weight:800;color:#ffd700">${moy}</span><span style="color:#888">/5</span>
        <div style="color:#ffd700">${'⭐'.repeat(Math.round(moy))}</div>
        <div style="color:#888;font-size:12px">${vendEvals.length} évaluation(s)</div>
      </div>` : ''}
      <p style="color:#888;font-size:13px;margin-bottom:12px">Votre note :</p>
      <div id="starPicker" style="display:flex;gap:10px;justify-content:center;margin-bottom:16px;font-size:36px">
        ${[1,2,3,4,5].map(i => `<span style="cursor:pointer;opacity:.4;transition:all .15s" data-note="${i}"
          onmouseover="survolEtoile(${i})" onmouseout="resetEtoiles()" onclick="selNoteEtoile(${i})">⭐</span>`).join('')}
      </div>
      <input type="hidden" id="noteSelectionnee" value="0">
      <textarea id="evalCommentaire" placeholder="Votre commentaire (optionnel)..."
        style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
        border-radius:10px;padding:12px;color:#fff;font-size:13px;resize:none;height:80px;box-sizing:border-box;margin-bottom:12px"></textarea>
      <button onclick="envoyerEvaluation('${vendeurId}')"
        style="width:100%;background:linear-gradient(135deg,#ffd700,#f68b1e);color:#000;border:none;
        padding:14px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer">
        <i class="fas fa-paper-plane"></i> Envoyer l'évaluation
      </button>
      <!-- Évaluations récentes -->
      ${vendEvals.length ? `<div style="margin-top:16px">
        <div style="font-size:12px;font-weight:700;color:#888;margin-bottom:8px">ÉVALUATIONS RÉCENTES</div>
        ${vendEvals.slice(0,3).map(e => `
          <div style="padding:10px;border-top:1px solid rgba(255,255,255,.06)">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="color:#ffd700">${'⭐'.repeat(e.note)}</span>
              <span style="color:#666;font-size:11px">${new Date(e.date).toLocaleDateString('fr-FR')}</span>
            </div>
            ${e.commentaire ? `<p style="color:#999;font-size:12px;margin:0">${e.commentaire}</p>` : ''}
          </div>`).join('')}
      </div>` : ''}
    </div>`;
  document.body.appendChild(modal);
};

window.survolEtoile = function(n) {
  document.querySelectorAll('#starPicker span').forEach((s,i) => s.style.opacity = i < n ? '1' : '.3');
};
window.resetEtoiles = function() {
  const note = parseInt(document.getElementById('noteSelectionnee')?.value || 0);
  document.querySelectorAll('#starPicker span').forEach((s,i) => s.style.opacity = i < note ? '1' : '.4');
};
window.selNoteEtoile = function(n) {
  document.getElementById('noteSelectionnee').value = n;
  survolEtoile(n);
};
window.envoyerEvaluation = function(vendeurId) {
  const note = parseInt(document.getElementById('noteSelectionnee')?.value || 0);
  if (!note) { afficherToastAnnonce('⚠️ Choisissez une note'); return; }
  const evals = JSON.parse(localStorage.getItem('GM_EVALUATIONS') || '[]');
  evals.push({ id:'eval'+Date.now(), vendeurId, note, commentaire: document.getElementById('evalCommentaire')?.value || '', date: new Date().toISOString() });
  localStorage.setItem('GM_EVALUATIONS', JSON.stringify(evals));
  // Mettre à jour note moyenne du vendeur
  const vends = getVendeurs();
  const vend = vends.find(v => v.id === vendeurId);
  if (vend) {
    const vendEvals = evals.filter(e => e.vendeurId === vendeurId);
    vend.note = parseFloat((vendEvals.reduce((s,e) => s+e.note,0) / vendEvals.length).toFixed(1));
    saveVendeurs(vends);
  }
  document.getElementById('evalModal')?.remove();
  afficherToastAnnonce('⭐ Évaluation envoyée — Merci !');
};

// ══════════════════════════════════════════════════════
//  4️⃣ SYSTÈME DE PARTAGE
// ══════════════════════════════════════════════════════

window.partagerAnnonce = function(annId) {
  const ann = getAnnonces().find(a => a.id === annId);
  if (!ann) return;
  const url = `${window.location.origin}/annonces.html?ann=${annId}`;
  const texte = `🛍️ ${ann.titre}\n💰 ${fmt(ann.prix)}\n📍 ${ann.ville}\n\n👉 Voir sur Galy Market: ${url}`;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:20px';
  modal.onclick = e => { if (e.target===modal) modal.remove(); };
  modal.innerHTML = `
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,.1);border-radius:24px 24px 20px 20px;width:100%;max-width:420px;padding:20px;animation:slideUp .3s ease">
      <h3 style="color:#fff;margin-bottom:16px;text-align:center">📤 Partager cette annonce</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
        <button onclick="partagerVia('whatsapp','${encodeURIComponent(texte)}')"
          style="background:#25d366;color:#fff;border:none;padding:16px 8px;border-radius:14px;cursor:pointer;font-size:22px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px">
          <i class="fab fa-whatsapp" style="font-size:28px"></i>WhatsApp</button>
        <button onclick="partagerVia('facebook','${encodeURIComponent(url)}')"
          style="background:#1877f2;color:#fff;border:none;padding:16px 8px;border-radius:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px">
          <i class="fab fa-facebook" style="font-size:28px"></i>Facebook</button>
        <button onclick="partagerVia('telegram','${encodeURIComponent(texte)}')"
          style="background:#0088cc;color:#fff;border:none;padding:16px 8px;border-radius:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px">
          <i class="fab fa-telegram" style="font-size:28px"></i>Telegram</button>
        <button onclick="copierLien('${url}',this)"
          style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.1);padding:16px 8px;border-radius:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px">
          <i class="fas fa-link" style="font-size:28px"></i>Copier</button>
      </div>
      <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px;font-size:12px;color:#888;word-break:break-all">${url}</div>
    </div>`;
  document.body.appendChild(modal);
};

window.partagerVia = function(reseau, texteOuUrl) {
  const urls = {
    whatsapp: `https://wa.me/?text=${texteOuUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${texteOuUrl}`,
    telegram: `https://t.me/share/url?text=${texteOuUrl}`,
  };
  if (urls[reseau]) window.open(urls[reseau], '_blank');
};

window.copierLien = function(url, btn) {
  navigator.clipboard.writeText(url).then(() => {
    btn.style.background = 'rgba(34,197,94,.2)';
    btn.innerHTML = '<i class="fas fa-check" style="font-size:28px;color:#22c55e"></i><span style="font-size:11px;color:#22c55e">Copié !</span>';
    setTimeout(() => { btn.style.background='rgba(255,255,255,.08)'; btn.innerHTML='<i class="fas fa-link" style="font-size:28px"></i>Copier'; }, 2000);
  });
};

// ══════════════════════════════════════════════════════
//  5️⃣ HISTORIQUE D'ACTIVITÉ
// ══════════════════════════════════════════════════════

function enregistrerActivite(type, data) {
  const hist = JSON.parse(localStorage.getItem('GM_HISTORIQUE_ANN') || '[]');
  hist.unshift({ type, data, date: new Date().toISOString() });
  localStorage.setItem('GM_HISTORIQUE_ANN', JSON.stringify(hist.slice(0, 100)));
}

window.afficherHistorique = function() {
  const hist = JSON.parse(localStorage.getItem('GM_HISTORIQUE_ANN') || '[]');
  const types = { vue:'👁️', message:'💬', publication:'📢', favori:'❤️', achat:'🛒' };
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:20px';
  modal.onclick = e => { if (e.target===modal) modal.remove(); };
  modal.innerHTML = `
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,.1);border-radius:24px 24px 20px 20px;width:100%;max-width:480px;max-height:70vh;overflow-y:auto;padding:24px;animation:slideUp .3s ease">
      <div style="display:flex;justify-content:space-between;margin-bottom:20px">
        <h3 style="color:#fff;margin:0">📋 Mon historique</h3>
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background:none;border:none;color:#888;cursor:pointer;font-size:20px">×</button>
      </div>
      ${hist.length ? hist.map(h => `
        <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:20px">${types[h.type]||'📌'}</span>
          <div style="flex:1">
            <div style="font-size:13px;color:#fff">${h.data?.titre || h.data?.message || h.type}</div>
            <div style="font-size:11px;color:#666">${new Date(h.date).toLocaleString('fr-FR')}</div>
          </div>
        </div>`).join('')
        : '<p style="color:#888;text-align:center;padding:24px">Aucune activité récente</p>'}
    </div>`;
  document.body.appendChild(modal);
};

// ══════════════════════════════════════════════════════
//  6️⃣ ANTI-SPAM — Limite publication
// ══════════════════════════════════════════════════════

window.verifierAntiSpam = function(tel) {
  const aujourd = new Date().toDateString();
  const spam = JSON.parse(localStorage.getItem('GM_ANTISPAM') || '{}');
  if (!spam[tel]) spam[tel] = { date: aujourd, nb: 0 };
  if (spam[tel].date !== aujourd) { spam[tel] = { date: aujourd, nb: 0 }; }
  spam[tel].nb++;
  localStorage.setItem('GM_ANTISPAM', JSON.stringify(spam));
  // Gratuit: max 2/jour, abonné: max 10/jour
  const maxJour = 2;
  if (spam[tel].nb > maxJour) {
    alert(`⚠️ Limite atteinte !\n\nVous avez publié ${maxJour} annonces aujourd'hui.\nAbonnez-vous pour publier plus d'annonces.`);
    return false;
  }
  return true;
};

// ══════════════════════════════════════════════════════
//  7️⃣ GESTION DES ANNONCES (tableau de bord vendeur)
// ══════════════════════════════════════════════════════

window.initGestionAnnonces = function(vendeurId) {
  const anns = getAnnonces().filter(a => a.vendeurId === vendeurId);
  const container = document.getElementById('mesAnnoncesContainer');
  if (!container) return;
  container.innerHTML = anns.length ? anns.map(a => `
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;display:flex;gap:12px;align-items:flex-start;margin-bottom:10px">
      <div style="font-size:36px">${ANN_CATS.find(c=>c.key===a.cat)?.emoji||'📦'}</div>
      <div style="flex:1">
        <div style="font-weight:700;color:#fff;font-size:14px">${a.titre}</div>
        <div style="color:#f68b1e;font-weight:700">${fmt(a.prix)}</div>
        <div style="display:flex;gap:10px;margin-top:6px;font-size:11px;color:#888">
          <span>👁️ ${a.vues||0} vues</span>
          <span style="color:${a.dispo?'#22c55e':'#ef4444'}">${a.dispo?'✅ Disponible':'🔴 Vendu'}</span>
          ${a.boost?'<span style="color:#f68b1e">🚀 Boosté</span>':''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button onclick="modifierAnnonce('${a.id}')" style="background:rgba(59,130,246,.15);color:#3b82f6;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600"><i class="fas fa-edit"></i> Modifier</button>
        <button onclick="marquerVendu('${a.id}')" style="background:rgba(34,197,94,.12);color:#22c55e;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600"><i class="fas fa-check"></i> Vendu</button>
        <button onclick="supprimerMonAnnonce('${a.id}')" style="background:rgba(239,68,68,.1);color:#ef4444;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:11px"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('')
    : '<p style="color:#888;text-align:center;padding:24px">Aucune annonce publiée</p>';
};

window.marquerVendu = function(annId) {
  const anns = getAnnonces();
  const ann = anns.find(a => a.id === annId);
  if (ann) { ann.dispo = !ann.dispo; saveAnnonces(anns); }
  afficherToastAnnonce(ann?.dispo ? '✅ Annonce remise en vente' : '🔴 Annonce marquée vendue');
  const session = JSON.parse(localStorage.getItem('GM_SESSION')||'{}');
  if (session.id) initGestionAnnonces(session.id);
};

window.supprimerMonAnnonce = function(annId) {
  if (!confirm('Supprimer cette annonce définitivement ?')) return;
  const anns = getAnnonces().filter(a => a.id !== annId);
  saveAnnonces(anns);
  const session = JSON.parse(localStorage.getItem('GM_SESSION')||'{}');
  if (session.id) initGestionAnnonces(session.id);
  afficherToastAnnonce('🗑️ Annonce supprimée');
};

window.modifierAnnonce = function(annId) {
  localStorage.setItem('GM_EDIT_ANN', annId);
  window.location.href = 'publier-annonce.html?edit=' + annId;
};

// ══════════════════════════════════════════════════════
//  8️⃣ TABLEAU DE BORD VENDEUR
// ══════════════════════════════════════════════════════

window.afficherDashboardVendeur = function(vendeurId) {
  const anns     = getAnnonces().filter(a => a.vendeurId === vendeurId);
  const msgs     = getMessages();
  const evals    = JSON.parse(localStorage.getItem('GM_EVALUATIONS')||'[]').filter(e => e.vendeurId===vendeurId);
  const abos     = JSON.parse(localStorage.getItem('GM_ABONNEMENTS')||'[]');
  const abo      = abos.find(a => a.vendeurId===vendeurId && a.statut==='actif');
  const totalVues   = anns.reduce((s,a) => s+(a.vues||0), 0);
  const totalMsgs   = Object.keys(msgs).filter(k => anns.find(a=>a.id===k)).length;
  const noteMoy     = evals.length ? (evals.reduce((s,e)=>s+e.note,0)/evals.length).toFixed(1) : '—';
  const annsActives = anns.filter(a => a.dispo !== false).length;

  const dash = document.getElementById('vendeurDashboard');
  if (!dash) return;
  dash.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">
      <div style="background:rgba(246,139,30,.1);border:1px solid rgba(246,139,30,.2);border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:28px;font-weight:800;color:#f68b1e">${annsActives}</div>
        <div style="font-size:12px;color:#888">Annonces actives</div>
      </div>
      <div style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:28px;font-weight:800;color:#3b82f6">${totalVues}</div>
        <div style="font-size:12px;color:#888">Vues totales</div>
      </div>
      <div style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:28px;font-weight:800;color:#22c55e">${totalMsgs}</div>
        <div style="font-size:12px;color:#888">Messages reçus</div>
      </div>
      <div style="background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:28px;font-weight:800;color:#ffd700">${noteMoy}</div>
        <div style="font-size:12px;color:#888">Note moyenne ⭐</div>
      </div>
    </div>
    ${abo ? `<div style="background:rgba(246,139,30,.08);border:1px solid rgba(246,139,30,.2);border-radius:12px;padding:12px;font-size:13px;margin-bottom:16px">
      👑 Plan <strong style="color:#f68b1e">${abo.planId}</strong> actif jusqu'au <strong>${new Date(abo.date_fin).toLocaleDateString('fr-FR')}</strong>
    </div>` : `<a href="abonnements.html" style="display:block;background:linear-gradient(135deg,rgba(246,139,30,.15),rgba(246,139,30,.05));border:1px solid rgba(246,139,30,.3);border-radius:12px;padding:12px;text-decoration:none;color:#f68b1e;font-size:13px;margin-bottom:16px;text-align:center;font-weight:700">
      💼 Passer à un plan payant pour plus de visibilité →
    </a>`}`;
};

// ══════════════════════════════════════════════════════
//  9️⃣ NOTIFICATIONS INTELLIGENTES
// ══════════════════════════════════════════════════════

window.activerNotifications = function() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      localStorage.setItem('GM_NOTIF_ANN', 'true');
      afficherToastAnnonce('🔔 Notifications activées !');
    }
  });
};

window.envoyerNotifAnnonce = function(titre, corps, url) {
  if (localStorage.getItem('GM_NOTIF_ANN') !== 'true') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const notif = new Notification(titre, {
    body: corps,
    icon: 'icons/icon-192.png',
  });
  if (url) notif.onclick = () => window.open(url, '_blank');
};

// Vérifier nouvelles annonces similaires aux favoris
window.verifierNouvellesAnnonces = function() {
  const favoris = JSON.parse(localStorage.getItem('GM_ANN_FAVORIS') || '[]');
  if (!favoris.length) return;
  const anns = getAnnonces();
  const dernVerif = localStorage.getItem('GM_LAST_ANN_CHECK');
  const nouvelles = anns.filter(a => !dernVerif || new Date(a.date) > new Date(dernVerif));
  if (nouvelles.length > 0) {
    envoyerNotifAnnonce(
      `🆕 ${nouvelles.length} nouvelle(s) annonce(s)`,
      `Consultez les nouvelles annonces sur Galy Market`,
      'annonces.html'
    );
  }
  localStorage.setItem('GM_LAST_ANN_CHECK', new Date().toISOString());
};

// ══════════════════════════════════════════════════════
//  🔟 FAVORIS ANNONCES
// ══════════════════════════════════════════════════════

window.toggleFavoriAnnonce = function(annId, btn) {
  const favs = JSON.parse(localStorage.getItem('GM_ANN_FAVORIS') || '[]');
  const idx = favs.indexOf(annId);
  if (idx === -1) {
    favs.push(annId);
    if (btn) { btn.style.color = '#ef4444'; btn.innerHTML = '<i class="fas fa-heart"></i>'; }
    afficherToastAnnonce('❤️ Ajouté aux favoris');
    enregistrerActivite('favori', { annId });
  } else {
    favs.splice(idx, 1);
    if (btn) { btn.style.color = '#888'; btn.innerHTML = '<i class="far fa-heart"></i>'; }
    afficherToastAnnonce('💔 Retiré des favoris');
  }
  localStorage.setItem('GM_ANN_FAVORIS', JSON.stringify(favs));
};

// ══════════════════════════════════════════════════════
//  TOAST ANNONCES
// ══════════════════════════════════════════════════════

function afficherToastAnnonce(msg) {
  let t = document.getElementById('toastAnn');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toastAnn';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,15,26,.95);border:1px solid rgba(255,255,255,.15);color:#fff;padding:12px 20px;border-radius:50px;font-size:14px;font-weight:600;z-index:99999;opacity:0;transition:opacity .3s;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.4)';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.style.opacity = '0', 3000);
}

// Ouvrir annonce depuis URL
(function() {
  const params = new URLSearchParams(window.location.search);
  const annId = params.get('ann');
  if (annId && document.getElementById('annCatsGrid')) {
    setTimeout(() => ouvrirAnnonce(annId), 500);
  }
})();
