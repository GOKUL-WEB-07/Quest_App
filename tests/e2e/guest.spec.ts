import { test, expect } from "@playwright/test";
test("personal setup, discovery, persistent quest, completion, photo memory, saved and navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole("heading", { name: "Make today a little less ordinary." }),
  ).toBeVisible();
  await page.goto("/onboarding/interests");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByRole("textbox", { name: "What should we call you?" })
    .fill("Alex");
  await page.getByRole("button", { name: "Let’s find your SideQuest" }).click();
  await expect(
    page.getByRole("heading", { name: "Make today a little less ordinary." }),
  ).toBeVisible();
  await page.goto("/discover");
  await page.getByRole("searchbox", { name: "Search quests" }).fill("Shadow hunter");
  await expect(page.locator(".quest-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save Shadow hunter", exact: true })
    .click();
  await page.goto("/saved");
  await expect(page.locator(".quest-card")).toHaveCount(1);
  await page
    .getByRole("heading", { name: "Shadow hunter", exact: true })
    .click();
  await page.getByRole("button", { name: "Start quest", exact: true }).click();
  await page.getByRole("checkbox").first().check();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page
    .getByRole("button", { name: "Complete quest", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Look at you, out there." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".xp-pill")).toHaveText("40 XP");
  await page
    .getByRole("link", { name: "Save the memory", exact: true })
    .click();
  const photo = await page.screenshot({
    clip: { x: 0, y: 0, width: 100, height: 100 },
  });
  await page.locator("input[type=file]").setInputFiles({
    name: "moment.png",
    mimeType: "image/png",
    buffer: photo,
  });
  await expect(page.getByAltText("Your memory preview")).toBeVisible();
  await page
    .getByRole("textbox", { name: /What will you remember/ })
    .fill("The afternoon light on a familiar wall.");
  await page
    .getByRole("textbox", { name: /A place to remember/ })
    .fill("Campus garden");
  await page.getByRole("button", { name: "Rate 4 out of 5" }).click();
  await page
    .getByRole("button", { name: "Save the memory", exact: true })
    .click();
  await expect(
    page.getByText("The afternoon light on a familiar wall."),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Campus garden", { exact: true })).toBeVisible();
  await page.goto("/profile/achievements");
  await expect(
    page.locator(".achievement-card.unlocked").first(),
  ).toContainText("First step");
  await page.goto("/packs/touch-grass");
  await expect(
    page.getByRole("link", { name: "Start pack", exact: true }),
  ).toBeVisible();
  await page.goto("/quest/generate");
  await expect(page.getByText("Step 1 of 4")).toBeVisible();
  await expect(page.getByRole("button", { name: "Task", exact: true })).toHaveClass(/secondary/);
  await expect(page.getByRole("button", { name: "Learning quest", exact: true })).toHaveClass(/secondary/);
  await page.getByRole("button", { name: "Task", exact: true }).click();
  await expect(page.getByText("Step 2 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByText("Step 1 of 4")).toBeVisible();
  await page.getByRole("button", { name: "Learning quest", exact: true }).click();
  await expect(page.getByRole("heading", { name: "What would you like to learn?" })).toBeVisible();
  await page.goto("/quest/generate");
  await page.getByRole("button", { name: "Task", exact: true }).click();
  await page.getByRole("button", { name: "Relaxed", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "5 min", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Find my SideQuest" }).click();
  await expect(page).toHaveURL(/\/quest\/(?!generate)/);
  await expect(page.locator(".detail-meta")).toContainText("5 minutes");
  await page.goto("/quest/generate?surprise=1");
  await expect(page).toHaveURL(/\/quest\/(?!generate).+surprise=1/);
  await page.goto("/discover");
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Available time").selectOption("5");
  await page.getByRole("button", { name: /Show \d+ quests/ }).click();
  for (const card of await page.locator(".quest-card").all())
    await expect(card).toContainText("5 min");
  await page.goto("/not-a-route");
  await expect(
    page.getByRole("heading", { name: "A turn off the map." }),
  ).toBeVisible();
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Your personal journal" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export my journal" }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(
    /^sidequest-journal-.*\.json$/,
  );
  expect(errors).toEqual([]);
});
test("responsive layouts, navigation, keyboard focus, and no horizontal overflow", async ({
  page,
}) => {
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/onboarding/interests",
      "/home",
      "/discover",
      "/quest/shadow-hunter",
      "/quest/generate",
      "/memories",
      "/profile",
      "/packs/touch-grass",
    ]) {
      await page.goto(route);
      await page.locator("h1,h2").first().waitFor();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
    await page.goto("/home");
    await page
      .getByRole("heading", { name: "Make today a little less ordinary." })
      .waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images)
          .filter((i) => i.loading !== "lazy")
          .map((i) => i.decode().catch(() => {})),
      );
    });
    await page.screenshot({
      path: `output/playwright/home-${width}.png`,
      fullPage: true,
    });
    if (width === 390)
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeVisible();
  }
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});
test("old account route redirects home, no matches and abandoned quest recovery", async ({
  page,
}) => {
  await page.goto("/welcome");
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole("button", { name: /sign in|sign up|create account/i }),
  ).toHaveCount(0);
  await page.goto("/discover?category=Social&participants=solo");
  await expect(
    page.getByRole("heading", { name: "Couldn’t find the perfect match." }),
  ).toBeVisible();
  await page.goto("/quest/window-watch");
  await page.getByRole("button", { name: "Start quest", exact: true }).click();
  await page.getByRole("button", { name: "Leave this quest" }).click();
  await page.getByRole("button", { name: "Leave quest", exact: true }).click();
  await page.reload();
  await expect(page.locator(".continue-banner")).toHaveCount(0);
});
