/* Vérifie chaque niveau v2 :
   — mode classique : solution de référence gagnante dans tous les jardins,
     programme de départ (détective) qui échoue, par ≤ max, courbe de difficulté ;
   — mode toboggan : les tuiles de référence mènent au nid, par = nombre de tuiles ;
   — nénuphars/caisses/barrières : solution explicite fournie (solveur non applicable). */
const E = require('../src/engine.js');
const B = require('../src/ball.js');
const { LEVELS, CHAPTERS } = require('../src/levels.js');
let ok = true;
let prevPar = 1;
const curve = [];

for (const lv of LEVELS) {
  const nv = lv.variants ? lv.variants.length : 1;
  const ch = CHAPTERS[lv.ch] || { name: '?' };
  let line = `L${String(lv.id).padStart(2)} ${ch.name.slice(0, 18).padEnd(18)} `;
  let par;

  if (lv.mode === 'ball') {
    const tiles = (lv.tiles || []).map(t => t.split(',').map((p, i) => i < 2 ? +p : p));
    par = tiles.length;
    const r = B.rollBall(lv, tiles, 0);
    line += `[toboggan ref:${r.result}] `;
    if (r.result !== 'win') ok = false;
    if (!lv.tiles || !lv.tiles.length) { line += 'NO TILES '; ok = false; }
    if (lv.max && par > lv.max) { line += 'OVER MAX '; ok = false; }
    line += `par=${par}${lv.max ? ' max=' + lv.max : ''}`;
    curve.push([lv.id, ch.name, par]);
    console.log(line);
    continue;
  }

  const fn = lv.fn ? E.parseProg(lv.fn) : [];
  const hasCG = (lv.variants || [lv.map]).some(rows => rows.some(r => /[CG]/.test(r)));
  let ref;
  if (lv.sol) { ref = E.parseProg(lv.sol); par = E.countBlocks(ref) + E.countBlocks(fn); }
  if (!lv.sol && hasCG) { line += 'NEEDS EXPLICIT SOL (C/G) '; ok = false; }

  for (let v = 0; v < nv; v++) {
    const bfs = E.solve(lv, lv.pal, v);
    if (!lv.sol && nv === 1) {
      if (!bfs) { line += 'UNSOLVABLE '; ok = false; continue; }
      ref = E.parseProg(bfs.join(' ')); par = bfs.length;
    }
    if (!ref) continue;
    const r = E.simulate(lv, ref, fn, v);
    line += `[v${v + 1} ref:${r.result}] `;
    if (r.result !== 'win') ok = false;
    if (lv.max && bfs && bfs.length <= lv.max && !lv.start && !hasCG && nv === 1) line += '(WARN plain fits) ';
    if (lv.start) {
      const s = E.simulate(lv, E.parseProg(lv.start), [], v);
      line += `start:${s.result} `;
    }
  }
  if (lv.start) {
    const fails = Array.from({ length: nv }, (_, v) => E.simulate(lv, E.parseProg(lv.start), [], v).result).some(r => r !== 'win');
    if (!fails) { line += 'START WINS! '; ok = false; }
  }
  if (lv.startFn) {
    const sf = E.parseProg(lv.startFn);
    const fails = Array.from({ length: nv }, (_, v) => E.simulate(lv, E.parseProg(lv.start), sf, v).result).some(r => r !== 'win');
    if (!fails) { line += 'STARTFN WINS! '; ok = false; }
  }
  line += `par=${par}${lv.max ? ' max=' + lv.max : ''}`;
  if (lv.max && par > lv.max) { line += ' OVER MAX'; ok = false; }
  // la solution ne doit utiliser que des blocs de la palette
  const pal = new Set([...(lv.pal || []), 'star']);
  const src = [lv.sol || '', lv.fn || ''].join(' ');
  const structural = new Set(['(', ')', '|']);
  const used = (src.match(/N\d+\(|W[ot]\(|I[po]\(|\(|\)|\||tl|tr|\*|[rludfj]/g) || []);
  const bad = used.filter(t => !structural.has(t) && !/^(N\d+\(|W[ot]\(|I[po]\()$/.test(t) && !pal.has(t === '*' ? 'star' : t));
  if (bad.length) { line += ` PAL-MISSING:${bad.join('')}`; ok = false; }
  if (par != null && par > prevPar + 4) line += ' (SPIKE?)';
  if (par != null) prevPar = par;
  curve.push([lv.id, ch.name, par]);
  console.log(line);
}

console.log('\nCourbe (blocs de la solution de référence) :');
console.log(curve.map(([id, name, par]) => `${id}:${par}`).join(' '));
const stars = LEVELS.filter(l => !l.daily).length;
console.log(`\n${LEVELS.length} niveaux (${stars} aventure + ${LEVELS.length - stars} défis), ${CHAPTERS.length} chapitres`);
console.log(ok ? 'ALL OK' : 'PROBLEMS');
process.exitCode = ok ? 0 : 1;
