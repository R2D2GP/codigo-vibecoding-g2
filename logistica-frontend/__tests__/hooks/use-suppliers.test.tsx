import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useSupplierList,
  useSupplier,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/use-suppliers"
import type { Supplier, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockSupplier: Supplier = {
  id: 1, name: "Proveedor Principal", tax_id: "987654321",
  contact_name: "Juan Pérez", email: "juan@proveedor.com",
  phone: "555-2000", address: "Calle Mayor 100", city: "Bogotá",
  country: "Colombia", is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

afterEach(() => server.resetHandlers())

describe("useSupplierList", () => {
  it("fetches lista de suppliers", async () => {
    const page: PaginatedResponse<Supplier> = { count: 1, next: null, previous: null, results: [mockSupplier] }
    server.use(http.get(`${BASE}/suppliers/`, () => HttpResponse.json(page)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useSupplierList(), { wrapper: Wrapper })
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].name).toBe("Proveedor Principal")
  })
})

describe("useSupplier", () => {
  it("fetches un supplier por id", async () => {
    server.use(http.get(`${BASE}/suppliers/:id/`, () => HttpResponse.json(mockSupplier)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useSupplier(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.contact_name).toBe("Juan Pérez")
  })
})

describe("useCreateSupplier", () => {
  it("crea e invalida la lista", async () => {
    server.use(
      http.post(`${BASE}/suppliers/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Supplier,
          { status: 201 }
        )
      })
    )
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateSupplier(), { wrapper: Wrapper })
    await result.current.mutateAsync({
      name: "Nuevo", tax_id: null, contact_name: "María", email: "maria@test.com",
      phone: "555-0000", address: "Calle 1", city: "Medellín", country: "Colombia",
    })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["suppliers"] })
  })
})

describe("useUpdateSupplier", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(
      http.patch(`${BASE}/suppliers/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Supplier>
        return HttpResponse.json({ ...mockSupplier, ...body })
      })
    )
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateSupplier(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ contact_name: "Actualizado" })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["suppliers"] })
  })
})

describe("useDeleteSupplier", () => {
  it("elimina e invalida la lista", async () => {
    server.use(http.delete(`${BASE}/suppliers/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteSupplier(), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["suppliers"] })
  })
})
