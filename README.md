# Bip le robot — V9 « Un seul objectif »

Jeu d'initiation à la programmation (puis à quelques idées de physique et de
mathématiques) pour les 5-7 ans. Tout se joue au doigt, **sans savoir lire** :
images, visages et voix. Aucun chrono, aucune vie, aucun méchant. Une erreur
est une information (« Oups ! »), jamais une punition. Fonctionne hors connexion,
s'installe sur Android comme une application.

La V9 reconstruit le parcours éducatif autour d'**un seul objectif — ramasser tous
les jouets** — et fait finir l'aventure haut : après le grand pique-nique, les
chapitres 17 à 19 forment un tournoi de nuit où chaque niveau combine au moins deux
acquis (plus aucun niveau « filler »). Les défis de Zoé et les machines de Grand-Papa
restent jouables en bonus archivés (feuille « Pour les adultes »). La réflexion
chiffrée est dans [docs/REFLEXION.MD](docs/REFLEXION.MD), la conception dans
[docs/GAME-DESIGN-V9.md](docs/GAME-DESIGN-V9.md).

## Ce qu'on y fait

- **La carte** : un chemin qui serpente dans quatre mondes (le jardin, la mare,
  les ateliers, la nuit). Bip est posé sur le prochain caillou ; les cailloux
  réussis portent leurs étoiles ; les suivants sont pâles, jamais cadenassés.
  Un seul geste (« Jouer ») ouvre le prochain niveau.
- **L'aventure** : 4 mondes · 19 chapitres · 95 niveaux d'aventure + 7 défis de Zoé
  (102 niveaux au total). Un seul but partout : ramasse tous les jouets. Flèches, buissons et
  flaques, saut, Répéter, repère relatif, nénuphars qui coulent, Répéter jusqu'à,
  Si… sinon (3 jardins, 1 programme), bloc magique, champignons et barrières,
  caisses qui deviennent des ponts, pollen doré, détective, toboggans de Ballon
  (on programme le décor), puis le jardin de nuit jusqu'au grand pique-nique,
  au rêve de Bip, aux balises de Noctule (le bloc « balise » y envoie Bip tout seul)
  et aux yeux de Bip (capteur « jouet devant » sur la molette du bloc Si, « jusqu’à la balise » sur la molette du Jusqu’à, et le bloc « pose une balise »), puis un tournoi de nuit en combos (chapitres 17–19) qui finit haut (dernier niveau, par 7).
  L'histoire se raconte dans la bulle du niveau, par le personnage qui parle.
- **Bonus archivé (V9, feuille « Pour les adultes »)** — **les machines de Grand-Papa** : la balance (glisser les paniers), la lumière
  (tourner les miroirs), les roues (changer leur taille), le rendez-vous (décaler
  un ami). On construit, on peut deviner en touchant une image, on lâche la
  machine et on regarde. Douze défis, et un mode « inventer » par machine.
- **Sur l'accueil** : **Mon jardin** (crée ton niveau et fais-le résoudre par Bip)
  et **l'album de Zoé** (29 images à gagner).
- **Bonus archivé (V9, feuille « Pour les adultes »)** : **le défi de Zoé** (un
  niveau par jour de la semaine).

## Contenu du dépôt

- `index.html` — le jeu complet (un seul fichier, généré)
- `manifest.webmanifest`, `sw.js`, `icons/` — installation et hors connexion
- `src/engine.js` — moteur pur (simulation, solveur) · `src/ball.js` — toboggans ·
  `src/lab.js` — modèles des machines · `src/levels.js` — chapitres et niveaux
- `src/body.html` — interface (HTML + CSS + symboles SVG) · `src/app-*.js` — écrans
- `tools/` — build et vérifications · `docs/` — conception V4, plan de bêta-test et grille de retours (`docs/archive/` : V2 et V3)

## Bêta-test sur tablette

Le jeu est publié sur `https://drake-calahan.github.io/bip/`. Le déroulé de séance, la
grille d'observation et les points à vérifier sont dans [docs/BETA-TEST-V4.md](docs/BETA-TEST-V4.md) ;
les retours se consignent dans [docs/RETOURS-BETA.md](docs/RETOURS-BETA.md).

## Lancer en local

```powershell
python -m http.server 8103 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8103`. La première ouverture met le jeu en cache pour
les ouvertures suivantes hors connexion. La progression (étoiles, autocollants,
jardins créés, machines réussies) est gardée dans le navigateur, clé `bip-robot-v2`
(la sauvegarde V2/V3 est reprise telle quelle).

## Mettre en ligne (HTTPS obligatoire pour l'installation)

N'importe quel hébergement de fichiers statiques : GitHub Pages (Settings → Pages →
branche `main`, dossier racine), Cloudflare Pages, Netlify Drop…

## Installer sur la tablette ou le téléphone Android

1. Ouvrir l'adresse dans Chrome.
2. Menu ⋮ → « Installer l'application ».
3. Lancer Bip depuis son icône : plein écran, et ça marche ensuite sans réseau.

## Modifier le jeu

```
node tools/check-levels.js    # chaque niveau a une solution valide (ALL OK)
node tools/check-curve.js     # V5 : courbe de charge, marge batterie, un seul repère (ALL OK)
node tools/smoke-engine.js    # mécaniques du moteur
node tools/check-labs.js      # modèles des machines
node tools/check-sandbox.js   # Mon jardin
node tools/check-session.js   # navigation pendant une animation
python tools/build.py         # régénère index.html et manifest.webmanifest
node tools/check-ui.js        # parcours Playwright complets (serveur local lancé)
```

Après avoir modifié `src/`, changer `VERSION` dans `sw.js` pour que les appareils
récupèrent la nouvelle version. Les règles d'écriture (ton, une idée par niveau,
piles, étoiles) sont dans `.agent/AGENTS.md` et `.agent/level-authoring.md`.
