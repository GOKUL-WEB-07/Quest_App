import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const base = process.argv.includes("--pages") ? "/Quest_App/" : "/";
const manifestPath = join(dist, "manifest.webmanifest");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.id = base;
manifest.scope = base;
manifest.start_url = `${base}${base === "/" ? "home" : "#/home"}`;
manifest.icons = manifest.icons.map((icon) => ({ ...icon, src: `${base}${icon.src.replace(/^\//, "")}` }));
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesIn(path) : [path];
    }),
  );
  return files.flat();
}

const files = (await filesIn(dist)).filter((file) => !file.endsWith("sw.js"));
const urls = files.map(
  (file) => `${base}${relative(dist, file).split(sep).join("/")}`,
);
const hash = createHash("sha256");
for (const file of files) {
  hash.update(relative(dist, file));
  hash.update(await readFile(file));
}
const version = hash.digest("hex").slice(0, 12);

const worker = `const PREFIX = ${JSON.stringify(`sidequest-${base}-`)};
const CACHE = PREFIX + "${version}";
const PRECACHE = ${JSON.stringify(urls)};
const ASSETS = new Set(PRECACHE);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(${JSON.stringify(`${base}index.html`)})) || Response.error();
    }));
    return;
  }

  if (ASSETS.has(url.pathname)) {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match(url.pathname, { ignoreVary: true }).then((cached) => cached || fetch(request))));
  }
});
`;

await writeFile(join(dist, "sw.js"), worker);
console.log(`Offline cache ready (${urls.length} files, ${version}).`);
