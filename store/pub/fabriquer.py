# -*- coding: utf-8 -*-
"""Fabrique la page des visuels publicitaires de Canari.
Chaque visuel est une <section> à la taille exacte ; un script Playwright
les photographie une par une."""
import base64, pathlib, io, segno

RACINE = pathlib.Path(__file__).resolve().parents[2]
PUB = pathlib.Path("/tmp/claude-0/pub")

def dataurl(p, mime):
    return f"data:{mime};base64," + base64.b64encode(pathlib.Path(p).read_bytes()).decode()

tel = {n: dataurl(PUB / f"tel-{n}.png", "image/png") for n in ["jour", "credits", "relances", "tableau"]}
masc = dataurl(RACINE / "app/icones/mascotte-canari-3d.webp", "image/webp")
clin = dataurl(RACINE / "app/icones/canari-clin-doeil.webp", "image/webp")
yeux = dataurl(RACINE / "app/icones/canari-yeux-fermes.webp", "image/webp")
fredoka = dataurl(RACINE / "app/polices/fredoka.woff2", "font/woff2")
rubik = dataurl(RACINE / "app/polices/rubik.woff2", "font/woff2")

buf = io.BytesIO()
segno.make("https://mastexcel.github.io/Canari/", error="h").save(
    buf, kind="png", scale=14, border=2, dark="#1A1B20", light="#FFFFFF")
qr = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

CSS = """
@font-face { font-family: Fredoka; src: url(FREDOKA) format('woff2'); font-weight: 300 700; font-display: block; }
@font-face { font-family: Rubik; src: url(RUBIK) format('woff2'); font-weight: 300 800; font-display: block; }
:root {
  --graphite: #121319; --graphite-8: #1A1C23; --gris: #8E929B;
  --braise: #DC3F17; --braise-vive: #F46134; --braise-profonde: #8E1F0C;
  --ivoire: #FCFAF7; --sable: #F8EFE9; --bord: #E8DFD7;
  --olive: #5E7033; --or: #C2802F; --ardoise: #4A5873;
  --titre: Fredoka, system-ui, sans-serif;
  --texte: Rubik, system-ui, sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #555; font-family: var(--texte); }
section { position: relative; overflow: hidden; margin: 30px auto; display: block; }

/* Le fond sombre de la marque */
.sombre {
  background:
    radial-gradient(74% 56% at 88% 6%, rgba(244,97,52,.42) 0, transparent 70%),
    radial-gradient(90% 62% at 8% 104%, rgba(142,31,12,.60) 0, transparent 72%),
    linear-gradient(158deg, #1A1C23 0%, #121319 52%, #1D1215 100%);
  color: #F3EFEA;
}
.grille { position: absolute; inset: 0; background-image: GRILLE; background-size: 60px 60px; opacity: .5; pointer-events: none; }
.clair { background: linear-gradient(168deg, #FCFAF7 0%, #F8EFE9 55%, #F4F2EF 100%); color: #22242A; }
.rubans { position: absolute; inset: 0; pointer-events: none; }

.logo { font-family: var(--titre); font-weight: 600; letter-spacing: -1px; }
.slogan { font-family: var(--titre); font-weight: 600; color: var(--braise-vive); }
h1 { font-family: var(--titre); font-weight: 600; line-height: 1.07; letter-spacing: -1.5px; }
.braise { color: var(--braise-vive); }
.lien {
  display: inline-flex; align-items: center; gap: 16px;
  background: linear-gradient(122deg, #F8744A 0%, var(--braise) 54%, var(--braise-profonde) 100%);
  color: #fff; font-weight: 700; border-radius: 999px;
}
.tel { display: block; filter: drop-shadow(0 40px 70px rgba(0,0,0,.55)); border-radius: 34px; }
.cadre { overflow: hidden; margin: 0 auto; filter: drop-shadow(0 40px 70px rgba(0,0,0,.55));
  -webkit-mask-image: linear-gradient(180deg, #000 68%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 68%, transparent 100%); }
.cadre img { display: block; width: 100%; border-radius: 34px; }
.tel.clairombre { filter: drop-shadow(0 30px 56px rgba(18,19,25,.28)); }
.puce { display: flex; align-items: center; gap: 18px; }
.puce i { flex: none; border-radius: 50%; display: block; }
.pied { position: absolute; left: 0; right: 0; bottom: 0; text-align: center; }
"""

GRILLE = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E"
          "%3Cpath d='M60 0H0v60' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.07'/%3E%3C/svg%3E\")")

