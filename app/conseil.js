/* =====================================================================
   DEMANDE À CANARI  ·  l'option Conseil (payante)
   ---------------------------------------------------------------------
   Le commerçant pose une question sur son activité et reçoit une
   réponse tirée de SES chiffres, pour décider quoi faire.

   Deux façons de répondre, dans cet ordre :

   1. LE RELAIS (vraie IA). Si le propriétaire a installé son petit
      serveur et rempli RELAIS.url, la question part là-bas avec un
      résumé chiffré de la boutique, et la réponse revient. La clé de
      l'IA reste sur SON serveur : elle n'est jamais dans l'appli, donc
      personne ne peut la voler ni dépenser son argent. C'est aussi le
      serveur qui compte les questions (le compteur de l'appli, lui,
      peut être trafiqué). Voir docs/analyse-conseil-ia.md.

   2. LES RÉPONSES DE CANARI (sans internet). Canari reconnaît les
      questions courantes et répond avec les chiffres du tableau de
      bord. Ça marche sans connexion et ne coûte rien.

   L'option est payante : elle s'active avec un code signé dont les
   jours commencent par « C » (voir abonnement.js). Cinq questions sont
   offertes pour essayer.
   ===================================================================== */

// À remplir par le propriétaire quand son serveur est prêt.
// Le serveur reçoit { question, resume, historique, id } et répond { reponse }.
const RELAIS = {
  url: "",          // ex. "https://conseil.canari.ci/question"
  essaisOfferts: 5  // questions gratuites avant de devoir payer
};

const FORMULES_CONSEIL = [
  { id: "mois", nom: "1 mois", jours: 31, prix: 500 },
  { id: "trimestre", nom: "3 mois", jours: 92, prix: 1200 },
  { id: "an", nom: "1 an", jours: 366, prix: 4000, conseil: true }
];

let conversation = []; // { qui: "moi" | "canari", texte }

/* ---------- L'état de l'option ---------- */

function etatConseil() {
  const a = donnees.abonnement;
  const t = maintenantAbonnement();
  const fin = a.conseil || 0;
  const restant = Math.max(0, RELAIS.essaisOfferts - (a.essaisConseil || 0));
  return {
    paye: fin > t,
    fin: fin,
    reste: Math.max(0, Math.ceil((fin - t) / JOUR)),
    essais: restant,
    ouvert: fin > t || restant > 0
  };
}

/* ---------- Le résumé chiffré envoyé à l'IA ---------- */

// Tout ce que l'IA a besoin de savoir, en peu de mots : c'est ce qui
// coûte le plus cher par question, donc on reste court et précis.
function resumeBoutique() {
  const r = indicateurs();
  const B = donnees.boutique;
  const l = [];
  const f = function (n) { return nombre(n) + " " + deviseCourante.code; };
  l.push("Boutique : " + (B.nom || "sans nom") + ". Monnaie : " + deviseCourante.code + ".");
  l.push("Période regardée : " + r.periode.detail + ".");
  l.push("Ventes : " + f(r.vendu) + ", dont " + f(r.aCredit) + " à crédit.");
  l.push("Prix de revient : " + f(r.cout) + ". Marge brute : " + f(r.margeBrute) +
    (r.tauxMarge !== null ? " (" + r.tauxMarge + " %)" : "") + ".");
  l.push("Bénéfice net : " + f(r.benefice) + (r.tauxNet !== null ? " (" + r.tauxNet + " %)" : "") +
    ", soit " + f(r.beneficeParJour) + " par jour de vente.");
  l.push("Argent entré : " + f(r.recettes) + ". Argent sorti : " + f(r.sorties) + ".");
  l.push("Argent en caisse maintenant : " + f(r.caisse) + ".");
  if (r.seuil) l.push("Seuil de rentabilité : " + f(r.seuil) + " de ventes par jour, dépassé " + r.joursAuSeuil + " jours sur " + r.joursNotes + ".");
  l.push("On lui doit " + f(r.onMeDoit) + " (" + r.nbClientsDoivent + " clients, " + r.ageCredits + " jours en moyenne, " + r.aRelancer + " à relancer).");
  l.push("Il doit " + f(r.jeDois) + " à ses fournisseurs.");
  l.push("Valeur du stock : " + f(r.valeurStock) + (r.joursDeStock !== null ? " (" + r.joursDeStock + " jours de vente)" : "") + ".");
  if (r.materiel) l.push("Matériel : " + f(r.materiel) + " de valeur restante, usure " + f(r.usureJour) + " par jour.");
  l.push("Il peut investir sans risque : " + f(r.capacite) + ".");
  if (r.postes.length) {
    l.push("Où part l'argent : " + r.postes.slice(0, 4).map(function (p) {
      return p.nom + " " + f(p.valeur);
    }).join(", ") + ".");
  }
  if (r.produitsCA.length) {
    l.push("Meilleurs produits (chiffre d'affaires) : " + r.produitsCA.slice(0, 5).map(function (p) {
      return p.nom + " " + f(p.vendu) + " (marge " + f(p.marge) + ")";
    }).join(", ") + ".");
  }
  if (r.produitsPerte.length) {
    l.push("Produits vendus à perte ou sans marge : " + r.produitsPerte.map(function (p) { return p.nom; }).join(", ") + ".");
  }
  const bas = produitsARacheter().map(function (p) { return p.nom; });
  if (bas.length) l.push("À racheter : " + bas.slice(0, 8).join(", ") + ".");
  l.push("Meilleur jour de la semaine : " + ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][r.meilleurJour] + ".");
  return l.join("\n");
}

