import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useTransportList,
  useTransport,
  useCreateTransport,
  useUpdateTransport,
  useDeleteTransport,
} from "@/hooks/use-transport"
import type { Transport, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockTransport: Transport = {
  id: 1, plate_number: "ABC-123", transport_type: "TRUCK",
  brand: "Toyota", model: "Hilux", year: 2020,
  capacity_kg: 1500, capacity_m3: 8, is_available: true,
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

describe("useTransportList", () => {
  it("fetches lista de transportes", async () => {
    const page: PaginatedResponse<Transport> = { count: 1, next: null, previous: null, results: [mockTransport] }
    server.use(http.get(`${BASE}/transport/`, () => HttpResponse.json(page)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useTransportList(), { wrapper: Wrapper })
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].plate_number).toBe("ABC-123")
  })
})

describe("useTransport", () => {
  it("fetches un transporte por id", async () => {
    server.use(http.get(`${BASE}/transport/:id/`, () => HttpResponse.json(mockTransport)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useTransport(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.brand).toBe("Toyota")
  })
})

describe("useCreateTransport", () => {
  it("crea e invalida la lista", async () => {
    server.use(http.post(`${BASE}/transport/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json(
        { ...(body as object), id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Transport,
        { status: 201 }
      )
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateTransport(), { wrapper: Wrapper })
    await result.current.mutateAsync({
      plate_number: "XYZ-999", transport_type: "VAN", brand: "Ford", model: "Transit",
      year: 2022, capacity_kg: 800, capacity_m3: 5, is_available: true,
    })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["transport"] })
  })
})

describe("useUpdateTransport", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(http.patch(`${BASE}/transport/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Transport>
      return HttpResponse.json({ ...mockTransport, ...body })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateTransport(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ is_available: false })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["transport"] })
  })
})

describe("useDeleteTransport", () => {
  it("elimina e invalida la lista", async () => {
    server.use(http.delete(`${BASE}/transport/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteTransport(), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["transport"] })
  })
})
