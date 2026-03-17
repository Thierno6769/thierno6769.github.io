/* ═══════════════════════════════════════════
   GALY MARKET — contact.js
   Étape 7 : Page Contact
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const $ = id => document.getElementById(id);

  /* ── BADGES ── */
  const cart     = JSON.parse(localStorage.getItem('GM_CART')     || '[]');
  const wishlist = JSON.parse(localStorage.getItem('GM_WISHLIST') || '[]');
  const qty = cart.reduce((a, i) => a + i.qty, 0);
  if ($('cartBadge')) $('cartBadge').textContent = qty > 0 ? qty : '';
  if ($('wishBadge')) $('wishBadge').textContent = wishlist.length > 0 ? wishlist.length : '';

  /* ── SUJET RAPIDE ── */
  document.querySelectorAll('.sp-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.sp-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const sub = $('cfSubject');
      if (sub) sub.value = pill.dataset.val;
    });
  });

  /* ── COMPTEUR CARACTÈRES ── */
  $('cfMessage')?.addEventListener('input', e => {
    const n = e.target.value.length;
    const el = $('charCount'); if (!el) return;
    el.textContent = n;
    el.style.color = n > 450 ? 'var(--red)' : n > 350 ? '#f59e0b' : 'var(--muted)';
    if (n > 500) e.target.value = e.target.value.slice(0, 500);
  });

  /* ── ENVOI FORMULAIRE ── */
  $('btnSendMsg')?.addEventListener('click', sendMessage);
  $('btnSendWa')?.addEventListener('click',  sendViaWa);

  function validate() {
    const prenom  = $('cfPrenom')?.value.trim();
    const nom     = $('cfNom')?.value.trim();
    const tel     = $('cfTel')?.value.trim();
    const subject = $('cfSubject')?.value.trim();
    const message = $('cfMessage')?.value.trim();
    const err     = $('cfError');

    document.querySelectorAll('.cf-input').forEach(el => el.classList.remove('error'));
    if (err) err.textContent = '';

    const checks = [
      [!prenom,                'cfPrenom',  'Le prénom est requis.'],
      [!nom,                   'cfNom',     'Le nom est requis.'],
      [!tel || tel.length < 8, 'cfTel',     'Entrez un numéro valide.'],
      [!subject,               'cfSubject', 'Le sujet est requis.'],
      [!message || message.length < 10, 'cfMessage', 'Le message est trop court (min 10 caractères).'],
    ];
    for (const [cond, id, msg] of checks) {
      if (cond) {
        $(id)?.classList.add('error');
        if (err) err.textContent = '⚠️ ' + msg;
        $(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return null;
      }
    }
    return { prenom, nom, tel, subject, message,
      email: $('cfEmail')?.value.trim(),
      ref:   $('cfRef')?.value.trim(),
    };
  }

  function sendMessage() {
    const data = validate(); if (!data) return;

    // Sauvegarder en localStorage
    const msgs = JSON.parse(localStorage.getItem('GM_CONTACT_MSGS') || '[]');
    msgs.unshift({ ...data, date: new Date().toISOString(), id: 'MSG-' + Date.now() });
    localStorage.setItem('GM_CONTACT_MSGS', JSON.stringify(msgs));

    // Afficher succès
    document.querySelector('.cf-grid')?.style && (document.querySelector('.cf-grid').style.display = 'none');
    document.querySelector('.subject-pills')?.style && (document.querySelector('.subject-pills').style.display = 'none');
    document.querySelector('.cf-actions')?.style && (document.querySelector('.cf-actions').style.display = 'none');
    document.querySelector('.cfc-hdr')?.style && (document.querySelector('.cfc-hdr').style.display = 'none');
    const err = $('cfError'); if (err) err.style.display = 'none';

    if ($('cfsName')) $('cfsName').textContent = `${data.prenom} ${data.nom}`;
    if ($('cfsTel'))  $('cfsTel').textContent  = '+224 ' + data.tel;
    $('cfSuccess').style.display = 'block';

    showToast('✅ Message envoyé avec succès !');
  }

  function sendViaWa() {
    const data = validate(); if (!data) return;
    const msg = `*Nouveau message — Galy Market*\n\n*Nom :* ${data.prenom} ${data.nom}\n*Tél :* +224${data.tel}\n*Sujet :* ${data.subject}${data.ref ? '\n*Commande :* ' + data.ref : ''}\n\n*Message :*\n${data.message}`;
    const s = JSON.parse(localStorage.getItem('GM_SETTINGS') || '{}');
    const waNum = (s.shopWa || '224627900578').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  window.resetForm = function() {
    document.querySelector('.cf-grid')?.style && (document.querySelector('.cf-grid').style.display = '');
    document.querySelector('.subject-pills')?.style && (document.querySelector('.subject-pills').style.display = '');
    document.querySelector('.cf-actions')?.style && (document.querySelector('.cf-actions').style.display = '');
    document.querySelector('.cfc-hdr')?.style && (document.querySelector('.cfc-hdr').style.display = '');
    const err = $('cfError'); if (err) err.style.display = '';
    $('cfSuccess').style.display = 'none';
    document.querySelectorAll('.cf-input').forEach(el => { el.value = ''; el.classList.remove('error'); });
    if ($('charCount')) $('charCount').textContent = '0';
  };

  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ── NEWSLETTER ── */
  $('nlBtn')?.addEventListener('click', () => {
    const tel = $('nlTel')?.value.trim();
    const msg = $('nlMsg');
    if (!tel || tel.length < 8) {
      if (msg) { msg.textContent = '⚠️ Numéro invalide'; msg.style.color = 'var(--red)'; }
      return;
    }
    const subs = JSON.parse(localStorage.getItem('GM_NEWSLETTER') || '[]');
    if (!subs.includes(tel)) { subs.push(tel); localStorage.setItem('GM_NEWSLETTER', JSON.stringify(subs)); }
    if (msg) { msg.textContent = '✅ Inscription confirmée !'; msg.style.color = 'var(--green)'; }
    if ($('nlTel')) $('nlTel').value = '';
    setTimeout(() => { if (msg) msg.textContent = ''; }, 4000);
  });

  /* ── HEADER SCROLL & BURGER ── */
  window.addEventListener('scroll', () => {
    $('header')?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
  const burger = $('burger'), mMenu = $('mobileMenu'), mOv = $('mobileOverlay'), mClose = $('mobileClose');
  burger?.addEventListener('click', () => { burger.classList.add('open'); mMenu?.classList.add('open'); mOv?.classList.add('open'); });
  [mClose, mOv].forEach(el => el?.addEventListener('click', () => { burger?.classList.remove('open'); mMenu?.classList.remove('open'); mOv?.classList.remove('open'); }));

  /* ── TOAST ── */
  function showToast(msg) {
    const t = $('toast'), m = $('toastMsg'); if (!t || !m) return;
    m.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── URL #faq → ouvrir FAQ ── */
  if (window.location.hash === '#faq') {
    document.querySelector('.faq-list')?.scrollIntoView({ behavior: 'smooth' });
    document.querySelector('.faq-item')?.classList.add('open');
  }

  /* ── Pré-remplir depuis URL param ?ref= ── */
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref && $('cfRef')) $('cfRef').value = ref;
});

/* ── FAQ TOGGLE (appelé depuis le HTML) ── */
function toggleFaqContact(btn) {
  const item    = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}
