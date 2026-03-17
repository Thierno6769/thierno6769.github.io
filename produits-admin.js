/* ═══════════════════════════════════════════
   GALY MARKET — produits-admin.js
   Gestion produits & catégories dans l'admin
═══════════════════════════════════════════ */

/* ───────────────────────────────
   CATÉGORIES PAR DÉFAUT
─────────────────────────────────*/
const DEFAULT_CATS = [
  { id: 'phones',  name: 'Téléphones & Tech', em: '📱', desc: 'Smartphones, accessoires tech' },
  { id: 'mode',    name: 'Mode & Vêtements',  em: '👗', desc: 'Habits, chaussures, accessoires' },
  { id: 'beaute',  name: 'Beauté & Parfums',  em: '💄', desc: 'Cosmétiques, parfums, soins' },
  { id: 'maison',  name: 'Maison & Jardin',   em: '🏠', desc: 'Décoration, cuisine, jardinage' },
  { id: 'sport',   name: 'Sport & Fitness',   em: '⚽', desc: 'Équipements sportifs' },
  { id: 'bijoux',  name: 'Bijoux & Montres',  em: '💍', desc: 'Bijoux, montres, accessoires' },
];

function getCategories() {
  const saved = localStorage.getItem('GM_CATEGORIES');
  return saved ? JSON.parse(saved) : DEFAULT_CATS;
}
function saveCategories(cats) {
  localStorage.setItem('GM_CATEGORIES', JSON.stringify(cats));
}

/* ───────────────────────────────
   PRODUITS (fusionnés base + overrides)
─────────────────────────────────*/
function getAllProducts() {
  const overrides = JSON.parse(localStorage.getItem('GM_PROD_OVERRIDES') || '{}');
  const custom    = JSON.parse(localStorage.getItem('GM_CUSTOM_PRODS')   || '[]');
  const base = (typeof GM_PRODUCTS !== 'undefined') ? GM_PRODUCTS.map(p => {
    const ov = overrides[p.id] || {};
    return { ...p, ...ov, _base: true };
  }).filter(p => !p._deleted) : [];
  return [...base, ...custom.filter(p => !p._deleted)];
}

function getCustomProds() {
  return JSON.parse(localStorage.getItem('GM_CUSTOM_PRODS') || '[]');
}
function saveCustomProds(prods) {
  localStorage.setItem('GM_CUSTOM_PRODS', JSON.stringify(prods));
}
function saveOverride(id, data) {
  const ov = JSON.parse(localStorage.getItem('GM_PROD_OVERRIDES') || '{}');
  ov[id] = { ...(ov[id] || {}), ...data };
  localStorage.setItem('GM_PROD_OVERRIDES', JSON.stringify(ov));
}

/* ───────────────────────────────
   ÉTAT DU MODAL
─────────────────────────────────*/
let pmPhotos   = [];   // [{base64, name}]
let pmVariants = [];   // ['S','M','L']
let pmSpecs    = [];   // [{key,val}]
let pmVideoB64 = null; // base64 vidéo uploadée
let pmVideoUrl = '';   // URL YouTube/TikTok
let pmVideoTab = 'link';

