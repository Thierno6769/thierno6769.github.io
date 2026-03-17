/**
 * GALY MARKET — footer.js
 * Footer global + boutons flottants (WhatsApp + Vendeur avec login)
 */
document.addEventListener('DOMContentLoaded', () => {

  const FOOTER_HTML = `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-col">
        <div class="footer-logo">GALY<span style="color:#f68b1e">MARKET</span></div>
        <p class="footer-tagline">La boutique en ligne de référence en Guinée. Produits authentiques, livraison rapide.</p>
        <div class="footer-socials">
          <a href="https://www.facebook.com/share/1Aj2FUMmU1/" target="_blank"><i class="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/galy_market224" target="_blank"><i class="fab fa-instagram"></i></a>
          <a href="https://www.tiktok.com/@idrissa224sow" target="_blank"><i class="fab fa-tiktok"></i></a>
          <a href="https://t.me/galymarket" target="_blank"><i class="fab fa-telegram"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Boutique</h4>
        <ul>
          <li><a href="catalogue.html">Catalogue</a></li>
          <li><a href="catalogue.html?promo=1">Flash Sale</a></li>
          <li><a href="catalogue.html?cat=phones">Téléphones</a></li>
          <li><a href="catalogue.html?cat=mode">Mode</a></li>
          <li><a href="catalogue.html?cat=beaute">Beauté</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Mon compte</h4>
        <ul>
          <li><a href="account.html">Connexion</a></li>
          <li><a href="account.html?form=register">Créer un compte</a></li>
          <li><a href="panier.html">Mon panier</a></li>
          <li><a href="account.html#ptab-orders">Mes commandes</a></li>
          <li><a href="wishlist.html">Mes favoris</a></li>
          <li><a href="partenariat.html">Programme d'affiliation</a></li>
        </ul>
        <h4 style="margin-top:20px">Aide</h4>
        <ul>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="contact.html#faq">FAQ</a></li>
          <li><a href="#">Livraison</a></li>
          <li><a href="#">Retours</a></li>
          <li><a href="#">CGU</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Newsletter</h4>
        <p style="font-size:13px;color:rgba(255,255,255,.45);margin-bottom:14px;line-height:1.6;user-select:none">Recevez nos offres exclusives et nouveautés.</p>
        <div class="footer-newsletter">
          <input type="tel" id="gm-footer-nl-tel" placeholder="626 72 25 57" style="user-select:text;-webkit-user-select:text" />
          <button id="gm-footer-nl-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
        <p class="footer-nl-msg" id="gm-footer-nl-msg"></p>
      </div>
    </div>
    <div class="footer-bottom">
      <span id="gmFooterLogo" onclick="gmAdminClick()" style="cursor:pointer;user-select:none">© 2026 Galy Market · Conakry, Guinée · Tous droits réservés</span>
      <span style="user-select:none">Fait avec ❤️ à Conakry</span>
    </div>
  </footer>`;

  /* ── Modal login vendeur ── */
  const VENDEUR_MODAL = `
  <div id="gmVendeurModal" style="
    display:none; position:fixed; inset:0; z-index:99999;
    background:rgba(0,0,0,.75); backdrop-filter:blur(8px);
    align-items:center; justify-content:center; padding:20px;
  " onclick="gmFermerModalVendeur(event)">
    <div style="
      background:#111827; border:1.5px solid rgba(246,139,30,.25);
      border-radius:24px; padding:36px; width:100%; max-width:400px;
      box-shadow:0 32px 80px rgba(0,0,0,.6);
      position:relative; animation:gmModalIn .3s ease;
    " onclick="event.stopPropagation()">

      <!-- Fermer -->
      <button onclick="gmFermerModalVendeur()" style="
        position:absolute; top:16px; right:16px;
        background:rgba(255,255,255,.08); border:none; border-radius:50%;
        width:32px; height:32px; color:#fff; cursor:pointer; font-size:16px;
        display:flex; align-items:center; justify-content:center;
      "><i class="fas fa-times"></i></button>

      <!-- Logo -->
      <div style="text-align:center; margin-bottom:28px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:42px;letter-spacing:3px;background:linear-gradient(135deg,#fff,#f68b1e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1">GALY<span>MARKET</span></div>
        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#f68b1e;margin-top:4px">Espace Vendeur</div>
      </div>

      <!-- Tabs -->
      <div style="display:flex;gap:8px;margin-bottom:24px;background:rgba(255,255,255,.05);border-radius:12px;padding:4px;">
        <button id="gmTabConnexion" onclick="gmSwitchTab('connexion')" style="
          flex:1;padding:10px;border:none;border-radius:9px;font-size:13px;font-weight:700;
          cursor:pointer;transition:all .2s;background:#f68b1e;color:#fff;
        ">Connexion</button>
        <button id="gmTabInscription" onclick="gmSwitchTab('inscription')" style="
          flex:1;padding:10px;border:none;border-radius:9px;font-size:13px;font-weight:700;
          cursor:pointer;transition:all .2s;background:transparent;color:rgba(255,255,255,.5);
        ">S'inscrire</button>
      </div>

      <!-- Formulaire Connexion -->
      <div id="gmFormConnexion">
        <div style="margin-bottom:14px;">
          <label style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:7px">Téléphone</label>
          <div style="position:relative;">
            <i class="fas fa-phone" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#f68b1e;font-size:13px"></i>
            <input id="gmLoginTel" type="tel" placeholder="626 72 25 57" style="
              width:100%;background:rgba(246,139,30,.06);border:1.5px solid rgba(246,139,30,.15);
              border-radius:11px;padding:13px 13px 13px 40px;font-size:14px;color:#fff;
              font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;
            " onfocus="this.style.borderColor='#f68b1e'" onblur="this.style.borderColor='rgba(246,139,30,.15)'"/>
          </div>
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:7px">Mot de passe</label>
          <div style="position:relative;">
            <i class="fas fa-lock" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#f68b1e;font-size:13px"></i>
            <input id="gmLoginPass" type="password" placeholder="••••••••" style="
              width:100%;background:rgba(246,139,30,.06);border:1.5px solid rgba(246,139,30,.15);
              border-radius:11px;padding:13px 40px 13px 40px;font-size:14px;color:#fff;
              font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;
            " onfocus="this.style.borderColor='#f68b1e'" onblur="this.style.borderColor='rgba(246,139,30,.15)'"
            onkeydown="if(event.key==='Enter')gmConnexionVendeur()"/>
            <button onclick="gmTogglePass('gmLoginPass')" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:14px"><i class="fas fa-eye" id="gmLoginPassIcon"></i></button>
          </div>
        </div>
        <div id="gmLoginErr" style="color:#ef4444;font-size:12px;margin-bottom:12px;display:none;text-align:center"></div>
        <button onclick="gmConnexionVendeur()" style="
          width:100%;background:linear-gradient(135deg,#f68b1e,#d4780f);
          color:#fff;border:none;border-radius:12px;padding:15px;
          font-size:15px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;
          transition:opacity .2s;
        " onmouseover="this.style.opacity='.9'" onmouseout="this.style.opacity='1'">
          <i class="fas fa-sign-in-alt"></i> Se connecter
        </button>
      </div>

      <!-- Formulaire Inscription -->
      <div id="gmFormInscription" style="display:none;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
          <div>
            <label style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:7px">Prénom</label>
            <input id="gmRegPrenom" type="text" placeholder="Mamadou" style="
              width:100%;background:rgba(246,139,30,.06);border:1.5px solid rgba(246,139,30,.15);
              border-radius:11px;padding:13px;font-size:14px;color:#fff;
              font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;
            " onfocus="this.style.borderColor='#f68b1e'" onblur="this.style.borderColor='rgba(246,139,30,.15)'"/>
          </div>
          <div>
            <label style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:7px">Nom</label>
            <input id="gmRegNom" type="text" placeholder="Diallo" style="
              width:100%;background:rgba(246,139,30,.06);border:1.5px solid rgba(246,139,30,.15);
              border-radius:11px;padding:13px;font-size:14px;color:#fff;
              font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;
            " onfocus="this.style.borderColor='#f68b1e'" onblur="this.style.borderColor='rgba(246,139,30,.15)'"/>
          </div>
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:7px">Téléphone</label>
          <div style="position:relative;">
            <i class="fas fa-phone" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#f68b1e;font-size:13px"></i>
            <input id="gmRegTel" type="tel" placeholder="626 72 25 57" style="
              width:100%;background:rgba(246,139,30,.06);border:1.5px solid rgba(246,139,30,.15);
              border-radius:11px;padding:13px 13px 13px 40px;font-size:14px;color:#fff;
              font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;
            " onfocus="this.style.borderColor='#f68b1e'" onblur="this.style.borderColor='rgba(246,139,30,.15)'"/>
          </div>
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:11px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:7px">Mot de passe</label>
          <div style="position:relative;">
            <i class="fas fa-lock" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#f68b1e;font-size:13px"></i>
            <input id="gmRegPass" type="password" placeholder="Minimum 6 caractères" style="
              width:100%;background:rgba(246,139,30,.06);border:1.5px solid rgba(246,139,30,.15);
              border-radius:11px;padding:13px 40px 13px 40px;font-size:14px;color:#fff;
              font-family:'DM Sans',sans-serif;outline:none;box-sizing:border-box;
            " onfocus="this.style.borderColor='#f68b1e'" onblur="this.style.borderColor='rgba(246,139,30,.15)'"/>
            <button onclick="gmTogglePass('gmRegPass')" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:14px"><i class="fas fa-eye" id="gmRegPassIcon"></i></button>
          </div>
        </div>
        <div id="gmRegErr" style="color:#ef4444;font-size:12px;margin-bottom:12px;display:none;text-align:center"></div>
        <button onclick="gmInscriptionVendeur()" style="
          width:100%;background:linear-gradient(135deg,#f68b1e,#d4780f);
          color:#fff;border:none;border-radius:12px;padding:15px;
          font-size:15px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;
          transition:opacity .2s;
        " onmouseover="this.style.opacity='.9'" onmouseout="this.style.opacity='1'">
          <i class="fas fa-user-plus"></i> Créer mon compte vendeur
        </button>
      </div>

    </div>
  </div>
  <style>
    @keyframes gmModalIn { from { opacity:0; transform:scale(.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
  </style>`;

  /* ── Boutons flottants ── */
  const FLOAT_WRAP = `
  <div class="float-btns-wrap" id="floatBtnsWrap">
    <div id="gmVendeurFloat" class="gm-vendeur-float"
      onclick="gmOuvrirModalVendeur()"
      ontouchstart="event.preventDefault();gmOuvrirModalVendeur()"
      style="cursor:pointer;-webkit-tap-highlight-color:transparent">
      <i class="fas fa-store" style="color:#fff;font-size:18px;z-index:1;position:relative"></i>
      <span style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:800;color:#fff;letter-spacing:.5px;text-transform:uppercase;z-index:1;position:relative">Vendeur</span>
      <span class="gm-vf-pulse"></span>
    </div>
    <a href="#" id="gmWaFloat" onclick="ouvrirWA(event)" class="wa-float" title="WhatsApp" aria-label="WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
      <span class="wa-float-pulse"></span>
    </a>
  </div>`;

  /* ── Injecter footer ── */
  function injectFooter() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      document.head.appendChild(fa);
    }
    if (document.querySelector('.site-footer')) return;
    if (document.querySelector('.admin-layout')) return;
    document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
  }

  /* ── Injecter boutons + modal ── */
  function injectFloatBtns() {
    if (document.querySelector('.float-btns-wrap')) return;
    if (document.querySelector('.admin-layout')) return;
    document.body.insertAdjacentHTML('beforeend', FLOAT_WRAP);
    document.body.insertAdjacentHTML('beforeend', VENDEUR_MODAL);
  }

  /* ── Newsletter ── */
  function initNewsletter() {
    const btn = document.getElementById('gm-footer-nl-btn');
    const inp = document.getElementById('gm-footer-nl-tel');
    const msg = document.getElementById('gm-footer-nl-msg');
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
      const tel = inp.value.trim();
      if (!tel || tel.length < 8) { if (msg) { msg.textContent = '⚠️ Numéro invalide'; msg.style.color = '#e74c3c'; } return; }
      const list = JSON.parse(localStorage.getItem('GM_NEWSLETTER') || '[]');
      if (!list.includes(tel)) { list.push(tel); localStorage.setItem('GM_NEWSLETTER', JSON.stringify(list)); }
      inp.value = '';
      if (msg) { msg.textContent = '✅ Abonné avec succès !'; msg.style.color = '#2ecc71'; }
      setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
    });
  }

  /* ── INIT ── */
  injectFooter();
  injectFloatBtns();
  setTimeout(initNewsletter, 100);
});

