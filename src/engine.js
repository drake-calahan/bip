/* ===== Moteur pur : simulation d'un programme sur un niveau =====
   Blocs simples : r l u d (flèches absolues), f (avancer), tl tr (tourner), j (sauter), g (va à la balise), star (bloc magique)
   Conteneurs : loop {n, body} · while {c:'free'|'toys', body} · if {c:'puddle'|'obst', body, els}
   Terrain : . herbe · # buisson · o rocher · ~ flaque · K coffre
             - nénuphar (s'enfonce quand Bip le quitte) · s champignon (ouvre les barrières)
             G barrière (bloque tant que fermée) · * fleur (à peindre en marchant dessus) · F balise (waypoint)
   Entités : C caisse (poussée par Bip ; dans l'eau elle devient un pont)
   Jouets : b n c t a e (e = luciole) */
const DIRS = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
const LEFT = { u: 'l', l: 'd', d: 'r', r: 'u' };
const RIGHT = { u: 'r', r: 'd', d: 'l', l: 'u' };
const TOY_CHARS = 'bnctae';
const CONTAINERS = ['loop', 'while', 'if'];
const MAX_ACTS = 110, MAX_CHECKS = 220;

function mapOf(lv, v) { return lv.variants ? lv.variants[v || 0] : lv.map; }

function parseLevel(lv, v) {
  const rows = mapOf(lv, v);
  const h = rows.length, w = rows[0].length;
  const cells = [];
  let start = null, box = null;
  const flags = [];
  const toys = [], pads = [], switches = [], gates = [], crates = [], flowers = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      let kind = 'grass';
      if (ch === '#') kind = 'bush';
      else if (ch === 'o') kind = 'rock';
      else if (ch === '~') kind = 'puddle';
      else if (ch === 'K') { kind = 'box'; box = [x, y]; }
      else if (ch === 'F') { kind = 'flag'; flags.push([x, y]); }
      else if (ch === '-') { kind = 'pad'; pads.push(cells.length); }
      else if (ch === 's') { kind = 'switch'; switches.push(cells.length); }
      else if (ch === 'G') { kind = 'gate'; gates.push(cells.length); }
      else if (ch === '*') { kind = 'flower'; flowers.push(cells.length); }
      else if (ch === 'C') crates.push([x, y]);
      else if (ch === 'R') start = [x, y];
      else if (TOY_CHARS.includes(ch)) toys.push({ x, y, k: ch });
      cells.push(kind);
    }
  }
  return { w, h, cells, start, box, flags, toys, pads, switches, gates, crates, flowers, face: lv.face || 'r' };
}

function cellAt(P, x, y) {
  if (x < 0 || y < 0 || x >= P.w || y >= P.h) return 'out';
  return P.cells[y * P.w + x];
}
const isBlockedKind = c => c === 'out' || c === 'bush' || c === 'rock';

function countBlocks(list) {
  let n = 0;
  for (const it of list || []) {
    n += 1;
    if (it.body) n += countBlocks(it.body);
    if (it.els) n += countBlocks(it.els);
  }
  return n;
}

/* Renvoie { steps, result, P, ... } — chaque étape est animable
   (move, jump, turn, check, push, gate). Le pas s'enfonce via step.sink,
   la fleur peinte via step.paint, la barrière s'ouvre via un pas 'gate'. */
