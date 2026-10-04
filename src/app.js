/* ===================== Bip le robot — application ===================== */
(function () {
'use strict';
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
  lock: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="44" width="56" height="42" rx="10" fill="currentColor"/><path d="M34 46V34a16 16 0 0 1 32 0v12" fill="none" stroke="currentColor" stroke-width="9"/></svg>`,
  info: S('M50 46v26M50 30v1', 11),
  bush: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="30" cy="60" r="20" fill="currentColor"/><circle cx="70" cy="60" r="20" fill="currentColor"/><circle cx="50" cy="42" r="24" fill="currentColor"/></svg>`,
  drop: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 12C50 12 24 44 24 62a26 26 0 0 0 52 0C76 44 50 12 50 12Z" fill="currentColor"/></svg>`,
  star: on => `<svg viewBox="0 0 100 100" aria-hidden="true" class="${on ? 'on' : ''}"><use href="#star" width="100" height="100" fill="${on ? 'var(--star)' : 'var(--paper-2)'}" stroke="${on ? '#E9A923' : 'var(--line)'}"/></svg>`,
  bonk: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6L58 38L92 30L64 52L86 80L52 64L40 96L36 62L6 70L30 46L10 18L42 34Z" fill="#FFD36B" stroke="#E9A923" stroke-width="5" stroke-linejoin="round"/></svg>`,
};
const BLOCK_ICON = { r: I.arrow, l: I.arrow, u: I.arrow, d: I.arrow, f: I.fwd, tl: I.tl, tr: I.tr, j: I.jump, loop: I.loop, while: I.until, if: I.fork, star: I.magic };
const BLOCK_LABEL = { f: 'avance', tl: 'gauche', tr: 'droite', j: 'saute', loop: 'répète', while: 'jusqu’à', if: 'si', star: 'magique' };
const BLOCK_NAME = { r: 'aller à droite', l: 'aller à gauche', u: 'monter', d: 'descendre', f: 'avancer', tl: 'tourner à gauche', tr: 'tourner à droite', j: 'sauter', loop: 'répéter', while: 'répéter jusqu’à', if: 'si', star: 'bloc magique' };
const CTR = ['loop', 'while', 'if'];
const isCtr = t => CTR.includes(t);
const LOOP_NS = [2, 3, 4, 5, 6, 8];

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

/* ---------- Sauvegarde (facultative) ---------- */
const KEY = 'bip-robot-v1';
function loadSave() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
const save = Object.assign({ stars: {}, voice: true, sound: true, all: false }, loadSave());
function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* stockage indisponible */ } }

/* ---------- Sons doux ---------- */
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
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0, .26, 'triangle', .07, i * .13)),
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

/* ---------- Données de niveau ---------- */
LEVELS.forEach(lv => {
  lv.refFn = lv.fn ? parseProg(lv.fn) : [];
  lv.ref = lv.sol ? parseProg(lv.sol) : (solve(lv, lv.pal) || []).map((t, i) => ({ t, id: 'h' + i }));
  lv.par = countBlocks(lv.ref) + countBlocks(lv.refFn);
  lv.nv = lv.variants ? lv.variants.length : 1;
});
const TONES = { sky: 'var(--move)', leaf: 'var(--leaf)', water: '#5DB6DE', lilac: 'var(--jump)', sun: '#F5B83A', teal: 'var(--rel)', coral: '#F58A70', pink: '#E585B4', peach: '#F7A55E', slate: '#7286A6' };
const CH_ICON = [I.arrow, I.bush, I.drop, I.jump, I.loop, I.tr, I.until, I.fork, I.magic, I.lens];
const unlocked = i => save.all || i === 0 || (save.stars[LEVELS[i - 1].id] || 0) > 0;
const nextIndex = () => { const i = LEVELS.findIndex(l => !(save.stars[l.id] > 0)); return i < 0 ? LEVELS.length - 1 : i; };

/* ---------- Écrans ---------- */
const STANDALONE = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
function show(id) {
  $('#home').hidden = id !== 'home';
  $('#game').hidden = id !== 'game';
  if (id === 'home') { renderHome(); hideHand(); stopVoice(); }
}

function renderHome() {
  const wrap = $('#chapters');
  const nx = nextIndex();
  wrap.innerHTML = CHAPTERS.map((c, ci) => {
    const lvls = LEVELS.map((l, i) => [l, i]).filter(([l]) => l.ch === ci);
    const sep = ci === 5 ? '<div class="chap-sep">Pour aller plus loin</div>' : '';
    return `${sep}<article class="chap" data-tone="${c.tone}">
      <div class="chap-head"><span class="chap-num">${ci + 1}</span><div><h2>${c.name}</h2><p>${c.hint}</p></div><span class="chap-ico">${CH_ICON[ci] || ''}</span></div>
      <div class="lvls">${lvls.map(([l, i]) => {
        const st = save.stars[l.id] || 0, open = unlocked(i);
        return `<button class="lvl${i === nx && open ? ' next' : ''}" data-i="${i}" ${open ? '' : 'disabled'} aria-label="Niveau ${l.id}${open ? (st ? ', ' + st + ' étoiles' : '') : ', fermé'}">
          <span class="n">${open ? l.id : I.lock}</span><span class="st">${open ? [1, 2, 3].map(k => I.star(k <= st)).join('') : ''}</span></button>`;
      }).join('')}</div></article>`;
  }).join('');
  $$('.lvl', wrap).forEach(b => b.addEventListener('click', () => { audio(); openLevel(+b.dataset.i); }));
}

/* ---------- État du jeu ---------- */
let UID = 1;
const newId = () => 'k' + (UID++);
const G = { i: 0, lv: null, P: null, v: 0, prog: [], fn: [], target: 'main', busy: false, abort: false, step: null, fails: 0, dirty: false, last: null, hintT: 0, spd: 1, told: {} };
const hasFn = () => G.lv.pal.includes('star');
const totalBlocks = () => countBlocks(G.prog) + countBlocks(G.fn);

