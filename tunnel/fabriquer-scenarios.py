#!/usr/bin/env python3
# Canari · fabrique les quatre scénarios n8n du tunnel de vente.
#
# Pourquoi un script plutôt que quatre fichiers écrits à la main : un scénario
# n8n est un gros JSON où les nœuds sont reliés par leur NOM. Écrit à la main, on
# oublie un lien, on écrit un nom deux fois, et n8n refuse le fichier sans dire
# pourquoi. Ici les liens sont déduits de l'ordre des nœuds, et les morceaux de
# code (signature, calendrier des messages) ne sont écrits qu'une fois.
#
# Après modification : python3 fabriquer-scenarios.py
import json, uuid, pathlib

# Les mots à remplacer par les vrais réglages du propriétaire (voir LISEZ-MOI.md).
# La Google Sheet du propriétaire, créée le 03/10/2026. Cet identifiant n'est pas un
# secret : sans son compte Google, il n'ouvre rien. Il est donc écrit ici pour qu'il
# n'ait pas à le recopier dans les huit nœuds Google Sheets des quatre scénarios.
SHEET   = "18h46yoM26aMjLrpkVLDuX35r-M3LWCRtGtxQu6Cdjsk"
WA_ID   = "ID_NUMERO_WHATSAPP"
WA_TOK  = "TOKEN_WHATSAPP_META"
CP_KEY  = "APIKEY_CINETPAY"
CP_SITE = "SITE_ID_CINETPAY"
N8N     = "https://TON-N8N.app.n8n.cloud"
APP     = "https://mastexcel.github.io/Canari"
FEUILLE = "Clients"

def ident():
    return str(uuid.uuid4())

def n(nom, type_, params, version, **extra):
    d = {"parameters": params, "id": ident(), "name": nom,
         "type": "n8n-nodes-base." + type_, "typeVersion": version, "position": [0, 0]}
    d.update(extra)
    return d

def webhook(nom, chemin, methode="POST", **opts):
    p = {"httpMethod": methode, "path": chemin, "responseMode": "responseNode", "options": opts}
    return n(nom, "webhook", p, 2, webhookId=ident())

def code(nom, js):
    return n(nom, "code", {"jsCode": js}, 2)

def sheet_lire(nom, filtres=None):
    p = {"operation": "read",
         "documentId": {"__rl": True, "mode": "id", "value": SHEET},
         "sheetName": {"__rl": True, "mode": "name", "value": FEUILLE},
         "options": {}}
    if filtres:
        p["filtersUI"] = {"values": [{"lookupColumn": c, "lookupValue": v} for c, v in filtres]}
    return n(nom, "googleSheets", p, 4.5, alwaysOutputData=True)

def sheet_ecrire(nom, operation, cle=None):
    p = {"operation": operation,
         "documentId": {"__rl": True, "mode": "id", "value": SHEET},
         "sheetName": {"__rl": True, "mode": "name", "value": FEUILLE},
         "columns": {"mappingMode": "autoMapInputData", "value": {},
                     "matchingColumns": [cle] if cle else [], "schema": []},
         "options": {}}
    return n(nom, "googleSheets", p, 4.5)

def whatsapp(nom, corps):
    p = {"method": "POST",
         "url": "https://graph.facebook.com/v21.0/%s/messages" % WA_ID,
         "sendHeaders": True,
         "headerParameters": {"parameters": [{"name": "Authorization", "value": "Bearer " + WA_TOK}]},
         "sendBody": True, "specifyBody": "json", "jsonBody": corps,
         "options": {}}
    # Un message WhatsApp qui rate ne doit pas faire perdre le paiement : on
    # continue, et la ligne de la Sheet garde la trace de ce qui s'est passé.
    return n(nom, "httpRequest", p, 4.2, onError="continueRegularOutput", retryOnFail=True, maxTries=3, waitBetweenTries=5000)

def http(nom, url, corps, **extra):
    p = {"method": "POST", "url": url, "sendBody": True, "specifyBody": "json",
         "jsonBody": corps, "options": {}}
    return n(nom, "httpRequest", p, 4.2, **extra)

