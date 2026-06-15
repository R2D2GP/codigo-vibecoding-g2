import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useRouteList, useRoute, useCreateRoute, useUpdateRoute, useDeleteRoute,
  useStopList, useCreateStop, useUpdateStop, useDeleteStop,
} from "@/hooks/use-routes"
import type { Route, RouteStop, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockRoute: Route = {
  id: 1, name: "Ruta Norte", origin_warehouse: 1,
  estimated_duration_hours: 2.5, estimated_distance_km: 120, is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  origin_warehouse_name: "Almacén Central",
  stops: [],
}

const mockStop: RouteStop = {
  id: 1, route: 1, stop_order: 1, address: "Calle A", city: "Bogotá",
  latitude: 4.7, longitude: -74.0, estimated_offset_hours: 1,
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

afterEach(() => server.resetHandlers())

describe("useRouteList", () => {
  it("fetches lista de rutas", async () => {
    const page: PaginatedResponse<Route> = { count: 1, next: null, previous: null, results: [mockRoute] }
    server.use(http.get(`${BASE}/routes/`, () => HttpResponse.json(page)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useRouteList(), { wrapper: Wrapper })
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].name).toBe("Ruta Norte")
  })
})

describe("useRoute", () => {
  it("fetches una ruta por id", async () => {
    server.use(http.get(`${BASE}/routes/:id/`, () => HttpResponse.json(mockRoute)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useRoute(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.estimated_distance_km).toBe(120)
  })
})

describe("useCreateRoute", () => {
  it("crea e invalida la lista", async () => {
    server.use(http.post(`${BASE}/routes/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({ ...(body as object), id: 2, is_active: true, origin_warehouse_name: "W", stops: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Route, { status: 201 })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateRoute(), { wrapper: Wrapper })
    await result.current.mutateAsync({ name: "Nueva Ruta", origin_warehouse: 1, estimated_duration_hours: 2, estimated_distance_km: 100 })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["routes"] })
  })
})

describe("useUpdateRoute", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(http.patch(`${BASE}/routes/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Route>
      return HttpResponse.json({ ...mockRoute, ...body })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateRoute(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ name: "Actualizada" })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["routes"] })
  })
})

describe("useDeleteRoute", () => {
  it("elimina e invalida la lista", async () => {
    server.use(http.delete(`${BASE}/routes/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteRoute(), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["routes"] })
  })
})

describe("useStopList", () => {
  it("fetches stops de una ruta", async () => {
    server.use(http.get(`${BASE}/routes/1/stops/`, () => HttpResponse.json([mockStop])))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useStopList(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].address).toBe("Calle A")
  })
})

describe("useCreateStop", () => {
  it("crea e invalida stops", async () => {
    server.use(http.post(`${BASE}/routes/1/stops/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({ ...(body as object), id: 2, route: 1 }, { status: 201 })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateStop(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ stop_order: 2, address: "Calle B", city: "Medellín", latitude: null, longitude: null, estimated_offset_hours: 0.5 })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["routes", 1, "stops"] })
  })
})

describe("useUpdateStop", () => {
  it("actualiza e invalida stops", async () => {
    server.use(http.patch(`${BASE}/routes/1/stops/1/`, async ({ request }) => {
      const body = (await request.json()) as Partial<RouteStop>
      return HttpResponse.json({ ...mockStop, ...body })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateStop(1, 1), { wrapper: Wrapper })
    await result.current.mutateAsync({ address: "Calle C" })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["routes", 1, "stops"] })
  })
})

describe("useDeleteStop", () => {
  it("elimina e invalida stops", async () => {
    server.use(http.delete(`${BASE}/routes/1/stops/1/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteStop(1), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["routes", 1, "stops"] })
  })
})
