/* ===================== Bip V4 — Le grand jardin ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = RM ? 0.4 : 1; // échelle des durées

/* ---------- Icônes ---------- */
const S = (d, w = 12) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const I = {
  arrow: S('M20 50H74M52 28l22 22-22 22', 13),
  fwd: S('M50 84V22M28 44l22-22 22 22', 13),
  tl: S('M68 86V56a22 22 0 0 0-22-22H22M40 14L20 34l20 20', 12),
  tr: S('M32 86V56a22 22 0 0 1 22-22h24M60 14l20 20-20 20', 12),
  jump: `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="82" rx="15" ry="6" fill="currentColor" opacity=".5"/><path d="M17 76C23 30 66 22 80 62" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/><path d="M63 57L81 66L89 47" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  loop: S('M76 52a26 26 0 1 1-8-21M70 13v21H49', 11),
  until: S('M12 50H58M40 30l20 20-20 20M80 20v60', 12),
  fork: S('M50 86V56M50 56L24 26M50 56l26-30M18 36V20h16M82 36V20H66', 11),
  magic: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 10L61 37L90 39L68 58L75 87L50 71L25 87L32 58L10 39L39 37Z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/></svg>`,
  check: S('M22 54l18 18 38-42', 14),
  cross: S('M28 28l44 44M72 28L28 72', 14),
  play: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 18L82 50L30 82Z" fill="currentColor" stroke="currentColor" stroke-width="10" stroke-linejoin="round"/></svg>`,
  stop: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="22" width="56" height="56" rx="10" fill="currentColor"/></svg>`,
  step: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M22 22L62 50L22 78Z" fill="currentColor" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/><rect x="70" y="20" width="12" height="60" rx="6" fill="currentColor"/></svg>`,
  home: S('M16 48L50 18L84 48M26 40V82H74V40M42 82V60H58V82', 9),
  bulb: S('M36 70h28M40 84h20M50 12c-18 0-28 13-28 27 0 12 9 18 12 27h32c3-9 12-15 12-27 0-14-10-27-28-27z', 8),
  speaker: S('M18 40v20h16l20 16V24L34 40zM68 36c6 7 6 21 0 28M78 26c12 13 12 35 0 48', 8),
  trash: S('M18 28h64M40 28V18h20v10M26 28l5 56h38l5-56M42 44v26M58 44v26', 8),
  close: S('M26 26L74 74M74 26L26 74', 11),
  replay: S('M24 50a26 26 0 1 0 8-19M30 14v20h20', 10),
  next: S('M20 50H76M54 26l24 24-24 24', 12),
  lens: S('M42 42m-24 0a24 24 0 1 0 48 0a24 24 0 1 0-48 0M60 60l24 24', 11),
  flag: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M32 92V12" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M32 14h46l-13 15 13 15H32z" fill="currentColor"/></svg>`,
  flagPlant: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M32 92V12" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><path d="M32 14h46l-13 15 13 15H32z" fill="currentColor" opacity=".55"/><path d="M70 62v22M59 73h22" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>`,
  info: S('M50 46v26M50 30v1', 11),
  eraser: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M22 62L52 26a8 8 0 0 1 11-1l15 12a8 8 0 0 1 1 11L49 84H30Z" fill="currentColor" opacity=".25"/><path d="M22 62L52 26a8 8 0 0 1 11-1l15 12a8 8 0 0 1 1 11L49 84H30Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/><path d="M36 70h44" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>`,
  album: S('M22 30a8 8 0 0 1 8-8h40a8 8 0 0 1 8 8v48H30a8 8 0 0 1-8-8zM30 70h48M40 46l8-12 8 10 6-6 8 12', 8),
  garden: S('M50 62V84M50 70C42 70 34 64 32 56M50 76C58 76 66 70 68 62M50 62a14 14 0 1 1 0-28 14 14 0 0 1 0 28z', 7),
  calendar: S('M20 26h60v54H20zM20 42h60M36 18v14M64 18v14M38 56h8M54 56h8', 7),
  cog: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8l7 10 12-3 3 12 12 3-3 12 10 7-10 7 3 12-12 3-3 12-12-3-7 10-7-10-12 3-3-12-12-3 3-12-10-7 10-7-3-12 12-3 3-12 12 3z" fill="currentColor"/><circle cx="50" cy="50" r="14" fill="#fff"/></svg>`,
  flowerIco: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 60V88" stroke="#5FAA62" stroke-width="7" stroke-linecap="round"/><path d="M50 78C40 78 32 72 30 64M50 84C60 84 68 78 70 70" stroke="#5FAA62" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="50" cy="26" r="13" fill="#F2A9C4"/><circle cx="31" cy="40" r="13" fill="#F2A9C4"/><circle cx="69" cy="40" r="13" fill="#F2A9C4"/><circle cx="37" cy="58" r="12" fill="#F7B9D0"/><circle cx="63" cy="58" r="12" fill="#F7B9D0"/><circle cx="50" cy="44" r="10" fill="#FFD36B"/></svg>`,
  sticker: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8L62 36L92 38L69 58L77 88L50 72L23 88L31 58L8 38L38 36Z" fill="#FFC94F" stroke="#E9A923" stroke-width="6" stroke-linejoin="round"/><circle cx="42" cy="50" r="4" fill="#2C3A4C"/><circle cx="58" cy="50" r="4" fill="#2C3A4C"/><path d="M43 60Q50 66 57 60" fill="none" stroke="#2C3A4C" stroke-width="3.4" stroke-linecap="round"/></svg>`,
  heart: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 86C30 70 12 56 12 38C12 26 21 18 31 18C39 18 46 23 50 30C54 23 61 18 69 18C79 18 88 26 88 38C88 56 70 70 50 86Z" fill="currentColor"/></svg>`,
  bonk: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6L58 38L92 30L64 52L86 80L52 64L40 96L36 62L6 70L30 46L10 18L42 34Z" fill="#FFD36B" stroke="#E9A923" stroke-width="5" stroke-linejoin="round"/></svg>`,
  star: on => `<svg viewBox="0 0 100 100" aria-hidden="true" class="${on ? 'on' : ''}"><use href="#star" width="100" height="100" fill="${on ? 'var(--star)' : 'var(--paper-2)'}" stroke="${on ? '#E9A923' : 'var(--line)'}"/></svg>`,
};
const BLOCK_ICON = { r: I.arrow, l: I.arrow, u: I.arrow, d: I.arrow, f: I.fwd, tl: I.tl, tr: I.tr, j: I.jump, g: I.flag, p: I.flagPlant, loop: I.loop, while: I.until, if: I.fork, star: I.magic };
const BLOCK_LABEL = { f: 'avance', tl: 'gauche', tr: 'droite', j: 'saute', g: 'balise', p: 'pose', loop: 'répète', while: 'jusqu’à', if: 'si', star: 'magique' };
const BLOCK_NAME = { r: 'aller à droite', l: 'aller à gauche', u: 'monter', d: 'descendre', f: 'avancer', tl: 'tourner à gauche', tr: 'tourner à droite', j: 'sauter', g: 'aller à la balise', p: 'poser une balise', loop: 'répéter', while: 'répéter jusqu’à', if: 'si', star: 'bloc magique' };
const CTR = ['loop', 'while', 'if'];
const isCtr = t => CTR.includes(t);
const LOOP_NS = [2, 3, 4, 5, 6, 8];
const FULL_PAL = ['l', 'u', 'd', 'r', 'f', 'tl', 'tr', 'j', 'g', 'p', 'loop', 'while', 'if', 'star'];
/* Note de version affichée dans la feuille « Pour les adultes » (bump avec sw.js VERSION) */
const VERSION_NOTES = [
  ['V9 — « Un seul objectif »', 'But unique et cohérent : ramasse tous les jouets (plus de coffre-cible ni de luciole-jouet) ; niveaux filler remplacés par un tournoi de nuit en combos (ch17–19, fin à par 7) ; défis de Zoé et machines archivés dans cette feuille (bonus) ; garde-fous anti-niveau-mort dans check-curve.'],
  ['V8 — « Jusqu’à la balise »', 'Balises : blocs « va à la balise », « pose une balise » et « jusqu’à la balise » ; capteur « jouet devant » ; boucles emboîtées plus lisibles (bloc fautif et parents surlignés, conteneur vide expliqué).'],
  ['V7 — « Les yeux de Bip »', 'Capteur « si un jouet est devant » (3e position du bloc Si) ; plusieurs balises par niveau.'],
  ['V6 — « Les balises de Noctule »', 'Nouveau chapitre : le bloc « balise » envoie Bip au drapeau tout seul (waypoint).'],
  ['V5 — « L’harmonie du jardin »', 'Courbe de difficulté lissée, un seul repère (relatif) après le chapitre 5, marge garantie sur les piles de blocs, défis de Zoé du lundi au dimanche.'],
];
const BALL_DIRS = ['r', 'd', 'l', 'u'];