/* ───────────────────────────────
   SOUS-ONGLETS
─────────────────────────────────*/
window.switchProdSubtab = function(tab, btn) {
  document.querySelectorAll('.prod-subtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('prodSubListe').style.display      = tab === 'liste'      ? '' : 'none';
  document.getElementById('prodSubCategories').style.display = tab === 'categories' ? '' : 'none';
  if (tab === 'categories') renderCatGrid();
};

/* ───────────────────────────────
   RENDU GRILLE PRODUITS
─────────────────────────────────*/
window.renderProdsAdmin = function() {
  const grid   = document.getElementById('prodGridAdmin');
  const badge  = document.getElementById('prodCountBadge');
  const search = (document.getElementById('prodSearch')?.value || '').toLowerCase();
  const catF   = document.getElementById('prodCatFilter')?.value || '';
  if (!grid) return;

  populateCatSelects();

  let prods = getAllProducts();
  if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search) || (p.brand||'').toLowerCase().includes(search));
  if (catF)   prods = prods.filter(p => p.cat === catF);

  if (badge) badge.textContent = prods.length;

  if (!prods.length) {
    grid.innerHTML = `<div class="pa-empty"><i class="fas fa-box-open"></i><p>Aucun produit trouvé</p><button class="btn-adm-primary" onclick="openAddProdModal()"><i class="fas fa-plus"></i> Ajouter un produit</button></div>`;
    return;
  }

  grid.innerHTML = prods.map(p => {
    const cats = getCategories();
    const cat  = cats.find(c => c.id === p.cat);
    const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    const thumb = (p.photos && p.photos[0]) ? `<img src="${p.photos[0]}" alt="${p.name}">` : `<span class="pa-card-emoji">${p.em || '📦'}</span>`;
    const stockClass = p.stock <= 0 ? 'stock-empty' : p.stock <= 5 ? 'stock-low' : 'stock-ok';
    const stockLabel = p.stock <= 0 ? 'Rupture' : p.stock <= 5 ? `${p.stock} restants` : `${p.stock} en stock`;
    return `<div class="pa-card" data-id="${p.id}">
      <div class="pa-card-img">
        ${thumb}
        ${disc ? `<span class="pa-disc-badge">-${disc}%</span>` : ''}
        ${p.flash ? '<span class="pa-flash-badge">⚡</span>' : ''}
        ${p.isNew ? '<span class="pa-new-badge">NEW</span>' : ''}
        <div class="pa-card-overlay">
          <button class="pa-ov-btn" onclick="openEditProdModal(${p.id})" title="Modifier"><i class="fas fa-pen"></i></button>
          <button class="pa-ov-btn danger" onclick="deleteProd(${p.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
          <button class="pa-ov-btn" onclick="window.open('produit.html?id=${p.id}','_blank')" title="Voir"><i class="fas fa-eye"></i></button>
        </div>
      </div>
      <div class="pa-card-body">
        <div class="pa-card-cat">${cat ? cat.em + ' ' + cat.name : '—'}</div>
        <div class="pa-card-name">${p.name}</div>
        <div class="pa-card-prices">
          <span class="pa-price">${p.price.toLocaleString('fr-FR')} GNF</span>
          ${p.old ? `<span class="pa-old">${p.old.toLocaleString('fr-FR')} GNF</span>` : ''}
        </div>
        <div class="pa-card-footer">
          <span class="pa-stock ${stockClass}">${stockLabel}</span>
          <span class="pa-rating">⭐ ${p.rating || '4.5'}</span>
        </div>
        ${p.variants?.length ? `<div class="pa-variants-row">${p.variants.map(v=>`<span class="pa-var-chip">${v}</span>`).join('')}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // Events recherche/filtre
  document.getElementById('prodSearch')?.addEventListener('input',  renderProdsAdmin);
  document.getElementById('prodCatFilter')?.addEventListener('change', renderProdsAdmin);
};

/* ───────────────────────────────
   POPULATE SELECTS CATÉGORIES
─────────────────────────────────*/
function populateCatSelects() {
  const cats = getCategories();
  const filterSel = document.getElementById('prodCatFilter');
  const modalSel  = document.getElementById('pmCat');
  if (filterSel) {
    filterSel.innerHTML = '<option value="">Toutes catégories</option>' +
      cats.map(c => `<option value="${c.id}">${c.em} ${c.name}</option>`).join('');
  }
  if (modalSel) {
    modalSel.innerHTML = cats.map(c => `<option value="${c.id}">${c.em} ${c.name}</option>`).join('');
  }
}

/* ───────────────────────────────
   OUVRIR MODAL AJOUT
─────────────────────────────────*/
window.openAddProdModal = function() {
  resetProdModal();
  document.getElementById('prodModalTitle').innerHTML = '<i class="fas fa-plus"></i> Nouveau produit';
  document.getElementById('pmId').value = '';
  openModal('prodModal');
  updateStorageInfo();
};

window.openEditProdModal = function(id) {
  resetProdModal();
  const p = getAllProducts().find(x => x.id == id);
  if (!p) return showToastAdm('❌ Produit introuvable');
  document.getElementById('prodModalTitle').innerHTML = '<i class="fas fa-pen"></i> Modifier le produit';
  document.getElementById('pmId').value    = p.id;
  document.getElementById('pmName').value  = p.name    || '';
  document.getElementById('pmBrand').value = p.brand   || '';
  document.getElementById('pmEm').value    = p.em      || '';
  document.getElementById('pmPrice').value = p.price   || '';
  document.getElementById('pmOld').value   = p.old     || '';
  document.getElementById('pmStock').value = p.stock   || '';
  document.getElementById('pmRating').value= p.rating  || '';
  document.getElementById('pmDesc').value  = p.desc    || '';
  document.getElementById('pmDescFull').value = p.descFull || '';
  document.getElementById('pmFlash').checked  = !!p.flash;
  document.getElementById('pmNew').checked    = !!p.isNew;
  document.getElementById('pmPromo').checked  = !!p.promo;
  // Catégorie
  populateCatSelects();
  if (p.cat) document.getElementById('pmCat').value = p.cat;
  // Photos
  pmPhotos = p.photos ? [...p.photos] : [];
  renderPhotosGrid();
  // Vidéo
  if (p.videoUrl) { pmVideoUrl = p.videoUrl; document.getElementById('pmVideoUrl').value = p.videoUrl; previewVideoUrl(p.videoUrl); }
  if (p.videoB64) { pmVideoB64 = p.videoB64; showUploadedVideo(p.videoB64); }
  // Variantes
  pmVariants = p.variants ? [...p.variants] : [];
  if (pmVariants.length) {
    document.getElementById('pmVarType').value = p.varType || 'custom';
    document.getElementById('pmVarInput').style.display = '';
    renderVarTags();
  }
  // Specs
  pmSpecs = p.specs ? [...p.specs] : [];
  renderSpecs();
  updatePreview();
  openModal('prodModal');
  updateStorageInfo();
};

/* ───────────────────────────────
   RESET MODAL
─────────────────────────────────*/
function resetProdModal() {
  pmPhotos = []; pmVariants = []; pmSpecs = []; pmVideoB64 = null; pmVideoUrl = '';
  ['pmId','pmName','pmBrand','pmEm','pmPrice','pmOld','pmStock','pmRating','pmDesc','pmDescFull','pmVideoUrl'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['pmFlash','pmNew','pmPromo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  document.getElementById('pmVarInput').style.display  = 'none';
  document.getElementById('pmVarTags').innerHTML       = '';
  document.getElementById('pmSpecsList').innerHTML     = '';
  document.getElementById('pmPhotosGrid').innerHTML    = '';
  document.getElementById('pmVidPreview').style.display = 'none';
  document.getElementById('pmVideoPreviewBox').style.display = 'none';
  populateCatSelects();
  updatePreview();
}

window.closeProdModal = function() { closeModal('prodModal'); };

/* ───────────────────────────────
   PHOTOS — UPLOAD & GESTION
─────────────────────────────────*/
window.pmHandlePhotos = function(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return showToastAdm('⚠️ Fichier non supporté : ' + file.name);
    if (file.size > 5 * 1024 * 1024) return showToastAdm('⚠️ Photo trop lourde (max 5MB) : ' + file.name);
    const reader = new FileReader();
    reader.onload = e => {
      pmPhotos.push(e.target.result);
      renderPhotosGrid();
      updatePreview();
      updateStorageInfo();
    };
    reader.readAsDataURL(file);
  });
};

// Drag & drop sur la zone
document.addEventListener('DOMContentLoaded', () => {
  const drop = document.getElementById('pmPhotosDrop');
  if (!drop) return;
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('dragover');
    pmHandlePhotos(e.dataTransfer.files);
  });
});

