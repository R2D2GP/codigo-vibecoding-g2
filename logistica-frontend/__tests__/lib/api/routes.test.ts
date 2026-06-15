import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Route, RouteStop, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockRoute: Route = {
  id: 1, name: "Ruta Norte", origin_warehouse: 1,
  estimated_duration_hours: 2.5, estimated_distance_km: 120, is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  origin_warehouse_name: "Almacén Central",
  stops: [{ id: 1, route: 1, stop_order: 1, address: "Calle A", city: "Bogotá", latitude: null, longitude: null, estimated_offset_hours: 1 }],
}

const mockStop: RouteStop = {
  id: 1, route: 1, stop_order: 1, address: "Calle A", city: "Bogotá",
  latitude: 4.7, longitude: -74.0, estimated_offset_hours: 1,
}

afterEach(() => server.resetHandlers())

describe("GET /routes/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Route> = { count: 1, next: null, previous: null, results: [mockRoute] }
    server.use(http.get(`${BASE}/routes/`, () => HttpResponse.json(page)))
    const { data, status } = await api.get<PaginatedResponse<Route>>("/routes/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].name).toBe("Ruta Norte")
  })
})

describe("GET /routes/:id/ — retrieve", () => {
  it("devuelve una ruta por id", async () => {
    server.use(http.get(`${BASE}/routes/:id/`, () => HttpResponse.json(mockRoute)))
    const { data } = await api.get<Route>("/routes/1/")
    expect(data.estimated_duration_hours).toBe(2.5)
  })
})

describe("POST /routes/ — create", () => {
  it("crea y devuelve la nueva ruta", async () => {
    const payload = { name: "Ruta Sur", origin_warehouse: 2, estimated_duration_hours: 3, estimated_distance_km: 200 }
    server.use(http.post(`${BASE}/routes/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json(
        { ...(body as object), id: 2, is_active: true, origin_warehouse_name: "Almacén Sur", stops: [], created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" } as Route,
        { status: 201 }
      )
    }))
    const { data, status } = await api.post<Route>("/routes/", payload)
    expect(status).toBe(201)
    expect(data.name).toBe("Ruta Sur")
  })
})

describe("PATCH /routes/:id/ — update", () => {
  it("actualiza parcialmente", async () => {
    server.use(http.patch(`${BASE}/routes/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Route>
      return HttpResponse.json({ ...mockRoute, ...body })
    }))
    const { data } = await api.patch<Route>("/routes/1/", { estimated_distance_km: 150 })
    expect(data.estimated_distance_km).toBe(150)
  })
})

describe("DELETE /routes/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(http.delete(`${BASE}/routes/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/routes/1/")
    expect(status).toBe(204)
  })
})

describe("stops nested endpoints", () => {
  it("GET /routes/:id/stops/ — lista stops", async () => {
    server.use(http.get(`${BASE}/routes/:id/stops/`, () => HttpResponse.json([mockStop])))
    const { data } = await api.get<RouteStop[]>("/routes/1/stops/")
    expect(data).toHaveLength(1)
    expect(data[0].address).toBe("Calle A")
  })

  it("POST /routes/:id/stops/ — crea stop", async () => {
    const payload = { stop_order: 2, address: "Calle B", city: "Medellín", latitude: null, longitude: null, estimated_offset_hours: 0.5 }
    server.use(http.post(`${BASE}/routes/:id/stops/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({ ...(body as object), id: 2, route: 1 }, { status: 201 })
    }))
    const { data, status } = await api.post<RouteStop>("/routes/1/stops/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(2)
  })

  it("PATCH /routes/:id/stops/:stopId/ — actualiza stop", async () => {
    server.use(http.patch(`${BASE}/routes/:routeId/stops/:stopId/`, async ({ request }) => {
      const body = (await request.json()) as Partial<RouteStop>
      return HttpResponse.json({ ...mockStop, ...body })
    }))
    const { data } = await api.patch<RouteStop>("/routes/1/stops/1/", { address: "Calle C" })
    expect(data.address).toBe("Calle C")
  })

  it("DELETE /routes/:id/stops/:stopId/ — elimina stop", async () => {
    server.use(http.delete(`${BASE}/routes/:routeId/stops/:stopId/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/routes/1/stops/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400 en routes", async () => {
    server.use(http.post(`${BASE}/routes/`, () => HttpResponse.json({ name: ["Este campo es obligatorio."] }, { status: 400 })))
    await expect(api.post("/routes/", {})).rejects.toThrow()
  })
  it("propaga 404 en stops", async () => {
    server.use(http.get(`${BASE}/routes/999/stops/`, () => HttpResponse.json({ detail: "No encontrado." }, { status: 404 })))
    await expect(api.get("/routes/999/stops/")).rejects.toThrow()
  })
})
