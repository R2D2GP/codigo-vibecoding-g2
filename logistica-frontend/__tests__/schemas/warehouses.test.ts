import { describe, it, expect } from "vitest"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  country: z.string().min(1, "El país es requerido").default("Colombia"),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  capacity_m3: z.coerce.number().min(0, "Debe ser positivo"),
})

const validPayload = {
  name: "Almacén Norte",
  address: "Av. Siempre Viva 742",
  city: "Lima",
  country: "Perú",
  latitude: -12.0464,
  longitude: -77.0428,
  capacity_m3: 2500,
}

describe("warehouseSchema", () => {
  it("acepta payload válido completo", () => {
    const result = schema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it("usa default Colombia cuando country se omite", () => {
    const { country, ...rest } = validPayload
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.country).toBe("Colombia")
    }
  })

  it("acepta latitude y longitude null", () => {
    const result = schema.safeParse({ ...validPayload, latitude: null, longitude: null })
    expect(result.success).toBe(true)
  })

  it("coercea latitude string a number", () => {
    const result = schema.safeParse({ ...validPayload, latitude: "4.5" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.latitude).toBe(4.5)
    }
  })

  it("rechaza name vacío", () => {
    const result = schema.safeParse({ ...validPayload, name: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza address vacía", () => {
    const result = schema.safeParse({ ...validPayload, address: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza city vacía", () => {
    const result = schema.safeParse({ ...validPayload, city: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza country vacío cuando se envía", () => {
    const result = schema.safeParse({ ...validPayload, country: "" })
    expect(result.success).toBe(false)
  })

  it("rechaza capacity_m3 negativo", () => {
    const result = schema.safeParse({ ...validPayload, capacity_m3: -1 })
    expect(result.success).toBe(false)
  })

  it("coercea capacity_m3 string a number", () => {
    const result = schema.safeParse({ ...validPayload, capacity_m3: "3000" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.capacity_m3).toBe(3000)
    }
  })

  it("rechaza payload completamente vacío", () => {
    const result = schema.safeParse({})
    expect(result.success).toBe(false)
  })
})
