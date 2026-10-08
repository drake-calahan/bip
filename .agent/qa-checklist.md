# QA checklist — Bip V4 (manual browser pass)

Run after every build (`python tools/build.py`), serve with `python -m http.server 8103 --bind 127.0.0.1`.
`node tools/check-ui.js` covers the automated part; this list is what a human eye adds.

## La carte
- [ ] Hero: Bip, « Jouer » (then « Continuer » + current chapter name), one flower per finished chapter.
- [ ] Four picture buttons (Zoé / fleur / engrenage / étoile) open daily, Mon jardin, machines, album — each speaks its name.
- [ ] Path scrolls; worlds change colour; Bip sits on the next pebble and breathes; done pebbles show stars; future pebbles are pale dots, no padlocks.
- [ ] Opening the map scrolls to Bip only when Bip is not already visible.

## Le niveau
- [ ] Bubble shows the right face (mascot for a chapter intro, then Bip) and reads aloud; tapping the bubble replays or skips to the next line.
- [ ] One story card at the start of a world only; tap anywhere closes it.
- [ ] Board + bubble centred; palette blocks ≥ 50 px; green button 72 px; landscape puts the program on the right.
- [ ] Pond / paint / crates / switches / night / toboggans behave as in V2 (sink, trail, plank, gate, glow, roll).
- [ ] Chapter end: the mascot appears on the Bravo card with its line; no extra modal. Finale: picnic card.

## Les machines
- [ ] Hub shows four real machine drawings, three dots each, a pencil for free play.
- [ ] Balance: baskets drag and snap to notches; release tilts the beam; pollen dots count each side.
- [ ] Light: tap rotates a mirror; the ray travels cell by cell; fireflies glow.
- [ ] Gears: tap cycles 6/12/24 teeth; gears turn with the right direction and speed; Zoé's goal is pictured.
- [ ] Rhythm: tap shifts a friend; cursor walks the timeline; hearts at the meetings.
- [ ] Prediction is optional, icon-only; after the run the right icon lights, the voice says what happened. Success reads the discovery.
- [ ] Hint pulses the object to change. Reset restores. Suivant appears only after success.

## Meta
- [ ] Sticker toast; album shows real pictures, missing ones faded; machine stickers after 3 wins in a family.
- [ ] Adults sheet: toggles work, reset arms on double tap.
- [ ] Progress persists after reload (key `bip-robot-v2`); V2/V3 saves load.
- [ ] 360×640 portrait and 1024×600 landscape: no overflow, targets ≥ 44 px; prefers-reduced-motion still playable.
