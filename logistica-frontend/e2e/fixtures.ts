import { test as base, expect } from "@playwright/test"

const API_HOST = "http://localhost:8000"
const API_PREFIX = "/api/v1"
const USERNAME = process.env.E2E_USERNAME || "testuser"
const PASSWORD = process.env.E2E_PASSWORD || "testpass123"

type ApiHelpers = {
  seed: (endpoint: string, payload: Record<string, unknown>) => Promise<number>
  remove: (endpoint: string, id: number) => Promise<void>
  list: (endpoint: string) => Promise<any[]>
  listAll: (endpoint: string) => Promise<any[]>
}

export const test = base.extend<{ api: ApiHelpers }>({
  page: async ({ page }, use) => {
    // get fresh token via API
    const { request } = await import("@playwright/test")
    const ctx = await (request as any).newContext({ baseURL: API_HOST })
    const res = await ctx.post(`${API_PREFIX}/auth/token/`, {
      data: { username: USERNAME, password: PASSWORD },
    })
    const body = await res.json()

    // inject Zustand state into sessionStorage + localStorage tokens
    const authValue = {
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
    }
    await page.addInitScript((data: typeof authValue) => {
      sessionStorage.setItem("auth-storage", JSON.stringify(data))
      localStorage.setItem("logistica_access_token", data.state.accessToken)
      localStorage.setItem("logistica_refresh_token", data.state.refreshToken)
    }, authValue)

    // Bypass hydration mismatch: navigate to login, submit form to properly
    // set Zustand store, then forward to target page
    await page.goto("/login")
    await page.getByPlaceholder("Ingresa tu usuario").fill(USERNAME)
    await page.getByPlaceholder("Ingresa tu contraseña").fill(PASSWORD)
    await page.getByRole("button", { name: "Ingresar" }).click()
    // Wait for navigation to /dashboard after successful login
    await page.waitForURL("**/dashboard", { timeout: 10000 })
    // Now Zustand store has the token via proper login flow
    await use(page)
  },

  api: async ({}, use) => {
    const { request } = await import("@playwright/test")
    const ctx = await (request as any).newContext({ baseURL: API_HOST })
    let token: string | null = null

    async function ensureToken() {
      if (!token) {
        const res = await ctx.post(`${API_PREFIX}/auth/token/`, {
          data: { username: USERNAME, password: PASSWORD },
        })
        const body = await res.json()
        token = body.access
      }
      return token
    }

    const helpers: ApiHelpers = {
      seed: async (endpoint, payload) => {
        const t = await ensureToken()
        const res = await ctx.post(`${API_PREFIX}${endpoint}`, {
          data: payload,
          headers: { Authorization: `Bearer ${t}` },
        })
        const body = await res.json()
        if (!res.ok()) throw new Error(`seed ${endpoint}: ${res.status()} ${JSON.stringify(body)}`)
        return body.id
      },

      remove: async (endpoint, id) => {
        const t = await ensureToken()
        const res = await ctx.delete(`${API_PREFIX}${endpoint}${id}/`, {
          headers: { Authorization: `Bearer ${t}` },
        })
        if (!res.ok() && res.status() !== 404) {
          throw new Error(`remove ${endpoint}${id}: ${res.status()}`)
        }
      },

      list: async (endpoint) => {
        const t = await ensureToken()
        const res = await ctx.get(`${API_PREFIX}${endpoint}`, {
          headers: { Authorization: `Bearer ${t}` },
        })
        if (!res.ok()) throw new Error(`list ${endpoint}: ${res.status()}`)
        const body = await res.json()
        return body.results ?? body
      },

      listAll: async (endpoint: string) => {
        const t = await ensureToken()
        const all: any[] = []
        let url: string | null = `${API_PREFIX}${endpoint}`
        while (url) {
          const res: Awaited<ReturnType<typeof ctx.get>> = await ctx.get(url, {
            headers: { Authorization: `Bearer ${t}` },
          })
          if (!res.ok()) throw new Error(`listAll ${endpoint}: ${res.status()}`)
          const body = await res.json()
          all.push(...(body.results ?? body))
          url = body.next
        }
        return all
      },
    }

    await use(helpers)
  },
})

export { expect }

export const ENDPOINT = "/warehouses/"

let _counter = 0
export function unique(): string {
  _counter++
  return `E2E-${Date.now()}-${_counter}`
}
