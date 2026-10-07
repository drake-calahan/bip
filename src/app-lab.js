/* ---------- V3: predict, experiment, compare, remember ---------- */
const LAB_COLORS = {
  balance: { accent: '#327C64', wash: '#E7F3EB', name: 'Les équilibres' },
  light: { accent: '#967016', wash: '#FCF4D9', name: 'La lumière' },
  gears: { accent: '#A75548', wash: '#F9ECE6', name: 'Les roues complices' },
  rhythm: { accent: '#526EA1', wash: '#EAF0FA', name: 'Le rendez-vous' }
};
const L = { level: null, setup: {}, prediction: null, last: null, previous: null, running: false, token: 0, free: false, selected: null, tick: -1 };
save.labs = Object.assign({ solved: {}, drafts: {}, inventions: [], attempts: {}, predictions: {} }, save.labs || {});
const labCopy = value => JSON.parse(JSON.stringify(value));
const labEscape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const labFamily = id => LAB_FAMILIES.find(f => f.id === id);
const labSolved = id => !!save.labs.solved[id];
const labColor = family => `--accent:${LAB_COLORS[family].accent};--wash:${LAB_COLORS[family].wash}`;
const LAB_PREDICTIONS = {
  balance: [{ value: 'left', label: 'À gauche', icon: () => `<span style="rotate:160deg">${I.arrow}</span>` }, { value: 'balanced', label: 'Tout droit', icon: () => I.until }, { value: 'right', label: 'À droite', icon: () => `<span style="rotate:20deg">${I.arrow}</span>` }],
  light: [{ value: 'none', label: 'Aucune', icon: () => I.bulb }, { value: 'some', label: 'Une partie', icon: () => I.firefly }, { value: 'all', label: 'Toutes', icon: () => I.star(true) }],
  gears: [{ value: 'slow', label: 'Moins vite', icon: () => I.step }, { value: 'same', label: 'Aussi vite', icon: () => I.replay }, { value: 'fast', label: 'Plus vite', icon: () => I.next }],
  rhythm: [{ value: 'apart', label: 'Chacun', icon: () => I.fork }, { value: 'together', label: 'Ensemble', icon: () => I.check }]
};

function homeTab(name) {
  ['Labs', 'Journey', 'Notebook'].forEach(key => {
    const selected = key === name;
    $('#tab' + key).classList.toggle('on', selected);
    $('#tab' + key).setAttribute('aria-selected', String(selected));
  });
  $('#labHub').hidden = name !== 'Labs';
  $('#journey').hidden = name !== 'Journey';
  $('#notebook').hidden = name !== 'Notebook';
  if (name === 'Notebook') renderNotebook();
}

function renderLabHome() {
  const count = LAB_LEVELS.filter(level => labSolved(level.id)).length;
  $('#labTotal').textContent = count + '/' + LAB_LEVELS.length;
  $('#labHub').innerHTML = `<div class="lab-hub-heading"><span class="avatar">${symUse('avatar-papi')}</span><div><h2>Les ateliers des possibles</h2><p>Grand-Papa a quelques surprises pour toi.</p></div></div>
    <div class="lab-families">${LAB_FAMILIES.map(family => {
      const levels = LAB_LEVELS.filter(level => level.family === family.id);
      const next = levels.find(level => !labSolved(level.id)) || levels[0];
      return `<article class="lab-family" style="${labColor(family.id)}">
        <button class="family-open" data-lab-open="${next.id}" aria-label="${labEscape(LAB_COLORS[family.id].name)}"><span class="family-art">${labDrawing(levels[levels.length - 1], levels[levels.length - 1].initial, null, true)}</span><h3>${LAB_COLORS[family.id].name}</h3><p>${labEscape(family.subtitle)}</p></button>
        <div class="family-bottom"><div class="family-levels">${levels.map((level, i) => `<button class="${labSolved(level.id) ? 'solved' : ''}" data-lab-open="${level.id}" aria-label="Expérience ${i + 1} : ${labEscape(level.title)}${labSolved(level.id) ? ', découverte' : ''}">${labSolved(level.id) ? I.check : i + 1}</button>`).join('')}</div><button class="family-invent" data-lab-free="${levels[levels.length - 1].id}">Inventer</button></div>
      </article>`;
    }).join('')}</div>
    ${save.labs.inventions.length ? `<div class="lab-home-inventions"><h3>Mes inventions</h3>${save.labs.inventions.map(recipe => `<button data-lab-recipe="${labEscape(recipe.family)}">${I.garden}<span>${LAB_COLORS[recipe.family].name}</span></button>`).join('')}</div>` : ''}`;
  $$('[data-lab-open]', $('#labHub')).forEach(button => button.onclick = () => openLab(button.dataset.labOpen));
  $$('[data-lab-free]', $('#labHub')).forEach(button => button.onclick = () => openLab(button.dataset.labFree, true));
  $$('[data-lab-recipe]', $('#labHub')).forEach(button => button.onclick = () => {
    const recipe = save.labs.inventions.find(item => item.family === button.dataset.labRecipe);
    openLab(recipe.level, true, recipe.setup);
  });
  renderNotebook();
}

