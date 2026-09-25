const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
let playwright;
try { playwright = require("playwright"); }
catch { playwright = require(path.join(path.dirname(process.execPath), "../node_modules/playwright")); }
const url = process.argv[2] || pathToFileURL(path.resolve("index.html")).href;
const output = path.join(os.tmpdir(), "portfolio-mobile");
fs.mkdirSync(output, {recursive: true});
const screens = [
  {width: 320, height: 568}, {width: 360, height: 800},
  {width: 390, height: 844}, {width: 430, height: 932},
  {width: 640, height: 900}, {width: 844, height: 390},
  {width: 768, height: 1024}
];
async function swipe(session, start, end) {
  await session.send("Input.dispatchTouchEvent", {type: "touchStart", touchPoints: [start]});
  for (let step = 1; step <= 8; step++) {
    await session.send("Input.dispatchTouchEvent", {type: "touchMove", touchPoints: [{
      x: start.x + (end.x - start.x) * step / 8,
      y: start.y + (end.y - start.y) * step / 8
    }]});
  }
  await session.send("Input.dispatchTouchEvent", {type: "touchEnd", touchPoints: []});
}
(async () => {
  const browser = await playwright.chromium.launch({channel: "chrome", headless: true});
  const errors = [];
  const checks = [];
  try {
    for (const viewport of screens) {
      const context = await browser.newContext({viewport, isMobile: true, hasTouch: true,
        deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: "light"});
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(url, {waitUntil: "load"});
      await page.evaluate(() => document.fonts.ready);
      const label = viewport.width + "x" + viewport.height;
      const capture = name => page.screenshot({path: path.join(output, label + "-" + name + ".png")});
      await capture("cover-light");
      const portrait = await page.locator(".avatar-container").boundingBox();
      assert.ok(portrait.x >= 0 && portrait.x + portrait.width <= viewport.width, label + " portrait stays in frame");
      if (viewport.height <= 500) {
        assert.ok(await page.locator(".site-header").evaluate(el => el.getBoundingClientRect().bottom) < viewport.height, label + " compact landscape cover");
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, label + " document fits");
      assert.deepEqual(await page.locator("h1,h2,h3,.skill-item span").evaluateAll(elements => elements
        .filter(el => el.clientWidth && el.scrollWidth > el.clientWidth + 2).map(el => el.textContent)), [], label + " labels fit");
      if (viewport.width <= 640) {
        const cover = await page.evaluate(() => {
          const photo = document.querySelector(".avatar-container").getBoundingClientRect();
          const title = document.querySelector(".hero-title").getBoundingClientRect();
          const terminal = document.querySelector(".terminal-card").getBoundingClientRect();
          return {photoWidth: photo.width, photoTop: photo.top, titleRight: title.right,
            photoLeft: photo.left, terminalTop: terminal.top, photoBottom: photo.bottom,
            terminalVisible: terminal.height > 0, heroBottom: document.querySelector(".hero").getBoundingClientRect().bottom};
        });
        assert.ok(cover.photoWidth >= 84 && cover.photoTop >= 64, label + " portrait visible");
        assert.ok(cover.titleRight < cover.photoLeft, label + " name and portrait do not overlap");
        assert.ok(!cover.terminalVisible || cover.terminalTop > cover.photoBottom, label + " terminal does not cover portrait");
        assert.ok(cover.heroBottom < viewport.height - 24, label + " next section is visible");
      }
      await page.locator("#navToggle").tap();
      assert.equal(await page.locator("#navToggle").getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator("main").evaluate(el => el.inert), true);
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), "hidden");
      assert.equal(await page.locator("#navLinks a").evaluateAll(links => links.every(a => a.getBoundingClientRect().height >= 44)), true);
      await capture("menu");
      if (viewport.width === 390) {
        const startScroll = await page.evaluate(() => scrollY);
        await swipe(session, {x: 200, y: 770}, {x: 200, y: 630});
        assert.equal(await page.evaluate(() => scrollY), startScroll, "Menu prevents background touch scrolling");
        await page.locator(".nav-logo > a").focus();
        await page.keyboard.press("Shift+Tab");
        assert.equal(await page.evaluate(() => document.activeElement.hash), "#contact");
        await page.keyboard.press("Tab");
        assert.equal(await page.evaluate(() => document.activeElement.hash), "#home");
        await page.locator("#navBackdrop").tap({position: {x: 200, y: 780}});
        assert.equal(await page.locator("#navToggle").getAttribute("aria-expanded"), "false");
        assert.equal(await page.locator("#navToggle").evaluate(el => el === document.activeElement), true);
        await page.locator("#navToggle").tap();
      }
      await page.locator('#navLinks a[href="#skills"]').tap();
      assert.equal(await page.locator("#navToggle").getAttribute("aria-expanded"), "false");
      assert.equal(await page.locator("main").evaluate(el => el.inert), false);
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflow), "hidden");
      if (viewport.width <= 640) {
        assert.equal(await page.locator(".skill-items:visible").count(), 1);
        assert.equal(await page.locator("#skill-group-2").isVisible(), true);
        await page.getByRole("button", {name: "Tools", exact: true}).tap();
        assert.equal(await page.locator("#skill-group-3").isVisible(), true);
        await page.locator("#skills").getByRole("button", {name: "Cloud", exact: true}).tap();
        assert.equal(await page.locator("#skill-group-2").isVisible(), false);
        await page.setViewportSize({width: 1000, height: 800});
        await page.locator("#skill-group-2").waitFor({state: "visible"});
        assert.equal(await page.locator(".skill-items:visible").count(), 6);
        assert.equal(await page.locator(".skill-toggle:visible").count(), 0);
        await page.setViewportSize(viewport);
        await page.locator("#skill-group-2").waitFor({state: "hidden"});
        assert.equal(await page.locator("#skill-group-2").isVisible(), false);
        assert.equal(await page.locator("#skill-group-3").isVisible(), true);
        await page.getByRole("button", {name: "Tools", exact: true}).tap();
        await page.locator("#skills").getByRole("button", {name: "Cloud", exact: true}).tap();
      }
      if (viewport.width === 390) {
        await page.evaluate(() => document.querySelectorAll("img").forEach(img => img.loading = "eager"));
        await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
        for (const id of ["skills", "experience", "leadership", "certifications", "projects", "hiking", "contact"]) {
          await page.evaluate(id => {
            const top = document.getElementById(id).getBoundingClientRect().top + scrollY;
            scrollTo({top: top - 64, behavior: "instant"});
          }, id);
          await capture(id + "-light");
        }
        await page.locator('#hikeGrid').scrollIntoViewIfNeeded();
        const bounds = await page.locator('#hikeGrid').boundingBox();
        await swipe(session, {x: 290, y: bounds.y + 100}, {x: 70, y: bounds.y + 100});
        await page.waitForFunction(() => document.getElementById("hikeGrid").scrollLeft > 100);
        await page.locator('[data-filter="cloud"]').tap();
        assert.equal(await page.locator(".project-card:visible").count(), 1);
        await page.locator('[data-filter="all"]').tap();
        await page.locator('[data-cert-filter="aws"]').tap();
        assert.equal(await page.locator(".cert-card:visible").count(), 6);
        await page.locator('[data-cert-filter="other"]').tap();
        assert.equal(await page.locator(".cert-card:visible").count(), 2);
        await page.locator('[data-cert-filter="all"]').tap();
      }
      await page.getByRole("button", {name: "Preview Diskarte PH", exact: true}).tap();
      await page.locator("#mediaContent img").evaluate(img => img.decode());
      if (viewport.width <= 640 || viewport.height <= 500) {
        const dialog = await page.locator("#mediaDialog").boundingBox();
        assert.ok(Math.abs(dialog.width - viewport.width) < 1 && Math.abs(dialog.height - viewport.height) < 1, label + " fullscreen preview");
        assert.equal(await page.getByRole("button", {name: viewport.width <= 640 ? "Mobile screenshot" : "Desktop screenshot", exact: true}).getAttribute("aria-pressed"), "true");
        await page.locator("#mediaContent").evaluate(el => el.scrollTop = el.scrollHeight);
        const close = await page.locator("#closeMedia").boundingBox();
        assert.ok(close.y >= 0 && close.y + close.height <= viewport.height, "Close remains reachable while preview scrolls");
      }
      await capture("preview");
      await page.getByRole("button", {name: "Close preview", exact: true}).tap();
      assert.equal(await page.locator("#mediaDialog").isVisible(), false);
      await page.locator("#contactName").scrollIntoViewIfNeeded();
      if (viewport.width <= 640) {
        const name = await page.locator("#contactName").boundingBox();
        const email = await page.locator("#contactEmail").boundingBox();
        assert.ok(email.y > name.y + name.height, label + " single-column form");
      }
      assert.equal(await page.locator(".form-group input, .form-group textarea").evaluateAll(inputs =>
        inputs.every(input => parseFloat(getComputedStyle(input).fontSize) >= 16)), true, "Inputs avoid iOS focus zoom");
      await page.locator("#themeToggle").tap();
      await page.evaluate(() => scrollTo({top: 0, behavior: "instant"}));
      await capture("cover-dark");
      if (viewport.width === 390) {
        for (const id of ["skills", "leadership", "certifications", "contact"]) {
          await page.evaluate(id => scrollTo({top: document.getElementById(id).offsetTop - 64, behavior: "instant"}), id);
          await capture(id + "-dark");
        }
      }
      checks.push(label);
      await context.close();
    }
    assert.deepEqual(errors, [], "No JavaScript errors on touch devices");
    console.log(JSON.stringify({url, passed: checks, interactions: "Touch menu, scroll lock, focus trap, backdrop, skill disclosures and rotation, filters, native hiking swipe, fullscreen preview and form sizing", errors, screenshots: output}, null, 2));
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
