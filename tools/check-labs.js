/* Independent checks of the bounded physical models and every authored setup. */
const assert = require('node:assert/strict');
const { LAB_FAMILIES, LAB_LEVELS, evaluateLab, normalizeLabSetup, enumerateLabSetups, solveLab } = require('../src/lab.js');
let checks = 0;
const verify = (name, fn) => { fn(); checks++; console.log('OK ' + name); };
const clone = value => JSON.parse(JSON.stringify(value));
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

// These oracles use different formulations: signed moment, vector reflection,
// direct endpoint tooth ratio, and intersection of generated event lists.
function independentWin(level, setup) {
  const scene = level.scene;
  if (level.family === 'balance') {
    return scene.weights.reduce((sum, weight) => sum + weight.mass * (weight.control ? setup[weight.control] : weight.position), 0) === 0;
  }
  if (level.family === 'gears') {
    const final = scene.gears[scene.gears.length - 1];
    const teeth = final.control ? setup[final.control] : final.teeth;
    return scene.input.turns * scene.input.teeth * level.goal.turns.denominator === teeth * level.goal.turns.numerator && scene.input.direction * Math.pow(-1, scene.gears.length) === level.goal.direction;
  }
  if (level.family === 'rhythm') {
    const eventLists = scene.cycles.map(cycle => {
      const events = [];
      for (let tick = cycle.control ? setup[cycle.control] : cycle.phase; tick <= scene.horizon; tick += cycle.period) events.push(tick);
      return events;
    });
    const together = eventLists[0].filter(tick => eventLists.every(events => events.includes(tick)));
    return JSON.stringify(together) === JSON.stringify(level.goal.targetTicks);
  }
  if (level.family === 'light') {
    const vectors = { r: [1, 0], d: [0, 1], l: [-1, 0], u: [0, -1] };
    const queue = [[scene.source.x, scene.source.y, ...vectors[scene.source.dir]]];
    const seen = new Set(), hits = new Set();
    while (queue.length) {
      let [x, y, dx, dy] = queue.pop();
      const state = [x, y, dx, dy].join(':');
      if (seen.has(state)) continue;
      seen.add(state);
      x += dx; y += dy;
      if (x < 0 || y < 0 || x >= scene.width || y >= scene.height) continue;
      const at = cell => cell.x === x && cell.y === y;
      if ((scene.walls || []).some(at)) continue;
      const target = scene.targets.find(at);
      if (target) { hits.add(target.id); continue; }
      if ((scene.splitters || []).some(at)) { queue.push([x, y, -dy, dx], [x, y, dy, -dx]); continue; }
      const mirror = (scene.mirrors || []).find(at);
      if (mirror) {
        const sign = (mirror.control ? setup[mirror.control] : mirror.orientation) === '/' ? -1 : 1;
        [dx, dy] = [sign * dy, sign * dx];
      }
      queue.push([x, y, dx, dy]);
    }
    return level.goal.targets.every(id => hits.has(id));
  }
  throw new Error('Unknown oracle');
}

verify('12 serializable puzzles, 3 per family, all option labels supplied', () => {
  assert.equal(LAB_LEVELS.length, 12);
  assert.equal(new Set(LAB_LEVELS.map(level => level.id)).size, 12);
  for (const family of LAB_FAMILIES) assert.equal(LAB_LEVELS.filter(level => level.family === family.id).length, 3);
  assert.deepEqual(clone(LAB_LEVELS), LAB_LEVELS);
  for (const level of LAB_LEVELS) {
    assert.deepEqual(Object.keys(level.initial), level.controls.map(control => control.key));
    assert.deepEqual(Object.keys(level.solution), level.controls.map(control => control.key));
    for (const control of level.controls) {
      assert(control.options.length > 1);
      assert.equal(new Set(control.options.map(option => option.value)).size, control.options.length);
      assert(control.options.every(option => typeof option.label === 'string' && option.label.length));
    }
  }
});

