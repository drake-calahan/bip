/* V10 « L'aube » — vérifications ciblées :
   1. moteur : bloc loupe `c` (jouet le plus proche, inaccessible -> bump/toy, Wt(c) termine)
              condition while `paint` (Wf) : arrêt quand tout est peint, 'missing' sinon
   2. contenu : 110 niveaux, 103 d'aventure, dernier niveau = ch21, toutes les refs gagnent
   3. codec de partage Mon jardin (sbEncode/sbDecode, chargé par vm comme check-sandbox.js) */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('../src/engine.js');
const { LEVELS, CHAPTERS, WORLDS } = require('../src/levels.js');

/* ---------- 1. moteur ---------- */
// parseProg : nouveaux jetons
{
  const p = E.parseProg('Wf(f) Wg(*) N2(c) p g');
  assert.equal(p[0].t, 'while'); assert.equal(p[0].c, 'paint');
  assert.equal(p[1].t, 'while'); assert.equal(p[1].c, 'flag');
  assert.equal(p[2].t, 'loop'); assert.equal(p[2].body[0].t, 'c');
  assert.deepEqual(p.slice(3).map(i => i.t), ['p', 'g']);
  assert.equal(E.countBlocks(p), 8);
}
// loupe : un seul c attrape le jouet le plus proche (b), l’autre reste -> missing/left=1
{
  const lv = { pal: ['f', 'tl', 'tr', 'c'], map: ['R.b..n'], face: 'r' };
  const r = E.simulate(lv, E.parseProg('c'), [], 0);
  assert.equal(r.result, 'missing');
  assert.equal(r.left, 1, 'un seul jouet manque : c a visé le plus proche (b)');
  assert.ok(r.steps.some(s => s.collect === 0), 'le ballon (b) est ramassé');
}
{
  const lv = { pal: ['f', 'tl', 'tr', 'c', 'loop'], map: ['R.b..n'], face: 'r' };
  const r = E.simulate(lv, E.parseProg('N2(c)'), [], 0);
  assert.equal(r.result, 'win', 'N2(c) ramasse les deux jouets');
  const steps = r.steps.filter(s => s.kind === 'move' || s.kind === 'jump');
  assert.ok(steps.length >= 3, 'la loupe a bien marché');
}
// loupe : jouet enfermé -> bump/toy (pas de boucle infinie)
{
  const r = E.simulate({ pal: ['f', 'c'], map: ['R#', '##', '#b'], face: 'r' }, E.parseProg('c'));
  assert.equal(r.result, 'bump'); assert.equal(r.why, 'toy');
}
// loupe : saute par-dessus un obstacle comme g
{
  const r = E.simulate({ pal: ['f', 'tl', 'tr', 'j', 'c'], map: ['R~b'], face: 'r' }, E.parseProg('c'));
  assert.equal(r.result, 'win', 'la loupe saute la flaque');
}
// Wt(c) termine sur 3 jouets
{
  const r = E.simulate({ pal: ['f', 'tl', 'tr', 'while', 'c'], map: ['R.b.n.c'], face: 'r' }, E.parseProg('Wt(c)'));
  assert.equal(r.result, 'win', 'Wt(c) collecte tout et s’arrête');
}
// Wf : s’arrête quand tout est peint ; sinon unpainted/missing
{
  const lv = { pal: ['f', 'tl', 'tr', 'while'], map: ['R*b*'], face: 'r' };
  assert.equal(E.simulate(lv, E.parseProg('Wf(f)'), [], 0).result, 'win', 'Wf(f) peint tout');
  const lv2 = { pal: ['f', 'tl', 'tr', 'while'], map: ['R*b*b'], face: 'r' };
  const r2 = E.simulate(lv2, E.parseProg('Wf(f)'), [], 0);
  assert.equal(r2.result, 'missing', 'Wf ne ramasse pas les jouets : résultat missing, pas de boucle infinie');
}
// Wf avec un si dedans (niveau L102 réel)
{
  const lv = LEVELS[101];
  const r = E.simulate(lv, E.parseProg(lv.sol), E.parseProg(lv.fn), 0);
  assert.equal(r.result, 'win', 'L102 Wf(Ip(j|f)) c gagne');
}
// Équilibrage V10 : le rond fleur ne résout PAS seul les puzzles de ch21
{
  const naive = (lv, v) => E.simulate(lv, E.parseProg('Wf(f)'), [], v || 0).result;
  const wfOnly = (lv, v) => E.simulate(lv, E.parseProg('Wf(Ip(j|f))'), [], v || 0).result;
  assert.notEqual(naive(LEVELS[99]), 'win', 'L100 : Wf(f) naïf ne gagne pas (jouet à attraper à la loupe)');
  for (let v = 0; v < 3; v++) assert.notEqual(naive(LEVELS[100], v), 'win', `L101 v${v + 1} : Wf(f) naïf rate (flaque)`);
  assert.notEqual(wfOnly(LEVELS[101]), 'win', 'L102 : Wf(Ip(j|f)) seul ne gagne pas (jouet à côté)');
  assert.notEqual(E.simulate(LEVELS[101], E.parseProg('c'), [], 0).result, 'win', 'L102 : la loupe seule ne gagne pas (fleur non peinte)');
  assert.equal(E.simulate(LEVELS[101], E.parseProg('Wf(Ip(j|f)) c'), [], 0).result, 'win', 'L102 : le combo boucle+saut+loupe gagne');
}
// solveur BFS ignore 'c' (pas un mouvement simple)
{
  const s = E.solve({ pal: ['f', 'c'], map: ['R.b'], face: 'r' }, ['f', 'c']);
  assert.ok(s === null || !s.includes('c'), 'solve ne renvoie pas de c');
}
console.log('moteur V10 OK (loupe c, while paint Wf, parseProg)');

