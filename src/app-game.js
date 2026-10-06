/* ---------- État du jeu ---------- */
let UID = 1;
const newId = () => 'k' + (UID++);
const G = { i: -1, lv: null, P: null, v: 0, prog: [], fn: [], target: 'main', busy: false, abort: false, step: null,
  fails: 0, dirty: false, last: null, hintT: 0, spd: 1, told: {}, mode: 'classic', sandbox: false, daily: false,
  tiles: {}, tool: 'r', cellPx: 64, sb: { rows: [], tool: 'R', cur: 0 }, sbCellPx: 64 };
const hasFn = () => !!(G.lv.pal && G.lv.pal.includes('star'));
const totalBlocks = () => countBlocks(G.prog) + countBlocks(G.fn);

const WORLD_WHO = ['zoe', 'zoe', 'papi', 'noctule'];
function storyForLevel(lv) {
  if (lv.daily || lv.sandbox || lv.ch == null || lv.ch < 0) return null;
  const lines = [];
  const w = CHAPTERS[lv.ch].w;
  const firstOfWorld = CHAPTERS.find(c => c.w === w) === CHAPTERS[lv.ch];
  if (firstOfWorld && !save.seen.w[w]) {
    save.seen.w[w] = true;
    WORLDS[w].intro.forEach(l => lines.push({ who: WORLD_WHO[w], line: l, title: 'Monde ' + (w + 1) + ' : ' + WORLDS[w].name }));
  }
  if (!save.seen.c[lv.ch]) {
    save.seen.c[lv.ch] = true;
    lines.push({ who: CHAPTERS[lv.ch].who, line: CHAPTERS[lv.ch].intro, title: 'Chapitre ' + (lv.ch + 1) });
  }
  persist();
  return lines.length ? lines : null;
}

function openLevel(i) { openLevelObj(LEVELS[i], { index: i }); }
function openLevelObj(lv, opts = {}) {
  G.mode = lv.mode === 'ball' ? 'ball' : 'classic';
  G.sandbox = !!opts.sandbox;
  G.i = opts.index != null ? opts.index : LEVELS.indexOf(lv);
  G.lv = lv;
  G.tiles = {};
  G.tool = 'r';
  G.prog = lv.start ? parseProg(lv.start, newId) : [];
  G.fn = lv.startFn ? parseProg(lv.startFn, newId) : [];
  G.target = 'main'; G.fails = 0; G.step = null; G.abort = true; G.busy = false; G.dirty = false; G.last = null; G.told = {};
  $('#win').hidden = true;
  show('game');
  setRunning(false);
  const tone = TONES[CHAPTERS[lv.ch] ? CHAPTERS[lv.ch].tone : 'sky'];
  $('#lvlPill').innerHTML = `<i style="background:${tone}"></i>${lv.daily ? 'Défi de ' + DAILY_NAMES[DAILY_IDX] : lv.sandbox ? 'Mon jardin' : 'Niveau ' + lv.id}`;
  $('#btnHint').classList.remove('glow'); $('#btnStep').classList.remove('glow');
  $('#fnRow').hidden = !hasFn() || G.mode === 'ball';
  $('#seqScroll').hidden = G.mode === 'ball';
  $('#btnStep').hidden = G.mode === 'ball';
  buildVars();
  setVariant(0);
  const start = () => {
    buildPalette(); renderProg();
    say(lv.text);
    if (STANDALONE) { try { history.pushState({ g: 1 }, ''); } catch (e) { /* */ } }
  };
  const story = storyForLevel(lv);
  if (story) playStory(story, start); else start();
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
  G.v = v;
  G.P = G.mode === 'ball' ? parseBallMap(G.lv, v) : parseLevel(G.lv, v);
  buildBoard(); buildTray();
  if (G.mode === 'ball') renderTiles();
  $$('#vars button').forEach(b => b.classList.toggle('on', +b.dataset.v === v));
}
function varMark(v, cls) { const b = $(`#vars button[data-v="${v}"]`); if (b) { b.classList.remove('pass', 'fail'); b.classList.add(cls); } }

