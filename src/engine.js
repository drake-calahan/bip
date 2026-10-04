/* ===== Moteur pur : simulation d'un programme sur un niveau ===== */
const DIRS = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
const TOY_CHARS = 'bnctaz';

function parseLevel(lv) {
  const rows = lv.map;
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

/* Aplatit le programme en une liste d'instructions avec leur origine */
function flatten(prog) {
  const out = [];
  for (const it of prog) {
    if (it.t === 'loop') {
      for (let i = 0; i < it.n; i++) {
        for (const b of it.body) out.push({ t: b.t, id: b.id, loopId: it.id, iter: i + 1, of: it.n });
      }
    } else out.push({ t: it.t, id: it.id });
  }
  return out;
}

function countBlocks(prog) {
  let n = 0;
  for (const it of prog) n += it.t === 'loop' ? 1 + it.body.length : 1;
  return n;
}

/* Renvoie { steps, result, failAt } — chaque étape décrit un déplacement animable */
function simulate(lv, prog) {
  const P = parseLevel(lv);
  let [x, y] = P.start;
  let face = P.face;
  const got = new Set();
  const steps = [];
  const flat = flatten(prog);
  if (!flat.length) return { steps, result: 'empty', P };
  for (const ins of flat) {
    const from = [x, y];
    let kind, to;
    if (ins.t === 'j') {
      const [dx, dy] = DIRS[face];
      to = [x + 2 * dx, y + 2 * dy];
      kind = 'jump';
    } else {
      face = ins.t;
      const [dx, dy] = DIRS[face];
      to = [x + dx, y + dy];
      kind = 'move';
    }
    const c = cellAt(P, to[0], to[1]);
    if (c === 'out' || c === 'bush' || c === 'rock') {
      steps.push({ ins, kind, from, to, face, fail: c === 'out' ? 'out' : c });
      return { steps, result: 'bump', why: c, P };
    }
    x = to[0]; y = to[1];
    if (c === 'puddle') {
      steps.push({ ins, kind, from, to, face, fail: 'puddle' });
      return { steps, result: 'splash', P };
    }
    let collect = null;
    P.toys.forEach((t, i) => { if (!got.has(i) && t.x === x && t.y === y) { got.add(i); collect = i; } });
    steps.push({ ins, kind, from, to, face, collect });
  }
  if (got.size < P.toys.length) return { steps, result: 'missing', P, left: P.toys.length - got.size };
  if (P.box && !(x === P.box[0] && y === P.box[1])) return { steps, result: 'notbox', P };
  return { steps, result: 'win', P };
}

/* Solveur BFS (sans boucles) : plus court programme en nombre de blocs */
function solve(lv, palette) {
  const P = parseLevel(lv);
  const moves = palette.filter(m => m !== 'loop');
  const full = (1 << P.toys.length) - 1;
  const key = (x, y, f, m) => `${x},${y},${f},${m}`;
  const startMask = 0;
  const q = [[P.start[0], P.start[1], P.face, startMask, []]];
  const seen = new Set([key(P.start[0], P.start[1], P.face, startMask)]);
  while (q.length) {
    const [x, y, f, m, path] = q.shift();
    for (const mv of moves) {
      let nf = f, tx, ty;
      if (mv === 'j') { const [dx, dy] = DIRS[f]; tx = x + 2 * dx; ty = y + 2 * dy; }
      else { nf = mv; const [dx, dy] = DIRS[mv]; tx = x + dx; ty = y + dy; }
      const c = cellAt(P, tx, ty);
      if (c === 'out' || c === 'bush' || c === 'rock' || c === 'puddle') continue;
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

if (typeof module !== 'undefined') module.exports = { parseLevel, simulate, solve, flatten, countBlocks, DIRS };
