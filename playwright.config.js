const { defineConfig, devices } = require("@playwright/test");

const baseURL = process.env.LANDING_URL || "http://127.0.0.1:4173";

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.LANDING_URL
    ? undefined
    : {
        command: "python3 -m http.server 4173 --bind 127.0.0.1",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
      },
});
