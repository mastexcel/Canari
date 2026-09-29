# Mettre Canari sur le Play Store

Tout ce qu'il faut, dans l'ordre. Suis les étapes une par une : **ne saute pas l'étape 2**, c'est elle qui décide de la date de lancement.

> ⚠️ **Google change souvent ses règles.** Les montants, les délais et les noms de boutons écrits ici sont ceux que je connais. Quand la page que tu as sous les yeux dit autre chose, **c'est elle qui a raison** — et préviens-moi, je corrige ce guide.

---

## Ce qui est déjà prêt

| Élément | Où | État |
|---|---|---|
| Icône 512 × 512 | `store/icone-512.png` | ✅ |
| Bannière 1024 × 500 | `store/banniere-1024x500.png` | ✅ |
| 5 captures d'écran 1080 × 1920 | `store/capture-1.png` → `capture-5.png` | ✅ |
| Politique de confidentialité | https://mastexcel.github.io/Canari/confidentialite.html | ✅ |
| Textes de la fiche | § 6 de ce guide | ✅ |
| Réponses au formulaire « Sécurité des données » | § 7 | ✅ |
| Fichier de vérification du domaine | `app/.well-known/assetlinks.json` | ⏳ il manque une empreinte, § 4 |
| Le fichier `.aab` de l'application | à fabriquer | ⏳ § 5 |

---

## 1. Créer le compte développeur

1. Va sur **play.google.com/console**, connecte-toi avec ton compte Google.
2. Choisis un compte **personnel** (pas « organisation » : ça demande un numéro d'entreprise vérifié, plus long).
3. Paie les **frais d'inscription** : environ **25 dollars une seule fois**, à vie. (≈ 15 000 F, à vérifier au taux du jour. **Il faut une carte bancaire** — le mobile money n'est pas accepté. Si tu n'en as pas, demande à quelqu'un de confiance de payer pour toi ; le compte reste à ton nom.)
4. **Vérification d'identité** : Google demande une pièce d'identité et une adresse. Compte quelques jours.

---

## 2. ⚠️ La règle qui décide de ta date de lancement

Pour un **compte personnel créé récemment**, Google demande, avant d'autoriser la publication au grand public :

> **12 personnes qui testent l'application, en test fermé, pendant 14 jours d'affilée.**

Ce n'est pas une punition, c'est la règle pour tout le monde. **À vérifier sur ta page** : Google fait évoluer ce chiffre et ce délai.

**La bonne nouvelle : ça tombe parfaitement.** Tes **10 commerçants du test terrain** (`docs/test-terrain.md`) sont exactement ces testeurs. Tu fais d'une pierre deux coups :

1. Tu trouves **12 personnes** (les 10 commerçants + toi + un proche).
2. Tu récupères **l'adresse Gmail de chacun** (obligatoire : c'est le compte Google qui reçoit l'accès).
3. Tu les inscris dans le test fermé.
4. Pendant ces 14 jours, ils utilisent vraiment l'appli → **tu as tes réponses de terrain en même temps**.
5. Au bout de 14 jours, tu demandes le passage en production.

**Donc : compte 3 semaines entre « je commence » et « c'est dans le Play Store ».** Commence à collecter les Gmail dès maintenant, c'est le vrai goulot d'étranglement.

---

## 3. Choisir l'adresse de l'application

Canari est une **application web installable**. Pour entrer dans le Play Store, elle est emballée dans une petite coquille Android qui ouvre ton site en plein écran, sans barre d'adresse. Pour que la barre d'adresse disparaisse, Google vérifie que **tu es bien le propriétaire du site**.

### Le problème à régler tout de suite

Ton appli est à `mastexcel.github.io/**Canari**/`, mais le fichier de vérification doit être à la **racine du domaine** :

```
https://mastexcel.github.io/.well-known/assetlinks.json
```

…et cette racine n'appartient pas au projet Canari. **Deux solutions :**

| | A. Gratuit, tout de suite | B. Nom de domaine à toi (conseillé) |
|---|---|---|
| Ce que tu fais | Créer un dépôt GitHub nommé exactement **`mastexcel.github.io`**, y mettre le fichier `.well-known/assetlinks.json` | Acheter un domaine (ex. `canari.ci`, `canari.app`) et le brancher sur GitHub Pages |
| Coût | 0 F | ~10 000 à 25 000 F par an selon l'extension |
| Adresse de l'appli | `mastexcel.github.io/Canari/` | `canari.ci` |
| Inconvénient | L'adresse fait « bricolage » ; si tu changes d'hébergeur un jour, l'appli du Play Store casse | Il faut payer et attendre 1 à 2 jours |

**Mon conseil : fais A pour les tests, et B avant le lancement public.** Un nom de domaine à toi, c'est aussi ce qui te permettra plus tard de changer d'hébergeur sans casser l'application déjà installée chez tes clients. Quand tu auras le domaine, dis-le-moi : je change deux lignes et on refabrique le fichier.

