/* Verifie le cycle de creation quand le depart de Bip est efface ou remplace. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseLevel } = require('../src/engine.js');

const board = { innerHTML: '', style: { setProperty() {} }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 340 }) };
const message = { textContent: '' };
const slots = { innerHTML: '' };
const elements = { '#sbBoard': board, '#sbBoardWrap': board, '#sbMsg': message, '#sbSlots': slots };
let opened = null;
const context = vm.createContext({
  parseLevel,
  G: { sb: { rows: ['......', '......', 'R.....', '......', '......'], tool: '.', cur: 0 }, sbCellPx: 64 },
  save: { sandbox: [null, null, null] },
  $: selector => elements[selector],
  $$: () => [],
  robotSVG: () => '<svg class="bip"></svg>',
  symUse: kind => `<svg data-kind="${kind}"></svg>`,
  toyUse: kind => `<svg data-toy="${kind}"></svg>`,
  TOY_NAME: { b: 'ballon', n: 'nounours', c: 'canard', t: 'toupie', a: 'cube', e: 'luciole' },
  I: { eraser: '', share: '', paste: '' },
  SFX: { tap() {}, del() {}, nope() {} },
  FULL_PAL: ['r', 'l', 'u', 'd'],
  persist() {},
  stat() {},
  award() {},
  speak() {},
  openLevelObj: (level, options) => { opened = { level, options }; }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/app-sandbox.js'), 'utf8'), context);

function tap(x, y) {
  const cell = context.G.sbCellPx;
  context.onSbTap({ clientX: 7 + (x + 0.5) * cell, clientY: 7 + (y + 0.5) * cell });
}

context.renderSbBoard();
assert.match(board.innerHTML, /class="it robot"/, 'Bip est visible au depart');
tap(0, 2);
assert.equal(context.G.sb.P.start, null, 'La gomme retire le depart');
assert.doesNotMatch(board.innerHTML, /class="it robot"/, 'Le plateau accepte un depart absent');
assert.match(message.textContent, /Pose le petit robot/, 'La consigne aide a remettre Bip');
context.playSandbox();
assert.equal(opened, null, 'Un jardin sans depart reste dans l\'editeur');
assert.match(message.textContent, /Il manque le départ/, 'Le lancement explique le depart absent');

context.G.sb.tool = 'R';
tap(2, 1);
assert.equal(context.G.sb.P.start.join(','), '2,1', 'Bip peut etre repose');
context.G.sb.tool = 'b';
tap(2, 1);
assert.equal(context.G.sb.P.start, null, 'Un jouet peut remplacer le depart sans crash');
context.G.sb.tool = 'R';
tap(0, 2);
context.playSandbox();
assert.ok(opened && opened.options.sandbox, 'Le jardin peut de nouveau etre joue');
assert.equal(opened.level.map[1][2], 'b', 'Le jouet est conserve');
assert.equal(opened.level.map[2][0], 'R', 'Le nouveau depart est conserve');
console.log('SANDBOX OK : effacer, remplacer, reposer Bip et jouer.');
