import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Transport, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockTransport: Transport = {
  id: 1,
  plate_number: "ABC-123",
  transport_type: "TRUCK",
  brand: "Toyota",
  model: "Hilux",
  year: 2020,
  capacity_kg: 1500,
  capacity_m3: 8,
  is_available: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

afterEach(() => server.resetHandlers())

describe("GET /transport/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Transport> = { count: 1, next: null, previous: null, results: [mockTransport] }
    server.use(http.get(`${BASE}/transport/`, () => HttpResponse.json(page)))
    const { data, status } = await api.get<PaginatedResponse<Transport>>("/transport/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].plate_number).toBe("ABC-123")
  })

  it("construye query string con search", async () => {
    let capturedUrl = ""
    server.use(http.get(`${BASE}/transport/`, ({ request }) => {
      capturedUrl = request.url
      return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
    }))
    await api.get("/transport/", { params: { search: "ABC" } })
    expect(capturedUrl).toContain("search=ABC")
  })
})

describe("GET /transport/:id/ — retrieve", () => {
  it("devuelve un transport por id", async () => {
    server.use(http.get(`${BASE}/transport/:id/`, () => HttpResponse.json(mockTransport)))
    const { data } = await api.get<Transport>("/transport/1/")
    expect(data.plate_number).toBe("ABC-123")
  })
})

describe("POST /transport/ — create", () => {
  it("crea y devuelve el nuevo transporte", async () => {
    const payload = {
      plate_number: "XYZ-999",
      transport_type: "VAN" as const,
      brand: "Ford",
      model: "Transit",
      year: 2022,
      capacity_kg: 800,
      capacity_m3: 5,
      is_available: true,
    }
    server.use(http.post(`${BASE}/transport/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json(
        { ...(body as object), id: 2, created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" } as Transport,
        { status: 201 }
      )
    }))
    const { data, status } = await api.post<Transport>("/transport/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(2)
    expect(data.plate_number).toBe("XYZ-999")
  })
})

describe("PATCH /transport/:id/ — update", () => {
  it("actualiza parcialmente", async () => {
    server.use(http.patch(`${BASE}/transport/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Transport>
      return HttpResponse.json({ ...mockTransport, ...body })
    }))
    const { data } = await api.patch<Transport>("/transport/1/", { is_available: false })
    expect(data.is_available).toBe(false)
  })
})

describe("DELETE /transport/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(http.delete(`${BASE}/transport/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/transport/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400", async () => {
    server.use(http.post(`${BASE}/transport/`, () => HttpResponse.json({ plate_number: ["Este campo es obligatorio."] }, { status: 400 })))
    await expect(api.post("/transport/", {})).rejects.toThrow()
  })
  it("propaga 404", async () => {
    server.use(http.get(`${BASE}/transport/999/`, () => HttpResponse.json({ detail: "No encontrado." }, { status: 404 })))
    await expect(api.get("/transport/999/")).rejects.toThrow()
  })
})
