import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useShipmentList, useShipment, useCreateShipment, useUpdateShipment, useDeleteShipment,
  useShipmentItemList, useCreateShipmentItem, useDeleteShipmentItem,
} from "@/hooks/use-shipments"
import type { Shipment, ShipmentItem, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockShipment: Shipment = {
  id: 1, tracking_number: "SHP-00000001", customer: 1, driver: 1,
  transport: 1, route: 1, origin_warehouse: 1,
  destination_address: "Calle Principal 500", destination_city: "Bogotá",
  destination_country: "Colombia", status: "PENDING",
  estimated_delivery_date: "2024-06-15", actual_delivery_date: null,
  weight_total_kg: 100, base_cost: 250, calculated_cost: 275, notes: null,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  customer_name: "Cliente Test", origin_warehouse_name: "Almacén Central",
  driver_name: "Carlos Ruiz", transport_plate: "ABC-123", route_name: "Ruta Norte",
  items: [],
}

const mockItem: ShipmentItem = {
  id: 1, shipment: 1, product: 1, quantity: 5,
  unit_price_at_time: 29.99, subtotal: 149.95, product_name: "Widget Pro",
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

afterEach(() => server.resetHandlers())

describe("useShipmentList", () => {
  it("fetches lista de envíos", async () => {
    const page: PaginatedResponse<Shipment> = { count: 1, next: null, previous: null, results: [mockShipment] }
    server.use(http.get(`${BASE}/shipments/`, () => HttpResponse.json(page)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useShipmentList(), { wrapper: Wrapper })
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].tracking_number).toBe("SHP-00000001")
  })
})

describe("useShipment", () => {
  it("fetches un envío por id", async () => {
    server.use(http.get(`${BASE}/shipments/:id/`, () => HttpResponse.json(mockShipment)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useShipment(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe("PENDING")
  })
})

describe("useCreateShipment", () => {
  it("crea e invalida la lista", async () => {
    server.use(http.post(`${BASE}/shipments/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({ ...(body as object), id: 2, tracking_number: "SHP-X", calculated_cost: 0, customer_name: "C", origin_warehouse_name: "W", driver_name: null, transport_plate: null, route_name: null, items: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Shipment, { status: 201 })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateShipment(), { wrapper: Wrapper })
    await result.current.mutateAsync({
      customer: 1, origin_warehouse: 1, driver: null, transport: null, route: null,
      destination_address: "Av. Test", destination_city: "Lima", destination_country: "Perú",
      status: "PENDING", estimated_delivery_date: null, weight_total_kg: 10, base_cost: 100, notes: null,
    })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["shipments"] })
  })
})

describe("useUpdateShipment", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(http.patch(`${BASE}/shipments/:id/`, async ({ request }) => {
      const body = (await request.json()) as Partial<Shipment>
      return HttpResponse.json({ ...mockShipment, ...body })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateShipment(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ status: "DELIVERED" })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["shipments"] })
  })
})

describe("useDeleteShipment", () => {
  it("elimina e invalida la lista", async () => {
    server.use(http.delete(`${BASE}/shipments/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteShipment(), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["shipments"] })
  })
})

describe("useShipmentItemList", () => {
  it("fetches items de un envío", async () => {
    server.use(http.get(`${BASE}/shipments/1/items/`, () => HttpResponse.json([mockItem])))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useShipmentItemList(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].product_name).toBe("Widget Pro")
  })
})

describe("useCreateShipmentItem", () => {
  it("crea e invalida items", async () => {
    server.use(http.post(`${BASE}/shipments/1/items/`, async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({ ...(body as object), id: 2, shipment: 1, subtotal: 59.98, product_name: "P" }, { status: 201 })
    }))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateShipmentItem(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ product: 1, quantity: 2, unit_price_at_time: 29.99 })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["shipments", 1, "items"] })
  })
})

describe("useDeleteShipmentItem", () => {
  it("elimina e invalida items", async () => {
    server.use(http.delete(`${BASE}/shipments/1/items/1/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteShipmentItem(1), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["shipments", 1, "items"] })
  })
})