RUBANS_SVG = """<svg class="rubans" viewBox="0 0 900 900" preserveAspectRatio="none">
<g fill="none" stroke-linecap="round">
<path d="M-220 170 C 120 40 420 300 760 140 C 900 74 1020 120 1140 90" stroke="#DC3F17" stroke-width="130" opacity=".07"/>
<path d="M-220 250 C 140 130 440 350 780 210" stroke="#C2802F" stroke-width="40" opacity=".11"/>
<path d="M-220 540 C 180 410 400 690 800 540" stroke="#8E929B" stroke-width="170" opacity=".10"/>
<path d="M-220 650 C 160 530 420 790 820 630" stroke="#DC3F17" stroke-width="28" opacity=".10"/>
<path d="M-220 880 C 200 750 440 1010 860 860" stroke="#5E7033" stroke-width="120" opacity=".075"/>
</g></svg>"""

def section(ident, largeur, hauteur, classe, contenu):
    return (f'<section id="{ident}" class="{classe}" style="width:{largeur}px;height:{hauteur}px">'
            f'{contenu}</section>\n')

V = []

# ---------- 1 · Statut WhatsApp : le bénéfice ----------
V.append(section("statut-gain", 1080, 1920, "sombre", f"""
<div class="grille"></div>
<div style="position:absolute;inset:0;padding:96px 72px;display:flex;flex-direction:column">
  <div style="display:flex;align-items:center;gap:22px">
    <img src="{masc}" style="width:96px;height:auto;border-radius:22px">
    <div>
      <div class="logo" style="font-size:62px;color:#fff;line-height:1">canari</div>
      <div class="slogan" style="font-size:27px;margin-top:4px">Tu vends. Canari compte.</div>
    </div>
  </div>

  <h1 style="font-size:92px;margin-top:64px;color:#fff;max-width:900px">
    Tu sais combien tu as <span class="braise">vraiment</span> gagné aujourd'hui&nbsp;?
  </h1>
  <p style="font-size:38px;line-height:1.45;color:#CFC8C2;margin-top:34px;max-width:860px">
    Pas ce que tu as encaissé&nbsp;: ce qui te <b style="color:#fff">reste</b>,
    une fois la marchandise, le loyer et les taxes comptés.
  </p>

  <div class="cadre" style="width:560px;height:640px;margin-top:52px">
    <img src="{tel['jour']}">
  </div>

  <div class="pied" style="padding:0 72px 92px">
    <div style="font-size:34px;color:#CFC8C2;margin-bottom:28px">Gratuit 1 mois · Marche sans internet · Zéro publicité</div>
    <div class="lien" style="font-size:36px;padding:28px 50px">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 19h16"/></svg>
      mastexcel.github.io/Canari
    </div>
  </div>
</div>"""))

# ---------- 2 · Statut WhatsApp : les crédits ----------
V.append(section("statut-credit", 1080, 1920, "sombre", f"""
<div class="grille"></div>
<div style="position:absolute;inset:0;padding:96px 72px;display:flex;flex-direction:column">
  <div class="logo" style="font-size:52px;color:#fff">canari</div>

  <h1 style="font-size:96px;margin-top:48px;color:#fff;max-width:920px">
    Qui te doit de l'argent&nbsp;?<br><span class="braise">Canari s'en souvient.</span>
  </h1>

  <div style="margin-top:50px;display:flex;flex-direction:column;gap:30px;font-size:36px;color:#EDE7E2">
    <div class="puce"><i style="width:22px;height:22px;background:#96701F"></i>La liste de tous ceux qui te doivent, toujours à jour.</div>
    <div class="puce"><i style="width:22px;height:22px;background:#F46134"></i>Le message de relance déjà écrit, à envoyer sur WhatsApp.</div>
    <div class="puce"><i style="width:22px;height:22px;background:#5E7033"></i>Un reçu propre dès qu'il te rembourse.</div>
  </div>

  <div class="cadre" style="width:560px;height:860px;margin-top:44px">
    <img src="{tel['credits']}">
  </div>

  <div class="pied" style="padding:0 72px 92px">
    <div class="lien" style="font-size:36px;padding:28px 50px">mastexcel.github.io/Canari</div>
  </div>
</div>"""))