function renderPhotosGrid() {
  const grid = document.getElementById('pmPhotosGrid');
  if (!grid) return;
  if (!pmPhotos.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = pmPhotos.map((src, i) => `
    <div class="pm-photo-item ${i===0?'main-photo':''}" draggable="true"
         ondragstart="pmDragPhoto(${i})" ondragover="event.preventDefault()"
         ondrop="pmDropPhoto(event,${i})">
      <img src="${src}" alt="Photo ${i+1}">
      ${i===0 ? '<div class="pm-photo-main-badge">Principale</div>' : ''}
      <button class="pm-photo-del" onclick="pmRemovePhoto(${i})" title="Supprimer"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

let dragIdx = null;
window.pmDragPhoto   = i => { dragIdx = i; };
window.pmDropPhoto   = (e, i) => {
  e.preventDefault();
  if (dragIdx === null || dragIdx === i) return;
  const arr = [...pmPhotos];
  const [moved] = arr.splice(dragIdx, 1);
  arr.splice(i, 0, moved);
  pmPhotos = arr; dragIdx = null;
  renderPhotosGrid(); updatePreview();
};
window.pmRemovePhoto = i => {
  pmPhotos.splice(i, 1);
  renderPhotosGrid(); updatePreview(); updateStorageInfo();
};

/* ───────────────────────────────
   VIDÉO
─────────────────────────────────*/
window.pmSetVideoTab = function(btn, tab) {
  document.querySelectorAll('.pm-vtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); pmVideoTab = tab;
  document.getElementById('pmVidLink').style.display   = tab === 'link'   ? '' : 'none';
  document.getElementById('pmVidUpload').style.display = tab === 'upload' ? '' : 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('pmVideoUrl');
  if (urlInput) urlInput.addEventListener('input', () => previewVideoUrl(urlInput.value));
});

function previewVideoUrl(url) {
  pmVideoUrl = url;
  const preview = document.getElementById('pmVidPreview');
  const iframe  = document.getElementById('pmVidIframe');
  if (!url) { preview.style.display = 'none'; return; }
  let embed = '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) embed = `https://www.youtube.com/embed/${yt[1]}`;
  const tk = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tk) embed = `https://www.tiktok.com/embed/${tk[1]}`;
  if (embed) { iframe.src = embed; preview.style.display = ''; }
  else preview.style.display = 'none';
}

window.pmHandleVideo = function(file) {
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) return showToastAdm('⚠️ Vidéo trop lourde (max 20MB)');
  const reader = new FileReader();
  reader.onload = e => { pmVideoB64 = e.target.result; showUploadedVideo(e.target.result); updateStorageInfo(); };
  reader.readAsDataURL(file);
};

