/*
  Playwright E2E — Prerequisitos:
  1. Backend Django corriendo en http://localhost:8000 (api en /api/v1/)
  2. Frontend Next.js corriendo en http://localhost:3000 (npm run dev)
  3. Usuario de test en backend:
       python manage.py shell -c "
         from django.contrib.auth import get_user_model
         User = get_user_model()
         if not User.objects.filter(username='testuser').exists():
             User.objects.create_user('testuser', 'test@test.com', 'testpass123')
         "
  4. Variables de entorno (opcional):
       E2E_BASE_URL      — default http://localhost:3000
       E2E_USERNAME      — default testuser
       E2E_PASSWORD      — default testpass123

  NOTA: Los servidores se levantan manualmente (no webServer automático).
*/

import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: {
        storageState: "playwright/.auth/user.json",
      },
      testIgnore: ["**/auth.setup.ts", "**/login.spec.ts"],
    },
    {
      name: "login",
      testMatch: "**/login.spec.ts",
    },
  ],

  reporter: [["html"], ["list"]],
})
