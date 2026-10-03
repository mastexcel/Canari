# Le tunnel de vente de Canari

Ce dossier contient le **serveur** qui vend Canari tout seul.

Aujourd'hui, un abonnement te demande du travail : le commerçant paie, il t'écrit
sur WhatsApp, tu ouvres ta page `gerant.html`, tu crées le code, tu le renvoies.
Ça marche très bien à dix clients. À trois cents, c'est un travail à plein temps,
de jour comme de nuit.

Avec le tunnel, la chaîne se fait sans toi :

```
 Affiche, flyer, statut WhatsApp  (store/pub/)
            │
            ▼
 Le commerçant installe Canari
            │
   [1] Inscription  ──────────────►  message de bienvenue sur WhatsApp
            │
   [2] Chaque matin 9 h  ─────────►  J1 · J3 · J10 · J21 · J27 · fin d'essai
            │                        puis rappels de renouvellement
            ▼
   Il touche « Payer maintenant » dans l'application
            │
   [3] Guichet CinetPay  ─────────►  Wave · Orange Money · MTN · Moov
            │
   [4] Paiement vérifié  ─────────►  code d'activation signé, envoyé sur WhatsApp
            │
            ▼
   Il touche le lien : l'application se débloque, sa facture est prête.
```

Tu ne touches à rien. Tu regardes la Google Sheet quand tu veux savoir où tu en es.

---

## Ce qu'il y a dans ce dossier

| Fichier | À quoi ça sert |
|---|---|
| `1-inscription.json` | Scénario n8n : enregistre un nouveau commerçant, lui souhaite la bienvenue |
| `2-messages-du-matin.json` | Scénario n8n : les messages de suivi, une fois par jour à 9 h |
| `3-lien-de-paiement.json` | Scénario n8n : ouvre le guichet de paiement |
| `4-paiement-et-code.json` | Scénario n8n : vérifie le paiement, signe le code, l'envoie |
| `fabriquer-cle-serveur.html` | Page à ouvrir une fois, pour créer la clé du serveur |
| `modeles-whatsapp.md` | Le texte des dix messages, à déposer chez Meta |
| `Clients.csv` | Les colonnes de la Google Sheet, dans le bon ordre |
| `fabriquer-scenarios.py` | Le script qui écrit les quatre scénarios (si on veut les modifier) |

Côté application, tout tient dans **un seul fichier**, `app/tunnel.js`. Tant qu'il
est vide, l'application se comporte exactement comme aujourd'hui : aucun écran en
plus, et **rien ne sort du téléphone**.

---

## Ce que ça coûte par mois

| Quoi | Prix | Remarque |
|---|---|---|
| n8n Cloud | à partir d'environ 15 000 F | ou gratuit si tu l'installes sur un petit serveur à toi (~3 000 F) |
| WhatsApp Cloud API | 1 000 messages d'un type par mois offerts, puis ~15 F le message utilitaire | dix messages par client sur un an : ~150 F par client |
| CinetPay | ~3 % du montant encaissé | 30 F sur un abonnement de 1 000 F |
| Google Sheet | gratuit | |

À 100 abonnés payant 1 000 F par mois : **100 000 F** encaissés, moins ~3 000 F de
commission, ~1 500 F de WhatsApp et ~3 000 F de serveur. Le tunnel se paie à partir
d'une vingtaine d'abonnés.

---

## Le montage, étape par étape

Compte une demi-journée la première fois. Fais-les **dans l'ordre** : chaque étape
a besoin de la précédente.

### Étape 1 · La Google Sheet

1. Va sur **sheets.google.com**, crée un nouveau tableau, appelle-le `Canari Clients`.
2. Renomme l'onglet du bas en **`Clients`** (le nom exact compte).
3. Ouvre `Clients.csv` de ce dossier, et recopie la **première ligne** dans la
   première ligne de ton tableau — une colonne par mot. Ou plus simple :
   *Fichier → Importer → Clients.csv → Remplacer la feuille*.
4. Dans l'adresse de la page, repère le long morceau entre `/d/` et `/edit` :
   c'est l'**identifiant de la Sheet**. Garde-le de côté.

Ce que veut dire chaque colonne :

