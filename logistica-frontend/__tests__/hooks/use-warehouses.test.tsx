import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useWarehouseList,
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
} from "@/hooks/use-warehouses"
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

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

afterEach(() => server.resetHandlers())

describe("useWarehouseList", () => {
  it("fetches lista de warehouses", async () => {
    const page: PaginatedResponse<Warehouse> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockWarehouse],
    }
    server.use(http.get(`${BASE}/warehouses/`, () => HttpResponse.json(page)))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useWarehouseList(), { wrapper: Wrapper })

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].name).toBe("Almacén Central")
  })
})

describe("useWarehouse", () => {
  it("fetches un warehouse por id", async () => {
    server.use(
      http.get(`${BASE}/warehouses/:id/`, () => HttpResponse.json(mockWarehouse))
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useWarehouse(1), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe("Almacén Central")
    expect(result.current.data?.id).toBe(1)
  })
})

describe("useCreateWarehouse", () => {
  it("crea e invalida la lista", async () => {
    server.use(
      http.post(`${BASE}/warehouses/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Warehouse,
          { status: 201 }
        )
      })
    )

    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateWarehouse(), { wrapper: Wrapper })

    await result.current.mutateAsync({
      name: "Nuevo",
      address: "Calle 1",
      city: "Medellín",
      country: "Colombia",
      latitude: null,
      longitude: null,
      capacity_m3: 1000,
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: ["warehouses"] })
  })
})

describe("useUpdateWarehouse", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(
      http.patch(`${BASE}/warehouses/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Warehouse>
        return HttpResponse.json({ ...mockWarehouse, ...body })
      })
    )

    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateWarehouse(1), { wrapper: Wrapper })

    await result.current.mutateAsync({ name: "Actualizado" })

    expect(spy).toHaveBeenCalledWith({ queryKey: ["warehouses"] })
  })
})

describe("useDeleteWarehouse", () => {
  it("elimina e invalida la lista", async () => {
    server.use(
      http.delete(`${BASE}/warehouses/:id/`, () => HttpResponse.json(null, { status: 204 }))
    )

    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteWarehouse(), { wrapper: Wrapper })

    await result.current.mutateAsync(1)

    expect(spy).toHaveBeenCalledWith({ queryKey: ["warehouses"] })
  })
})