function robotSVG() {
  return `<svg viewBox="0 0 100 100" class="bipsvg" aria-hidden="true">
  <ellipse class="shadow" cx="50" cy="93" rx="25" ry="5"/>
  <line x1="50" y1="27" x2="50" y2="14" stroke="var(--bip-dark)" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="12" r="6.5" fill="var(--apricot)"/>
  <rect x="12" y="54" width="11" height="18" rx="5.5" fill="var(--bip-dark)"/>
  <rect x="77" y="54" width="11" height="18" rx="5.5" fill="var(--bip-dark)"/>
  <rect x="28" y="80" width="16" height="11" rx="5.5" fill="var(--ink-soft)"/>
  <rect x="56" y="80" width="16" height="11" rx="5.5" fill="var(--ink-soft)"/>
  <rect x="18" y="26" width="64" height="58" rx="21" fill="var(--bip)"/>
  <path d="M24 42C25 33 33 30 43 30" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" opacity=".45"/>
  <rect x="28" y="36" width="44" height="30" rx="12" fill="var(--screen)"/>
  <g class="eyes"><ellipse cx="41" cy="51" rx="4.6" ry="6.2"/><ellipse cx="59" cy="51" rx="4.6" ry="6.2"/></g>
  <g class="eyes-happy"><path d="M35 54Q41 45 47 54"/><path d="M53 54Q59 45 65 54"/></g>
  <g class="eyes-oops"><path d="M37 47L45 55M45 47L37 55"/><path d="M55 47L63 55M63 47L55 55"/></g>
  <circle cx="31" cy="74" r="4" fill="var(--blush)"/><circle cx="69" cy="74" r="4" fill="var(--blush)"/>
  <rect x="44" y="72" width="12" height="4.5" rx="2.25" fill="var(--bip-dark)" opacity=".45"/>
  <g class="drops"><path d="M88 22C88 22 81 31 81 36a7 7 0 0 0 14 0C95 31 88 22 88 22Z" fill="var(--water)"/><path d="M12 30C12 30 7 36 7 39a5 5 0 0 0 10 0C17 36 12 30 12 30Z" fill="var(--water)"/></g>
  <g class="qm"><circle cx="86" cy="20" r="11" fill="#FFFFFF" stroke="var(--line)" stroke-width="2"/><path d="M82 17c0-3 2-5 4.5-5s4.5 2 4.5 4.2c0 3.6-4.5 3.6-4.5 6.6" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="86.5" cy="27" r="1.8" fill="var(--ink)"/></g>
  </svg>`;
}
const toyUse = k => `<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#toy-${k}" width="100" height="100"/></svg>`;
const symUse = k => `<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#${k}" width="100" height="100"/></svg>`;
const TOY_NAME = { b: 'le ballon', n: 'le nounours', c: 'le canard', t: 'la toupie', a: 'le cube' };

