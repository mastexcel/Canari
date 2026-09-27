// Garde une copie de l'appli sur le téléphone pour qu'elle marche sans internet.
// L'appli s'ouvre toujours depuis la copie du téléphone (rapide, même sans internet),
// puis la copie est mise à jour en arrière-plan quand internet est là.
// Change VERSION quand la liste des fichiers change.
const VERSION = "canari-v10";
const FICHIERS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "boutique.js",
  "facture.js",
  "manifest.webmanifest",
  "polices/fredoka.woff2",
  "polices/rubik.woff2",
  "icones/canari-joyeux.webp",
  "icones/mascotte-canari-3d.webp",
  "icones/canari-clin-doeil.webp",
  "icones/canari-yeux-fermes.webp",
  "icones/canari-tranquille.webp",
  "icones/canari-pensif.webp",
  "icones/icone-180.png",
  "icones/icone-192.png",
  "icones/icone-512.png",
  "icones/icone-maskable-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS.map(function (f) { return new Request(f, { cache: "reload" }); })); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(cles.filter(function (k) { return k !== VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.open(VERSION).then(function (cache) {
      return cache.match(e.request, { ignoreSearch: true }).then(function (copie) {
        const reseau = fetch(e.request).then(function (r) {
          if (r && r.ok) cache.put(e.request, r.clone());
          return r;
        }).catch(function () { return copie; });
        if (copie) {
          e.waitUntil(reseau);
          return copie;
        }
        return reseau;
      });
    })
  );
});
