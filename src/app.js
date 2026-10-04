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
  jump: `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="82" rx="15" ry="6" fill="currentColor" opacity=".5"/><path d="M17 76C23 30 66 22 80 62" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/><path d="M63 57L81 66L89 47" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  loop: S('M76 52a26 26 0 1 1-8-21M70 13v21H49', 11),
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
  lock: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="44" width="56" height="42" rx="10" fill="currentColor"/><path d="M34 46V34a16 16 0 0 1 32 0v12" fill="none" stroke="currentColor" stroke-width="9"/></svg>`,
  info: S('M50 46v26M50 30v1', 11),
  bush: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="30" cy="60" r="20" fill="currentColor"/><circle cx="70" cy="60" r="20" fill="currentColor"/><circle cx="50" cy="42" r="24" fill="currentColor"/></svg>`,
  drop: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 12C50 12 24 44 24 62a26 26 0 0 0 52 0C76 44 50 12 50 12Z" fill="currentColor"/></svg>`,
  star: on => `<svg viewBox="0 0 100 100" aria-hidden="true" class="${on ? 'on' : ''}"><use href="#star" width="100" height="100" fill="${on ? 'var(--star)' : 'var(--paper-2)'}" stroke="${on ? '#E9A923' : 'var(--line)'}"/></svg>`,
  bonk: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6L58 38L92 30L64 52L86 80L52 64L40 96L36 62L6 70L30 46L10 18L42 34Z" fill="#FFD36B" stroke="#E9A923" stroke-width="5" stroke-linejoin="round"/></svg>`,
};
const BLOCK_ICON = { r: I.arrow, l: I.arrow, u: I.arrow, d: I.arrow, j: I.jump, loop: I.loop };
const BLOCK_NAME = { r: 'aller à droite', l: 'aller à gauche', u: 'monter', d: 'descendre', j: 'sauter', loop: 'répéter' };

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
  if (lv.sol) lv.ref = parseSol(lv.sol);
  else lv.ref = (solve(lv, lv.pal) || []).map((t, i) => ({ t, id: 'h' + i }));
  lv.par = countBlocks(lv.ref);
});
const TONES = { sky: 'var(--move)', leaf: 'var(--leaf)', water: '#5DB6DE', lilac: 'var(--jump)', sun: '#F5B83A' };
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
    const ico = ci === 0 ? I.arrow : ci === 1 ? I.bush : ci === 2 ? I.drop : ci === 3 ? I.jump : I.loop;
    return `<article class="chap" data-tone="${c.tone}">
      <div class="chap-head"><span class="chap-num">${ci + 1}</span><div><h2>${c.name}</h2><p>${c.hint}</p></div><span class="chap-ico">${ico}</span></div>
      <div class="lvls">${lvls.map(([l, i]) => {
        const st = save.stars[l.id] || 0, open = unlocked(i);
        return `<button class="lvl${i === nx && open ? ' next' : ''}" data-i="${i}" ${open ? '' : 'disabled'} aria-label="Niveau ${l.id}${open ? (st ? ', ' + st + ' étoiles' : '') : ', fermé'}">
          <span class="n">${open ? l.id : I.lock}</span><span class="st">${open ? [1, 2, 3].map(k => I.star(k <= st)).join('') : ''}</span></button>`;
      }).join('')}</div></article>`;
  }).join('');
  $$('.lvl', wrap).forEach(b => b.addEventListener('click', () => { audio(); openLevel(+b.dataset.i); }));
}

/* ---------- État du jeu ---------- */
const G = { i: 0, lv: null, P: null, prog: [], target: 'main', uid: 1, busy: false, abort: false, step: null, fails: 0, dirty: false, last: null, hintT: 0 };

function openLevel(i) {
  if (!unlocked(i)) return;
  G.i = i; G.lv = LEVELS[i]; G.P = parseLevel(G.lv);
  G.prog = []; G.target = 'main'; G.fails = 0; G.step = null; G.abort = true; G.busy = false; G.dirty = false; G.last = null;
  $('#win').hidden = true;
  show('game');
  setRunning(false);
  const tone = TONES[CHAPTERS[G.lv.ch].tone];
  $('#lvlPill').innerHTML = `<i style="background:${tone}"></i>Niveau ${G.lv.id}`;
  $('#btnHint').classList.remove('glow'); $('#btnStep').classList.remove('glow');
  buildBoard(); buildTray(); buildPalette(); renderProg();
  say(G.lv.text);
  if (STANDALONE) { try { history.pushState({ g: 1 }, ''); } catch (e) { /* */ } }
}