/* ---------- 2. contenu ---------- */
assert.equal(LEVELS.length, 110, '110 niveaux au total');
assert.equal(LEVELS.filter(l => l.ch >= 0).length, 103, '103 niveaux d’aventure');
assert.equal(CHAPTERS.length, 21, '21 chapitres');
assert.equal(WORLDS.length, 5, '5 mondes');
assert.equal(WORLDS[4].name, 'L’aube');
assert.equal(CHAPTERS[19].name, 'Le nez de Bip');
assert.equal(CHAPTERS[20].name, 'Jusqu’aux fleurs dorées');
assert.ok(CHAPTERS[20].final, 'ch21 marqué final');
const last = LEVELS.reduce((a, l, i) => (l.ch >= 0 ? i : a), 0);
assert.equal(LEVELS[last].id, 103, 'dernier niveau d’aventure = L103');
assert.equal(LEVELS[last].ch, 20);
for (let i = 95; i <= 102; i++) {
  const lv = LEVELS[i];
  const fn = lv.fn ? E.parseProg(lv.fn) : [];
  const ref = E.parseProg(lv.sol);
  const nv = lv.variants ? lv.variants.length : 1;
  for (let v = 0; v < nv; v++) {
    const r = E.simulate(lv, ref, fn, v);
    assert.equal(r.result, 'win', `L${lv.id} v${v + 1} gagne avec sa ref`);
  }
  const used = new Set((lv.sol + ' ' + (lv.fn || '')).match(/[a-z*]+/g) || []);
  for (const t of ['c', 'while', 'if', 'g', 'star']) if (used.has(t)) assert.ok(lv.pal.includes(t === '*' ? 'star' : t), `L${lv.id} palette contient ${t}`);
}
assert.ok(LEVELS[95].sol === 'c' && LEVELS[95].pal.includes('c'), 'L96 : premier niveau loupe');
assert.ok(LEVELS[99].sol.startsWith('Wf('), 'L100 : premier niveau Wf');
console.log('contenu V10 OK (monde aube, ch20-21, 8 niveaux validés)');

/* ---------- 3. codec de partage ---------- */
const elements = {};
const el = () => ({ innerHTML: '', textContent: '', value: '', hidden: false, style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {} }, dataset: {}, append() {}, addEventListener() {}, focus() {}, select() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 340 }) });
const sandboxCtx = vm.createContext({
  parseLevel: E.parseLevel,
  G: { sb: { rows: ['R....b', '......', '......', '......', '......'], tool: 'R', cur: 0 }, sbCellPx: 64 },
  save: { sandbox: [null, null, null] },
  $: s => { if (!elements[s]) elements[s] = el(); return elements[s]; },
  $$: () => [],
  robotSVG: () => '', symUse: () => '', toyUse: () => '',
  TOY_NAME: {}, I: { eraser: '', share: '', paste: '' },
  SFX: new Proxy({}, { get: () => () => {} }),
  FULL_PAL: [], persist() {}, stat() {}, award() {}, speak() {}, stopVoice() {},
  audio() {}, openLevelObj() {}, btoa, atob, navigator: {},
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/app-sandbox.js'), 'utf8'), sandboxCtx);

const rows = ['R.#..b..', '.~.*....', '..sG....', '.C......', '..F.n...', '........'];
const code = sandboxCtx.sbEncode(rows);
assert.ok(/^BIP2\.[A-Za-z0-9_-]+$/.test(code), 'code bien formé (BIP2, jardin 8×6): ' + code);
assert.equal(JSON.stringify(sandboxCtx.sbDecode(code)), JSON.stringify(rows), 'aller-retour encode/decode 8×6');
// ancien code BIP1 (6×5) : relu et complété à 8×6
const oldRows = ['R.#..b', '.~.*..', '..sG..', '.C....', '..F.n.'];
const oldCode = 'BIP1.' + btoa(oldRows.join('/')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const migrated = sandboxCtx.sbDecode(oldCode);
assert.ok(Array.isArray(migrated) && migrated.length === 6 && migrated.every(r => r.length === 8), 'BIP1 décodé en 8×6');
assert.equal(migrated[0].slice(0, 6), 'R.#..b', 'BIP1 : contenu conservé (complété à droite)');
assert.equal(migrated.join('').split('R').length - 1, 1, 'BIP1 : un seul départ après migration');
assert.equal(sandboxCtx.sbDecode('BIP2.' + code.slice(5).slice(0, 4)), null, 'code tronqué rejeté');
assert.equal(sandboxCtx.sbDecode('HACK.xxxxxxxxxx'), null, 'mauvais préfixe rejeté');
assert.equal(sandboxCtx.sbDecode('BIP3.' + code.slice(5)), null, 'mauvaise version rejetée');
assert.equal(sandboxCtx.sbDecode('BIP2.' + sandboxCtx.sbEncode(['RR...b..', '........', '........', '........', '........', '........']).slice(5)), null, 'deux départs rejetés');
assert.equal(sandboxCtx.sbDecode('BIP2.' + sandboxCtx.sbEncode(['........', '........', '........', '........', '........', '........']).slice(5)), null, 'zéro départ rejeté');
assert.equal(sandboxCtx.sbDecode('BIP2.' + sandboxCtx.sbEncode(['R...!b..', '........', '........', '........', '........', '........']).slice(5)), null, 'caractère interdit rejeté');
assert.equal(sandboxCtx.sbDecode(''), null, 'vide rejeté');
assert.equal(sandboxCtx.sbDecode('BIP2.abc'), null, 'trop court rejeté');
console.log('codec V10 OK (BIP2 8×6 + BIP1 rétrocompatible) — ex. ' + code);
console.log('\nV10 OK');
