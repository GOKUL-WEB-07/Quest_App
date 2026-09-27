import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120000,
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    channel: "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm.cmd run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
  reporter: [["list"]],
  outputDir: "output/playwright/test-results",
});
