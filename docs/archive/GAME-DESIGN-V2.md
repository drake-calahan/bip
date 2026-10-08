# Bip v2 — « Le grand pique-nique » — Game Design Document

Version 2 — content-heavy evolution of the v1 prototype. Same hero, same soft pastel
world, same block-programming heart. What v2 adds: a story journey with friends,
new world mechanics (engineering!), a creation mode, a daily appointment, and a
sticker album — roughly twice the content, with a smoother curve.

## 1. North stars

1. **Open the magic of coding AND engineering** to 6-year-olds: not only "give
   orders to a machine" (v1) but also "build machines and places that behave"
   (switches, bridges, marble runs, your own garden).
2. **Never lost, never stressed**: one new idea per level, voice always reads,
   failure is soft information ("oups ! Bip s'est cogné"), help glows after 2–3
   fails, no timer, no lives, no villains.
3. **Reflection over reflex**: every run is think → program → observe → adjust.
   Rewards celebrate *thinking* (shortest program, same program in many gardens).
4. **Curve rises gently**: each world adds one layer. Worlds 1–2 consolidate v1
   skills in a story frame; world 3 is the engineering act; world 4 is mastery
   under the stars.

## 2. Story & characters (soft, no conflict)

One morning, Zoé the ladybird lands in Bip's garden with a picnic basket.
The playful wind (Zéphyr) has scattered the toys all along the great path —
so Bip, Zoé and the toys set off to gather everything and end with a grand
night-time picnic. Along the way they meet friends; nobody is mean, things
just get mixed up sleepily or blown about.

| Character | Role | Voice flavour |
|---|---|---|
| **Bip** | hero robot (player) | curious, brave |
| **Zoé la coccinelle** | guide, rides in the bubble, hosts the daily challenge | chirpy, encouraging |
| **Toupie** (toy) | mascot of loops — loves spinning | dizzy giggles |
| **Lulu la grenouille** | guardian of the pond, master of lily pads | slow, wise |
| **Grand-Papa Engrenage** | Bip's grandpa, old robot gardener, built the ateliers | warm, proud |
| **Ballon** (toy) | mascot of the toboggans — rolls everywhere | bouncy |
| **Pilou l'escargot** | sleepy snail; his dreams scramble programs (detective) | sleepy, apologising |
| **Noctule la luciole** | guardian of the night garden | hushed, wonder-struck |

Story beats: world intro overlay (2–3 bubbles), chapter intro card (mascot art +
one idea), chapter-end mini-dialog, finale = the picnic scene. All skippable,
re-readable by tapping the bubble.

## 3. Structure — 4 worlds, 16 chapters, 80 story levels (+7 daily + sandbox)

### World 1 — Le jardin de Bip (foundation, re-taught with fresh maps)
| Ch | Name | Concept | Levels |
|---|---|---|---|
| 1 | Premiers pas | absolute arrows | 5 |
| 2 | Buissons et flaques | obstacles, puddles, chest | 5 |
| 3 | Le saut | jump (2 cells, facing) | 5 |
| 4 | Tourne, tourne ! | loop `Répéter N` (battery forces it) | 5 |

### World 2 — La grande promenade (control flow + first world rule)
| Ch | Name | Concept | Levels |
|---|---|---|---|
| 5 | Le chemin de Zoé | relative frame: advance / turn | 5 |
| 6 | La mare de Lulu | **lily pads sink once left** (one-way planning) | 5 |
| 7 | Jusqu'au bout | `Répéter jusqu'à` (while obstacle / while toys) | 5 |
| 8 | À gauche ou à droite ? | `Si… sinon` + 3 gardens, one program | 5 |
| 9 | Le bloc magique | functions (star line) | 5 |

### World 3 — Les ateliers de Grand-Papa (the engineering act)
| Ch | Name | Concept | Levels |
|---|---|---|---|
| 10 | Les champignons magiques | **switches open gates** (causal state) | 5 |
| 11 | Pousse-pousse | **push crates**; crate→water = bridge; crate on switch | 5 |
| 12 | Le pollen doré | **paint trail**: cover all flowers; symmetry level | 5 |
| 13 | Les toboggans de Ballon | **new game mode**: program the *place*, not the robot — place redirect tiles, roll the ball to the nest | 5 |
| 14 | L'atelier de Pilou | detective/debugging, expanded mistake types | 5 |

### World 4 — Le jardin de nuit (mastery & wonder)
| Ch | Name | Concept | Levels |
|---|---|---|---|
| 15 | Les lucioles de Noctule | night recap: mixed mechanics, fireflies to collect | 5 |
| 16 | Le grand pique-nique | finale mixing everything; ends on the picnic scene | 5 |

### Extra modes
- **Le défi de Zoé** — 7 hand-made bonus levels, one per weekday (offline,
  deterministic by date). First completion → sticker; each visited day gets a dot.
- **Mon jardin** — sandbox creator: build your own garden (toys, bushes,
  puddles, chest, crates, switches, gates, pads, flowers; 3 save slots with
  thumbnails), then program it with the full block set. First garden solved →
  sticker. From consumer to **creator** — the engineering loop completes.
- **L'album de Zoé** — sticker album (~25): one per chapter, golden stars per
  world fully 3-starred, specials (first garden, first daily, old v1 player,
  picnic trophy). Purely celebratory, never gated.

## 4. New mechanics — exact rules

### Lily pad `-` (ch 6)
Walkable. When Bip *leaves* a pad it sinks and becomes water (impassable,
jumpable-over). Teaches irreversibility & planning ahead. Solver models it as a
per-pad "lived" bit in the BFS state.

### Switch `s` + gate `G` (ch 10)
Switch = walkable mushroom button. The instant Bip (or a pushed crate) stands on
it, all gates open permanently (they sink into the ground with a soft chime).
A closed gate counts as an obstacle for `Si obstacle` / `Jusqu'à un obstacle`,
so control-flow blocks interact with gates naturally.