function showUploadedVideo(src) {
  const box = document.getElementById('pmVideoPreviewBox');
  const vid = document.getElementById('pmVideoEl');
  vid.src = src; box.style.display = '';
}

window.pmRemoveVideo = function() {
  pmVideoB64 = null;
  document.getElementById('pmVideoEl').src = '';
  document.getElementById('pmVideoPreviewBox').style.display = 'none';
  document.getElementById('pmVideoInput').value = '';
  updateStorageInfo();
};

/* ───────────────────────────────
   VARIANTES
─────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('pmVarType');
  if (sel) sel.addEventListener('change', () => {
    document.getElementById('pmVarInput').style.display = sel.value ? '' : 'none';
    if (!sel.value) { pmVariants = []; renderVarTags(); }
    // Suggestions selon type
    const suggestions = { taille:'S, M, L, XL, XXL', couleur:'Rouge, Bleu, Vert, Noir, Blanc', pointure:'38, 39, 40, 41, 42, 43, 44' };
    const input = document.getElementById('pmVarValues');
    if (input && suggestions[sel.value]) input.placeholder = `Ex: ${suggestions[sel.value]}`;
  });
});

window.pmAddVariants = function() {
  const raw = document.getElementById('pmVarValues').value;
  if (!raw.trim()) return;
  raw.split(',').map(v => v.trim()).filter(Boolean).forEach(v => {
    if (!pmVariants.includes(v)) pmVariants.push(v);
  });
  document.getElementById('pmVarValues').value = '';
  renderVarTags(); updatePreview();
};

function renderVarTags() {
  const el = document.getElementById('pmVarTags');
  if (!el) return;
  el.innerHTML = pmVariants.map((v, i) =>
    `<span class="pm-var-tag">${v}<button onclick="pmRemoveVariant(${i})"><i class="fas fa-times"></i></button></span>`
  ).join('');
}

window.pmRemoveVariant = function(i) { pmVariants.splice(i, 1); renderVarTags(); updatePreview(); };

/* ───────────────────────────────
   SPÉCIFICATIONS
─────────────────────────────────*/
window.pmAddSpec = function() {
  pmSpecs.push({ key: '', val: '' });
  renderSpecs();
};

