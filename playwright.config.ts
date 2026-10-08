import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Screenshots and traces provide diagnostics without requiring ffmpeg.
    video: "off",
  },
  projects: [
    // Use the installed Chrome by default, so contributors do not need a
    // separate browser download. Set PLAYWRIGHT_BROWSER=chromium in CI when
    // using `npx playwright install --with-deps chromium`.
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_BROWSER === "chromium" ? undefined : "chrome",
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
