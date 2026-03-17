/* ═══════════════════════════════════════════
   GALY MARKET — products.js
   Base de données produits
═══════════════════════════════════════════ */

const GM_PRODUCTS = [
  // ── TÉLÉPHONES & TECH ──
  {
    id: 1, name: 'iPhone 15 Pro 128GB', cat: 'phones',
    price: 9850000, old: 12000000,
    em: '📱', img: '',
    rating: 4.8, reviews: 1240,
    badge: 'Best Seller', flash: true, isNew: false,
    brand: 'Apple', stock: 15,
    desc: 'Le dernier iPhone avec puce A17 Pro, caméra 48MP et écran Super Retina XDR. Design en titane ultra-résistant. Face ID nouvelle génération. Autonomie exceptionnelle toute la journée. Connectivité USB-C et 5G ultra-rapide. Disponible en plusieurs coloris exclusifs.',
    variantes: {
      stockage: [
        { label: '128 Go',  prixExtra: 0 },
        { label: '256 Go',  prixExtra: 800000 },
        { label: '512 Go',  prixExtra: 1800000 },
        { label: '1 To',    prixExtra: 3200000 },
      ],
      couleur: [
        { label: 'Titane Noir',    hex: '#3d3d3d' },
        { label: 'Titane Blanc',   hex: '#e8e8e4' },
        { label: 'Titane Bleu',    hex: '#4a6fa5' },
        { label: 'Titane Naturel', hex: '#c8bca8' },
      ],
    },
  },
  {
    id: 2, name: 'Samsung Galaxy S24 Ultra', cat: 'phones',
    price: 8700000, old: 11000000,
    em: '📱', img: '',
    rating: 4.7, reviews: 980,
    badge: 'Top Vente', flash: false, isNew: true,
    brand: 'Samsung', stock: 8,
    desc: 'Android flagship avec S Pen intégré, zoom 200x et batterie 5000mAh. Écran Dynamic AMOLED 6.8" 120Hz. Processeur Snapdragon dernier cri. Résistance à l\'eau IP68. Chargement sans fil 45W. Idéal pour les professionnels et créatifs.',
    variantes: {
      stockage: [
        { label: '256 Go',  prixExtra: 0 },
        { label: '512 Go',  prixExtra: 1200000 },
        { label: '1 To',    prixExtra: 2500000 },
      ],
      couleur: [
        { label: 'Titanium Black',  hex: '#1c1c1c' },
        { label: 'Titanium Gray',   hex: '#7a7a78' },
        { label: 'Titanium Violet', hex: '#6b5b7b' },
        { label: 'Titanium Yellow', hex: '#d4a843' },
      ],
    },
  },
  {
    id: 3, name: 'Xiaomi Redmi Note 13 Pro', cat: 'phones',
    price: 2400000, old: 3200000,
    em: '📱', img: '',
    rating: 4.5, reviews: 2340,
    badge: '-25%', flash: true, isNew: false,
    brand: 'Xiaomi', stock: 30,
    desc: 'Excellent rapport qualité-prix avec un écran AMOLED 120Hz fluide et lumineux. Charge rapide 67W pour une autonomie complète en 45 minutes. Processeur MediaTek Dimensity performant. Triple caméra 200MP. Batterie 5000mAh longue durée. Design premium en verre et métal.',
    variantes: {
      stockage: [
        { label: '128 Go / 8 Go RAM',  prixExtra: 0 },
        { label: '256 Go / 8 Go RAM',  prixExtra: 400000 },
        { label: '256 Go / 12 Go RAM', prixExtra: 700000 },
      ],
      couleur: [
        { label: 'Midnight Black', hex: '#1a1a2e' },
        { label: 'Aurora Purple',  hex: '#7b5ea7' },
        { label: 'Ice Blue',       hex: '#a8d8ea' },
      ],
    },
  },
  {
    id: 4, name: 'MacBook Air M2 13"', cat: 'phones',
    price: 12500000, old: 15000000,
    em: '💻', img: '',
    rating: 4.9, reviews: 567,
    badge: 'Premium', flash: false, isNew: false,
    brand: 'Apple', stock: 6,
    desc: 'Performance exceptionnelle avec la puce Apple M2. Légèreté incomparable à seulement 1,24 kg. Autonomie jusqu\'à 18 heures. Écran Liquid Retina 13,6" IPS. Clavier rétroéclairé Magic Keyboard. Idéal pour les étudiants, créatifs et professionnels en déplacement.',
    variantes: {
      stockage: [
        { label: '256 Go / 8 Go RAM',  prixExtra: 0 },
        { label: '512 Go / 8 Go RAM',  prixExtra: 1500000 },
        { label: '512 Go / 16 Go RAM', prixExtra: 2500000 },
        { label: '1 To / 16 Go RAM',   prixExtra: 4000000 },
        { label: '2 To / 24 Go RAM',   prixExtra: 7000000 },
      ],
      couleur: [
        { label: 'Lumière stellaire', hex: '#f0ece4' },
        { label: 'Minuit',            hex: '#2d3142' },
        { label: 'Gris sidéral',      hex: '#86868b' },
        { label: 'Argent',            hex: '#e3e4e6' },
      ],
    },
  },
  {
    id: 5, name: 'AirPods Pro 2ème Génération', cat: 'phones',
    price: 1850000, old: 2450000,
    em: '🎧', img: '',
    rating: 4.8, reviews: 1560,
    badge: 'Hit', flash: true, isNew: false,
    brand: 'Apple', stock: 12,
    desc: 'Réduction de bruit active de classe mondiale pour une immersion totale. Audio spatial avec son Dolby Atmos. Résistance à l\'eau IPX4. Autonomie 30 heures avec l\'étui. Puce H1 Apple pour une connexion instantanée. Compatible avec tous les appareils Bluetooth.',
  },
  {
    id: 6, name: 'Samsung Galaxy Watch 6', cat: 'phones',
    price: 1450000, old: 1950000,
    em: '⌚', img: '',
    rating: 4.6, reviews: 720,
    badge: 'New', flash: true, isNew: true,
    brand: 'Samsung', stock: 18,
    desc: 'Montre connectée avec suivi santé complet incluant ECG et mesure de pression artérielle. Écran Always-On AMOLED. Suivi du sommeil et SpO2. GPS intégré. Résistance à l\'eau 5 ATM. Autonomie 2 jours. Compatible Android et iOS. Design élégant en acier inoxydable.',
  },

  // ── MODE & VÊTEMENTS ──
  {
    id: 7, name: 'Robe Longue Wax Africaine', cat: 'mode',
    price: 350000, old: 550000,
    em: '👗', img: '',
    rating: 4.7, reviews: 890,
    badge: 'Tendance', flash: false, isNew: true,
    brand: '', stock: 40,
    desc: 'Magnifique robe en tissu wax authentique d\'Afrique de l\'Ouest. Coupe moderne et élégante qui met en valeur la silhouette. Tissu 100% coton respirant. Motifs exclusifs faits à la main. Disponible en plusieurs tailles. Parfaite pour les cérémonies et événements spéciaux.',
  },
  {
    id: 8, name: 'Costume Homme Slim Premium', cat: 'mode',
    price: 850000, old: 1200000,
    em: '🤵', img: '',
    rating: 4.5, reviews: 430,
    badge: '-29%', flash: false, isNew: false,
    brand: '', stock: 20,
    desc: 'Costume deux pièces coupe slim élégant pour homme. Tissu premium anti-froissement de haute qualité. Veste et pantalon assortis. Doublure intérieure confortable. Idéal pour les réunions professionnelles, mariages et cérémonies. Disponible en plusieurs tailles et coloris.',
  },
  {
    id: 9, name: 'Sneakers Nike Air Max 270', cat: 'mode',
    price: 950000, old: 1350000,
    em: '👟', img: '',
    rating: 4.6, reviews: 1100,
    badge: '', flash: true, isNew: false,
    brand: 'Nike', stock: 25,
    desc: 'Confort ultime avec semelle Air Max visible pour un amorti exceptionnel. Tige en mesh respirant. Coloris exclusifs tendance. Semelle extérieure en caoutchouc résistante. Idéales pour le sport, la marche quotidienne et le style urbain. Disponibles en plusieurs pointures.',
  },
  {
    id: 10, name: 'Sac à Main Cuir Véritable', cat: 'mode',
    price: 1200000, old: 1800000,
    em: '👜', img: '',
    rating: 4.8, reviews: 340,
    badge: 'Luxe', flash: false, isNew: false,
    brand: '', stock: 10,
    desc: 'Sac artisanal en cuir véritable de première qualité avec finitions dorées luxueuses. Capacité généreuse pour ranger toutes vos affaires essentielles. Plusieurs compartiments intérieurs. Bandoulière amovible et réglable. Fabriqué à la main par des artisans locaux. Design intemporel et élégant.',
  },

  // ── BEAUTÉ & PARFUMS ──
  {
    id: 11, name: 'Dior Sauvage Eau de Parfum 100ml', cat: 'beaute',
    price: 850000, old: 1200000,
    em: '🌹', img: '',
    rating: 4.9, reviews: 3200,
    badge: 'Luxe', flash: false, isNew: false,
    brand: 'Dior', stock: 30,
    desc: 'Le parfum masculin emblématique de la maison Dior. Accord boisé frais et intense avec des notes de bergamote, lavande et cèdre. Sillage long et raffiné. Flacon élégant signature Dior. Concentration Eau de Toilette 100ml. Idéal pour toutes occasions, du bureau à la soirée.',
  },
  {
    id: 12, name: 'Huile d\'Argan Bio 100ml', cat: 'beaute',
    price: 180000, old: 250000,
    em: '🌿', img: '',
    rating: 4.7, reviews: 1800,
    badge: '100% Bio', flash: true, isNew: false,
    brand: '', stock: 60,
    desc: 'Huile d\'argan pure et certifiée bio 100% naturelle. Hydrate et nourrit le visage, les cheveux et le corps. Riche en vitamine E et antioxydants. Sans parabène, sans sulfate, sans silicone. Pressée à froid pour préserver toutes les propriétés. Convient à tous les types de peau.',
  },
  {
    id: 13, name: 'Coffret Soins Visage Premium', cat: 'beaute',
    price: 650000, old: 900000,
    em: '✨', img: '',
    rating: 4.6, reviews: 540,
    badge: '-28%', flash: false, isNew: true,
    brand: '', stock: 20,
    desc: 'Coffret complet : sérum, crème hydratante, contour des yeux et masque.',
  },

  // ── MAISON & JARDIN ──
  {
    id: 14, name: 'TV Samsung QLED 55" 4K', cat: 'maison',
    price: 4500000, old: 6200000,
    em: '📺', img: '',
    rating: 4.7, reviews: 430,
    badge: '-27%', flash: false, isNew: false,
    brand: 'Samsung', stock: 5,
    desc: 'Smart TV QLED 4K avec Quantum Dot, HDR10+ et interface Tizen intuitive.',
  },
  {
    id: 15, name: 'Réfrigérateur LG 350L No Frost', cat: 'maison',
    price: 3200000, old: 4200000,
    em: '🧊', img: '',
    rating: 4.5, reviews: 345,
    badge: 'Éco A+++', flash: false, isNew: false,
    brand: 'LG', stock: 4,
    desc: 'Réfrigérateur double porte, technologie No Frost, classe énergétique A+++.',
  },
  {
    id: 16, name: 'Diffuseur d\'Arôme Ultrasonique', cat: 'maison',
    price: 480000, old: 650000,
    em: '💨', img: '',
    rating: 4.7, reviews: 320,
    badge: '-26%', flash: true, isNew: false,
    brand: '', stock: 15,
    desc: 'Diffuseur ultrasonique 500ml, 7 couleurs LED, minuterie programmable.',
  },

  // ── SPORT & FITNESS ──
  {
    id: 17, name: 'Vélo Électrique Pliant 250W', cat: 'sport',
    price: 4500000, old: 5800000,
    em: '🚲', img: '',
    rating: 4.5, reviews: 210,
    badge: 'Éco', flash: false, isNew: true,
    brand: '', stock: 3,
    desc: 'Vélo électrique pliable, autonomie 50km, charge complète en 4h.',
  },
  {
    id: 18, name: 'Tapis de Course Pro 1800W', cat: 'sport',
    price: 2800000, old: 3900000,
    em: '🏃', img: '',
    rating: 4.6, reviews: 180,
    badge: '-28%', flash: false, isNew: false,
    brand: '', stock: 7,
    desc: 'Tapis de course professionnel, vitesse 0-18km/h, inclinaison ajustable.',
  },

  // ── BIJOUX & MONTRES ──
  {
    id: 19, name: 'Montre Homme Automatique Or', cat: 'bijoux',
    price: 2200000, old: 3500000,
    em: '⌚', img: '',
    rating: 4.8, reviews: 290,
    badge: 'Luxe', flash: false, isNew: false,
    brand: '', stock: 8,
    desc: 'Montre automatique boîtier acier plaqué or, bracelet cuir véritable.',
  },
  {
    id: 20, name: 'Collier Perles Africaines', cat: 'bijoux',
    price: 350000, old: 500000,
    em: '📿', img: '',
    rating: 4.6, reviews: 420,
    badge: 'Artisanal', flash: true, isNew: true,
    brand: '', stock: 25,
    desc: 'Collier artisanal en perles africaines multicolores, fait main.',
  },
];

// Catégories
const GM_CATS = {
  phones: { label: 'Téléphones & Tech',  icon: 'fa-mobile-screen' },
  mode:   { label: 'Mode & Vêtements',   icon: 'fa-shirt'         },
  beaute: { label: 'Beauté & Parfums',   icon: 'fa-sparkles'      },
  maison: { label: 'Maison & Jardin',    icon: 'fa-house'         },
  sport:  { label: 'Sport & Fitness',    icon: 'fa-dumbbell'      },
  bijoux: { label: 'Bijoux & Montres',   icon: 'fa-gem'           },
};