def si(nom, gauche, droite, type_="string", operation="equals"):
    cond = {"id": ident(), "leftValue": gauche, "rightValue": droite,
            "operator": {"type": type_, "operation": operation}}
    if type_ == "boolean":
        cond["operator"]["singleValue"] = True
    p = {"conditions": {"options": {"caseSensitive": True, "typeValidation": "loose"},
                        "combinator": "and", "conditions": [cond]}, "options": {}}
    return n(nom, "if", p, 2)

def repondre(nom, quoi, valeur):
    if quoi == "redirect":
        p = {"respondWith": "redirect", "redirectURL": valeur, "options": {}}
    else:
        p = {"respondWith": "json", "responseBody": valeur, "options": {}}
    return n(nom, "respondToWebhook", p, 1.1)

def ecrire(nom_fichier, nom_scenario, noeuds, liens):
    # Les nœuds sont posés de gauche à droite, 240 px d'écart : lisible dans n8n.
    for i, nd in enumerate(noeuds):
        nd["position"] = [i * 240, (i % 2) * 40]
    connexions = {}
    for depart, arrivees in liens:
        sorties = []
        for groupe in arrivees:
            sorties.append([{"node": x, "type": "main", "index": 0} for x in groupe])
        connexions[depart] = {"main": sorties}
    doc = {"name": nom_scenario, "nodes": noeuds, "connections": connexions,
           "settings": {"executionOrder": "v1", "timezone": "Africa/Abidjan"}, "pinData": {}}
    pathlib.Path(nom_fichier).write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print("écrit :", nom_fichier, "—", len(noeuds), "nœuds")

# ===========================================================================
# Morceaux de code partagés
# ===========================================================================

# La signature d'un code d'activation Canari. Le format est exactement celui que
# l'appli lit depuis le début (voir lireCode dans app/abonnement.js) :
#     NUMÉRO-CANARI . JOURS . QUAND . SIGNATURE
# La signature est une ECDSA P-256 sur les trois premiers morceaux. L'appli n'a
# que la clé PUBLIQUE : elle peut vérifier, jamais fabriquer. Et comme le numéro
# Canari du téléphone est DANS le texte signé, un code ne marche que sur le
# téléphone qui a payé.
SIGNER = r"""
// --- La clé SECRÈTE du serveur. Elle vit ici et nulle part ailleurs.
//     Fabriquée une fois avec tunnel/fabriquer-cle-serveur.html.
//     Ne JAMAIS la mettre dans l'application : n'importe qui pourrait alors
//     fabriquer des abonnements gratuits.
const CLE_PRIVEE = { "kty": "EC", "crv": "P-256", "d": "COLLE_ICI_LA_CLE_SECRETE", "x": "COLLE_ICI_X", "y": "COLLE_ICI_Y" };

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function base64url(ab) {
  const o = new Uint8Array(ab); let s = '';
  for (let i = 0; i < o.length; i += 3) {
    const a = o[i], b = o[i + 1], c = o[i + 2];
    s += B64[a >> 2] + B64[((a & 3) << 4) | ((b || 0) >> 4)];
    if (b !== undefined) s += B64[((b & 15) << 2) | ((c || 0) >> 6)];
    if (c !== undefined) s += B64[c & 63];
  }
  return s;
}
async function fabriquerCode(idCanari, jours, conseil) {
  const sub = globalThis.crypto && globalThis.crypto.subtle;
  if (!sub) throw new Error("Ce n8n n'a pas crypto.subtle : mets-le à jour (Node 18 ou plus récent).");
  const charge = idCanari + '.' + (conseil ? 'C' : '') + jours + '.' + Date.now().toString(36);
  const cle = await sub.importKey('jwk', CLE_PRIVEE, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = await sub.sign({ name: 'ECDSA', hash: 'SHA-256' }, cle, new TextEncoder().encode(charge));
  return charge + '.' + base64url(signature);
}
"""

