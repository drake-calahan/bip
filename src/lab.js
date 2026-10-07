/* Bip v3: small, exact models for experimenting before naming the rule.
   Balance: torque = mass * distance. Mirrors: angle in = angle out on a grid.
   Meshing gears: tooth counts * turns agree, and directions alternate.
   Cycles: a friend acts when tick % period equals its phase. */
const LAB_FAMILIES = [
  { id: 'balance', name: 'Les équilibres', subtitle: 'Le poids et la distance', who: 'papi', accent: '#3f8b78', icon: 'scale' },
  { id: 'light', name: 'Les chemins de lumière', subtitle: 'Des miroirs et des surprises', who: 'noctule', accent: '#d69b25', icon: 'sun' },
  { id: 'gears', name: 'Les roues complices', subtitle: 'Tourner, ralentir, transmettre', who: 'papi', accent: '#cf745f', icon: 'cog' },
  { id: 'rhythm', name: 'Le rendez-vous', subtitle: 'Des rythmes qui se rencontrent', who: 'zoe', accent: '#667bb7', icon: 'music' }
];

function labOptions(values, label) {
  return values.map(value => ({ value, label: label(value) }));
}

const LAB_LEVELS = [
  {
    id: 'balance-1', family: 'balance', title: 'Les deux paniers', difficulty: 1,
    text: 'Le gros panier penche ! Trouve la place du petit panier pour équilibrer la planche.',
    discovery: 'Un petit poids, plus loin du centre, peut équilibrer un gros poids.',
    controls: [{ key: 'small', label: 'Petit panier', options: labOptions([1, 2, 3], n => 'Case ' + n + ' à droite') }],
    initial: { small: 1 }, solution: { small: 2 }, solutionCount: 1,
    scene: { positions: [-4, -3, -2, -1, 1, 2, 3, 4], weights: [{ id: 'big', mass: 2, position: -1 }, { id: 'small', mass: 1, control: 'small' }] },
    goal: { balance: true }
  },
  {
    id: 'balance-2', family: 'balance', title: 'Près ou loin ?', difficulty: 2,
    text: 'Le petit panier est tout au bout. Où placer le gros panier pour tenir la planche droite ?',
    discovery: 'Deux fois plus lourd et deux fois plus près : les deux côtés tirent autant.',
    controls: [{ key: 'big', label: 'Gros panier', options: labOptions([1, 2, 3], n => 'Case ' + n + ' à droite') }],
    initial: { big: 3 }, solution: { big: 2 }, solutionCount: 1,
    scene: { positions: [-4, -3, -2, -1, 1, 2, 3, 4], weights: [{ id: 'small', mass: 1, position: -4 }, { id: 'big', mass: 2, control: 'big' }] },
    goal: { balance: true }
  },
  {
    id: 'balance-3', family: 'balance', title: 'Deux amis sur la planche', difficulty: 3,
    text: 'Deux petits paniers à gauche, un gros à droite. Trouve leur rendez-vous en équilibre.',
    discovery: 'Les poids du même côté s\'additionnent, avec leur distance au centre.',
    controls: [
      { key: 'left', label: 'Petit panier mobile', options: labOptions([-2, -3, -4], n => 'Case ' + Math.abs(n) + ' à gauche') },
      { key: 'right', label: 'Gros panier mobile', options: labOptions([1, 2, 3], n => 'Case ' + n + ' à droite') }
    ],
    initial: { left: -2, right: 1 }, solution: { left: -3, right: 2 }, solutionCount: 1,
    scene: { positions: [-4, -3, -2, -1, 1, 2, 3, 4], weights: [{ id: 'fixed', mass: 1, position: -1 }, { id: 'left', mass: 1, control: 'left' }, { id: 'right', mass: 2, control: 'right' }] },
    goal: { balance: true }
  },
  {
    id: 'light-1', family: 'light', title: 'Un rayon qui tourne', difficulty: 1,
    text: 'La lumière veut rejoindre la luciole. Tourne le miroir pour lui ouvrir le chemin.',
    discovery: 'Le miroir change le chemin de la lumière.',
    controls: [{ key: 'mirror', label: 'Miroir', options: [{ value: '/', label: 'Miroir /' }, { value: '\\', label: 'Miroir \\' }] }],
    initial: { mirror: '\\' }, solution: { mirror: '/' }, solutionCount: 1,
    scene: { width: 5, height: 5, source: { x: 0, y: 2, dir: 'r' }, mirrors: [{ x: 2, y: 2, control: 'mirror' }], splitters: [], targets: [{ id: 'firefly', x: 2, y: 0 }], walls: [] },
    goal: { targets: ['firefly'] }
  },
  {
    id: 'light-2', family: 'light', title: 'Le détour lumineux', difficulty: 2,
    text: 'La luciole attend après deux virages. Fais voyager le rayon jusqu\'à elle.',
    discovery: 'Deux petits virages peuvent faire un grand détour.',
    controls: [
      { key: 'first', label: 'Premier miroir', options: [{ value: '/', label: 'Miroir /' }, { value: '\\', label: 'Miroir \\' }] },
      { key: 'second', label: 'Deuxième miroir', options: [{ value: '/', label: 'Miroir /' }, { value: '\\', label: 'Miroir \\' }] }
    ],
    initial: { first: '\\', second: '/' }, solution: { first: '/', second: '/' }, solutionCount: 1,
    scene: { width: 6, height: 5, source: { x: 0, y: 3, dir: 'r' }, mirrors: [{ x: 2, y: 3, control: 'first' }, { x: 2, y: 1, control: 'second' }], splitters: [], targets: [{ id: 'firefly', x: 5, y: 1 }], walls: [] },
    goal: { targets: ['firefly'] }
  },
  {
    id: 'light-3', family: 'light', title: 'Un rayon, deux invitations', difficulty: 3,
    text: 'Le cristal partage la lumière. Guide les deux rayons vers les deux lucioles.',
    discovery: 'Un chemin peut se partager en deux chemins : chaque miroir compte.',
    controls: [
      { key: 'top', label: 'Miroir du haut', options: [{ value: '/', label: 'Miroir /' }, { value: '\\', label: 'Miroir \\' }] },
      { key: 'bottom', label: 'Miroir du bas', options: [{ value: '/', label: 'Miroir /' }, { value: '\\', label: 'Miroir \\' }] }
    ],
    initial: { top: '\\', bottom: '\\' }, solution: { top: '/', bottom: '\\' }, solutionCount: 1,
    scene: { width: 6, height: 5, source: { x: 0, y: 2, dir: 'r' }, mirrors: [{ x: 2, y: 0, control: 'top' }, { x: 2, y: 4, control: 'bottom' }], splitters: [{ x: 2, y: 2 }], targets: [{ id: 'top', x: 5, y: 0 }, { id: 'bottom', x: 5, y: 4 }], walls: [] },
    goal: { targets: ['top', 'bottom'] }
  },
  {
    id: 'gears-1', family: 'gears', title: 'Les roues se repondent', difficulty: 1,
    text: 'Bip fait un tour. Choisis la roue qui fait aussi un tour, dans l\'autre sens.',
    discovery: 'Deux roues qui se touchent tournent en sens contraire.',
    controls: [{ key: 'output', label: 'Roue de Zoé', options: labOptions([6, 12, 24], n => n + ' dents') }],
    initial: { output: 24 }, solution: { output: 12 }, solutionCount: 1,
    scene: { input: { id: 'bip', teeth: 12, turns: 1, direction: 1 }, gears: [{ id: 'zoe', control: 'output' }] },
    goal: { turns: { numerator: 1, denominator: 1 }, direction: -1 }
  },
  {
    id: 'gears-2', family: 'gears', title: 'La petite roue pressée', difficulty: 2,
    text: 'Bip fait un tour, Zoé en veut deux. Quelle roue lui donner ?',
    discovery: 'Une roue deux fois plus petite tourne deux fois plus vite.',
    controls: [{ key: 'output', label: 'Roue de Zoé', options: labOptions([6, 12, 24], n => n + ' dents') }],
    initial: { output: 12 }, solution: { output: 6 }, solutionCount: 1,
    scene: { input: { id: 'bip', teeth: 12, turns: 1, direction: 1 }, gears: [{ id: 'zoe', control: 'output' }] },
    goal: { turns: { numerator: 2, denominator: 1 }, direction: -1 }
  },
  {
    id: 'gears-3', family: 'gears', title: 'La roue messagère', difficulty: 3,
    text: 'Une roue fait le lien entre Bip et Zoé. Fais-leur faire un tour dans le même sens.',
    discovery: 'La roue du milieu change le sens, mais pas la vitesse finale. Essaie une autre taille !',
    controls: [
      { key: 'middle', label: 'Roue messagère', options: labOptions([6, 12, 24], n => n + ' dents') },
      { key: 'output', label: 'Roue de Zoé', options: labOptions([6, 12, 24], n => n + ' dents') }
    ],
    initial: { middle: 12, output: 24 }, solution: { middle: 6, output: 12 }, solutionCount: 3,
    scene: { input: { id: 'bip', teeth: 12, turns: 1, direction: 1 }, gears: [{ id: 'message', control: 'middle' }, { id: 'zoe', control: 'output' }] },
    goal: { turns: { numerator: 1, denominator: 1 }, direction: 1 }
  },
  {
    id: 'rhythm-1', family: 'rhythm', title: 'Main dans la main', difficulty: 1,
    text: 'Bip et Zoé font coucou tous les trois pas. Aide-les à le faire ensemble au pas 3.',
    discovery: 'Deux rythmes pareils se rencontrent quand ils partent ensemble.',
    controls: [{ key: 'zoe', label: 'Départ de Zoé', options: labOptions([0, 1, 2], n => 'Pas ' + n) }],
    initial: { zoe: 1 }, solution: { zoe: 0 }, solutionCount: 1,
    scene: { cycles: [{ id: 'bip', period: 3, phase: 0 }, { id: 'zoe', period: 3, control: 'zoe' }], horizon: 6 },
    goal: { targetTicks: [0, 3, 6], focusTick: 3 }
  },
  {
    id: 'rhythm-2', family: 'rhythm', title: 'Deux pas, trois pas', difficulty: 2,
    text: 'Bip salue tous les deux pas, Zoé tous les trois. Prépare leur coucou ensemble au pas 4.',
    discovery: 'Deux pas et trois pas se retrouvent tous les six pas.',
    controls: [{ key: 'zoe', label: 'Départ de Zoé', options: labOptions([0, 1, 2], n => 'Pas ' + n) }],
    initial: { zoe: 0 }, solution: { zoe: 1 }, solutionCount: 1,
    scene: { cycles: [{ id: 'bip', period: 2, phase: 0 }, { id: 'zoe', period: 3, control: 'zoe' }], horizon: 12 },
    goal: { targetTicks: [4, 10], focusTick: 4 }
  },
  {
    id: 'rhythm-3', family: 'rhythm', title: 'Le trio du pique-nique', difficulty: 3,
    text: 'Trois amis suivent trois rythmes. Fais-les se retrouver au pas 6 pour le pique-nique.',
    discovery: 'Deux, trois et quatre pas retrouvent le même rendez-vous tous les douze pas.',
    controls: [
      { key: 'zoe', label: 'Départ de Zoé', options: labOptions([0, 1, 2, 3], n => 'Pas ' + n) },
      { key: 'lulu', label: 'Départ de Lulu', options: labOptions([0, 1], n => 'Pas ' + n) }
    ],
    initial: { zoe: 0, lulu: 1 }, solution: { zoe: 2, lulu: 0 }, solutionCount: 1,
    scene: { cycles: [{ id: 'bip', period: 3, phase: 0 }, { id: 'zoe', period: 4, control: 'zoe' }, { id: 'lulu', period: 2, control: 'lulu' }], horizon: 18 },
    goal: { targetTicks: [6, 18], focusTick: 6 }
  }
];

