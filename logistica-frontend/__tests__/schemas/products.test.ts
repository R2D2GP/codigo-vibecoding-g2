import { describe, it, expect } from "vitest"
import { z } from "zod"

const schema = z.object({
  supplier: z.coerce.number().min(1, "El proveedor es requerido"),
  warehouse: z.coerce.number().min(1, "El almacén es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  sku: z.string().min(1, "El SKU es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  description: z.string().nullable(),
  weight_kg: z.coerce.number().min(0, "Debe ser positivo"),
  width_cm: z.coerce.number().min(0, "Debe ser positivo"),
  height_cm: z.coerce.number().min(0, "Debe ser positivo"),
  depth_cm: z.coerce.number().min(0, "Debe ser positivo"),
  unit_price: z.coerce.number().min(0, "Debe ser positivo"),
  stock_quantity: z.coerce.number().int().min(0, "Debe ser positivo"),
})

const validPayload = {
  supplier: 1,
  warehouse: 2,
  name: "Widget Premium",
  sku: "WGT-002",
  category: "Electrónicos",
  description: "Widget mejorado",
  weight_kg: 0.75,
  width_cm: 15,
  height_cm: 8,
  depth_cm: 4,
  unit_price: 39.99,
  stock_quantity: 75,
}

describe("productSchema", () => {
  it("acepta payload válido completo", () => {
    expect(schema.safeParse(validPayload).success).toBe(true)
  })

  it("coercea supplier string a number", () => {
    const result = schema.safeParse({ ...validPayload, supplier: "3" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.supplier).toBe(3)
  })

  it("coercea stock_quantity string a number", () => {
    const result = schema.safeParse({ ...validPayload, stock_quantity: "50" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.stock_quantity).toBe(50)
  })

  it("rechaza stock_quantity no entero", () => {
    const result = schema.safeParse({ ...validPayload, stock_quantity: 1.5 })
    expect(result.success).toBe(false)
  })

  it("acepta description null", () => {
    expect(schema.safeParse({ ...validPayload, description: null }).success).toBe(true)
  })

  it("rechaza supplier 0", () => {
    expect(schema.safeParse({ ...validPayload, supplier: 0 }).success).toBe(false)
  })

  it("rechaza warehouse 0", () => {
    expect(schema.safeParse({ ...validPayload, warehouse: 0 }).success).toBe(false)
  })

  it("rechaza name vacío", () => {
    expect(schema.safeParse({ ...validPayload, name: "" }).success).toBe(false)
  })

  it("rechaza sku vacío", () => {
    expect(schema.safeParse({ ...validPayload, sku: "" }).success).toBe(false)
  })

  it("rechaza category vacía", () => {
    expect(schema.safeParse({ ...validPayload, category: "" }).success).toBe(false)
  })

  it("rechaza weight_kg negativo", () => {
    expect(schema.safeParse({ ...validPayload, weight_kg: -1 }).success).toBe(false)
  })

  it("rechaza unit_price negativo", () => {
    expect(schema.safeParse({ ...validPayload, unit_price: -5 }).success).toBe(false)
  })

  it("rechaza payload vacío", () => {
    expect(schema.safeParse({}).success).toBe(false)
  })
})