| Colonne | Ce qu'elle contient |
|---|---|
| `canari_id` | le numéro Canari du téléphone (8 lettres et chiffres). **C'est la clé** : une ligne par téléphone |
| `telephone` | son WhatsApp, au format `225` + 10 chiffres |
| `nom`, `boutique`, `langue`, `email` | ce qu'il a donné |
| `date_inscription`, `fin_essai` | le début, et la fin du mois gratuit |
| `statut` | `essai` ou `paye` |
| `plan`, `date_expiration`, `total_paye` | ce qu'il a acheté, jusqu'à quand, combien en tout |
| `code_activation` | le dernier code envoyé (pour le retrouver s'il l'a perdu) |
| `derniere_transaction` | le dernier paiement traité — c'est ce qui empêche de compter deux fois |
| `dernier_message`, `dernier_envoi` | le dernier message envoyé, et quand |
| `stop` | écris `oui` dedans et Canari ne lui écrit plus jamais |

### Étape 2 · Le numéro WhatsApp d'entreprise

C'est l'étape la plus longue, et elle ne dépend pas de nous : c'est Meta qui décide.

1. **business.facebook.com** → crée un compte professionnel au nom de
   *Bridge Investment Partners*.
2. Ajoute le produit **WhatsApp** → *API*. Meta demande tes papiers d'entreprise
   (registre du commerce, déclaration fiscale) : tu les as déjà, ils sont dans
   `docs/informations-bip.md`.
3. Prends un numéro **qui n'est pas déjà dans WhatsApp**. Surtout pas le
   `05 84 37 48 48` : il sert aux demandes à la main et aux factures, et il serait
   perdu pour ça. Prends une puce neuve.
4. Note le **numéro de téléphone (phone number ID)** : un long nombre.
5. Crée un **token permanent** : *Paramètres de l'entreprise → Utilisateurs →
   Utilisateurs système* → nouvel utilisateur, rôle administrateur, autorisations
   `whatsapp_business_messaging` et `whatsapp_business_management` → *Générer un token*.
   **Choisis « n'expire jamais »**, sinon tout s'arrête dans 60 jours sans prévenir.
6. Dépose les dix messages de `modeles-whatsapp.md`. Attends qu'ils soient acceptés.

### Étape 3 · Le compte CinetPay

CinetPay est un encaisseur ivoirien : un seul branchement, et tu reçois Wave,
Orange Money, MTN et Moov.

