import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useDriverList,
  useDriver,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from "@/hooks/use-drivers"
import type { Driver, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockDriver: Driver = {
  id: 1, user: 1, transport: 1, license_number: "LIC-12345",
  license_expiry: "2026-12-31", phone: "555-5000", is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  user_email: "conductor@empresa.com", user_full_name: "Carlos Ruiz",
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

afterEach(() => server.resetHandlers())

describe("useDriverList", () => {
  it("fetches lista de conductores", async () => {
    const page: PaginatedResponse<Driver> = { count: 1, next: null, previous: null, results: [mockDriver] }
    server.use(http.get(`${BASE}/drivers/`, () => HttpResponse.json(page)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useDriverList(), { wrapper: Wrapper })
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].user_full_name).toBe("Carlos Ruiz")
  })
})

describe("useDriver", () => {
  it("fetches un driver por id", async () => {
    server.use(http.get(`${BASE}/drivers/:id/`, () => HttpResponse.json(mockDriver)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useDriver(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.phone).toBe("555-5000")
  })
})

describe("useCreateDriver", () => {
  it("crea e invalida la lista", async () => {
    server.use(http.post(`${BASE}/drivers/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json(
        { ...(body as object), id: 3, is_active: true, user_email: "n@t.com", user_full_name: "N", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Driver,
        { status: 201 }
      )
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateDriver(), { wrapper: Wrapper })
    await result.current.mutateAsync({
      user: 2, transport: null, license_number: "LIC-X", license_expiry: "2027-01-01", phone: "555-0000",
    })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["drivers"] })
  })
})

describe("useUpdateDriver", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(http.patch(`${BASE}/drivers/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Driver>
      return HttpResponse.json({ ...mockDriver, ...body })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateDriver(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ phone: "555-9999" })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["drivers"] })
  })
})

describe("useDeleteDriver", () => {
  it("elimina e invalida la lista", async () => {
    server.use(http.delete(`${BASE}/drivers/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteDriver(), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["drivers"] })
  })
})