/* ---------- Plateau ---------- */
function buildBoard() {
  const P = G.P, b = $('#board');
  b.classList.toggle('night', !!(G.lv.ch >= 0 && CHAPTERS[G.lv.ch] && CHAPTERS[G.lv.ch].night));
  b.style.setProperty('--cols', P.w); b.style.setProperty('--rows', P.h);
  let h = '';
  P.cells.forEach((k, idx) => {
    if (k === 'grass') return;
    const x = idx % P.w, y = (idx / P.w) | 0;
    const cls = k === 'switch' ? 'switchc' : k;
    const sym = { bush: 'bush', rock: 'rock', puddle: 'puddle', box: 'box', pad: 'pad', switch: 'switchc', gate: 'gate', flower: 'flower', nest: 'nest' }[k];
    h += `<div class="it ${cls}" data-idx="${idx}" style="--x:${x};--y:${y}">${symUse(sym)}</div>`;
  });
  P.crates.forEach((c, i) => { h += `<div class="it crate" data-ci="${i}" style="--x:${c[0]};--y:${c[1]}">${symUse('crate')}</div>`; });
  P.toys.forEach((t, i) => { h += `<div class="it toy toy-${t.k}" data-i="${i}" style="--x:${t.x};--y:${t.y}">${toyUse(t.k)}</div>`; });
  h += `<div class="fx" id="fx"></div>`;
  if (G.mode === 'ball') {
    h += `<div class="ball-sprite" id="ballSprite" style="--x:${P.start[0]};--y:${P.start[1]}">${symUse('ball')}</div>`;
  } else {
    const facing = G.lv.pal.some(t => ['j', 'f', 'tl', 'tr'].includes(t));
    h += `<div class="it robot" id="robot" data-face="${P.face}" style="--x:${P.start[0]};--y:${P.start[1]}"><div class="sprite">${robotSVG()}</div>${facing ? '<i class="facing"></i>' : ''}</div>`;
  }
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
  G.cellPx = cell;
  placeHand();
}
function resetBoard() {
  buildBoard(); buildTray();
  if (G.mode === 'ball') renderTiles();
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
  if (G.mode === 'ball') {
    p.innerHTML = BALL_DIRS.map(d => blockHTML(d, null, true)).join('') +
      `<div class="blk eraser${G.tool === 'erase' ? ' in' : ''}" data-t="erase" role="button" tabindex="0" aria-label="Gomme">${I.eraser}</div>`;
    $$('.blk', p).forEach(el => el.addEventListener('pointerdown', e => { e.preventDefault(); selectTool(el.dataset.t); }));
    $$('.blk', p).forEach(el => { if (el.dataset.t === G.tool) el.classList.add('in'); });
    return;
  }
  p.innerHTML = G.lv.pal.map(t => blockHTML(t, null, true)).join('');
  $$('.blk', p).forEach(el => {
    el.addEventListener('pointerdown', e => press(e, { from: 'pal', t: el.dataset.t }, el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addBlock(el.dataset.t); } });
  });
}
function selectTool(t) {
  G.tool = t;
  $$('#palette .blk').forEach(el => el.classList.toggle('in', el.dataset.t === t));
  SFX.tap();
  say(t === 'erase' ? 'La gomme ! Touche une flèche posée pour l\'enlever.' : 'Touche l\'herbe pour poser la flèche.', true);
}
const slotHTML = cid => `<div class="slot${G.target === cid ? ' on' : ''}" data-cid="${cid}" role="button" aria-label="Ajouter ici">+</div>`;
const seqHTML = (list, cid) => list.map(itemHTML).join('') + slotHTML(cid);
const itemHTML = it => isCtr(it.t) ? ctrHTML(it) : blockHTML(it.t, it.id);
function pillHTML(it) {
  if (it.t === 'loop') return '×' + it.n;
  if (it.t === 'while') return it.c === 'toys' ? toyUse('b') : symUse('bush');
  return it.c === 'puddle' ? symUse('puddle') : symUse('gate');
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
  if (G.mode === 'ball') { updateBatt(); return; }
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
  if (G.mode === 'ball') {
    b.hidden = false;
    const n = Object.keys(G.tiles).length;
    b.innerHTML = `<span class="bl" style="margin:0">${n} flèche${n > 1 ? 's' : ''} posée${n > 1 ? 's' : ''}</span>`;
    return;
  }
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

/* ---------- Exécution (Bip) ---------- */
function setRunning(on) {
  $('#game').classList.toggle('running', !!on);
  const b = $('#btnRun');
  b.innerHTML = on === true ? I.stop : I.play;
  b.setAttribute('aria-label', on === true ? 'Arrêter' : 'Lancer le programme');
  if (on) hideHand(); else requestAnimationFrame(placeHand);
}
function emptyNudge() {
  SFX.nope();
  say('Le programme est vide. Touche un bloc en bas pour l’ajouter.');
  $('#palette').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 400, iterations: 2 });
}
const speedFor = sim => { const n = sim.steps.length; return n > 40 ? .5 : n > 24 ? .65 : n > 14 ? .8 : 1; };
async function runAll() {
  if (G.mode === 'ball') return runBall();
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
  if (G.busy || G.mode === 'ball') return;
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
  if (!ins) return;
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
function crateEl(from) {
  return $$('#board .it.crate').find(c => c.style.getPropertyValue('--x') == from[0] && c.style.getPropertyValue('--y') == from[1]);
}
async function doStep(st, keep) {
  const R = $('#robot'), spr = R ? $('.sprite', R) : null;
  const k = T * G.spd;
  const fx = $('#fx');
  if (st.kind === 'gate') {
    mark(st.ins);
    $$('#board .it.gate').forEach(g => g.classList.add('open'));
    $$('#board .it.switchc').forEach(s => s.classList.add('pressed'));
    SFX.gate();
    await sleep(700 * k);
    return;
  }
  if (!R) return;
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
      fx.append(s);
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
  if (st.fail === 'out' || st.fail === 'bush' || st.fail === 'rock' || st.fail === 'crate' || st.fail === 'gate') {
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
    const kk = document.createElement('div'); kk.className = 'bonk'; kk.style.cssText = `--x:${bx};--y:${by}`; kk.innerHTML = I.bonk; fx.append(kk);
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
  if (st.sink) {
    SFX.pad();
    const idx = st.sink[1] * G.P.w + st.sink[0];
    const pad = $(`#board .it.pad[data-idx="${idx}"]`);
    if (pad) {
      const w = document.createElement('div');
      w.className = 'it water'; w.style.cssText = `--x:${st.sink[0]};--y:${st.sink[1]}`;
      w.innerHTML = symUse('water');
      $('#board').insertBefore(w, pad);
      pad.classList.add('sunk');
      setTimeout(() => pad.remove(), 700 * T);
    }
  }
  if (st.crate) {
    SFX.push();
    const ce = crateEl(st.crate.from);
    if (ce) {
      ce.style.setProperty('--x', st.crate.to[0]); ce.style.setProperty('--y', st.crate.to[1]);
      if (st.crate.plank) {
        await sleep(320 * k);
        ce.remove();
        const pl = document.createElement('div');
        pl.className = 'it plank'; pl.style.cssText = `--x:${st.crate.to[0]};--y:${st.crate.to[1]}`;
        pl.innerHTML = symUse('plank');
        $('#board').appendChild(pl);
        SFX.plank();
        const sp = document.createElement('div'); sp.className = 'splash'; sp.style.cssText = `--x:${st.crate.to[0]};--y:${st.crate.to[1]}`;
        sp.innerHTML = '<i></i><i></i>'; fx.append(sp);
      }
    }
  }
  if (st.paint) {
    SFX.paint();
    const p = document.createElement('div');
    p.className = 'paint'; p.style.cssText = `--x:${st.paint[0]};--y:${st.paint[1]}`;
    p.innerHTML = '<i></i>'; fx.append(p);
    const idx = st.paint[1] * G.P.w + st.paint[0];
    const fl = $(`#board .it.flower[data-idx="${idx}"]`);
    if (fl) fl.classList.add('painted');
  }
  if (st.fail === 'puddle') {
    SFX.splash(); buzz(40);
    R.classList.add('wet');
    const s = document.createElement('div'); s.className = 'splash'; s.style.cssText = `--x:${st.to[0]};--y:${st.to[1]}`; s.innerHTML = '<i></i><i></i>'; fx.append(s);
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
    msg = sim.why === 'out' ? 'Oups ! Bip ne peut pas sortir du jardin.' : sim.why === 'rock' ? 'Aïe ! Un rocher bloque le chemin.' : sim.why === 'crate' ? 'Aïe ! La caisse bloque le chemin. Pousse-la en marchant dedans !' : sim.why === 'gate' ? 'La barrière est fermée. Un champignon peut l’ouvrir !' : 'Aïe ! Bip s’est cogné dans un buisson.';
    msg += ' Le bloc orange pose problème.';
    badMark(last.ins);
  } else if (sim.result === 'splash') {
    msg = 'Plouf ! Bip a marché dans l’eau. Le bloc orange pose problème.';
    badMark(last.ins);
  } else if (sim.result === 'tired') {
    R.classList.add('puzzled');
    msg = 'Bip est fatigué : son programme ne s’arrête jamais ! Regarde tes boucles.';
  } else if (sim.result === 'unpainted') {
    R.classList.add('puzzled');
    msg = sim.left > 1 ? `Il reste ${sim.left} fleurs sans pollen. Marche dessus !` : 'Il reste une fleur sans pollen. Marche dessus !';
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
  if (R) R.classList.add('happy');
  clearNow();
  const n = totalBlocks(), par = G.lv.par;
  let stars = n <= par ? 3 : n <= par + 2 ? 2 : 1;
  if (G.sandbox) { stars = 3; }
  else if (!G.daily) {
    const prev = save.stars[G.lv.id] || 0;
    save.stars[G.lv.id] = Math.max(prev, stars); persist();
  }
  checkStickers();
  if (G.sandbox) award('sandboxwin');
  if (G.daily) { save.daily[DAILY_IDX] = true; persist(); award('daily1'); }
  SFX.win(); buzz([30, 60, 30]);
  confetti();
  $('#btnHint').classList.remove('glow'); $('#btnStep').classList.remove('glow');
  setTimeout(() => showWin(stars, n, par), RM ? 300 : 1000);
}
function showWin(stars, n, par) {
  const lastLevel = G.i === LAST_STORY;
  const chapterEnd = !lastLevel && G.i >= 0 && LEVELS[G.i + 1] && LEVELS[G.i + 1].ch !== G.lv.ch;
  $('#winBip').innerHTML = robotSVG();
  $('#winStars').innerHTML = [1, 2, 3].map(k => I.star(k <= stars)).join('');
  $$('#winStars svg.on').forEach((s, k) => { s.style.animationDelay = (k * 0.18) + 's'; });
  let title = stars === 3 ? 'Bravo !' : 'Bien joué !';
  let text = stars === 3
    ? `Programme parfait : ${n} bloc${n > 1 ? 's' : ''}, c’est le plus court.`
    : `Ton programme a ${n} blocs. On peut réussir avec ${par}. Tu essaies ?`;
  if (G.sandbox) { title = 'Quel jardin !'; text = 'Bip a fini TON jardin. Tu peux le modifier, ou en créer un autre !'; }
  if (G.lv.nv > 1 && stars === 3) text = `Ton programme marche dans les ${G.lv.nv} jardins, avec ${n} blocs seulement !`;
  if (lastLevel) { title = 'Champion !'; text = 'Tu as fini toute l’aventure de Bip. Tu sais vraiment programmer un robot !'; }
  else if (chapterEnd && stars === 3) text += ` Prochain chapitre : ${CHAPTERS[G.lv.ch + 1].name.toLowerCase()}.`;
  $('#winTitle').textContent = title;
  $('#winText').textContent = text;
  $('#btnAgain').innerHTML = `${I.replay}<span>Encore</span>`;
  $('#btnNext').innerHTML = lastLevel ? `${I.home}<span>Carte</span>` : `<span>Suivant</span>${I.next}`;
  $('#win').hidden = false;
  speak(title + ' ' + text);
  setTimeout(() => $('#btnNext').focus({ preventScroll: true }), 50);
}
function afterWinNext() {
  $('#win').hidden = true;
  if (G.sandbox) { openSandbox(); return; }
  if (G.daily) { show('home'); return; }
  if (G.i >= LAST_STORY) {
    playStory([
      { who: 'zoe', line: 'Regarde qui arrive… tout le monde est là, et le panier est plein !' },
      { who: 'tous', title: 'Le grand pique-nique', line: 'Merci champion ! Tu as retrouvé tous les jouets et préparé le plus beau pique-nique du monde. Bip est très fier de toi !' },
    ], () => show('home'));
    return;
  }
  const chapterEnd = G.i >= 0 && LEVELS[G.i + 1] && LEVELS[G.i + 1].ch !== G.lv.ch;
  const next = () => openLevel(G.i + 1);
  if (chapterEnd && !save.seen.ce[G.lv.ch]) {
    save.seen.ce[G.lv.ch] = true; persist();
    playStory(CHAPTERS[G.lv.ch].end, next);
  } else next();
}

/* ---------- Aide : le chemin en pointillés ---------- */
function showHint() {
  if (G.busy) return;
  if (G.mode === 'ball') { hintTiles(); return; }
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
function hideHint() { clearTimeout(G.hintT); $$('#fx .hint').forEach(d => d.remove()); $$('#board .tilemark.hint').forEach(t => t.remove()); }

/* ---------- Main qui montre (niveaux d'initiation) ---------- */
function coachTarget() {
  if ($('#game').hidden || G.busy || !$('#win').hidden || !$('#sheet').hidden || !$('#story').hidden || D || G.mode === 'ball') return null;
  const id = G.lv.id;
  if (id === 1 && !save.stars[1]) return G.prog.length ? $('#btnRun') : $('#palette .blk');
  if (id === 16 && !save.stars[16]) {
    const lp = G.prog.find(x => x.t === 'loop');
    if (!lp) return $('#palette .blk[data-t="loop"]');
    if (!lp.body.length) return G.target === lp.id ? $('#palette .blk[data-t="r"]') : $(`.ctr[data-id="${lp.id}"] .slot`);
    if (lp.n < 5) return $(`.ctr[data-id="${lp.id}"] > .ctr-head .ctr-p`);
    return $('#btnRun');
  }
  if (id === 36 && !save.stars[36]) {
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
