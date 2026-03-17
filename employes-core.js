/**
 * GALY MARKET — CORE EMPLOYÉS
 * Base de données, rôles, notifications inter-employés
 * Stockage : localStorage GM_EMPLOYES, GM_NOTIFS, GM_COMMANDES_EMP, GM_STOCK_LOG
 */

// ═══════════════════════════════════════════════════════════
// CONSTANTES & RÔLES
// ═══════════════════════════════════════════════════════════
const ROLES = {
  GESTIONNAIRE_COMMANDES: {
    id: 'gestionnaire_commandes',
    label: 'Gestionnaire de Commandes',
    icon: 'fas fa-clipboard-list',
    color: '#3498db',
    app: 'app-commandes.html',
    permissions: ['voir_commandes','accepter_commande','envoyer_stock','envoyer_livreur']
  },
  GESTIONNAIRE_STOCK: {
    id: 'gestionnaire_stock',
    label: 'Gestionnaire de Stock',
    icon: 'fas fa-boxes-stacked',
    color: '#9b59b6',
    app: 'app-stock.html',
    permissions: ['voir_stock','verifier_disponibilite','confirmer_stock']
  },
  LIVREUR: {
    id: 'livreur',
    label: 'Livreur',
    icon: 'fas fa-motorcycle',
    color: '#e67e22',
    app: 'app-livreur.html',
    permissions: ['voir_livraisons','accepter_livraison','confirmer_livraison']
  }
};

const DOMAINES = [
  'Téléphones & Smartphones',
  'Informatique & Accessoires',
  'Mode Homme',
  'Mode Femme',
  'Électroménager',
  'Beauté & Cosmétiques',
  'Sport & Loisirs',
  'Maison & Décoration',
  'Tous les produits'
];

// ═══════════════════════════════════════════════════════════
// STOCKAGE
// ═══════════════════════════════════════════════════════════
const GM = {
  getEmployes: () => JSON.parse(localStorage.getItem('GM_EMPLOYES') || '[]'),
  saveEmployes: (d) => localStorage.setItem('GM_EMPLOYES', JSON.stringify(d)),

  getNotifs: () => JSON.parse(localStorage.getItem('GM_NOTIFS') || '[]'),
  saveNotifs: (d) => localStorage.setItem('GM_NOTIFS', JSON.stringify(d)),

  getCommandesEmp: () => JSON.parse(localStorage.getItem('GM_COMMANDES_EMP') || '[]'),
  saveCommandesEmp: (d) => localStorage.setItem('GM_COMMANDES_EMP', JSON.stringify(d)),

  getStockLog: () => JSON.parse(localStorage.getItem('GM_STOCK_LOG') || '[]'),
  saveStockLog: (d) => localStorage.setItem('GM_STOCK_LOG', JSON.stringify(d)),

  getLivraisonsLog: () => JSON.parse(localStorage.getItem('GM_LIVRAISONS_LOG') || '[]'),
  saveLivraisonsLog: (d) => localStorage.setItem('GM_LIVRAISONS_LOG', JSON.stringify(d)),

  getSession: () => JSON.parse(localStorage.getItem('GM_EMP_SESSION') || 'null'),
  saveSession: (d) => localStorage.setItem('GM_EMP_SESSION', JSON.stringify(d)),
  clearSession: () => localStorage.removeItem('GM_EMP_SESSION'),

  getDossiersEmployes: () => JSON.parse(localStorage.getItem('GM_DOSSIERS_EMP') || '{}'),
  saveDossiersEmployes: (d) => localStorage.setItem('GM_DOSSIERS_EMP', JSON.stringify(d)),
};