# ---------- 3 · Carré : la marque ----------
V.append(section("carre-marque", 1080, 1080, "sombre", f"""
<div class="grille"></div>
<div style="position:absolute;inset:0;padding:70px;display:flex;flex-direction:column;align-items:center;text-align:center">
  <img src="{masc}" style="width:260px;height:auto;border-radius:48px;filter:drop-shadow(0 26px 46px rgba(0,0,0,.5))">
  <div class="logo" style="font-size:96px;color:#fff;margin-top:18px;line-height:1">canari</div>
  <div class="slogan" style="font-size:40px;margin-top:10px">Tu vends. Canari compte.</div>
  <p style="font-size:34px;color:#CFC8C2;margin-top:26px;max-width:820px;line-height:1.4">
    Ton carnet de caisse sur le téléphone, pour les commerçants.
  </p>
  <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:34px">
    <span style="font-size:30px;font-weight:600;border:2px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);border-radius:999px;padding:16px 30px;color:#F3EFEA">Ventes</span>
    <span style="font-size:30px;font-weight:600;border:2px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);border-radius:999px;padding:16px 30px;color:#F3EFEA">Dépenses</span>
    <span style="font-size:30px;font-weight:600;border:2px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);border-radius:999px;padding:16px 30px;color:#F3EFEA">Crédits</span>
    <span style="font-size:30px;font-weight:600;border:2px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);border-radius:999px;padding:16px 30px;color:#F3EFEA">Bénéfice</span>
  </div>
  <div class="pied" style="padding:0 70px 64px">
    <div class="lien" style="font-size:33px;padding:24px 44px">mastexcel.github.io/Canari</div>
  </div>
</div>"""))

# ---------- 4 · Carré : la relance ----------
V.append(section("carre-relance", 1080, 1080, "clair", f"""
{RUBANS_SVG}
<div style="position:absolute;inset:0;padding:70px;display:flex;align-items:center;gap:40px">
  <div style="flex:1;min-width:0">
    <div class="logo" style="font-size:44px;color:#1A1B20">canari</div>
    <h1 style="font-size:76px;margin-top:26px;color:#1A1B20">Relance sans te fâcher.</h1>
    <p style="font-size:33px;line-height:1.45;color:#5B5A5E;margin-top:24px">
      Canari écrit le message pour toi, avec le bon montant.
      <b style="color:#1A1B20">Trois tons</b>&nbsp;: gentil, ferme, dernier rappel.
      Il part sur WhatsApp en un geste.
    </p>
    <div style="margin-top:34px;background:#fff;border:1px solid #E8DFD7;border-left:6px solid #DC3F17;border-radius:18px;padding:24px 26px;font-size:28px;line-height:1.45;color:#22242A">
      «&nbsp;Bonjour Mariam, petit rappel de la boutique&nbsp;: il reste 9 400&nbsp;F à régler.
      Tu peux passer quand ça t'arrange. Merci beaucoup&nbsp;!&nbsp;»
    </div>
  </div>
  <img class="tel clairombre" src="{tel['relances']}" style="width:360px">
</div>"""))

# ---------- 5 · Carré : le prix ----------
V.append(section("carre-prix", 1080, 1080, "clair", f"""
{RUBANS_SVG}
<div style="position:absolute;inset:0;padding:80px;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center">
  <div class="logo" style="font-size:46px;color:#1A1B20">canari</div>
  <h1 style="font-size:104px;margin-top:30px;color:#1A1B20">1 mois <span style="color:#5E7033">gratuit</span>.</h1>
  <p style="font-size:46px;margin-top:22px;color:#22242A;font-weight:600">Puis 1 000 F par mois.</p>
  <p style="font-size:34px;margin-top:14px;color:#5B5A5E">ou 9 000 F l'année — trois mois offerts</p>
  <div style="display:flex;align-items:center;gap:26px;margin-top:46px;background:#fff;border:2px solid #E8DFD7;border-radius:24px;padding:26px 40px">
    <img src="{yeux}" style="width:110px;height:auto;border-radius:22px">
    <div style="text-align:left">
      <div style="font-size:40px;font-weight:700;color:#8E2F1E;font-family:var(--titre)">Zéro publicité.</div>
      <div style="font-size:30px;color:#5B5A5E;margin-top:4px">Jamais. Et tes chiffres restent sur ton téléphone.</div>
    </div>
  </div>
  <div class="lien" style="font-size:33px;padding:24px 44px;margin-top:48px">mastexcel.github.io/Canari</div>
</div>"""))

