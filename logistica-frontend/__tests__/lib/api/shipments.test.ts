import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Shipment, ShipmentItem, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockShipment: Shipment = {
  id: 1, tracking_number: "SHP-00000001", customer: 1, driver: 1,
  transport: 1, route: 1, origin_warehouse: 1,
  destination_address: "Calle Principal 500", destination_city: "Bogotá",
  destination_country: "Colombia", status: "PENDING",
  estimated_delivery_date: "2024-06-15", actual_delivery_date: null,
  weight_total_kg: 100, base_cost: 250, calculated_cost: 275, notes: null,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  customer_name: "Cliente Test", origin_warehouse_name: "Almacén Central",
  driver_name: "Carlos Ruiz", transport_plate: "ABC-123", route_name: "Ruta Norte",
  items: [],
}

const mockItem: ShipmentItem = {
  id: 1, shipment: 1, product: 1, quantity: 5,
  unit_price_at_time: 29.99, subtotal: 149.95, product_name: "Widget Pro",
}

afterEach(() => server.resetHandlers())

describe("GET /shipments/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Shipment> = { count: 1, next: null, previous: null, results: [mockShipment] }
    server.use(http.get(`${BASE}/shipments/`, () => HttpResponse.json(page)))
    const { data, status } = await api.get<PaginatedResponse<Shipment>>("/shipments/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].tracking_number).toBe("SHP-00000001")
  })

  it("construye query string con search", async () => {
    let capturedUrl = ""
    server.use(http.get(`${BASE}/shipments/`, ({ request }) => {
      capturedUrl = request.url
      return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
    }))
    await api.get("/shipments/", { params: { search: "SHP-00" } })
    expect(capturedUrl).toContain("search=SHP-00")
  })
})

describe("GET /shipments/:id/ — retrieve", () => {
  it("devuelve un shipment por id", async () => {
    server.use(http.get(`${BASE}/shipments/:id/`, () => HttpResponse.json(mockShipment)))
    const { data } = await api.get<Shipment>("/shipments/1/")
    expect(data.tracking_number).toBe("SHP-00000001")
  })
})

describe("POST /shipments/ — create", () => {
  it("crea y devuelve el nuevo envío", async () => {
    const payload = {
      customer: 1, origin_warehouse: 1, driver: null, transport: null, route: null,
      destination_address: "Av. Siempre Viva", destination_city: "Medellín",
      destination_country: "Colombia", status: "PENDING" as const,
      estimated_delivery_date: null, weight_total_kg: 50, base_cost: 150, notes: null,
    }
    server.use(http.post(`${BASE}/shipments/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json(
        { ...(body as object), id: 2, tracking_number: "SHP-00000002", calculated_cost: 165, customer_name: "C", origin_warehouse_name: "W", driver_name: null, transport_plate: null, route_name: null, items: [], created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" } as Shipment,
        { status: 201 }
      )
    }))
    const { data, status } = await api.post<Shipment>("/shipments/", payload)
    expect(status).toBe(201)
    expect(data.tracking_number).toBe("SHP-00000002")
  })
})

describe("PATCH /shipments/:id/ — update", () => {
  it("actualiza parcialmente", async () => {
    server.use(http.patch(`${BASE}/shipments/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Shipment>
      return HttpResponse.json({ ...mockShipment, ...body })
    }))
    const { data } = await api.patch<Shipment>("/shipments/1/", { status: "CONFIRMED" })
    expect(data.status).toBe("CONFIRMED")
  })
})

describe("DELETE /shipments/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(http.delete(`${BASE}/shipments/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/shipments/1/")
    expect(status).toBe(204)
  })
})

describe("items nested endpoints", () => {
  it("GET /shipments/:id/items/ — lista items", async () => {
    server.use(http.get(`${BASE}/shipments/:id/items/`, () => HttpResponse.json([mockItem])))
    const { data } = await api.get<ShipmentItem[]>("/shipments/1/items/")
    expect(data).toHaveLength(1)
    expect(data[0].product_name).toBe("Widget Pro")
  })

  it("POST /shipments/:id/items/ — crea item", async () => {
    const payload = { product: 1, quantity: 3, unit_price_at_time: 29.99 }
    server.use(http.post(`${BASE}/shipments/:id/items/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({ ...(body as object), id: 2, shipment: 1, subtotal: 89.97, product_name: "W" }, { status: 201 })
    }))
    const { data, status } = await api.post<ShipmentItem>("/shipments/1/items/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(2)
  })

  it("DELETE /shipments/:id/items/:itemId/ — elimina item", async () => {
    server.use(http.delete(`${BASE}/shipments/:shipmentId/items/:itemId/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/shipments/1/items/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400 en shipments", async () => {
    server.use(http.post(`${BASE}/shipments/`, () => HttpResponse.json({ customer: ["Este campo es obligatorio."] }, { status: 400 })))
    await expect(api.post("/shipments/", {})).rejects.toThrow()
  })
  it("propaga 404 en items", async () => {
    server.use(http.get(`${BASE}/shipments/999/items/`, () => HttpResponse.json({ detail: "No encontrado." }, { status: 404 })))
    await expect(api.get("/shipments/999/items/")).rejects.toThrow()
  })
})