function openLevel(i) {
  if (!unlocked(i)) return;
  G.i = i; G.lv = LEVELS[i];
  G.prog = G.lv.start ? parseProg(G.lv.start, newId) : [];
  G.fn = G.lv.startFn ? parseProg(G.lv.startFn, newId) : [];
  G.target = 'main'; G.fails = 0; G.step = null; G.abort = true; G.busy = false; G.dirty = false; G.last = null; G.told = {};
  $('#win').hidden = true;
  show('game');
  setRunning(false);
  const tone = TONES[CHAPTERS[G.lv.ch].tone];
  $('#lvlPill').innerHTML = `<i style="background:${tone}"></i>Niveau ${G.lv.id}`;
  $('#btnHint').classList.remove('glow'); $('#btnStep').classList.remove('glow');
  $('#fnRow').hidden = !hasFn();
  buildVars();
  setVariant(0);
  buildPalette(); renderProg();
  say(G.lv.text);
  if (STANDALONE) { try { history.pushState({ g: 1 }, ''); } catch (e) { /* */ } }
}

function say(text, quiet) {
  const m = $('#msg'); m.textContent = text;
  const b = $('#bubble'); b.classList.remove('new'); void b.offsetWidth; b.classList.add('new');
  if (!quiet) speak(text);
}

/* ---------- Jardins (variantes) ---------- */
function buildVars() {
  const box = $('#vars');
  if (G.lv.nv < 2) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  box.innerHTML = `<span>Jardins</span>` + Array.from({ length: G.lv.nv }, (_, v) => `<button data-v="${v}" aria-label="Voir le jardin ${v + 1}">${v + 1}</button>`).join('');
  $$('button', box).forEach(b => b.addEventListener('click', () => {
    if (G.busy) return;
    G.step = null; clearMarks(); hideHint();
    setVariant(+b.dataset.v); SFX.tap();
  }));
}
function setVariant(v) {
  G.v = v; G.P = parseLevel(G.lv, v);
  buildBoard(); buildTray();
  $$('#vars button').forEach(b => b.classList.toggle('on', +b.dataset.v === v));
}
function varMark(v, cls) { const b = $(`#vars button[data-v="${v}"]`); if (b) { b.classList.remove('pass', 'fail'); b.classList.add(cls); } }

/* ---------- Plateau ---------- */
function buildBoard() {
  const P = G.P, b = $('#board');
  b.style.setProperty('--cols', P.w); b.style.setProperty('--rows', P.h);
  let h = '';
  P.cells.forEach((k, idx) => {
    if (k === 'grass') return;
    const x = idx % P.w, y = (idx / P.w) | 0;
    h += `<div class="it ${k}" style="--x:${x};--y:${y}">${symUse(k)}</div>`;
  });
  P.toys.forEach((t, i) => { h += `<div class="it toy" data-i="${i}" style="--x:${t.x};--y:${t.y}">${toyUse(t.k)}</div>`; });
  h += `<div class="fx" id="fx"></div>`;
  const facing = G.lv.pal.some(t => ['j', 'f', 'tl', 'tr'].includes(t));
  h += `<div class="it robot" id="robot" data-face="${P.face}" style="--x:${P.start[0]};--y:${P.start[1]}"><div class="sprite">${robotSVG()}</div>${facing ? '<i class="facing"></i>' : ''}</div>`;
  b.innerHTML = h;
  G.dirty = false;
  fitBoard();
}
function fitBoard() {
  if (!G.P) return;
  const r = $('#boardWrap').getBoundingClientRect();
  if (!r.width || !r.height) return;
  const vars = $('#vars'), vh = vars.hidden ? 0 : vars.offsetHeight + 8;
  const cell = Math.max(24, Math.floor(Math.min((r.width - 16) / G.P.w, (r.height - vh - 16) / G.P.h, 112)));
  $('#board').style.setProperty('--cell', cell + 'px');
  placeHand();
}
function resetBoard() {
  const R = $('#robot'); if (!R) return;
  R.classList.add('instant'); R.classList.remove('happy', 'oops', 'wet', 'puzzled', 'jumping');
  R.style.setProperty('--x', G.P.start[0]); R.style.setProperty('--y', G.P.start[1]); R.dataset.face = G.P.face;
  R.style.transitionDuration = '';
  void R.offsetWidth; R.classList.remove('instant');
  $$('.it.toy').forEach(t => t.classList.remove('got'));
  $$('#tray .tt').forEach(t => t.classList.remove('got'));
  $('#fx').innerHTML = '';
  G.dirty = false;
}
function buildTray() {
  const P = G.P;
  let h = P.toys.map((t, i) => `<span class="tt" data-i="${i}" title="${TOY_NAME[t.k]}">${toyUse(t.k)}</span>`).join('');
  if (P.box) h += `<span class="to">${I.next}</span><span class="tt box-t" style="filter:none">${symUse('box')}</span>`;
  $('#tray').innerHTML = h;
}

/* ---------- Programme : accès aux données ---------- */
function makeItem(t) {
  const id = newId();
  if (t === 'loop') return { t, id, n: 2, body: [] };
  if (t === 'while') return { t, id, c: 'free', body: [] };
  if (t === 'if') return { t, id, c: 'puddle', body: [], els: [] };
  return { t, id };
}
function findItem(id) {
  function walk(list, root, ptype) {
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      if (it.id === id) return { list, idx: i, it, root, ptype };
      for (const sub of [it.body, it.els]) if (sub) { const r = walk(sub, root, it.t); if (r) return r; }
    }
    return null;
  }
  return walk(G.prog, 'main', 'main') || walk(G.fn, 'fn', 'fn');
}
function locate(cid) {
  if (cid === 'main') return { list: G.prog, type: 'main', root: 'main' };
  if (cid === 'fn') return hasFn() ? { list: G.fn, type: 'fn', root: 'fn' } : null;
  const els = cid.endsWith(':else'), id = els ? cid.slice(0, -5) : cid;
  const f = findItem(id);
  if (!f || !isCtr(f.it.t)) return null;
  return { list: els ? f.it.els : f.it.body, type: f.it.t, root: f.root };
}
const containsStar = it => it.t === 'star' || (it.body || []).some(containsStar) || (it.els || []).some(containsStar);
function canNest(loc, it) {
  if (!loc) return false;
  if (loc.root === 'fn' && containsStar(it)) return false;
  if (it.t === 'loop') return loc.type === 'main' || loc.type === 'fn';
  if (it.t === 'while') return ['main', 'fn', 'loop'].includes(loc.type);
  if (it.t === 'if') return ['main', 'fn', 'loop', 'while'].includes(loc.type);
  return true;
}