function simulate(lv, prog, fn, v) {
  fn = fn || [];
  const P = parseLevel(lv, v);
  let x = P.start[0], y = P.start[1], face = P.face;
  const got = new Set(), steps = [];
  const crates = P.crates.map(c => c.slice());      // positions vives des caisses
  const crateHome = P.crates.map((c, i) => i);      // index d'affichage
  const livePads = new Set(P.pads);                 // nénuphars encore flottants
  const painted = new Set();                        // cases fleuries peintes
  let gatesOpen = false;
  let acts = 0, checks = 0;
  if (!countBlocks(prog)) return { steps, result: 'empty', P };

  const crateAt = (cx, cy) => crates.findIndex(c => c && c[0] === cx && c[1] === cy);
  const blockedAt = (bx, by) => {
    const c = cellAt(P, bx, by);
    if (isBlockedKind(c) || (c === 'gate' && !gatesOpen)) return true;
    return crateAt(bx, by) >= 0;
  };
  const ahead = () => { const [dx, dy] = DIRS[face]; return cellAt(P, x + dx, y + dy); };
  const test = c => c === 'puddle' ? ['puddle', 'water'].includes(ahead()) : c === 'obst' ? blockedAt(x + DIRS[face][0], y + DIRS[face][1]) : c === 'toy' ? P.toys.some((t, i) => !got.has(i) && t.x === x + DIRS[face][0] && t.y === y + DIRS[face][1]) : got.size === P.toys.length;
  const stop = (r, extra) => Object.assign({ __stop: true, r }, extra);

  const gateStep = at => steps.push({ ins: null, kind: 'gate', at, from: at, to: at, face });
  const arrive = (st, nx, ny) => {                 // effets d'arrivée de Bip sur une case
    const idx = ny * P.w + nx;
    if (P.cells[idx] === 'switch' && !gatesOpen) {
      gatesOpen = true;
      gateStep([nx, ny]);
    }
    if (P.cells[idx] === 'flower' && !painted.has(idx)) { painted.add(idx); st.paint = [nx, ny]; }
  };
  const leaveCell = (st, fx, fy) => {              // le nénuphar coule quand on le quitte
    const idx = fy * P.w + fx;
    if (P.cells[idx] === 'pad' && livePads.has(idx)) {
      livePads.delete(idx);
      P.cells[idx] = 'water';
      st.sink = [fx, fy];
    }
  };

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
    const st = { ins, kind, from, to, face };

    const ci = crateAt(to[0], to[1]);
    if (ci >= 0 && kind === 'move') {              // pousser la caisse
      const [dx, dy] = DIRS[face];
      const bx = to[0] + dx, by = to[1] + dy;
      const bc = cellAt(P, bx, by);
      const crateOnTarget = bc === 'grass' || bc === 'flower' || bc === 'switch' || bc === 'plank';
      if (bc === 'puddle' || bc === 'water') {      // dans l'eau : la caisse devient un pont
        crates[ci] = null;
        P.cells[by * P.w + bx] = 'plank';
        st.crate = { from: to.slice(), to: [bx, by], plank: true };
      } else if (crateOnTarget && crateAt(bx, by) < 0 && !P.toys.some(t => t.x === bx && t.y === by)) {
        crates[ci] = [bx, by];
        st.crate = { from: to.slice(), to: [bx, by] };
        if (bc === 'switch' && !gatesOpen) { gatesOpen = true; st.crate.gate = [bx, by]; }  // la caisse appuie le champignon
      } else {
        steps.push({ ins, kind, from, to, face, fail: 'crate' });
        throw stop('bump', { why: 'crate' });
      }
    } else if (isBlockedKind(cellAt(P, to[0], to[1])) || (cellAt(P, to[0], to[1]) === 'gate' && !gatesOpen)) {
      const c = cellAt(P, to[0], to[1]);
      steps.push({ ins, kind, from, to, face, fail: c === 'out' ? 'out' : c });
      throw stop('bump', { why: c });
    } else if (crateAt(to[0], to[1]) >= 0 && kind === 'jump') {  // atterrir sur une caisse : aïe
      steps.push({ ins, kind, from, to, face, fail: 'crate' });
      throw stop('bump', { why: 'crate' });
    }

    leaveCell(st, x, y);
    x = to[0]; y = to[1];
    if (st.crate) st.kind = kind = 'push';
    const c = cellAt(P, x, y);
    if (c === 'puddle' || c === 'water') { steps.push(Object.assign(st, { fail: 'puddle' })); throw stop('splash'); }
    let collect = null;
    P.toys.forEach((t, i) => { if (!got.has(i) && t.x === x && t.y === y) { got.add(i); collect = i; } });
    if (collect != null) st.collect = collect;
    steps.push(st);
    arrive(st, x, y);
    if (st.crate && st.crate.gate) gateStep(st.crate.gate);
  }
  function check(it, path, ok) {
    if (++checks > MAX_CHECKS) throw stop('tired');
    steps.push({ ins: { id: it.id, t: it.t, path }, kind: 'check', ok, cond: it.c, from: [x, y], to: [x, y], face });
  }
  /* Chemin vers la balise la plus proche non visitée : on réutilise le solveur BFS sur un
     niveau temporaire où SEULE cette balise devient un jouet (les vrais jouets sont gardés :
     la route les ramasse au passage) ; coffre/caisses/barrières sont vidés. */
  const visitedFlags = new Set();
  function pathToFlag() {
    if (!P.flags.length) return null;
    P.flags.forEach((f, i) => { if (f[0] === x && f[1] === y) visitedFlags.add(i); });
    let best = null;
    P.flags.forEach((f, fi) => {
      if (visitedFlags.has(fi)) return;
      // niveau temporaire : départ = position courante de Bip, balise cible = jouet,
      // autres balises = herbe, coffre/caisses/barrières vidés, vrais jouets gardés
      const rows = mapOf(lv, v).map((r, ri) => r.split('').map((c, ci) => {
        if (c === 'R') return '.';
        if (c === 'F') return ri === f[1] && ci === f[0] ? 'b' : '.';
        if (c === 'C' || c === 'G' || c === 'K') return '.';
        return c;
      }).join(''));
      rows[y] = rows[y].slice(0, x) + 'R' + rows[y].slice(x + 1);
      const route = solve({ map: rows, face }, ['f', 'tl', 'tr', 'j'], 0);
      if (route && (!best || route.length < best.route.length)) best = { route, fi };
    });
    return best;
  }
  function run(list, path, depth) {
    for (const it of list) {
      if (it.t === 'loop') {
        for (let i = 1; i <= it.n; i++) run(it.body, path.concat({ id: it.id, iter: i, of: it.n }), depth);
      } else if (it.t === 'while') {
        let k = 0;
        for (;;) {
          const done = it.c === 'toys' ? test('toys') : blockedAt(x + DIRS[face][0], y + DIRS[face][1]);
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
      } else if (it.t === 'g') {
        const target = pathToFlag();
        if (!target) {
          steps.push({ ins: { id: it.id, t: it.t, path }, kind: 'check', ok: false, cond: 'flag', from: [x, y], to: [x, y], face });
          throw stop('bump', { why: 'flag' });
        }
        run(target.route.map((t, k) => ({ t, id: it.id + '.' + k })), path.concat({ id: it.id, call: 'g' }), depth);
        visitedFlags.add(target.fi);
        steps.push({ ins: { id: it.id, t: it.t, path }, kind: 'check', ok: true, cond: 'flag', from: [x, y], to: [x, y], face });
      } else act(it, path);
    }
  }
  try { run(prog, [], 0); }
  catch (e) { if (e && e.__stop) return { steps, result: e.r, why: e.why, P }; throw e; }
  if (got.size < P.toys.length) return { steps, result: 'missing', P, left: P.toys.length - got.size };
  if (painted.size < P.flowers.length) return { steps, result: 'unpainted', P, left: P.flowers.length - painted.size };
  if (P.box && !(x === P.box[0] && y === P.box[1])) return { steps, result: 'notbox', P };
  return { steps, result: 'win', P };
}