/* ════════════════════════════════════
   FONCTIONS GLOBALES VENDEUR
════════════════════════════════════ */

window.ouvrirWA = function(e) {
  e.preventDefault();
  const s = JSON.parse(localStorage.getItem('GM_SETTINGS') || '{}');
  const tel = (s.shopWa || '224627900578').replace(/[^0-9]/g, '');
  window.open('https://wa.me/' + tel, '_blank');
};

window.gmOuvrirModalVendeur = function() {
  // Si déjà connecté → aller au dashboard
  const session = JSON.parse(localStorage.getItem('GM_DV_SESSION') || '{}');
  if (session.id) { window.location.href = 'dashboard-vendeur.html'; return; }
  const modal = document.getElementById('gmVendeurModal');
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
};

window.gmFermerModalVendeur = function(e) {
  if (e && e.target !== document.getElementById('gmVendeurModal')) return;
  const modal = document.getElementById('gmVendeurModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
};

window.gmSwitchTab = function(tab) {
  const isConnexion = tab === 'connexion';
  document.getElementById('gmFormConnexion').style.display  = isConnexion ? 'block' : 'none';
  document.getElementById('gmFormInscription').style.display = isConnexion ? 'none' : 'block';
  document.getElementById('gmTabConnexion').style.background   = isConnexion ? '#f68b1e' : 'transparent';
  document.getElementById('gmTabConnexion').style.color        = isConnexion ? '#fff' : 'rgba(255,255,255,.5)';
  document.getElementById('gmTabInscription').style.background = isConnexion ? 'transparent' : '#f68b1e';
  document.getElementById('gmTabInscription').style.color      = isConnexion ? 'rgba(255,255,255,.5)' : '#fff';
};

window.gmTogglePass = function(inputId) {
  const inp = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'Icon');
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; if (icon) icon.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; if (icon) icon.className = 'fas fa-eye'; }
};

