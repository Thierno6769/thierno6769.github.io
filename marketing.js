/* ═══════════════════════════════════════════
   GALY MARKET — marketing.js
   Onglet Marketing Admin
═══════════════════════════════════════════ */

const MKT = (() => {

  const SITE_URL  = window.location.origin + window.location.pathname.replace('admin.html','');
  const WA_NUM    = '224620000000';

  let currentProd = null;
  let currentTone = 'promo';
  let currentTheme = 'dark';

  /* ── Stats ── */
  let stats = JSON.parse(localStorage.getItem('GM_MKT_STATS') || '{"fb":0,"ig":0,"wa":0,"tg":0,"clicks":0}');
  const saveStats = () => localStorage.setItem('GM_MKT_STATS', JSON.stringify(stats));

  function updateStatsUI() {
    const s = el => document.getElementById(el);
    if (s('mktFbShares')) s('mktFbShares').textContent = stats.fb;
    if (s('mktIgShares')) s('mktIgShares').textContent = stats.ig;
    if (s('mktWaShares')) s('mktWaShares').textContent = stats.wa;
    if (s('mktClicks'))   s('mktClicks').textContent   = stats.clicks;
  }

  /* ── Populate product select ── */
  function populateSelect() {
    const sel = document.getElementById('mktProdSelect');
    if (!sel || typeof GM_PRODUCTS === 'undefined') return;
    sel.innerHTML = '<option value="">— Sélectionnez un produit —</option>';
    GM_PRODUCTS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.em} ${p.name} — ${p.price.toLocaleString('fr-FR')} GNF`;
      sel.appendChild(opt);
    });
  }

  /* ── Load product ── */
  window.mktLoadProduct = function(id) {
    if (!id) { currentProd = null; document.getElementById('mktProdPreview').style.display = 'none'; updateLink(); return; }
    currentProd = (typeof GM_PRODUCTS !== 'undefined') ? GM_PRODUCTS.find(p => p.id == id) : null;
    if (!currentProd) return;

    document.getElementById('mktProdPreview').style.display = 'flex';
    document.getElementById('mppEmoji').textContent  = currentProd.em;
    document.getElementById('mppName').textContent   = currentProd.name;
    document.getElementById('mppPrice').textContent  = currentProd.price.toLocaleString('fr-FR') + ' GNF';
    const disc = currentProd.old ? Math.round((1 - currentProd.price / currentProd.old) * 100) : 0;
    document.getElementById('mppDisc').textContent   = disc ? `-${disc}% de réduction` : '';

    updateLink();
    mktDrawCanvas();
  };

  /* ── Lien campagne ── */
  function updateLink() {
    const el = document.getElementById('mktProdLink');
    if (!el) return;
    if (!currentProd) { el.textContent = '— Sélectionnez un produit —'; return; }
    const link = `${SITE_URL}produit.html?id=${currentProd.id}&utm_source=social&utm_medium=post&utm_campaign=galy_market`;
    el.textContent = link;
  }

  window.mktCopyLink = function() {
    const txt = document.getElementById('mktProdLink')?.textContent;
    if (!txt || txt.includes('—')) return showToastAdm('⚠️ Sélectionnez d\'abord un produit');
    navigator.clipboard.writeText(txt).then(() => showToastAdm('✅ Lien copié !'));
    stats.clicks++; saveStats(); updateStatsUI();
  };

  /* ── Tone ── */
  window.mktSetTone = function(btn, tone) {
    document.querySelectorAll('.mkt-tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTone = tone;
  };

  /* ── Thème visuel ── */
  window.mktSetTheme = function(lbl, theme) {
    document.querySelectorAll('.mkt-vis-opt').forEach(l => l.classList.remove('active'));
    lbl.classList.add('active');
    currentTheme = theme;
    mktDrawCanvas();
  };

  /* ── Générer le texte du post ── */
  window.mktGeneratePost = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez d\'abord un produit');
    const p = currentProd;
    const link = `${SITE_URL}produit.html?id=${p.id}`;
    const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    const priceFmt = p.price.toLocaleString('fr-FR');
    const oldFmt   = p.old  ? p.old.toLocaleString('fr-FR') : '';

    const posts = {
      promo: `🔥 OFFRE SPÉCIALE — ${p.name} !\n\n${p.em} ${disc ? `Économisez ${disc}% aujourd'hui seulement !\n` : ''}✅ Prix : ${priceFmt} GNF${oldFmt ? ` (au lieu de ${oldFmt} GNF)` : ''}\n📦 Livraison à domicile partout à Conakry\n💳 Paiement à la livraison — payez quand vous recevez !\n\n👇 Commander maintenant :\n🌐 ${link}\n📱 WhatsApp : wa.me/${WA_NUM}\n\n#GalyMarket #Conakry #Guinée #Shopping #${p.name.replace(/\s+/g,'').replace(/[^a-zA-Z0-9]/g,'')} #Promo`,

      elegant: `✨ ${p.name}\n\n${p.em} Une pièce d'exception disponible chez Galy Market.\n\nQualité premium · Livraison rapide · Service irréprochable\n\n💰 ${priceFmt} GNF${oldFmt ? `\n~~${oldFmt} GNF~~` : ''}\n\n🛍️ Découvrir et commander :\n${link}\n\n#GalyMarket #Luxe #Guinée #Conakry #Mode #${p.name.replace(/\s+/g,'').replace(/[^a-zA-Z0-9]/g,'')}`,

      urgent: `⚡ DERNIÈRE CHANCE !\n\n${p.em} ${p.name} — stock limité !\n\n🔴 Prix exceptionnel : ${priceFmt} GNF${disc ? ` (-${disc}%)` : ''}\n⏰ Offre valable aujourd'hui seulement\n📦 Livraison express à Conakry\n\n➡️ Commander MAINTENANT avant rupture :\n${link}\n\n📞 WhatsApp : wa.me/${WA_NUM}\n\n#GalyMarket #Conakry #Guinée #UrgentOffer #${p.name.replace(/\s+/g,'').replace(/[^a-zA-Z0-9]/g,'')}`,

      simple: `${p.em} ${p.name}\n\nPrix : ${priceFmt} GNF\nLivraison à domicile — Conakry\nPaiement à la livraison\n\nCommander : ${link}\nWhatsApp : wa.me/${WA_NUM}\n\n#GalyMarket #Guinée`
    };

    const out = document.getElementById('mktPostOutput');
    const txt = document.getElementById('mktPostText');
    out.style.display = 'block';
    txt.value = posts[currentTone] || posts.promo;
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.mktCopyPost = function() {
    const txt = document.getElementById('mktPostText')?.value;
    if (!txt) return;
    navigator.clipboard.writeText(txt).then(() => showToastAdm('✅ Texte copié !'));
  };

  /* ── Canvas visuel ── */
  window.mktDrawCanvas = function() {
    const canvas = document.getElementById('mktCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 600, H = 600;

    const themes = {
      dark:  { bg: '#0f0c08', bg2: '#1a1206', text: '#ffffff', accent: '#f68b1e', sub: 'rgba(255,255,255,0.6)', badge: '#f68b1e' },
      light: { bg: '#fdf8f0', bg2: '#f5ede0', text: '#0f0c08', accent: '#f68b1e', sub: '#8a7a6a', badge: '#f68b1e' },
      gold:  { bg: '#1a0e00', bg2: '#2d1f0a', text: '#f5ede0', accent: '#f68b1e', sub: 'rgba(245,237,224,0.6)', badge: '#ff9640' },
    };
    const t = themes[currentTheme] || themes.dark;

    // Fond
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, t.bg);
    grad.addColorStop(1, t.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Cercle déco
    ctx.beginPath();
    ctx.arc(W - 80, 80, 160, 0, Math.PI * 2);
    ctx.fillStyle = `${t.accent}18`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(80, H - 80, 100, 0, Math.PI * 2);
    ctx.fillStyle = `${t.accent}10`;
    ctx.fill();

    // Logo
    ctx.font = 'bold 22px "DM Sans", sans-serif';
    ctx.fillStyle = t.accent;
    ctx.textAlign = 'left';
    ctx.fillText('GALY', 40, 50);
    ctx.fillStyle = t.text;
    ctx.fillText('MARKET', 92, 50);

    // Ligne déco
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 62);
    ctx.lineTo(W - 40, 62);
    ctx.stroke();

    if (!currentProd) {
      ctx.font = 'bold 28px "DM Sans", sans-serif';
      ctx.fillStyle = t.sub;
      ctx.textAlign = 'center';
      ctx.fillText('Sélectionnez un produit', W/2, H/2);
      return;
    }

    const p = currentProd;
    const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;

    // Emoji produit (grand)
    ctx.font = '140px serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.em, W/2, 250);

    // Badge promo
    if (disc) {
      ctx.fillStyle = '#e74c3c';
      roundRect(ctx, W - 130, 80, 90, 36, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`-${disc}%`, W - 85, 103);
    }

    // Nom produit
    ctx.font = 'bold 30px "DM Sans", sans-serif';
    ctx.fillStyle = t.text;
    ctx.textAlign = 'center';
    wrapText(ctx, p.name, W/2, 310, W - 80, 36);

    // Prix
    ctx.font = 'bold 42px "DM Sans", sans-serif';
    ctx.fillStyle = t.accent;
    ctx.fillText(p.price.toLocaleString('fr-FR') + ' GNF', W/2, 390);

    if (p.old) {
      ctx.font = '20px "DM Sans", sans-serif';
      ctx.fillStyle = t.sub;
      const oldTxt = p.old.toLocaleString('fr-FR') + ' GNF';
      const oldW = ctx.measureText(oldTxt).width;
      ctx.fillText(oldTxt, W/2, 418);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W/2 - oldW/2, 412);
      ctx.lineTo(W/2 + oldW/2, 412);
      ctx.stroke();
    }

    // Séparateur
    ctx.strokeStyle = `${t.accent}40`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 445);
    ctx.lineTo(W - 60, 445);
    ctx.stroke();

    // Infos livraison
    ctx.font = '17px "DM Sans", sans-serif';
    ctx.fillStyle = t.sub;
    ctx.textAlign = 'center';
    ctx.fillText('📦 Livraison à domicile · 💳 Paiement à la livraison', W/2, 475);

    // Bouton Commander maintenant
    ctx.fillStyle = t.accent;
    roundRect(ctx, 100, 500, W - 200, 54, 27);
    ctx.font = 'bold 20px "DM Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('🛍️ Commander maintenant', W/2, 533);

    // Footer
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.fillStyle = `${t.sub}80`;
    ctx.fillText('galymarket.com · WhatsApp +224 620 00 00 00', W/2, 580);
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineH;
      } else { line = test; }
    }
    ctx.fillText(line, x, y);
  }

  /* ── Télécharger l'image ── */
  window.mktDownloadImage = function() {
    const canvas = document.getElementById('mktCanvas');
    if (!canvas) return;
    const name = currentProd ? currentProd.name.replace(/\s+/g,'-').toLowerCase() : 'produit';
    const a = document.createElement('a');
    a.download = `galy-market-${name}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToastAdm('✅ Image téléchargée !');
  };

  /* ── Partages réseaux ── */
  function getPostText() {
    return document.getElementById('mktPostText')?.value || (currentProd ? `${currentProd.em} ${currentProd.name} — ${currentProd.price.toLocaleString('fr-FR')} GNF\n\nCommander : ${SITE_URL}produit.html?id=${currentProd.id}` : '');
  }
  function getProdLink() {
    if (!currentProd) return SITE_URL;
    return `${SITE_URL}produit.html?id=${currentProd.id}&utm_source=social`;
  }
  function logShare(net) {
    const now = new Date();
    const history = JSON.parse(localStorage.getItem('GM_MKT_HISTORY') || '[]');
    history.unshift({
      net, prodName: currentProd?.name || '—', prodId: currentProd?.id,
      date: now.toLocaleDateString('fr-FR'), time: now.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}),
      tone: currentTone
    });
    localStorage.setItem('GM_MKT_HISTORY', JSON.stringify(history.slice(0, 50)));
    renderHistory();
  }

  window.mktShareFacebook = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    const url = encodeURIComponent(getProdLink());
    const txt = encodeURIComponent(getPostText());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${txt}`, '_blank');
    stats.fb++; stats.clicks++; saveStats(); updateStatsUI();
    logShare('facebook');
    showToastAdm('✅ Partagé sur Facebook !');
  };

  window.mktShareWhatsApp = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    const txt = encodeURIComponent(getPostText());
    window.open(`https://wa.me/?text=${txt}`, '_blank');
    stats.wa++; stats.clicks++; saveStats(); updateStatsUI();
    logShare('whatsapp');
    showToastAdm('✅ Partagé sur WhatsApp !');
  };

  window.mktShareInstagram = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    navigator.clipboard.writeText(getPostText()).then(() => {
      window.open('https://www.instagram.com/', '_blank');
      showToastAdm('📋 Texte copié ! Collez-le dans votre publication Instagram');
    }).catch(() => {
      window.open('https://www.instagram.com/', '_blank');
      showToastAdm('📋 Ouvrez Instagram et collez le texte');
    });
    stats.ig++; stats.clicks++; saveStats(); updateStatsUI();
    logShare('instagram');
  };

  window.mktShareTikTok = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    const txt = `${getPostText()}\n\n#GalyMarket #Guinée #Shopping #${currentProd.cat||'Mode'} #Conakry`;
    navigator.clipboard.writeText(txt).then(() => {
      window.open('https://www.tiktok.com/', '_blank');
      showToastAdm('📋 Texte + hashtags copiés ! Collez dans TikTok');
    }).catch(() => {
      window.open('https://www.tiktok.com/', '_blank');
      showToastAdm('Ouvrez TikTok et collez le texte');
    });
    stats.tt = (stats.tt||0)+1; stats.clicks++; saveStats(); updateStatsUI();
    logShare('tiktok');
  };

  window.mktShareTelegram = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    const txt = encodeURIComponent(getPostText());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getProdLink())}&text=${txt}`, '_blank');
    stats.tg = (stats.tg||0)+1; stats.clicks++; saveStats(); updateStatsUI();
    logShare('telegram');
    showToastAdm('✅ Partagé sur Telegram !');
  };

  window.mktShareWhatsApp = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    const txt = encodeURIComponent(getPostText());
    window.open(`https://wa.me/?text=${txt}`, '_blank');
    stats.wa++; stats.clicks++; saveStats(); updateStatsUI();
    logShare('whatsapp');
    showToastAdm('✅ Partagé sur WhatsApp !');
  };

  window.mktShareInstagram = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    navigator.clipboard.writeText(getPostText()).then(() => {
      window.open('https://www.instagram.com/', '_blank');
      showToastAdm('✅ Texte copié ! Collez-le dans Instagram');
    });
    stats.ig++; stats.clicks++; saveStats(); updateStatsUI();
    logShare('instagram');
  };

  window.mktShareTelegram = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    const txt = encodeURIComponent(getPostText());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getProdLink())}&text=${txt}`, '_blank');
    stats.tg = (stats.tg||0)+1; stats.clicks++; saveStats(); updateStatsUI();
    logShare('telegram');
    showToastAdm('✅ Partagé sur Telegram !');
  };

  /* ── Programmer un post ── */
  window.mktSchedulePost = function() {
    if (!currentProd) return showToastAdm('⚠️ Sélectionnez un produit');
    const dateVal = document.getElementById('mktSchedDate')?.value;
    if (!dateVal) return showToastAdm('⚠️ Choisissez une date et heure');
    const net  = document.getElementById('mktSchedNet')?.value;
    const note = document.getElementById('mktSchedNote')?.value;
    const scheduled = JSON.parse(localStorage.getItem('GM_MKT_SCHED') || '[]');
    const newPost = {
      id: Date.now(), prodId: currentProd.id, prodName: currentProd.name,
      prodEm: currentProd.em, date: dateVal, net, note,
      text: getPostText(), link: getProdLink(), tone: currentTone
    };
    scheduled.push(newPost);
    localStorage.setItem('GM_MKT_SCHED', JSON.stringify(scheduled));
    renderScheduled();
    showToastAdm(`✅ Post programmé pour le ${new Date(dateVal).toLocaleString('fr-FR')}`);
    document.getElementById('mktSchedDate').value = '';
    document.getElementById('mktSchedNote').value = '';
  };

  function renderScheduled() {
    const list = document.getElementById('mktSchedList');
    if (!list) return;
    const scheduled = JSON.parse(localStorage.getItem('GM_MKT_SCHED') || '[]');
    if (!scheduled.length) { list.innerHTML = '<p class="mkt-empty">Aucun post programmé</p>'; return; }
    const netIcons = { facebook:'fab fa-facebook-f', instagram:'fab fa-instagram', whatsapp:'fab fa-whatsapp', telegram:'fab fa-telegram' };
    const netColors = { facebook:'#1877f2', instagram:'#e1306c', whatsapp:'#25d366', telegram:'#0088cc' };
    list.innerHTML = scheduled.sort((a,b) => new Date(a.date) - new Date(b.date)).map(s => {
      const d = new Date(s.date);
      const past = d < new Date();
      return `<div class="mkt-sched-item ${past ? 'past' : ''}">
        <div class="msi-net" style="background:${netColors[s.net]}20;color:${netColors[s.net]}">
          <i class="${netIcons[s.net]}"></i>
        </div>
        <div class="msi-info">
          <div class="msi-prod">${s.prodEm} ${s.prodName}</div>
          <div class="msi-date">${d.toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}${s.note ? ` · ${s.note}` : ''}</div>
        </div>
        <div class="msi-status">${past ? '<span class="msi-done">✅</span>' : '<span class="msi-pending">⏳</span>'}</div>
        <button class="msi-del" onclick="mktDeleteSched(${s.id})" title="Supprimer"><i class="fas fa-times"></i></button>
      </div>`;
    }).join('');
  }

  window.mktDeleteSched = function(id) {
    let scheduled = JSON.parse(localStorage.getItem('GM_MKT_SCHED') || '[]');
    scheduled = scheduled.filter(s => s.id !== id);
    localStorage.setItem('GM_MKT_SCHED', JSON.stringify(scheduled));
    renderScheduled();
    showToastAdm('🗑️ Post supprimé');
  };

  /* ── Historique ── */
  function renderHistory() {
    const el = document.getElementById('mktHistory');
    if (!el) return;
    const history = JSON.parse(localStorage.getItem('GM_MKT_HISTORY') || '[]');
    if (!history.length) { el.innerHTML = '<p class="mkt-empty">Aucun partage effectué pour l\'instant</p>'; return; }
    const netIcons  = { facebook:'fab fa-facebook-f', instagram:'fab fa-instagram', whatsapp:'fab fa-whatsapp', telegram:'fab fa-telegram' };
    const netColors = { facebook:'#1877f2', instagram:'#e1306c', whatsapp:'#25d366', telegram:'#0088cc' };
    const netLabels = { facebook:'Facebook', instagram:'Instagram', whatsapp:'WhatsApp', telegram:'Telegram' };
    el.innerHTML = history.map(h => `
      <div class="mkt-hist-item">
        <div class="mhi-net" style="background:${netColors[h.net]}20;color:${netColors[h.net]}">
          <i class="${netIcons[h.net]}"></i>
        </div>
        <div class="mhi-info">
          <strong>${h.prodName}</strong>
          <span>Partagé sur ${netLabels[h.net]} · ton ${h.tone}</span>
        </div>
        <div class="mhi-date">${h.date} à ${h.time}</div>
      </div>`).join('');
  }

  /* ── INIT ── */
  function init() {
    populateSelect();
    updateStatsUI();
    renderScheduled();
    renderHistory();
    mktDrawCanvas();
    // Vérifier les posts programmés à publier
    setInterval(() => {
      const scheduled = JSON.parse(localStorage.getItem('GM_MKT_SCHED') || '[]');
      const now = new Date();
      scheduled.forEach(s => {
        if (new Date(s.date) <= now && !s.notified) {
          s.notified = true;
          showToastAdm(`📣 Post ${s.prodName} à publier sur ${s.net} maintenant !`);
        }
      });
      localStorage.setItem('GM_MKT_SCHED', JSON.stringify(scheduled));
      renderScheduled();
    }, 60000);
  }

  return { init };

})();

// Auto-init quand l'onglet marketing est ouvert
document.addEventListener('DOMContentLoaded', () => {
  // Hooker sur le clic de l'onglet marketing
  const mktLink = document.querySelector('[data-tab="marketing"]');
  if (mktLink) {
    mktLink.addEventListener('click', () => {
      setTimeout(MKT.init, 100);
    });
  }
});