/* ---------- Palette et rendu du programme ---------- */
function blockHTML(t, id, inPal) {
  const lab = inPal && BLOCK_LABEL[t] ? `<b>${BLOCK_LABEL[t]}</b>` : '';
  return `<div class="blk${id && id === G.last ? ' in' : ''}" data-t="${t}"${id ? ` data-id="${id}"` : ''} role="button" tabindex="0" aria-label="${BLOCK_NAME[t]}">${BLOCK_ICON[t]}${lab}</div>`;
}
function buildPalette() {
  const p = $('#palette');
  p.innerHTML = G.lv.pal.map(t => blockHTML(t, null, true)).join('');
  $$('.blk', p).forEach(el => {
    el.addEventListener('pointerdown', e => press(e, { from: 'pal', t: el.dataset.t }, el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addBlock(el.dataset.t); } });
  });
}
const slotHTML = cid => `<div class="slot${G.target === cid ? ' on' : ''}" data-cid="${cid}" role="button" aria-label="Ajouter ici">+</div>`;
const seqHTML = (list, cid) => list.map(itemHTML).join('') + slotHTML(cid);
const itemHTML = it => isCtr(it.t) ? ctrHTML(it) : blockHTML(it.t, it.id);
function pillHTML(it) {
  if (it.t === 'loop') return '×' + it.n;
  if (it.t === 'while') return it.c === 'toys' ? toyUse('b') : symUse('bush');
  return it.c === 'puddle' ? symUse('puddle') : symUse('bush');
}
function pillLabel(it) {
  if (it.t === 'loop') return `Répéter ${it.n} fois`;
  if (it.t === 'while') return it.c === 'toys' ? 'Jusqu’à avoir tous les jouets' : 'Jusqu’à un obstacle';
  return it.c === 'puddle' ? 'Si une flaque est devant' : 'Si un obstacle est devant';
}
function ctrHTML(it) {
  const tThen = G.target === it.id, tElse = G.target === it.id + ':else';
  const cls = `ctr ${it.t}${tThen || tElse ? ' target' : ''}${it.id === G.last ? ' in' : ''}`;
  const head = `<div class="ctr-head"><button class="ctr-x" aria-label="Enlever le bloc ${BLOCK_NAME[it.t]}">${BLOCK_ICON[it.t]}</button><button class="ctr-p" aria-label="${pillLabel(it)}">${pillHTML(it)}</button></div>`;
  if (it.t === 'if') {
    return `<div class="${cls}" data-id="${it.id}">${head}<div class="if-rows">
      <div class="if-row"><span class="if-lab yes">${I.check}</span><div class="seq ctr-body${tThen ? ' target' : ''}" data-cid="${it.id}">${seqHTML(it.body, it.id)}</div></div>
      <div class="if-row"><span class="if-lab no">${I.cross}</span><div class="seq ctr-body${tElse ? ' target' : ''}" data-cid="${it.id}:else">${seqHTML(it.els, it.id + ':else')}</div></div>
    </div></div>`;
  }
  return `<div class="${cls}" data-id="${it.id}">${head}<div class="seq ctr-body" data-cid="${it.id}">${seqHTML(it.body, it.id)}</div></div>`;
}
function renderProg() {
  if (G.target !== 'main' && !locate(G.target)) G.target = 'main';
  $('#main').innerHTML = seqHTML(G.prog, 'main');
  if (hasFn()) { $('#fnSeq').innerHTML = seqHTML(G.fn, 'fn'); $('#fnRow').classList.toggle('target', G.target === 'fn'); }
  bindProg($('#progCard'));
  updateBatt();
  G.last = null;
  requestAnimationFrame(placeHand);
}
function bindProg(root) {
  $$('.seq .blk', root).forEach(el => {
    el.addEventListener('pointerdown', e => press(e, { from: 'prog', id: el.dataset.id }, el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeItem(el.dataset.id, el); } });
  });
  $$('.ctr', root).forEach(c => {
    const id = c.dataset.id;
    $(':scope > .ctr-head .ctr-x', c).addEventListener('pointerdown', e => press(e, { from: 'prog', id, head: true }, c));
    $(':scope > .ctr-head .ctr-p', c).addEventListener('click', e => { e.stopPropagation(); if (!G.busy) cyclePill(id); });
  });
  $$('.slot', root).forEach(s => s.addEventListener('click', e => { e.stopPropagation(); setTarget(s.dataset.cid); }));
  $$('.ctr-body', root).forEach(b => b.addEventListener('click', e => { if (e.target.closest('.blk, .ctr-head, .slot')) return; e.stopPropagation(); setTarget(b.dataset.cid); }));
}
function updateBatt() {
  const b = $('#batts');
  if (!G.lv.max) { b.hidden = true; return; }
  const left = Math.max(0, G.lv.max - totalBlocks());
  b.hidden = false;
  b.innerHTML = Array.from({ length: G.lv.max }, (_, k) => `<i class="batt${k < left ? ' full' : ''}"></i>`).join('') + `<span class="bl">piles</span>`;
  b.setAttribute('aria-label', `${left} piles restantes sur ${G.lv.max}`);
}