function renderNotebook() {
  const solved = LAB_LEVELS.filter(level => labSolved(level.id)).length;
  $('#notebook').innerHTML = `<div class="note-heading"><span>${robotSVG()}</span><div><h2>Mes découvertes</h2><p>${solved ? solved + ' idées ont poussé dans ton jardin.' : 'Ton jardin attend ses premières idées.'}</p></div></div><div class="note-grid">${LAB_LEVELS.map(level => {
    const found = labSolved(level.id);
    return `<article class="discovery ${found ? '' : 'locked'}" style="${labColor(level.family)}"><div class="note-icon">${found ? I.garden : I.bulb}</div><h3>${labEscape(level.title)}</h3><p>${labEscape(found ? level.discovery : 'Une idée à découvrir dans ' + LAB_COLORS[level.family].name.toLowerCase() + '.')}</p><button data-note="${level.id}">${found ? I.replay : I.play}<span>${found ? 'Revoir' : 'Découvrir'}</span></button></article>`;
  }).join('')}</div>`;
  $$('[data-note]', $('#notebook')).forEach(button => button.onclick = () => openLab(button.dataset.note));
}

function openLab(id, free = false, setup = null) {
  const level = LAB_LEVELS.find(item => item.id === id);
  if (!level) return;
  L.token++; L.running = false; L.level = level; L.free = free;
  const draft = setup || (free ? null : save.labs.drafts[id]);
  L.setup = labCopy(normalizeLabSetup(level, draft) || level.initial);
  if (!free && setup) { save.labs.drafts[id] = labCopy(L.setup); persist(); }
  L.prediction = null; L.last = null; L.previous = null; L.selected = level.controls[0].key; L.tick = -1;
  stopVoice(); hideHand(); show('lab'); audio();
  $('#lab').style.cssText = labColor(level.family);
  $('#labFamily').textContent = LAB_COLORS[level.family].name;
  $('#labTitle').textContent = free ? 'Mon invention' : level.title;
  $('#labText').textContent = free ? 'Et si tu changeais une petite chose ? Grand-Papa est curieux de voir ton idée.' : level.text;
  $('#labGuide').innerHTML = symUse('avatar-' + labFamily(level.family).who);
  const siblings = LAB_LEVELS.filter(item => item.family === level.family);
  $('#labLevels').innerHTML = siblings.map((item, i) => `<button class="${item.id === id && !free ? 'on' : ''}" data-lab-switch="${item.id}" aria-label="Expérience ${i + 1} : ${labEscape(item.title)}">${labSolved(item.id) ? I.check : i + 1}</button>`).join('') + `<button class="${free ? 'on' : ''}" data-lab-invention="true" aria-label="Exploration libre" title="Exploration libre">${I.garden}</button>`;
  $$('[data-lab-switch]').forEach(button => button.onclick = () => openLab(button.dataset.labSwitch));
  $('[data-lab-invention]').onclick = () => openLab(siblings[siblings.length - 1].id, true);
  $('#labFollow').hidden = true;
  $('#labSaved').hidden = !free;
  $('#labSaveStatus').textContent = '';
  $('#labFeedback').textContent = '';
  renderLabControls(); renderLabPredictions(); renderLabScene(); renderLabCompare(); updateLabActions();
  speak($('#labText').textContent);
  $('#lab').scrollTop = 0;
}

