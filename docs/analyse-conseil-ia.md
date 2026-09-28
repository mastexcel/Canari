# Option « Demande à Canari » : combien ça coûte, combien le facturer

Le propriétaire veut une option où le commerçant **discute avec une intelligence artificielle** de son activité, et il veut **la facturer** en restant rentable. Voici les chiffres, puis la proposition.

---

## 1. Ce qui est déjà fait dans l'appli

L'écran **« Demande à Canari »** existe (`app/conseil.js`). Il fonctionne dès aujourd'hui, avec deux façons de répondre :

| | Comment | Coût par question | Marche sans internet |
|---|---|---|---|
| **Aujourd'hui** | Canari répond avec **tes chiffres** : il reconnaît les questions courantes (qui me doit, est-ce que je gagne, quel produit rapporte, combien vendre, puis-je investir, mon stock, comment vendre plus…) et construit la réponse depuis le tableau de bord. | **0 F** | **Oui** |
| **Quand le serveur sera prêt** | La question part vers **le petit serveur du propriétaire**, avec un résumé chiffré de la boutique. Le serveur interroge l'IA et renvoie la réponse. | voir § 2 | Non (mais Canari retombe automatiquement sur ses réponses locales) |

L'option est **payante dans les deux cas** : c'est le conseil qu'on vend, pas la technique. **5 questions sont offertes** pour essayer.

**Pourquoi un serveur est obligatoire pour la vraie IA** : la clé qui donne accès à l'IA ne peut pas être mise dans l'appli. N'importe qui pourrait l'extraire en 5 minutes et dépenser l'argent du propriétaire. Le serveur garde la clé, **et c'est lui qui compte les questions** — le compteur de l'appli peut être trafiqué par un utilisateur malin, celui du serveur non.

---

## 2. Ce que coûte une question à l'IA

### Le prix des modèles (tarifs Anthropic, API directe)

| Modèle | Entrée (1 million de mots-jetons) | Sortie (1 million) |
|---|---|---|
| **Claude Haiku 4.5** | 1,00 $ | 5,00 $ |
| Claude Sonnet 5 | 2,00 $ | 10,00 $ |
| Claude Opus 5 | 5,00 $ | 25,00 $ |

*Un « mot-jeton » (token) vaut à peu près trois quarts de mot en français.*

### Ce qu'une question de commerçant consomme

| | Mots-jetons |
|---|---|
| Les consignes données à l'IA (comment répondre, en français simple, court) | ~500 |
| Le résumé chiffré de la boutique (ventes, marge, crédits, stock, produits…) | ~700 |
| Les 3 derniers échanges gardés en mémoire | ~400 |
| La question elle-même | ~30 |
| **Total entrée** | **~1 630** |
| **La réponse** | **~250** |

### Le coût, par question

- **Haiku 4.5** : 1 630 × 1 $/M + 250 × 5 $/M = **0,0029 $** ≈ **1,7 F CFA**
- **Sonnet 5** : **0,0058 $** ≈ **3,5 F CFA**

> **Hypothèse à vérifier** : 1 dollar ≈ 600 F CFA. Le franc CFA est fixe par rapport à l'euro (655,957 F = 1 €), mais **pas** par rapport au dollar : ce taux bouge. À revérifier avant de fixer le prix définitif.

**Choix conseillé : Haiku 4.5.** Les questions d'un carnet de caisse sont simples (lire des chiffres, donner un conseil court). Haiku suffit largement, et coûte 2 fois moins que Sonnet. On garde Sonnet en réserve si les réponses déçoivent sur le terrain.

### Ce que ça fait par mois et par commerçant

| Usage | Questions / mois | Coût IA / mois |
|---|---|---|
| Léger (2 ou 3 par semaine) | 10 | **17 F** |
| Normal (1 par jour) | 30 | **51 F** |
| Gros utilisateur | 100 | **170 F** |

---

## 3. Les autres coûts

| Poste | Coût mensuel | Remarque |
|---|---|---|
| Le petit serveur | **0 à 3 000 F** | Une offre gratuite suffit au début (quelques milliers de questions par mois). Un petit serveur payant coûte 3 000 à 6 000 F. |
| Frais de paiement mobile | ~2 % | Environ 10 F sur 500 F encaissés. |
| Ton temps | — | Tu crées déjà le code à la main : 10 secondes par client. |

Le serveur est un **coût fixe** : il ne dépend pas du nombre de clients. C'est lui qui décide combien d'abonnés il faut pour être rentable.

---

## 4. Le prix proposé

**500 F par mois**, avec une limite d'usage correct de **100 questions par mois**.

| Formule | Prix | Par mois |
|---|---|---|
| 1 mois | **500 F** | 500 F |
| 3 mois | **1 200 F** | 400 F |
| **1 an** | **4 000 F** | **333 F** (conseillé) |

### Pourquoi ce niveau

