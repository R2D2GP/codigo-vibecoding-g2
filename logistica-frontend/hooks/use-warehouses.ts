import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Warehouse, PaginatedResponse } from "@/types"

export function useWarehouseList(page: number = 1) {
  return useQuery({
    queryKey: ["warehouses", page],
    queryFn: () =>
      api.get<PaginatedResponse<Warehouse>>(`/warehouses/?page=${page}`).then((r) => r.data),
  })
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: ["warehouses", id],
    queryFn: () => api.get<Warehouse>(`/warehouses/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Warehouse, "id" | "created_at" | "updated_at" | "is_active">) =>
      api.post("/warehouses/", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
  })
}

export function useUpdateWarehouse(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Warehouse>) =>
      api.patch(`/warehouses/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
  })
}

export function useDeleteWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/warehouses/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
  })
}