/* ---------- Programme : modifications ---------- */
function setTarget(cid) {
  if (G.busy) return;
  if (!locate(cid)) cid = 'main';
  if (G.target !== cid) { G.target = cid; SFX.tap(); renderProg(); }
}
function canAdd() {
  if (!G.lv.max || totalBlocks() < G.lv.max) return true;
  const b = $('#batts'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  SFX.nope(); buzz(30);
  const helper = G.lv.pal.includes('star') ? ' Le bloc magique peut t’aider.' : G.lv.pal.includes('while') ? ' Les blocs Jusqu’à et Si peuvent t’aider.' : G.lv.pal.includes('loop') ? ' Le bloc Répéter peut t’aider.' : '';
  say(`Plus de piles ! Bip ne peut avoir que ${G.lv.max} blocs.${helper}`);
  return false;
}
function insertItem(it, cid, idx) {
  let loc = locate(cid);
  if (!canNest(loc, it)) {
    const root = loc ? loc.root : 'main';
    cid = root; loc = locate(root); idx = null;
    if (!canNest(loc, it)) { cid = 'main'; loc = locate('main'); }
  }
  if (idx == null || idx > loc.list.length) idx = loc.list.length;
  loc.list.splice(idx, 0, it);
  return cid;
}
function addBlock(t, cid = G.target, idx = null, item) {
  if (G.busy || !canAdd()) return false;
  const it = item || makeItem(t);
  insertItem(it, cid, idx);
  if (isCtr(t)) G.target = it.id;
  G.last = it.id;
  SFX.add();
  if (t === 'star' && !G.fn.length) G.target = 'fn';
  edited();
  explainFirst(t);
  return true;
}
function explainFirst(t) {
  if (G.told[t]) return;
  const msg = {
    loop: 'Mets des blocs dans le bloc jaune, puis touche le rond blanc pour choisir combien de fois.',
    while: 'Mets des blocs dans le bloc Jusqu’à. Le rond blanc montre quand il s’arrête : touche-le pour changer.',
    if: 'Mets des blocs dans la ligne verte et dans la ligne grise. Le rond blanc montre ce que Bip regarde.',
    star: G.fn.length ? null : 'Maintenant, remplis la ligne étoile en haut : ce sont les blocs que fait l’étoile.',
  }[t];
  if (!msg) return;
  G.told[t] = true;
  say(msg);
}
function removeItem(id, el, unwrap) {
  const f = findItem(id); if (!f) return;
  if (el) poofAt(el);
  if (isCtr(f.it.t) && unwrap) f.list.splice(f.idx, 1, ...f.it.body, ...(f.it.els || []));
  else f.list.splice(f.idx, 1);
  SFX.del();
  edited();
}
function cyclePill(id) {
  const f = findItem(id); if (!f) return;
  const it = f.it;
  let msg;
  if (it.t === 'loop') { it.n = LOOP_NS[(LOOP_NS.indexOf(it.n) + 1) % LOOP_NS.length]; msg = `Bip va répéter ${it.n} fois.`; }
  else if (it.t === 'while') { it.c = it.c === 'free' ? 'toys' : 'free'; msg = it.c === 'toys' ? 'Bip répète jusqu’à avoir tous les jouets.' : 'Bip répète jusqu’à ce qu’un obstacle soit devant lui.'; }
  else { it.c = it.c === 'puddle' ? 'obst' : 'puddle'; msg = it.c === 'puddle' ? 'Si une flaque est devant Bip : ligne verte. Sinon : ligne grise.' : 'Si un obstacle est devant Bip : ligne verte. Sinon : ligne grise.'; }
  SFX.tap(); edited();
  const p = $(`#progCard .ctr[data-id="${id}"] > .ctr-head .ctr-p`);
  if (p) p.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 250 });
  say(msg);
}
function edited() {
  G.step = null;
  if (G.dirty) resetBoard();
  hideHint();
  $$('#vars button').forEach(b => b.classList.remove('pass', 'fail'));
  renderProg();
}
function clearNow() {
  $$('#progCard .now, #progCard .yes, #progCard .no, #progCard .br-then, #progCard .br-else').forEach(e => e.classList.remove('now', 'yes', 'no', 'br-then', 'br-else'));
}
function clearMarks() {
  clearNow();
  $$('#progCard .bad, #progCard .done').forEach(e => e.classList.remove('bad', 'done'));
  $$('#progCard .ctr').forEach(c => { const f = findItem(c.dataset.id); if (f) $(':scope > .ctr-head .ctr-p', c).innerHTML = pillHTML(f.it); });
}

/* ---------- Glisser-déposer tactile ---------- */
let D = null;
function press(e, src, el) {
  if (G.busy || (e.button !== undefined && e.button > 0)) return;
  e.preventDefault();
  audio();
  D = { src, el, sx: e.clientX, sy: e.clientY, pid: e.pointerId, drag: false };
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
}
function unlisten() {
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerup', onUp);
  window.removeEventListener('pointercancel', onCancel);
}
function onMove(e) {
  if (!D || e.pointerId !== D.pid) return;
  if (!D.drag) { if (Math.hypot(e.clientX - D.sx, e.clientY - D.sy) < 10) return; beginDrag(); }
  e.preventDefault();
  moveDrag(e);
}
function onUp(e) {
  if (!D || e.pointerId !== D.pid) return;
  const d = D; D = null; unlisten();
  if (d.drag) dropDrag(d); else tapItem(d);
}
function onCancel(e) {
  if (!D || e.pointerId !== D.pid) return;
  const d = D; D = null; unlisten();
  if (d.drag) { d.ghost.remove(); d.ph.remove(); if (d.orig) d.orig.classList.remove('lifting'); $('#game').classList.remove('dragging'); }
}
function tapItem(d) {
  if (d.src.from === 'pal') addBlock(d.src.t);
  else removeItem(d.src.id, d.el, !!d.src.head);
}
function beginDrag() {
  D.drag = true;
  if (D.src.from === 'pal') D.item = makeItem(D.src.t);
  else { const f = findItem(D.src.id); D.item = f ? f.it : makeItem('f'); }
  const srcEl = D.el;
  const r = srcEl.getBoundingClientRect();
  const g = srcEl.cloneNode(true);
  g.classList.add('ghost'); g.classList.remove('in', 'now', 'bad', 'done');
  g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
  document.body.append(g);
  D.ghost = g; D.gw = r.width; D.gh = r.height;
  if (D.src.from === 'prog') { D.orig = srcEl; srcEl.classList.add('lifting'); }
  D.ph = document.createElement('div'); D.ph.className = 'ph';
  $('#game').classList.add('dragging');
  hideHand();
  SFX.tap();
}
function blocksOf(seq) { return [...seq.children].filter(c => (c.classList.contains('blk') || c.classList.contains('ctr')) && !c.classList.contains('lifting')); }
function moveDrag(e) {
  D.ghost.style.transform = `translate(${e.clientX - Math.min(D.gw, 70) / 2}px, ${e.clientY - Math.min(D.gh, 70) * .9}px) rotate(-3deg) scale(1.04)`;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  let seq = el && el.closest('.seq');
  if (seq && seq.closest('.lifting')) seq = null;
  if (!seq && el && el.closest('#progCard')) seq = el.closest('.fn-row') ? $('#fnSeq') : $('#main');
  while (seq && !canNest(locate(seq.dataset.cid), D.item)) seq = seq.parentElement && seq.parentElement.closest('.seq');
  if (!seq && D.item && el && el.closest('#progCard')) seq = $('#main');
  if (!seq || !canNest(locate(seq.dataset.cid), D.item)) { D.ph.remove(); return; }
  let before = null;
  for (const c of blocksOf(seq)) {
    const r = c.getBoundingClientRect();
    if (e.clientY < r.top) { before = c; break; }
    if (e.clientY <= r.bottom && e.clientX < r.left + r.width / 2) { before = c; break; }
  }
  const ref = before || seq.querySelector(':scope > .slot');
  if (D.ph.parentElement !== seq || D.ph.nextElementSibling !== ref) seq.insertBefore(D.ph, ref);
}
function dropDrag(d) {
  const placed = d.ph.isConnected;
  let cid = 'main', idx = 0;
  if (placed) {
    const seq = d.ph.parentElement; cid = seq.dataset.cid;
    for (let c = d.ph.previousElementSibling; c; c = c.previousElementSibling) {
      if ((c.classList.contains('blk') || c.classList.contains('ctr')) && !c.classList.contains('lifting')) idx++;
    }
  }
  const gr = d.ghost.getBoundingClientRect();
  d.ghost.remove(); d.ph.remove();
  $('#game').classList.remove('dragging');
  if (d.src.from === 'pal') {
    if (placed) addBlock(d.src.t, cid, idx, d.item); else requestAnimationFrame(placeHand);
    return;
  }
  const f = findItem(d.src.id);
  if (!f) { renderProg(); return; }
  f.list.splice(f.idx, 1);
  if (!placed) {
    poofAt(null, gr.left + Math.min(gr.width, 70) / 2, gr.top + Math.min(gr.height, 70) / 2);
    SFX.del(); edited(); return;
  }
  insertItem(f.it, cid, idx);
  G.last = f.it.id;
  SFX.add(); edited();
}
function poofAt(el, x, y) {
  if (el) { const r = el.getBoundingClientRect(); x = r.left + Math.min(r.width, 70) / 2; y = r.top + Math.min(r.height, 70) / 2; }
  if (RM) return;
  const p = document.createElement('div'); p.className = 'poof'; p.style.left = x + 'px'; p.style.top = y + 'px';
  for (let k = 0; k < 7; k++) {
    const a = k / 7 * Math.PI * 2, i = document.createElement('i');
    i.style.setProperty('--dx', Math.cos(a) * 30 + 'px'); i.style.setProperty('--dy', Math.sin(a) * 30 + 'px');
    p.append(i);
  }
  document.body.append(p); setTimeout(() => p.remove(), 500);
}

