import { describe, it, expect } from "vitest"
import { z } from "zod"

// Schema espejo del definido inline en create-dialog.tsx y edit-dialog.tsx
const customerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  customer_type: z.enum(["COMPANY", "INDIVIDUAL"]),
  tax_id: z.string().nullable(),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  country: z.string().min(1, "El país es requerido"),
})

const validPayload = {
  name: "Cliente S.A.",
  customer_type: "COMPANY" as const,
  tax_id: "123456789",
  email: "cliente@empresa.com",
  phone: "555-1000",
  address: "Av. Central 456",
  city: "Lima",
  country: "Perú",
}

describe("customerSchema", () => {
  it("acepta payload válido completo", () => {
    const result = customerSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it("acepta tax_id null", () => {
    const result = customerSchema.safeParse({ ...validPayload, tax_id: null })
    expect(result.success).toBe(true)
  })

  it("rechaza name vacío", () => {
    const result = customerSchema.safeParse({ ...validPayload, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true)
    }
  })

  it("rechaza email vacío", () => {
    const result = customerSchema.safeParse({ ...validPayload, email: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("email"))).toBe(true)
    }
  })

  it("rechaza email mal formado", () => {
    const result = customerSchema.safeParse({ ...validPayload, email: "not-an-email" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/inválido/i)
    }
  })

  it("rechaza customer_type inválido", () => {
    const result = customerSchema.safeParse({ ...validPayload, customer_type: "INVALID" })
    expect(result.success).toBe(false)
  })

  it("rechaza phone vacío", () => {
    const result = customerSchema.safeParse({ ...validPayload, phone: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza address vacía", () => {
    const result = customerSchema.safeParse({ ...validPayload, address: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza city vacía", () => {
    const result = customerSchema.safeParse({ ...validPayload, city: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza country vacío", () => {
    const result = customerSchema.safeParse({ ...validPayload, country: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza payload completamente vacío", () => {
    const result = customerSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
