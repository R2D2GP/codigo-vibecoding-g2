import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { api } from "@/lib/api"
import type { Supplier, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockSupplier: Supplier = {
  id: 1,
  name: "Proveedor Principal",
  tax_id: "987654321",
  contact_name: "Juan Pérez",
  email: "juan@proveedor.com",
  phone: "555-2000",
  address: "Calle Mayor 100",
  city: "Bogotá",
  country: "Colombia",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

afterEach(() => server.resetHandlers())

describe("GET /suppliers/ — list", () => {
  it("devuelve PaginatedResponse con resultados", async () => {
    const page: PaginatedResponse<Supplier> = { count: 1, next: null, previous: null, results: [mockSupplier] }
    server.use(http.get(`${BASE}/suppliers/`, () => HttpResponse.json(page)))

    const { data, status } = await api.get<PaginatedResponse<Supplier>>("/suppliers/")
    expect(status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].name).toBe("Proveedor Principal")
  })

  it("construye query string con search y page", async () => {
    let capturedUrl = ""
    server.use(
      http.get(`${BASE}/suppliers/`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      })
    )
    await api.get("/suppliers/", { params: { search: "principal", page: 1 } })
    expect(capturedUrl).toContain("search=principal")
    expect(capturedUrl).toContain("page=1")
  })
})

describe("GET /suppliers/:id/ — retrieve", () => {
  it("devuelve un supplier por id", async () => {
    server.use(http.get(`${BASE}/suppliers/:id/`, () => HttpResponse.json(mockSupplier)))
    const { data } = await api.get<Supplier>("/suppliers/1/")
    expect(data.id).toBe(1)
    expect(data.contact_name).toBe("Juan Pérez")
  })
})

describe("POST /suppliers/ — create", () => {
  it("crea y devuelve el nuevo supplier", async () => {
    const payload = {
      name: "Nuevo Proveedor",
      tax_id: null,
      contact_name: "María López",
      email: "maria@nuevo.com",
      phone: "555-3000",
      address: "Calle 20",
      city: "Medellín",
      country: "Colombia",
    }
    server.use(
      http.post(`${BASE}/suppliers/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, is_active: true, created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" } as Supplier,
          { status: 201 }
        )
      })
    )
    const { data, status } = await api.post<Supplier>("/suppliers/", payload)
    expect(status).toBe(201)
    expect(data.id).toBe(2)
    expect(data.name).toBe("Nuevo Proveedor")
  })
})

describe("PATCH /suppliers/:id/ — update", () => {
  it("actualiza parcialmente y devuelve el resultado", async () => {
    server.use(
      http.patch(`${BASE}/suppliers/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Supplier>
        return HttpResponse.json({ ...mockSupplier, ...body })
      })
    )
    const { data } = await api.patch<Supplier>("/suppliers/1/", { contact_name: "Carlos Gómez" })
    expect(data.contact_name).toBe("Carlos Gómez")
  })
})

describe("DELETE /suppliers/:id/ — remove", () => {
  it("elimina y retorna 204", async () => {
    server.use(http.delete(`${BASE}/suppliers/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { status } = await api.delete("/suppliers/1/")
    expect(status).toBe(204)
  })
})

describe("errores 4xx", () => {
  it("propaga 400", async () => {
    server.use(http.post(`${BASE}/suppliers/`, () => HttpResponse.json({ name: ["Este campo es obligatorio."] }, { status: 400 })))
    await expect(api.post("/suppliers/", {})).rejects.toThrow()
  })

  it("propaga 404", async () => {
    server.use(http.get(`${BASE}/suppliers/999/`, () => HttpResponse.json({ detail: "No encontrado." }, { status: 404 })))
    await expect(api.get("/suppliers/999/")).rejects.toThrow()
  })
})