1. **cinetpay.com** → crée ton compte marchand (mêmes papiers d'entreprise).
2. Dans le tableau de bord : note la **clé API** et le **site ID**.
3. Dis-lui où verser l'argent : ton compte Djamo entreprise, ou ton compte bancaire.

> Si CinetPay refuse ou traîne, le tunnel marche aussi avec un autre encaisseur
> (PayDunya, Semoa…) : il n'y a que le nœud « Ouvrir le guichet » et celui
> « Redemander à … » à changer dans les scénarios 3 et 4.

### Étape 4 · La clé du serveur

1. Ouvre `fabriquer-cle-serveur.html` dans le navigateur de ton **ordinateur**
   (pas du téléphone : c'est l'ordinateur qui servira à coller les clés).
2. Touche **« Fabriquer la clé du serveur »**.
3. **Enregistre le fichier de la clé** et mets-le à l'abri (e-mail, Drive).
4. Garde la page ouverte : tu vas copier les deux clés dans les étapes suivantes.

> La clé de ton téléphone (`gerant.html`) ne change pas. Elle continue de marcher :
> tu pourras toujours créer un code à la main, même si le serveur est éteint.

### Étape 5 · n8n

1. **n8n.io** → crée un compte (ou installe n8n sur un serveur à toi).
2. Note l'adresse de ton n8n, par exemple `https://canari.app.n8n.cloud`.
3. Connecte **Google Sheets** : *Credentials → New → Google Sheets OAuth2*.
4. Importe les quatre fichiers `.json` de ce dossier : dans n8n,
   *Workflows → Import from file*.
5. Dans **chacun** des quatre scénarios, remplace les mots en majuscules.
   Le plus simple : ouvre le nœud concerné, et cherche le mot.

| À remplacer | Par quoi | Où |
|---|---|---|
| `ID_DE_TA_GOOGLE_SHEET` | l'identifiant de l'étape 1 | tous les nœuds Google Sheets |
| `ID_NUMERO_WHATSAPP` | le phone number ID de l'étape 2 | nœuds « WhatsApp… » |
| `TOKEN_WHATSAPP_META` | le token permanent de l'étape 2 | nœuds « WhatsApp… » |
| `APIKEY_CINETPAY` | la clé API de l'étape 3 | scénarios 3 et 4 |
| `SITE_ID_CINETPAY` | le site ID de l'étape 3 | scénarios 3 et 4 |
| `https://TON-N8N.app.n8n.cloud` | l'adresse de ton n8n | scénario 3, nœud « Ouvrir le guichet » |
| `COLLE_ICI_LA_CLE_SECRETE` et les deux lignes autour | la **clé secrète** de l'étape 4 | scénario 4, nœud « Signer le code Canari » |

> Le mieux, pour le token et la clé API : ne les écris pas dans les nœuds, mets-les
> dans *Settings → Variables* de n8n et appelle-les `{{ $vars.WA_TOKEN }}`. Un
> scénario qu'on exporte pour en parler à quelqu'un ne contient alors aucun secret.

6. **Active** les quatre scénarios (le bouton en haut à droite).
7. Dans le scénario 1, ouvre le nœud « Inscription depuis l'app » et copie
   l'adresse de **Production URL**. Elle doit se terminer par
   `/webhook/canari-inscription`.

### Étape 6 · Allumer le tunnel dans l'application

Dans `app/tunnel.js`, en haut :

```js
const TUNNEL = {
  url: "https://canari.app.n8n.cloud",   // ← ton adresse n8n, SANS barre à la fin
  …
};
const CLE_SERVEUR = { kty: "EC", crv: "P-256", x: "…", y: "…" };   // ← la clé PUBLIQUE
```

Puis, dans `app/sw.js`, augmente le numéro de version (`canari-v68` → `canari-v69`),
sinon les téléphones garderont l'ancienne version. Publie, et c'est allumé.

---

## Vérifier que tout marche, avant d'en parler à quiconque

Fais-le sur **ton** téléphone, dans cet ordre. Si une étape rate, ne passe pas à la
suivante : c'est là qu'est le problème.

1. **L'inscription.** Efface Canari, réinstalle, refais le questionnaire. À
   l'avant-dernière question, réponds **« Oui, écris-moi »** et mets ton numéro.
   → une ligne apparaît dans la Google Sheet, et tu reçois le message de bienvenue.
2. **Le paiement.** Réglages ⚙ → Mon abonnement → choisis « 1 mois » →
   **Payer maintenant**. Le guichet CinetPay s'ouvre. Paie 1 000 F pour de vrai
   (tu les récupères, c'est ton compte).
3. **Le code.** Quelques secondes après, le code arrive sur WhatsApp. Touche le lien.
   → l'application dit « Merci ! », et ta facture est là.
4. **Pas deux fois.** Dans n8n, rejoue la dernière exécution du scénario 4
   (*Executions → la dernière → Retry*). → elle doit s'arrêter sur
   « Code à envoyer ? » et **ne rien renvoyer**.
5. **Les messages du matin.** Dans la Sheet, mets `date_inscription` à il y a
   3 jours et vide `dernier_message`. Dans n8n, lance le scénario 2 à la main
   (*Execute workflow*). → tu reçois le message J3, et la Sheet note `J3`.
6. **Le stop.** Écris `oui` dans la colonne `stop`. Relance le scénario 2.
   → tu ne reçois rien.

---

## Pourquoi c'est fait comme ça (les quatre choix qui comptent)

### 1. Le code est signé, pas calculé avec un mot de passe partagé

Le montage dont nous nous sommes inspirés fabriquait le code avec un secret
**écrit dans l'application** (un HMAC). Son propre mode d'emploi l'avouait :
« un développeur motivé pourrait le retrouver ». Et le jour où il le retrouve, il
fabrique des abonnements gratuits, pour lui et pour qui veut.

Canari fait autrement depuis le début : le code est **signé** (ECDSA P-256).
L'application ne porte que la clé **publique**, qui sait vérifier et rien d'autre.
Même en lisant tout le code de l'application, on ne peut pas fabriquer un code.
Le tunnel garde ce système — il ne le remplace pas.

### 2. Deux clés, pas une

Le serveur a sa **propre** clé, différente de celle de ton téléphone. Un serveur
est forcément plus exposé qu'un téléphone dans ta poche. Si le tien était un jour
percé, tu retires la clé serveur de `app/tunnel.js`, tu publies, et c'est fini :
ta clé à toi, intacte, continue de marcher et tu reprends à la main avec
`gerant.html`. Avec une seule clé, il aurait fallu tout refaire et tous les
abonnements déjà vendus auraient sauté.

### 3. Le code est attaché au téléphone qui a payé

Le numéro Canari du téléphone est **dans le texte signé**. Un commerçant qui
repartagerait son code n'abonne personne : l'application répond « Ce code est pour
un autre téléphone ». C'est pour ça que le lien de paiement porte le numéro Canari.

### 4. On ne croit jamais le navigateur

Après le paiement, le guichet ramène le commerçant sur l'application avec
`#paiement=ok`. Canari dit « c'est reçu, ton code arrive » — et **ne débloque rien**.
N'importe qui pourrait taper cette adresse à la main. Ce qui débloque, c'est le code
signé, et il n'est fabriqué qu'après que le serveur a **redemandé à CinetPay**
l'état de la transaction. La notification de CinetPay ne suffit pas non plus :
elle pourrait venir de quelqu'un d'autre.

---

## Ce que ça change pour la vie privée, et ce qu'il faut dire

Jusqu'ici, Canari pouvait dire : **tout reste sur ton téléphone**. Avec le tunnel,
ce n'est plus tout à fait vrai, et il faut le dire honnêtement — c'est écrit dans
`app/confidentialite.html` et dans l'écran d'accord.

Ce qui sort du téléphone, et seulement si le commerçant a répondu **oui** :

* son prénom, son numéro WhatsApp, le nom de sa boutique, sa langue ;
* son numéro Canari, la date de son premier jour et la fin de son essai ;
* quand il paie : la formule, le montant, et l'adresse e-mail s'il l'a donnée.

Ce qui ne sort **jamais**, même avec le tunnel allumé :

* aucune vente, aucune dépense, aucun montant de sa caisse ;
* aucun de ses clients, aucun numéro de ses clients, aucune de ses dettes ;
* aucun produit, aucun stock, aucune photo, aucun document.

Et il peut dire non : au questionnaire, ou à tout moment dans
Réglages ⚙ → *Rappels WhatsApp*. Dire non n'empêche pas de s'abonner — le bouton
« Payer maintenant » marche quand même, le numéro Canari suffit.

---

## Quand ça ne marche pas

| Ce qui se passe | Pourquoi, en général |
|---|---|
| Rien n'arrive dans la Sheet | Le scénario 1 n'est pas **activé**, ou `TUNNEL.url` a une barre `/` à la fin |
| « Numéro Canari absent » dans n8n | Le téléphone n'a pas envoyé son `id` : c'est que `app/tunnel.js` n'est pas à jour sur ce téléphone (regarde le numéro de version en bas des Réglages) |
| Le message WhatsApp ne part pas | Le modèle n'est pas encore accepté par Meta, ou le token a expiré (prends-en un permanent) |
| Le guichet s'ouvre mais le paiement échoue | Compte CinetPay pas encore validé, ou montant sous le minimum de l'opérateur |
| Le paiement passe, pas de code | Regarde *Executions* du scénario 4 : presque toujours la clé secrète mal collée dans « Signer le code Canari » |
| L'application refuse le code | La clé **publique** dans `app/tunnel.js` ne correspond pas à la clé **secrète** du serveur. Refais l'étape 4 en entier, les deux clés vont par paire |
| Le client reçoit deux fois le même message | La colonne `dernier_message` n'est pas écrite : vérifie que `canari_id` est bien la colonne de rapprochement du nœud « Noter l'envoi » |

---

## Ce qui reste à faire plus tard

* **Le « STOP » automatique** : un cinquième scénario sur les messages entrants
  (voir la fin de `modeles-whatsapp.md`). À faire avant d'avoir beaucoup d'abonnés.
* **La facture par e-mail, toute seule.** Aujourd'hui la facture est fabriquée sur
  le téléphone du commerçant et il l'envoie en un geste. Pour qu'elle parte toute
  seule, il faudrait la dessiner sur le serveur : c'est un cinquième scénario, et
  `app/emetteur.js` + `app/facture-abo.js` disent déjà exactement quoi écrire dessus.
* **Le parrainage.** « Fais installer Canari à un collègue, vous gagnez chacun un
  mois. » La Sheet peut déjà porter une colonne `parrain` ; il manque le code qui
  ajoute les jours aux deux.
* **Le tableau de bord des ventes** (combien d'installations, combien d'essais,
  combien se transforment en abonnés). Une deuxième feuille de la Sheet et quelques
  formules suffisent pour commencer.
