import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Customer, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockCustomer: Customer = {
  id: 1,
  name: "Cliente Test",
  customer_type: "COMPANY",
  tax_id: "123456789",
  email: "cliente@test.com",
  phone: "555-1234",
  address: "Av. Principal 123",
  city: "Lima",
  country: "Perú",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

afterEach(() => server.resetHandlers())

describe("GET /customers/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Customer> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockCustomer],
    }
    server.use(http.get(`${BASE}/customers/`, () => HttpResponse.json(page)))

    const { data, status } = await api.get<PaginatedResponse<Customer>>("/customers/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].name).toBe("Cliente Test")
  })

  it("construye query string con search y page", async () => {
    let capturedUrl = ""
    server.use(
      http.get(`${BASE}/customers/`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      })
    )

    await api.get("/customers/", { params: { search: "test", page: 2 } })
    expect(capturedUrl).toContain("search=test")
    expect(capturedUrl).toContain("page=2")
  })
})

describe("GET /customers/:id/ — retrieve", () => {
  it("devuelve un customer por id", async () => {
    server.use(
      http.get(`${BASE}/customers/:id/`, ({ params }) => {
        return HttpResponse.json(mockCustomer)
      })
    )

    const { data } = await api.get<Customer>("/customers/1/")
    expect(data.id).toBe(1)
    expect(data.name).toBe("Cliente Test")
  })
})

describe("POST /customers/ — create", () => {
  it("crea y devuelve el nuevo customer", async () => {
    const payload = {
      name: "Nuevo Cliente",
      customer_type: "INDIVIDUAL" as const,
      tax_id: null,
      email: "nuevo@test.com",
      phone: "555-0000",
      address: "Calle 1",
      city: "Bogotá",
      country: "Colombia",
    }
    server.use(
      http.post(`${BASE}/customers/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z", is_active: true } as Customer,
          { status: 201 }
        )
      })
    )

    const { data, status } = await api.post<Customer>("/customers/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(2)
    expect(data.name).toBe("Nuevo Cliente")
  })
})

describe("PATCH /customers/:id/ — update", () => {
  it("actualiza parcialmente y devuelve el resultado", async () => {
    server.use(
      http.patch(`${BASE}/customers/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Customer>
        return HttpResponse.json({ ...mockCustomer, ...body })
      })
    )

    const { data } = await api.patch<Customer>("/customers/1/", { name: "Nombre Actualizado" })
    expect(data.name).toBe("Nombre Actualizado")
    expect(data.id).toBe(1)
  })
})

describe("DELETE /customers/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(
      http.delete(`${BASE}/customers/:id/`, () => HttpResponse.json(null, { status: 204 }))
    )

    const { status } = await api.delete("/customers/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400", async () => {
    server.use(
      http.post(`${BASE}/customers/`, () =>
        HttpResponse.json({ name: ["Este campo es obligatorio."] }, { status: 400 })
      )
    )

    await expect(api.post("/customers/", {})).rejects.toThrow()
  })

  it("propaga 404", async () => {
    server.use(
      http.get(`${BASE}/customers/999/`, () =>
        HttpResponse.json({ detail: "No encontrado." }, { status: 404 })
      )
    )

    await expect(api.get("/customers/999/")).rejects.toThrow()
  })
})