window.gmConnexionVendeur = function() {
  const tel  = (document.getElementById('gmLoginTel')?.value || '').trim().replace(/[^0-9]/g, '');
  const pass = (document.getElementById('gmLoginPass')?.value || '').trim();
  const err  = document.getElementById('gmLoginErr');

  if (!tel || tel.length < 8) { err.textContent = '⚠️ Entrez un numéro valide.'; err.style.display = 'block'; return; }
  if (!pass) { err.textContent = '⚠️ Entrez votre mot de passe.'; err.style.display = 'block'; return; }

  const vends = JSON.parse(localStorage.getItem('GM_VENDEURS') || '[]');
  const vend  = vends.find(v => (v.tel || '').replace(/[^0-9]/g, '') === tel);

  if (!vend) { err.textContent = '❌ Aucun compte trouvé avec ce numéro.'; err.style.display = 'block'; return; }
  if (vend.password && vend.password !== pass) { err.textContent = '❌ Mot de passe incorrect.'; err.style.display = 'block'; return; }

  // Connexion réussie
  localStorage.setItem('GM_DV_SESSION', JSON.stringify({ id: vend.id, tel, nom: vend.nom, prenom: vend.prenom || '' }));
  document.getElementById('gmVendeurModal').style.display = 'none';
  document.body.style.overflow = '';
  window.location.href = 'dashboard-vendeur.html';
};

