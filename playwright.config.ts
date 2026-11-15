import { defineConfig, devices } from "@playwright/test";

export const E2E_PORT = 3210;

// Click-through tests against the real upload folder (deploy/), started on an
// empty data folder exactly as the hosting would. `npm run test:e2e` builds it first.
export default defineConfig({
  testDir: "e2e",
  // One server and one database for the whole run, so tests go one at a time.
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node e2e/start-server.mjs",
    url: `http://127.0.0.1:${E2E_PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