// ═══════════════════════════════════════════════════════════
// EMPLOYÉS — CRUD
// ═══════════════════════════════════════════════════════════
const EmployeManager = {

  // Créer un employé
  creer(data) {
    const employes = GM.getEmployes();
    const id = 'EMP_' + Date.now() + '_' + Math.random().toString(36).substr(2,5).toUpperCase();
    const emp = {
      id,
      nom: data.nom,
      prenom: data.prenom,
      tel: data.tel,
      role: data.role,           // GESTIONNAIRE_COMMANDES | GESTIONNAIRE_STOCK | LIVREUR
      domaines: data.domaines || [], // domaines assignés par le patron
      login: data.login,
      mdp: data.mdp,
      actif: true,
      dateCreation: new Date().toISOString(),
      avatar: data.avatar || null,
      tableauBordId: 'TB_' + id,
    };
    employes.push(emp);
    GM.saveEmployes(employes);
    // Créer tableau de bord vide
    this.initTableauBord(emp);
    return emp;
  },

  // Modifier
  modifier(id, updates) {
    const employes = GM.getEmployes().map(e => e.id === id ? {...e, ...updates} : e);
    GM.saveEmployes(employes);
  },

  // Désactiver (soft delete)
  desactiver(id) {
    this.modifier(id, { actif: false });
  },

  // Activer
  activer(id) {
    this.modifier(id, { actif: true });
  },

  // Récupérer par rôle
  parRole(role) {
    return GM.getEmployes().filter(e => e.role === role && e.actif);
  },

  // Récupérer par ID
  getById(id) {
    return GM.getEmployes().find(e => e.id === id);
  },

  // Init tableau de bord vide
  initTableauBord(emp) {
    const key = 'GM_TB_' + emp.id;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({
        empId: emp.id,
        role: emp.role,
        commandesAcceptees: [],
        verificationsStock: [],
        livraisonsEffectuees: [],
        derniereConnexion: null,
      }));
    }
  },

  getTB(empId) {
    const raw = localStorage.getItem('GM_TB_' + empId);
    return raw ? JSON.parse(raw) : null;
  },

  saveTB(empId, data) {
    localStorage.setItem('GM_TB_' + empId, JSON.stringify(data));
  },
};