1. **C'est la moitié de l'abonnement.** Canari coûte 1 000 F par mois. Une option à 500 F se comprend tout de suite : « la moitié en plus pour avoir un conseiller ». Au-dessus, le commerçant compare au prix de l'appli entière et recule.
2. **La marge est large même chez le gros utilisateur.** Voir le tableau ci-dessous.
3. **Des montants ronds**, faciles à envoyer par mobile money.
4. **L'année est mise en avant** : elle rapporte 4 000 F d'un coup et évite les arrêts.

### La marge, vérifiée

Pour un abonné à 500 F par mois :

| | Usage normal (30 questions) | Gros utilisateur (100 questions) |
|---|---|---|
| Encaissé | 500 F | 500 F |
| Coût IA | − 51 F | − 170 F |
| Part du serveur (50 abonnés) | − 60 F | − 60 F |
| Frais de paiement | − 10 F | − 10 F |
| **Marge** | **379 F (76 %)** | **260 F (52 %)** |

**Le seuil de rentabilité** : avec un serveur à 3 000 F par mois et une marge moyenne de ~370 F, il faut **9 abonnés Conseil** pour que l'option se paie toute seule. Au-delà, tout est bénéfice. Avec une offre serveur gratuite au début, le seuil est **1 abonné**.

### La limite de 100 questions

Elle protège contre le seul vrai risque : celui qui pose 500 questions par mois coûterait 850 F pour 500 F encaissés. Au-delà de 100, Canari répond avec ses réponses locales (gratuites) et propose d'attendre le mois suivant. **Cette limite doit être comptée par le serveur**, pas par l'appli.

En pratique, très peu de gens atteindront 100 : un commerçant pose beaucoup de questions la première semaine, puis une ou deux par semaine.

---

## 5. L'autre chemin : tout mettre dans un seul prix

Au lieu d'une option séparée, une formule unique **« Canari Plus » à 1 500 F par mois** (au lieu de 1 000 F), conseil compris.

| | Option séparée à 500 F | Canari Plus à 1 500 F |
|---|---|---|
| Plus simple à expliquer | Non (deux prix, deux codes) | **Oui** (un seul prix) |
| Revenu par client | 1 000 F + 500 F **seulement chez ceux qui prennent l'option** | 1 500 F chez **tous** ceux qui passent à Plus |
| Risque | Peu de gens prennent l'option | Certains refusent l'augmentation et restent à 1 000 F |
| Qui décide | Le client choisit | Toi, au moment du renouvellement |

**Ma recommandation : commencer par l'option séparée à 500 F.** Raison simple : tu ne sais pas encore si les commerçants veulent ce conseil. L'option te le dira sans risquer ton abonnement de base. Si plus d'un client sur trois prend l'option, alors il faut fusionner en « Canari Plus » — à ce moment-là c'est la bonne décision, et elle rapporte plus.

---

## 6. Ce qu'il reste à faire pour la vraie IA

1. **Vérifier le taux dollar / franc CFA** du jour et refaire le calcul du § 2.
2. **Ouvrir un compte** chez le fournisseur d'IA et prendre une clé.
3. **Installer le petit serveur.** Il fait trois choses, et rien d'autre :
   - il reçoit `{ numéro Canari, question, résumé chiffré, 3 derniers échanges }` ;
   - il vérifie que ce numéro Canari a bien payé l'option, et qu'il n'a pas dépassé 100 questions ce mois-ci ;
   - il pose la question à l'IA avec la clé, et renvoie `{ reponse }`.
4. **Mettre un plafond de dépense** chez le fournisseur d'IA (par exemple 20 000 F par mois au début). C'est le filet de sécurité : même en cas de bug ou d'abus, la perte est bornée.
5. **Remplir `RELAIS.url`** dans `app/conseil.js` avec l'adresse du serveur. L'appli s'en sert automatiquement, et retombe sur ses réponses locales dès qu'il n'y a pas de réseau.

Tant que l'étape 5 n'est pas faite, l'option se vend et fonctionne avec les réponses locales — qui coûtent **0 F** et marchent **sans internet**, ce qui n'est pas un petit avantage à Abidjan.

---

## 7. À vérifier sur le terrain

Pendant le test avec les 10 commerçants (`docs/test-terrain.md`), ajoute **deux questions** :

1. Montre-leur l'écran « Demande à Canari » et laisse-les poser **une vraie question**. Note laquelle. *(C'est la question la plus précieuse de tout le test : elle dit ce que l'IA devra savoir répondre.)*
2. « Après les 5 questions offertes, c'est 500 F par mois. Tu prendrais ? » → note la **première réaction**.

Si moins de 2 sur 10 disent oui, le problème n'est pas le prix : c'est que le conseil ne leur paraît pas utile. Dans ce cas, on garde les réponses locales gratuites dans l'abonnement, et on abandonne l'option payante. C'est aussi une bonne décision.
