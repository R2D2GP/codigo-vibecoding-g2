import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Group, Permission, PaginatedResponse } from "@/types"

export function useGroupList() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: () =>
      api.get<PaginatedResponse<Group>>("/auth/groups/").then((r) => r.data),
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/auth/groups/", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  })
}

export function useUpdateGroup(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch(`/auth/groups/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/auth/groups/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  })
}

export function usePermissionList() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () =>
      api.get<PaginatedResponse<Permission>>("/auth/permissions/").then((r) => r.data),
  })
}