function renderSpecs() {
  const el = document.getElementById('pmSpecsList');
  if (!el) return;
  el.innerHTML = pmSpecs.map((s, i) => `
    <div class="pm-spec-row">
      <input class="lf-input" placeholder="Clé (ex: Poids)" value="${s.key}"
             oninput="pmSpecs[${i}].key=this.value" />
      <input class="lf-input" placeholder="Valeur (ex: 250g)" value="${s.val}"
             oninput="pmSpecs[${i}].val=this.value" />
      <button class="pm-spec-del" onclick="pmRemoveSpec(${i})"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

window.pmRemoveSpec = function(i) { pmSpecs.splice(i, 1); renderSpecs(); };

/* ───────────────────────────────
   APERÇU CARTE
─────────────────────────────────*/
function updatePreview() {
  const name  = document.getElementById('pmName')?.value  || 'Nom du produit';
  const price = parseInt(document.getElementById('pmPrice')?.value || '0');
  const em    = document.getElementById('pmEm')?.value    || '📦';
  const flash = document.getElementById('pmFlash')?.checked;
  const isNew = document.getElementById('pmNew')?.checked;

  document.getElementById('pcpName').textContent  = name;
  document.getElementById('pcpPrice').textContent = price.toLocaleString('fr-FR') + ' GNF';

  const imgEl = document.getElementById('pcpImg');
  if (pmPhotos[0]) imgEl.innerHTML = `<img src="${pmPhotos[0]}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
  else imgEl.textContent = em;

  const tags = document.getElementById('pcpTags');
  tags.innerHTML = `${flash ? '<span class="pcp-tag flash">⚡ Flash</span>' : ''}${isNew ? '<span class="pcp-tag new">NEW</span>' : ''}`;
}

document.addEventListener('DOMContentLoaded', () => {
  ['pmName','pmPrice','pmEm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
  });
  ['pmFlash','pmNew'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updatePreview);
  });
});

/* ───────────────────────────────
   STORAGE INFO
─────────────────────────────────*/
function updateStorageInfo() {
  const el = document.getElementById('pmStorageInfo');
  if (!el) return;
  try {
    let total = 0;
    for (let k in localStorage) total += (localStorage.getItem(k)||'').length;
    const mb = (total / 1024 / 1024).toFixed(1);
    const pct = Math.min(100, Math.round(total / (50*1024*1024) * 100));
    const color = pct > 80 ? '#e74c3c' : pct > 50 ? '#f68b1e' : '#22c55e';
    el.innerHTML = `<i class="fas fa-database" style="color:${color}"></i> Stockage : <strong style="color:${color}">${mb}MB / ~50MB</strong>
      <div class="pm-storage-bar"><div style="width:${pct}%;background:${color}"></div></div>`;
  } catch(e) {}
}