### Crate `C` (ch 11)
Bip pushes a crate by walking into it if the cell beyond is free ground. Crate
pushed into water **becomes a plank** (a bridge — classic engineering delight).
Crate pushed onto a switch presses it. Crates block movement and count as
obstacles to conditions. Levels with crates ship an explicit reference `sol`.

### Paint trail (ch 12)
No new block: Bip automatically leaves a golden pollen trail on every cell he
touches. Levels place flowers `*`; a flower is "painted" when Bip walks on its
cell. Win = all toys + all flowers (+ chest if present). Includes one symmetry
level (paint the left side to mirror the modelled right side) — pre-coding math,
very CP.

### Firefly `e` (ch 15)
Just a glowing night toy — the reward skin of mastery. Night chapters get a soft
indigo wash and starry background; visibility never restricted (no fear).

### Ball mode (ch 13) — programming the place
Board has Ballon's start `S` (with facing) and a nest `N`. The palette becomes
**direction tiles**: tap a ground cell to place/cycle an arrow, tap with the
eraser to remove. Press play: the ball rolls one cell at a time, turns when it
crosses a tile, stops softly on obstacles/puddles, fails gently if it exits or
cycles ("il tourne en rond !"). Win = reach the nest. Stars by tile count.
The pedagogical shift: the child edits the *environment* instead of the
*executor* — their first taste of building a system, and of programs-as-data.

## 5. Progression, rewards, difficulty

- Level unlock: previous level ≥ 1 star (as v1). Chapters/worlds visible but
  locked ahead — aspiration, not tease.
- Stars per level: 3 (≤ par blocks), 2 (≤ par+2), 1 (any success). Success is
  always success.
- Curve audited mechanically: `tools/check-levels.js` prints every level's par
  and flags spikes; authoring guide (`.agent/level-authoring.md`) sets targets
  per chapter (1→3 blocks in ch 1, up to ~10 in the finale).
- Help ladder (kept from v1): step-mode glows after 2 fails, hint path after 3;
  new-mechanic levels get one extra explanatory voice line.
- Meta rewards: stickers (chapter, world-gold, specials), hero garden blooms
  one flower per finished chapter, journey map fills with progress dots,
  finale picnic scene. Everything offline.

## 6. Feel & sensory budget

- Same pastel palette + one new per-chapter tints (pond blues, atelier ochres,
  night indigos). Night wash stays >40% luminance on play cells — cozy, not
  dark.
- New sounds, all soft WebAudio: pad bloop, gate chime, crate slide, pollen
  arpeggio, ball tap-tap, sticker sparkle. Existing win/confetti kept.
- Reduced-motion, voice-off, sound-off still fully supported. Nothing blinks
  faster than 2 Hz. One animation at a time on the board.

## 7. Technical shape

- Still a single-file PWA (`tools/build.py` concatenates `src/`).
- `src/engine.js` stays pure/Node-testable and gains: pads, switches/gates,
  crates/planks, paint, fireflies, extended BFS solver; ball simulation lives
  in `src/ball.js` (pure too).
- `src/app-core.js` / `app-game.js` / `app-modes.js` / `app-home.js` stitched
  into one IIFE at build. Save key `bip-robot-v2` (fresh adventure; v1 players
  get a nostalgic sticker).
- `tools/check-levels.js` extended: every level's ref must win on all variants,
  detective starts must fail, par ≤ max, ball refs must reach the nest,
  difficulty table printed.

## 8. What we deliberately did NOT add (and why)

- Timed gates / moving hazards: time pressure contradicts the soft tone.
- Numeric variables: too abstract at 6; the loop pill already counts.
- True fog-of-war at night: fear risk; glow is decorative only.
- Second robot parallelism: cognitive load; maybe v3.
- Online features: the game works fully offline, forever.
