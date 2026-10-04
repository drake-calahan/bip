/* ===== Moteur pur : simulation d'un programme sur un niveau =====
   Blocs simples : r l u d (flèches absolues), f (avancer), tl tr (tourner), j (sauter), star (bloc magique)
   Conteneurs : loop {n, body} · while {c:'free'|'toys', body} · if {c:'puddle'|'obst', body, els} */
const DIRS = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
const LEFT = { u: 'l', l: 'd', d: 'r', r: 'u' };
const RIGHT = { u: 'r', r: 'd', d: 'l', l: 'u' };
const TOY_CHARS = 'bnctaz';
const CONTAINERS = ['loop', 'while', 'if'];
const MAX_ACTS = 90, MAX_CHECKS = 180;

function mapOf(lv, v) { return lv.variants ? lv.variants[v || 0] : lv.map; }

function parseLevel(lv, v) {
  const rows = mapOf(lv, v);
  const h = rows.length, w = rows[0].length;
  const cells = [];
  let start = null, box = null;
  const toys = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      let kind = 'grass';
      if (ch === '#') kind = 'bush';
      else if (ch === 'o') kind = 'rock';
      else if (ch === '~') kind = 'puddle';
      else if (ch === 'K') { kind = 'box'; box = [x, y]; }
      else if (ch === 'R') start = [x, y];
      else if (TOY_CHARS.includes(ch)) toys.push({ x, y, k: ch });
      cells.push(kind);
    }
  }
  return { w, h, cells, start, box, toys, face: lv.face || 'r' };
}

function cellAt(P, x, y) {
  if (x < 0 || y < 0 || x >= P.w || y >= P.h) return 'out';
  return P.cells[y * P.w + x];
}
const isBlocked = c => c === 'out' || c === 'bush' || c === 'rock';

function countBlocks(list) {
  let n = 0;
  for (const it of list || []) {
    n += 1;
    if (it.body) n += countBlocks(it.body);
    if (it.els) n += countBlocks(it.els);
  }
  return n;
}

/* Renvoie { steps, result, P, ... } — chaque étape est animable (move, jump, turn, check) */
function simulate(lv, prog, fn, v) {
  fn = fn || [];
  const P = parseLevel(lv, v);
  let x = P.start[0], y = P.start[1], face = P.face;
  const got = new Set(), steps = [];
  let acts = 0, checks = 0;
  if (!countBlocks(prog)) return { steps, result: 'empty', P };
  const ahead = () => { const [dx, dy] = DIRS[face]; return cellAt(P, x + dx, y + dy); };
  const test = c => c === 'puddle' ? ahead() === 'puddle' : c === 'obst' ? isBlocked(ahead()) : got.size === P.toys.length;
  const stop = (r, extra) => Object.assign({ __stop: true, r }, extra);

  function act(it, path) {
    if (++acts > MAX_ACTS) throw stop('tired');
    const ins = { id: it.id, t: it.t, path };
    const from = [x, y];
    if (it.t === 'tl' || it.t === 'tr') {
      face = it.t === 'tl' ? LEFT[face] : RIGHT[face];
      steps.push({ ins, kind: 'turn', from, to: from, face });
      return;
    }
    let kind, to;
    if (it.t === 'j') { const [dx, dy] = DIRS[face]; to = [x + 2 * dx, y + 2 * dy]; kind = 'jump'; }
    else { if (it.t !== 'f') face = it.t; const [dx, dy] = DIRS[face]; to = [x + dx, y + dy]; kind = 'move'; }
    const c = cellAt(P, to[0], to[1]);
    if (isBlocked(c)) { steps.push({ ins, kind, from, to, face, fail: c === 'out' ? 'out' : c }); throw stop('bump', { why: c }); }
    x = to[0]; y = to[1];
    if (c === 'puddle') { steps.push({ ins, kind, from, to, face, fail: 'puddle' }); throw stop('splash'); }
    let collect = null;
    P.toys.forEach((t, i) => { if (!got.has(i) && t.x === x && t.y === y) { got.add(i); collect = i; } });
    steps.push({ ins, kind, from, to, face, collect });
  }
  function check(it, path, ok) {
    if (++checks > MAX_CHECKS) throw stop('tired');
    steps.push({ ins: { id: it.id, t: it.t, path }, kind: 'check', ok, cond: it.c, from: [x, y], to: [x, y], face });
  }
  function run(list, path, depth) {
    for (const it of list) {
      if (it.t === 'loop') {
        for (let i = 1; i <= it.n; i++) run(it.body, path.concat({ id: it.id, iter: i, of: it.n }), depth);
      } else if (it.t === 'while') {
        let k = 0;
        for (;;) {
          const done = it.c === 'toys' ? test('toys') : isBlocked(ahead());
          check(it, path, !done);
          if (done || !it.body.length) break;
          k++;
          run(it.body, path.concat({ id: it.id, iter: k }), depth);
        }
      } else if (it.t === 'if') {
        const ok = test(it.c);
        check(it, path, ok);
        run(ok ? it.body : (it.els || []), path.concat({ id: it.id, br: ok ? 'then' : 'else' }), depth);
      } else if (it.t === 'star') {
        if (depth > 3) throw stop('tired');
        run(fn, path.concat({ id: it.id, call: true }), depth + 1);
      } else act(it, path);
    }
  }
  try { run(prog, [], 0); }
  catch (e) { if (e && e.__stop) return { steps, result: e.r, why: e.why, P }; throw e; }
  if (got.size < P.toys.length) return { steps, result: 'missing', P, left: P.toys.length - got.size };
  if (P.box && !(x === P.box[0] && y === P.box[1])) return { steps, result: 'notbox', P };
  return { steps, result: 'win', P };
}

