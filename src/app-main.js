/* ---------- Câblage général ---------- */
function wire() {
  $('#heroArt').innerHTML = robotSVG() + `<span class="float f1">${toyUse('b')}</span><span class="float f2">${toyUse('c')}</span>`;
  $('#icoPlayBig').innerHTML = I.play;
  $('#icoInfo').innerHTML = I.info;
  $('#icoDaily').innerHTML = symUse('avatar-zoe');
  $('#icoSandbox').innerHTML = I.flowerIco;
  $('#icoMachines').innerHTML = `<span style="display:block;width:100%;height:100%;color:#CF745F">${I.cog}</span>`;
  $('#icoAlbum').innerHTML = I.sticker;
  $('#icoZoeAlbum').innerHTML = symUse('avatar-zoe');
  $('#btnHome').innerHTML = I.home;
  $('#btnHint').innerHTML = I.bulb;
  $('#miniBip').innerHTML = robotSVG(); $('#miniBip').dataset.who = 'bip';
  $('#miniBip2').innerHTML = robotSVG();
  $('#icoSpk').innerHTML = I.speaker;
  $('#icoProg').innerHTML = `<span style="display:block;width:22px;height:22px">${robotSVG()}</span>`;
  $('#fnLab').innerHTML = `${I.magic}<span>=</span>`;
  $('#btnTrash').innerHTML = I.trash;
  $('#btnStep').innerHTML = I.step;
  $('#btnClose').innerHTML = I.close;
  $('#btnAlbumClose').innerHTML = I.close;
  $('#btnMachinesClose').innerHTML = I.close;
  $('#icoStoryNext').innerHTML = I.next;
  $('#btnSbHome').innerHTML = I.home;
  $('#btnSbPlay').innerHTML = I.play;
  $('#sbPill').innerHTML = I.flowerIco;
  $('#btnSbCodeClose').innerHTML = I.close;
  $('#icoSbCopy').innerHTML = I.share;
  $('#icoSbLoad').innerHTML = I.paste;
  setRunning(false);

  // Joueur de la première heure : un autocollant souvenir
  try { if (localStorage.getItem('bip-robot-v1')) setTimeout(() => award('v1'), 1200); } catch (e) { /* */ }

  $('#btnPlay').addEventListener('click', () => { audio(); openLevel(nextIndex()); });
  $('#btnDaily').addEventListener('click', () => { audio(); openLevelObj(dailyLevel(), { daily: true }); });
  $('#btnSandbox').addEventListener('click', () => { audio(); openSandbox(); });
  $('#btnAlbum').addEventListener('click', () => { audio(); openAlbum(); });
  $('#btnAlbumClose').addEventListener('click', () => { $('#album').hidden = true; });
  $('#album').addEventListener('click', e => { if (e.target.id === 'album') $('#album').hidden = true; });
  $('#btnHome').addEventListener('click', () => { G.abort = true; show('home'); scrollToBip(true); });
  $('#btnHint').addEventListener('click', showHint);
  $('#bubble').addEventListener('click', () => { if (G.sayNext) { const f = G.sayNext; G.sayNext = null; f(); } else speak($('#msg').textContent); });
  $('#btnRun').addEventListener('click', () => { audio(); runAll(); });
  $('#btnStep').addEventListener('click', () => { audio(); stepOnce(); });
  $('#fnRow').addEventListener('click', e => { if (e.target.closest('.blk, .ctr, .slot')) return; setTarget('fn'); });
  $('#board').addEventListener('click', onBoardTap);
  $('#sbBoard').addEventListener('click', onSbTap);
  let trashT = 0;
  $('#btnTrash').addEventListener('click', e => {
    const b = e.currentTarget;
    if (G.busy) return;
    if (G.mode === 'ball') {
      if (!Object.keys(G.tiles).length) return;
      G.tiles = {}; SFX.del(); renderTiles(); say('Flèches effacées. On recommence !', true);
      return;
    }
    if (!totalBlocks()) return;
    if (!b.classList.contains('arm')) {
      b.classList.add('arm'); b.setAttribute('aria-label', 'Toucher encore pour tout effacer'); SFX.tap();
      clearTimeout(trashT); trashT = setTimeout(() => { b.classList.remove('arm'); b.setAttribute('aria-label', 'Tout effacer'); }, 2500);
      return;
    }
    clearTimeout(trashT); b.classList.remove('arm'); b.setAttribute('aria-label', 'Tout effacer');
    poofAt($('#main'));
    G.prog = []; G.fn = []; G.target = 'main'; SFX.del(); edited();
    say('Programme effacé. On recommence !', true);
  });
  $('#btnAgain').addEventListener('click', () => { $('#win').hidden = true; setVariant(0); clearMarks(); $$('#vars button').forEach(b => b.classList.remove('pass', 'fail')); say(G.lv.text); });
  $('#btnNext').addEventListener('click', afterWinNext);
  $('#btnAdults').addEventListener('click', openSheet);
  $('#btnClose').addEventListener('click', closeSheet);
  $('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });

  // Note de version dans la feuille adultes
  const vn = $('#versionNotes');
  if (vn && typeof VERSION_NOTES !== 'undefined') {
    vn.innerHTML = `<p><b>${VERSION_NOTES[0][0]}</b> — version installée sur cet appareil.</p><ul>` +
      VERSION_NOTES.map(([v, d]) => `<li><b>${v}</b> : ${d}</li>`).join('') + `</ul>`;
  }
  $('#tgVoice').addEventListener('click', () => { save.voice = !save.voice; if (!save.voice) stopVoice(); persist(); syncToggles(); });
  $('#tgSound').addEventListener('click', () => { save.sound = !save.sound; persist(); syncToggles(); });
  $('#tgAll').addEventListener('click', () => { save.all = !save.all; persist(); syncToggles(); });
  $('#btnReset').addEventListener('click', e => {
    const b = e.currentTarget;
    if (!b.classList.contains('arm')) {
      b.classList.add('arm'); $('#resetLabel').textContent = 'Toucher encore pour tout effacer';
      clearTimeout(resetArm); resetArm = setTimeout(() => { b.classList.remove('arm'); $('#resetLabel').textContent = 'Effacer la progression'; }, 3000);
      return;
    }
    clearTimeout(resetArm); b.classList.remove('arm');
    save.stars = {}; save.all = false; save.stickers = []; save.daily = {}; save.seen = { w: {}, c: {}, ce: {} }; save.sandbox = [null, null, null]; save.labs = { solved: {} };
    persist(); syncToggles(); renderHome();
    $('#resetLabel').textContent = 'Progression effacée';
    setTimeout(() => { $('#resetLabel').textContent = 'Effacer la progression'; }, 2000);
  });
  $('#btnSbHome').addEventListener('click', () => show('home'));
  $('#btnSbPlay').addEventListener('click', () => { audio(); playSandbox(); });
  $('#sbBubble').addEventListener('click', () => speak($('#sbMsg').textContent));
  $('#btnSbCodeClose').addEventListener('click', () => { $('#sbCode').hidden = true; });
  $('#sbCode').addEventListener('click', e => { if (e.target.id === 'sbCode') $('#sbCode').hidden = true; });
  $('#btnSbCopy').addEventListener('click', () => { audio(); copySbCode(); });
  $('#btnSbLoad').addEventListener('click', () => { audio(); loadSbCode(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#sheet').hidden) closeSheet();
      else if (!$('#sbCode').hidden) $('#sbCode').hidden = true;
      else if (!$('#album').hidden) $('#album').hidden = true;
      else if (!$('#machines').hidden) $('#machines').hidden = true;
      else if (!$('#story').hidden) $('#storyCard').click();
    }
  });
  document.addEventListener('contextmenu', e => { if (e.target.closest('.blk, .ctr, .board, .sb-item, .scene')) e.preventDefault(); });
  new ResizeObserver(fitBoard).observe($('#boardWrap'));
  new ResizeObserver(fitBoard).observe($('#bubble'));
  new ResizeObserver(fitScene).observe($('.scene-wrap'));
  new ResizeObserver(fitSbBoard).observe($('#sbBoardWrap'));
  window.addEventListener('resize', () => { placeHand(); });
  $('#seqScroll').addEventListener('scroll', placeHand, { passive: true });
  if (STANDALONE) window.addEventListener('popstate', () => { if (!$('#game').hidden || !$('#sandbox').hidden || !$('#lab').hidden) { G.abort = true; L.token++; L.running = false; show('home'); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopVoice(); });
  wireLabs();
  show('home');
  requestAnimationFrame(() => scrollToBip(false));
}
wire();
// Accès QA/dev (console) : window.__bip.openLevel(i), .run(), .state()
window.__bip = { G, L, openLevel, openLevelObj, openLab, parseProg, runAll, runLab, LEVELS, CHAPTERS, WORLDS, LAB_LEVELS, simulate, save, persist, show, renderHome, sbEncode, sbDecode };
