import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Route, RouteStop, PaginatedResponse } from "@/types"

export function useRouteList() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: () =>
      api.get<PaginatedResponse<Route>>("/routes/").then((r) => r.data),
  })
}

export function useRoute(id: number) {
  return useQuery({
    queryKey: ["routes", id],
    queryFn: () => api.get<Route>(`/routes/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateRoute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Route, "id" | "created_at" | "updated_at" | "is_active" | "origin_warehouse_name" | "stops">) =>
      api.post("/routes/", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  })
}

export function useUpdateRoute(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Route>) =>
      api.patch(`/routes/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  })
}

export function useDeleteRoute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/routes/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  })
}

export function useStopList(routeId: number) {
  return useQuery({
    queryKey: ["routes", routeId, "stops"],
    queryFn: () =>
      api.get<RouteStop[]>(`/routes/${routeId}/stops/`).then((r) => r.data),
    enabled: !!routeId,
  })
}

export function useCreateStop(routeId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<RouteStop, "id" | "route">) =>
      api.post(`/routes/${routeId}/stops/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes", routeId, "stops"] }),
  })
}

export function useUpdateStop(routeId: number, stopId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<RouteStop>) =>
      api.patch(`/routes/${routeId}/stops/${stopId}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes", routeId, "stops"] }),
  })
}

export function useDeleteStop(routeId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stopId: number) =>
      api.delete(`/routes/${routeId}/stops/${stopId}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes", routeId, "stops"] }),
  })
}
