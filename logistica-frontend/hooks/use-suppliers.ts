import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Supplier, PaginatedResponse } from "@/types"

export function useSupplierList() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () =>
      api.get<PaginatedResponse<Supplier>>("/suppliers/").then((r) => r.data),
  })
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => api.get<Supplier>(`/suppliers/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Supplier, "id" | "created_at" | "updated_at" | "is_active">) =>
      api.post("/suppliers/", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  })
}

export function useUpdateSupplier(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Supplier>) =>
      api.patch(`/suppliers/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/suppliers/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  })
}
