import { describe, it, expect } from "vitest"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  origin_warehouse: z.coerce.number().min(1, "El almacén es requerido"),
  estimated_duration_hours: z.coerce.number().min(0, "Debe ser positivo"),
  estimated_distance_km: z.coerce.number().min(0, "Debe ser positivo"),
})

const validPayload = {
  name: "Ruta Norte",
  origin_warehouse: 1,
  estimated_duration_hours: 2.5,
  estimated_distance_km: 120,
}

describe("routeSchema", () => {
  it("acepta payload válido completo", () => {
    expect(schema.safeParse(validPayload).success).toBe(true)
  })

  it("coercea origin_warehouse string a number", () => {
    const result = schema.safeParse({ ...validPayload, origin_warehouse: "3" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.origin_warehouse).toBe(3)
  })

  it("coercea estimated_duration_hours string a number", () => {
    const result = schema.safeParse({ ...validPayload, estimated_duration_hours: "4" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.estimated_duration_hours).toBe(4)
  })

  it("rechaza origin_warehouse 0", () => {
    expect(schema.safeParse({ ...validPayload, origin_warehouse: 0 }).success).toBe(false)
  })

  it("rechaza name vacío", () => {
    expect(schema.safeParse({ ...validPayload, name: "" }).success).toBe(false)
  })

  it("rechaza estimated_duration_hours negativo", () => {
    expect(schema.safeParse({ ...validPayload, estimated_duration_hours: -1 }).success).toBe(false)
  })

  it("rechaza estimated_distance_km negativo", () => {
    expect(schema.safeParse({ ...validPayload, estimated_distance_km: -10 }).success).toBe(false)
  })

  it("rechaza payload vacío", () => {
    expect(schema.safeParse({}).success).toBe(false)
  })
})