function renderLabControls() {
  $('#labControls').innerHTML = L.level.controls.map(control => `<fieldset class="lab-control"><legend><i></i>${labEscape(control.label)}</legend><div class="lab-options">${control.options.map(option => {
    const content = L.level.family === 'light' ? `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${option.value === '/' ? 'M9 31L31 9' : 'M9 9L31 31'}" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>` : L.level.family === 'balance' ? Math.abs(option.value) : L.level.family === 'rhythm' ? option.value : option.value + '<small> dents</small>';
    return `<button data-control="${labEscape(control.key)}" data-option="${control.options.indexOf(option)}" aria-pressed="${L.setup[control.key] === option.value}" aria-label="${labEscape(control.label + ' : ' + option.label)}" title="${labEscape(option.label)}">${content}</button>`;
  }).join('')}</div></fieldset>`).join('');
  $$('[data-control]').forEach(button => button.onclick = () => {
    const control = L.level.controls.find(item => item.key === button.dataset.control);
    setLabControl(control.key, control.options[+button.dataset.option].value);
  });
}

function setLabControl(key, value) {
  const control = L.level.controls.find(item => item.key === key);
  if (!control || !control.options.some(item => item.value === value)) return;
  L.token++; L.running = false; L.setup[key] = value; L.selected = key; L.tick = -1; L.prediction = null;
  if (!L.free) { save.labs.drafts[L.level.id] = labCopy(L.setup); persist(); }
  $('#labFeedback').textContent = '';
  $('#labFollow').hidden = true;
  $('#labSaveStatus').textContent = '';
  renderLabControls(); renderLabPredictions(); renderLabScene(); updateLabActions(); SFX.tap();
}

function renderLabPredictions() {
  let choices = LAB_PREDICTIONS[L.level.family];
  if (L.level.family === 'light' && L.level.scene.targets.length === 1) choices = choices.filter(choice => choice.value !== 'some');
  $('#labPredictions').innerHTML = choices.map(choice => `<button class="prediction" data-predict="${choice.value}" aria-pressed="${L.prediction === choice.value}">${choice.icon()}<span>${choice.label}</span></button>`).join('');
  $$('[data-predict]').forEach(button => button.onclick = () => {
    if (L.running) return;
    L.prediction = L.prediction === button.dataset.predict ? null : button.dataset.predict;
    renderLabPredictions(); SFX.tap();
  });
  $('.lab-predict legend').textContent = L.level.family === 'rhythm' ? 'Au pas ' + L.level.goal.focusTick + ', je pense…' : L.level.family === 'gears' ? 'La dernière roue ira…' : 'Je pense que…';
}

function updateLabActions() {
  $('#btnLabRun').disabled = L.running;
  $('#btnLabRun').innerHTML = `${L.running ? I.lens : I.play}<span>${L.running ? 'On observe…' : 'Essayer'}</span>`;
  $('#btnLabReset').innerHTML = I.replay;
  $('#btnLabHint').innerHTML = I.bulb;
  $('#btnLabSave').innerHTML = `${I.garden}<span>Garder mon invention</span>`;
}

async function runLab() {
  if (L.running || !L.level) return;
  const token = ++L.token, level = L.level, setup = labCopy(L.setup), prediction = L.prediction;
  const result = evaluateLab(level, setup);
  if (result.result === 'invalid') return;
  L.running = true; L.tick = -1;
  $('#labFeedback').textContent = ''; $('#labFollow').hidden = true; updateLabActions();
  renderLabScene(result);
  $('#labScene').classList.add('lab-testing');
  if (level.family === 'rhythm' && !RM) {
    for (const frame of result.metrics.timeline) {
      if (token !== L.token) return;
      L.tick = frame.tick;
      $$('[data-tick]', $('#labScene')).forEach(element => element.classList.toggle('rhythm-now', +element.dataset.tick === frame.tick));
      const column = $(`.rhythm-tick[data-tick="${frame.tick}"]`, $('#labScene')), scroller = $('.rhythm-scroll', $('#labScene'));
      if (column.offsetLeft > scroller.scrollLeft + scroller.clientWidth - 40) scroller.scrollLeft = column.offsetLeft - scroller.clientWidth + 70;
      if (frame.together) SFX.collect(); else if (frame.active.length) SFX.step();
      await sleep(180);
    }
  } else {
    SFX.look(result.success);
    await sleep(RM ? 80 : level.family === 'gears' ? 1900 : 1100);
  }
  if (token !== L.token || $('#lab').hidden) return;
  L.running = false; L.previous = L.last; L.last = { setup, result }; L.tick = -1;
  const old = save.labs.solved[level.id];
  if (!L.free) {
    save.labs.attempts[level.id] = (save.labs.attempts[level.id] || 0) + 1;
    if (prediction) {
      const tally = save.labs.predictions[level.id] || { tried: 0, matched: 0 };
      tally.tried++; if (prediction === result.metrics.outcome) tally.matched++;
      save.labs.predictions[level.id] = tally;
    }
    if (result.success) save.labs.solved[level.id] = { setup, discovered: level.discovery };
    persist();
  }
  renderLabScene(result); updateLabActions(); renderLabCompare();
  const matched = prediction === result.metrics.outcome;
  const predictionCopy = prediction ? matched ? 'Tu avais prévu ce résultat.' : 'Une surprise ! Ton idée peut changer.' : '';
  if (L.free) {
    $('#labFeedback').innerHTML = `<b>Une nouvelle idée !</b>${labEscape(result.feedback)}${predictionCopy ? `<small>${predictionCopy}</small>` : ''}`;
  } else if (result.success) {
    $('#labFeedback').innerHTML = `<b>${old ? 'Tu as retrouvé l’équilibre !' : 'Une idée a poussé !'}</b>${labEscape(level.discovery)}${predictionCopy ? `<small>${predictionCopy}</small>` : ''}`;
    if (level.family !== 'balance' && old) $('#labFeedback b').textContent = 'Tu as retrouvé ton idée !';
    $('#labFollow').hidden = false;
    const next = LAB_LEVELS[LAB_LEVELS.indexOf(level) + 1];
    $('#btnLabNext').innerHTML = `<span>${next ? 'Expérience suivante' : 'Mes découvertes'}</span>${I.next}`;
    if (!old) { SFX.win(); buzz([20, 40, 20]); }
  } else {
    $('#labFeedback').innerHTML = `<b>On cherche encore…</b>${labEscape(result.feedback)}${predictionCopy ? `<small>${predictionCopy}</small>` : ''}`;
  }
  speak($('#labFeedback').textContent);
}

function labSummary(level, result) {
  const metrics = result.metrics;
  if (level.family === 'balance') return metrics.outcome === 'balanced' ? 'En équilibre' : 'Penche à ' + (metrics.outcome === 'left' ? 'gauche' : 'droite');
  if (level.family === 'light') return metrics.hitTargets.length + '/' + level.scene.targets.length + ' lucioles';
  if (level.family === 'gears') return labNumber(metrics.outputTurns) + ' tour' + (metrics.outputTurns > 1 ? 's' : '') + ' · ' + (metrics.direction === level.scene.input.direction ? 'même sens' : 'sens contraire');
  return metrics.togetherTicks.length ? 'Ensemble : ' + metrics.togetherTicks.join(', ') : 'Chacun son rythme';
}

function renderLabCompare() {
  const box = $('#labCompare');
  box.hidden = !(L.last && L.previous);
  if (box.hidden) return;
  const changed = L.level.controls.filter(control => L.last.setup[control.key] !== L.previous.setup[control.key]);
  const description = changed.length === 0 ? 'Même réglage, même résultat.' : changed.length === 1 ? 'Une seule chose a changé : ' + changed[0].label.toLowerCase() + '.' : 'Deux réglages ont changé.';
  box.innerHTML = `<h3>${labEscape(description)}</h3><div class="compare-pair"><div><small>Avant</small>${labEscape(labSummary(L.level, L.previous.result))}</div>${I.next}<div><small>Cette fois</small>${labEscape(labSummary(L.level, L.last.result))}</div></div>`;
}

function labNumber(number) { return Number.isInteger(number) ? String(number) : number === .5 ? '½' : String(Math.round(number * 100) / 100).replace('.', ','); }
function renderLabScene(result = null) {
  $('#labScene').classList.remove('lab-testing');
  $('#labScene').innerHTML = labDrawing(L.level, L.setup, result);
  const readings = $('#labReadings');
  if (!result) { readings.innerHTML = `<span class="lab-reading">${L.level.family === 'balance' ? 'Chaque carré pèse autant.' : L.level.family === 'light' ? 'Les lucioles attendent la lumière.' : L.level.family === 'gears' ? 'Bip : 12 dents. Il fera un tour.' : 'Un coucou revient après le même nombre de pas.'}</span>`; return; }
  const m = result.metrics;
  if (L.level.family === 'balance') readings.innerHTML = `<span class="lab-reading">Effet à gauche <strong>${m.leftTorque}</strong></span><span class="lab-reading">${m.leftTorque === m.rightTorque ? '=' : m.leftTorque > m.rightTorque ? '>' : '&lt;'}</span><span class="lab-reading">Effet à droite <strong>${m.rightTorque}</strong></span>`;
  else if (L.level.family === 'light') readings.innerHTML = `<span class="lab-reading">Lucioles allumées <strong>${m.hitTargets.length} / ${L.level.scene.targets.length}</strong></span>`;
  else if (L.level.family === 'gears') readings.innerHTML = `<span class="lab-reading">Bip <strong>1 tour</strong></span><span class="lab-reading">Zoé <strong>${labNumber(m.outputTurns)} tour${m.outputTurns > 1 ? 's' : ''}</strong></span><span class="lab-reading">${m.direction === L.level.scene.input.direction ? 'Même sens' : 'Sens contraire'}</span>`;
  else readings.innerHTML = `<span class="lab-reading">Ensemble au${m.togetherTicks.length > 1 ? 'x' : ''} pas <strong>${m.togetherTicks.length ? m.togetherTicks.join(' · ') : '—'}</strong></span>`;
}

function labDrawing(level, setup, result, preview = false) {
  if (level.family === 'rhythm' && !preview) return labRhythmDrawing(level, setup, result);
  const m = result ? result.metrics : evaluateLab(level, setup).metrics;
  const accent = LAB_COLORS[level.family].accent;
  let content = '';
  if (level.family === 'balance') {
    const angle = result ? Math.max(-12, Math.min(12, m.delta * 4)) : 0;
    content = `<path d="M318 364L380 265L442 364Z" fill="#85B3A0"/><rect x="265" y="363" width="230" height="14" rx="7" fill="#B4CFBB"/><g class="lab-beam" style="--tilt:${angle}deg;transform:rotate(${angle}deg);transform-origin:380px 250px"><rect x="56" y="243" width="648" height="19" rx="9" fill="#D6B780"/><rect x="56" y="243" width="648" height="5" rx="2" fill="#F1D8AC"/>`;
    for (const position of level.scene.positions) {
      const x = 380 + position * 73;
      const movable = level.controls.find(control => control.options.some(option => option.value === position) && (!L.level || level !== L.level || control.key === L.selected)) || level.controls.find(control => control.options.some(option => option.value === position));
      content += `<circle cx="${x}" cy="253" r="${preview ? 5 : 10}" fill="${movable ? '#FFFDF8' : '#B3966F'}" ${!preview && movable ? `data-lab-key="${movable.key}" data-lab-value="${position}" tabindex="0" role="button" aria-label="${labEscape(movable.label)} : case ${Math.abs(position)}"` : ''}/>`;
      if (!preview) content += `<text x="${x}" y="299" text-anchor="middle" fill="#668773" font-family="var(--text)" font-size="25">${Math.abs(position)}</text>`;
    }
    m.weights.forEach((weight, wi) => {
      const x = 380 + weight.position * 73, mobile = !!level.scene.weights[wi].control;
      const color = mobile ? accent : '#D78975';
      for (let cube = 0; cube < weight.mass; cube++) content += `<rect x="${x - 23}" y="${200 - cube * 42}" width="46" height="40" rx="6" fill="${color}"/><circle cx="${x}" cy="${220 - cube * 42}" r="5" fill="white" opacity=".6"/>`;
    });
    content += `</g><circle cx="380" cy="253" r="11" fill="#568775"/>`;
    if (!preview) content += `<text x="380" y="410" text-anchor="middle" fill="#557463" font-family="var(--text)" font-size="25">Le centre</text>`;
  } else if (level.family === 'light') {
    const scene = level.scene, unit = Math.min(630 / scene.width, 355 / scene.height), ox = (760 - scene.width * unit) / 2, oy = (430 - scene.height * unit) / 2;
    const xy = ([x, y]) => [ox + (x + .5) * unit, oy + (y + .5) * unit];
    for (let y = 0; y < scene.height; y++) for (let x = 0; x < scene.width; x++) content += `<rect x="${ox + x * unit}" y="${oy + y * unit}" width="${unit}" height="${unit}" rx="5" fill="${(x + y) % 2 ? '#FCF6E5' : '#FFFBF0'}" stroke="#E9DBB6" stroke-width="1"/>`;
    if (result) content += m.trace.map(segment => { const from = xy(segment.from), to = xy(segment.to); return `<line class="lab-ray" x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" stroke="${segment.branch ? '#F2B93B' : '#EFA933'}" stroke-width="7" stroke-linecap="round"/>`; }).join('');
    const source = xy([scene.source.x, scene.source.y]);
    content += `<circle cx="${source[0]}" cy="${source[1]}" r="24" fill="#EAAF35"/><circle cx="${source[0]}" cy="${source[1]}" r="12" fill="#FFFADE"/><path d="M${source[0] + 31} ${source[1] - 10}l14 10-14 10" fill="none" stroke="#EAAF35" stroke-width="4"/>`;
    m.mirrors.forEach((mirror, i) => {
      const [x, y] = xy([mirror.x, mirror.y]), slash = mirror.orientation === '/';
      content += `<g ${preview ? '' : `data-lab-key="${mirror.control}" data-lab-cycle="true" tabindex="0" role="button" aria-label="Tourner ${labEscape(level.controls.find(control => control.key === mirror.control).label)}"`}><circle cx="${x}" cy="${y}" r="29" fill="#D7E8EF"/><path d="M${x - 20} ${y + (slash ? 20 : -20)}L${x + 20} ${y + (slash ? -20 : 20)}" stroke="#679AAA" stroke-width="9" stroke-linecap="round"/><path d="M${x - 17} ${y + (slash ? 17 : -17)}L${x + 17} ${y + (slash ? -17 : 17)}" stroke="#E7F7FF" stroke-width="3"/></g>`;
      if (!preview && m.mirrors.length > 1) content += `<text x="${x + 29}" y="${y - 26}" font-family="var(--text)" font-size="24" fill="#788C92">${i + 1}</text>`;
    });
    scene.splitters.forEach(crystal => { const [x, y] = xy([crystal.x, crystal.y]); content += `<path d="M${x} ${y - 25}L${x + 22} ${y}L${x} ${y + 25}L${x - 22} ${y}Z" fill="#ADA1DE" stroke="#8579B8" stroke-width="3"/><path d="M${x} ${y - 20}V${y + 20}M${x - 17} ${y}H${x + 17}" stroke="#EAE4FF" stroke-width="3"/>`; });
    scene.targets.forEach(target => {
      const [x, y] = xy([target.x, target.y]), lit = result && m.hitTargets.includes(target.id);
      content += `<circle cx="${x}" cy="${y}" r="${lit ? 31 : 25}" fill="${lit ? '#F7D365' : '#DFE7C9'}"/><ellipse cx="${x - 12}" cy="${y - 9}" rx="13" ry="8" fill="#FFFDF2" transform="rotate(-30 ${x - 12} ${y - 9})"/><ellipse cx="${x + 12}" cy="${y - 9}" rx="13" ry="8" fill="#FFFDF2" transform="rotate(30 ${x + 12} ${y - 9})"/><ellipse cx="${x}" cy="${y + 3}" rx="10" ry="18" fill="${lit ? '#A07F23' : '#819460'}"/><circle cx="${x}" cy="${y + 11}" r="7" fill="${lit ? '#FFF4B5' : '#CAD49A'}"/>`;
    });
  } else if (level.family === 'gears') {
    const gears = m.gears, radii = gears.map(gear => gear.teeth * 5), total = radii.reduce((a, b) => a + b, 0) * 2;
    const scale = Math.min(650 / total, 145 / Math.max(...radii)), scaled = radii.map(r => r * scale), span = scaled.reduce((a, b) => a + b, 0) * 2;
    let cursor = (760 - span) / 2;
    gears.forEach((gear, i) => {
      const radius = scaled[i], x = cursor + radius, y = 190; cursor += 2 * radius;
      const color = i === 0 ? '#71A9CA' : i === gears.length - 1 ? '#DB8A72' : '#B4AE8A';
      const teeth = [];
      for (let tooth = 0; tooth < gear.teeth * 4; tooth++) {
        const angle = tooth / (gear.teeth * 4) * Math.PI * 2, rr = tooth % 4 === 0 || tooth % 4 === 3 ? radius - 7 : radius + 3;
        teeth.push((x + Math.cos(angle) * rr) + ',' + (y + Math.sin(angle) * rr));
      }
      content += `<g class="lab-gear" style="--spin:${result ? gear.signedTurns * 360 : 0}deg;--duration:1.9s"><polygon points="${teeth.join(' ')}" fill="${color}" stroke="#FFFFFF" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${radius * .62}" fill="none" stroke="white" stroke-width="3" opacity=".7"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y - radius * .8}" stroke="white" stroke-width="8" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="12" fill="#FFF9F2"/></g>`;
      if (!preview) content += `<text x="${x}" y="361" fill="#825E52" text-anchor="middle" font-family="var(--text)" font-size="27">${i === 0 ? 'Bip' : i === gears.length - 1 ? 'Zoé' : 'Lien'}</text><text x="${x}" y="399" fill="#A37766" text-anchor="middle" font-family="var(--text)" font-size="24">${gear.teeth}</text>`;
    });
  } else {
    content = `<path d="M60 305H700" stroke="#C0CDE3" stroke-width="4"/>`;
    for (let row = 0; row < 3; row++) for (let tick = 0; tick < 8; tick++) content += `<circle cx="${104 + tick * 78}" cy="${120 + row * 76}" r="20" fill="${tick % (row + 2) === 0 ? ['#70ABCD', '#DD9176', '#8FBF88'][row] : '#D9E3F3'}"/>`;
  }
  return `<svg viewBox="0 0 760 430" role="img" aria-label="${labEscape(level.title)}">${content}</svg>`;
}

