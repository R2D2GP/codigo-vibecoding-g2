import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useProductList,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products"
import type { Product, PaginatedResponse } from "@/types"

const BASE = "http://localhost:8000/api/v1"

const mockProduct: Product = {
  id: 1, supplier: 1, warehouse: 1, name: "Widget Pro", sku: "WGT-001",
  description: "Widget de alta calidad", category: "Electrónicos",
  weight_kg: 0.5, width_cm: 10, height_cm: 5, depth_cm: 3,
  unit_price: 29.99, stock_quantity: 100, is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  supplier_name: "Proveedor Principal", warehouse_name: "Almacén Central",
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, Wrapper }
}

afterEach(() => server.resetHandlers())

describe("useProductList", () => {
  it("fetches lista de productos", async () => {
    const page: PaginatedResponse<Product> = { count: 1, next: null, previous: null, results: [mockProduct] }
    server.use(http.get(`${BASE}/products/`, () => HttpResponse.json(page)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useProductList(), { wrapper: Wrapper })
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].name).toBe("Widget Pro")
  })
})

describe("useProduct", () => {
  it("fetches un producto por id", async () => {
    server.use(http.get(`${BASE}/products/:id/`, () => HttpResponse.json(mockProduct)))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useProduct(1), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.sku).toBe("WGT-001")
  })
})

describe("useCreateProduct", () => {
  it("crea e invalida la lista", async () => {
    server.use(
      http.post(`${BASE}/products/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, supplier_name: "P", warehouse_name: "W", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Product,
          { status: 201 }
        )
      })
    )
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateProduct(), { wrapper: Wrapper })
    await result.current.mutateAsync({
      supplier: 1, warehouse: 1, name: "Nuevo", sku: "NWP-001",
      description: null, category: "Hogar", weight_kg: 1, width_cm: 10,
      height_cm: 5, depth_cm: 3, unit_price: 9.99, stock_quantity: 20,
    })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["products"] })
  })
})

describe("useUpdateProduct", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(
      http.patch(`${BASE}/products/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Product>
        return HttpResponse.json({ ...mockProduct, ...body })
      })
    )
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateProduct(1), { wrapper: Wrapper })
    await result.current.mutateAsync({ unit_price: 15 })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["products"] })
  })
})

describe("useDeleteProduct", () => {
  it("elimina e invalida la lista", async () => {
    server.use(http.delete(`${BASE}/products/:id/`, () => HttpResponse.json(null, { status: 204 })))
    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteProduct(), { wrapper: Wrapper })
    await result.current.mutateAsync(1)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["products"] })
  })
})