// ═══════════════════════════════════════════════════════════
// SYSTÈME DE NOTIFICATIONS INTER-EMPLOYÉS
// ═══════════════════════════════════════════════════════════
const NotifSystem = {

  envoyer(destinataireRole, type, payload, destinataireId = null) {
    const notifs = GM.getNotifs();
    const notif = {
      id: 'N_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
      destinataireRole,   // rôle cible ou null si ciblé par ID
      destinataireId,     // ID employé spécifique ou null = tous du rôle
      type,               // 'nouvelle_commande' | 'demande_stock' | 'confirmation_stock' | 'demande_livraison' | 'livraison_acceptee'
      payload,            // données de la commande
      statut: 'en_attente', // 'en_attente' | 'lue' | 'acceptee' | 'ignoree'
      accepteePar: null,
      timestamp: new Date().toISOString(),
    };
    notifs.push(notif);
    GM.saveNotifs(notifs);

    // Déclencher un event custom pour les apps ouvertes
    window.dispatchEvent(new CustomEvent('gm_notif', { detail: notif }));
    return notif;
  },

  // Récupérer les notifs pour un employé
  pourEmploye(empId, role) {
    return GM.getNotifs().filter(n =>
      (n.destinataireId === empId || (n.destinataireRole === role && !n.destinataireId)) &&
      n.statut === 'en_attente'
    ).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Accepter une notif (premier qui appuie gagne)
  accepter(notifId, empId) {
    const notifs = GM.getNotifs();
    const n = notifs.find(x => x.id === notifId);
    if (!n || n.statut !== 'en_attente') return false; // déjà prise
    n.statut = 'acceptee';
    n.accepteePar = empId;
    n.accepteeAt = new Date().toISOString();
    GM.saveNotifs(notifs);
    window.dispatchEvent(new CustomEvent('gm_notif_acceptee', { detail: n }));
    return n;
  },

  marquerLue(notifId) {
    const notifs = GM.getNotifs().map(n =>
      n.id === notifId ? {...n, statut: 'lue'} : n
    );
    GM.saveNotifs(notifs);
  },

  countNonLues(empId, role) {
    return GM.getNotifs().filter(n =>
      (n.destinataireId === empId || (n.destinataireRole === role && !n.destinataireId)) &&
      n.statut === 'en_attente'
    ).length;
  }
};

// ═══════════════════════════════════════════════════════════
// WORKFLOW COMMANDE — CHAIN COMPLÈTE
// ═══════════════════════════════════════════════════════════
const Workflow = {

  // ÉTAPE 1 : Nouvelle commande client → notifier les gestionnaires de commandes
  nouvelleCommande(commande) {
    const cmds = GM.getCommandesEmp();
    const cmd = {
      ...commande,
      wfId: 'WF_' + Date.now(),
      wfStatut: 'en_attente_gc',   // gestionnaire commandes
      gcId: null,                   // qui a accepté
      gsId: null,                   // gestionnaire stock
      livreurId: null,
      timestamps: { creation: new Date().toISOString() }
    };
    cmds.push(cmd);
    GM.saveCommandesEmp(cmds);

    // Notifier TOUS les gestionnaires de commandes
    NotifSystem.envoyer('GESTIONNAIRE_COMMANDES', 'nouvelle_commande', {
      wfId: cmd.wfId,
      client: commande.client,
      produits: commande.produits,
      total: commande.total,
      adresse: commande.adresse,
    });

    return cmd;
  },

  // ÉTAPE 2 : GC accepte la commande → demande stock
  gcAccepteCommande(notifId, gcId) {
    const notif = NotifSystem.accepter(notifId, gcId);
    if (!notif) return null;

    const cmds = GM.getCommandesEmp();
    const cmd = cmds.find(c => c.wfId === notif.payload.wfId);
    if (!cmd) return null;

    cmd.wfStatut = 'en_attente_gs';
    cmd.gcId = gcId;
    cmd.timestamps.gcAccepte = new Date().toISOString();
    GM.saveCommandesEmp(cmds);

    // Notifier TOUS les gestionnaires de stock
    NotifSystem.envoyer('GESTIONNAIRE_STOCK', 'demande_stock', {
      wfId: cmd.wfId,
      gcId,
      produits: cmd.produits,
      demandeur: EmployeManager.getById(gcId),
    });

    // Update TB du GC
    const tb = EmployeManager.getTB(gcId);
    if (tb) {
      tb.commandesAcceptees.push({ wfId: cmd.wfId, date: new Date().toISOString(), total: cmd.total });
      EmployeManager.saveTB(gcId, tb);
    }

    return cmd;
  },

  // ÉTAPE 3 : GS vérifie stock et confirme
  gsConfirmeStock(notifId, gsId, disponible, infosStock = {}) {
    const notif = NotifSystem.accepter(notifId, gsId);
    if (!notif) return null;

    const cmds = GM.getCommandesEmp();
    const cmd = cmds.find(c => c.wfId === notif.payload.wfId);
    if (!cmd) return null;

    // Log stock
    const log = GM.getStockLog();
    log.push({
      gsId,
      wfId: cmd.wfId,
      produits: cmd.produits,
      disponible,
      date: new Date().toISOString(),
      infos: infosStock,
    });
    GM.saveStockLog(log);

    // Update TB du GS
    const tb = EmployeManager.getTB(gsId);
    if (tb) {
      tb.verificationsStock.push({ wfId: cmd.wfId, date: new Date().toISOString(), disponible });
      EmployeManager.saveTB(gsId, tb);
    }

    if (disponible) {
      cmd.wfStatut = 'en_attente_livreur';
      cmd.gsId = gsId;
      cmd.timestamps.gsConfirme = new Date().toISOString();
      GM.saveCommandesEmp(cmds);

      // Notifier le GC qui avait accepté
      NotifSystem.envoyer('GESTIONNAIRE_COMMANDES', 'confirmation_stock', {
        wfId: cmd.wfId,
        gsId,
        disponible: true,
      }, cmd.gcId);

      // Notifier TOUS les livreurs
      NotifSystem.envoyer('LIVREUR', 'demande_livraison', {
        wfId: cmd.wfId,
        client: cmd.client,
        adresse: cmd.adresse,
        produits: cmd.produits,
        total: cmd.total,
        coordonnees: cmd.coordonnees || null,
        paiement: cmd.paiement,
      });
    } else {
      cmd.wfStatut = 'stock_indisponible';
      cmd.gsId = gsId;
      GM.saveCommandesEmp(cmds);

      NotifSystem.envoyer('GESTIONNAIRE_COMMANDES', 'stock_indisponible', {
        wfId: cmd.wfId,
        gsId,
        disponible: false,
      }, cmd.gcId);
    }

    return cmd;
  },

  // ÉTAPE 4 : Livreur accepte la livraison
  livreurAccepte(notifId, livreurId) {
    const notif = NotifSystem.accepter(notifId, livreurId);
    if (!notif) return null;

    const cmds = GM.getCommandesEmp();
    const cmd = cmds.find(c => c.wfId === notif.payload.wfId);
    if (!cmd) return null;

    cmd.wfStatut = 'en_livraison';
    cmd.livreurId = livreurId;
    cmd.timestamps.livreurAccepte = new Date().toISOString();
    GM.saveCommandesEmp(cmds);

    // Notifier GC que livraison acceptée
    NotifSystem.envoyer('GESTIONNAIRE_COMMANDES', 'livraison_acceptee', {
      wfId: cmd.wfId,
      livreurId,
      livreur: EmployeManager.getById(livreurId),
    }, cmd.gcId);

    return cmd;
  },

  // ÉTAPE 5 : Livreur confirme livraison effectuée
  livreurConfirme(wfId, livreurId, montantEncaisse = 0) {
    const cmds = GM.getCommandesEmp();
    const cmd = cmds.find(c => c.wfId === wfId);
    if (!cmd) return null;

    cmd.wfStatut = 'livree';
    cmd.timestamps.livree = new Date().toISOString();
    cmd.montantEncaisse = montantEncaisse;
    GM.saveCommandesEmp(cmds);

    // Log livraison
    const livs = GM.getLivraisonsLog();
    livs.push({
      livreurId,
      wfId,
      client: cmd.client,
      adresse: cmd.adresse,
      montantEncaisse,
      date: new Date().toISOString(),
    });
    GM.saveLivraisonsLog(livs);

    // Update TB du livreur
    const tb = EmployeManager.getTB(livreurId);
    if (tb) {
      tb.livraisonsEffectuees.push({
        wfId, date: new Date().toISOString(),
        adresse: cmd.adresse, montant: montantEncaisse
      });
      EmployeManager.saveTB(livreurId, tb);
    }

    return cmd;
  },
};

// ═══════════════════════════════════════════════════════════
// AUTH EMPLOYÉS
// ═══════════════════════════════════════════════════════════
const AuthEmp = {
  connecter(login, mdp) {
    const emp = GM.getEmployes().find(e => e.login === login && e.mdp === mdp && e.actif);
    if (!emp) return null;
    const session = { empId: emp.id, role: emp.role, nom: emp.nom, prenom: emp.prenom, connectedAt: new Date().toISOString() };
    GM.saveSession(session);
    // Màj dernière connexion TB
    const tb = EmployeManager.getTB(emp.id);
    if (tb) { tb.derniereConnexion = new Date().toISOString(); EmployeManager.saveTB(emp.id, tb); }
    return session;
  },
  deconnecter() { GM.clearSession(); },
  getSession() { return GM.getSession(); },
  isConnected() { return !!GM.getSession(); },
};

// ═══════════════════════════════════════════════════════════
// STATS TABLEAU DE BORD
// ═══════════════════════════════════════════════════════════
const Stats = {
  _filtrer(items, dateField, periode) {
    const now = new Date();
    return items.filter(i => {
      const d = new Date(i[dateField]);
      if (periode === 'jour') return d.toDateString() === now.toDateString();
      if (periode === 'semaine') { const s = new Date(now); s.setDate(now.getDate()-7); return d >= s; }
      if (periode === 'mois') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    });
  },

  // GC : commandes acceptées
  gcStats(gcId, periode = 'mois') {
    const tb = EmployeManager.getTB(gcId);
    if (!tb) return { commandes: 0, ca: 0 };
    const items = this._filtrer(tb.commandesAcceptees, 'date', periode);
    return {
      commandes: items.length,
      ca: items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0),
    };
  },

  // GS : vérifications stock
  gsStats(gsId, periode = 'mois') {
    const tb = EmployeManager.getTB(gsId);
    if (!tb) return { verifications: 0, disponibles: 0 };
    const items = this._filtrer(tb.verificationsStock, 'date', periode);
    return {
      verifications: items.length,
      disponibles: items.filter(i => i.disponible).length,
      indisponibles: items.filter(i => !i.disponible).length,
    };
  },

  // Livreur : livraisons effectuées
  livreurStats(livreurId, periode = 'mois') {
    const tb = EmployeManager.getTB(livreurId);
    if (!tb) return { livraisons: 0, ca: 0, lieux: [] };
    const items = this._filtrer(tb.livraisonsEffectuees, 'date', periode);
    return {
      livraisons: items.length,
      ca: items.reduce((s, i) => s + (parseFloat(i.montant) || 0), 0),
      lieux: items.map(i => ({ adresse: i.adresse, date: i.date, montant: i.montant })),
    };
  },
};

// Export global
window.GALY = { ROLES, DOMAINES, GM, EmployeManager, NotifSystem, Workflow, AuthEmp, Stats };
console.log('✅ Galy Market — Core Employés chargé');
