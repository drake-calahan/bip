/* Run against the local server. Optional argv[2] is a Node package directory. */
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(process.argv[2] ? path.join(process.argv[2], 'playwright') : 'playwright');
const root = path.resolve(__dirname, '..');
const captures = path.join(root, '.artifact');
fs.mkdirSync(captures, { recursive: true });
const errors = [];
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }

async function noOverflow(page, context) {
  const issues = await page.evaluate(() => {
    const viewport = window.innerWidth;
    const root = document.querySelector('#lab').hidden ? document.querySelector('#home') : document.querySelector('#lab');
    const buttons = [...root.querySelectorAll('button')].filter(button => button.getClientRects().length && !button.closest('svg'));
    return {
      hidden: root.hidden,
      overflow: root.scrollWidth > viewport + 1,
      escaped: buttons.filter(button => { const r = button.getBoundingClientRect(); return r.left < -1 || r.right > viewport + 1; }).map(button => { const r = button.getBoundingClientRect(); return { text: button.textContent || button.getAttribute('aria-label'), x: r.x, right: r.right, width: r.width }; }),
      small: buttons.filter(button => { const r = button.getBoundingClientRect(); return r.width < 43 || r.height < 43; }).map(button => button.textContent || button.getAttribute('aria-label'))
    };
  });
  check(!issues.hidden && !issues.overflow && !issues.escaped.length, context + ' visible with no horizontal overflow: ' + JSON.stringify(issues));
  check(!issues.small.length, context + ' touch targets: ' + JSON.stringify(issues.small));
}

async function clickSetting(page, key, value) {
  const option = await page.evaluate(({ key, value }) => window.__bipLabs.state.level.controls.find(control => control.key === key).options.findIndex(item => item.value === value), { key, value });
  await page.locator(`[data-control="${key}"][data-option="${option}"]`).click();
}

