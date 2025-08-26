import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "apps/lab/logsmith-vanilla/e2e",
  webServer: {
    command: "pnpm -C apps/lab/logsmith-vanilla dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
});
