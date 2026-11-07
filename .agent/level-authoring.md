# Authoring levels for Bip v2

## Difficulty curve targets (blocks in reference solution)

- Ch 1–4 (world 1): 1 → 3, 3 → 5, 4 → 6, 4 → 7. Battery only in ch 4 (loops) with +1 spare.
- Ch 5–9 (world 2): 4 → 8. Pond ch 6 forces one-way thinking (no backtrack). If/else ch 8 always 3 variants.
- Ch 10–14 (worlds 3): 4 → 9. Mechanic debut level = trivial (≤4 blocks). Detective starts fail by exactly one mistake, solvable by 1–2 edits.
- Ch 15–16 (night/finale): 6 → 10, mixing mechanics already taught, never two new things at once.
- Daily (7): 5 → 9, self-contained, playful.

## Patterns that work

- **Debut**: new cell type sits directly on the obvious path, impossible to miss, 1–2 blocks solution.
- **Aha moment**: one level per chapter where the taught tool makes an "impossible" looking level trivially short (loop over 8 straight cells; magic block ×4; while over unknown length).
- **Breather**: after each hard level, one easy celebratory level (2–3 blocks, pretty map).
- **Variants** (if/else, while): 3 gardens that differ ONLY in what the condition senses (path length, puddle position, turn side).
- **Detective**: pre-program `start` fails on all variants; the fix touches one block (swap, count, branch, or order).

## Anti-patterns (do not)

- No level requiring precision longer than ~9 blocks (CP attention).
- No dead-end longer than 2 cells without visual landmark (toy/bush) as anchor.
- No fake difficulty: hidden info, ambushed rules, tight batteries on new mechanics.
- No maps wider than 8 or taller than 6 (board fitting).
- Never combine: crates on lily pads; ball mode with gates/switches; paint targets under crates.

## Checklist per level

1. `text`: ≤ 2 short sentences, names the goal, hints the tool when new.
2. Solve it yourself in the DSL; count blocks; set `max` = par+1 only in loop/while/function chapters.
3. Run `node tools/check-levels.js` — ref must win all variants; detective `start` must fail.
4. Read `text` aloud in French — would a 6 yo follow? Cut words if not.

## V5 « L'harmonie du jardin » — règles ajoutées (2026-11, voir docs/GAME-DESIGN-V5.md)

- **Un seul repère après le ch5** : ch1–4 en flèches absolues, puis repère relatif
  `f/tl/tr` jusqu'à la fin (seuls les deux derniers niveaux du final peuvent mixer).
  Ne jamais alterner le repère niveau par niveau. Les défis de Zoé restent absolus.
- **Marge batterie** : si `max` existe, `max >= par + 1`. Si une solution sans
  conteneur tient dans `max`, retirer carrément `max` (la batterie ne force plus rien).
- **Début de chapitre <= 4 blocs** (sauf final et épilogue), rampe intra-chapitre <= 4,
  aucun saut de par > 4 entre deux niveaux : `node tools/check-curve.js` veille.
- **Aucun niveau ne change de place** : les ids = index du tableau et la sauvegarde
  `save.stars` est indexée par id. On édite le contenu des niveaux en place ;
  les défis de Zoé peuvent être réordonnés entre eux (save indexée par jour de semaine).

## V6 — la balise (ch18, symbole `F`, bloc `g`)

- Un seul drapeau `F` par niveau ; le bloc `g` y pathfind au moment de l'exécution
  (BFS sur niveau temporaire, les jouets sont ramassés au passage).
- Niveau avec `F` = `sol` explicite obligatoire (le solveur BFS ne gère pas `g`) ;
  `check-levels.js` le force (regex `[CGF]`).
- Anti-patterns balise : pas de caisse `C` ni barrière `G` sur le chemin de la balise
  (le pathfinding les ignore), pas de `F` derrière un mur (résultat « bump/flag »),
  pas de `F` sur la case de départ.

## V7 — capteur « jouet devant » (It) et balises multiples

- Le bloc Si a 3 conditions (molette) : flaque `Ip`, obstacle `Io`, **jouet devant `It`**.
  `It` teste la case devant pour un jouet NON ramassé. UI : pill 3 positions, CHECK_SAY `if-toy`.
