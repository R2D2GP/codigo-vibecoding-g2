import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Transport, PaginatedResponse } from "@/types"

export function useTransportList() {
  return useQuery({
    queryKey: ["transport"],
    queryFn: () =>
      api.get<PaginatedResponse<Transport>>("/transport/").then((r) => r.data),
  })
}

export function useTransport(id: number) {
  return useQuery({
    queryKey: ["transport", id],
    queryFn: () => api.get<Transport>(`/transport/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateTransport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Transport, "id" | "created_at" | "updated_at">) =>
      api.post("/transport/", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transport"] }),
  })
}

export function useUpdateTransport(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Transport>) =>
      api.patch(`/transport/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transport"] }),
  })
}

export function useDeleteTransport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/transport/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transport"] }),
  })
}