function labGcd(a, b) {
  while (b) { const next = a % b; a = b; b = next; }
  return a;
}

function labFraction(numerator, denominator) {
  const divisor = labGcd(Math.abs(numerator), Math.abs(denominator));
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

function normalizeLabSetup(level, setup) {
  const normalized = {};
  for (const control of level.controls || []) {
    const value = setup && Object.prototype.hasOwnProperty.call(setup, control.key) ? setup[control.key] : level.initial[control.key];
    if (!control.options.some(option => option.value === value)) return null;
    normalized[control.key] = value;
  }
  return normalized;
}

function labBalance(level, setup) {
  const weights = level.scene.weights.map(weight => ({ id: weight.id, mass: weight.mass, position: weight.control ? setup[weight.control] : weight.position }));
  if (weights.some(weight => !Number.isSafeInteger(weight.mass) || weight.mass <= 0 || !Number.isSafeInteger(weight.position) || weight.position === 0)) throw new Error('Invalid balance model');
  const leftTorque = weights.reduce((sum, weight) => sum + (weight.position < 0 ? weight.mass * -weight.position : 0), 0);
  const rightTorque = weights.reduce((sum, weight) => sum + (weight.position > 0 ? weight.mass * weight.position : 0), 0);
  const outcome = leftTorque === rightTorque ? 'balanced' : leftTorque > rightTorque ? 'left' : 'right';
  const success = outcome === 'balanced';
  return {
    success,
    feedback: success ? 'La planche est en équilibre !' : 'La planche penche à ' + (outcome === 'left' ? 'gauche.' : 'droite.'),
    observations: [success ? level.discovery : 'Observe le poids et sa distance au centre.'],
    steps: weights.map(weight => ({ kind: 'weight', id: weight.id, mass: weight.mass, position: weight.position, torque: weight.mass * Math.abs(weight.position) })),
    metrics: { outcome, weights, leftTorque, rightTorque, delta: rightTorque - leftTorque }
  };
}

const LAB_RAY_DIRECTIONS = { r: [1, 0], d: [0, 1], l: [-1, 0], u: [0, -1] };
const LAB_REFLECTIONS = { '/': { r: 'u', u: 'r', l: 'd', d: 'l' }, '\\': { r: 'd', d: 'r', l: 'u', u: 'l' } };
const LAB_RAY_LEFT = { r: 'u', u: 'l', l: 'd', d: 'r' };
const LAB_RAY_RIGHT = { r: 'd', d: 'l', l: 'u', u: 'r' };

function labLight(level, setup) {
  const scene = level.scene;
  if (!Number.isSafeInteger(scene.width) || !Number.isSafeInteger(scene.height) || scene.width < 1 || scene.height < 1 || scene.width > 8 || scene.height > 6 || !LAB_RAY_DIRECTIONS[scene.source.dir]) throw new Error('Invalid light model');
  const cellKey = cell => cell.x + ',' + cell.y;
  const occupied = new Set();
  for (const cell of [scene.source, ...(scene.mirrors || []), ...(scene.splitters || []), ...(scene.targets || []), ...(scene.walls || [])]) {
    if (!Number.isSafeInteger(cell.x) || !Number.isSafeInteger(cell.y) || cell.x < 0 || cell.y < 0 || cell.x >= scene.width || cell.y >= scene.height || occupied.has(cellKey(cell))) throw new Error('Invalid light cell');
    occupied.add(cellKey(cell));
  }
  const mirrors = new Map((scene.mirrors || []).map(mirror => [cellKey(mirror), mirror.control ? setup[mirror.control] : mirror.orientation]));
  if ([...mirrors.values()].some(value => !LAB_REFLECTIONS[value])) throw new Error('Invalid mirror');
  const splitters = new Set((scene.splitters || []).map(cellKey));
  const walls = new Set((scene.walls || []).map(cellKey));
  const targets = new Map((scene.targets || []).map(target => [cellKey(target), target.id]));
  const queue = [{ x: scene.source.x, y: scene.source.y, dir: scene.source.dir, branch: 0 }];
  const visited = new Set(), hits = new Set(), trace = [], steps = [], edges = new Map();
  let nextBranch = 1, merges = 0;
  // Identical directed rays have identical futures. Merging them bounds the
  // search to four states per cell even when a crystal feeds another crystal.
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const ray = queue[cursor];
    const state = ray.x + ',' + ray.y + ',' + ray.dir;
    if (visited.has(state)) { merges++; steps.push({ kind: 'merge', at: [ray.x, ray.y], branch: ray.branch }); continue; }
    visited.add(state);
    edges.set(state, []);
    const [dx, dy] = LAB_RAY_DIRECTIONS[ray.dir];
    const x = ray.x + dx, y = ray.y + dy;
    const outside = x < 0 || y < 0 || x >= scene.width || y >= scene.height;
    const segment = { from: [ray.x, ray.y], to: [x, y], dir: ray.dir, branch: ray.branch, outside };
    trace.push(segment);
    steps.push({ kind: 'ray', ...segment });
    if (outside) continue;
    const key = x + ',' + y;
    if (walls.has(key)) { steps.push({ kind: 'blocked', at: [x, y], branch: ray.branch }); continue; }
    if (targets.has(key)) { hits.add(targets.get(key)); steps.push({ kind: 'light', id: targets.get(key), at: [x, y], branch: ray.branch }); continue; }
    if (splitters.has(key)) {
      steps.push({ kind: 'split', at: [x, y], branch: ray.branch });
      const children = [{ x, y, dir: LAB_RAY_LEFT[ray.dir], branch: nextBranch++ }, { x, y, dir: LAB_RAY_RIGHT[ray.dir], branch: nextBranch++ }];
      edges.set(state, children.map(child => child.x + ',' + child.y + ',' + child.dir));
      queue.push(...children);
    } else {
      const dir = mirrors.has(key) ? LAB_REFLECTIONS[mirrors.get(key)][ray.dir] : ray.dir;
      if (mirrors.has(key)) steps.push({ kind: 'reflect', at: [x, y], fromDir: ray.dir, dir, branch: ray.branch });
      edges.set(state, [x + ',' + y + ',' + dir]);
      queue.push({ x, y, dir, branch: ray.branch });
    }
  }
  const hitTargets = (scene.targets || []).map(target => target.id).filter(id => hits.has(id));
  const wanted = level.goal.targets || (scene.targets || []).map(target => target.id);
  const success = wanted.every(id => hits.has(id));
  const outcome = success ? 'all' : hitTargets.length ? 'some' : 'none';
  const complete = new Set(), visiting = new Set();
  let loops = 0;
  const findCycles = state => {
    if (visiting.has(state)) { loops++; return; }
    if (complete.has(state)) return;
    visiting.add(state);
    for (const next of edges.get(state) || []) findCycles(next);
    visiting.delete(state);
    complete.add(state);
  };
  for (const state of edges.keys()) findCycles(state);
  return {
    success,
    feedback: success ? 'Toutes les lucioles brillent !' : hitTargets.length ? 'Une partie des lucioles brillent déjà.' : 'Le rayon cherche encore les lucioles.',
    observations: [success ? level.discovery : 'Suis le rayon jusqu\'au premier virage.'],
    steps,
    metrics: { outcome, trace, segments: trace, hitTargets, loops, merges, mirrors: (scene.mirrors || []).map(mirror => ({ ...mirror, orientation: mirrors.get(cellKey(mirror)) })) }
  };
}