# Les trois formules, les mêmes que dans l'appli (FORMULES de app/abonnement.js).
# Si un prix change, il change ici AUSSI : c'est le serveur qui encaisse.
FORMULES = r"""
const FORMULES = {
  mois:      { nom: '1 mois',  jours: 31,  prix: 1000 },
  trimestre: { nom: '3 mois',  jours: 92,  prix: 2500 },
  an:        { nom: '1 an',    jours: 366, prix: 9000 },
  // L'option Conseil (« Demande à Canari »), signée avec un C devant les jours.
  conseil_mois:      { nom: 'Conseil 1 mois', jours: 31,  prix: 500,  conseil: true },
  conseil_trimestre: { nom: 'Conseil 3 mois', jours: 92,  prix: 1200, conseil: true },
  conseil_an:        { nom: 'Conseil 1 an',   jours: 366, prix: 4000, conseil: true }
};
"""

NETTOYER_TEL = r"""
// Un numéro ivoirien s'écrit de dix façons : on le ramène toujours à 225 + 10 chiffres.
function nettoyerTel(t) {
  let tel = String(t || '').replace(/\D/g, '');
  if (tel.startsWith('00225')) tel = tel.slice(2);
  if (tel.length === 10) tel = '225' + tel;
  return /^225\d{10}$/.test(tel) ? tel : '';
}
"""

# ===========================================================================
# Scénario 1 — l'inscription
# ===========================================================================
PREPARER = NETTOYER_TEL + r"""
const b = $json.body || {};
const id = String(b.id || '').toUpperCase().replace(/[^A-Z2-9]/g, '');
if (!/^[A-Z2-9]{8}$/.test(id)) throw new Error('Numéro Canari absent ou mal écrit : ' + b.id);
const tel = nettoyerTel(b.telephone);
if (!tel) throw new Error('Numéro WhatsApp invalide : ' + b.telephone);
const iso = d => new Date(d).toISOString().slice(0, 10);
const auj = new Date();
return [{ json: {
  canari_id: id,
  telephone: tel,
  nom: String(b.nom || '').trim().slice(0, 40) || 'ami commerçant',
  boutique: String(b.boutique || '').trim().slice(0, 60),
  langue: b.langue === 'en' ? 'en' : 'fr',
  date_inscription: b.debut ? iso(b.debut) : iso(auj),
  fin_essai: b.finEssai ? iso(b.finEssai) : iso(auj.getTime() + 30 * 86400000),
  statut: 'essai',
  plan: '',
  date_expiration: b.finEssai ? iso(b.finEssai) : iso(auj.getTime() + 30 * 86400000),
  code_activation: '',
  derniere_transaction: '',
  dernier_message: '',
  total_paye: 0
}}];
"""

TRIER = r"""
// La lecture filtrée renvoie une ligne vide quand le client est nouveau.
const clientPrepare = $('Préparer le client').first().json;
const lignes = $input.all().map(i => i.json).filter(l => l && l.canari_id);
const deja = lignes.find(l => String(l.canari_id).toUpperCase() === clientPrepare.canari_id);
// Un client déjà inscrit qui change de numéro ou de boutique : on met à jour
// sans lui renvoyer le message de bienvenue (il l'a déjà reçu).
return [{ json: Object.assign({}, clientPrepare, { _nouveau: !deja,
  _change: !!deja && (deja.telephone !== clientPrepare.telephone || deja.boutique !== clientPrepare.boutique),
  statut: deja ? deja.statut : 'essai',
  plan: deja ? deja.plan : '',
  date_expiration: deja ? deja.date_expiration : clientPrepare.date_expiration,
  code_activation: deja ? deja.code_activation : '',
  derniere_transaction: deja ? deja.derniere_transaction : '',
  dernier_message: deja ? deja.dernier_message : '',
  total_paye: deja ? deja.total_paye : 0 }) }];
"""

