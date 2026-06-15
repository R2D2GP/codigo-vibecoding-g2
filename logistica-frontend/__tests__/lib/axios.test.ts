import { describe, it, expect, afterEach, vi } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"

const BASE = "http://localhost:8000/api/v1"

afterEach(() => {
  localStorage.clear()
  server.resetHandlers()
  vi.restoreAllMocks()
})

describe("request interceptor", () => {
  it("agrega Authorization header cuando hay token", async () => {
    localStorage.setItem("logistica_access_token", "my-token")

    let capturedAuth: string | undefined
    server.use(
      http.get(`${BASE}/test`, (req) => {
        capturedAuth = req.request.headers.get("Authorization") ?? undefined
        return HttpResponse.json({ ok: true })
      })
    )

    await api.get("/test")
    expect(capturedAuth).toBe("Bearer my-token")
  })

  it("no agrega Authorization cuando no hay token", async () => {
    let capturedAuth: string | undefined
    server.use(
      http.get(`${BASE}/test`, (req) => {
        capturedAuth = req.request.headers.get("Authorization") ?? undefined
        return HttpResponse.json({ ok: true })
      })
    )

    await api.get("/test")
    expect(capturedAuth).toBeUndefined()
  })
})

describe("response interceptor — refresh + retry", () => {
  it("reintenta con nuevo token tras 401 y refresh exitoso", async () => {
    localStorage.setItem("logistica_access_token", "expired-token")
    localStorage.setItem("logistica_refresh_token", "valid-refresh")

    let callCount = 0
    let secondCallAuth: string | undefined

    server.use(
      http.get(`${BASE}/data`, (req) => {
        callCount++
        if (callCount === 1) {
          return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        secondCallAuth = req.request.headers.get("Authorization") ?? undefined
        return HttpResponse.json({ data: "ok" })
      }),
      http.post(`${BASE}/auth/token/refresh/`, async () => {
        return HttpResponse.json({ access: "new-access-token" })
      })
    )

    const response = await api.get("/data")
    expect(response.data).toEqual({ data: "ok" })
    expect(callCount).toBe(2)
    expect(secondCallAuth).toBe("Bearer new-access-token")
    expect(localStorage.getItem("logistica_access_token")).toBe("new-access-token")
  })

  it("redirige a /login cuando no hay refresh token", async () => {
    localStorage.setItem("logistica_access_token", "expired-token")
    // no refresh token

    let redirectUrl = ""
    vi.spyOn(window, "location", "get").mockReturnValue({
      get href() { return redirectUrl || "http://localhost:3000/" },
      set href(v: string) { redirectUrl = v },
      ancestorOrigins: [] as unknown as DOMStringList,
      assign: () => {},
      reload: () => {},
      replace: (u: string) => { redirectUrl = u },
      toString: () => redirectUrl,
      protocol: "http:",
      host: "localhost:3000",
      hostname: "localhost",
      port: "3000",
      pathname: "/",
      search: "",
      hash: "",
      origin: "http://localhost:3000",
    } as unknown as Location)

    server.use(
      http.get(`${BASE}/data`, () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
      })
    )

    await expect(api.get("/data")).rejects.toThrow()
    expect(redirectUrl).toBe("/login")
    expect(localStorage.getItem("logistica_access_token")).toBeNull()
    expect(localStorage.getItem("logistica_refresh_token")).toBeNull()
  })

  it("redirige a /login cuando el refresh falla", async () => {
    localStorage.setItem("logistica_access_token", "expired-token")
    localStorage.setItem("logistica_refresh_token", "bad-refresh")

    let redirectUrl = ""
    vi.spyOn(window, "location", "get").mockReturnValue({
      get href() { return redirectUrl || "http://localhost:3000/" },
      set href(v: string) { redirectUrl = v },
      ancestorOrigins: [] as unknown as DOMStringList,
      assign: () => {},
      reload: () => {},
      replace: (u: string) => { redirectUrl = u },
      toString: () => redirectUrl,
      protocol: "http:",
      host: "localhost:3000",
      hostname: "localhost",
      port: "3000",
      pathname: "/",
      search: "",
      hash: "",
      origin: "http://localhost:3000",
    } as unknown as Location)

    server.use(
      http.get(`${BASE}/data`, () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
      }),
      http.post(`${BASE}/auth/token/refresh/`, () => {
        return HttpResponse.json({ detail: "Invalid token" }, { status: 401 })
      })
    )

    await expect(api.get("/data")).rejects.toThrow()
    expect(redirectUrl).toBe("/login")
    expect(localStorage.getItem("logistica_access_token")).toBeNull()
  })

  it("no entra en bucle infinito (flag _retry)", async () => {
    localStorage.setItem("logistica_access_token", "expired-token")
    localStorage.setItem("logistica_refresh_token", "still-valid")

    let refreshCount = 0
    let dataCallCount = 0

    server.use(
      http.get(`${BASE}/data`, () => {
        dataCallCount++
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
      }),
      http.post(`${BASE}/auth/token/refresh/`, () => {
        refreshCount++
        return HttpResponse.json({ access: "still-bad" })
      })
    )

    // 1st 401 → refresh ok → retry → 2nd 401 → _retry true → no refresh → reject
    await expect(api.get("/data")).rejects.toThrow()
    expect(refreshCount).toBe(1)
    expect(dataCallCount).toBe(2)
  })
})