/* ───────────────────────────────
   SAUVEGARDER PRODUIT
─────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveProdBtn')?.addEventListener('click', saveProd);
  document.getElementById('btnAddProd')?.addEventListener('click', openAddProdModal);
});

function saveProd() {
  const id     = document.getElementById('pmId').value;
  const name   = document.getElementById('pmName').value.trim();
  const cat    = document.getElementById('pmCat').value;
  const price  = parseInt(document.getElementById('pmPrice').value) || 0;

  if (!name)  return showToastAdm('⚠️ Le nom du produit est obligatoire');
  if (!cat)   return showToastAdm('⚠️ Choisissez une catégorie');
  if (!price) return showToastAdm('⚠️ Le prix est obligatoire');

  const data = {
    id:        id ? parseInt(id) : Date.now(),
    name, cat, price,
    brand:     document.getElementById('pmBrand').value.trim(),
    em:        document.getElementById('pmEm').value.trim() || '📦',
    old:       parseInt(document.getElementById('pmOld').value)    || 0,
    stock:     parseInt(document.getElementById('pmStock').value)  || 0,
    rating:    parseFloat(document.getElementById('pmRating').value) || 4.5,
    desc:      document.getElementById('pmDesc').value.trim(),
    descFull:  document.getElementById('pmDescFull').value.trim(),
    flash:     document.getElementById('pmFlash').checked,
    isNew:     document.getElementById('pmNew').checked,
    promo:     document.getElementById('pmPromo').checked,
    photos:    [...pmPhotos],
    videoUrl:  pmVideoUrl || '',
    videoB64:  pmVideoB64 || null,
    varType:   document.getElementById('pmVarType').value,
    variants:  [...pmVariants],
    specs:     [...pmSpecs],
    _custom:   true,
    updatedAt: new Date().toISOString(),
  };

  // Vérif taille storage
  const dataSize = JSON.stringify(data).length;
  if (dataSize > 4 * 1024 * 1024) return showToastAdm('⚠️ Produit trop lourd ! Réduisez les photos.');

  if (id) {
    // Modifier : custom ou base ?
    const customs = getCustomProds();
    const idx = customs.findIndex(p => p.id == id);
    if (idx >= 0) { customs[idx] = data; saveCustomProds(customs); }
    else saveOverride(id, data);
  } else {
    // Nouveau produit custom
    const customs = getCustomProds();
    customs.push(data);
    saveCustomProds(customs);
  }

  closeProdModal();
  renderProdsAdmin();
  showToastAdm(`✅ Produit "${name}" sauvegardé !`);
  updateStorageInfo();
}

/* ───────────────────────────────
   SUPPRIMER PRODUIT
─────────────────────────────────*/
window.deleteProd = function(id) {
  if (!confirm('Supprimer ce produit définitivement ?')) return;
  const customs = getCustomProds();
  const idx = customs.findIndex(p => p.id == id);
  if (idx >= 0) { customs.splice(idx, 1); saveCustomProds(customs); }
  else {
    // Produit de base → marquer comme supprimé
    const ov = JSON.parse(localStorage.getItem('GM_PROD_OVERRIDES') || '{}');
    ov[id] = { ...(ov[id]||{}), _deleted: true };
    localStorage.setItem('GM_PROD_OVERRIDES', JSON.stringify(ov));
  }
  renderProdsAdmin();
  showToastAdm('🗑️ Produit supprimé');
};