/* ---------- Exécution ---------- */
function setRunning(on) {
  $('#game').classList.toggle('running', !!on);
  const b = $('#btnRun');
  b.innerHTML = on === true ? I.stop : I.play;
  b.setAttribute('aria-label', on === true ? 'Arrêter Bip' : 'Lancer le programme');
  if (on) hideHand(); else requestAnimationFrame(placeHand);
}
function emptyNudge() {
  SFX.nope();
  say('Le programme est vide. Touche un bloc en bas pour l’ajouter.');
  $('#palette').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 400, iterations: 2 });
}
const speedFor = sim => { const n = sim.steps.length; return n > 40 ? .5 : n > 24 ? .65 : n > 14 ? .8 : 1; };
async function runAll() {
  if (G.busy) { G.abort = true; return; }
  if (!totalBlocks() || !G.prog.length) { emptyNudge(); return; }
  stopVoice(); G.step = null; clearMarks(); hideHint();
  const nv = G.lv.nv;
  G.busy = true; G.abort = false; setRunning(true);
  $$('#vars button').forEach(b => b.classList.remove('pass', 'fail'));
  for (let v = 0; v < nv; v++) {
    if (nv > 1) { setVariant(v); say(`Jardin ${v + 1}`, true); await sleep(500 * T); if (G.abort) break; }
    else { resetBoard(); say('C’est parti !', true); }
    clearMarks();
    const sim = simulate(G.lv, G.prog, G.fn, v);
    G.spd = speedFor(sim); G.dirty = true;
    for (const st of sim.steps) { if (G.abort) break; await doStep(st); }
    if (G.abort) break;
    if (sim.result !== 'win') { G.busy = false; setRunning(false); if (nv > 1) varMark(v, 'fail'); finish(sim, nv > 1 ? v : null); return; }
    if (nv > 1) {
      varMark(v, 'pass'); clearNow();
      $('#robot').classList.add('happy'); SFX.collect();
      await sleep(800 * T);
    }
  }
  const aborted = G.abort; G.busy = false; setRunning(false);
  if (aborted) { resetBoard(); clearMarks(); say('Stop ! Bip revient au départ.'); return; }
  win();
}
const CHECK_SAY = {
  'if-puddle': ok => ok ? 'Une flaque devant : Bip prend la ligne verte.' : 'Pas de flaque devant : Bip prend la ligne grise.',
  'if-obst': ok => ok ? 'Un obstacle devant : Bip prend la ligne verte.' : 'Pas d’obstacle devant : Bip prend la ligne grise.',
  'while-free': ok => ok ? 'La route est libre : Bip continue.' : 'Un obstacle devant : la boucle s’arrête.',
  'while-toys': ok => ok ? 'Il manque des jouets : Bip continue.' : 'Tous les jouets sont là : la boucle s’arrête.',
};
async function stepOnce() {
  if (G.busy) return;
  if (!G.prog.length) { emptyNudge(); return; }
  if (!G.step) { stopVoice(); resetBoard(); clearMarks(); hideHint(); G.step = { sim: simulate(G.lv, G.prog, G.fn, G.v), i: 0 }; G.dirty = true; G.spd = 1; }
  const { sim } = G.step, st = sim.steps[G.step.i];
  if (!st) { const s = G.step; G.step = null; finishStep(s.sim); return; }
  G.busy = true; setRunning('step');
  $$('#progCard .blk.now').forEach(e => e.classList.add('done'));
  await doStep(st, true);
  G.busy = false; setRunning(false);
  G.step.i++;
  if (st.kind === 'check') say(CHECK_SAY[`${st.ins.t}-${st.cond}`](st.ok));
  if (G.step.i >= sim.steps.length) { const s = G.step; G.step = null; finishStep(s.sim); }
  else if (st.kind !== 'check') say(`Bloc fait. Touche encore pour la suite.`, true);
}
function finishStep(sim) {
  if (sim.result === 'win' && G.lv.nv > 1) {
    varMark(G.v, 'pass');
    $('#robot').classList.add('happy');
    say(`Ce jardin marche ! Touche le bouton vert pour essayer les ${G.lv.nv} jardins.`);
    return;
  }
  finish(sim, G.lv.nv > 1 ? G.v : null);
}
function mark(ins) {
  clearNow();
  const b = $(`#progCard [data-id="${ins.id}"]`);
  if (b) b.classList.add('now');
  for (const p of ins.path) {
    const c = $(`#progCard [data-id="${p.id}"]`);
    if (!c) continue;
    c.classList.add('now');
    if (p.of) { const pill = $(':scope > .ctr-head .ctr-p', c); if (pill) pill.textContent = `${p.iter}/${p.of}`; }
    if (p.br) c.classList.add('br-' + p.br);
  }
  $('#fnRow').classList.toggle('now', ins.path.some(p => p.call));
  if (b) b.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
}
async function doStep(st, keep) {
  const R = $('#robot'), spr = $('.sprite', R);
  const k = T * G.spd;
  R.style.transitionDuration = Math.round((st.kind === 'jump' ? 520 : 380) * k) + 'ms';
  mark(st.ins);
  const [dx, dy] = DIRS[st.face];
  if (st.kind === 'check') {
    const c = $(`#progCard .ctr[data-id="${st.ins.id}"]`);
    if (c) c.classList.add(st.ok ? 'yes' : 'no');
    SFX.look(st.ok);
    if (st.cond !== 'toys') {
      const s = document.createElement('div');
      s.className = 'sense' + (st.ok ? ' yes' : '');
      s.style.cssText = `--x:${st.from[0] + dx};--y:${st.from[1] + dy}`;
      s.innerHTML = '<i></i>';
      $('#fx').append(s);
      setTimeout(() => s.remove(), 520 * k);
    }
    await sleep((keep ? 600 : 420) * k);
    if (c) c.classList.remove('yes', 'no');
    return;
  }
  R.dataset.face = st.face;
  if (st.kind === 'turn') {
    SFX.turn();
    spr.animate([{ transform: 'rotate(0)' }, { transform: `rotate(${st.ins.t === 'tl' ? -16 : 16}deg)` }, { transform: 'rotate(0)' }], { duration: 320 * k, easing: 'ease-in-out' });
    await sleep(360 * k);
    return;
  }
  if (st.fail === 'out' || st.fail === 'bush' || st.fail === 'rock') {
    const far = st.kind === 'jump' ? 70 : 34;
    st.kind === 'jump' ? SFX.jump() : SFX.step();
    await spr.animate([
      { transform: 'translate(0,0)' },
      { transform: `translate(${dx * far}%, ${dy * far + (st.kind === 'jump' ? -30 : 0)}%)`, offset: .45 },
      { transform: `translate(${dx * far * .4}%, ${dy * far * .4}%)`, offset: .7 },
      { transform: 'translate(0,0)' },
    ], { duration: 560 * T, easing: 'ease-out' }).finished.catch(() => {});
    SFX.bump(); buzz(60);
    R.classList.add('oops');
    const bx = st.from[0] + dx * (st.kind === 'jump' ? 1.5 : .5), by = st.from[1] + dy * (st.kind === 'jump' ? 1.5 : .5);
    const kk = document.createElement('div'); kk.className = 'bonk'; kk.style.cssText = `--x:${bx};--y:${by}`; kk.innerHTML = I.bonk; $('#fx').append(kk);
    await sleep(300 * T);
    return;
  }
  if (st.kind === 'jump') {
    SFX.jump();
    R.classList.add('jumping');
    R.style.setProperty('--x', st.to[0]); R.style.setProperty('--y', st.to[1]);
    spr.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-55%) scale(1.06)', offset: .5 }, { transform: 'translateY(0) scale(1,.92)', offset: .9 }, { transform: 'translateY(0) scale(1)' }], { duration: 560 * k, easing: 'ease-in-out' });
    await sleep(580 * k);
    R.classList.remove('jumping');
  } else {
    SFX.step();
    R.style.setProperty('--x', st.to[0]); R.style.setProperty('--y', st.to[1]);
    await sleep(400 * k);
  }
  if (st.fail === 'puddle') {
    SFX.splash(); buzz(40);
    R.classList.add('wet');
    const s = document.createElement('div'); s.className = 'splash'; s.style.cssText = `--x:${st.to[0]};--y:${st.to[1]}`; s.innerHTML = '<i></i><i></i>'; $('#fx').append(s);
    spr.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(8%) scale(1.04,.9)' }, { transform: 'translateY(0)' }], { duration: 400 * T });
    await sleep(500 * T);
    return;
  }
  if (st.collect != null) {
    SFX.collect();
    const toy = $(`.it.toy[data-i="${st.collect}"]`); if (toy) toy.classList.add('got');
    const tt = $(`#tray .tt[data-i="${st.collect}"]`); if (tt) tt.classList.add('got');
    await sleep(160 * k);
  }
  await sleep((keep ? 40 : 110) * k);
}
function finish(sim, v) {
  G.dirty = true;
  clearMarks();
  const R = $('#robot');
  const last = sim.steps[sim.steps.length - 1];
  if (sim.result === 'win') { win(); return; }
  G.fails++;
  let msg = '';
  if (sim.result === 'bump') {
    msg = sim.why === 'out' ? 'Oups ! Bip ne peut pas sortir du jardin.' : sim.why === 'rock' ? 'Aïe ! Un rocher bloque le chemin.' : 'Aïe ! Bip s’est cogné dans un buisson.';
    msg += ' Le bloc orange pose problème.';
    badMark(last.ins);
  } else if (sim.result === 'splash') {
    msg = 'Plouf ! Bip a marché dans une flaque. Le bloc orange pose problème.';
    badMark(last.ins);
  } else if (sim.result === 'tired') {
    R.classList.add('puzzled');
    msg = 'Bip est fatigué : son programme ne s’arrête jamais ! Regarde tes boucles.';
  } else if (sim.result === 'missing') {
    R.classList.add('puzzled');
    const starUnused = hasFn() && !G.fn.length && G.prog.some(containsStar);
    if (starUnused) msg = 'La ligne étoile est vide : le bloc magique ne fait rien. Remplis-la !';
    else msg = sim.left > 1 ? `Bip a fini, mais il reste ${sim.left} jouets.` : 'Bip a fini, mais il reste un jouet.';
  } else if (sim.result === 'notbox') {
    R.classList.add('puzzled');
    msg = 'Tous les jouets sont ramassés ! Il faut encore finir dans le coffre.';
  }
  if (v != null) msg = `Jardin ${v + 1} : ` + msg.charAt(0).toLowerCase() + msg.slice(1);
  if (G.fails >= 2) $('#btnStep').classList.add('glow');
  if (G.fails >= 3) $('#btnHint').classList.add('glow');
  say(msg);
}
function badMark(ins) {
  clearNow();
  const b = $(`#progCard .blk[data-id="${ins.id}"]`);
  if (b) { b.classList.add('bad'); b.scrollIntoView({ block: 'nearest' }); }
}