function labGears(level, setup) {
  const input = level.scene.input;
  if (!Number.isSafeInteger(input.teeth) || input.teeth <= 0 || !Number.isSafeInteger(input.turns) || input.turns < 1 || ![1, -1].includes(input.direction)) throw new Error('Invalid input gear');
  const gears = [{ id: input.id, teeth: input.teeth, turns: input.turns, signedTurns: input.turns * input.direction, direction: input.direction, fraction: { numerator: input.turns, denominator: 1 } }];
  for (const gear of level.scene.gears) {
    const teeth = gear.control ? setup[gear.control] : gear.teeth;
    if (!Number.isSafeInteger(teeth) || teeth <= 0) throw new Error('Invalid gear teeth');
    const previous = gears[gears.length - 1];
    const fraction = labFraction(previous.fraction.numerator * previous.teeth, previous.fraction.denominator * teeth);
    const turns = fraction.numerator / fraction.denominator;
    gears.push({ id: gear.id, teeth, turns, signedTurns: turns * -previous.direction, direction: -previous.direction, fraction });
  }
  const output = gears[gears.length - 1];
  const goal = level.goal.turns;
  if (!Number.isSafeInteger(goal.numerator) || goal.numerator < 0 || !Number.isSafeInteger(goal.denominator) || goal.denominator < 1 || ![1, -1].includes(level.goal.direction)) throw new Error('Invalid gear goal');
  const success = output.fraction.numerator * goal.denominator === goal.numerator * output.fraction.denominator && output.direction === level.goal.direction;
  const outcome = output.fraction.numerator === input.turns * output.fraction.denominator ? 'same' : output.fraction.numerator > input.turns * output.fraction.denominator ? 'fast' : 'slow';
  return {
    success,
    feedback: success ? 'Les roues ont trouvé leur rythme !' : outcome === 'fast' ? 'La dernière roue va plus vite que Bip.' : outcome === 'slow' ? 'La dernière roue va plus lentement que Bip.' : 'La dernière roue va aussi vite que Bip.',
    observations: [success ? level.discovery : 'Compte ses tours, puis regarde dans quel sens elle tourne.'],
    steps: gears.map(gear => ({ kind: 'gear', ...gear })),
    metrics: { outcome, gears, outputTurns: output.turns, signedOutputTurns: output.signedTurns, direction: output.direction, outputFraction: output.fraction }
  };
}