/* Solveur BFS (blocs simples, sans caisses ni barrières) : plus court programme.
   État : position + jouets + fleurs peintes + nénuphars franchis. */
function solve(lv, palette, v) {
  const P = parseLevel(lv, v);
  const rows = mapOf(lv, v);
  for (const row of rows) if (/[CG]/.test(row)) return null;   // mécanique non résolue : sol explicite requis
  const moves = palette.filter(m => !CONTAINERS.includes(m) && m !== 'star' && m !== 'g');
  const full = (1 << P.toys.length) - 1;
  const flAll = (1 << P.flowers.length) - 1;
  const flowerIdx = idx => P.flowers.indexOf(idx);
  const key = (x, y, f, m, fl, pd) => `${x},${y},${f},${m},${fl},${pd}`;
  const q = [[P.start[0], P.start[1], P.face, 0, 0, 0, []]];
  const seen = new Set([key(P.start[0], P.start[1], P.face, 0, 0, 0)]);
  const padIdx = idx => P.pads.indexOf(idx);
  const won = (m, fl, x, y) => m === full && fl === flAll && (!P.box || (x === P.box[0] && y === P.box[1]));
  while (q.length) {
    const [x, y, f, m, fl, pd, path] = q.shift();
    for (const mv of moves) {
      let nf = f, tx = x, ty = y;
      if (mv === 'tl') nf = LEFT[f];
      else if (mv === 'tr') nf = RIGHT[f];
      else if (mv === 'j') { const [dx, dy] = DIRS[f]; tx = x + 2 * dx; ty = y + 2 * dy; }
      else { if (mv !== 'f') nf = mv; const [dx, dy] = DIRS[nf]; tx = x + dx; ty = y + dy; }
      const c = cellAt(P, tx, ty);
      if (isBlockedKind(c) || c === 'puddle') continue;
      const tIdx = ty * P.w + tx;
      const tPi = padIdx(tIdx);
      if (tPi >= 0 && (pd & (1 << tPi))) continue;  // nénuphar déjà coulé : c'est de l'eau
      let nm = m;
      P.toys.forEach((t, i) => { if (t.x === tx && t.y === ty) nm |= 1 << i; });
      let nfl = fl, npd = pd;
      const fi = flowerIdx(tIdx);
      if (fi >= 0) nfl |= 1 << fi;
      if (tx !== x || ty !== y) {                   // on quitte la case : un nénuphar y coule
        const pi = padIdx(y * P.w + x);
        if (pi >= 0) npd |= 1 << pi;
      }
      const np = path.concat(mv);
      if (won(nm, nfl, tx, ty)) return np;
      const k = key(tx, ty, nf, nm, nfl, npd);
      if (!seen.has(k)) { seen.add(k); q.push([tx, ty, nf, nm, nfl, npd, np]); }
    }
  }
  return null;
}