/* ---------- Réussite ---------- */
function win() {
  const R = $('#robot');
  R.classList.add('happy');
  clearNow();
  const n = totalBlocks(), par = G.lv.par;
  const stars = n <= par ? 3 : n <= par + 2 ? 2 : 1;
  const prev = save.stars[G.lv.id] || 0;
  save.stars[G.lv.id] = Math.max(prev, stars); persist();
  SFX.win(); buzz([30, 60, 30]);
  confetti();
  $('#btnHint').classList.remove('glow'); $('#btnStep').classList.remove('glow');
  setTimeout(() => showWin(stars, n, par), RM ? 300 : 1000);
}
function showWin(stars, n, par) {
  const lastLevel = G.i === LEVELS.length - 1;
  const chapterEnd = !lastLevel && LEVELS[G.i + 1].ch !== G.lv.ch;
  $('#winBip').innerHTML = robotSVG();
  $('#winStars').innerHTML = [1, 2, 3].map(k => I.star(k <= stars)).join('');
  $$('#winStars svg.on').forEach((s, k) => { s.style.animationDelay = (k * 0.18) + 's'; });
  let title = stars === 3 ? 'Bravo !' : 'Bien joué !';
  let text = stars === 3
    ? `Programme parfait : ${n} bloc${n > 1 ? 's' : ''}, c’est le plus court.`
    : `Ton programme a ${n} blocs. On peut réussir avec ${par}. Tu essaies ?`;
  if (G.lv.nv > 1 && stars === 3) text = `Ton programme marche dans les ${G.lv.nv} jardins, avec ${n} blocs seulement !`;
  if (lastLevel) { title = 'Champion !'; text = 'Tu as fini toute l’aventure de Bip. Tu sais programmer un robot !'; }
  else if (chapterEnd && stars === 3) text += ` Prochain chapitre : ${CHAPTERS[G.lv.ch + 1].name.toLowerCase()}.`;
  $('#winTitle').textContent = title;
  $('#winText').textContent = text;
  $('#btnAgain').innerHTML = `${I.replay}<span>Encore</span>`;
  $('#btnNext').innerHTML = lastLevel ? `${I.home}<span>Carte</span>` : `<span>Suivant</span>${I.next}`;
  $('#win').hidden = false;
  speak(title + ' ' + text);
  setTimeout(() => $('#btnNext').focus({ preventScroll: true }), 50);
}