function labRhythmDrawing(level, setup, result) {
  const m = result ? result.metrics : evaluateLab(level, setup).metrics;
  return `<div class="rhythm-scroll"><div class="rhythm-grid" style="--ticks:${m.timeline.length};grid-template-rows:30px repeat(${m.cycles.length},minmax(45px,1fr)) 36px"><div class="rhythm-label"></div>${m.timeline.map(frame => `<div class="rhythm-tick ${level.goal.focusTick === frame.tick ? 'rhythm-goal' : ''}" data-tick="${frame.tick}">${frame.tick}</div>`).join('')}${m.cycles.map((cycle, i) => `<div class="rhythm-label"><span>${cycle.id === 'bip' ? robotSVG() : symUse('avatar-' + cycle.id)}</span><b>${cycle.id === 'bip' ? 'Bip' : cycle.id === 'zoe' ? 'Zoé' : 'Lulu'}</b><small>${cycle.period} pas</small></div>${m.timeline.map(frame => `<div class="rhythm-cell ${level.goal.focusTick === frame.tick ? 'rhythm-goal' : ''}" data-tick="${frame.tick}"><i style="--friend:${['#68A2C4', '#CF806C', '#76A667'][i]}" class="${frame.active.includes(cycle.id) ? 'active' : ''}">${frame.active.includes(cycle.id) ? '●' : ''}</i></div>`).join('')}`).join('')}<div class="rhythm-label rhythm-all">Ensemble</div>${m.timeline.map(frame => `<div class="rhythm-cell rhythm-bottom" data-tick="${frame.tick}">${result && frame.together ? I.check : '<span>·</span>'}</div>`).join('')}</div></div>`;
}

