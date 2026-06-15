import { describe, it, expect } from "vitest"
import { z } from "zod"

const schema = z.object({
  customer: z.coerce.number().min(1, "El cliente es requerido"),
  origin_warehouse: z.coerce.number().min(1, "El almacén es requerido"),
  driver: z.coerce.number().nullable(),
  transport: z.coerce.number().nullable(),
  route: z.coerce.number().nullable(),
  destination_address: z.string().min(1, "La dirección es requerida"),
  destination_city: z.string().min(1, "La ciudad es requerida"),
  destination_country: z.string().min(1, "El país es requerido").default("Colombia"),
  status: z.enum(["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED", "RETURNED"]).default("PENDING"),
  estimated_delivery_date: z.string().nullable(),
  weight_total_kg: z.coerce.number().min(0, "Debe ser positivo").default(0),
  base_cost: z.coerce.number().min(0, "Debe ser positivo").default(0),
  notes: z.string().nullable(),
})

const validPayload = {
  customer: 1,
  origin_warehouse: 1,
  driver: null,
  transport: null,
  route: null,
  destination_address: "Calle Principal 500",
  destination_city: "Bogotá",
  destination_country: "Colombia",
  status: "PENDING" as const,
  estimated_delivery_date: null,
  weight_total_kg: 100,
  base_cost: 250,
  notes: null,
}

describe("shipmentSchema", () => {
  it("acepta payload válido completo", () => {
    expect(schema.safeParse(validPayload).success).toBe(true)
  })

  it("usa default Colombia y PENDING cuando se omiten", () => {
    const { destination_country, status, ...rest } = validPayload
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.destination_country).toBe("Colombia")
      expect(result.data.status).toBe("PENDING")
    }
  })

  it("usa default 0 para weight_total_kg y base_cost cuando se omiten", () => {
    const { weight_total_kg, base_cost, ...rest } = validPayload
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.weight_total_kg).toBe(0)
      expect(result.data.base_cost).toBe(0)
    }
  })

  it("acepta driver, transport, route con valores numéricos", () => {
    const result = schema.safeParse({ ...validPayload, driver: 2, transport: 3, route: 4 })
    expect(result.success).toBe(true)
  })

  it("acepta estimated_delivery_date con valor", () => {
    const result = schema.safeParse({ ...validPayload, estimated_delivery_date: "2024-12-31" })
    expect(result.success).toBe(true)
  })

  it("acepta notes con texto", () => {
    const result = schema.safeParse({ ...validPayload, notes: "Frágil" })
    expect(result.success).toBe(true)
  })

  it("rechaza status inválido", () => {
    expect(schema.safeParse({ ...validPayload, status: "INVALID" }).success).toBe(false)
  })

  it("rechaza customer 0", () => {
    expect(schema.safeParse({ ...validPayload, customer: 0 }).success).toBe(false)
  })

  it("rechaza origin_warehouse 0", () => {
    expect(schema.safeParse({ ...validPayload, origin_warehouse: 0 }).success).toBe(false)
  })

  it("rechaza destination_address vacía", () => {
    expect(schema.safeParse({ ...validPayload, destination_address: "" }).success).toBe(false)
  })

  it("rechaza destination_city vacía", () => {
    expect(schema.safeParse({ ...validPayload, destination_city: "" }).success).toBe(false)
  })

  it("rechaza destination_country vacío cuando se envía", () => {
    expect(schema.safeParse({ ...validPayload, destination_country: "" }).success).toBe(false)
  })

  it("rechaza weight_total_kg negativo", () => {
    expect(schema.safeParse({ ...validPayload, weight_total_kg: -1 }).success).toBe(false)
  })

  it("rechaza base_cost negativo", () => {
    expect(schema.safeParse({ ...validPayload, base_cost: -10 }).success).toBe(false)
  })

  it("rechaza payload vacío", () => {
    expect(schema.safeParse({}).success).toBe(false)
  })
})
