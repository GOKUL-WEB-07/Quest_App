import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("main screens meet automated WCAG AA checks", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/onboarding/interests",
      "/home",
      "/discover",
      "/quest/shadow-hunter",
      "/quest/generate",
      "/profile",
    ]) {
      await page.goto(route);
      await page.locator("h1,h2").first().waitFor();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          description: v.description,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        `${route} at ${width}px`,
      ).toEqual([]);
    }
  }
});
test("invalid photos, offline progress, and storage failures are recoverable", async ({
  page,
  context,
}) => {
  await page.goto("/quest/window-watch");
  await page.getByRole("button", { name: "Start quest", exact: true }).click();
  await page.getByRole('checkbox').first().waitFor();
  await context.setOffline(true);
  await expect(
    page.getByRole("status").filter({ hasText: "You’re offline." }),
  ).toBeVisible();
  for (const box of await page.getByRole("checkbox").all()) {
    await box.check();
    await expect(box).toBeChecked();
  }
  await expect(
    page.getByRole("progressbar", { name: "Mission completion" }),
  ).toHaveAttribute("aria-valuenow", "100");
  await context.setOffline(false);
  await expect(
    page.getByRole("progressbar", { name: "Mission completion" }),
  ).toHaveAttribute("aria-valuenow", "100");
  await page
    .getByRole("button", { name: "Complete quest", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Save the memory", exact: true })
    .click();
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "Choose a JPG, PNG, or WebP photo.",
  );
  await page
    .getByRole("textbox", { name: /What will you remember/ })
    .fill("A five-minute pause.");
  await page
    .getByRole("button", { name: "Save the memory", exact: true })
    .click();
  await expect(page.getByText("A five-minute pause.")).toBeVisible();
  await page.goto("/quest/shadow-hunter");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Start quest", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "This browser could not save your progress.",
  );
  await expect(page).toHaveURL(/\/quest\/shadow-hunter$/);
});
