import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Warehouse, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockWarehouse: Warehouse = {
  id: 1,
  name: "Almacén Central",
  address: "Av. Industrial 500",
  city: "Bogotá",
  country: "Colombia",
  latitude: 4.711,
  longitude: -74.0721,
  capacity_m3: 5000,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

afterEach(() => server.resetHandlers())

describe("GET /warehouses/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Warehouse> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockWarehouse],
    }
    server.use(http.get(`${BASE}/warehouses/`, () => HttpResponse.json(page)))

    const { data, status } = await api.get<PaginatedResponse<Warehouse>>("/warehouses/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].name).toBe("Almacén Central")
  })

  it("construye query string con search y page", async () => {
    let capturedUrl = ""
    server.use(
      http.get(`${BASE}/warehouses/`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      })
    )

    await api.get("/warehouses/", { params: { search: "central", page: 2 } })
    expect(capturedUrl).toContain("search=central")
    expect(capturedUrl).toContain("page=2")
  })
})

describe("GET /warehouses/:id/ — retrieve", () => {
  it("devuelve un warehouse por id", async () => {
    server.use(
      http.get(`${BASE}/warehouses/:id/`, () => HttpResponse.json(mockWarehouse))
    )

    const { data } = await api.get<Warehouse>("/warehouses/1/")
    expect(data.id).toBe(1)
    expect(data.name).toBe("Almacén Central")
  })
})

describe("POST /warehouses/ — create", () => {
  it("crea y devuelve el nuevo warehouse", async () => {
    const payload = {
      name: "Nuevo Almacén",
      address: "Calle 50",
      city: "Medellín",
      country: "Colombia",
      latitude: null,
      longitude: null,
      capacity_m3: 1000,
    }
    server.use(
      http.post(`${BASE}/warehouses/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, is_active: true, created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" } as Warehouse,
          { status: 201 }
        )
      })
    )

    const { data, status } = await api.post<Warehouse>("/warehouses/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(2)
    expect(data.name).toBe("Nuevo Almacén")
  })
})

describe("PATCH /warehouses/:id/ — update", () => {
  it("actualiza parcialmente y devuelve el resultado", async () => {
    server.use(
      http.patch(`${BASE}/warehouses/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Warehouse>
        return HttpResponse.json({ ...mockWarehouse, ...body })
      })
    )

    const { data } = await api.patch<Warehouse>("/warehouses/1/", { name: "Almacén Actualizado" })
    expect(data.name).toBe("Almacén Actualizado")
    expect(data.id).toBe(1)
  })
})

describe("DELETE /warehouses/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(
      http.delete(`${BASE}/warehouses/:id/`, () => HttpResponse.json(null, { status: 204 }))
    )

    const { status } = await api.delete("/warehouses/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400", async () => {
    server.use(
      http.post(`${BASE}/warehouses/`, () =>
        HttpResponse.json({ name: ["Este campo es obligatorio."] }, { status: 400 })
      )
    )

    await expect(api.post("/warehouses/", {})).rejects.toThrow()
  })

  it("propaga 404", async () => {
    server.use(
      http.get(`${BASE}/warehouses/999/`, () =>
        HttpResponse.json({ detail: "No encontrado." }, { status: 404 })
      )
    )

    await expect(api.get("/warehouses/999/")).rejects.toThrow()
  })
})
