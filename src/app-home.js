/* ---------- Accueil : la grande promenade ---------- */
const unlocked = i => save.all || i === 0 || (save.stars[LEVELS[i - 1].id] || 0) > 0;
const nextIndex = () => { const i = LEVELS.findIndex(l => !(save.stars[l.id] > 0)); return i < 0 ? LEVELS.length - 1 : i; };
const chapterDone = ci => LEVELS.filter(l => l.ch === ci).every(l => (save.stars[l.id] || 0) > 0);
const worldOf = ci => CHAPTERS[ci].w;

function renderHome() {
  // Jardin fleuri du héros : une fleur par chapitre terminé
  const nb = CHAPTERS.filter((_, ci) => chapterDone(ci)).length;
  $('#garden').innerHTML = Array.from({ length: nb }, (_, k) => `<span style="animation-delay:${k * .12}s">${symUse('flower')}</span>`).join('');
  $('#albumCount').textContent = `${save.stickers.length}/${STICKERS.length} images`;
  $('#dailyLabel').textContent = 'Aujourd\'hui : ' + DAILY_NAMES[DAILY_IDX];
  $('#dailyDots').innerHTML = DAILY_NAMES.map((_, k) => `<i class="${save.daily[k] ? 'on' : ''}"></i>`).join('');

  let h = '';
  let lastWorld = -1;
  CHAPTERS.forEach((c, ci) => {
    const w = worldOf(ci);
    if (w !== lastWorld) {
      lastWorld = w;
      h += `<div class="world-head"><span class="n">${w + 1}</span>${WORLDS[w].name}</div>`;
    }
    const lvls = LEVELS.map((l, i) => [l, i]).filter(([l]) => l.ch === ci);
    h += `<article class="chap${chapterDone(ci) ? ' done' : ''}" data-tone="${c.tone}">
      <div class="chap-head"><span class="chap-num">${ci + 1}</span><div><h2>${c.name}</h2><p>${c.hint}</p></div><span class="chap-ico">${CH_ICON[ci] || ''}</span></div>
      <div class="lvls">${lvls.map(([l, i]) => {
        const st = save.stars[l.id] || 0, open = unlocked(i);
        return `<button class="lvl${i === nextIndex() && open ? ' next' : ''}" data-i="${i}" ${open ? '' : 'disabled'} aria-label="Niveau ${l.id}${open ? (st ? ', ' + st + ' étoiles' : '') : ', fermé'}">
          <span class="n">${open ? l.id : I.lock}</span><span class="st">${open ? [1, 2, 3].map(k => I.star(k <= st)).join('') : ''}</span></button>`;
      }).join('')}</div></article>`;
  });
  // Le défi de Zoé n'est pas sur la carte : il vit dans sa carte tout en bas
  $('#journey').innerHTML = h;
  $$('.lvl', $('#journey')).forEach(b => b.addEventListener('click', () => { audio(); openLevel(+b.dataset.i); }));
}

/* ---------- Album ---------- */
function renderAlbum() {
  $('#albumGrid').innerHTML = STICKERS.map(st => {
    const got = hasSticker(st.id);
    return `<div class="stk${got ? ' got' : ''}"><span class="ico">${got ? st.icon() : I.lock}</span><b>${st.name}</b><small>${st.how}</small></div>`;
  }).join('');
}

/* ---------- Feuille adultes ---------- */
function syncToggles() {
  $('#tgVoice').setAttribute('aria-checked', String(!!save.voice));
  $('#tgSound').setAttribute('aria-checked', String(!!save.sound));
  $('#tgAll').setAttribute('aria-checked', String(!!save.all));
}
let resetArm = 0;
function openSheet() { syncToggles(); $('#sheet').hidden = false; hideHand(); stopVoice(); }
function closeSheet() { $('#sheet').hidden = true; if (!$('#home').hidden) renderHome(); }
