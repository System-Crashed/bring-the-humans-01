import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const profile = resolve('.chromium-validation-' + process.pid);
const browser = spawn('/snap/chromium/3583/usr/lib/chromium-browser/chrome', ['--headless', '--hide-scrollbars', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--metrics-recording-only', '--host-resolver-rules=MAP * ~NOTFOUND', '--remote-debugging-pipe', `--user-data-dir=${profile}`], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
let id = 0, buffer = ''; const pending = new Map();
browser.stderr.on('data', () => {});
browser.stdio[4].on('data', chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf('\0')) !== -1) {
    const message = JSON.parse(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
    if (pending.has(message.id)) { const {resolve, reject} = pending.get(message.id); pending.delete(message.id); message.error ? reject(message.error) : resolve(message.result); }
  }
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { pending.set(++id, {resolve, reject}); browser.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0'); });
const timeout = setTimeout(() => { browser.kill(); process.exitCode = 1; console.error('Browser validation timed out'); }, 120000);
try {
  const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
  const {sessionId} = await send('Target.attachToTarget', {targetId, flatten: true});
  const cdp = (method, params) => send(method, params, sessionId);
  await cdp('Network.enable');
  await cdp('Network.setBlockedURLs', {urls: ['http://*', 'https://*', 'ws://*', 'wss://*']});
  await cdp('Page.enable');
  const {frameTree} = await cdp('Page.getFrameTree');
  const html = readFileSync('index.html', 'utf8').replace('src="make-fun-lockup.svg"', `src="data:image/svg+xml;base64,${readFileSync('make-fun-lockup.svg').toString('base64')}"`);
  await cdp('Page.setDocumentContent', {frameId: frameTree.frame.id, html});
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await evaluate(`new Promise(resolve => { if(document.readyState === 'complete') resolve(); else window.addEventListener('load', resolve, {once:true}); })`);
  for (const width of [320, 390, 700, 768, 900, 1024, 1440]) {
    await cdp('Emulation.setDeviceMetricsOverride', {width, height: 1000, deviceScaleFactor: 1, mobile: false});
    const check = await evaluate(`(() => {
      const img = document.querySelector('.hero-logo'), box = img.getBoundingClientRect(), space = document.querySelector('.logo-space').getBoundingClientRect();
      const style = getComputedStyle(img);
      return {width: innerWidth, scroll: document.documentElement.scrollWidth, headings: document.querySelectorAll('h1').length,
        links: [...document.querySelectorAll('a[href^="https:"]')].map(a => a.getAttribute('href')),
        loaded: img.complete && img.naturalWidth > 0, logoHeight: box.height, ratio: box.width/box.height,
        clear: Math.min(box.left-space.left, space.right-box.right, box.top-space.top, space.bottom-box.bottom),
        transform: style.transform, filter: style.filter, background: getComputedStyle(document.querySelector('.logo-space')).backgroundColor,
        externalAssets: document.querySelectorAll('script, link[href^="http"], img[src^="http"]').length};
    })()`);
    assert(check.scroll <= width); assert.equal(check.headings, 1);
    assert.deepEqual(check.links, ['https://make.fun/r/f7z1eyxy', 'https://make.fun/r/f7z1eyxy']);
    assert(check.loaded && check.logoHeight >= 32 && check.clear >= check.logoHeight / 2);
    assert(Math.abs(check.ratio - 415.59 / 128) < .01);
    assert.equal(check.transform, 'none'); assert.equal(check.filter, 'none'); assert.equal(check.externalAssets, 0);
    console.log(JSON.stringify(check));
    if (width === 390 || width === 1440) {
      const {data} = await cdp('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true, ...(width === 390 ? {clip: {x:0,y:0,width,height:await evaluate('document.documentElement.scrollHeight'),scale:1}} : {})});
      writeFileSync(width === 1440 ? 'ad.png' : 'mobile-preview.png', Buffer.from(data, 'base64'));
    }
  }
  await cdp('Input.dispatchKeyEvent', {type:'keyDown', key:'Tab', code:'Tab', windowsVirtualKeyCode:9});
  assert.equal(await evaluate('document.activeElement.className'), 'skip mono');
  assert.equal(createHash('sha256').update(readFileSync('make-fun-lockup.svg')).digest('hex'), '0524060bcb290830469554c0cca2465d379f8139a374126c49d1f04275df4c51');
  console.log('PASS: responsive layout, referral destinations, logo integrity/clear space, and keyboard focus.');
} finally {
  clearTimeout(timeout);
  await send('Browser.close').catch(() => {});
  await new Promise(resolve => browser.exitCode !== null ? resolve() : browser.once('exit', resolve));
  rmSync(profile, {recursive:true, force:true});
}