function say(text, quiet) {
  const m = $('#msg'); m.textContent = text;
  const b = $('#bubble'); b.classList.remove('new'); void b.offsetWidth; b.classList.add('new');
  if (!quiet) speak(text);
}

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
  const jumpy = G.lv.pal.includes('j');
  h += `<div class="it robot" id="robot" data-face="${P.face}" style="--x:${P.start[0]};--y:${P.start[1]}"><div class="sprite">${robotSVG()}</div>${jumpy ? '<i class="facing"></i>' : ''}</div>`;
  b.innerHTML = h;
  fitBoard();
}
function fitBoard() {
  if (!G.P) return;
  const r = $('#boardWrap').getBoundingClientRect();
  if (!r.width || !r.height) return;
  const cell = Math.max(24, Math.floor(Math.min((r.width - 16) / G.P.w, (r.height - 16) / G.P.h, 112)));
  $('#board').style.setProperty('--cell', cell + 'px');
  placeHand();
}
function resetBoard() {
  const R = $('#robot'); if (!R) return;
  R.classList.add('instant'); R.classList.remove('happy', 'oops', 'wet', 'puzzled', 'jumping');
  R.style.setProperty('--x', G.P.start[0]); R.style.setProperty('--y', G.P.start[1]); R.dataset.face = G.P.face;
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

/* ---------- Palette et programme ---------- */
function blockHTML(t, id) {
  const lab = t === 'j' ? '<b>saute</b>' : t === 'loop' ? '<b>répète</b>' : '';
  return `<div class="blk${id && id === G.last ? ' in' : ''}" data-t="${t}"${id ? ` data-id="${id}"` : ''} role="button" tabindex="0" aria-label="${BLOCK_NAME[t]}">${BLOCK_ICON[t]}${lab}</div>`;
}
function buildPalette() {
  const p = $('#palette');
  p.innerHTML = G.lv.pal.map(t => blockHTML(t)).join('');
  $$('.blk', p).forEach(el => {
    el.addEventListener('pointerdown', e => press(e, { from: 'pal', t: el.dataset.t }, el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addBlock(el.dataset.t); } });
  });
}
function loopHTML(it) {
  const on = G.target === it.id;
  return `<div class="loop${on ? ' target' : ''}${it.id === G.last ? ' in' : ''}" data-id="${it.id}">
    <div class="loop-head"><button class="loop-x" aria-label="Enlever la boucle">${I.loop}</button><button class="loop-n" aria-label="Répéter ${it.n} fois">×${it.n}</button></div>
    <div class="seq loop-body" data-cid="${it.id}">${it.body.map(b => blockHTML(b.t, b.id)).join('')}<div class="slot${on ? ' on' : ''}" data-cid="${it.id}" role="button" aria-label="Ajouter dans la boucle">+</div></div></div>`;
}
function renderProg() {
  const main = $('#main');
  main.innerHTML = G.prog.map(it => it.t === 'loop' ? loopHTML(it) : blockHTML(it.t, it.id)).join('') +
    `<div class="slot${G.target === 'main' ? ' on' : ''}" data-cid="main" role="button" aria-label="Ajouter ici">+</div>`;
  $$('.blk', main).forEach(el => {
    el.addEventListener('pointerdown', e => press(e, { from: 'prog', id: el.dataset.id }, el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeItem(el.dataset.id, el); } });
  });
  $$('.loop', main).forEach(lp => {
    const id = lp.dataset.id;
    $('.loop-x', lp).addEventListener('pointerdown', e => press(e, { from: 'prog', id, head: true }, lp));
    $('.loop-n', lp).addEventListener('click', e => { e.stopPropagation(); if (G.busy) return; cycleLoop(id); });
    $('.loop-body', lp).addEventListener('click', e => { if (e.target.closest('.blk')) return; setTarget(id); });
  });
  $$('.slot', main).forEach(s => s.addEventListener('click', e => { e.stopPropagation(); setTarget(s.dataset.cid); }));
  updateBatt();
  G.last = null;
  requestAnimationFrame(placeHand);
}
function updateBatt() {
  const b = $('#batts');
  if (!G.lv.max) { b.hidden = true; return; }
  const left = Math.max(0, G.lv.max - countBlocks(G.prog));
  b.hidden = false;
  b.innerHTML = Array.from({ length: G.lv.max }, (_, k) => `<i class="batt${k < left ? ' full' : ''}"></i>`).join('') + `<span class="bl">piles</span>`;
  b.setAttribute('aria-label', `${left} piles restantes sur ${G.lv.max}`);
}
function setTarget(cid) {
  if (G.busy) return;
  if (cid !== 'main' && !G.prog.find(x => x.id === cid)) cid = 'main';
  if (G.target !== cid) { G.target = cid; SFX.tap(); renderProg(); }
}
function listFor(cid) {
  if (cid === 'main') return G.prog;
  const lp = G.prog.find(x => x.id === cid);
  return lp ? lp.body : G.prog;
}
function findItem(id) {
  for (let i = 0; i < G.prog.length; i++) {
    const it = G.prog[i];
    if (it.id === id) return { list: G.prog, idx: i, it };
    if (it.t === 'loop') { const j = it.body.findIndex(b => b.id === id); if (j >= 0) return { list: it.body, idx: j, it: it.body[j], parent: it }; }
  }
  return null;
}
function canAdd() {
  if (!G.lv.max || countBlocks(G.prog) < G.lv.max) return true;
  const b = $('#batts'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  SFX.nope(); buzz(30);
  say(`Plus de piles ! Bip ne peut avoir que ${G.lv.max} blocs.${G.lv.pal.includes('loop') ? ' Le bloc Répéter peut t’aider.' : ''}`);
  return false;
}
function addBlock(t, cid = G.target, idx = null) {
  if (G.busy || !canAdd()) return false;
  const item = t === 'loop' ? { t: 'loop', n: 2, body: [], id: 'k' + G.uid++ } : { t, id: 'k' + G.uid++ };
  if (t === 'loop') { cid = 'main'; if (idx == null && G.target !== 'main') { idx = G.prog.findIndex(x => x.id === G.target) + 1; } }
  const list = listFor(cid);
  if (idx == null || idx > list.length) idx = list.length;
  list.splice(idx, 0, item);
  if (t === 'loop') G.target = item.id;
  G.last = item.id;
  SFX.add();
  edited();
  if (t === 'loop' && G.prog.filter(x => x.t === 'loop').length === 1 && !item.body.length) say('Mets des flèches dans le bloc jaune, puis touche le nombre pour choisir combien de fois.', false);
  return true;
}
function removeItem(id, el, unwrap) {
  const f = findItem(id); if (!f) return;
  if (el) poofAt(el);
  if (f.it.t === 'loop' && unwrap) f.list.splice(f.idx, 1, ...f.it.body);
  else f.list.splice(f.idx, 1);
  if (G.target === id) G.target = 'main';
  SFX.del();
  edited();
}
function cycleLoop(id) {
  const lp = G.prog.find(x => x.id === id); if (!lp) return;
  lp.n = lp.n >= 5 ? 2 : lp.n + 1;
  SFX.tap(); edited();
  const n = $(`.loop[data-id="${id}"] .loop-n`); if (n) { n.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 250 }); }
  say(`Bip va répéter ${lp.n} fois.`, false);
}
function edited() {
  G.step = null;
  if (G.dirty) resetBoard();
  clearMarks(); hideHint();
  renderProg();
}
function clearMarks() {
  $$('#main .now, #main .bad, #main .done').forEach(e => e.classList.remove('now', 'bad', 'done'));
  $$('#main .loop').forEach(lp => { const it = G.prog.find(x => x.id === lp.dataset.id); if (it) $('.loop-n', lp).textContent = '×' + it.n; });
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
  else if (d.src.head) removeItem(d.src.id, d.el, true);
  else removeItem(d.src.id, d.el);
}
function beginDrag() {
  D.drag = true;
  const f = D.src.from === 'prog' ? findItem(D.src.id) : null;
  D.isLoop = D.src.from === 'pal' ? D.src.t === 'loop' : !!(f && f.it.t === 'loop');
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
function blocksOf(seq) { return [...seq.children].filter(c => (c.classList.contains('blk') || c.classList.contains('loop')) && !c.classList.contains('lifting')); }
function moveDrag(e) {
  D.ghost.style.transform = `translate(${e.clientX - D.gw / 2}px, ${e.clientY - D.gh * .9}px) rotate(-4deg) scale(1.06)`;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  let seq = el && el.closest('.seq');
  if (seq && seq.closest('.lifting')) seq = null;
  if (!seq && el && el.closest('#progCard')) seq = $('#main');
  if (seq && D.isLoop && seq.id !== 'main') seq = $('#main');
  if (!seq) { D.ph.remove(); return; }
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
      if ((c.classList.contains('blk') || c.classList.contains('loop')) && !c.classList.contains('lifting')) idx++;
    }
  }
  const gr = d.ghost.getBoundingClientRect();
  d.ghost.remove(); d.ph.remove();
  $('#game').classList.remove('dragging');
  if (d.src.from === 'pal') {
    if (placed) addBlock(d.src.t, cid, idx); else requestAnimationFrame(placeHand);
    return;
  }
  const f = findItem(d.src.id);
  if (!f) { renderProg(); return; }
  if (!placed) {
    poofAt(null, gr.left + gr.width / 2, gr.top + gr.height / 2);
    f.list.splice(f.idx, 1);
    if (G.target === d.src.id) G.target = 'main';
    SFX.del(); edited(); return;
  }
  f.list.splice(f.idx, 1);
  listFor(cid).splice(idx, 0, f.it);
  G.last = f.it.id;
  SFX.add(); edited();
}
function poofAt(el, x, y) {
  if (el) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
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
  say('Le programme est vide. Touche une flèche en bas pour l’ajouter.');
  const p = $('#palette'); p.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 400, iterations: 2 });
}
async function runAll() {
  if (G.busy) { G.abort = true; return; }
  if (!G.prog.length) { emptyNudge(); return; }
  stopVoice(); G.step = null; resetBoard(); clearMarks(); hideHint();
  const sim = simulate(G.lv, G.prog);
  G.busy = true; G.abort = false; setRunning(true); G.dirty = true;
  say('C’est parti !', true);
  for (const st of sim.steps) { if (G.abort) break; await doStep(st); }
  const aborted = G.abort; G.busy = false; setRunning(false);
  if (aborted) { resetBoard(); clearMarks(); say('Stop ! Bip revient au départ.'); return; }
  finish(sim);
}
async function stepOnce() {
  if (G.busy) return;
  if (!G.prog.length) { emptyNudge(); return; }
  if (!G.step) { stopVoice(); resetBoard(); clearMarks(); hideHint(); G.step = { sim: simulate(G.lv, G.prog), i: 0 }; G.dirty = true; }
  const { sim } = G.step, st = sim.steps[G.step.i];
  G.busy = true; setRunning('step');
  $$('#main .now').forEach(e => { e.classList.remove('now'); if (e.classList.contains('blk')) e.classList.add('done'); });
  await doStep(st, true);
  G.busy = false; setRunning(false);
  G.step.i++;
  if (G.step.i >= sim.steps.length) { G.step = null; finish(sim); }
  else say(`Bloc ${G.step.i} fait. Touche encore pour le suivant.`, true);
}
function mark(ins) {
  $$('#main .now').forEach(e => e.classList.remove('now'));
  const b = $(`#main .blk[data-id="${ins.id}"]`); if (b) b.classList.add('now');
  if (ins.loopId) {
    const lp = $(`#main .loop[data-id="${ins.loopId}"]`);
    if (lp) { lp.classList.add('now'); $('.loop-n', lp).textContent = `${ins.iter}/${ins.of}`; }
  }
  if (b) b.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
}
async function doStep(st, keep) {
  const R = $('#robot'), spr = $('.sprite', R);
  mark(st.ins);
  R.dataset.face = st.face;
  const [dx, dy] = DIRS[st.face];
  if (st.fail === 'out' || st.fail === 'bush' || st.fail === 'rock') {
    // Bip avance un peu, se cogne et recule
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
    const k = document.createElement('div'); k.className = 'bonk'; k.style.cssText = `--x:${bx};--y:${by}`; k.innerHTML = I.bonk; $('#fx').append(k);
    await sleep(300 * T);
    return;
  }
  if (st.kind === 'jump') {
    SFX.jump();
    R.classList.add('jumping');
    R.style.setProperty('--x', st.to[0]); R.style.setProperty('--y', st.to[1]);
    spr.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-55%) scale(1.06)', offset: .5 }, { transform: 'translateY(0) scale(1,.92)', offset: .9 }, { transform: 'translateY(0) scale(1)' }], { duration: 560 * T, easing: 'ease-in-out' });
    await sleep(580 * T);
    R.classList.remove('jumping');
  } else {
    SFX.step();
    R.style.setProperty('--x', st.to[0]); R.style.setProperty('--y', st.to[1]);
    await sleep(400 * T);
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
    await sleep(160 * T);
  }
  await sleep((keep ? 40 : 110) * T);
}
function finish(sim) {
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
  } else if (sim.result === 'missing') {
    R.classList.add('puzzled');
    msg = sim.left > 1 ? `Bip a fini, mais il reste ${sim.left} jouets. Ajoute des blocs !` : 'Bip a fini, mais il reste un jouet. Ajoute des blocs !';
  } else if (sim.result === 'notbox') {
    R.classList.add('puzzled');
    msg = 'Tous les jouets sont ramassés ! Il faut encore finir dans le coffre.';
  }
  if (G.fails >= 2) $('#btnStep').classList.add('glow');
  if (G.fails >= 3) $('#btnHint').classList.add('glow');
  say(msg);
}
function badMark(ins) {
  $$('#main .now').forEach(e => e.classList.remove('now'));
  const b = $(`#main .blk[data-id="${ins.id}"]`);
  if (b) { b.classList.add('bad'); b.scrollIntoView({ block: 'nearest' }); }
}

