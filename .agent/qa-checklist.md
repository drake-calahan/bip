# QA checklist — Bip v2 (manual browser pass)

Run after every build (`python tools/build.py`), serve with `python -m http.server 8099`.

## Home / journey map
- [ ] Hero shows Bip + Zoé, title, "Continuer" targets the next unfinished level.
- [ ] Journey path scrolls; stations locked/unlocked correctly; world signposts readable.
- [ ] One flower per completed chapter appears in the hero garden.
- [ ] "Le défi de Zoé" card shows today's weekday and opens the daily level.
- [ ] Album opens; earned stickers visible, unearned show soft silhouettes.

## Classic play
- [ ] New level: voice reads consigne; avatar (Zoé/Bip) correct.
- [ ] Chapter intro overlay on first level of a chapter; story beat at world starts.
- [ ] Pond: lily pad sinks after Bip leaves it (visual + soft bloop); cannot walk back.
- [ ] Paint: trail follows Bip; flowers fill when painted; win requires all flowers.
- [ ] Crates: push animation; crate into water → plank (bridge); crate onto switch opens gates.
- [ ] Switch: stepping on mushroom opens gates with clunk-chime; gates animate.
- [ ] Night chapter: soft night wash, fireflies glow, no dark-scary contrast.
- [ ] Fails stay gentle: bump/splash/tired messages, bad block highlighted, no punishment copy.

## Ball mode (toboggans)
- [ ] Palette shows 4 arrow tiles + eraser; tap cycles/places; tap eraser removes.
- [ ] Run rolls ball with soft taps; redirect on tiles; loop detection → gentle stop.
- [ ] Win at nest: confetti, stars by tile count.

## Sandbox
- [ ] Place/remove every item; start unique; ≥1 toy enforced with kind message.
- [ ] Save 3 slots with thumbnails; play own garden; win gives watering-can sticker once.

## Meta
- [ ] Sticker toast on new stickers; album reflects.
- [ ] Chapter end shows story dialog; finale shows picnic scene.
- [ ] Adults sheet updated, toggles work, reset arms double-tap.
- [ ] Progress persists after reload; v1 players get the "ancien joueur" sticker once.
- [ ] Portrait 360×640 and landscape 1024×600: no overflow, targets ≥44px.
- [ ] prefers-reduced-motion: animations collapse, game still playable.