function labRhythm(level, setup) {
  const cycles = level.scene.cycles.map(cycle => ({ id: cycle.id, period: cycle.period, phase: cycle.control ? setup[cycle.control] : cycle.phase }));
  if (!cycles.length || !Number.isSafeInteger(level.scene.horizon) || level.scene.horizon < 0 || level.scene.horizon > 256 || cycles.some(cycle => !Number.isSafeInteger(cycle.period) || cycle.period <= 0 || !Number.isSafeInteger(cycle.phase) || cycle.phase < 0 || cycle.phase >= cycle.period)) throw new Error('Invalid rhythm model');
  const timeline = [];
  for (let tick = 0; tick <= level.scene.horizon; tick++) {
    const active = cycles.filter(cycle => tick % cycle.period === cycle.phase).map(cycle => cycle.id);
    timeline.push({ tick, active, together: active.length === cycles.length });
  }
  const togetherTicks = timeline.filter(frame => frame.together).map(frame => frame.tick);
  const targetTicks = level.goal.targetTicks;
  const success = togetherTicks.length === targetTicks.length && togetherTicks.every((tick, index) => tick === targetTicks[index]);
  const focusTick = level.goal.focusTick == null ? targetTicks[0] : level.goal.focusTick;
  const outcome = togetherTicks.includes(focusTick) ? 'together' : 'apart';
  const repeatEvery = cycles.reduce((repeat, cycle) => repeat * cycle.period / labGcd(repeat, cycle.period), 1);
  return {
    success,
    feedback: success ? 'Tout le monde se retrouve au bon moment !' : 'Les amis cherchent encore leur rendez-vous.',
    observations: [success ? level.discovery : 'Regarde les pas ou chaque ami fait coucou.'],
    steps: timeline.map(frame => ({ kind: 'tick', ...frame })),
    metrics: { outcome, cycles, timeline, togetherTicks, targetTicks: targetTicks.slice(), focusTick, repeatEvery, anyTogether: togetherTicks.length > 0 }
  };
}

function evaluateLab(level, setup) {
  if (!level || !['balance', 'light', 'gears', 'rhythm'].includes(level.family)) throw new Error('Unknown lab family');
  const normalized = normalizeLabSetup(level, setup);
  if (!normalized) return { result: 'invalid', success: false, feedback: 'Choisis une des propositions de l\'atelier.', observations: [], steps: [], metrics: {}, setup: null };
  const model = { balance: labBalance, light: labLight, gears: labGears, rhythm: labRhythm }[level.family];
  const evaluated = model(level, normalized);
  return { ...evaluated, result: evaluated.success ? 'win' : 'try', setup: normalized };
}

function enumerateLabSetups(level) {
  let setups = [{}];
  for (const control of level.controls || []) {
    const next = [];
    for (const setup of setups) for (const option of control.options) next.push({ ...setup, [control.key]: option.value });
    setups = next;
  }
  return setups;
}

function solveLab(level) {
  return enumerateLabSetups(level).filter(setup => evaluateLab(level, setup).success);
}

if (typeof module !== 'undefined') module.exports = { LAB_FAMILIES, LAB_LEVELS, evaluateLab, normalizeLabSetup, enumerateLabSetups, solveLab };
