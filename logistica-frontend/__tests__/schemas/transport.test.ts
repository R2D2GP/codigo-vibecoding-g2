import { describe, it, expect } from "vitest"
import { z } from "zod"

const schema = z.object({
  plate_number: z.string().min(1, "La placa es requerida"),
  transport_type: z.enum(["TRUCK", "VAN", "MOTORCYCLE", "CARGO_BIKE"]),
  brand: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  year: z.coerce.number().int().min(1900, "Año inválido").max(2100, "Año inválido"),
  capacity_kg: z.coerce.number().min(0, "Debe ser positivo"),
  capacity_m3: z.coerce.number().min(0, "Debe ser positivo"),
  is_available: z.boolean().default(true),
})

const validPayload = {
  plate_number: "ABC-123",
  transport_type: "TRUCK" as const,
  brand: "Toyota",
  model: "Hilux",
  year: 2020,
  capacity_kg: 1500,
  capacity_m3: 8,
  is_available: true,
}

describe("transportSchema", () => {
  it("acepta payload válido completo", () => {
    expect(schema.safeParse(validPayload).success).toBe(true)
  })

  it("usa default is_available true cuando se omite", () => {
    const { is_available, ...rest } = validPayload
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.is_available).toBe(true)
  })

  it("acepta todos los transport_type", () => {
    for (const t of ["TRUCK", "VAN", "MOTORCYCLE", "CARGO_BIKE"] as const) {
      expect(schema.safeParse({ ...validPayload, transport_type: t }).success).toBe(true)
    }
  })

  it("rechaza transport_type inválido", () => {
    expect(schema.safeParse({ ...validPayload, transport_type: "INVALID" }).success).toBe(false)
  })

  it("coercea year string a number", () => {
    const result = schema.safeParse({ ...validPayload, year: "2021" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.year).toBe(2021)
  })

  it("rechaza year < 1900", () => {
    expect(schema.safeParse({ ...validPayload, year: 1899 }).success).toBe(false)
  })

  it("rechaza year > 2100", () => {
    expect(schema.safeParse({ ...validPayload, year: 2101 }).success).toBe(false)
  })

  it("rechaza year no entero", () => {
    expect(schema.safeParse({ ...validPayload, year: 2020.5 }).success).toBe(false)
  })

  it("rechaza plate_number vacío", () => {
    expect(schema.safeParse({ ...validPayload, plate_number: "" }).success).toBe(false)
  })

  it("rechaza brand vacía", () => {
    expect(schema.safeParse({ ...validPayload, brand: "" }).success).toBe(false)
  })

  it("rechaza model vacío", () => {
    expect(schema.safeParse({ ...validPayload, model: "" }).success).toBe(false)
  })

  it("rechaza capacity_kg negativo", () => {
    expect(schema.safeParse({ ...validPayload, capacity_kg: -1 }).success).toBe(false)
  })

  it("rechaza capacity_m3 negativo", () => {
    expect(schema.safeParse({ ...validPayload, capacity_m3: -5 }).success).toBe(false)
  })

  it("rechaza payload vacío", () => {
    expect(schema.safeParse({}).success).toBe(false)
  })
})