/* Petit langage pour écrire des programmes : "N3(f tr) Wo(Ip(j|f)) It(f|tr) * g"
   N3(...) répéter 3 fois · Wo(...) jusqu'à un obstacle · Wt(...) jusqu'à tous les jouets
   Ip(a|b) si flaque devant · Io(a|b) si obstacle devant · It(a|b) si jouet devant · * bloc magique · g va à la balise */
function parseProg(src, mkId) {
  let n = 0;
  mkId = mkId || (() => 'p' + n++);
  const toks = (src || '').match(/N\d+\(|W[ot]\(|I[pot]\(|\(|\)|\||tl|tr|\*|[rludfjg]/g) || [];
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
    if (/^I[pot]\($/.test(t)) {
      const it = { t: 'if', c: t[1] === 'p' ? 'puddle' : t[1] === 'o' ? 'obst' : 'toy', id: mkId(), body: [], els: [] };
      it.body = seq(['|', ')']);
      if (toks[i] === '|') { i++; it.els = seq([')']); }
      i++; return it;
    }
    return { t: t === '*' ? 'star' : t, id: mkId() };
  }
  return seq([]);
}

if (typeof module !== 'undefined') module.exports = { parseLevel, simulate, solve, countBlocks, parseProg, DIRS, LEFT, RIGHT, CONTAINERS, TOY_CHARS };