let totalSetups = 0;
for (const authored of LAB_LEVELS) {
  verify(authored.id + ': reference, exhaustive independent solvability, immutable replay', () => {
    const before = clone(authored);
    const level = freeze(clone(authored));
    assert.equal(evaluateLab(level, freeze(clone(level.solution))).result, 'win');
    assert.equal(evaluateLab(level, level.initial).result, 'try');
    assert.deepEqual(evaluateLab(level), evaluateLab(level, level.initial));
    const setups = enumerateLabSetups(level);
    const expectedSetups = level.controls.reduce((count, control) => count * control.options.length, 1);
    assert.equal(setups.length, expectedSetups);
    totalSetups += setups.length;
    const referenceWins = [];
    for (const setup of setups) {
      const immutableSetup = freeze(clone(setup));
      const result = evaluateLab(level, immutableSetup);
      assert.equal(result.success, independentWin(level, setup), JSON.stringify(setup));
      assert.equal(result.result, result.success ? 'win' : 'try');
      assert.deepEqual(result, evaluateLab(level, immutableSetup));
      assert.deepEqual(clone(result), result);
      if (result.success) referenceWins.push(setup);
      if (level.family === 'balance') assert.equal(result.metrics.rightTorque - result.metrics.leftTorque, result.metrics.delta);
      if (level.family === 'gears') {
        const wheels = result.metrics.gears;
        for (let i = 1; i < wheels.length; i++) {
          assert.equal(wheels[i].direction, -wheels[i - 1].direction);
          assert.equal(wheels[i].turns * wheels[i].teeth, wheels[0].turns * wheels[0].teeth);
        }
      }
      if (level.family === 'light') {
        assert(result.metrics.trace.length <= 4 * level.scene.width * level.scene.height);
        for (const segment of result.metrics.trace) assert.equal(Math.abs(segment.to[0] - segment.from[0]) + Math.abs(segment.to[1] - segment.from[1]), 1);
      }
      if (level.family === 'rhythm') assert.equal(result.metrics.timeline.length, level.scene.horizon + 1);
    }
    assert.equal(referenceWins.length, level.solutionCount);
    assert.deepEqual(solveLab(level), referenceWins);
    assert.deepEqual(authored, before);
  });
}

verify('Setup normalization rejects invalid types and values; partial setup uses initial defaults', () => {
  const level = LAB_LEVELS.find(level => level.id === 'balance-3');
  assert.deepEqual(normalizeLabSetup(level, { right: 2 }), { left: -2, right: 2 });
  assert.equal(evaluateLab(level, { left: '-3', right: 2 }).result, 'invalid');
  assert.equal(evaluateLab(level, { left: -3, right: 0 }).result, 'invalid');
  assert.equal(evaluateLab(level, { left: NaN, right: 2 }).result, 'invalid');
  assert.equal(evaluateLab(level, { left: -3, right: 2, ignored: true }).result, 'win');
  assert.throws(() => evaluateLab({ family: 'unknown' }, {}), /Unknown lab family/);
});

verify('Equal mass is not enough: distance controls the lever; zero mass and pivot positions rejected', () => {
  const base = clone(LAB_LEVELS[0]);
  base.controls = []; base.initial = {};
  base.scene.weights = [{ id: 'left', mass: 3, position: -2 }, { id: 'right', mass: 2, position: 3 }];
  assert.equal(evaluateLab(base).metrics.outcome, 'balanced');
  base.scene.weights[1].position = 2;
  assert.equal(evaluateLab(base).metrics.outcome, 'left');
  base.scene.weights[1].position = 4;
  assert.equal(evaluateLab(base).metrics.outcome, 'right');
  base.scene.weights[1].mass = 0;
  assert.throws(() => evaluateLab(base), /Invalid balance model/);
  base.scene.weights[1].mass = 2; base.scene.weights[1].position = 0;
  assert.throws(() => evaluateLab(base), /Invalid balance model/);
});

verify('All 8 mirror incidence directions preserve perpendicular reflection', () => {
  const vectors = { r: [1, 0], d: [0, 1], l: [-1, 0], u: [0, -1] };
  for (const orientation of ['/', '\\']) for (const dir of Object.keys(vectors)) {
    const [dx, dy] = vectors[dir];
    const sign = orientation === '/' ? -1 : 1;
    const level = { family: 'light', controls: [], initial: {}, discovery: '', scene: {
      width: 5, height: 5, source: { x: 2 - dx, y: 2 - dy, dir },
      mirrors: [{ x: 2, y: 2, orientation }], targets: [{ id: 'lamp', x: 2 + sign * dy, y: 2 + sign * dx }]
    }, goal: { targets: ['lamp'] } };
    assert.equal(evaluateLab(level).result, 'win', orientation + ' ' + dir);
  }
});