/* ---------- Aide : le chemin en pointillés ---------- */
function showHint() {
  if (G.busy) return;
  hideHint();
  if (G.dirty) resetBoard();
  const sim = simulate(G.lv, G.lv.ref, G.lv.refFn, G.v);
  const fx = $('#fx'), seen = {};
  let k = 0;
  sim.steps.filter(s => s.kind === 'move' || s.kind === 'jump').forEach(s => {
    const key = s.to.join(','); seen[key] = (seen[key] || 0) + 1;
    const occupied = G.P.toys.some(t => t.x === s.to[0] && t.y === s.to[1]) || (G.P.box && G.P.box[0] === s.to[0] && G.P.box[1] === s.to[1]);
    const d = document.createElement('i');
    d.className = 'dot hint' + (s.kind === 'jump' ? ' jumpdot' : '') + (occupied ? ' corner' : '');
    d.style.cssText = `--x:${s.to[0]};--y:${s.to[1]};--ox:calc(var(--cell) * ${(seen[key] - 1) * .22});animation-delay:${k * 180 * T}ms`;
    d.innerHTML = `<b style="animation-delay:${k * 180 * T}ms">${k + 1}</b>`;
    fx.append(d);
    k++;
  });
  $('#btnHint').classList.remove('glow');
  const rel = G.lv.pal.includes('f');
  say(rel ? 'Suis les ronds dans l’ordre. Où Bip doit-il avancer, où doit-il tourner ?' : 'Suis les ronds dans l’ordre : 1, 2, 3… Quelles flèches faut-il pour faire ce chemin ?');
  clearTimeout(G.hintT);
  G.hintT = setTimeout(hideHint, 9000 + k * 200);
}
function hideHint() { clearTimeout(G.hintT); $$('#fx .hint').forEach(d => d.remove()); }

/* ---------- Main qui montre (niveaux d'initiation) ---------- */
function coachTarget() {
  if ($('#game').hidden || G.busy || !$('#win').hidden || !$('#sheet').hidden || D) return null;
  const id = G.lv.id;
  if (id === 1 && !save.stars[1]) return G.prog.length ? $('#btnRun') : $('#palette .blk');
  if (id === 17 && !save.stars[17]) {
    const lp = G.prog.find(x => x.t === 'loop');
    if (!lp) return $('#palette .blk[data-t="loop"]');
    if (!lp.body.length) return G.target === lp.id ? $('#palette .blk[data-t="r"]') : $(`.ctr[data-id="${lp.id}"] .slot`);
    if (lp.n < 5) return $(`.ctr[data-id="${lp.id}"] > .ctr-head .ctr-p`);
    return $('#btnRun');
  }
  if (id === 33 && !save.stars[33]) {
    if (!G.fn.length) return G.target === 'fn' ? $('#palette .blk[data-t="f"]') : $('#fnSeq .slot');
    return null;
  }
  return null;
}
function placeHand() {
  const h = $('#hand'), t = coachTarget();
  if (!t) { h.hidden = true; return; }
  const r = t.getBoundingClientRect();
  if (!r.width) { h.hidden = true; return; }
  h.hidden = false;
  h.style.left = (r.left + r.width * .55) + 'px';
  h.style.top = (r.top + r.height * .55) + 'px';
}
function hideHand() { $('#hand').hidden = true; }