/* ---------- Réussite ---------- */
function win() {
  const R = $('#robot');
  R.classList.add('happy');
  $$('#main .now').forEach(e => e.classList.remove('now'));
  const n = countBlocks(G.prog), par = G.lv.par;
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
  const sim = simulate(G.lv, G.lv.ref);
  const fx = $('#fx'), seen = {};
  sim.steps.forEach((s, k) => {
    const key = s.to.join(','); seen[key] = (seen[key] || 0) + 1;
    const d = document.createElement('i');
    const occupied = G.P.toys.some(t => t.x === s.to[0] && t.y === s.to[1]) || (G.P.box && G.P.box[0] === s.to[0] && G.P.box[1] === s.to[1]);
    d.className = 'dot hint' + (s.kind === 'jump' ? ' jumpdot' : '') + (occupied ? ' corner' : '');
    d.style.cssText = `--x:${s.to[0]};--y:${s.to[1]};--ox:calc(var(--cell) * ${(seen[key] - 1) * .22});animation-delay:${k * 180 * T}ms`;
    d.innerHTML = `<b style="animation-delay:${k * 180 * T}ms">${k + 1}</b>`;
    fx.append(d);
  });
  $('#btnHint').classList.remove('glow');
  say('Suis les ronds dans l’ordre : 1, 2, 3… Quelles flèches faut-il pour faire ce chemin ?');
  clearTimeout(G.hintT);
  G.hintT = setTimeout(hideHint, 9000 + sim.steps.length * 200);
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
    if (!lp.body.length) return G.target === lp.id ? $('#palette .blk[data-t="r"]') : $(`.loop[data-id="${lp.id}"] .slot`);
    if (lp.n < 5) return $(`.loop[data-id="${lp.id}"] .loop-n`);
    return $('#btnRun');
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
  let trashT = 0;
  $('#btnTrash').addEventListener('click', e => {
    const b = e.currentTarget;
    if (G.busy || !G.prog.length) return;
    if (!b.classList.contains('arm')) {
      b.classList.add('arm'); b.setAttribute('aria-label', 'Toucher encore pour tout effacer'); SFX.tap();
      clearTimeout(trashT); trashT = setTimeout(() => { b.classList.remove('arm'); b.setAttribute('aria-label', 'Tout effacer'); }, 2500);
      return;
    }
    clearTimeout(trashT); b.classList.remove('arm'); b.setAttribute('aria-label', 'Tout effacer');
    poofAt($('#main'));
    G.prog = []; G.target = 'main'; SFX.del(); edited();
    say('Programme effacé. On recommence !', true);
  });
  $('#btnAgain').addEventListener('click', () => { $('#win').hidden = true; resetBoard(); clearMarks(); say(G.lv.text); });
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
  document.addEventListener('contextmenu', e => { if (e.target.closest('.blk, .loop, .board')) e.preventDefault(); });
  new ResizeObserver(fitBoard).observe($('#boardWrap'));
  window.addEventListener('resize', placeHand);
  $('#seqScroll').addEventListener('scroll', placeHand, { passive: true });
  if (STANDALONE) window.addEventListener('popstate', () => { if (!$('#game').hidden) { G.abort = true; show('home'); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopVoice(); });
  show('home');
}
wire();
})();