SANS_TECHNIQUE = r"""
// Les colonnes qui commencent par « _ » servent au scénario, pas à la Sheet.
const j = {};
for (const [k, v] of Object.entries($json)) if (!k.startsWith('_')) j[k] = v;
return [{ json: j }];
"""

BIENVENUE = ("={{ JSON.stringify({ messaging_product: 'whatsapp', "
             "to: $('Trier nouveau ou ancien').first().json.telephone, type: 'template', "
             "template: { name: 'canari_bienvenue', language: { code: $('Trier nouveau ou ancien').first().json.langue }, "
             "components: [{ type: 'body', parameters: ([ $('Trier nouveau ou ancien').first().json.nom, "
             "$('Trier nouveau ou ancien').first().json.fin_essai ])"
             ".map(t => ({ type: 'text', text: String(t) })) }] } }) }}")

noeuds1 = [
    webhook("Inscription depuis l'app", "canari-inscription",
            allowedOrigins="https://mastexcel.github.io"),
    code("Préparer le client", PREPARER),
    sheet_lire("Chercher ce numéro Canari", [("canari_id", "={{ $json.canari_id }}")]),
    code("Trier nouveau ou ancien", TRIER),
    si("Nouveau client ?", "={{ $json._nouveau }}", True, "boolean", "true"),
    code("Retirer les colonnes de travail", SANS_TECHNIQUE),
    sheet_ecrire("Écrire dans la Sheet", "appendOrUpdate", "canari_id"),
    whatsapp("WhatsApp de bienvenue", BIENVENUE),
    repondre("Répondre à l'app", "json",
             "={{ JSON.stringify({ ok: true, finEssai: $('Trier nouveau ou ancien').first().json.fin_essai }) }}"),
    code("Mettre à jour l'ancien", SANS_TECHNIQUE),
    sheet_ecrire("Corriger la Sheet", "appendOrUpdate", "canari_id"),
]
ecrire("1-inscription.json", "Canari 1 · Inscription", noeuds1, [
    ("Inscription depuis l'app", [["Préparer le client"]]),
    ("Préparer le client", [["Chercher ce numéro Canari"]]),
    ("Chercher ce numéro Canari", [["Trier nouveau ou ancien"]]),
    ("Trier nouveau ou ancien", [["Nouveau client ?"]]),
    ("Nouveau client ?", [["Retirer les colonnes de travail"], ["Mettre à jour l'ancien"]]),
    ("Retirer les colonnes de travail", [["Écrire dans la Sheet"]]),
    ("Écrire dans la Sheet", [["WhatsApp de bienvenue"]]),
    ("WhatsApp de bienvenue", [["Répondre à l'app"]]),
    ("Mettre à jour l'ancien", [["Corriger la Sheet"]]),
    ("Corriger la Sheet", [["Répondre à l'app"]]),
])