window.gmInscriptionVendeur = function() {
  const prenom = (document.getElementById('gmRegPrenom')?.value || '').trim();
  const nom    = (document.getElementById('gmRegNom')?.value || '').trim();
  const tel    = (document.getElementById('gmRegTel')?.value || '').trim().replace(/[^0-9]/g, '');
  const pass   = (document.getElementById('gmRegPass')?.value || '').trim();
  const err    = document.getElementById('gmRegErr');

  if (!prenom) { err.textContent = '⚠️ Entrez votre prénom.'; err.style.display = 'block'; return; }
  if (!nom)    { err.textContent = '⚠️ Entrez votre nom.'; err.style.display = 'block'; return; }
  if (!tel || tel.length < 8) { err.textContent = '⚠️ Entrez un numéro valide.'; err.style.display = 'block'; return; }
  if (!pass || pass.length < 6) { err.textContent = '⚠️ Mot de passe minimum 6 caractères.'; err.style.display = 'block'; return; }

  const vends = JSON.parse(localStorage.getItem('GM_VENDEURS') || '[]');
  const exist = vends.find(v => (v.tel || '').replace(/[^0-9]/g, '') === tel);
  if (exist) { err.textContent = '❌ Ce numéro est déjà enregistré. Connectez-vous.'; err.style.display = 'block'; return; }

  const newVend = {
    id: 'v' + Date.now(), prenom, nom, tel, wa: tel,
    password: pass, ville: '', membre: new Date().toISOString().slice(0, 7),
    premium: false, verifie: false, ventes: 0, note: null, avatar: '👤'
  };
  vends.push(newVend);
  localStorage.setItem('GM_VENDEURS', JSON.stringify(vends));
  localStorage.setItem('GM_DV_SESSION', JSON.stringify({ id: newVend.id, tel, nom: prenom + ' ' + nom, prenom }));

  document.getElementById('gmVendeurModal').style.display = 'none';
  document.body.style.overflow = '';
  // Après inscription → choisir un forfait
  window.location.href = 'abonnements.html';
};

/* ── Accès admin secret — 3 clics sur logo footer ── */
(function() {
  let clickCount = 0, clickTimer = null;
  window.gmAdminClick = function() {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
    if (clickCount >= 3) { clickCount = 0; clearTimeout(clickTimer); window.location.href = 'admin.html'; }
  };
})();
