import { describe, it, expect } from "vitest"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  tax_id: z.string().nullable(),
  contact_name: z.string().min(1, "El nombre de contacto es requerido"),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  country: z.string().min(1, "El país es requerido").default("Colombia"),
})

const validPayload = {
  name: "Proveedor S.A.S.",
  tax_id: "123456789-0",
  contact_name: "Carlos López",
  email: "carlos@proveedor.com",
  phone: "555-4000",
  address: "Av. del Comercio 50",
  city: "Cali",
  country: "Colombia",
}

describe("supplierSchema", () => {
  it("acepta payload válido completo", () => {
    expect(schema.safeParse(validPayload).success).toBe(true)
  })

  it("usa default Colombia cuando country se omite", () => {
    const { country, ...rest } = validPayload
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.country).toBe("Colombia")
  })

  it("acepta tax_id null", () => {
    expect(schema.safeParse({ ...validPayload, tax_id: null }).success).toBe(true)
  })

  it("rechaza name vacío", () => {
    expect(schema.safeParse({ ...validPayload, name: "" }).success).toBe(false)
  })

  it("rechaza contact_name vacío", () => {
    expect(schema.safeParse({ ...validPayload, contact_name: "" }).success).toBe(false)
  })

  it("rechaza email vacío", () => {
    expect(schema.safeParse({ ...validPayload, email: "" }).success).toBe(false)
  })

  it("rechaza email mal formado", () => {
    const result = schema.safeParse({ ...validPayload, email: "bad-email" })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toMatch(/inválido/i)
  })

  it("rechaza phone vacío", () => {
    expect(schema.safeParse({ ...validPayload, phone: "" }).success).toBe(false)
  })

  it("rechaza address vacía", () => {
    expect(schema.safeParse({ ...validPayload, address: "" }).success).toBe(false)
  })

  it("rechaza city vacía", () => {
    expect(schema.safeParse({ ...validPayload, city: "" }).success).toBe(false)
  })

  it("rechaza country vacío cuando se envía", () => {
    expect(schema.safeParse({ ...validPayload, country: "" }).success).toBe(false)
  })

  it("rechaza payload vacío", () => {
    expect(schema.safeParse({}).success).toBe(false)
  })
})
