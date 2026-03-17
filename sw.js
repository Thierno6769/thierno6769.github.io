/* ═══════════════════════════════════════════════════════
   GALY MARKET — SERVICE WORKER PWA
   Cache offline + mise à jour automatique
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'galy-market-v1';

// Fichiers à mettre en cache pour fonctionner hors connexion
const CACHE_FILES = [
  './',
  './login.html',
  './app-commandes.html',
  './app-stock.html',
  './app-livreur.html',
  './admin-employes.html',
  './js/employes-core.js',
  './manifest.json',
  './manifest-commandes.json',
  './manifest-stock.json',
  './manifest-livreur.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-commandes-192x192.png',
  './icons/icon-stock-192x192.png',
  './icons/icon-livreur-192x192.png',
  './icons/apple-touch-icon.png',
  // Polices Google (depuis CDN)
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@1,400&display=swap',
  // Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
];

// ── INSTALLATION : mise en cache des ressources ──
self.addEventListener('install', event => {
  console.log('[SW] Installation en cours…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // On ignore les erreurs individuelles (ex: CDN inaccessible)
      return Promise.allSettled(
        CACHE_FILES.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Cache échoué pour:', url, err))
        )
      );
    }).then(() => {
      console.log('[SW] Cache prêt ✅');
      return self.skipWaiting(); // Activer immédiatement
    })
  );
});

// ── ACTIVATION : nettoyer les anciens caches ──
self.addEventListener('activate', event => {
  console.log('[SW] Activation…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Suppression ancien cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH : stratégie Cache First puis Network ──
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;

  // Ignorer les extensions Chrome
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Trouvé en cache → retourner immédiatement + mettre à jour en arrière-plan
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const cloned = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse;
      }

      // Pas en cache → réseau
      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
          return networkResponse;
        })
        .catch(() => {
          // Hors ligne et pas en cache → page offline
          if (event.request.destination === 'document') {
            return caches.match('./login.html');
          }
        });
    })
  );
});

// ── PUSH NOTIFICATIONS (préparé pour future intégration) ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Galy Market', {
    body: data.body || 'Nouvelle notification',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    data: { url: data.url || './login.html' },
    vibrate: [200, 100, 200],
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || './login.html')
  );
});
