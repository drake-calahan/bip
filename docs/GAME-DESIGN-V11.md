# GAME-DESIGN — V11 « Nouvelle robe »

Refonte visuelle complète de l'interface, **sans changer un seul niveau, un seul
bloc, un seul texte de consigne**. L'objectif : un effet « whouaou » qui reste
entièrement dans l'esprit de Bip — pastel, doux, gros boutons ronds, zéro
pression, jouable au doigt sans savoir lire (5–7 ans).

## Principes (hérités de V4, inchangés)

- Un seul langage visuel : tous les nouveaux tokens vivent dans le `:root` de
  `src/body.html` (`--sky`, `--card-grad`, `--gloss`, `--sh-card`, `--sh-pop`,
  `--rainbow`, `--sun`). Aucune nouvelle feuille de style, aucun nouveau
  sélecteur exotique.
- Pas de nouveau bouton textuel pour l'enfant ; tout ce qui se touche garde une
  icône + la voix ; cibles tactiles toujours ≥ 44 px.
- `prefers-reduced-motion` toujours respecté (bloc final du `<style>`) : toutes
  les animations passent à ~0.
- Aucun chrono, aucune vie, aucun méchant ajouté : les animations sont lentes,
  douces, et ne punissent jamais.

## Ce qui change (tout dans `src/body.html` + confettis dans `src/app-game.js`)

- **Ciel** : `html` passe sur un dégradé pastel (`--sky`) avec un voile de
  pollen doré qui dérive très lentement derrière l'app (`body::before`,
  `transform` animé, donc composité).
- **Accueil** : auréole arc-en-ciel (`--rainbow`, angle animé via `@property
  --ang`) qui tourne doucement et floutée derrière la carte héros ; halo soleil
  derrière Bip ; titre « Bip » en dégradé de texte ; bouton « Jouer » en dégradé
  vert avec reflet qui balaie (`shine`) et halo pulsant (`gopulse`).
- **Carte** : cailloux vernis (dégradé + ombre portée), halo vert sur le
  prochain caillou, étoiles des cailloux terminés qui brillent, chemin ombré,
  séparations en pointillés blancs entre les mondes, puce de chapitre vernie.
- **Niveau** : plateau avec ombre douce et liseré interne, Bip avec ombre au
  sol, bulle façon bulle de dialogue (bord blanc + petite pointe), programme en
  carte, blocs et conteneurs « vernis » (`--gloss`), bloc en cours d'exécution
  qui pulse (`nowpulse`), gros bouton vert en dégradé qui pulse avec un anneau
  (`playring` ; à l'arrêt pendant un run, orange comme avant).
- **Superpositions** : flou d'arrière-plan (`backdrop-filter`), cartes Bravo /
  histoire avec **liseré arc-en-ciel animé**, halo derrière le personnage, étoiles
  plus grosses et dorées ; feuilles (album, adultes, machines, code) en carte
  douce bordée de blanc.
- **Victoire** : confettis améliorés — trois salves (centre + deux côtés),
  formes étoiles en plus des rectangles, durée allongée. Toujours coupés si
  `prefers-reduced-motion`.

## Vérification

- `python tools/build.py` puis `node tools/check-levels.js`, `check-curve.js`,
  `check-v10.js`, `check-labs.js`, `smoke-engine.js`, `check-sandbox.js`,
  `check-session.js` : inchangés, doivent rester OK (aucune logique touchée).
- `node tools/check-ui.js http://127.0.0.1:8103/` : `UI OK` + captures
  `.artifact/` en 390×844 et 1280×800.
- `VERSION` de `sw.js` bumpé (`bip-v11-1`) et note V11 en tête de
  `VERSION_NOTES` (feuille « Pour les adultes »).