/* ---------- Confettis ---------- */
function confetti() {
  if (RM) return;
  const c = $('#confetti'), ctx = c.getContext('2d');
  c.hidden = false;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cols = ['#6CABEF', '#FFC94F', '#A993EE', '#FF8878', '#44BC7D', '#6ACBB0'];
  const ps = Array.from({ length: 70 }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 80, y: innerHeight * .45,
    vx: (Math.random() - .5) * 9, vy: -Math.random() * 10 - 4, s: 6 + Math.random() * 7,
    r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[(Math.random() * cols.length) | 0],
  }));
  const t0 = performance.now();
  (function frame(t) {
    const el = t - t0;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach(p => {
      p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - el / 1800);
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-p.s / 2, -p.s / 4, p.s, p.s / 2, 2) : ctx.rect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.fill(); ctx.restore();
    });
    if (el < 1800) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, innerWidth, innerHeight); c.hidden = true; }
  })(t0);
}

/* ---------- Feuille adultes ---------- */
function syncToggles() {
  $('#tgVoice').setAttribute('aria-checked', String(!!save.voice));
  $('#tgSound').setAttribute('aria-checked', String(!!save.sound));
  $('#tgAll').setAttribute('aria-checked', String(!!save.all));
}
let resetArm = 0;
function openSheet() { syncToggles(); $('#sheet').hidden = false; hideHand(); stopVoice(); }
function closeSheet() { $('#sheet').hidden = true; if (!$('#home').hidden) renderHome(); else placeHand(); }

/* ---------- Câblage ---------- */
function wire() {
  $('#heroArt').innerHTML = robotSVG() + `<span class="float f1">${toyUse('b')}</span><span class="float f2">${toyUse('c')}</span>`;
  $('#icoPlayBig').innerHTML = I.play;
  $('#icoInfo').innerHTML = I.info;
  $('#btnHome').innerHTML = I.home;
  $('#btnHint').innerHTML = I.bulb;
  $('#miniBip').innerHTML = robotSVG();
  $('#icoSpk').innerHTML = I.speaker;
  $('#icoProg').innerHTML = `<span style="display:block;width:22px;height:22px">${robotSVG()}</span>`;
  $('#fnLab').innerHTML = `${I.magic}<span>=</span>`;
  $('#btnTrash').innerHTML = I.trash;
  $('#btnStep').innerHTML = I.step;
  $('#btnClose').innerHTML = I.close;
  setRunning(false);

  $('#btnPlay').addEventListener('click', () => { audio(); openLevel(nextIndex()); });
  $('#btnHome').addEventListener('click', () => { G.abort = true; show('home'); });
  $('#btnHint').addEventListener('click', showHint);
  $('#bubble').addEventListener('click', () => speak($('#msg').textContent));
  $('#btnRun').addEventListener('click', () => { audio(); runAll(); });
  $('#btnStep').addEventListener('click', () => { audio(); stepOnce(); });
  $('#fnRow').addEventListener('click', e => { if (e.target.closest('.blk, .ctr, .slot')) return; setTarget('fn'); });
  let trashT = 0;
  $('#btnTrash').addEventListener('click', e => {
    const b = e.currentTarget;
    if (G.busy || !totalBlocks()) return;
    if (!b.classList.contains('arm')) {
      b.classList.add('arm'); b.setAttribute('aria-label', 'Toucher encore pour tout effacer'); SFX.tap();
      clearTimeout(trashT); trashT = setTimeout(() => { b.classList.remove('arm'); b.setAttribute('aria-label', 'Tout effacer'); }, 2500);
      return;
    }
    clearTimeout(trashT); b.classList.remove('arm'); b.setAttribute('aria-label', 'Tout effacer');
    poofAt($('#main'));
    G.prog = []; G.fn = []; G.target = 'main'; SFX.del(); edited();
    say('Programme effacé. On recommence !', true);
  });
  $('#btnAgain').addEventListener('click', () => { $('#win').hidden = true; setVariant(0); clearMarks(); $$('#vars button').forEach(b => b.classList.remove('pass', 'fail')); say(G.lv.text); });
  $('#btnNext').addEventListener('click', () => { $('#win').hidden = true; if (G.i < LEVELS.length - 1) openLevel(G.i + 1); else show('home'); });
  $('#btnAdults').addEventListener('click', openSheet);
  $('#btnClose').addEventListener('click', closeSheet);
  $('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
  $('#tgVoice').addEventListener('click', () => { save.voice = !save.voice; if (!save.voice) stopVoice(); persist(); syncToggles(); });
  $('#tgSound').addEventListener('click', () => { save.sound = !save.sound; persist(); syncToggles(); });
  $('#tgAll').addEventListener('click', () => { save.all = !save.all; persist(); syncToggles(); });
  $('#btnReset').addEventListener('click', e => {
    const b = e.currentTarget;
    if (!b.classList.contains('arm')) {
      b.classList.add('arm'); $('#resetLabel').textContent = 'Toucher encore pour tout effacer';
      clearTimeout(resetArm); resetArm = setTimeout(() => { b.classList.remove('arm'); $('#resetLabel').textContent = 'Effacer la progression'; }, 3000);
      return;
    }
    clearTimeout(resetArm); b.classList.remove('arm');
    save.stars = {}; save.all = false; persist(); syncToggles();
    $('#resetLabel').textContent = 'Progression effacée';
    setTimeout(() => { $('#resetLabel').textContent = 'Effacer la progression'; }, 2000);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#sheet').hidden) closeSheet(); } });
  document.addEventListener('contextmenu', e => { if (e.target.closest('.blk, .ctr, .board')) e.preventDefault(); });
  new ResizeObserver(fitBoard).observe($('#boardWrap'));
  window.addEventListener('resize', placeHand);
  $('#seqScroll').addEventListener('scroll', placeHand, { passive: true });
  if (STANDALONE) window.addEventListener('popstate', () => { if (!$('#game').hidden) { G.abort = true; show('home'); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopVoice(); });
  show('home');
}
wire();
})();
