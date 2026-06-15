import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Driver, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockDriver: Driver = {
  id: 1, user: 1, transport: 1,
  license_number: "LIC-12345", license_expiry: "2026-12-31",
  phone: "555-5000", is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  user_email: "conductor@empresa.com", user_full_name: "Carlos Ruiz",
}

afterEach(() => server.resetHandlers())

describe("GET /drivers/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Driver> = { count: 1, next: null, previous: null, results: [mockDriver] }
    server.use(http.get(`${BASE}/drivers/`, () => HttpResponse.json(page)))
    const { data, status } = await api.get<PaginatedResponse<Driver>>("/drivers/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].user_full_name).toBe("Carlos Ruiz")
  })

  it("construye query string con search", async () => {
    let capturedUrl = ""
    server.use(http.get(`${BASE}/drivers/`, ({ request }) => {
      capturedUrl = request.url
      return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
    }))
    await api.get("/drivers/", { params: { search: "Carlos" } })
    expect(capturedUrl).toContain("search=Carlos")
  })
})

describe("GET /drivers/:id/ — retrieve", () => {
  it("devuelve un driver por id", async () => {
    server.use(http.get(`${BASE}/drivers/:id/`, () => HttpResponse.json(mockDriver)))
    const { data } = await api.get<Driver>("/drivers/1/")
    expect(data.license_number).toBe("LIC-12345")
  })
})

describe("POST /drivers/ — create", () => {
  it("crea y devuelve el nuevo driver", async () => {
    const payload = {
      user: 2, transport: null,
      license_number: "LIC-99999", license_expiry: "2027-06-15",
      phone: "555-6000",
    }
    server.use(http.post(`${BASE}/drivers/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json(
        { ...(body as object), id: 3, is_active: true, user_email: "nuevo@test.com", user_full_name: "Nuevo Conductor", created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" } as Driver,
        { status: 201 }
      )
    }))
    const { data, status } = await api.post<Driver>("/drivers/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(3)
    expect(data.license_number).toBe("LIC-99999")
  })
})

describe("PATCH /drivers/:id/ — update", () => {
  it("actualiza parcialmente", async () => {
    server.use(http.patch(`${BASE}/drivers/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Driver>
      return HttpResponse.json({ ...mockDriver, ...body })
    }))
    const { data } = await api.patch<Driver>("/drivers/1/", { phone: "555-7777" })
    expect(data.phone).toBe("555-7777")
  })
})

describe("DELETE /drivers/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(http.delete(`${BASE}/drivers/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/drivers/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400", async () => {
    server.use(http.post(`${BASE}/drivers/`, () => HttpResponse.json({ license_number: ["Este campo es obligatorio."] }, { status: 400 })))
    await expect(api.post("/drivers/", {})).rejects.toThrow()
  })
  it("propaga 404", async () => {
    server.use(http.get(`${BASE}/drivers/999/`, () => HttpResponse.json({ detail: "No encontrado." }, { status: 404 })))
    await expect(api.get("/drivers/999/")).rejects.toThrow()
  })
})
