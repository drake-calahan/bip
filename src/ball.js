/* ===== Mode toboggan : Ballon roule tout seul =====
   L'enfant ne programme plus Bip : il place des flèches au sol (les tuiles)
   pour guider Ballon (S, avec sa direction de départ) jusqu'au nid (N).
   Pure : aucun accès DOM, testable sous Node. */
function parseBallMap(lv, v) {
  const rows = lv.variants ? lv.variants[v || 0] : lv.map;
  const h = rows.length, w = rows[0].length;
  const cells = [];
  let start = null, nest = null;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      let kind = 'grass';
      if (ch === '#') kind = 'bush';
      else if (ch === 'o') kind = 'rock';
      else if (ch === '~') kind = 'puddle';
      else if (ch === 'N') { kind = 'nest'; nest = [x, y]; }
      else if (ch === 'S') start = [x, y];
      cells.push(kind);
    }
  }
  return { w, h, cells, start, nest, face: lv.face || 'r', toys: [], box: null, crates: [], pads: [], switches: [], gates: [], flowers: [] };
}

/* tiles : liste [x, y, dir] (r l u d). Renvoie { result, steps, why }.
   result : 'win' · 'out' (sorti du chemin) · 'stop' (bloqué) · 'splash' (flaque)
            · 'loop' (tourne en rond) · 'none' (aucune tuile). */
function rollBall(lv, tiles, v) {
  const P = parseBallMap(lv, v);
  const map = {};
  (tiles || []).forEach(([x, y, d]) => { map[y * P.w + x] = d; });
  const steps = [];
  if (!tiles || !tiles.length) return { result: 'none', steps, P };
  const DIRS = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
  let x = P.start[0], y = P.start[1], dir = P.face;
  const seen = new Set();
  for (let n = 0; n < 240; n++) {
    const stKey = x + ',' + y + ',' + dir;
    if (seen.has(stKey)) return { result: 'loop', steps, P };
    seen.add(stKey);
    const [dx, dy] = DIRS[dir];
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= P.w || ny >= P.h) return { result: 'out', steps, P };
    const c = P.cells[ny * P.w + nx];
    const step = { from: [x, y], to: [nx, ny], dir };
    x = nx; y = ny;
    steps.push(step);
    if (c === 'bush' || c === 'rock') return { result: 'stop', steps, why: c, P };
    if (c === 'puddle') return { result: 'splash', steps, P };
    const td = map[ny * P.w + nx];
    if (td && td !== dir) { dir = td; step.tile = [nx, ny]; step.nd = td; }
    if (P.nest && x === P.nest[0] && y === P.nest[1]) return { result: 'win', steps, P };
  }
  return { result: 'loop', steps, P };
}

/* Une tuile n'est posable que sur l'herbe (pas buisson, rocher, flaque, nid, départ). */
function tileableCells(lv, v) {
  const P = parseBallMap(lv, v);
  const out = [];
  for (let i = 0; i < P.cells.length; i++) {
    if (P.cells[i] !== 'grass') continue;
    const x = i % P.w, y = (i / P.w) | 0;
    if (P.start[0] === x && P.start[1] === y) continue;
    if (P.nest[0] === x && P.nest[1] === y) continue;
    out.push([x, y]);
  }
  return out;
}

if (typeof module !== 'undefined') module.exports = { parseBallMap, rollBall, tileableCells };
