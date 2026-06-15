import { describe, it, expect, afterEach } from "vitest"
import { server } from "@/test/msw/server"
import { http, HttpResponse } from "msw"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  useCustomerList,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/use-customers"
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

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return { qc, Wrapper: ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )}
}

afterEach(() => server.resetHandlers())

describe("useCustomerList", () => {
  it("fetches lista de customers", async () => {
    const page: PaginatedResponse<Customer> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockCustomer],
    }
    server.use(http.get(`${BASE}/customers/`, () => HttpResponse.json(page)))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useCustomerList(), { wrapper: Wrapper })

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].name).toBe("Cliente Test")
  })
})

describe("useCustomer", () => {
  it("fetches un customer por id", async () => {
    server.use(
      http.get(`${BASE}/customers/:id/`, () => HttpResponse.json(mockCustomer))
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useCustomer(1), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe("Cliente Test")
    expect(result.current.data?.id).toBe(1)
  })
})

describe("useCreateCustomer", () => {
  it("crea e invalida la lista", async () => {
    server.use(
      http.post(`${BASE}/customers/`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(
          { ...(body as object), id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_active: true } as Customer,
          { status: 201 }
        )
      })
    )

    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useCreateCustomer(), { wrapper: Wrapper })

    await result.current.mutateAsync({
      name: "Nuevo",
      customer_type: "INDIVIDUAL",
      tax_id: null,
      email: "nuevo@test.com",
      phone: "555-0000",
      address: "Calle 1",
      city: "Bogotá",
      country: "Colombia",
    })

    expect(spy).toHaveBeenCalledWith({ queryKey: ["customers"] })
  })
})

describe("useUpdateCustomer", () => {
  it("actualiza e invalida la lista", async () => {
    server.use(
      http.patch(`${BASE}/customers/:id/`, async ({ request }) => {
        const body = (await request.json()) as Partial<Customer>
        return HttpResponse.json({ ...mockCustomer, ...body })
      })
    )

    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useUpdateCustomer(1), { wrapper: Wrapper })

    await result.current.mutateAsync({ name: "Actualizado" })

    expect(spy).toHaveBeenCalledWith({ queryKey: ["customers"] })
  })
})

describe("useDeleteCustomer", () => {
  it("elimina e invalida la lista", async () => {
    server.use(
      http.delete(`${BASE}/customers/:id/`, () => HttpResponse.json(null, { status: 204 }))
    )

    const { qc, Wrapper } = createWrapper()
    const spy = vi.spyOn(qc, "invalidateQueries")
    const { result } = renderHook(() => useDeleteCustomer(), { wrapper: Wrapper })

    await result.current.mutateAsync(1)

    expect(spy).toHaveBeenCalledWith({ queryKey: ["customers"] })
  })
})
