import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Product, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockProduct: Product = {
  id: 1,
  supplier: 1,
  warehouse: 1,
  name: "Widget Pro",
  sku: "WGT-001",
  description: "Widget de alta calidad",
  category: "Electrónicos",
  weight_kg: 0.5,
  width_cm: 10,
  height_cm: 5,
  depth_cm: 3,
  unit_price: 29.99,
  stock_quantity: 100,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  supplier_name: "Proveedor Principal",
  warehouse_name: "Almacén Central",
}

afterEach(() => server.resetHandlers())

describe("GET /products/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Product> = { count: 1, next: null, previous: null, results: [mockProduct] }
    server.use(http.get(`${BASE}/products/`, () => HttpResponse.json(page)))
    const { data, status } = await api.get<PaginatedResponse<Product>>("/products/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].name).toBe("Widget Pro")
  })

  it("construye query string con search y page", async () => {
    let capturedUrl = ""
    server.use(
      http.get(`${BASE}/products/`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      })
    )
    await api.get("/products/", { params: { search: "widget", page: 1 } })
    expect(capturedUrl).toContain("search=widget")
    expect(capturedUrl).toContain("page=1")
  })
})

describe("GET /products/:id/ — retrieve", () => {
  it("devuelve un product por id", async () => {
    server.use(http.get(`${BASE}/products/:id/`, () => HttpResponse.json(mockProduct)))
    const { data } = await api.get<Product>("/products/1/")
    expect(data.id).toBe(1)
    expect(data.sku).toBe("WGT-001")
  })
})

describe("POST /products/ — create", () => {
  it("crea y devuelve el nuevo producto", async () => {
    const payload = {
      supplier: 1,
      warehouse: 2,
      name: "Nuevo Producto",
      sku: "NWP-001",
      description: null,
      category: "Hogar",
      weight_kg: 1,
      width_cm: 20,
      height_cm: 10,
      depth_cm: 5,
      unit_price: 49.99,
      stock_quantity: 50,
    }
    server.use(
      http.post(`${BASE}/products/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, supplier_name: "Proveedor A", warehouse_name: "Almacén B", is_active: true, created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" } as Product,
          { status: 201 }
        )
      })
    )
    const { data, status } = await api.post<Product>("/products/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(2)
    expect(data.name).toBe("Nuevo Producto")
  })
})

describe("PATCH /products/:id/ — update", () => {
  it("actualiza parcialmente y devuelve el resultado", async () => {
    server.use(
      http.patch(`${BASE}/products/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Product>
        return HttpResponse.json({ ...mockProduct, ...body })
      })
    )
    const { data } = await api.patch<Product>("/products/1/", { unit_price: 19.99 })
    expect(data.unit_price).toBe(19.99)
  })
})

describe("DELETE /products/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(http.delete(`${BASE}/products/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/products/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400", async () => {
    server.use(http.post(`${BASE}/products/`, () => HttpResponse.json({ name: ["Este campo es obligatorio."] }, { status: 400 })))
    await expect(api.post("/products/", {})).rejects.toThrow()
  })

  it("propaga 404", async () => {
    server.use(http.get(`${BASE}/products/999/`, () => HttpResponse.json({ detail: "No encontrado." }, { status: 404 })))
    await expect(api.get("/products/999/")).rejects.toThrow()
  })
})
