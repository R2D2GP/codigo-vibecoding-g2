import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Shipment, PaginatedResponse } from "@/types"

export function useShipmentAll() {
  return useQuery({
    queryKey: ["shipments", "all"],
    queryFn: async () => {
      let page = 1
      const all: Shipment[] = []
      while (true) {
        const res = await api.get<PaginatedResponse<Shipment>>(`/shipments/?page=${page}`)
        all.push(...res.data.results)
        if (!res.data.next) break
        page++
      }
      return all
    },
    staleTime: 60_000,
  })
}

export function useDashboardStats(dateRange?: { from?: Date; to?: Date }) {
  const { data: shipments, isLoading: shipmentsLoading } = useShipmentAll()
  const { data: customers } = useQuery({
    queryKey: ["customers", "stats"],
    queryFn: () => api.get<PaginatedResponse<any>>("/customers/").then((r) => r.data.results),
  })
  const { data: products } = useQuery({
    queryKey: ["products", "stats"],
    queryFn: () => api.get<PaginatedResponse<any>>("/products/").then((r) => r.data.results),
  })
  const { data: transports } = useQuery({
    queryKey: ["transport", "stats"],
    queryFn: () => api.get<PaginatedResponse<any>>("/transport/").then((r) => r.data.results),
  })
  const { data: drivers } = useQuery({
    queryKey: ["drivers", "stats"],
    queryFn: () => api.get<PaginatedResponse<any>>("/drivers/").then((r) => r.data.results),
  })
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses", "stats"],
    queryFn: () => api.get<PaginatedResponse<any>>("/warehouses/").then((r) => r.data.results),
  })
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers", "stats"],
    queryFn: () => api.get<PaginatedResponse<any>>("/suppliers/").then((r) => r.data.results),
  })
  const { data: routes } = useQuery({
    queryKey: ["routes", "stats"],
    queryFn: () => api.get<PaginatedResponse<any>>("/routes/").then((r) => r.data.results),
  })

  const filtered = useMemo(() => {
    if (!shipments) return []
    let list = shipments
    if (dateRange?.from) {
      const from = dateRange.from.toISOString().slice(0, 10)
      list = list.filter((s) => s.created_at >= from)
    }
    if (dateRange?.to) {
      const to = dateRange.to.toISOString().slice(0, 10)
      list = list.filter((s) => s.created_at <= to + "T23:59:59")
    }
    return list
  }, [shipments, dateRange])

  const stats = useMemo(() => {
    const statusCount: Record<string, number> = { PENDING: 0, CONFIRMED: 0, IN_TRANSIT: 0, DELIVERED: 0, CANCELLED: 0, RETURNED: 0 }
    const weeklyCount: Record<string, number> = {}
    const weeklyCost: Record<string, number> = {}
    const customerCount: Record<string, number> = {}
    const warehouseCount: Record<string, number> = {}
    const cityCount: Record<string, number> = {}
    const productCount: Record<string, number> = {}
    let totalCost = 0
    let totalWeight = 0
    let onTime = 0
    let late = 0
    let noDeliveryDate = 0
    let deliveredCount = 0

    for (const s of filtered) {
      const cost = Number(s.calculated_cost) || 0
      const weight = Number(s.weight_total_kg) || 0

      statusCount[s.status] = (statusCount[s.status] || 0) + 1
      totalCost += cost
      totalWeight += weight

      const dateStr = s.estimated_delivery_date?.slice(0, 10) || s.created_at.slice(0, 10)
      const createdDate = new Date(dateStr)
      const dayOfWeek = createdDate.getDay()
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(createdDate)
      monday.setDate(createdDate.getDate() + diffToMonday)
      const weekKey = monday.toISOString().slice(0, 10)

      weeklyCount[weekKey] = (weeklyCount[weekKey] || 0) + 1
      weeklyCost[weekKey] = (weeklyCost[weekKey] || 0) + cost

      const cn = s.customer_name || `Cliente #${s.customer}`
      customerCount[cn] = (customerCount[cn] || 0) + 1

      const wn = s.origin_warehouse_name || `Almacén #${s.origin_warehouse}`
      warehouseCount[wn] = (warehouseCount[wn] || 0) + 1

      const city = s.destination_city
      cityCount[city] = (cityCount[city] || 0) + 1

      if (s.items) {
        for (const item of s.items) {
          const pn = item.product_name || `Producto #${item.product}`
          productCount[pn] = (productCount[pn] || 0) + item.quantity
        }
      }

      if (s.status === "DELIVERED") {
        deliveredCount++
        if (s.estimated_delivery_date && s.actual_delivery_date) {
          const est = new Date(s.estimated_delivery_date)
          const act = new Date(s.actual_delivery_date)
          if (act <= est) onTime++
          else late++
        } else {
          noDeliveryDate++
        }
      }
    }

    const weeks = Object.keys(weeklyCount).sort()
    const shipmentsOverTime = weeks.map((w) => {
      const d = new Date(w + "T00:00:00")
      const label = d.toLocaleDateString("es-PE", { day: "numeric", month: "short" })
      return {
        week: label,
        Envíos: weeklyCount[w],
        Costo: weeklyCost[w],
      }
    })

    const statusData = Object.entries(statusCount)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: statusLabel(k), value: v }))

    const customerData = Object.entries(customerCount)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    const warehouseData = Object.entries(warehouseCount)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)

    const cityData = Object.entries(cityCount)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)

    const productData = Object.entries(productCount)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    const deliveredTotal = deliveredCount || 1
    const kpiData = shipmentsOverTime.length
      ? { weekly: shipmentsOverTime }
      : generateFallback()

    return {
      totalShipments: filtered.length,
      totalCost,
      totalWeight,
      pendingCount: statusCount.PENDING,
      statusData,
      shipmentsOverTime,
      customerData,
      warehouseData,
      cityData,
      productData,
      onTimeRate: Math.round((onTime / deliveredTotal) * 100),
      onTime,
      late,
      deliveredCount,
      kpiData,
      customersCount: customers?.length ?? 0,
      productsCount: products?.length ?? 0,
      transportsCount: transports?.length ?? 0,
      driversCount: drivers?.length ?? 0,
      warehousesCount: warehouses?.length ?? 0,
      suppliersCount: suppliers?.length ?? 0,
      routesCount: routes?.length ?? 0,
    }
  }, [filtered, customers, products, transports, drivers, warehouses, suppliers, routes])

  return { stats, isLoading: shipmentsLoading }
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    IN_TRANSIT: "En tránsito",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    RETURNED: "Devuelto",
  }
  return map[s] || s
}

function generateFallback() {
  return {
    weekly: [
      { week: new Date().toISOString().slice(0, 10), Envíos: 0, Costo: 0 },
    ],
  }
}