# ===========================================================================
# Scénario 2 — les messages du matin
# ===========================================================================
# Le calendrier. Une règle = un message, envoyé UNE SEULE FOIS (la colonne
# dernier_message garde le dernier envoyé). On n'écrit jamais deux fois le même
# jour : un commerçant relancé trop souvent bloque le numéro, et le numéro
# bloqué, c'est tout le tunnel qui s'arrête.
CALENDRIER = r"""
const AUJ = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
const jours = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - a) / 86400000);

// Le calendrier de l'essai : le jour d'usage -> le message à envoyer.
// « canari_… » sont les modèles validés chez Meta (voir LISEZ-MOI.md).
const ESSAI = [
  { jour: 1,  cle: 'J1',  modele: 'canari_j1',  champs: c => [c.nom] },
  { jour: 3,  cle: 'J3',  modele: 'canari_j3',  champs: c => [c.nom] },
  { jour: 10, cle: 'J10', modele: 'canari_j10', champs: c => [c.nom] },
  { jour: 21, cle: 'J21', modele: 'canari_j21', champs: c => [c.nom] },
  { jour: 27, cle: 'J27', modele: 'canari_essai_bientot', champs: c => [c.nom, String(Math.max(0, jours(AUJ, c.fin_essai)))] },
  { jour: 31, cle: 'FIN', modele: 'canari_essai_fini', champs: c => [c.nom] }
];

const sortie = [];
for (const item of $input.all()) {
  const c = item.json;
  if (!c || !c.canari_id || !c.telephone) continue;
  if (String(c.stop || '').trim()) continue;          // il a demandé qu'on arrête
  const langue = c.langue === 'en' ? 'en' : 'fr';
  const deja = String(c.dernier_message || '');
  let choix = null;

  if (c.statut === 'paye') {
    // Abonné : on ne parle que du renouvellement, 3 jours avant la fin, puis une
    // fois le lendemain de la fin.
    const reste = jours(AUJ, c.date_expiration);
    if (reste === 3 && deja !== 'R3') choix = { cle: 'R3', modele: 'canari_renouvellement', champs: [c.nom, String(reste)] };
    else if (reste === -1 && deja !== 'R0') choix = { cle: 'R0', modele: 'canari_abonnement_fini', champs: [c.nom] };
  } else {
    // En essai (ou essai fini) : le calendrier, et seulement le message le plus
    // avancé qu'il n'a pas encore reçu. Un commerçant inscrit en retard ne reçoit
    // pas les six messages d'un coup.
    const age = jours(new Date(c.date_inscription + 'T00:00:00Z'), AUJ.toISOString().slice(0, 10));
    const faits = ESSAI.map(e => e.cle);
    const rang = faits.indexOf(deja);
    const du = ESSAI.filter((e, i) => i > rang && age >= e.jour).pop();
    if (du) choix = { cle: du.cle, modele: du.modele, champs: du.champs(c) };
  }
  if (!choix) continue;
  sortie.push({ json: {
    canari_id: c.canari_id, telephone: c.telephone, langue: langue,
    modele: choix.modele, champs: choix.champs.map(String), cle: choix.cle
  }});
}
return sortie;
"""

ENVOI_CALENDRIER = ("={{ JSON.stringify({ messaging_product: 'whatsapp', to: $json.telephone, "
                    "type: 'template', template: { name: $json.modele, language: { code: $json.langue }, "
                    "components: [{ type: 'body', parameters: ($json.champs)"
                    ".map(t => ({ type: 'text', text: String(t) })) }] } }) }}")

NOTER_ENVOI = r"""
// On écrit dans la Sheet ce qui vient de partir : c'est ce qui empêche de
// renvoyer le même message demain.
const envoye = $('Choisir le message du jour').all().map(i => i.json);
return envoye.map(e => ({ json: {
  canari_id: e.canari_id,
  dernier_message: e.cle,
  dernier_envoi: new Date().toISOString().slice(0, 10)
}}));
"""

noeuds2 = [
    n("Chaque matin 9 h", "scheduleTrigger",
      {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]}}, 1.2),
    sheet_lire("Lire tous les clients"),
    code("Choisir le message du jour", CALENDRIER),
    whatsapp("Envoyer sur WhatsApp", ENVOI_CALENDRIER),
    code("Préparer la trace", NOTER_ENVOI),
    sheet_ecrire("Noter l'envoi", "update", "canari_id"),
]
ecrire("2-messages-du-matin.json", "Canari 2 · Messages du matin", noeuds2, [
    ("Chaque matin 9 h", [["Lire tous les clients"]]),
    ("Lire tous les clients", [["Choisir le message du jour"]]),
    ("Choisir le message du jour", [["Envoyer sur WhatsApp"]]),
    ("Envoyer sur WhatsApp", [["Préparer la trace"]]),
    ("Préparer la trace", [["Noter l'envoi"]]),
])

