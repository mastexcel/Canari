// Garde une copie de l'appli sur le téléphone pour qu'elle marche sans internet.
// Change VERSION à chaque mise à jour pour que les téléphones prennent les nouveaux fichiers.
const VERSION = "canari-v2";
const FICHIERS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
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
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }));
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
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) {
      return r || fetch(e.request);
    })
  );
});
