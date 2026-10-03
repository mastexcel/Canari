# Les messages WhatsApp de Canari

WhatsApp n'autorise pas une entreprise à écrire ce qu'elle veut à qui elle veut.
Chaque message doit être **déposé à l'avance chez Meta**, qui le lit et l'accepte
(c'est long la première fois : compte un à trois jours). Après, le serveur
n'envoie que ces messages-là, en remplaçant les trous `{{1}}`, `{{2}}`…

Où les déposer : **business.facebook.com** → ton compte WhatsApp Business →
**Modèles de messages** → *Créer un modèle*.

Pour chacun : catégorie **Utilitaire** (pas « Marketing » : c'est moins cher et
accepté plus facilement), langue **Français** (et **Anglais** si tu veux servir
les deux : même nom de modèle, autre langue).

> Règle à ne pas oublier : ne promets jamais un gain. « Tu sauras ce que tu
> gagnes » est vrai ; « tu gagneras plus » ne l'est pas, et Meta refuse.

---

## 1. `canari_bienvenue` — à l'inscription

Trous : `{{1}}` le prénom · `{{2}}` la date de fin d'essai.

> Bonjour {{1}}, bienvenue dans Canari 🏺
>
> À partir d'aujourd'hui, note tes ventes et tes dépenses : Canari calcule ton
> bénéfice tout seul et se souvient de qui te doit de l'argent.
>
> C'est gratuit jusqu'au {{2}}.
>
> Un conseil pour commencer : note juste tes ventes pendant trois jours. Le reste viendra.

## 2. `canari_j1` — le lendemain

Trous : `{{1}}` le prénom.

> {{1}}, as-tu noté ta première vente ?
>
> Ouvre Canari, touche le gros bouton vert « Vente », tape le montant. C'est tout.
> Si le client n'a pas tout payé, écris ce qu'il a donné : Canari met le reste à son crédit.

## 3. `canari_j3` — au bout de trois jours

Trous : `{{1}}` le prénom.

> {{1}}, pense aussi à tes dépenses.
>
> Le transport, le courant, la marchandise que tu rachètes : si tu ne les notes pas,
> ton bénéfice est faux. Bouton rouge « Dépense ».
>
> Et quand tu prends de l'argent pour la maison, utilise « Pris pour la maison » :
> ce n'est pas une perte, c'est de l'argent qui change de poche.

## 4. `canari_j10` — au bout de dix jours

Trous : `{{1}}` le prénom.

> {{1}}, tes clients te doivent de l'argent ?
>
> Ouvre l'onglet **Relances**. Canari te dit qui relancer aujourd'hui et écrit le
> message à sa place — gentil, ferme, ou dernier rappel. Tu touches « Envoyer » et c'est parti.

## 5. `canari_j21` — au bout de trois semaines

Trous : `{{1}}` le prénom.

> {{1}}, regarde ton **Tableau de bord** (onglet Bilan).
>
> Tu y verras quels produits te rapportent vraiment, combien tu vends à crédit, et
> les trois choses que Canari te conseille de faire cette semaine.

## 6. `canari_essai_bientot` — trois jours avant la fin

Trous : `{{1}}` le prénom · `{{2}}` le nombre de jours restants.

> {{1}}, ton essai de Canari finit dans {{2}} jours.
>
> Après, tes chiffres ne sont **pas effacés** : tu peux toujours tout voir, relancer
> tes clients, noter les remboursements et faire ta sauvegarde. Seules les nouvelles
> ventes et dépenses demandent un abonnement.
>
> 1 mois 1 000 F · 3 mois 2 500 F · 1 an 9 000 F.
> Dans l'application : Réglages ⚙ → Mon abonnement → **Payer maintenant**.

## 7. `canari_essai_fini` — le jour où l'essai est fini

Trous : `{{1}}` le prénom.

> {{1}}, ton mois gratuit est fini.
>
> Rien n'est perdu : tout est encore là. Pour continuer à noter tes ventes,
> ouvre Réglages ⚙ → Mon abonnement → **Payer maintenant** (Wave, Orange Money,
> MTN ou Moov). L'abonnement s'active tout seul après le paiement.

## 8. `canari_code` — le code d'activation, après le paiement

Trous : `{{1}}` le prénom · `{{2}}` la date de fin · `{{3}}` le lien d'activation.

> Merci {{1}}, ton paiement est bien arrivé ✅
>
> Ton abonnement Canari va jusqu'au {{2}}.
>
> Touche ce lien pour l'activer : {{3}}
>
> Ta facture t'attend ensuite dans l'application (Mon abonnement → Mes factures).

> **Attention en déposant celui-ci** : Meta n'aime pas un lien dans un trou `{{ }}`
> au milieu du texte. Mets-le **sur sa propre ligne, à la fin**, comme ci-dessus.
> S'il est refusé, remplace la ligne par un bouton de type « Visiter le site web »
> avec une adresse dynamique.

## 9. `canari_renouvellement` — trois jours avant la fin de l'abonnement

Trous : `{{1}}` le prénom · `{{2}}` le nombre de jours restants.

> {{1}}, ton abonnement Canari finit dans {{2}} jours.
>
> Pour continuer sans coupure : Réglages ⚙ → Mon abonnement → **Payer maintenant**.
> Les jours payés s'ajoutent à ceux qui te restent, tu ne perds rien.

## 10. `canari_abonnement_fini` — le lendemain de la fin

Trous : `{{1}}` le prénom.

> {{1}}, ton abonnement Canari est fini depuis hier.
>
> Tes chiffres sont intacts et le resteront. Quand tu veux reprendre :
> Réglages ⚙ → Mon abonnement → **Payer maintenant**.

---

## Comment quelqu'un arrête de recevoir ces messages

WhatsApp impose qu'on puisse dire stop. Deux chemins, et les deux doivent marcher :

1. **dans l'application** : Réglages ⚙ → *Rappels WhatsApp* → décocher. Le
   téléphone prévient le serveur ;
2. **en répondant « STOP »** sur WhatsApp. Là, c'est à toi d'écrire `oui` dans la
   colonne `stop` de la ligne du client dans la Google Sheet : le scénario 2
   saute toutes les lignes où cette colonne n'est pas vide.

Si tu veux que ça se fasse tout seul, il faut un cinquième scénario branché sur le
webhook des messages entrants de Meta. Ce n'est pas indispensable pour commencer,
mais il faudra le faire avant d'avoir beaucoup d'abonnés : un « STOP » ignoré, ce
sont des signalements, et un numéro WhatsApp signalé est bloqué par Meta.