/* ---------- Les réponses de Canari, sans internet ---------- */

// Chaque sujet : des mots qui le déclenchent, et la réponse construite
// à partir des chiffres. Le premier sujet qui a assez de mots gagne.
function sujetsConseil() {
  const r = indicateurs();
  const f = franc;
  const nomJour = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][r.meilleurJour];
  return [
    { mots: ["doit", "doivent", "crédit", "credit", "dette client", "relance", "relancer", "impayé"],
      quoi: function () {
        if (!r.onMeDoit) return ["Personne ne te doit d'argent en ce moment. C'est le meilleur endroit où être."];
        const c = clientsQuiDoivent()[0];
        return [
          "Tes clients te doivent " + f(r.onMeDoit) + ", répartis sur " + pluriel(r.nbClientsDoivent, "personne") +
            ", depuis " + pluriel(r.ageCredits, "jour") + " en moyenne.",
          "Le plus gros est " + c.nom + " avec " + f(c.du) + ".",
          r.aRelancer
            ? pluriel(r.aRelancer, "client") + " à relancer aujourd'hui : va dans l'onglet Relances, le message est déjà écrit."
            : "Personne n'est en retard pour l'instant."
        ];
      } },
    { mots: ["fournisseur", "grossiste", "je dois", "dette"],
      quoi: function () {
        return r.jeDois
          ? ["Tu dois " + f(r.jeDois) + " à tes fournisseurs.",
             "Avec " + f(r.caisse) + " en caisse, paie d'abord le plus ancien : c'est lui qui te fera encore crédit demain."]
          : ["Tu ne dois rien à tes fournisseurs.",
             "Tu es libre de négocier un prix comptant, souvent moins cher."];
      } },
    { mots: ["gagne", "gagné", "bénéfice", "benefice", "bénef", "profit", "rapporte combien"],
      quoi: function () {
        if (r.tauxNet === null) return ["Je n'ai pas encore assez de ventes notées pour te dire ce que tu gagnes."];
        return [
          r.benefice >= 0
            ? "Tu gagnes " + f(r.benefice) + " sur " + r.periode.detail + ", soit " + f(r.beneficeParJour) + " par jour de vente."
            : "Tu perds " + f(Math.abs(r.benefice)) + " sur " + r.periode.detail + ".",
          "Ça fait " + pourcent(r.tauxNet) + " de tes ventes.",
          r.tauxNet < 5 ? "C'est trop mince : regarde d'abord tes trois plus grosses dépenses, puis tes prix."
            : r.tauxNet < 15 ? "Ça passe, mais sans marge de sécurité : un mois creux et tu es dans le rouge."
            : "C'est solide. Mets une part de côté chaque semaine."
        ];
      } },
    { mots: ["caisse", "argent disponible", "liquide", "espèces", "combien j'ai"],
      quoi: function () {
        return [
          "Tu as " + f(r.caisse) + " en caisse.",
          "En comptant ta marchandise (" + f(r.valeurStock) + "), ce qu'on te doit (" + f(r.onMeDoit) +
            ") et ce que tu dois (" + f(r.jeDois) + "), ta boutique vaut " + f(r.tresorerie) + "."
        ];
      } },
    { mots: ["investir", "acheter", "congélateur", "congelateur", "moto", "machine", "matériel", "materiel", "agrandir", "boutique deux"],
      quoi: function () {
        return r.capacite > 0
          ? ["Tu peux sortir jusqu'à " + f(r.capacite) + " sans mettre la boutique en danger, après avoir gardé de quoi payer tes fournisseurs et un mois de charges.",
             "Avant d'acheter, pose-toi la seule question qui compte : combien ça me fera gagner par jour, et en combien de jours c'est remboursé ?"]
          : ["Pas maintenant : tes dettes (" + f(r.jeDois) + ") et tes charges passent avant.",
             "Fais-toi d'abord payer les " + f(r.onMeDoit) + " qu'on te doit : c'est ton investissement le plus rentable."];
      } },
    { mots: ["produit", "rapporte le plus", "meilleur produit", "vendre quoi", "marche bien", "stock quoi"],
      quoi: function () {
        if (!r.produits.length) {
          return ["Tu notes tes ventes au montant, sans produits.",
                  "Ajoute tes produits dans l'onglet Stock : je pourrai te dire lesquels te rapportent vraiment."];
        }
        const meilleur = r.produits[0], gros = r.produitsCA[0];
        const phrases = ["C'est " + meilleur.nom + " qui te rapporte le plus : " + f(meilleur.marge) + " de marge."];
        if (gros.nom !== meilleur.nom) {
          phrases.push(gros.nom + " fait le plus gros chiffre (" + f(gros.vendu) + ") mais rapporte moins.");
        }
        phrases.push(r.produitsPerte.length
          ? "Attention : " + r.produitsPerte.map(function (p) { return p.nom; }).join(", ") +
            " ne te rapporte rien, ou te fait perdre. Vérifie le prix d'achat et le prix de vente."
          : "Mets-les devant, et n'en manque jamais.");
        return phrases;
      } },
    { mots: ["perte", "perds", "pourquoi je ne gagne", "ça ne marche pas", "problème", "difficulté"],
      quoi: function () {
        const gros = r.postes.length ? r.postes[0] : null;
        return [
          "Ta marge brute est de " + pourcent(r.tauxMarge) + ".",
          gros ? "Ton plus gros poste de sortie, c'est " + gros.phrase + " : " + f(gros.valeur) + "." : "",
          r.tauxMarge !== null && r.tauxMarge < 15 ? "Le problème est d'abord tes prix : tu achètes trop cher ou tu vends trop bas."
            : r.partCredit !== null && r.partCredit > 40 ? "Le problème est le crédit : une trop grosse part de tes ventes n'est pas payée tout de suite."
            : r.joursDeStock !== null && r.joursDeStock > 30 ? "Le problème est ton stock : trop de marchandise dort, et avec elle ton argent."
            : "Rien d'alarmant. Regarde la carte « Ce que je ferais à ta place » dans le tableau de bord."
        ].filter(Boolean);
      } },
    { mots: ["combien vendre", "seuil", "objectif", "aujourd'hui", "par jour"],
      quoi: function () {
        return r.seuil
          ? ["Vends au moins " + f(r.seuil) + " par jour pour couvrir tes charges.",
             "Tu y es arrivé " + r.joursAuSeuil + " jours sur les " + r.joursNotes + " derniers.",
             "En dessous, ta journée ne paie même pas ton loyer."]
          : ["Je ne connais pas encore tes charges.",
             "Ajoute ton loyer et tes taxes dans Réglages → Mes charges, et je te dirai combien vendre chaque jour."];
      } },
    { mots: ["stock", "racheter", "manque", "rupture", "commander"],
      quoi: function () {
        const bas = produitsARacheter().map(function (p) { return p.nom; });
        return [
          bas.length ? "À racheter en priorité : " + bas.slice(0, 6).join(", ") + "." : "Ton stock est bon, rien ne manque.",
          "Tu as " + f(r.valeurStock) + " de marchandise" +
            (r.joursDeStock !== null ? ", de quoi tenir " + pluriel(r.joursDeStock, "jour") + "." : "."),
          r.joursDeStock !== null && r.joursDeStock > 30
            ? "C'est beaucoup : achète plus souvent, en plus petite quantité." : ""
        ].filter(Boolean);
      } },
    { mots: ["vendre plus", "plus de clients", "augmenter", "développer", "developper", "croître", "grandir"],
      quoi: function () {
        return [
          "Trois leviers, du plus rapide au plus lent.",
          "Un : ton meilleur jour est le " + nomJour + " (" + f(r.semaine[r.meilleurJour]) + " en moyenne), fais ton stock la veille.",
          "Deux : ton panier moyen est de " + f(r.panier) + ", propose toujours un petit produit en plus au moment de payer.",
          "Trois : récupère les " + f(r.onMeDoit) + " qu'on te doit, c'est de l'argent déjà gagné qui dort dehors."
        ];
      } },
    { mots: ["maison", "famille", "personnel", "moi-même"],
      quoi: function () {
        return r.maison
          ? ["Tu as pris " + f(r.maison) + " pour la maison sur " + r.periode.detail + ".",
             "Il te reste " + f(r.benefice - r.maison) + " de bénéfice pour la boutique.",
             "Fixe-toi une somme fixe par semaine : c'est le seul moyen de ne pas manger le fonds de commerce."]
          : ["Tu n'as rien pris pour la maison sur cette période.",
             "Pense à te payer : un commerçant qui ne se paie pas finit par puiser sans compter."];
      } }
  ];
}

