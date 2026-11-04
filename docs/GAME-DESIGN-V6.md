# Bip V6 — « Les balises de Noctule » — nouvelles mécaniques, suppressions, streamlining

Proposition libre (demandée par Thomas) pour streamliner l'expérience « coding
robotique » d'un enfant de 5–7 ans. Implémenté directement, vérifié, commité.

## 1. Inventaire d'usage (mesuré sur les 94 niveaux)

| Symbole / bloc | Usage | Verdict |
|---|---|---|
| `#` buisson / `o` rocher | 199 / 8 maps | gardés (variété visuelle + bac à sable) |
| jouets `b n c t a e` | 69/29/15/10/10/26 | gardés |
| jouet `z` (anneau) | **0 map, pas dans le tiroir** | **supprimé** (TOY_CHARS, TOY_NAME) |
| icône `I.lock` (cadenas) | **0 usage** (V4 = « jamais de cadenas ») | **supprimé** |
| `K` coffre, `-` nénuphar, `s`/`G`, `C`, `*`, mode toboggan, détective | tous utilisés | gardés |
| blocs `f tl tr j loop while if star` + flèches absolues (ch1–4, défis) | tous utilisés | gardés |

## 2. Nouvelle mécanique : la balise (waypoint)

Concept robotique réel : un **point de passage** (`F` sur la carte, drapeau
lumineux) et un bloc **`g` « va à la balise »**. Au moment de l'exécution, le
moteur pathfind (BFS existant, niveau temporaire où la balise devient un jouet —
les vrais jouets sont ramassés au passage) et rejoue le chemin pas à pas :
totalement animable, compatible ampoule-chemin, pas-à-pas et bloc magique.

- Chapitre 18 « Les balises de Noctule » (monde nuit), 4 niveaux ids 84–87,
  insérés après l'épilogue (sauvegarde sûre : `save.daily` indexée par jour).
- `F` ajouté au tiroir « Mon jardin » et `g` à la palette libre (FULL_PAL).
- Garde-fous : `check-levels.js` exige un `sol` explicite pour tout niveau `F` ;
  `check-curve.js` compte `g` comme nouveauté (+3 charge) au chapitre 18.
- Anti-patterns documentés (`.agent/level-authoring.md`) : pas de caisse/barrière
  sur le chemin d'une balise, pas de balise derrière un mur.

## 3. Streamlining retenu (et ce qui est délibérément gardé)

- **Un seul repère dans l'aventure** (relatif dès ch5, V5) : les défis de Zoé
  restent en flèches absolues — ils sont ouverts dès le premier jour, avant que
  le ch5 n'enseigne le repère relatif. Exception documentée, pas une incohérence.
- Le rocher `o` reste dans Mon jardin (variété créative), même s'il ne bloque pas
  différemment du buisson.
- Pas de fusion `tl`/`tr` en un seul bloc à bascule : deux blocs = un tap direct,
  plus simple pour 6 ans que régler un sens.
- Pas de suppression du mode détective (debug) ni toboggan (programmer le décor) :
  ce sont des piliers pédagogiques distincts, chacun 5 niveaux.

## 4. Vérification

- `node tools/check-levels.js` → ALL OK (94 niveaux : 87 aventure + 7 défis, 18 chapitres)
- `node tools/check-curve.js` → ALL OK (0 marge nulle, 1 seul repère, 0 spike, débuts OK)
- smoke-engine / check-labs / check-sandbox / check-session → OK
- `python tools/build.py` + `node tools/check-ui.js` → UI OK (87 cailloux, 18 bannières,
  390×844 et 1280×800), test toboggan mis à jour (index 65)
- sanity navigateur : niveau balise L84 joué et gagné en UI, palette `g` rendue,
  `LAST_STORY` = 87, aucune erreur JS.
