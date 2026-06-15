import { test, expect } from "@playwright/test"

const API_BASE = "http://localhost:8000/api/v1"
const USERNAME = process.env.E2E_USERNAME || "testuser"
const PASSWORD = process.env.E2E_PASSWORD || "testpass123"

async function loginViaForm(page: import("@playwright/test").Page) {
  await page.goto("/login")
  await page.fill("#username", USERNAME)
  await page.fill("#password", PASSWORD)
  await page.click("button[type=submit]")
  await page.waitForURL("/dashboard")
}

test.describe("AuthGuard — sin sesión", () => {
  test("sin token → visitar ruta protegida redirige a /login", async ({ page }) => {
    await page.goto("/warehouses")
    await page.waitForURL("/login")
  })
})

test.describe("Login", () => {
  test("credenciales válidas → /dashboard con layout (Sidebar + Topbar)", async ({ page }) => {
    await page.goto("/login")

    await page.fill("#username", USERNAME)
    await page.fill("#password", PASSWORD)
    await page.click("button[type=submit]")

    await page.waitForURL("/dashboard")
    await expect(page.locator("h1")).toContainText("Dashboard")
    await expect(page.locator("aside")).toBeVisible()
    await expect(page.locator("header")).toBeVisible()
  })

  test("credenciales inválidas → no redirige a /dashboard", async ({ page }) => {
    await page.goto("/login")

    await page.fill("#username", "bogus")
    await page.fill("#password", "wrongpass")
    await page.click("button[type=submit]")

    // El interceptor de Axios redirige a /login via window.location.href
    // cuando recibe 401 sin refresh token, y el toast de error se pierde
    // en la navegación. Verificamos que NO se fue a /dashboard.
    await expect(page).toHaveURL("/login")
  })
})

test.describe("Sesión activa", () => {
  test("logout → /login; reintentar /dashboard redirige a /login", async ({ page }) => {
    await loginViaForm(page)

    await page.getByRole("button", { name: "Salir" }).click({ force: true })
    await page.waitForURL("/login")

    await page.goto("/dashboard")
    await page.waitForURL("/login")
  })

  test("token refresh en 401 mantiene sesión activa", async ({ page }) => {
    await loginViaForm(page)

    // Crear promesa que espera el refresh ANTES de navegar
    const refreshPromise = page.waitForResponse(
      (res) => res.url().includes("/auth/token/refresh/") && res.status() === 200,
    )

    // Interceptar el primer intento a cada endpoint y devolver 401 forzado
    const attempts = new Map<string, number>()
    await page.route("**/api/v1/**", async (route) => {
      const url = route.request().url()
      const path = url.split("/api/v1")[1]?.split("?")[0] ?? url
      if (path.startsWith("/auth/token/refresh")) {
        await route.continue()
        return
      }
      const count = attempts.get(path) ?? 0
      attempts.set(path, count + 1)
      if (count === 0) {
        await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ detail: "Token inválido" }) })
      } else {
        await route.continue()
      }
    })

    // Navegar a dashboard — los requests se interceptan con 401,
    // el interceptor refresca el token, y los reintentos pasan al backend real
    await page.goto("/dashboard")

    // Sidebar visible (no hubo redirect a /login)
    await expect(page.locator("aside")).toBeVisible({ timeout: 5000 })

    // Esperar a que ocurra el refresh
    await refreshPromise

    // Confirmar que seguimos en dashboard
    await expect(page).toHaveURL("/dashboard")
  })
})
