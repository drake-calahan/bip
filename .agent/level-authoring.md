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