verify('Light is stopped by walls, absorbed by targets, and bounded in a mirror loop', () => {
  const level = { family: 'light', controls: [], initial: {}, discovery: '', scene: {
    width: 5, height: 3, source: { x: 0, y: 1, dir: 'r' }, mirrors: [],
    targets: [{ id: 'near', x: 2, y: 1 }, { id: 'far', x: 4, y: 1 }], walls: [{ x: 1, y: 1 }]
  }, goal: { targets: ['near', 'far'] } };
  assert.equal(evaluateLab(level).metrics.outcome, 'none');
  level.scene.walls = [];
  assert.deepEqual(evaluateLab(level).metrics.hitTargets, ['near']);
  assert.equal(evaluateLab(level).metrics.outcome, 'some');
  level.scene = { width: 5, height: 4, source: { x: 2, y: 2, dir: 'r' }, mirrors: [
    { x: 3, y: 2, orientation: '/' }, { x: 3, y: 0, orientation: '\\' },
    { x: 1, y: 0, orientation: '/' }, { x: 1, y: 2, orientation: '\\' }
  ], targets: [{ id: 'outside', x: 4, y: 3 }] };
  level.goal.targets = ['outside'];
  const loop = evaluateLab(level);
  assert.equal(loop.result, 'try');
  assert.equal(loop.metrics.loops, 1);
  assert.equal(loop.metrics.merges, 1);
  assert(loop.metrics.trace.length < 20);
  level.scene.mirrors[0].x = -1;
  assert.throws(() => evaluateLab(level), /Invalid light cell/);
});

verify('A splitter lights two independent branches; reversing one mirror loses one lamp', () => {
  const level = LAB_LEVELS.find(level => level.id === 'light-3');
  const result = evaluateLab(level, level.solution);
  assert.deepEqual(result.metrics.hitTargets, ['top', 'bottom']);
  assert.equal(result.steps.filter(step => step.kind === 'split').length, 1);
  assert.equal(evaluateLab(level, { top: '\\', bottom: '\\' }).metrics.hitTargets.length, 1);
});

verify('Fractional gear turns are exact; an idler alters direction but not final speed', () => {
  const base = clone(LAB_LEVELS.find(level => level.id === 'gears-3'));
  base.controls = []; base.initial = {};
  base.scene.input.teeth = 18;
  base.scene.gears = [{ id: 'middle', teeth: 6 }, { id: 'final', teeth: 24 }];
  base.goal.turns = { numerator: 3, denominator: 4 };
  const result = evaluateLab(base);
  assert.equal(result.result, 'win');
  assert.deepEqual(result.metrics.outputFraction, { numerator: 3, denominator: 4 });
  assert.equal(result.metrics.outputTurns, 0.75);
  assert.equal(result.metrics.direction, 1);
  base.scene.gears[0].teeth = 30;
  assert.deepEqual(evaluateLab(base).metrics.outputFraction, result.metrics.outputFraction);
  base.scene.gears[0].teeth = 0;
  assert.throws(() => evaluateLab(base), /Invalid gear teeth/);
});

verify('Rhythm focus prediction differs from eventual meeting; periodicity and inclusive boundaries', () => {
  const level = LAB_LEVELS.find(level => level.id === 'rhythm-2');
  const early = evaluateLab(level, level.initial);
  assert.equal(early.metrics.outcome, 'apart');
  assert.equal(early.metrics.anyTogether, true);
  assert.deepEqual(early.metrics.togetherTicks, [0, 6, 12]);
  assert.equal(early.metrics.repeatEvery, 6);
  const trio = LAB_LEVELS.find(level => level.id === 'rhythm-3');
  const result = evaluateLab(trio, trio.solution);
  assert.deepEqual(result.metrics.togetherTicks, [6, 18]);
  assert.equal(result.metrics.repeatEvery, 12);
  const mismatch = clone(LAB_LEVELS.find(level => level.id === 'rhythm-1'));
  mismatch.controls = []; mismatch.initial = {}; mismatch.scene.horizon = 6;
  mismatch.scene.cycles = [{ id: 'a', period: 2, phase: 0 }, { id: 'b', period: 4, phase: 1 }];
  assert.deepEqual(evaluateLab(mismatch).metrics.togetherTicks, []);
  mismatch.scene.cycles[0].period = 0;
  assert.throws(() => evaluateLab(mismatch), /Invalid rhythm model/);
});

console.log('\n' + checks + ' checks; ' + LAB_LEVELS.length + ' puzzles; ' + totalSetups + ' complete setups checked independently. ALL OK');