/* ---------- Sauvegarde ---------- */
const KEY = 'bip-robot-v2';
function loadSave() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
const save = Object.assign({ stars: {}, voice: true, sound: true, all: false, stickers: [], daily: {}, sandbox: [null, null, null], seen: { w: {}, c: {}, ce: {} } }, loadSave());
function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* stockage indisponible */ } }

/* ---------- Petits sons doux ---------- */
let ac = null;
function audio() {
  if (!save.sound) return null;
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { return null; }
  return ac;
}
function tone(f1, f2, dur, type = 'sine', vol = .08, delay = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .05);
}
function noise(dur, vol = .1) {
  const a = audio(); if (!a) return;
  const b = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; f.type = 'lowpass'; f.frequency.value = 1400; g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start();
}
const SFX = {
  add: () => tone(520, 820, .12, 'sine', .08),
  del: () => tone(560, 240, .14, 'sine', .07),
  tap: () => tone(760, 0, .05, 'sine', .04),
  step: () => tone(392, 0, .08, 'triangle', .05),
  turn: () => tone(440, 560, .12, 'sine', .05),
  look: ok => tone(ok ? 700 : 420, 0, .09, 'sine', .05),
  jump: () => tone(300, 760, .3, 'sine', .07),
  collect: () => { tone(660, 0, .1, 'sine', .07); tone(880, 0, .1, 'sine', .07, .08); tone(1175, 0, .18, 'sine', .07, .16); },
  bump: () => { tone(240, 120, .28, 'triangle', .1); },
  splash: () => noise(.45, .12),
  nope: () => tone(320, 250, .18, 'triangle', .06),
  pad: () => tone(300, 180, .3, 'sine', .07),
  gate: () => { tone(520, 0, .12, 'sine', .06); tone(660, 0, .2, 'sine', .06, .1); },
  push: () => noise(.22, .07),
  plank: () => { noise(.3, .09); tone(180, 120, .25, 'sine', .06, .05); },
  paint: () => { tone(880, 1320, .14, 'sine', .05); },
  balltap: () => tone(500, 620, .05, 'triangle', .05),
  loopdizzy: () => { tone(700, 300, .5, 'sine', .06); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0, .26, 'triangle', .07, i * .13)),
  sticker: () => [784, 988, 1319].forEach((f, i) => tone(f, 0, .22, 'sine', .06, i * .1)),
};
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* ignoré */ } }