// Trouve le sujet qui correspond le mieux à la question, et traduit chaque
// phrase séparément (la bulle est en translate="no" : voir i18n.js).
function repondreLocalement(question) {
  const q = " " + question.toLowerCase()
    .replace(/[àâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[îï]/g, "i").replace(/[ôö]/g, "o").replace(/[ûü]/g, "u")
    .replace(/[^a-z0-9' ]+/g, " ") + " ";
  let meilleur = null, meilleurScore = 0;
  sujetsConseil().forEach(function (s) {
    let score = 0;
    s.mots.forEach(function (m) {
      const cle = m.replace(/[àâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[îï]/g, "i").replace(/[ôö]/g, "o").replace(/[ûü]/g, "u");
      if (q.indexOf(" " + cle) !== -1 || q.indexOf(cle + " ") !== -1) score += cle.length;
    });
    if (score > meilleurScore) { meilleurScore = score; meilleur = s; }
  });
  const phrases = meilleur ? meilleur.quoi() : [
    "Je n'ai pas compris la question.",
    "Sans internet, je sais répondre sur : ce qu'on te doit, ce que tu dois, ce que tu gagnes, ta caisse, " +
      "ce que tu peux investir, tes meilleurs produits, combien vendre par jour, ton stock, et comment vendre plus."
  ];
  return phrases.map(function (p) { return tr(p); }).join(" ");
}

/* ---------- Poser la question ---------- */

function poserQuestion(question) {
  const e = etatConseil();
  if (!e.ouvert) { ouvrirConseil(); return; }
  if (!e.paye) {
    donnees.abonnement.essaisConseil = (donnees.abonnement.essaisConseil || 0) + 1;
    sauver();
  }
  conversation.push({ qui: "moi", texte: question });
  dessinerConversation(true);
  $("conseil-champ").value = "";

  const fini = function (texte) {
    conversation.push({ qui: "canari", texte: texte });
    // Prévenir avant que les questions offertes soient épuisées : personne
    // n'aime voir une porte se fermer sans avertissement.
    const apres = etatConseil();
    if (!apres.paye && apres.essais === 0) {
      conversation.push({ qui: "canari", texte: tr("C'était ta dernière question offerte.") + " " +
        tr("Pour continuer à me poser des questions, prends l'option Conseil : touche « Demande à Canari » dans les Réglages.") });
    }
    dessinerConversation();
    if (prefsVoix().lecture) parler(texte);
  };

  // Avec le serveur du propriétaire : la vraie IA. Sinon, les réponses de Canari.
  if (RELAIS.url && navigator.onLine) {
    conversation.push({ qui: "canari", texte: "…", attente: true });
    dessinerConversation();
    const controle = new AbortController();
    const minuteur = setTimeout(function () { controle.abort(); }, 20000);
    fetch(RELAIS.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controle.signal,
      body: JSON.stringify({
        id: donnees.abonnement.id,
        langue: LANGUE,
        question: question,
        resume: resumeBoutique(),
        historique: conversation.filter(function (m) { return !m.attente; }).slice(-6)
          .map(function (m) { return { qui: m.qui, texte: m.texte }; })
      })
    }).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(String(r.status))); })
      .then(function (d) {
        clearTimeout(minuteur);
        conversation.pop();
        fini(d && d.reponse ? String(d.reponse) : repondreLocalement(question));
      })
      .catch(function () {
        clearTimeout(minuteur);
        conversation.pop();
        fini(repondreLocalement(question));
      });
    return;
  }
  fini(repondreLocalement(question));
}

