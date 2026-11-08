import { defineConfig, devices } from "@playwright/test";

// Credenciais opcionais do E2E do painel (ADMIN_EMAIL/ADMIN_PASSWORD) ficam no .env.local, fora do git.
try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local: os testes que dependem dele são pulados
}

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Build de produção para os E2E refletirem o comportamento real.
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
