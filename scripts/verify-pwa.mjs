import assert from "node:assert/strict";
import { chromium } from "playwright";

const origin = process.env.SIDEQUEST_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/home`);
  await page
    .getByRole("heading", { name: /sidequest|today|adventure/i })
    .first()
    .waitFor();

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) throw new Error("Manifest link missing");
    const response = await fetch(link.href);
    return response.json();
  });
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/home");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  for (const icon of manifest.icons) {
    const response = await context.request.get(`${origin}${icon.src}`);
    assert.equal(response.status(), 200, icon.src);
    assert.match(response.headers()["content-type"], /image\/png/);
  }

  await page.evaluate(() => navigator.serviceWorker.ready);
  const cacheCount = await page.evaluate(async () => {
    const names = await caches.keys();
    const cache = await caches.open(
      names.find((name) => name.startsWith("sidequest-")),
    );
    return (await cache.keys()).length;
  });
  assert.ok(cacheCount > 20, `Expected app files cached, found ${cacheCount}`);

  await context.setOffline(true);
  await page.goto(`${origin}/discover`);
  await page.getByRole("heading", { name: "Follow your curiosity." }).waitFor();
  console.log(
    `PWA verified: manifest, icons, ${cacheCount} cached files, offline deep link.`,
  );
} finally {
  await browser.close();
}