/* ---------- L'écran ---------- */

const QUESTIONS_TOUTES_PRETES = [
  "Qui me doit de l'argent ?",
  "Est-ce que je gagne vraiment ?",
  "Quel produit me rapporte le plus ?",
  "Combien je dois vendre aujourd'hui ?",
  "Est-ce que je peux acheter un congélateur ?",
  "Comment vendre plus ?"
];

function dessinerConversation(versLeBas) {
  const liste = $("conseil-fil");
  liste.innerHTML = conversation.map(function (m) {
    return '<li class="bulle bulle-' + (m.qui === "moi" ? "moi" : "canari") + (m.attente ? " attente" : "") + '" translate="no">' +
      echapper(m.texte).replace(/\n/g, "<br>") + '</li>';
  }).join("");
  $("conseil-vide").hidden = conversation.length > 0;
  // Les questions toutes prêtes encombrent une fois la conversation lancée.
  $("conseil-suggestions").hidden = conversation.length >= 4;
  if (versLeBas !== false) liste.scrollTop = liste.scrollHeight;
  const e = etatConseil();
  $("conseil-reste").hidden = e.paye || !e.ouvert;
  if (!e.paye && e.ouvert) {
    $("conseil-reste").textContent = e.essais === 1
      ? "Il te reste 1 question offerte."
      : "Il te reste " + e.essais + " questions offertes.";
  }
}

