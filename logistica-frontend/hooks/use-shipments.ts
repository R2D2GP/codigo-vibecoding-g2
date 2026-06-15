import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Shipment, ShipmentItem, PaginatedResponse } from "@/types"

export function useShipmentList() {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: () =>
      api.get<PaginatedResponse<Shipment>>("/shipments/").then((r) => r.data),
  })
}

export function useShipment(id: number) {
  return useQuery({
    queryKey: ["shipments", id],
    queryFn: () => api.get<Shipment>(`/shipments/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Shipment, "id" | "tracking_number" | "calculated_cost" | "actual_delivery_date" | "created_at" | "updated_at" | "customer_name" | "origin_warehouse_name" | "driver_name" | "transport_plate" | "route_name" | "items">) =>
      api.post("/shipments/", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments"] }),
  })
}

export function useUpdateShipment(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Shipment>) =>
      api.patch(`/shipments/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments"] }),
  })
}

export function useDeleteShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/shipments/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments"] }),
  })
}

export function useShipmentItemList(shipmentId: number) {
  return useQuery({
    queryKey: ["shipments", shipmentId, "items"],
    queryFn: () =>
      api.get<PaginatedResponse<ShipmentItem>>(`/shipments/${shipmentId}/items/`).then((r) => r.data),
    enabled: !!shipmentId,
  })
}

export function useCreateShipmentItem(shipmentId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ShipmentItem, "id" | "shipment" | "subtotal" | "product_name">) =>
      api.post(`/shipments/${shipmentId}/items/`, { ...data, shipment: shipmentId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments", shipmentId, "items"] }),
  })
}

export function useDeleteShipmentItem(shipmentId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) =>
      api.delete(`/shipments/${shipmentId}/items/${itemId}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments", shipmentId, "items"] }),
  })
}