/* Solveur BFS (blocs simples seulement) : plus court programme sans boucle */
function solve(lv, palette, v) {
  const P = parseLevel(lv, v);
  const moves = palette.filter(m => !CONTAINERS.includes(m) && m !== 'star');
  const full = (1 << P.toys.length) - 1;
  const key = (x, y, f, m) => `${x},${y},${f},${m}`;
  const q = [[P.start[0], P.start[1], P.face, 0, []]];
  const seen = new Set([key(P.start[0], P.start[1], P.face, 0)]);
  while (q.length) {
    const [x, y, f, m, path] = q.shift();
    for (const mv of moves) {
      let nf = f, tx = x, ty = y;
      if (mv === 'tl') nf = LEFT[f];
      else if (mv === 'tr') nf = RIGHT[f];
      else if (mv === 'j') { const [dx, dy] = DIRS[f]; tx = x + 2 * dx; ty = y + 2 * dy; }
      else { if (mv !== 'f') nf = mv; const [dx, dy] = DIRS[nf]; tx = x + dx; ty = y + dy; }
      const c = cellAt(P, tx, ty);
      if (isBlocked(c) || c === 'puddle') continue;
      let nm = m;
      P.toys.forEach((t, i) => { if (t.x === tx && t.y === ty) nm |= 1 << i; });
      const np = path.concat(mv);
      if (nm === full && (!P.box || (tx === P.box[0] && ty === P.box[1]))) return np;
      const k = key(tx, ty, nf, nm);
      if (!seen.has(k)) { seen.add(k); q.push([tx, ty, nf, nm, np]); }
    }
  }
  return null;
}

/* Petit langage pour écrire des programmes : "N3(f tr) Wo(Ip(j|f)) *"
   N3(...) répéter 3 fois · Wo(...) jusqu'à un obstacle · Wt(...) jusqu'à tous les jouets
   Ip(a|b) si flaque devant · Io(a|b) si obstacle devant · * bloc magique */
function parseProg(src, mkId) {
  let n = 0;
  mkId = mkId || (() => 'p' + n++);
  const toks = (src || '').match(/N\d+\(|W[ot]\(|I[po]\(|\(|\)|\||tl|tr|\*|[rludfj]/g) || [];
  let i = 0;
  function seq(stops) {
    const out = [];
    while (i < toks.length && !stops.includes(toks[i])) out.push(item());
    return out;
  }
  function item() {
    const t = toks[i++];
    if (/^N\d+\($/.test(t)) { const it = { t: 'loop', n: +t.slice(1, -1), id: mkId(), body: [] }; it.body = seq([')']); i++; return it; }
    if (/^W[ot]\($/.test(t)) { const it = { t: 'while', c: t[1] === 'o' ? 'free' : 'toys', id: mkId(), body: [] }; it.body = seq([')']); i++; return it; }
    if (/^I[po]\($/.test(t)) {
      const it = { t: 'if', c: t[1] === 'p' ? 'puddle' : 'obst', id: mkId(), body: [], els: [] };
      it.body = seq(['|', ')']);
      if (toks[i] === '|') { i++; it.els = seq([')']); }
      i++; return it;
    }
    return { t: t === '*' ? 'star' : t, id: mkId() };
  }
  return seq([]);
}

if (typeof module !== 'undefined') module.exports = { parseLevel, simulate, solve, countBlocks, parseProg, DIRS, LEFT, RIGHT, CONTAINERS };
