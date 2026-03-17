/* ═══════════════════════════════════════════
   GALY MARKET — produit.js
   Étape 3 : Page détail produit
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── HELPERS ── */
  const $  = id => document.getElementById(id);
  const fmt = n  => n.toLocaleString('fr-FR') + ' GNF';
  const renderStars = r => {
    const f = Math.floor(r), h = r % 1 >= .5 ? 1 : 0, e = 5 - f - h;
    return '★'.repeat(f) + (h ? '½' : '') + '☆'.repeat(e);
  };

  /* ── ÉTAT ── */
  let product  = null;
  let qty      = 1;
  let rfRating = 0;
  let cart     = JSON.parse(localStorage.getItem('GM_CART')     || '[]');
  let wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
  const saveCart     = () => localStorage.setItem('GM_CART',     JSON.stringify(cart));
  const saveWishlist = () => localStorage.setItem('GM_WISHLIST', JSON.stringify(wishlist));

  /* ── TROUVER LE PRODUIT (base + custom + overrides) ── */
  const params = new URLSearchParams(window.location.search);
  const pidRaw = params.get('id');
  const pid    = pidRaw ? (isNaN(pidRaw) ? pidRaw : parseInt(pidRaw)) : 1;

  // Fusionner produits base + customs + overrides
  function getAllProdsForPage() {
    const overrides = JSON.parse(localStorage.getItem('GM_PROD_OVERRIDES') || '{}');
    const custom    = JSON.parse(localStorage.getItem('GM_CUSTOM_PRODS')   || '[]');
    const base = GM_PRODUCTS.map(p => {
      const ov = overrides[p.id] || {};
      return { ...p, ...ov };
    }).filter(p => !p._deleted);
    return [...base, ...custom.filter(p => !p._deleted)];
  }

  const allProds = getAllProdsForPage();
  product = allProds.find(p => String(p.id) === String(pid)) || allProds[0];

  /* ── DONNÉES ENRICHIES ── */
  const SPECS = {
    phones: [
      ['Marque',       product.brand || 'Non précisé'],
      ['Stockage',     '128 GB'],
      ['RAM',          '8 GB'],
      ['Écran',        '6.7" Super Retina OLED'],
      ['Processeur',   'Dernière génération'],
      ['Batterie',     '4 500 mAh'],
      ['Appareil photo','Triple 48MP + 12MP + 12MP'],
      ['OS',           'Dernière version'],
      ['Connectivité', '5G, Wi-Fi 6E, Bluetooth 5.3'],
      ['Couleurs',     'Noir, Blanc, Or'],
      ['Garantie',     '12 mois Galy Market'],
    ],
    mode: [
      ['Matière',  'Coton / Wax / Polyester'],
      ['Tailles',  'XS, S, M, L, XL, XXL'],
      ['Entretien','Lavage à 30°C'],
      ['Origine',  'Afrique de l\'Ouest'],
      ['Garantie', 'Retour & Garantie 72 heures'],
    ],
    beaute: [
      ['Contenance', '100 ml'],
      ['Type',       'Eau de Parfum'],
      ['Famille',    'Boisé / Floral'],
      ['Origine',    'Importé'],
      ['Garantie',   'Produit authentique certifié'],
    ],
    maison: [
      ['Dimensions', 'Variables selon modèle'],
      ['Puissance',  'A+++ Efficacité énergétique'],
      ['Couleur',    'Noir / Gris sidéral'],
      ['Garantie',   '24 mois constructeur'],
    ],
    sport: [
      ['Poids',      '12 kg'],
      ['Dimensions', '120 × 55 × 130 cm'],
      ['Puissance',  '250W'],
      ['Garantie',   '12 mois'],
    ],
    bijoux: [
      ['Matière',  'Acier inoxydable / Plaqué or'],
      ['Taille',   'Ajustable'],
      ['Poids',    '45g'],
      ['Garantie', '6 mois Galy Market'],
    ],
  };

  const HIGHLIGHTS = {
    phones: [
      { icon: 'fa-mobile-screen', title: 'Écran Premium', desc: 'Résolution Ultra HD, luminosité maximale' },
      { icon: 'fa-camera',        title: 'Appareil Photo Pro', desc: 'Photos et vidéos de qualité professionnelle' },
      { icon: 'fa-battery-full',  title: 'Grande Autonomie', desc: 'Journée complète sans recharge' },
      { icon: 'fa-wifi',          title: '5G & Wi-Fi 6E', desc: 'Connectivité ultra-rapide et stable' },
    ],
    mode: [
      { icon: 'fa-shirt',     title: 'Coupe Élégante', desc: 'Design moderne adapté à toutes les morphologies' },
      { icon: 'fa-leaf',      title: 'Matière de Qualité', desc: 'Tissu respirant et durable' },
      { icon: 'fa-palette',   title: 'Coloris Exclusifs', desc: 'Teintes riches et résistantes au lavage' },
      { icon: 'fa-star',      title: 'Fait Main', desc: 'Artisanat guinéen authentique' },
    ],
    beaute: [
      { icon: 'fa-flask',     title: 'Formule Premium', desc: 'Ingrédients sélectionnés, naturels et certifiés' },
      { icon: 'fa-droplet',   title: 'Longue Tenue', desc: 'Fragrance qui dure toute la journée' },
      { icon: 'fa-shield',    title: '100% Authentique', desc: 'Produit certifié et garanti d\'origine' },
      { icon: 'fa-gift',      title: 'Idée Cadeau', desc: 'Coffret élégant prêt à offrir' },
    ],
    maison: [
      { icon: 'fa-bolt',      title: 'Économie d\'énergie', desc: 'Classe A+++ pour réduire votre facture' },
      { icon: 'fa-temperature-low', title: 'Technologie No Frost', desc: 'Fin du givre sans dégivrage manuel' },
      { icon: 'fa-volume-off', title: 'Ultra Silencieux', desc: 'Fonctionnement discret, moins de 40 dB' },
      { icon: 'fa-screwdriver-wrench', title: 'Installation Incluse', desc: 'Technicien disponible à Conakry' },
    ],
    sport: [
      { icon: 'fa-bicycle',   title: 'Pliable & Léger', desc: 'Rangement facile, transport simplifié' },
      { icon: 'fa-gauge-high', title: 'Puissant & Rapide', desc: 'Moteur 250W, jusqu\'à 25km/h' },
      { icon: 'fa-battery-three-quarters', title: '50km d\'autonomie', desc: 'Batterie lithium longue durée' },
      { icon: 'fa-shield-halved', title: 'Freins à Disque', desc: 'Sécurité maximale en toutes conditions' },
    ],
    bijoux: [
      { icon: 'fa-gem',       title: 'Matériaux Premium', desc: 'Acier chirurgical, plaqué or 18 carats' },
      { icon: 'fa-ruler',     title: 'Taille Ajustable', desc: 'S\'adapte à tous les poignets' },
      { icon: 'fa-award',     title: 'Artisanat de Qualité', desc: 'Finitions soignées, détails parfaits' },
      { icon: 'fa-gift',      title: 'Livré en Écrin', desc: 'Coffret cadeau inclus, prêt à offrir' },
    ],
  };

  const FAKE_REVIEWS = [
    { name: 'Mamadou Diallo',    rating: 5, date: '12 Jan 2025', text: 'Produit excellent ! Livraison très rapide à Conakry, emballage soigné. Je recommande Galy Market à 100%. Merci !', verified: true },
    { name: 'Fatoumata Camara',  rating: 4, date: '08 Jan 2025', text: 'Très bonne qualité, conforme à la description. Le service client est réactif et professionnel. Je reviendrai.', verified: true },
    { name: 'Ibrahim Bah',       rating: 5, date: '03 Jan 2025', text: 'Incroyable rapport qualité-prix. J\'ai commandé plusieurs fois sur Galy Market, toujours satisfait !', verified: true },
    { name: 'Aissatou Sow',      rating: 4, date: '28 Déc 2024', text: 'Produit authentique, emballage élégant. Parfait pour offrir en cadeau. Livraison en 24h comme promis.', verified: false },
    { name: 'Ousmane Kouyaté',   rating: 5, date: '22 Déc 2024', text: 'Je suis vraiment impressionné par la qualité ! Photos conformes, produit en parfait état à la livraison.', verified: true },
  ];

  /* ── RENDU PAGE ── */
  function renderPage() {
    const p    = product;
    const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    const catInfo = (typeof GM_CATS !== 'undefined' && GM_CATS[p.cat]) || { label: p.cat };

    // Titre & meta
    document.title = `${p.name} — Galy Market`;

    // Breadcrumb
    $('bcCat').textContent  = catInfo.label;
    $('bcName').textContent = p.name.slice(0, 40) + (p.name.length > 40 ? '…' : '');

    // ── GALERIE PHOTOS + VIDÉO ──
    const photos  = (p.photos  && p.photos.length)  ? p.photos  : [];
    const videoB64= p.videoB64 || null;
    const videoUrl= p.videoUrl || '';
    const hasVideo= !!(videoB64 || videoUrl);

    // Construire la liste des médias : [photos…, vidéo?]
    // Chaque media : { type:'photo'|'video', src, thumb }
    const mediaList = [
      ...photos.map(src => ({ type:'photo', src })),
      ...(hasVideo ? [{ type:'video', src: videoB64 || videoUrl }] : [])
    ];

    // Si pas de photos du tout → emoji par défaut
    if (!mediaList.length) {
      $('galleryEmoji').textContent = p.em;
      $('galleryMainInner').innerHTML = `<div class="gallery-emoji" id="galleryEmoji">${p.em}</div>`;
    }

    let galIdx = 0;

    function galShow(idx) {
      galIdx = idx;
      const m = mediaList[idx];
      const inner = $('galleryMainInner');
      const counter = $('galleryCounter');

      if (!m) {
        inner.innerHTML = `<div class="gallery-emoji">${p.em}</div>`;
        return;
      }

      if (m.type === 'photo') {
        inner.innerHTML = `<img src="${m.src}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;">`;
      } else {
        // Vidéo
        if (videoB64) {
          inner.innerHTML = `<video src="${videoB64}" controls autoplay muted playsinline style="width:100%;height:100%;object-fit:contain;border-radius:8px"></video>`;
        } else if (videoUrl) {
          const yt = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
          const tk = videoUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
          if (yt) {
            inner.innerHTML = `<iframe src="https://www.youtube.com/embed/${yt[1]}?autoplay=1" frameborder="0" allowfullscreen style="width:100%;height:100%;border-radius:8px"></iframe>`;
          } else if (tk) {
            inner.innerHTML = `<iframe src="https://www.tiktok.com/embed/${tk[1]}" frameborder="0" allowfullscreen style="width:100%;height:100%;border-radius:8px"></iframe>`;
          } else {
            inner.innerHTML = `<video src="${videoUrl}" controls style="width:100%;height:100%;object-fit:contain;border-radius:8px"></video>`;
          }
        }
      }

      // Activer la miniature
      document.querySelectorAll('.g-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));

      // Compteur
      if (mediaList.length > 1 && counter) {
        counter.textContent = `${idx + 1} / ${mediaList.length}`;
        counter.style.display = '';
      }

      // Flèches nav
      const prev = $('galleryPrev'); const next = $('galleryNext');
      if (prev && next && mediaList.length > 1) {
        prev.style.display = idx > 0                   ? '' : 'none';
        next.style.display = idx < mediaList.length - 1 ? '' : 'none';
      }
    }

    // Navigation gauche/droite
    window.galNav = function(dir) {
      const newIdx = galIdx + dir;
      if (newIdx >= 0 && newIdx < mediaList.length) galShow(newIdx);
    };

    // Miniatures
    function buildThumbs() {
      const thumbsEl = $('galleryThumbs');
      if (!thumbsEl) return;
      if (!mediaList.length) {
        thumbsEl.innerHTML = `<div class="g-thumb active">${p.em}</div>`;
        return;
      }
      thumbsEl.innerHTML = mediaList.map((m, i) => {
        if (m.type === 'photo') {
          return `<div class="g-thumb ${i===0?'active':''}" data-i="${i}">
            <img src="${m.src}" alt="Photo ${i+1}" style="width:100%;height:100%;object-fit:cover;border-radius:5px">
          </div>`;
        } else {
          return `<div class="g-thumb g-thumb-video ${i===0?'active':''}" data-i="${i}">
            <i class="fas fa-play-circle" style="font-size:28px;color:var(--gold)"></i>
            <span style="font-size:9px;font-weight:800;color:var(--gold);margin-top:2px">VIDÉO</span>
          </div>`;
        }
      }).join('');
      thumbsEl.querySelectorAll('.g-thumb').forEach((t, i) => {
        t.addEventListener('click', () => galShow(i));
      });
    }

    buildThumbs();
    if (mediaList.length > 0) galShow(0);

    // Onglet Vidéo dans tabs + panel
    const tabBtnVideo = $('tabBtnVideo');
    const prodVideoWrap = $('prodVideoWrap');
    if (hasVideo) {
      if (tabBtnVideo) tabBtnVideo.style.display = '';
      if (prodVideoWrap) {
        if (videoB64) {
          prodVideoWrap.innerHTML = `<video src="${videoB64}" controls style="width:100%;max-width:700px;border-radius:12px;display:block;margin:0 auto"></video>`;
        } else {
          const yt = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
          const tk = videoUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
          if (yt) {
            prodVideoWrap.innerHTML = `<div class="prod-video-iframe-wrap"><iframe src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen></iframe></div>`;
          } else if (tk) {
            prodVideoWrap.innerHTML = `<div class="prod-video-iframe-wrap"><iframe src="https://www.tiktok.com/embed/${tk[1]}" frameborder="0" allowfullscreen></iframe></div>`;
          } else {
            prodVideoWrap.innerHTML = `<video src="${videoUrl}" controls style="width:100%;max-width:700px;border-radius:12px;display:block;margin:0 auto"></video>`;
          }
        }
      }
    }

    // Badges
    let badges = '';
    if (disc)    badges += `<div class="gb-disc">-${disc}%</div>`;
    if (p.flash) badges += `<div class="gb-flash">⚡ FLASH</div>`;
    if (p.isNew) badges += `<div class="gb-new">✦ NEW</div>`;
    $('galleryBadges').innerHTML = badges;

    // Infos
    $('piCat').textContent = catInfo.label;
    $('piName').textContent = p.name;
    $('piStars').textContent = renderStars(p.rating);
    $('piRatingNum').textContent = p.rating;
    $('piReviews').textContent = `(${(p.reviews||0).toLocaleString('fr-FR')} avis)`;
    $('piPriceNow').textContent = fmt(p.price);
    $('piPriceOld').textContent = p.old ? fmt(p.old) : '';
    $('piDiscount').textContent = disc ? `-${disc}%` : '';
    $('piDiscount').style.display = disc ? 'inline' : 'none';
    $('piDesc').textContent = p.desc || 'Description non disponible.';

    // Stock
    const stockEl = $('piStock');
    if (p.stock > 0) {
      stockEl.innerHTML = `<i class="fas fa-circle-check"></i> En stock`;
      stockEl.className = 'pi-stock';
      $('piStockCount').textContent = ''; // nombre restant masqué
    } else {
      stockEl.innerHTML = `<i class="fas fa-circle-xmark"></i> Rupture de stock`;
      stockEl.className = 'pi-stock out';
    }

    // WhatsApp
    $('waLink').onclick = () => {
      const msg = 'Bonjour Galy Market ! Je souhaite commander : ' + p.name + ' — ' + fmt(p.price);
      window.open('https://wa.me/224627900578?text=' + encodeURIComponent(msg));
    };

    // Wishlist state
    syncWishBtns();

    // Tabs
    $('reviewCount').textContent = FAKE_REVIEWS.length;
    // Description enrichie
    const descEl = $('tabDesc');
    if (descEl) {
      const descText = p.desc || 'Produit de qualité supérieure sélectionné par Galy Market.';
      // Créer paragraphes si le texte est long
      const sentences = descText.split('. ').filter(s => s.trim().length > 0);
      if (sentences.length > 1) {
        descEl.innerHTML = sentences.map(s => `<p style="margin-bottom:8px">${s.trim().replace(/\.?$/, '')}.</p>`).join('');
      } else {
        descEl.textContent = descText;
      }
    }
    renderHighlights(p.cat);
    renderSpecs(p.cat);
    renderReviews();

    // Similaires
    renderSimilaires();
  }

  /* ── HIGHLIGHTS ── */
  function renderHighlights(cat) {
    const hl = HIGHLIGHTS[cat] || HIGHLIGHTS.phones;
    $('tabHighlights').innerHTML = hl.map(h => `
      <div class="highlight-item">
        <i class="fas ${h.icon}"></i>
        <div><strong>${h.title}</strong><span>${h.desc}</span></div>
      </div>`).join('');
  }

  /* ── SPECS ── */
  function renderSpecs(cat) {
    // Utiliser les specs custom du produit si elles existent
    if (product.specs && product.specs.length > 0) {
      $('specsTable').innerHTML = product.specs
        .filter(s => s.key && s.val)
        .map(s => `<tr><td>${s.key}</td><td>${s.val}</td></tr>`)
        .join('');
      return;
    }
    // Sinon specs par défaut selon catégorie
    const specs = SPECS[cat] || SPECS.phones;
    // Ajouter la marque si disponible
    const allSpecs = product.brand
      ? [['Marque', product.brand], ...specs.filter(s => s[0] !== 'Marque')]
      : specs;
    $('specsTable').innerHTML = allSpecs.map(([k, v]) =>
      `<tr><td>${k}</td><td>${v}</td></tr>`
    ).join('');
  }

  /* ── AVIS ── */
  function renderReviews() {
    // Summary
    const avg = (FAKE_REVIEWS.reduce((a, r) => a + r.rating, 0) / FAKE_REVIEWS.length).toFixed(1);
    $('rsScore').textContent = avg;
    $('rsStars').textContent = renderStars(parseFloat(avg));
    $('rsTotal').textContent = `${FAKE_REVIEWS.length} avis`;

    // Barres
    const dist = [5, 4, 3, 2, 1].map(n => ({
      n, count: FAKE_REVIEWS.filter(r => r.rating === n).length
    }));
    $('rsBars').innerHTML = dist.map(d => `
      <div class="rs-bar-row">
        <span>${d.n}★</span>
        <div class="rs-bar-bg">
          <div class="rs-bar-fill" style="width:${FAKE_REVIEWS.length ? d.count / FAKE_REVIEWS.length * 100 : 0}%"></div>
        </div>
        <span class="rs-bar-count">${d.count}</span>
      </div>`).join('');

    // Liste
    const stored = JSON.parse(localStorage.getItem(`GM_REVIEWS_${product.id}`) || '[]');
    const all = [...stored, ...FAKE_REVIEWS];
    $('reviewsList').innerHTML = all.map(r => `
      <div class="review-card">
        <div class="rc-header">
          <div class="rc-avatar">${r.name[0]}</div>
          <div>
            <div class="rc-name">${r.name}</div>
            <div class="rc-date">${r.date}</div>
          </div>
          <div class="rc-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        </div>
        <p class="rc-text">${r.text}</p>
        ${r.verified ? '<div class="rc-verified"><i class="fas fa-circle-check"></i> Achat vérifié</div>' : ''}
      </div>`).join('');
  }

  /* ── SIMILAIRES ── */
  function renderSimilaires() {
    // Charger tous les produits (base + custom)
    const allP = getAllProdsForPage();
    const similar = allP
      .filter(p => String(p.id) !== String(product.id) && p.cat === product.cat)
      .slice(0, 4);
    const grid = $('similairesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!similar.length) {
      grid.innerHTML = '<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:20px">Aucun produit similaire</p>';
      return;
    }
    similar.forEach((p, i) => {
      const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
      const inWish = wishlist.includes(p.id);
      const photoSrc = (p.photos && p.photos[0]) || p.img || '';
      const card = document.createElement('div');
      card.className = 'prod-card';
      card.style.animationDelay = `${i * 80}ms`;
      card.innerHTML = `
        <div class="card-img">
          ${photoSrc ? `<img src="${photoSrc}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextSibling.style.display='flex'">` : ''}
          <div class="card-emoji" ${photoSrc ? 'style="display:none"' : ''}>${p.em||'📦'}</div>
          ${disc ? `<div class="card-disc">-${disc}%</div>` : ''}
          ${p.flash ? `<div class="card-flash">⚡ FLASH</div>` : ''}
          <button class="card-wish ${inWish ? 'active' : ''}" data-id="${p.id}">
            <i class="${inWish ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <div class="card-quick">
            <button class="quick-cart" data-id="${p.id}">
              <i class="fas fa-cart-plus"></i> Ajouter
            </button>
            <a href="produit.html?id=${p.id}" class="quick-view"><i class="fas fa-eye"></i></a>
          </div>
        </div>
        <div class="card-body">
          <div class="card-name">${p.name}</div>
          <div class="card-prices">
            <span class="price-now">${fmt(p.price)}</span>
            ${p.old ? `<span class="price-old">${fmt(p.old)}</span>` : ''}
          </div>
        </div>`;

      card.querySelector('.card-wish').addEventListener('click', e => {
        e.stopPropagation(); toggleWish(p.id, card.querySelector('.card-wish'));
      });
      card.querySelector('.quick-cart').addEventListener('click', e => {
        e.stopPropagation(); addToCart(p, 1);
      });
      grid.appendChild(card);
    });
  }

  /* ── VARIANTES ── */
  let selectedVariantes = {};
  let prixBase = 0;

  function renderVariantes(p) {
    const container = document.getElementById('piVariantes');
    if (!p.variantes || Object.keys(p.variantes).length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';
    prixBase = p.price;
    let html = '';

    // ── Stockage ──
    if (p.variantes.stockage) {
      html += `<div class="var-section">
        <div class="var-label">Stockage <span id="varLabelStockage"></span></div>
        <div class="var-btns" id="varStockage">`;
      p.variantes.stockage.forEach((v, i) => {
        const extra = v.prixExtra > 0 ? ` <span class="pi-prix-extra plus">+${fmt(v.prixExtra)}</span>` : '';
        html += `<button class="var-btn ${i===0?'selected':''}" 
          data-type="stockage" data-idx="${i}" data-extra="${v.prixExtra}"
          onclick="selectVariante('stockage',${i},this,'${v.label}',${v.prixExtra})">
          ${v.label}${extra}
        </button>`;
      });
      html += `</div></div>`;
      // Sélectionner le premier par défaut
      selectedVariantes.stockage = { label: p.variantes.stockage[0].label, extra: p.variantes.stockage[0].prixExtra };
      document.getElementById('varLabelStockage') && (document.getElementById('varLabelStockage').textContent = '— ' + p.variantes.stockage[0].label);
    }

    // ── Couleur ──
    if (p.variantes.couleur) {
      html += `<div class="var-section">
        <div class="var-label">Couleur <span id="varLabelCouleur"></span></div>
        <div class="var-btns" id="varCouleur">`;
      p.variantes.couleur.forEach((v, i) => {
        html += `<div class="var-color ${i===0?'selected':''}" 
          style="background:${v.hex}" 
          title="${v.label}"
          onclick="selectVariante('couleur',${i},this,'${v.label}',0)">
          <span class="var-color-tooltip">${v.label}</span>
        </div>`;
      });
      html += `</div></div>`;
      selectedVariantes.couleur = { label: p.variantes.couleur[0].label };
    }

    container.innerHTML = html;
    majPrixVariantes();
  }

  function selectVariante(type, idx, el, label, extra) {
    // Retirer selected du même groupe
    const group = type === 'couleur' ? '.var-color' : `.var-btn[data-type="${type}"]`;
    document.querySelectorAll(group).forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    // Mettre à jour label
    const labelEl = document.getElementById('varLabel' + type.charAt(0).toUpperCase() + type.slice(1));
    if (labelEl) labelEl.textContent = '— ' + label;
    // Sauvegarder sélection
    selectedVariantes[type] = { label, extra: extra || 0 };
    majPrixVariantes();
  }

  function majPrixVariantes() {
    let total = prixBase;
    Object.values(selectedVariantes).forEach(v => { total += (v.extra || 0); });
    const el = document.getElementById('piPriceNow');
    if (el) el.textContent = fmt(total);
    // Mettre à jour le prix du produit courant pour le panier
    if (product) product._prixFinal = total;
  }

  function getVariantesLabel() {
    return Object.values(selectedVariantes).map(v => v.label).filter(Boolean).join(' · ');
  }

  /* ── QUANTITÉ ── */
  let currentQty = 1;
  $('qtyMinus')?.addEventListener('click', () => {
    if (currentQty > 1) { currentQty--; $('qtyVal').textContent = currentQty; }
  });
  $('qtyPlus')?.addEventListener('click', () => {
    if (!product.stock || currentQty < product.stock) {
      currentQty++; $('qtyVal').textContent = currentQty;
    }
  });

  /* ── PANIER ── */
  function addToCart(p, q) {
    const varLabel = getVariantesLabel ? getVariantesLabel() : '';
    const prixFinal = p._prixFinal || p.price;
    const cartKey = p.id + (varLabel ? '_' + varLabel.replace(/\s/g,'') : '');
    const ex = cart.find(i => i.cartKey === cartKey);
    if (ex) { ex.qty += q; }
    else cart.push({
      id: p.id,
      cartKey,
      name: p.name + (varLabel ? ' — ' + varLabel : ''),
      price: prixFinal,
      em: p.em,
      img: p.img,
      qty: q,
      variantes: varLabel
    });
    saveCart(); updateBadges(); renderCartDrawer();
    showToast(`🛒 ${p.name.slice(0, 22)}${varLabel ? ' ('+varLabel.slice(0,20)+')' : ''}… ajouté !`);
  }

  $('btnCart')?.addEventListener('click', () => {
    if (product) addToCart(product, currentQty);
  });

  // ✅ BOUTON DISCUTER ICI — Redirige vers gestionnaire de la catégorie
  $('btnDiscuss')?.addEventListener('click', () => {
    if (!product) return;
    const s = JSON.parse(localStorage.getItem('GM_SETTINGS') || '{}');
    const gestionnaires = s.gestionnaires_cats || {};
    // Trouver le gestionnaire de la catégorie du produit
    const cat = product.cat || 'general';
    const waNum = gestionnaires[cat] || gestionnaires['general'] || (s.shopWa || '224627900578').replace(/[^0-9]/g,'');
    const msg = `Bonjour Galy Market ! 👋\n\nJe suis intéressé(e) par ce produit :\n\n🛍️ *${product.name}*\n💰 Prix : ${product.price.toLocaleString('fr-FR')} GNF\n\nJ'aimerais avoir plus d'informations. Merci !`;
    window.open(`https://wa.me/${waNum.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  $('btnOrder')?.addEventListener('click', () => {
    if (product) {
      addToCart(product, currentQty);
      window.location.href = 'commande.html';
    }
  });

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart(); updateBadges(); renderCartDrawer();
  }
  function changeQty(id, d) {
    const it = cart.find(i => i.id === id);
    if (!it) return;
    it.qty += d;
    if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(); updateBadges(); renderCartDrawer();
  }
  window.cartQty    = changeQty;
  window.cartRemove = removeFromCart;

  function renderCartDrawer() {
    const body = $('cartBody'); if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty"><i class="fas fa-bag-shopping"></i><p>Votre panier est vide</p></div>`;
      $('cartTotal').textContent = '0 GNF';
      $('drawerCount').textContent = '';
      if ($('cartSavings')) $('cartSavings').textContent = '';
      return;
    }
    const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
    const qty      = cart.reduce((a, i) => a + i.qty, 0);
    body.innerHTML = cart.map(it => `
      <div class="cart-item">
        <div class="ci-img">${it.img ? `<img src="${it.img}">` : it.em}</div>
        <div class="ci-info">
          <div class="ci-name">${it.name}</div>
          <div class="ci-price">${fmt(it.price * it.qty)}</div>
          <div class="ci-qty">
            <button class="ci-qty-btn" onclick="cartQty(${it.id},-1)">−</button>
            <span class="ci-qty-val">${it.qty}</span>
            <button class="ci-qty-btn" onclick="cartQty(${it.id},+1)">+</button>
          </div>
        </div>
        <button class="ci-del" onclick="cartRemove(${it.id})"><i class="fas fa-times"></i></button>
      </div>`).join('');
    $('cartTotal').textContent = fmt(subtotal);
    $('drawerCount').textContent = `(${qty})`;
  }

  /* ── WISHLIST ── */
  function toggleWish(id, btn) {
    const idx = wishlist.indexOf(id);
    if (idx >= 0) { wishlist.splice(idx, 1); showToast('💔 Retiré des favoris'); }
    else          { wishlist.push(id);        showToast('❤️ Ajouté aux favoris !'); }
    saveWishlist(); updateBadges(); syncWishBtns();
    if (btn) {
      btn.classList.toggle('active', wishlist.includes(id));
      btn.querySelector('i').className = wishlist.includes(id) ? 'fas fa-heart' : 'far fa-heart';
    }
  }

  function syncWishBtns() {
    const inW = wishlist.includes(product?.id);
    [$('galleryWish'), $('btnWish')].forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('active', inW);
      const i = btn.querySelector('i');
      if (i) i.className = inW ? 'fas fa-heart' : 'far fa-heart';
    });
  }

  $('galleryWish')?.addEventListener('click', () => toggleWish(product.id, $('galleryWish')));
  $('btnWish')?.addEventListener('click',     () => toggleWish(product.id, $('btnWish')));

  /* ── BADGES ── */
  function updateBadges() {
    const q = cart.reduce((a, i) => a + i.qty, 0);
    const cb = $('cartBadge'); if (cb) cb.textContent = q > 0 ? q : '';
    const wb = $('wishBadge'); if (wb) wb.textContent = wishlist.length > 0 ? wishlist.length : '';
  }

  /* ── TABS ── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });

  /* ── AVIS FORM ── */
  document.querySelectorAll('.rf-stars i').forEach(star => {
    star.addEventListener('click', () => {
      rfRating = parseInt(star.dataset.v);
      document.querySelectorAll('.rf-stars i').forEach((s, i) => {
        s.className = i < rfRating ? 'fas fa-star' : 'far fa-star';
        s.classList.toggle('active', i < rfRating);
      });
    });
  });

  $('rfSubmit')?.addEventListener('click', () => {
    const name = $('rfName').value.trim();
    const text = $('rfText').value.trim();
    if (!name || !text || rfRating === 0) {
      showToast('⚠️ Remplissez tous les champs et notez le produit'); return;
    }
    const stored = JSON.parse(localStorage.getItem(`GM_REVIEWS_${product.id}`) || '[]');
    stored.unshift({ name, rating: rfRating, text, date: new Date().toLocaleDateString('fr-FR'), verified: false });
    localStorage.setItem(`GM_REVIEWS_${product.id}`, JSON.stringify(stored));
    $('rfName').value = ''; $('rfText').value = ''; rfRating = 0;
    document.querySelectorAll('.rf-stars i').forEach(s => { s.className = 'far fa-star'; s.classList.remove('active'); });
    renderReviews();
    showToast('✅ Avis publié, merci !');
  });

  /* ── ZOOM ── */
  $('galleryZoom')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const m = (typeof mediaList !== 'undefined' && mediaList[galIdx]);
    if (m && m.type === 'photo') {
      $('zoomContent').innerHTML = `<img src="${m.src}" alt="${product.name}" style="max-width:90vw;max-height:85vh;border-radius:10px">`;
    } else if (product?.photos && product.photos[0]) {
      $('zoomContent').innerHTML = `<img src="${product.photos[0]}" alt="${product.name}" style="max-width:90vw;max-height:85vh;border-radius:10px">`;
    } else {
      $('zoomContent').innerHTML = `<div style="font-size:200px">${product?.em || '🛍️'}</div>`;
    }
    $('zoomModal')?.classList.add('open');
  });
  [$('zoomClose'), $('zoomModal')]?.forEach(el => el?.addEventListener('click', e => {
    if (e.target === $('zoomModal') || e.target === $('zoomClose') || e.target.closest('.zoom-close'))
      $('zoomModal')?.classList.remove('open');
  }));

  /* ── PARTAGE ── */
  window.shareProduct = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const rawUrl = window.location.href;
    const txt = encodeURIComponent(product.name + ' — ' + fmt(product.price) + ' sur Galy Market : ' + rawUrl);
    const links = {
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
      whatsapp: 'https://wa.me/224627900578?text=' + txt,
      twitter:  'https://twitter.com/intent/tweet?text=' + txt,
    };
    if (links[platform]) window.open(links[platform], '_blank');
  };
  window.copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => showToast('🔗 Lien copié !'));
  };

  /* ── CART DRAWER ── */
  $('cartToggle')?.addEventListener('click', () => {
    renderCartDrawer();
    $('cartOverlay')?.classList.add('open');
  });
  $('cartClose')?.addEventListener('click', () => $('cartOverlay')?.classList.remove('open'));
  $('cartOverlay')?.addEventListener('click', e => {
    if (e.target === $('cartOverlay')) $('cartOverlay').classList.remove('open');
  });

  /* ── TOAST ── */
  function showToast(msg) {
    const t = $('toast'), m = $('toastMsg');
    if (!t || !m) return;
    m.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── HEADER SCROLL ── */
  window.addEventListener('scroll', () => {
    $('header')?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ── BURGER ── */
  const burger = $('burger'), mMenu = $('mobileMenu'), mOv = $('mobileOverlay'), mClose = $('mobileClose');
  burger?.addEventListener('click', () => { burger.classList.add('open'); mMenu?.classList.add('open'); mOv?.classList.add('open'); });
  [mClose, mOv].forEach(el => el?.addEventListener('click', () => { burger?.classList.remove('open'); mMenu?.classList.remove('open'); mOv?.classList.remove('open'); }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $('cartOverlay')?.classList.remove('open');
      $('zoomModal')?.classList.remove('open');
    }
  });

  /* ── LANCEMENT ── */
  renderPage();
  updateBadges();
  renderCartDrawer();
  setTimeout(() => $('loader')?.classList.add('hidden'), 300);
});