function ouvrirConseil() {
  const e = etatConseil();
  $("conseil-offre").hidden = e.ouvert;
  $("conseil-chat").hidden = !e.ouvert;
  if (e.ouvert) {
    $("conseil-etat").textContent = e.paye
      ? "Option Conseil active jusqu'au " + dateFin(e.fin) + "."
      : "Essai : " + pluriel(e.essais, "question") + " offerte" + (e.essais > 1 ? "s" : "") + ".";
    $("conseil-suggestions").innerHTML = QUESTIONS_TOUTES_PRETES.map(function (q) {
      return '<button type="button" class="suggestion" data-question="' + echapper(q) + '">' + q + '</button>';
    }).join("");
    $("conseil-source").textContent = RELAIS.url
      ? "Canari répond avec tes chiffres, et pose la question à l'intelligence artificielle quand tu as internet."
      : "Canari répond avec tes chiffres, même sans internet.";
    dessinerConversation();
  } else {
    $("conseil-formules").innerHTML = FORMULES_CONSEIL.map(function (f) {
      return '<button type="button" class="choix-carte conseil-formule" data-formule-conseil="' + f.id + '">' +
        (f.conseil ? '<span class="abo-conseil">Conseillé</span>' : '') +
        '<b>' + f.nom + '</b><span class="abo-prix">' + francCFA(f.prix) + '</span></button>';
    }).join("");
    choisirFormuleConseil("an");
  }
  montrer("conseil");
}

let formuleConseilChoisie = "an";
function choisirFormuleConseil(id) {
  formuleConseilChoisie = id;
  const f = FORMULES_CONSEIL.find(function (x) { return x.id === id; });
  document.querySelectorAll("[data-formule-conseil]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.formuleConseil === id));
  });
  const b = donnees.boutique;
  const texte = tr("Bonjour Canari, je veux l'option Conseil " + f.nom + " (" + francCFA(f.prix) + ").") + "\n" +
    tr("Mon numéro Canari : " + idAffiche(donnees.abonnement.id)) +
    (b.nom ? "\n" + tr("Boutique : " + b.nom) : "");
  const lienGerant = new URL("gerant.html", location.href).href + "#id=" + donnees.abonnement.id +
    "&j=" + f.jours + "&o=conseil&f=" + encodeURIComponent("Conseil " + f.nom) + "&p=" + f.prix +
    (b.nom ? "&b=" + encodeURIComponent(b.nom.slice(0, 40)) : "") + (b.tel ? "&t=" + b.tel : "");
  $("conseil-demande").href = "https://wa.me/" + numeroWhatsApp(RECEPTION.whatsapp) +
    "?text=" + encodeURIComponent(texte + "\n\n" + tr("Lien pour Canari :") + "\n" + lienGerant);
}

function initConseil() {
  $("conseil-envoyer").addEventListener("click", function () {
    const q = $("conseil-champ").value.trim();
    if (q) poserQuestion(q);
  });
  $("conseil-champ").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); $("conseil-envoyer").click(); }
  });
  $("conseil").addEventListener("click", function (e) {
    const q = e.target.closest("[data-question]");
    if (q) { poserQuestion(q.dataset.question); return; }
    const f = e.target.closest("[data-formule-conseil]");
    if (f) choisirFormuleConseil(f.dataset.formuleConseil);
  });
  $("conseil-fermer").addEventListener("click", function () { montrer("principal"); });
  $("reglages-conseil").addEventListener("click", ouvrirConseil);
  $("conseil-dire").addEventListener("click", function () {
    ecouterVoix(true, function (texte) {
      if (texte) { $("conseil-champ").value = texte; poserQuestion(texte); }
    });
  });
}