- Plusieurs `F` par niveau autorisés : `g` va à la **balise la plus proche non visitée**
  (route calculée depuis la position courante de Bip, pas depuis le départ).
  `N2(g)` / `N3(g)` = visiter 2/3 balises. Une balise sous Bip est considérée visitée.
- Anti-patterns : pas de `C`/`G` sur le chemin d'une balise ; `It` ne voit pas les jouets
  déjà ramassés (écrire les niveaux en conséquence).

## V8 — Wg (jusqu'à la balise), p (pose une balise), robustesse UI des imbrications

- `Wg(...)` = répéter jusqu'à être SUR une balise (présente ou plantée par `p`).
  La molette du bloc Jusqu'à n'a la 3e position (drapeau) que si le niveau a une balise.
- `p` plante une balise sur la case courante de Bip (visible à l'exécution, step `plant`).
  `g` ignore la balise sous Bip comme cible mais ne la marque PAS visitée : `p f g` revient au drapeau planté.
- UI : `insertItem` refuse (avec message parlé) ce que `canNest` interdit, au lieu de déplacer en silence ;
  `badMark` entoure aussi les conteneurs parents (`.badpath`) ; un conteneur vide bloque le run avec explication.

## V9 — objectif unique + tournoi de nuit + anti-filler

- **Un seul but partout : ramasse tous les jouets.** Plus de coffre cible (K retiré du moteur, des maps, du tiroir), plus de luciole-jouet (e retiré) : les jouets sont b n c t a, identiques dans tous les mondes (nuit comprise).
- **Jamais de niveau filler** : check-curve alerte DEAD LEVEL (aucune nouveauté bloc/symbole/condition + par+profondeur <= 2 + 1 variante, ch1-5 exemptés) et CHUTE (niveau trivial non-nouveau dans le dernier chapitre) ; FIN TROP BASSE si le dernier niveau < 70 % de la charge max.
- Queue ch17-19 = tournoi de nuit en combos (pars ch17 [5,7,8], ch18 [1,2,4,4], ch19 [4,4,4,4,2,4,4,7]). Règle balise : jamais de jouet AU-DELÀ du drapeau (la route g le ramasse et dépasse la balise).
- Défis de Zoé + machines = bonus archivés (feuille adultes). Ne pas réintégrer dans le hub home.

## V10 — L'aube (monde 5, chapitres 20-21, niveaux ajoutés AVANT le bloc daily)

- **Bloc `c` « loupe »** : va au jouet non ramassé le plus proche (BFS sur niveau temporaire comme `g` ; saute, ramasse au passage). Niveau avec `c` = `sol` explicite recommandé. Anti-patterns : pas de `C`/`G` sur le chemin visé ; si aucun jouet atteignable → `bump`/`toy` (« Aucun jouet à portée »). Début showcase par 1, puis combos (`N2(c)`, `Wt(c)`).
- **`Wf(...)`** : répéter jusqu'à ce que toutes les fleurs soient peintes. La 4e position de la molette du Jusqu'à n'apparaît que si le niveau a des `*` (comme le drapeau). Début showcase (`Wf(f) c`), puis variantes ×3 et combos.
- **Règle d'équilibrage V10** : `Wf` ne doit JAMAIS résoudre seul un niveau — sinon l'outil puissant trivialise le puzzle. Placer le jouet hors du chemin de peinture et/ou une fleur derrière une flaque (vérifié dans `check-v10.js` : `Wf(f)` naïf et `Wf` seul doivent échouer, seul le combo gagne).
- Dernier niveau L103 = final à 3 variantes (`Wg(*) c` + fn `Ip(j|f)`, par 6, charge ≥ 70 % du max) : check-curve (FIN TROP BASSE / CHUTE / DEAD LEVEL) veille.
- Ajout de niveaux : toujours en fin d'aventure, **avant** le bloc `daily:true` (les ids 1-95 et `save.stars` ne bougent pas ; `save.daily` est indexé par jour de semaine). Jamais de niveau qui change de place.
- Mon jardin = **8×6** (`SB_W/SB_H`). Partage : codec `BIP2.` + base64url des 6 lignes de 8 jointes par `/` ; `BIP1.` (6×5) est relu et complété en 8×6. Validation au chargement : dimensions, caractères autorisés `R.#o~sGC*Fbncta-`, exactement un `R`.