# ===========================================================================
# Scénario 3 — le lien de paiement
# ===========================================================================
TRANSACTION = NETTOYER_TEL + FORMULES + r"""
const q = $json.query || {};
const id = String(q.id || '').toUpperCase().replace(/[^A-Z2-9]/g, '');
if (!/^[A-Z2-9]{8}$/.test(id)) throw new Error('Numéro Canari absent : ' + q.id);
const f = FORMULES[q.plan];
if (!f) throw new Error('Formule inconnue : ' + q.plan);
// Le prix et les jours viennent d'ICI, jamais du lien : sinon n'importe qui
// paierait 1 F pour un an en changeant l'adresse dans son navigateur.
return [{ json: {
  transaction_id: 'CAN-' + id + '-' + Date.now().toString(36).toUpperCase(),
  canari_id: id,
  plan: q.plan,
  jours: f.jours,
  conseil: !!f.conseil,
  montant: f.prix,
  description: 'Canari — ' + f.nom,
  telephone: nettoyerTel(q.tel),
  boutique: String(q.boutique || '').slice(0, 60),
  email: String(q.email || '').slice(0, 80),
  langue: q.langue === 'en' ? 'en' : 'fr'
}}];
"""

GUICHET = ("={{ JSON.stringify({ apikey: '%s', site_id: '%s', "
           "transaction_id: $json.transaction_id, amount: $json.montant, currency: 'XOF', "
           "description: $json.description, channels: 'MOBILE_MONEY', lang: $json.langue.toUpperCase(), "
           "customer_phone_number: $json.telephone, "
           "metadata: JSON.stringify({ id: $json.canari_id, plan: $json.plan, jours: $json.jours, "
           "conseil: $json.conseil, tel: $json.telephone, boutique: $json.boutique, email: $json.email, "
           "langue: $json.langue }), "
           "notify_url: '%s/webhook/canari-notification', "
           "return_url: '%s/#paiement=ok' }) }}") % (CP_KEY, CP_SITE, N8N, APP)

noeuds3 = [
    webhook("Lien « Payer »", "canari-payer", "GET"),
    code("Préparer la transaction", TRANSACTION),
    http("Ouvrir le guichet CinetPay", "https://api-checkout.cinetpay.com/v2/payment", GUICHET,
         retryOnFail=True, maxTries=2, waitBetweenTries=2000),
    repondre("Envoyer vers le guichet", "redirect", "={{ $json.data.payment_url }}"),
]
ecrire("3-lien-de-paiement.json", "Canari 3 · Lien de paiement", noeuds3, [
    ("Lien « Payer »", [["Préparer la transaction"]]),
    ("Préparer la transaction", [["Ouvrir le guichet CinetPay"]]),
    ("Ouvrir le guichet CinetPay", [["Envoyer vers le guichet"]]),
])

# ===========================================================================
# Scénario 4 — le paiement vérifié, le code signé, le code envoyé
# ===========================================================================
VERIFICATION = ("={{ JSON.stringify({ apikey: '%s', site_id: '%s', "
                "transaction_id: $json.body.cpm_trans_id }) }}") % (CP_KEY, CP_SITE)