/* ---------- Voix ---------- */
let frVoice = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    frVoice = vs.find(v => /^fr[-_]FR/i.test(v.lang) && /google|natural|premium/i.test(v.name)) || vs.find(v => /^fr[-_]FR/i.test(v.lang)) || vs.find(v => /^fr/i.test(v.lang)) || null;
  } catch (e) { /* pas de synthèse vocale */ }
}
if ('speechSynthesis' in window) { pickVoice(); try { speechSynthesis.onvoiceschanged = pickVoice; } catch (e) { /* */ } }
function speak(text) {
  if (!save.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/…/g, '.').replace(/ :/g, ','));
    u.lang = 'fr-FR'; if (frVoice) u.voice = frVoice; u.rate = .92; u.pitch = 1.12;
    speechSynthesis.speak(u);
  } catch (e) { /* */ }
}
function stopVoice() { try { speechSynthesis.cancel(); } catch (e) { /* */ } }

/* ---------- Personnages de l\'histoire ---------- */
const CHARS = {
  bip: { name: 'Bip', art: () => robotSVG() },
  zoe: { name: 'Zoé', art: () => symUse('avatar-zoe') },
  toupie: { name: 'Toupie', art: () => symUse('avatar-toupie') },
  lulu: { name: 'Lulu', art: () => symUse('avatar-lulu') },
  papi: { name: 'Grand-Papa Engrenage', art: () => symUse('avatar-papi') },
  pilou: { name: 'Pilou', art: () => symUse('avatar-pilou') },
  noctule: { name: 'Noctule', art: () => symUse('avatar-noctule') },
  ballon: { name: 'Ballon', art: () => symUse('avatar-ballon') },
  cube: { name: 'Cube', art: () => symUse('avatar-cube') },
  tous: { name: 'Tous ensemble', art: () => symUse('picnic'), wide: true },
};
function playStory(lines, done) {
  const ov = $('#story');
  let k = 0, closed = false;
  stopVoice();
  const show = () => {
    const L = lines[k];
    const ch = CHARS[L.who] || CHARS.zoe;
    $('#storyArt').innerHTML = L.art || ch.art();
    $('#storyArt').classList.toggle('wide', !!(L.wide || ch.wide));
    $('#storyWho').textContent = L.title || ch.name;
    $('#storyLine').textContent = L.line;
    $('#btnStoryNext span:first-child').textContent = k === lines.length - 1 ? (L.cta || 'C\'est parti !') : 'Suite';
    ov.hidden = false;
    speak((L.title ? L.title + '. ' : '') + L.line);
  };
  const advance = () => {
    if (closed) return;
    SFX.tap(); k++;
    if (k < lines.length) show();
    else { closed = true; ov.hidden = true; if (done) done(); }
  };
  $('#storyCard').onclick = advance;
  show();
}

