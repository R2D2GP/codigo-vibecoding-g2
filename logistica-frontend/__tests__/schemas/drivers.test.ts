import { describe, it, expect } from "vitest"
import { z } from "zod"

const schema = z.object({
  user: z.coerce.number().min(1, "ID de usuario requerido"),
  transport: z.coerce.number().nullable(),
  license_number: z.string().min(1, "El número de licencia es requerido"),
  license_expiry: z.string().min(1, "La fecha de vencimiento es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
})

const validPayload = {
  user: 1,
  transport: 1,
  license_number: "LIC-12345",
  license_expiry: "2026-12-31",
  phone: "555-5000",
}

describe("driverSchema", () => {
  it("acepta payload válido completo", () => {
    expect(schema.safeParse(validPayload).success).toBe(true)
  })

  it("acepta transport null", () => {
    expect(schema.safeParse({ ...validPayload, transport: null }).success).toBe(true)
  })

  it("coercea user string a number", () => {
    const result = schema.safeParse({ ...validPayload, user: "5" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.user).toBe(5)
  })

  it("rechaza user 0", () => {
    expect(schema.safeParse({ ...validPayload, user: 0 }).success).toBe(false)
  })

  it("rechaza license_number vacío", () => {
    expect(schema.safeParse({ ...validPayload, license_number: "" }).success).toBe(false)
  })

  it("rechaza license_expiry vacío", () => {
    expect(schema.safeParse({ ...validPayload, license_expiry: "" }).success).toBe(false)
  })

  it("rechaza phone vacío", () => {
    expect(schema.safeParse({ ...validPayload, phone: "" }).success).toBe(false)
  })

  it("rechaza payload vacío", () => {
    expect(schema.safeParse({}).success).toBe(false)
  })
})
