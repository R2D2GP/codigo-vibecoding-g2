import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
} from "@/lib/auth"

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe("getAccessToken / getRefreshToken", () => {
  it("devuelve null cuando localStorage está vacío", () => {
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it("devuelve el valor desde localStorage", () => {
    localStorage.setItem("logistica_access_token", "acc-123")
    localStorage.setItem("logistica_refresh_token", "ref-456")
    expect(getAccessToken()).toBe("acc-123")
    expect(getRefreshToken()).toBe("ref-456")
  })
})

describe("setTokens", () => {
  it("guarda access y refresh", () => {
    setTokens("access-token", "refresh-token")
    expect(localStorage.getItem("logistica_access_token")).toBe("access-token")
    expect(localStorage.getItem("logistica_refresh_token")).toBe("refresh-token")
  })

  it("guarda solo access cuando refresh no se envía", () => {
    setTokens("access-only")
    expect(localStorage.getItem("logistica_access_token")).toBe("access-only")
    expect(localStorage.getItem("logistica_refresh_token")).toBeNull()
  })

  it("guarda solo refresh cuando access no se envía", () => {
    setTokens(undefined, "refresh-only")
    expect(localStorage.getItem("logistica_access_token")).toBeNull()
    expect(localStorage.getItem("logistica_refresh_token")).toBe("refresh-only")
  })

  it("no sobreescribe el que no se envía", () => {
    localStorage.setItem("logistica_access_token", "existing-access")
    setTokens(undefined, "new-refresh")
    expect(localStorage.getItem("logistica_access_token")).toBe("existing-access")
    expect(localStorage.getItem("logistica_refresh_token")).toBe("new-refresh")
  })
})

describe("clearTokens", () => {
  it("elimina ambos tokens", () => {
    localStorage.setItem("logistica_access_token", "a")
    localStorage.setItem("logistica_refresh_token", "r")
    clearTokens()
    expect(localStorage.getItem("logistica_access_token")).toBeNull()
    expect(localStorage.getItem("logistica_refresh_token")).toBeNull()
  })
})

describe("isAuthenticated", () => {
  it("retorna true con token válido", () => {
    localStorage.setItem("logistica_access_token", "valid")
    expect(isAuthenticated()).toBe(true)
  })

  it("retorna false cuando el token es null", () => {
    expect(isAuthenticated()).toBe(false)
  })

  it("retorna false cuando el token es string vacío", () => {
    localStorage.setItem("logistica_access_token", "")
    expect(isAuthenticated()).toBe(false)
  })
})

describe("guards SSR", () => {
  it("getAccessToken retorna null sin window", () => {
    const origWindow = globalThis.window
    vi.stubGlobal("window", undefined)
    expect(getAccessToken()).toBeNull()
    vi.stubGlobal("window", origWindow)
  })

  it("getRefreshToken retorna null sin window", () => {
    const origWindow = globalThis.window
    vi.stubGlobal("window", undefined)
    expect(getRefreshToken()).toBeNull()
    vi.stubGlobal("window", origWindow)
  })

  it("setTokens no falla sin window", () => {
    const origWindow = globalThis.window
    vi.stubGlobal("window", undefined)
    expect(() => setTokens("x", "y")).not.toThrow()
    vi.stubGlobal("window", origWindow)
  })

  it("clearTokens no falla sin window", () => {
    const origWindow = globalThis.window
    vi.stubGlobal("window", undefined)
    expect(() => clearTokens()).not.toThrow()
    vi.stubGlobal("window", origWindow)
  })

  it("isAuthenticated retorna false sin window", () => {
    const origWindow = globalThis.window
    vi.stubGlobal("window", undefined)
    expect(isAuthenticated()).toBe(false)
    vi.stubGlobal("window", origWindow)
  })
})
