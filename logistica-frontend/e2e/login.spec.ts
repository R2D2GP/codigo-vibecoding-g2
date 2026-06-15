import { test, expect } from "@playwright/test"

const API_BASE = "http://localhost:8000/api/v1"
const USERNAME = process.env.E2E_USERNAME || "testuser"
const PASSWORD = process.env.E2E_PASSWORD || "testpass123"

test.describe("Login", () => {
  test("credenciales válidas redirigen a /dashboard", async ({ page }) => {
    await page.goto("/login")

    await page.fill("#username", USERNAME)
    await page.fill("#password", PASSWORD)
    await page.click("button[type=submit]")

    await page.waitForURL("/dashboard")
    await expect(page.locator("h1")).toContainText("Dashboard")
  })

  test("credenciales inválidas no redirigen a /dashboard", async ({ page }) => {
    await page.goto("/login")

    await page.fill("#username", "bogus")
    await page.fill("#password", "wrongpass")
    await page.click("button[type=submit]")

    // El interceptor redirige a /login via window.location.href al recibir 401
    // sin refresh token, impidiendo que el toast se renderice.
    await expect(page).toHaveURL("/login")
  })
})
