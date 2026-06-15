import { test as setup, expect } from "@playwright/test"
import path from "path"

const AUTH_FILE = path.resolve(__dirname, "../playwright/.auth/user.json")
const SESSION_FILE = path.resolve(__dirname, "../playwright/.auth/session.json")
const API_BASE = "http://localhost:8000/api/v1"
const USERNAME = process.env.E2E_USERNAME || "testuser"
const PASSWORD = process.env.E2E_PASSWORD || "testpass123"

setup("autenticar y guardar storageState + sessionStorage", async ({ page, request }) => {
  const res = await request.post(`${API_BASE}/auth/token/`, {
    data: { username: USERNAME, password: PASSWORD },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()

  const authState = JSON.stringify({
    state: {
      accessToken: body.access,
      refreshToken: body.refresh,
      user: {
        id: body.user_id,
        username: body.username,
        email: body.email ?? "",
        first_name: body.first_name ?? "",
        last_name: body.last_name ?? "",
        is_superadmin: body.is_superadmin ?? false,
        permissions: body.permissions ?? [],
      },
    },
    version: 0,
  })

  // navegar para establecer origin y poder setear sessionStorage
  await page.goto("/login")
  await page.evaluate((data) => {
    sessionStorage.setItem("auth-storage", data)
  }, authState)

  // guardar storageState (contiene cookies + localStorage,
  // NO sessionStorage — lo persistimos aparte)
  await page.context().storageState({ path: AUTH_FILE })

  // guardar sessionStorage aparte para restaurarlo via fixtures
  const { writeFileSync } = await import("fs")
  writeFileSync(
    SESSION_FILE,
    JSON.stringify({ key: "auth-storage", value: authState }),
    "utf-8"
  )
})
