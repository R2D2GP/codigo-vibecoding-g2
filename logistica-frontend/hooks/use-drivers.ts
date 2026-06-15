import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Driver, PaginatedResponse } from "@/types"

export function useDriverList() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: () =>
      api.get<PaginatedResponse<Driver>>("/drivers/").then((r) => r.data),
  })
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: ["drivers", id],
    queryFn: () => api.get<Driver>(`/drivers/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Driver, "id" | "created_at" | "updated_at" | "is_active" | "user_email" | "user_full_name">) =>
      api.post("/drivers/", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  })
}

export function useUpdateDriver(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Driver>) =>
      api.patch(`/drivers/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  })
}

export function useDeleteDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/drivers/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  })
}