/* ---------- Album de stickers ---------- */
const STICKERS = [];
const CH_STICKER = ['toy-b', 'bush', 'toy-n', 'avatar-toupie', 'avatar-zoe', 'avatar-lulu', 'toy-c', 'toy-t', 'star-gold', 'switchc', 'crate', 'flower', 'avatar-pilou', 'avatar-ballon', 'avatar-noctule', 'box', 'avatar-noctule', 'flag', 'toy-n'];
CHAPTERS.forEach((c, i) => {
  const sym = CH_STICKER[i] || 'toy-b';
  STICKERS.push({ id: 'c' + (i + 1), name: c.name, how: 'Chapitre ' + (i + 1) + ' terminé', icon: () => sym === 'star-gold' ? I.star(true) : symUse(sym) });
});
[['w1', 'Jardin doré', 'Monde 1 : trois étoiles partout'],
 ['w2', 'Promenade dorée', 'Monde 2 : trois étoiles partout'],
 ['w3', 'Atelier doré', 'Monde 3 : trois étoiles partout'],
 ['w4', 'Nuit dorée', 'Monde 4 : trois étoiles partout'],
].forEach(([id, name, how]) => STICKERS.push({ id, name, how, icon: () => I.star(true) }));
STICKERS.push(
  { id: 'v1', name: 'Ancien ami', how: 'Joueur de la première heure', icon: () => robotSVG() },
  { id: 'daily1', name: 'Premier défi', how: 'Un défi de Zoé réussi', icon: () => symUse('avatar-zoe') },
  { id: 'sandbox1', name: 'Petit jardinier', how: 'Premier jardin créé', icon: () => symUse('flower') },
  { id: 'sandboxwin', name: 'Jardin réussi', how: 'Bip a fini ton jardin', icon: () => symUse('box') },
  { id: 'allstars', name: 'Champion étoilé', how: 'Trois étoiles partout !', icon: () => symUse('toy-t') },
  { id: 'm-balance', name: 'La balance', how: 'Les trois défis de la balance', icon: () => machineIcon('balance') },
  { id: 'm-light', name: 'La lumière', how: 'Les trois défis de la lumière', icon: () => machineIcon('light') },
  { id: 'm-gears', name: 'Les roues', how: 'Les trois défis des roues', icon: () => machineIcon('gears') },
  { id: 'm-rhythm', name: 'Le rendez-vous', how: 'Les trois défis du rendez-vous', icon: () => machineIcon('rhythm') },
);
/* Petites icônes des machines (album, hub) */
function machineIcon(fam) {
  if (fam === 'balance') return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 40V86M30 86h40" stroke="#3F8B78" stroke-width="7" stroke-linecap="round"/><rect x="8" y="34" width="84" height="9" rx="4.5" fill="#D9A968" transform="rotate(-8 50 38)"/><rect x="14" y="14" width="18" height="16" rx="5" fill="#E5566B" transform="rotate(-8 50 38)"/><rect x="66" y="26" width="14" height="12" rx="4" fill="#44BC7D" transform="rotate(-8 50 38)"/></svg>`;
  if (fam === 'light') return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="24" cy="50" r="12" fill="#FFC94F"/><path d="M36 50H62" stroke="#FFD36B" stroke-width="6" stroke-linecap="round"/><path d="M62 50V24" stroke="#FFD36B" stroke-width="6" stroke-linecap="round"/><rect x="52" y="40" width="20" height="20" rx="4" fill="#9AD2EE" transform="rotate(45 62 50)"/><circle cx="62" cy="14" r="9" fill="#FFE08A"/></svg>`;
  if (fam === 'gears') return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#CF745F"><path d="M34 14l5 7 8-2 2 8 8 2-2 8 7 5-7 5 2 8-8 2-2 8-8-2-5 7-5-7-8 2-2-8-8-2 2-8-7-5 7-5-2-8 8-2 2-8 8 2z"/></g><circle cx="34" cy="46" r="9" fill="#fff"/><g fill="#7C89C9"><path d="M72 50l4 6 7-2 1 7 7 1-2 7 6 4-6 4 2 7-7 1-1 7-7-2-4 6-4-6-7 2-1-7-7-1 2-7-6-4 6-4-2-7 7-1 1-7 7 2z"/></g><circle cx="72" cy="74" r="7" fill="#fff"/></svg>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#B9C3E6"><circle cx="18" cy="34" r="7"/><circle cx="50" cy="34" r="7"/><circle cx="34" cy="66" r="7"/><circle cx="66" cy="66" r="7"/></g><circle cx="82" cy="34" r="8" fill="#667BB7"/><circle cx="82" cy="66" r="8" fill="#E5566B"/><path d="M82 58C76 50 64 54 68 62L82 76L96 62C100 54 88 50 82 58Z" fill="#FF8878" transform="translate(0 -30) scale(1)"/></svg>`;
}
const hasSticker = id => save.stickers.includes(id);
function award(id) {
  if (hasSticker(id)) return;
  const st = STICKERS.find(s => s.id === id);
  if (!st) return;
  save.stickers.push(id); persist();
  SFX.sticker(); buzz([20, 40, 20]);
  const t = document.createElement('div');
  t.className = 'sticker-toast';
  t.innerHTML = `<span class="ico">${st.icon()}</span><span><b>${st.name}</b><small>Dans l'album de Zoé !</small></span>`;
  document.body.append(t);
  setTimeout(() => t.remove(), 3600);
  if (!$('#home').hidden) renderHome();
}
function checkStickers() {
  CHAPTERS.forEach((c, ci) => {
    const lvls = LEVELS.filter(l => l.ch === ci);
    if (lvls.length && lvls.every(l => (save.stars[l.id] || 0) > 0)) award('c' + (ci + 1));
  });
  WORLDS.forEach((w, wi) => {
    const lvls = LEVELS.filter(l => l.ch >= 0 && CHAPTERS[l.ch].w === wi);
    if (lvls.length && lvls.every(l => (save.stars[l.id] || 0) === 3)) award('w' + (wi + 1));
  });
  if (LEVELS.filter(l => l.ch >= 0).every(l => (save.stars[l.id] || 0) === 3)) award('allstars');
}