CODE_SIGNE = SIGNER + r"""
// CinetPay prévient le serveur, mais on ne le croit pas sur parole : on vient de
// REDEMANDER à CinetPay l'état de la transaction (nœud précédent). C'est la seule
// réponse qui compte — la notification, elle, peut venir de n'importe qui.
const verif = $('Redemander à CinetPay').first().json;
const d = verif.data || {};
let meta = {};
try { meta = JSON.parse(d.metadata || '{}'); } catch (e) { meta = {}; }
const id = String(meta.id || '').toUpperCase();
if (!/^[A-Z2-9]{8}$/.test(id)) throw new Error('Pas de numéro Canari dans le paiement ' + d.payment_token);

// Déjà traité ? CinetPay peut prévenir deux fois pour le même paiement. Sans ce
// garde-fou, le client recevrait deux codes — et deux fois ses jours.
const lignes = $('Lire ce client').all().map(i => i.json).filter(l => l && l.canari_id);
const client = lignes.find(l => String(l.canari_id).toUpperCase() === id) || {};
const transaction = String(d.payment_token || $('Notification CinetPay').first().json.body.cpm_trans_id || '');
if (client.derniere_transaction && String(client.derniere_transaction) === transaction) {
  return [{ json: { _deja: true } }];
}

const jours = Number(meta.jours) || 31;
const conseil = !!meta.conseil;
const code = await fabriquerCode(id, jours, conseil);

// La date de fin pour la Sheet et pour les messages de renouvellement. L'appli,
// elle, ajoute les jours à la suite de ce qu'il reste : c'est elle qui a la
// vérité, le serveur ne fait qu'une estimation pour savoir quand relancer.
const depart = new Date(Math.max(Date.now(), new Date((client.date_expiration || '') + 'T00:00:00Z').getTime() || 0));
const fin = new Date(depart.getTime() + jours * 86400000).toISOString().slice(0, 10);
const enFrancais = d2 => d2.split('-').reverse().join('/');

return [{ json: {
  canari_id: id,
  telephone: meta.tel || client.telephone || '',
  nom: client.nom || 'ami commerçant',
  langue: meta.langue === 'en' ? 'en' : 'fr',
  boutique: meta.boutique || client.boutique || '',
  email: meta.email || client.email || '',
  statut: conseil ? (client.statut || 'essai') : 'paye',
  plan: meta.plan || '',
  date_expiration: conseil ? (client.date_expiration || fin) : fin,
  code_activation: code,
  derniere_transaction: transaction,
  total_paye: Number(client.total_paye || 0) + Number(d.amount || 0),
  _lien: '""" + APP + r"""/#code=' + code,
  _date_fr: enFrancais(fin),
  _deja: false
}}];
"""

SHEET_PROPRE = r"""
const j = {};
for (const [k, v] of Object.entries($json)) if (!k.startsWith('_')) j[k] = v;
return [{ json: j }];
"""

ENVOI_CODE = ("={{ JSON.stringify({ messaging_product: 'whatsapp', "
              "to: $('Signer le code Canari').first().json.telephone, type: 'template', "
              "template: { name: 'canari_code', language: { code: $('Signer le code Canari').first().json.langue }, "
              "components: [{ type: 'body', parameters: ([ "
              "$('Signer le code Canari').first().json.nom, "
              "$('Signer le code Canari').first().json._date_fr, "
              "$('Signer le code Canari').first().json._lien ])"
              ".map(t => ({ type: 'text', text: String(t) })) }] } }) }}")

noeuds4 = [
    n("Notification CinetPay", "webhook",
      {"httpMethod": "POST", "path": "canari-notification", "responseMode": "onReceived", "options": {}},
      2, webhookId=ident()),
    http("Redemander à CinetPay", "https://api-checkout.cinetpay.com/v2/payment/check", VERIFICATION,
         retryOnFail=True, maxTries=3, waitBetweenTries=3000),
    si("Paiement accepté ?", "={{ $json.data.status }}", "ACCEPTED"),
    sheet_lire("Lire ce client"),
    code("Signer le code Canari", CODE_SIGNE),
    si("Code à envoyer ?", "={{ $json._deja }}", False, "boolean", "false"),
    code("Retirer les colonnes de travail", SHEET_PROPRE),
    sheet_ecrire("Activer dans la Sheet", "appendOrUpdate", "canari_id"),
    whatsapp("Envoyer le code sur WhatsApp", ENVOI_CODE),
]
ecrire("4-paiement-et-code.json", "Canari 4 · Paiement et code", noeuds4, [
    ("Notification CinetPay", [["Redemander à CinetPay"]]),
    ("Redemander à CinetPay", [["Paiement accepté ?"]]),
    ("Paiement accepté ?", [["Lire ce client"], []]),
    ("Lire ce client", [["Signer le code Canari"]]),
    ("Signer le code Canari", [["Code à envoyer ?"]]),
    ("Code à envoyer ?", [["Retirer les colonnes de travail"], []]),
    ("Retirer les colonnes de travail", [["Activer dans la Sheet"]]),
    ("Activer dans la Sheet", [["Envoyer le code sur WhatsApp"]]),
])