async function solveCurrent(page) {
  const solution = await page.evaluate(() => window.__bipLabs.state.level.solution);
  for (const [key, value] of Object.entries(solution)) await clickSetting(page, key, value);
  await page.locator('#btnLabRun').click();
  await page.waitForFunction(() => !window.__bipLabs.state.running);
  check(await page.evaluate(() => window.__bipLabs.state.last.result.success), 'lab solution succeeds through UI');
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BIP_BROWSER || 'chrome' });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      // A pre-existing adventure save must survive the V3 upgrade.
      if (!localStorage.getItem('bip-robot-v2')) localStorage.setItem('bip-robot-v2', JSON.stringify({ stars: { 1: 2 }, voice: false, sound: false, seen: { w: {}, c: {}, ce: {} } }));
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.BIP_URL || 'http://127.0.0.1:8103', { waitUntil: 'networkidle' });
    await noOverflow(page, 'desktop home');
    await page.screenshot({ path: path.join(captures, 'v3-home-desktop.png') });
    check(await page.evaluate(() => JSON.parse(localStorage.getItem('bip-robot-v2')).stars[1] === 2), 'legacy progress preserved');

    await page.locator('[data-lab-open="balance-1"]').first().click();
    await page.locator('[data-predict="right"]').click();
    await page.locator('#btnLabRun').click();
    await page.waitForFunction(() => !window.__bipLabs.state.running);
    check(await page.locator('#labFeedback').innerText().then(text => text.includes('surprise')), 'unexpected prediction remains gentle');
    await solveCurrent(page);
    check(await page.locator('#labCompare').isVisible(), 'two trials can be compared');
    await page.screenshot({ path: path.join(captures, 'v3-balance-desktop.png') });
    await noOverflow(page, 'desktop balance');

    const ids = await page.evaluate(() => window.__bipLabs.levels.map(level => level.id));
    for (const id of ids.slice(1)) {
      await page.evaluate(id => window.__bipLabs.open(id), id);
      check(await page.locator('#labCompare').isHidden(), 'comparison cleared on opening ' + id);
      await solveCurrent(page);
      if (id.endsWith('-3')) await page.screenshot({ path: path.join(captures, 'v3-' + id + '-desktop.png') });
    }
    await page.locator('#btnLabHome').click();
    check(await page.locator('#labTotal').innerText() === '12/12', 'all twelve discoveries counted');
    await page.locator('#tabNotebook').click();
    check(await page.locator('.discovery:not(.locked)').count() === 12, 'notebook contains all discoveries');
    await page.locator('#tabLabs').click();
    await page.locator('[data-lab-free="gears-3"]').click();
    await clickSetting(page, 'middle', 24);
    await page.locator('#btnLabSave').click();
    await page.locator('#btnLabHome').click();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-lab-recipe="gears"]').click();
    check(await page.evaluate(() => window.__bipLabs.state.setup.middle === 24 && window.__bipLabs.state.free), 'invention survives reload');
    await page.locator('#btnLabHome').click();
    await page.locator('#btnDaily').click();
    check(await page.evaluate(() => window.__bip.G.daily), 'daily mode recognized');
    await page.evaluate(async () => {
      const api = window.__bip;
      api.G.prog = JSON.parse(JSON.stringify(api.G.lv.ref)); api.G.fn = JSON.parse(JSON.stringify(api.G.lv.refFn)); api.G.spd = .001;
      await api.runAll();
    });
    await page.waitForSelector('#win:not([hidden])');
    await page.locator('#btnNext').click();
    check(await page.locator('#home').isVisible() && await page.locator('#story').isHidden(), 'daily returns home without finale');
    check(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('bip-robot-v2')).daily).length === 1), 'daily completion persisted');

    for (const index of [0, 25, 45, 50, 55, 60]) {
      await page.evaluate(index => window.__bip.openLevel(index), index);
      while (await page.locator('#story').isVisible()) await page.locator('#btnStoryNext').click();
      await page.evaluate(async () => {
        const api = window.__bip, g = api.G;
        g.spd = .001; g.prog = JSON.parse(JSON.stringify(g.lv.ref)); g.fn = JSON.parse(JSON.stringify(g.lv.refFn));
        if (g.mode === 'ball') g.tiles = Object.fromEntries(g.lv.tiles.map(tile => { const [x, y, direction] = tile.split(','); return [x + ',' + y, direction]; }));
        await api.runAll();
      });
      await page.waitForSelector('#win:not([hidden])');
      check(await page.locator('#winTitle').innerText().then(text => !!text), 'legacy win ' + (index + 1));
      await page.locator('#btnAgain').click();
      await page.locator('#btnHome').click();
    }

    for (const viewport of [{ width: 360, height: 640 }, { width: 390, height: 844 }, { width: 1024, height: 600 }]) {
      await page.setViewportSize(viewport);
      await page.screenshot({ path: path.join(captures, `v3-home-${viewport.width}.png`) });
      await noOverflow(page, `${viewport.width} home`);
      for (const family of ['balance', 'light', 'gears', 'rhythm']) {
        await page.evaluate(id => window.__bipLabs.open(id), family + '-3');
        await solveCurrent(page);
        await noOverflow(page, `${viewport.width} ${family}`);
        await page.locator('#lab').evaluate(element => { element.scrollTop = 0; });
        await page.screenshot({ path: path.join(captures, `v3-${family}-${viewport.width}.png`) });
        await page.locator('#btnLabHome').click();
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => window.__bipLabs.open('gears-1', false, { output: 24 }));
    await page.locator('#btnLabRun').click();
    const start = await page.locator('.lab-gear').last().evaluate(element => getComputedStyle(element).rotate);
    await page.waitForTimeout(700);
    const middle = await page.locator('.lab-gear').last().evaluate(element => getComputedStyle(element).rotate);
    check(start !== middle, 'gears move during observation');
    await page.waitForFunction(() => !window.__bipLabs.state.running);
    check(await page.locator('.lab-gear').last().evaluate(element => getComputedStyle(element).rotate) === '-180deg', 'half turn remains visible');
    await page.evaluate(() => window.__bipLabs.open('light-2'));
    await page.locator('#btnLabRun').click();
    await page.locator('#btnLabHome').click();
    await page.waitForTimeout(1300);
    check(await page.locator('#home').isVisible() && await page.locator('#labFollow').isHidden(), 'cancelled experiment cannot write result after navigation');

    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    check(await page.locator('.lab-family').count() === 4, 'PWA reloads offline');
    await page.locator('[data-lab-open="light-1"]').first().click();
    await solveCurrent(page);
    check(await page.locator('#labScene svg').count() === 1, 'offline scene rendered');
    check(errors.length === 0, 'no browser errors: ' + errors.join('; '));
    console.log(`UI OK: ${checks} checks, twelve puzzles, inventions, daily, six legacy modes, three viewport sizes, animation and offline.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
