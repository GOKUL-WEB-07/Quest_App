import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const output = new URL("../public/icons/", import.meta.url);
await mkdir(output, { recursive: true });

const source = await readFile(
  new URL("../public/favicon.svg", import.meta.url),
  "utf8",
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const size of [192, 512]) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      source.replace("viewBox=", `width="${size}" height="${size}" viewBox=`),
    );
    await page
      .locator("svg")
      .screenshot({ path: fileURLToPath(new URL(`icon-${size}.png`, output)) });
    await page.close();
  }

  for (const size of [192, 512]) {
    const page = await browser.newPage({viewport: {width: size, height: size}, deviceScaleFactor: 1});
    await page.setContent(source.replace("viewBox=", `width="${size}" height="${size}" viewBox=`));
    await page.locator("svg").screenshot({path: fileURLToPath(new URL(`icon-maskable-${size}.png`, output))});
    await page.close();
  }
} finally {
  await browser.close();
}
