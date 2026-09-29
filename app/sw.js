// Garde une copie de l'appli sur le téléphone pour qu'elle marche sans internet.
// L'appli s'ouvre toujours depuis la copie du téléphone (rapide, même sans internet),
// puis la copie est mise à jour en arrière-plan quand internet est là.
// Change VERSION quand la liste des fichiers change.
const VERSION = "canari-v50";
const FICHIERS = [
  "./",
  "index.html",
  "confidentialite.html",
  "style.css",
  "app.js",
  "i18n.js",
  "devise.js",
  "langues/en-principal.js",
  "langues/en-boutique.js",
  "langues/en-extras.js",
  "langues/en-tableau.js",
  "langues/en-conseil.js",
  "voix.js",
  "paiements.js",
  "charges.js",
  "tableau.js",
  "export.js",
  "conseil.js",
  "fiches.js",
  "intrants.js",
  "boutique.js",
  "facture.js",
  "contacts.js",
  "abonnement.js",
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
  "icones/qr-djamo.png",
  "icones/qr-wave.png",
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

// L'appli demande « quelle version tu sers ? » pour l'afficher dans les Réglages :
// sans ça, impossible de savoir au téléphone si la mise à jour est bien arrivée.
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "version" && e.source) {
    e.source.postMessage({ type: "version", version: VERSION });
  }
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
