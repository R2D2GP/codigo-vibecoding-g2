import { describe, it, expect } from "vitest"
import { loginSchema } from "@/lib/schemas/login"

describe("loginSchema", () => {
  it("rechaza username vacío", () => {
    const result = loginSchema.safeParse({ username: "", password: "secret" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/obligatorio/i)
    }
  })

  it("rechaza password vacío", () => {
    const result = loginSchema.safeParse({ username: "user", password: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password")
      expect(result.error.issues[0].message).toMatch(/obligatoria/i)
    }
  })

  it("rechaza ambos vacíos", () => {
    const result = loginSchema.safeParse({ username: "", password: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(1)
    }
  })

  it("acepta credenciales válidas", () => {
    const result = loginSchema.safeParse({ username: "admin", password: "pass123" })
    expect(result.success).toBe(true)
  })
})
