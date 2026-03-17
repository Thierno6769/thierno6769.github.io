/* ═══════════════════════════════════════════
   GALY MARKET — account.js
   Étape 6 : Login / Inscription / Profil
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const $   = id => document.getElementById(id);
  const fmt = n  => n.toLocaleString('fr-FR') + ' GNF';

  /* ══════════════════════
     STORAGE KEYS
  ══════════════════════ */
  const USERS_KEY   = 'GM_USERS';
  const SESSION_KEY = 'GM_SESSION';

  function getUsers()     { return JSON.parse(localStorage.getItem(USERS_KEY)   || '[]'); }
  function saveUsers(u)   { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function getSession()   { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  function setSession(u)  { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  /* ══════════════════════
     INIT
  ══════════════════════ */
  updateBadges();
  const session = getSession();
  if (session) {
    showProfile(session);
  } else {
    $('authPage').style.display  = 'flex';
    $('profilePage').style.display = 'none';
    if ($('bcLabel')) $('bcLabel').textContent = 'Connexion';
  }

  /* ══════════════════════
     NAVIGATION FORMULAIRES
  ══════════════════════ */
  window.showForm = function(name) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    $(`form${name.charAt(0).toUpperCase() + name.slice(1)}`)?.classList.add('active');
    const labels = { login: 'Connexion', register: 'Inscription', forgot: 'Mot de passe oublié' };
    if ($('bcLabel')) $('bcLabel').textContent = labels[name] || name;
  };

  /* ══════════════════════
     TOGGLE MOT DE PASSE
  ══════════════════════ */
  document.querySelectorAll('.af-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = $(btn.dataset.target); if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  });

  /* ══════════════════════
     FORCE MOT DE PASSE
  ══════════════════════ */
  $('regPw')?.addEventListener('input', e => {
    const pw   = e.target.value;
    const fill = $('pwsFill'), label = $('pwsLabel');
    if (!fill || !label) return;
    let score = 0;
    if (pw.length >= 6)                score++;
    if (pw.length >= 10)               score++;
    if (/[A-Z]/.test(pw))             score++;
    if (/[0-9]/.test(pw))             score++;
    if (/[^A-Za-z0-9]/.test(pw))     score++;
    const configs = [
      { w:'0%',   c:'transparent', t:'' },
      { w:'25%',  c:'var(--red)',  t:'Faible' },
      { w:'50%',  c:'#f59e0b',    t:'Moyen' },
      { w:'75%',  c:'#3498db',    t:'Bon' },
      { w:'100%', c:'var(--green)',t:'Excellent' },
    ];
    const cfg = configs[Math.min(score, 4)];
    fill.style.width  = cfg.w;
    fill.style.background = cfg.c;
    label.textContent = cfg.t;
    label.style.color = cfg.c;
  });

  /* ══════════════════════
     OTP AUTO-FOCUS
  ══════════════════════ */
  document.querySelectorAll('.otp-input').forEach((inp, i, arr) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(-1);
      if (inp.value && arr[i+1]) arr[i+1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && arr[i-1]) arr[i-1].focus();
    });
  });

  /* ══════════════════════
     LOGIN
  ══════════════════════ */
  $('btnLogin')?.addEventListener('click', doLogin);
  $('loginTel')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('loginPw')?.addEventListener('keydown',  e => { if (e.key === 'Enter') doLogin(); });

  function doLogin() {
    const tel = $('loginTel')?.value.trim();
    const pw  = $('loginPw')?.value.trim();
    const err = $('loginError');

    [$('loginTel'), $('loginPw')].forEach(el => el?.classList.remove('error'));
    if (err) err.textContent = '';

    if (!tel) { $('loginTel')?.classList.add('error'); if(err) err.textContent = 'Entrez votre numéro.'; return; }
    if (!pw)  { $('loginPw')?.classList.add('error');  if(err) err.textContent = 'Entrez votre mot de passe.'; return; }

    const users = getUsers();
    const user  = users.find(u => u.tel === tel && u.pw === btoa(pw));

    if (!user) {
      [$('loginTel'), $('loginPw')].forEach(el => el?.classList.add('error'));
      if (err) err.textContent = '❌ Numéro ou mot de passe incorrect.';
      return;
    }

    if ($('rememberMe')?.checked) {
      setSession({ ...user, pw: undefined });
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, pw: undefined }));
    }
    setSession({ ...user, pw: undefined });
    showToast(`👋 Bienvenue ${user.prenom} !`);
    setTimeout(() => showProfile({ ...user, pw: undefined }), 600);
  }

  /* ══════════════════════
     INSCRIPTION
  ══════════════════════ */
  $('btnRegister')?.addEventListener('click', doRegister);

  function doRegister() {
    const prenom  = $('regPrenom')?.value.trim();
    const nom     = $('regNom')?.value.trim();
    const tel     = $('regTel')?.value.trim();
    const email   = $('regEmail')?.value.trim();
    const ville   = $('regVille')?.value.trim();
    const pw      = $('regPw')?.value.trim();
    const pwc     = $('regPwConfirm')?.value.trim();
    const cgu     = $('regCgu')?.checked;
    const err     = $('regError');

    document.querySelectorAll('#formRegister .af-input').forEach(el => el.classList.remove('error'));
    if (err) err.textContent = '';

    const checks = [
      [!prenom,  'regPrenom',    'Le prénom est requis.'],
      [!nom,     'regNom',       'Le nom est requis.'],
      [!tel || tel.length < 8, 'regTel', 'Entrez un numéro valide (min 8 chiffres).'],
      [!pw || pw.length < 6,   'regPw',  'Mot de passe trop court (min 6 caractères).'],
      [pw !== pwc, 'regPwConfirm', 'Les mots de passe ne correspondent pas.'],
    ];
    for (const [cond, id, msg] of checks) {
      if (cond) { $(id)?.classList.add('error'); if(err) err.textContent = '❌ '+msg; return; }
    }
    if (!cgu) { if(err) err.textContent = '❌ Acceptez les CGU pour continuer.'; return; }

    const users = getUsers();
    if (users.find(u => u.tel === tel)) {
      $('regTel')?.classList.add('error');
      if (err) err.textContent = '❌ Ce numéro est déjà enregistré.';
      return;
    }

    const newUser = {
      id: Date.now(), prenom, nom, tel, email, ville,
      adresse: '', pw: btoa(pw),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser); saveUsers(users);
    setSession({ ...newUser, pw: undefined });
    showToast(`🎉 Compte créé ! Bienvenue ${prenom} !`);
    setTimeout(() => showProfile({ ...newUser, pw: undefined }), 600);
  }

  /* ══════════════════════
     MOT DE PASSE OUBLIÉ
  ══════════════════════ */
  let otpCode = '';
  let resendInterval = null;

  $('btnForgot')?.addEventListener('click', () => {
    const tel = $('forgotTel')?.value.trim();
    const err = $('forgotError');
    if (err) err.textContent = '';
    if (!tel) { $('forgotTel')?.classList.add('error'); if(err) err.textContent = '❌ Entrez votre numéro.'; return; }
    const users = getUsers();
    if (!users.find(u => u.tel === tel)) {
      if (err) err.textContent = '❌ Numéro non trouvé.';
      return;
    }
    // Simuler l'envoi d'un code OTP
    otpCode = String(Math.floor(1000 + Math.random() * 9000));
    console.info(`[GALY MARKET] Code OTP simulé : ${otpCode}`); // Dev only
    if ($('otpTelDisplay')) $('otpTelDisplay').textContent = '+224 ' + tel;
    $('otpStep').style.display = 'block';
    $('btnForgot').style.display = 'none';
    showToast(`📱 Code envoyé (démo : ${otpCode})`);
    startResendTimer();
  });

  $('btnVerifyOtp')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.otp-input');
    const entered = [...inputs].map(i => i.value).join('');
    if (entered.length < 4) { showToast('⚠️ Entrez les 4 chiffres du code'); return; }
    if (entered === otpCode) {
      const newPw = prompt('Code validé ! Entrez votre nouveau mot de passe :');
      if (!newPw || newPw.length < 6) { showToast('⚠️ Mot de passe trop court'); return; }
      const tel   = $('forgotTel')?.value.trim();
      const users = getUsers();
      const idx   = users.findIndex(u => u.tel === tel);
      if (idx >= 0) { users[idx].pw = btoa(newPw); saveUsers(users); }
      showToast('✅ Mot de passe mis à jour !');
      clearInterval(resendInterval);
      setTimeout(() => showForm('login'), 1500);
    } else {
      showToast('❌ Code incorrect, réessayez');
      inputs.forEach(i => i.value = '');
      inputs[0].focus();
    }
  });

  function startResendTimer() {
    let secs = 30;
    const timerEl = $('resendTimer');
    const resendBtn = $('btnResend');
    if (resendBtn) resendBtn.disabled = true;
    clearInterval(resendInterval);
    resendInterval = setInterval(() => {
      secs--;
      if (timerEl) timerEl.textContent = secs;
      if (secs <= 0) {
        clearInterval(resendInterval);
        if (resendBtn) { resendBtn.disabled = false; resendBtn.textContent = 'Renvoyer le code'; }
      }
    }, 1000);
  }

  /* ══════════════════════
     WHATSAPP LOGIN
  ══════════════════════ */
  window.loginWhatsApp = function() {
    const msg = 'Bonjour Galy Market, je souhaite me connecter à mon compte.';
    window.open(`https://wa.me/224620000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  /* ══════════════════════
     PROFIL
  ══════════════════════ */
  function showProfile(user) {
    $('authPage').style.display    = 'none';
    $('profilePage').style.display = 'block';
    if ($('bcLabel')) $('bcLabel').textContent = 'Mon Profil';

    // Hero
    if ($('phAvatar')) $('phAvatar').textContent = (user.prenom || 'U')[0].toUpperCase();
    if ($('phName'))   $('phName').textContent   = `${user.prenom} ${user.nom}`;
    if ($('phTel'))    $('phTel').innerHTML      = `<i class="fas fa-phone"></i> +224 ${user.tel}`;
    if ($('phVille'))  $('phVille').innerHTML    = user.ville ? `<i class="fas fa-map-pin"></i> ${user.ville}` : '';

    // Stats
    const orders   = getUserOrders(user.tel);
    const wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
    const totalSpent = orders.reduce((a, o) => a + (o.total || 0), 0);
    if ($('psOrders')) $('psOrders').textContent = orders.length;
    if ($('psWish'))   $('psWish').textContent   = wishlist.length;
    if ($('psTotal'))  $('psTotal').textContent  = fmt(totalSpent);

    // Pré-remplir infos
    if ($('pfPrenom'))  $('pfPrenom').value  = user.prenom || '';
    if ($('pfNom'))     $('pfNom').value     = user.nom    || '';
    if ($('pfTel'))     $('pfTel').value     = user.tel    || '';
    if ($('pfEmail'))   $('pfEmail').value   = user.email  || '';
    if ($('pfVille'))   $('pfVille').value   = user.ville  || '';
    if ($('pfAdresse')) $('pfAdresse').value = user.adresse|| '';

    renderMyOrders(user.tel);
    renderWishlistTab();
  }

  function getUserOrders(tel) {
    const all = JSON.parse(localStorage.getItem('GM_ORDERS') || '[]');
    return all.filter(o => o.client?.tel === '+224' + tel || o.client?.tel === tel);
  }

  /* ── MES COMMANDES ── */
  function renderMyOrders(tel) {
    const orders  = getUserOrders(tel);
    const cont    = $('myOrders');
    const empty   = $('ordersEmptyP');
    if (!cont) return;
    if (!orders.length) {
      cont.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    const STATUS = { nouvelle:'sp-nouvelle', confirmee:'sp-confirmee', 'en-cours':'sp-en-cours', livree:'sp-livree', annulee:'sp-annulee' };
    const STATUS_LABELS = { nouvelle:'Nouvelle', confirmee:'Confirmée', 'en-cours':'En cours', livree:'Livrée', annulee:'Annulée' };

    cont.innerHTML = orders.map(o => {
      const itemNames = (o.items || []).slice(0, 3).map(i => i.name).join(', ');
      const more = (o.items?.length || 0) > 3 ? ` +${o.items.length - 3}` : '';
      const status = o.status || 'nouvelle';
      const waMsg  = `Bonjour, je voudrais des informations sur ma commande ${o.ref}`;
      return `
        <div class="order-card">
          <div class="oc-header">
            <span class="oc-ref">${o.ref}</span>
            <span class="oc-date">${new Date(o.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>
            <span class="status-pill ${STATUS[status]||'sp-nouvelle'}">${STATUS_LABELS[status]||status}</span>
          </div>
          <div class="oc-body">
            <div class="oc-items">${itemNames}${more}</div>
          </div>
          <div class="oc-footer">
            <span class="oc-total">${fmt(o.total)}</span>
            <span class="oc-zone"><i class="fas fa-map-pin"></i> ${o.zone?.zone || '—'} · ${o.zone?.delay || ''}</span>
            <a href="https://wa.me/224620000000?text=${encodeURIComponent(waMsg)}" target="_blank" class="oc-wa-btn">
              <i class="fab fa-whatsapp"></i> Suivre
            </a>
          </div>
        </div>`;
    }).join('');
  }

  /* ── FAVORIS ── */
  function renderWishlistTab() {
    const wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
    const grid  = $('wishGrid');
    const empty = $('wishEmptyP');
    if (!grid) return;
    const prods = (typeof GM_PRODUCTS !== 'undefined') ? GM_PRODUCTS.filter(p => wishlist.includes(p.id)) : [];
    if (!prods.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    grid.innerHTML = prods.map(p => {
      const disc = p.old ? Math.round((1-p.price/p.old)*100) : 0;
      return `
        <div class="prod-card">
          <div class="card-img">
            ${p.img ? `<img src="${p.img}" alt="${p.name}">` : ''}
            <div class="card-emoji" ${p.img ? 'style="display:none"' : ''}>${p.em}</div>
            ${disc ? `<div class="card-disc">-${disc}%</div>` : ''}
            <div class="card-quick">
              <a href="produit.html?id=${p.id}" class="quick-cart"><i class="fas fa-eye"></i> Voir</a>
            </div>
          </div>
          <div class="card-body">
            <div class="card-name">${p.name}</div>
            <div class="card-prices">
              <span class="price-now">${fmt(p.price)}</span>
              ${p.old ? `<span class="price-old">${fmt(p.old)}</span>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── TABS PROFIL ── */
  document.querySelectorAll('.ptab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`ptab-${btn.dataset.ptab}`)?.classList.add('active');
    });
  });

  /* ── SAUVEGARDER INFOS ── */
  $('btnSaveInfos')?.addEventListener('click', () => {
    const session = getSession(); if (!session) return;
    const updated = {
      ...session,
      prenom:  $('pfPrenom')?.value.trim() || session.prenom,
      nom:     $('pfNom')?.value.trim()    || session.nom,
      email:   $('pfEmail')?.value.trim()  || session.email,
      ville:   $('pfVille')?.value.trim()  || session.ville,
      adresse: $('pfAdresse')?.value.trim()|| session.adresse,
    };
    // Mettre à jour dans la liste
    const users = getUsers();
    const idx = users.findIndex(u => u.tel === session.tel);
    if (idx >= 0) { users[idx] = { ...users[idx], ...updated }; saveUsers(users); }
    setSession(updated);
    // Refresh hero
    if ($('phName')) $('phName').textContent = `${updated.prenom} ${updated.nom}`;
    if ($('phVille') && updated.ville) $('phVille').innerHTML = `<i class="fas fa-map-pin"></i> ${updated.ville}`;
    if ($('phAvatar')) $('phAvatar').textContent = (updated.prenom || 'U')[0].toUpperCase();
    showToast('✅ Informations mises à jour');
  });

  /* ── CHANGER MDP ── */
  $('btnChangePw')?.addEventListener('click', () => {
    const session = getSession(); if (!session) return;
    const old     = $('secPwOld')?.value.trim();
    const neo     = $('secPwNew')?.value.trim();
    const conf    = $('secPwConfirm')?.value.trim();
    const err     = $('secError');
    if (err) err.textContent = '';

    const users = getUsers();
    const user  = users.find(u => u.tel === session.tel);
    if (!user || user.pw !== btoa(old)) {
      if (err) err.textContent = '❌ Mot de passe actuel incorrect.'; return;
    }
    if (!neo || neo.length < 6) {
      if (err) err.textContent = '❌ Nouveau mot de passe trop court.'; return;
    }
    if (neo !== conf) {
      if (err) err.textContent = '❌ Les mots de passe ne correspondent pas.'; return;
    }
    const idx = users.findIndex(u => u.tel === session.tel);
    users[idx].pw = btoa(neo); saveUsers(users);
    [$('secPwOld'),$('secPwNew'),$('secPwConfirm')].forEach(el => { if(el) el.value=''; });
    showToast('✅ Mot de passe mis à jour');
  });

  /* ── DÉCONNEXION ── */
  $('btnLogout')?.addEventListener('click', () => {
    clearSession();
    $('profilePage').style.display = 'none';
    $('authPage').style.display    = 'flex';
    showForm('login');
    showToast('👋 Déconnexion réussie');
  });

  /* ══════════════════════
     BADGES
  ══════════════════════ */
  function updateBadges() {
    const cart     = JSON.parse(localStorage.getItem('GM_CART')     || '[]');
    const wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
    const qty = cart.reduce((a,i) => a+i.qty, 0);
    if ($('cartBadge')) $('cartBadge').textContent = qty > 0 ? qty : '';
    if ($('wishBadge')) $('wishBadge').textContent = wishlist.length > 0 ? wishlist.length : '';
  }

  /* ══════════════════════
     TOAST
  ══════════════════════ */
  function showToast(msg) {
    const t = $('toast'), m = $('toastMsg'); if (!t||!m) return;
    m.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ══════════════════════
     HEADER SCROLL & BURGER
  ══════════════════════ */
  window.addEventListener('scroll', () => {
    $('header')?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  const burger = $('burger'), mMenu = $('mobileMenu'), mOv = $('mobileOverlay'), mClose = $('mobileClose');
  burger?.addEventListener('click', () => { burger.classList.add('open'); mMenu?.classList.add('open'); mOv?.classList.add('open'); });
  [mClose, mOv].forEach(el => el?.addEventListener('click', () => { burger?.classList.remove('open'); mMenu?.classList.remove('open'); mOv?.classList.remove('open'); }));

  // URL param ?form=register
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('form') === 'register' && !getSession()) showForm('register');
});
