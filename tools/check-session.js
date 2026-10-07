/* Verifie qu'une animation interrompue ne modifie pas le niveau ouvert ensuite. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const events = { reset: 0, finish: 0, win: 0, message: 0, created: 0, position: 0 };
  const elements = new Map();
  const element = () => ({
    hidden: false,
    style: { setProperty() { events.position++; } },
    classList: { add() {}, remove() {}, toggle() {} },
    dataset: {},
    append() {},
    focus() {},
    setAttribute() {}
  });
  const timers = [];
  const context = vm.createContext({
    pending,
    events,
    countBlocks: blocks => blocks.length,
    DIRS: { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] },
    T: 1,
    RM: true,
    I: { play: '', stop: '' },
    $: selector => { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); },
    $$: () => [],
    SFX: new Proxy({}, { get: () => () => {} }),
    document: { createElement() { events.created++; return element(); } },
    save: { stars: {}, daily: {} },
    persist() {},
    checkStickers() {},
    buzz() {},
    stopVoice() {},
    setTimeout: callback => { timers.push(callback); },
    requestAnimationFrame() {},
    simulate: () => ({ result: 'win', steps: [{ kind: 'move', from: [0, 0], to: [1, 0], face: 'r' }] }),
    rollBall: () => ({ result: 'win', steps: [{ to: [1, 0] }, { to: [2, 0] }] })
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/app-game.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/app-ball.js'), 'utf8'), context);
  vm.runInContext(`
    globalThis.state = G;
    G.lv = { nv: 1, par: 1, id: 1 };
    G.prog = [{ t: 'r' }];
    G.tiles = { '1,0': 'r' };
    G.abort = false;
    clearMarks = clearNow = hideHint = mark = () => {};
    resetBoard = () => { events.reset++; };
    setRunning = renderTiles = () => {};
    say = () => { events.message++; };
    finish = finishStep = ballFinish = () => { events.finish++; };
    confetti = () => {};
    sleep = () => pending;
  `, context);
  return { context, events, release, timers };
}

async function checkStep(cancel) {
  const h = harness();
  vm.runInContext('G.step = { sim: simulate(), i: 0 }; doStep = () => pending;', h.context);
  const execution = h.context.stepOnce();
  if (cancel) vm.runInContext('G.session++; G.step = null; G.busy = true;', h.context);
  h.release();
  await execution;
  assert.equal(h.events.finish, cancel ? 0 : 1, 'Un ancien pas ne termine pas le nouveau niveau');
  assert.equal(h.context.state.busy, cancel, 'Un ancien pas ne debloque pas la nouvelle execution');
}

async function checkRun() {
  const h = harness();
  vm.runInContext('doStep = () => pending; win = () => { events.win++; };', h.context);
  const execution = h.context.runAll();
  const resetBefore = h.events.reset;
  vm.runInContext('G.session++; G.abort = false; G.busy = true;', h.context);
  h.release();
  await execution;
  assert.equal(h.events.win, 0, 'Un ancien programme ne gagne pas le nouveau niveau');
  assert.equal(h.events.reset, resetBefore, 'Un ancien programme ne remet pas le nouveau plateau a zero');
  assert.equal(h.context.state.busy, true, 'La nouvelle execution reste active');
}

async function checkBall() {
  const h = harness();
  const execution = h.context.runBall();
  const positionsBefore = h.events.position;
  vm.runInContext('G.session++; G.abort = false; G.busy = true;', h.context);
  h.release();
  await execution;
  assert.equal(h.events.finish, 0, 'Un ancien ballon ne termine pas le nouveau niveau');
  assert.equal(h.events.position, positionsBefore, 'Un ancien ballon ne continue pas son trajet');
  assert.equal(h.context.state.busy, true);
}

async function checkAnimation() {
  const h = harness();
  const execution = h.context.doStep({ kind: 'move', from: [0, 0], to: [1, 0], face: 'r', paint: [1, 0] });
  vm.runInContext('G.session++; G.abort = false;', h.context);
  h.release();
  await execution;
  assert.equal(h.events.created, 0, 'Un ancien pas ne depose pas son pollen sur le nouveau plateau');
}

function checkWinTimer() {
  const h = harness();
  vm.runInContext('showWin = () => { events.win++; };', h.context);
  h.context.win();
  assert.equal(h.timers.length, 1);
  vm.runInContext('G.session++;', h.context);
  h.timers[0]();
  assert.equal(h.events.win, 0, 'La victoire differee ne reapparait pas apres navigation');
}

async function checkWinRerun() {
  const h = harness();
  vm.runInContext('showWin = () => { events.win++; };', h.context);
  h.context.win();
  vm.runInContext('doStep = () => pending; win = () => { events.win++; };', h.context);
  const execution = h.context.runAll();
  h.timers[0]();
  assert.equal(h.events.win, 0, 'Relancer le meme niveau annule sa victoire differee');
  h.release();
  await execution;
  assert.equal(h.events.win, 1, 'La nouvelle execution peut toujours gagner');
}

(async () => {
  await checkStep(false);
  await checkStep(true);
  await checkRun();
  await checkBall();
  await checkAnimation();
  checkWinTimer();
  await checkWinRerun();
  console.log('SESSION OK : pas, programme, ballon, pollen et victoire apres navigation.');
})().catch(error => { console.error(error); process.exitCode = 1; });