---

## 4. Vérifier le domaine (à faire après l'étape 5)

Le fichier `app/.well-known/assetlinks.json` est déjà écrit, il lui manque **une seule chose** : l'empreinte de la clé de signature.

1. Dans le Play Console : **Configuration → Intégrité de l'application → Signature d'application**.
2. Copie l'**empreinte du certificat SHA-256** (une longue suite de `AB:CD:EF:…`).
3. Colle-la dans `app/.well-known/assetlinks.json` à la place de `REMPLACER_PAR_L_EMPREINTE_SHA256_DONNEE_PAR_GOOGLE_PLAY`.
4. Mets ce fichier **à la racine du domaine** (solution A ou B de l'étape 3).

> Si tu oublies cette étape, l'application marche quand même, mais une **barre d'adresse** reste affichée en haut : ça fait « site web », pas « application ». Envoie-moi l'empreinte, je fais la modification.

---

## 5. Fabriquer le fichier `.aab`

Le Play Store veut un fichier `.aab`. Deux façons :

### Façon A — PWABuilder (la plus simple, aucun outil à installer)

1. Va sur **pwabuilder.com**.
2. Colle `https://mastexcel.github.io/Canari/` et lance l'analyse.
3. Choisis **Android → Google Play**, puis **Download**.
4. Tu reçois un dossier zip avec :
   - le fichier **`.aab`** → c'est lui qu'on envoie au Play Store,
   - le fichier **`signing.keystore`** (ou `.jks`) et son **mot de passe** → 🔑 **garde-les comme ta clé secrète d'abonnement : si tu les perds, tu ne pourras plus jamais mettre à jour l'application**,
   - le fichier **`assetlinks.json`** déjà rempli → utilise celui-là pour l'étape 4.

### Façon B — Depuis ce dépôt (pour les mises à jour suivantes)

Onglet **Actions** du dépôt → **« Fabriquer l'application Android »** → **Run workflow**. Le fichier apparaît en bas de la page dans **Artifacts**.

La toute première fois, la tâche fabrique une **clé de signature neuve** et te la donne à télécharger (`android.keystore`, `android.keystore.base64`, `mot-de-passe-de-la-cle.txt`). Tu la ranges en lieu sûr, puis tu crées deux secrets dans **Settings → Secrets and variables → Actions** :
- `ANDROID_KEYSTORE` = le contenu de `android.keystore.base64`
- `ANDROID_KEYSTORE_PASS` = le mot de passe

Ensuite, toutes les fabrications utiliseront cette même clé.

> ⚠️ **Cette tâche n'a encore jamais tourné pour de vrai** : mon ordinateur de travail n'a pas accès aux outils Android de Google. Sa première exécution se fera chez GitHub. Si elle échoue, envoie-moi le message d'erreur, je corrige. **En attendant, utilise la façon A.**

---

## 6. Les textes de la fiche (à copier-coller)

### Nom de l'application — 30 caractères maximum
```
Canari · Carnet de caisse
```

### Description courte — 80 caractères maximum
```
Ventes, dépenses, crédits clients. Ton bénéfice du jour. Sans internet.
```

### Description complète

```
Canari est le carnet de caisse de ta boutique, sur ton téléphone.

Tu notes tes ventes, tes dépenses et les crédits de tes clients en deux
secondes. Canari fait les calculs et te dit, à tout moment, combien tu as
vraiment gagné aujourd'hui.

CE QUE CANARI FAIT POUR TOI

• Ton bénéfice du jour, calculé tout seul
Ventes, prix de revient, charges et taxes : le vrai bénéfice, pas seulement
l'argent qui est passé dans ta main.

• Tu n'oublies plus qui te doit
Chaque crédit est noté au nom et au numéro du client. Tu vois d'un coup d'œil
qui doit quoi, et depuis combien de temps.

• Tu relances sans te fâcher
Le message est déjà écrit, en trois tons selon la situation. Tu l'envoies dans
la conversation WhatsApp du client, sans chercher dans tes contacts.

• Des factures et des reçus propres
Avec le nom et le logo de ta boutique. Envoyés directement au client sur
WhatsApp.

• L'argent de la boutique et celui de la maison, séparés
« Pris pour la maison » est compté à part : tu sais toujours ce qui reste
vraiment pour le commerce.

• Ton stock, sans le compter à la main
Il baisse à chaque vente, monte à chaque arrivage, et Canari te prévient
avant que ça manque.

• Un tableau de bord qui t'explique tes chiffres
Ce qui marche, ce qui coûte, quel produit te rapporte vraiment — et les trois
gestes à faire cette semaine.

• Tes chiffres, quand tu veux, où tu veux
Télécharge tout en Excel, en PDF ou en CSV, sur la période de ton choix. Pour
ton comptable, ta banque, ou simplement pour garder une trace.

FAIT POUR NOS RÉALITÉS

• Marche SANS INTERNET. Tout est enregistré sur ton téléphone.
• Léger et rapide, même sur un téléphone d'entrée de gamme.
• ZÉRO PUBLICITÉ. Jamais.
• Tes chiffres restent chez toi : ils ne partent sur aucun serveur.
• En français ou en anglais.
• Tu peux tout dire à la voix, si tu n'aimes pas écrire.
• Paiements notés par Wave, Orange Money, MTN, Moov ou Djamo.
• Franc CFA et douze autres monnaies d'Afrique.

ESSAI GRATUIT DE 3 MOIS

Tout est ouvert pendant 90 jours. Ensuite, l'abonnement coûte 1 000 F par mois,
ou 9 000 F l'année. Même sans abonnement, tu gardes l'accès à tous tes chiffres,
tu peux relancer tes clients, noter leurs remboursements et faire tes
sauvegardes : seules les nouvelles ventes demandent un abonnement.

Canari. Garde chaque franc.
```

### Catégorie et type
- Type d'application : **Application**
- Catégorie : **Finance** (ou « Entreprise » si tu préfères)
- Étiquettes : comptabilité, petite entreprise, facture, caisse

### Coordonnées
- E-mail : `mastexcel@gmail.com`
- Site web : `https://mastexcel.github.io/Canari/`
- Téléphone : `+225 05 84 37 48 48`
- **Politique de confidentialité** (obligatoire) : `https://mastexcel.github.io/Canari/confidentialite.html`

---

## 7. Le formulaire « Sécurité des données »

Google pose des questions sur ce que l'application fait des données. Pour Canari, les réponses sont simples et **elles sont toutes « non »** :

| Question | Réponse |
|---|---|
| L'application collecte-t-elle des données utilisateur ? | **Non** |
| L'application partage-t-elle des données avec des tiers ? | **Non** |
| Les données sont-elles chiffrées en transit ? | Sans objet (rien n'est envoyé) |
| L'utilisateur peut-il demander la suppression de ses données ? | **Oui** — il efface tout depuis Réglages → Repartir à zéro |

> **Pourquoi « non » à la collecte** : tout reste dans la mémoire du téléphone et ne part sur aucun serveur. Si un jour l'option « Demande à Canari » est branchée sur un vrai service d'intelligence artificielle, **il faudra revenir modifier ce formulaire** et la page de confidentialité.

### Classification du contenu
Réponds « non » à toutes les questions sur la violence, le sexe, la drogue, les jeux d'argent. Tu obtiendras **« Tout public »**.

### Public cible
Adultes (18 ans et plus). L'application n'est pas destinée aux enfants.

---

## 8. L'ordre à suivre

1. **Aujourd'hui** : crée le compte développeur (§ 1) et commence à **collecter les 12 adresses Gmail** (§ 2).
2. Fabrique le `.aab` avec PWABuilder (§ 5, façon A) et **range la clé de signature en lieu sûr**.
3. Dans le Play Console : crée l'application, remplis la fiche avec les textes du § 6, envoie l'icône, la bannière et les 5 captures.
4. Remplis « Sécurité des données » et la classification du contenu (§ 7).
5. Envoie le `.aab` dans un **test fermé** et ajoute tes 12 testeurs.
6. Récupère l'empreinte SHA-256 et publie `assetlinks.json` (§ 4) → la barre d'adresse disparaît.
7. **14 jours de test.** Pendant ce temps : le test terrain avec tes commerçants (`docs/test-terrain.md`).
8. Demande le passage en **production**. Compte encore quelques jours d'examen par Google.

---

## 9. Ce que tu dois garder précieusement

Trois choses. Si tu les perds, c'est très difficile à rattraper :

| Quoi | Pourquoi |
|---|---|
| 🔑 **La clé de signature Android** (`.keystore` + son mot de passe) | Sans elle, plus aucune mise à jour de l'application n'est possible |
| 🔑 **`cle-canari-SECRETE.json`** | Sans elle, tu ne peux plus créer de codes d'abonnement |
| 🔐 **Le compte Google du Play Console** | C'est lui qui possède l'application |

Range-les au même endroit, et fais-en une copie ailleurs (un deuxième téléphone, une clé USB, un e-mail à toi-même).

---

## 10. Après la publication

- **Les mises à jour** : chaque fois que je publie un changement, l'application installée chez tes clients se met à jour **toute seule** (c'est un site web emballé). Tu n'as besoin de renvoyer un `.aab` au Play Store que si l'icône, le nom ou les autorisations changent.
- **Les avis** : réponds-y depuis le Play Console. C'est là que tu apprendras le plus.
- **Le nom « Canari »** : il n'est pas encore déposé. Avant de faire de la publicité, fais la recherche d'antériorité et le dépôt à l'OAPI via l'OIPI (Abidjan-Plateau).