/* ───────────────────────────────
   CATÉGORIES — RENDU GRILLE
─────────────────────────────────*/
function renderCatGrid() {
  const grid = document.getElementById('catAdminGrid');
  if (!grid) return;
  const cats = getCategories();
  const allProds = getAllProducts();
  grid.innerHTML = cats.map(c => {
    const count = allProds.filter(p => p.cat === c.id).length;
    const isDefault = DEFAULT_CATS.some(d => d.id === c.id);
    return `<div class="cat-admin-card">
      <div class="cac-top">
        <div class="cac-em">${c.em}</div>
        <div class="cac-info">
          <div class="cac-name">${c.name}</div>
          <div class="cac-desc">${c.desc || '—'}</div>
        </div>
      </div>
      <div class="cac-footer">
        <span class="cac-count"><i class="fas fa-box"></i> ${count} produit${count!==1?'s':''}</span>
        <div class="cac-actions">
          <button class="btn-adm-secondary sm" onclick="openEditCatModal('${c.id}')"><i class="fas fa-pen"></i></button>
          ${!isDefault ? `<button class="btn-danger sm" onclick="deleteCat('${c.id}')"><i class="fas fa-trash"></i></button>` : '<span class="cac-default">Par défaut</span>'}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ───────────────────────────────
   CATÉGORIES — MODAL
─────────────────────────────────*/
window.openAddCatModal = function() {
  ['catId','catName','catSlug','catEm','catDesc'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('catModalTitle').innerHTML = '<i class="fas fa-plus"></i> Nouvelle catégorie';
  openModal('catModal');
};

window.openEditCatModal = function(id) {
  const cat = getCategories().find(c => c.id === id);
  if (!cat) return;
  document.getElementById('catId').value   = cat.id;
  document.getElementById('catName').value = cat.name;
  document.getElementById('catSlug').value = cat.id;
  document.getElementById('catEm').value   = cat.em;
  document.getElementById('catDesc').value = cat.desc || '';
  document.getElementById('catModalTitle').innerHTML = '<i class="fas fa-pen"></i> Modifier la catégorie';
  openModal('catModal');
};

window.closeCatModal  = function() { closeModal('catModal'); };

window.saveCat = function() {
  const id   = document.getElementById('catId').value;
  const name = document.getElementById('catName').value.trim();
  const slug = document.getElementById('catSlug').value.trim().toLowerCase().replace(/\s+/g,'-');
  const em   = document.getElementById('catEm').value.trim()   || '📦';
  const desc = document.getElementById('catDesc').value.trim();

  if (!name) return showToastAdm('⚠️ Le nom est obligatoire');
  if (!slug) return showToastAdm('⚠️ Le slug est obligatoire');

  const cats = getCategories();
  if (id) {
    const idx = cats.findIndex(c => c.id === id);
    if (idx >= 0) cats[idx] = { ...cats[idx], name, em, desc };
  } else {
    if (cats.find(c => c.id === slug)) return showToastAdm('⚠️ Ce slug existe déjà');
    cats.push({ id: slug, name, em, desc });
  }
  saveCategories(cats);
  closeCatModal();
  renderCatGrid();
  populateCatSelects();
  showToastAdm(`✅ Catégorie "${name}" sauvegardée !`);
};

window.deleteCat = function(id) {
  if (!confirm('Supprimer cette catégorie ?')) return;
  const cats = getCategories().filter(c => c.id !== id);
  saveCategories(cats);
  renderCatGrid();
  showToastAdm('🗑️ Catégorie supprimée');
};

/* ───────────────────────────────
   HELPERS MODAL OPEN/CLOSE
─────────────────────────────────*/
function openModal(id) {
  const m = document.getElementById(id);
  const o = document.getElementById('admOverlay');
  if (m) m.classList.add('open');
  if (o) o.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  const o = document.getElementById('admOverlay');
  if (m) m.classList.remove('open');
  if (o) o.classList.remove('open');
}

/* ───────────────────────────────
   INIT
─────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  // Slug auto depuis le nom de catégorie
  document.getElementById('catName')?.addEventListener('input', e => {
    const slug = document.getElementById('catSlug');
    if (slug && !document.getElementById('catId').value) {
      slug.value = e.target.value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    }
  });
  // Init grille produits quand onglet actif
  const prodLink = document.querySelector('[data-tab="produits"]');
  if (prodLink) prodLink.addEventListener('click', () => setTimeout(renderProdsAdmin, 80));
});