/* ---------- Données de niveau ---------- */
const TONES = { sky: 'var(--move)', leaf: 'var(--leaf)', water: '#5DB6DE', lilac: 'var(--jump)', sun: '#F5B83A', teal: 'var(--rel)', coral: '#F58A70', pink: '#E585B4', peach: '#F7A55E', rust: '#C97B4A', wood: '#B08954', gold: '#E3B341', orange: '#F58A70', slate: '#7286A6', indigo: '#7C89C9', night: '#6A6DAE' };
I.bush = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="30" cy="60" r="20" fill="currentColor"/><circle cx="70" cy="60" r="20" fill="currentColor"/><circle cx="50" cy="42" r="24" fill="currentColor"/></svg>`;
I.drop = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 12C50 12 24 44 24 62a26 26 0 0 0 52 0C76 44 50 12 50 12Z" fill="currentColor"/></svg>`;
I.mushroom = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="44" y="52" width="12" height="24" rx="5" fill="currentColor" opacity=".55"/><path d="M22 56C22 34 34 22 50 22C66 22 78 34 78 56C78 62 72 66 64 66H36C28 66 22 62 22 56Z" fill="currentColor"/></svg>`;
I.crate = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="18" y="20" width="64" height="60" rx="10" fill="currentColor"/><path d="M18 36h64M18 64h64M36 20v60M64 20v60" stroke="var(--card)" stroke-width="6"/></svg>`;
I.flower = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 58V84" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="40" r="13" fill="currentColor"/><circle cx="33" cy="52" r="13" fill="currentColor"/><circle cx="67" cy="52" r="13" fill="currentColor"/><circle cx="40" cy="66" r="11" fill="currentColor"/><circle cx="60" cy="66" r="11" fill="currentColor"/></svg>`;
I.pad2 = `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="54" rx="36" ry="24" fill="currentColor"/><path d="M50 34V72M50 48C42 44 34 42 27 45" stroke="var(--card)" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
I.firefly = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="52" r="30" fill="currentColor" opacity=".4"/><path d="M50 28C40 28 35 38 37 50C39 62 44 72 50 72C56 72 61 62 63 50C65 38 60 28 50 28Z" fill="currentColor"/></svg>`;
I.ball = `<svg viewBox="0 0 100 100" aria-hidden="true" width="100%" height="100%"><use href="#ball" width="100" height="100"/></svg>`;
const CH_ICON = [I.arrow, I.bush, I.jump, I.loop, I.tr, I.pad2, I.until, I.fork, I.magic, I.mushroom, I.crate, I.flower, I.ball, I.lens, I.firefly, I.star(true)];
const DAILY_IDX = (d => (d.getDay() + 6) % 7)(new Date());
const DAILY_NAMES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const DAILY_LEVELS = LEVELS.filter(l => l.daily);
const dailyLevel = () => DAILY_LEVELS[DAILY_IDX];
/* Dernier niveau de l'aventure (les défis de Zoé vivent après) */
const LAST_STORY = LEVELS.reduce((a, l, i) => (l.ch >= 0 ? i : a), 0);

