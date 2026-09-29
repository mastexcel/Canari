// Prend les cinq captures d'écran de l'appli, avec une boutique de démonstration.
// À lancer depuis la RACINE du projet, serveur local en route :  node store/captures.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// 360 × 640 en densité 3 = 1080 × 1920, la taille attendue par le Play Store.
const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8767/app/');
await p.evaluate(() => localStorage.setItem('canari.derniereSauvegarde', String(Date.now())));
await p.reload(); await p.waitForTimeout(700);
await p.evaluate(() => {
  const j = 864e5, now = Date.now();
  donnees.boutique = Object.assign(donnees.boutique, { nom: 'Chez Awa', tel: '0701020304', parametre: true, marge: 25, joursTravail: 26 });
  donnees.charges = [{ id: 'c1', type: 'charge', nom: 'Loyer', montant: 25000, frequence: 'mois' }];
  donnees.produits = {
    p1: { id: 'p1', nom: 'Riz', prix: 700, cout: 520, unite: 'kg', suivi: true, seuil: 10 },
    p2: { id: 'p2', nom: 'Huile', prix: 1200, cout: 900, unite: 'bouteille', suivi: true, seuil: 5 },
    p3: { id: 'p3', nom: 'Savon', prix: 300, cout: 220, unite: 'unite', suivi: true, seuil: 20 },
    p4: { id: 'p4', nom: 'Sucre', prix: 500, cout: 380, unite: 'kg', suivi: true, seuil: 8 }
  };
  donnees.mouvements = [{ id: 'st', type: 'stock', raison: 'depart', produitId: 'p1', quantite: 180, t: now - 40 * j }];
  let n = 0;
  const noms = ['Koffi', 'Mariam', 'Ibrahim', 'Aya', 'Seydou'];
  for (let i = 34; i >= 0; i--) {
    const t = now - i * j + 9 * 36e5;
    for (let k = 0; k < 8 + (i % 3); k++) {
      const prod = ['p1', 'p2', 'p3', 'p4'][(i + k) % 4];
      const P = donnees.produits[prod];
      const qte = 1 + ((i + k) % 4);
      const montant = P.prix * qte;
      const credit = (i + k) % 6 === 0 && i > 1;
      const tel = '070000000' + ((i + k) % 5);
      donnees.mouvements.push({ id: 'v' + (n++), type: 'vente', t: t + k * 3e6, montant,
        encaisse: credit ? 0 : montant, moyen: k % 3 === 0 ? 'wave' : 'especes',
        client: credit ? noms[(i + k) % 5] : '', clientId: credit ? tel : undefined,
        lignes: [{ produitId: prod, nom: P.nom, qte, prix: P.prix, cout: P.cout, unite: P.unite }], numero: n });
      if (credit) donnees.clients[tel] = { tel, nom: noms[(i + k) % 5], depuis: t };
    }
    if (i % 4 === 0 && i > 1) donnees.mouvements.push({ id: 'd' + i, type: 'depense', t, montant: 1500, categorie: 'autre', note: 'Transport', moyen: 'especes' });
    if (i % 9 === 0 && i > 2) donnees.mouvements.push({ id: 'm' + i, type: 'maison', t, montant: 3000, moyen: 'especes' });
  }
  donnees.mouvements.push({ id: 'i1', type: 'invest', t: now - 120 * j, montant: 150000, duree: 5, note: 'Congélateur', moyen: 'wave' });
  donnees.boutique.paiements = { wave: { actif: true, tel: '0701020304', lien: '' } };
  Object.keys(donnees.clients).slice(0, 2).forEach(function (c) { donnees.meta[c] = { promesse: '2020-01-01', relances: [] }; });
  completerDonnees(); completerAbonnement(); sauver(); montrer('principal'); afficher();
});
await p.waitForTimeout(600);
const shot = async (n) => { await p.waitForTimeout(400); await p.screenshot({ path: `store/ecran-${n}.png` }); };
await p.evaluate(() => { $('rappel-sauvegarde').hidden = true; $('rappel-version').hidden = true; window.scrollTo(0, 0); });
await shot('1-jour');
await p.click('[data-onglet="credits"]'); await shot('2-credits');
await p.click('[data-onglet="relances"]'); await shot('3-relances');
await p.click('[data-onglet="semaine"]'); await p.click('[data-bilan="tableau"]'); await p.waitForTimeout(500);
await p.evaluate(() => window.scrollTo(0, 260)); await shot('4-tableau');
await p.evaluate(() => { montrer('principal');
  const avecClient = donnees.mouvements.filter(m => m.type === 'vente' && m.clientId);
  ouvrirDocument(avecClient[avecClient.length - 1]); });
await p.waitForTimeout(900); await shot('5-facture');
console.log('erreurs', errs); await b.close();