function wireLabs() {
  $('#btnLabHome').innerHTML = I.home;
  $('#btnLabVoice').innerHTML = I.speaker;
  $('#btnLabHome').onclick = () => { show('home'); homeTab('Labs'); };
  $('#btnLabVoice').onclick = $('#labMission').onclick = () => speak($('#labText').textContent);
  ['Labs', 'Journey', 'Notebook'].forEach(name => $('#tab' + name).onclick = () => { homeTab(name); SFX.tap(); });
  $('#btnLabRun').onclick = runLab;
  $('#btnLabReset').onclick = () => openLab(L.level.id, L.free, L.level.initial);
  $('#btnLabHint').onclick = () => {
    const hints = { balance: 'Un panier loin du centre tire plus fort. Essaie une case voisine.', light: 'Suis la lumière du doigt. Quel miroir change son premier virage ?', gears: 'Deux roues qui se touchent tournent en sens contraire. Regarde aussi leur taille.', rhythm: 'Cherche le pas du rendez-vous. Quels amis ne font pas encore coucou ?' };
    $('#labFeedback').textContent = hints[L.level.family]; speak(hints[L.level.family]);
  };
  $('#btnLabNext').onclick = () => {
    const next = LAB_LEVELS[LAB_LEVELS.indexOf(L.level) + 1];
    if (next) openLab(next.id); else { show('home'); homeTab('Notebook'); }
  };
  $('#btnLabInvent').onclick = () => openLab(L.level.id, true, L.setup);
  $('#btnLabSave').onclick = () => {
    const recipe = { family: L.level.family, level: L.level.id, setup: labCopy(L.setup) };
    save.labs.inventions = save.labs.inventions.filter(item => item.family !== recipe.family);
    save.labs.inventions.push(recipe); persist();
    $('#labSaveStatus').textContent = 'Ton invention t’attend dans le jardin.'; SFX.sticker();
  };
  const sceneAction = target => {
    const element = target.closest('[data-lab-key]'); if (!element) return;
    const control = L.level.controls.find(item => item.key === element.dataset.labKey); if (!control) return;
    const next = element.dataset.labCycle ? control.options[(control.options.findIndex(item => item.value === L.setup[control.key]) + 1) % control.options.length].value : Number(element.dataset.labValue);
    setLabControl(control.key, next);
  };
  $('#labScene').onclick = event => sceneAction(event.target);
  $('#labScene').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); sceneAction(event.target); } });
  window.__bipLabs = { open: openLab, run: runLab, state: L, levels: LAB_LEVELS, evaluate: evaluateLab, set: setLabControl };
}