# ---------- 6 · Bannière de partage (aperçu de lien, couverture) ----------
V.append(section("banniere", 1200, 630, "sombre", f"""
<div class="grille"></div>
<div style="position:absolute;inset:0;padding:56px 60px;display:flex;align-items:center;gap:40px">
  <div style="flex:1;min-width:0">
    <div style="display:flex;align-items:center;gap:18px">
      <img src="{masc}" style="width:78px;height:auto;border-radius:18px">
      <div class="logo" style="font-size:58px;color:#fff;line-height:1">canari</div>
    </div>
    <h1 style="font-size:50px;margin-top:26px;color:#fff;max-width:600px">Ton carnet de caisse sur le téléphone.</h1>
    <p style="font-size:26px;color:#CFC8C2;margin-top:16px;max-width:580px;line-height:1.4">
      Ventes, dépenses, crédits clients et relances — avec ton bénéfice du jour toujours visible.
    </p>
    <div class="slogan" style="font-size:30px;margin-top:22px">Tu vends. Canari compte.</div>
  </div>
  <img class="tel" src="{tel['jour']}" style="width:290px">
</div>"""))

# ---------- 7 · Flyer A5 à imprimer (1748 × 2480, 300 dpi) ----------
V.append(section("flyer", 1748, 2480, "clair", f"""
{RUBANS_SVG}
<div style="position:absolute;inset:0;display:flex;flex-direction:column">
  <div class="sombre" style="padding:80px 90px 70px;text-align:center;border-bottom:6px solid #DC3F17;position:relative">
    <div class="grille"></div>
    <img src="{masc}" style="width:230px;height:auto;border-radius:42px;position:relative">
    <div class="logo" style="font-size:118px;color:#fff;margin-top:14px;line-height:1;position:relative">canari</div>
    <div class="slogan" style="font-size:48px;margin-top:10px;position:relative">Tu vends. Canari compte.</div>
  </div>

  <div style="padding:70px 90px 0;flex:1;display:flex;flex-direction:column">
    <h1 style="font-size:82px;color:#1A1B20;text-align:center;line-height:1.12">
      Ton carnet de caisse<br>sur le téléphone.
    </h1>

    <div style="margin-top:56px;display:flex;flex-direction:column;gap:34px;font-size:40px;line-height:1.35;color:#22242A">
      <div class="puce"><i style="width:30px;height:30px;background:#5E7033"></i><span><b>Ton bénéfice du jour</b>, calculé tout seul.</span></div>
      <div class="puce"><i style="width:30px;height:30px;background:#96701F"></i><span><b>Qui te doit quoi</b>, et le message pour le relancer.</span></div>
      <div class="puce"><i style="width:30px;height:30px;background:#B8412B"></i><span><b>Tes dépenses</b> et ce que tu dois à tes fournisseurs.</span></div>
      <div class="puce"><i style="width:30px;height:30px;background:#4A5873"></i><span>L'argent de la boutique <b>séparé</b> de celui de la maison.</span></div>
      <div class="puce"><i style="width:30px;height:30px;background:#DC3F17"></i><span>Une <b>facture propre</b> en deux secondes, sur WhatsApp.</span></div>
    </div>

    <div style="display:flex;align-items:center;gap:60px;margin-top:62px">
      <img class="tel clairombre" src="{tel['jour']}" style="width:430px">
      <div style="flex:1;text-align:center">
        <img src="{qr}" style="width:420px;height:420px;border-radius:26px;border:8px solid #fff;box-shadow:0 18px 40px rgba(18,19,25,.18)">
        <div style="font-size:38px;font-weight:700;color:#1A1B20;margin-top:22px;font-family:var(--titre)">Scanne pour installer</div>
        <div style="font-size:30px;color:#5B5A5E;margin-top:8px">avec l'appareil photo</div>
      </div>
    </div>
  </div>

  <div style="background:#1A1B20;color:#F3EFEA;padding:52px 90px;text-align:center">
    <div style="font-size:46px;font-weight:700;font-family:var(--titre)">1 mois gratuit, puis 1 000 F par mois.</div>
    <div style="font-size:34px;color:#CFC8C2;margin-top:12px">Marche sans internet · Zéro publicité · Tes chiffres restent chez toi</div>
    <div style="font-size:32px;color:#F46134;margin-top:22px;font-weight:600">mastexcel.github.io/Canari</div>
    <div style="font-size:24px;color:#8E929B;margin-top:26px">Une application de Bridge Investment Partners</div>
  </div>
</div>"""))

html = ("<!doctype html><html lang=fr><head><meta charset=utf-8><style>"
        + CSS.replace("FREDOKA", fredoka).replace("RUBIK", rubik).replace("GRILLE", GRILLE)
        + "</style></head><body>" + "".join(V) + "</body></html>")
(PUB / "modele.html").write_text(html, encoding="utf-8")
print("modèle écrit :", len(html) // 1024, "Ko,", len(V), "visuels")