/* Préparation des niveaux : solution de référence, par, variantes */
LEVELS.forEach(lv => {
  lv.nv = lv.variants ? lv.variants.length : 1;
  if (lv.mode === 'ball') { lv.ref = []; lv.refFn = []; lv.par = (lv.tiles || []).length; return; }
  lv.refFn = lv.fn ? parseProg(lv.fn) : [];
  lv.ref = lv.sol ? parseProg(lv.sol) : (solve(lv, lv.pal) || []).map((t, i) => ({ t, id: 'h' + i }));
  lv.par = countBlocks(lv.ref) + countBlocks(lv.refFn);
});

/* ---------- Écrans ---------- */
const STANDALONE = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
function show(id) {
  if (id !== 'game') { G.session++; G.abort = true; G.busy = false; G.step = null; setRunning(false); }
  $('#home').hidden = id !== 'home';
  $('#game').hidden = id !== 'game';
  $('#sandbox').hidden = id !== 'sandbox';
  $('#lab').hidden = id !== 'lab';
  $('#story').hidden = true;
  $('#win').hidden = true;
  $('#machines').hidden = true;
  $('#album').hidden = true;
  if (typeof L !== 'undefined' && id !== 'lab') { L.token++; L.running = false; }
  if (id === 'home') { renderHome(); hideHand(); stopVoice(); }
}
