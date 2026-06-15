"use client"

import { useState } from "react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { AreaChart } from "@/components/tremor/AreaChart"
import { DonutChart } from "@/components/tremor/DonutChart"
import { BarList } from "@/components/tremor/BarList"
import { CategoryBar } from "@/components/tremor/CategoryBar"
import { SparkChart } from "@/components/tremor/SparkChart"
import { Card } from "@/components/ui/card"
import {
  Package,
  DollarSign,
  Weight,
  Clock,
  Warehouse,
  Building2,
  Users as UsersIcon,
  Box,
  Truck,
  UserCog,
  Map,
} from "lucide-react"
import { cn } from "@/lib/utils"

const costFormatter = (v: number) => {
  if (v >= 1_000_000) return `S/ ${(v / 1_000_000).toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`
  if (v >= 1_000) return `S/ ${(v / 1_000).toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} K`
  return `S/ ${v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
const countFormatter = (v: number) => v.toLocaleString("es-PE")
const weightFormatter = (v: number) => {
  if (v >= 100_000) return `${(v / 1000).toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} t`
  if (v >= 1000) return `${(v / 1000).toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`
  return `${v.toLocaleString("es-PE", { minimumFractionDigits: 1 })} kg`
}

const kpiIcons = [
  <Package key="ship" className="h-5 w-5 text-blue-600" />,
  <DollarSign key="cost" className="h-5 w-5 text-emerald-600" />,
  <Weight key="weight" className="h-5 w-5 text-amber-600" />,
  <Clock key="pending" className="h-5 w-5 text-rose-600" />,
]

const kpiColors = [
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-rose-500",
]

function KpiCard({
  label,
  value,
  formatter = countFormatter,
  sparkData,
  iconIndex = 0,
}: {
  label: string
  value: number
  formatter?: (v: number) => string
  sparkData?: { week: string; value: number }[]
  iconIndex?: number
}) {
  return (
    <Card className="relative flex flex-col gap-1.5 p-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={cn(
        "absolute inset-x-0 top-0 h-0.5",
        iconIndex === 0 ? "bg-blue-500" : iconIndex === 1 ? "bg-emerald-500" : iconIndex === 2 ? "bg-amber-500" : "bg-rose-500"
      )} />
      <div className="absolute top-3 right-3 opacity-[0.08]">
        {kpiIcons[iconIndex]}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl sm:text-2xl font-bold tracking-tight text-balance">{formatter(value)}</p>
      {sparkData && sparkData.length > 0 && (
        <SparkChart
          data={sparkData}
          categories={["value"]}
          index="week"
          type="area"
        />
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const dateRange = dateFrom || dateTo
    ? {
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      }
    : undefined

  const { stats, isLoading } = useDashboardStats(dateRange)

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 animate-pulse">
        <div className="h-8 w-40 rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-28 rounded bg-muted" />
              <div className="h-12 w-full rounded bg-muted" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="p-4 lg:col-span-2">
            <div className="h-4 w-36 rounded bg-muted mb-4" />
            <div className="h-64 rounded bg-muted" />
          </Card>
          <Card className="p-4 lg:col-span-3">
            <div className="h-4 w-36 rounded bg-muted mb-4" />
            <div className="h-64 rounded bg-muted" />
          </Card>
        </div>
      </div>
    )
  }

  const sparkData = stats.kpiData.weekly.map((m) => ({
    week: m.week,
    Envíos: m.Envíos,
    Costo: m.Costo,
  }))

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="from" className="text-muted-foreground">Desde</label>
            <input
              id="from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="to" className="text-muted-foreground">Hasta</label>
            <input
              id="to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo("") }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Total envíos"
          value={stats.totalShipments}
          sparkData={sparkData.map((m) => ({ week: m.week, value: m.Envíos }))}
          iconIndex={0}
        />
        <KpiCard
          label="Costo total"
          value={stats.totalCost}
          formatter={costFormatter}
          sparkData={sparkData.map((m) => ({ week: m.week, value: m.Costo }))}
          iconIndex={1}
        />
        <KpiCard
          label="Peso total"
          value={stats.totalWeight}
          formatter={weightFormatter}
          iconIndex={2}
        />
        <KpiCard
          label="Pendientes"
          value={stats.pendingCount}
          iconIndex={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="p-4 min-w-0 lg:col-span-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Envíos por estado</h3>
          <DonutChart
            data={stats.statusData}
            category="name"
            value="value"
            colors={["amber", "blue", "cyan", "emerald", "red", "fuchsia"]}
            valueFormatter={countFormatter}
          />
        </Card>
        <Card className="p-4 min-w-0 lg:col-span-3">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Envíos por semana</h3>
          <AreaChart
            data={stats.shipmentsOverTime}
            index="week"
            categories={["Envíos"]}
            colors={["blue"]}
            valueFormatter={countFormatter}
            showLegend={false}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 min-w-0">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Top clientes por envíos</h3>
          <BarList
            data={stats.customerData}
            valueFormatter={countFormatter}
            sortOrder="descending"
          />
        </Card>
        <Card className="p-4 min-w-0">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Envíos por almacén origen</h3>
          <BarList
            data={stats.warehouseData}
            valueFormatter={countFormatter}
            sortOrder="descending"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="p-4 min-w-0 lg:col-span-3">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Costo total por semana</h3>
          <AreaChart
            data={stats.shipmentsOverTime}
            index="week"
            categories={["Costo"]}
            valueFormatter={costFormatter}
            showLegend={false}
            colors={["emerald"]}
          />
        </Card>
        <Card className="p-4 min-w-0 lg:col-span-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Entregas a tiempo</h3>
          {stats.deliveredCount > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-3xl font-bold">{stats.onTimeRate}%</p>
                <p className="text-sm text-muted-foreground">
                  {stats.onTime} a tiempo · {stats.late} tarde
                </p>
              </div>
              <CategoryBar
                values={[stats.onTime, stats.late]}
                colors={["emerald", "red"]}
                marker={{ value: stats.onTime, showAnimation: true }}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sin entregas registradas</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 min-w-0">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Productos más enviados</h3>
          {stats.productData.length > 0 ? (
            <BarList
              data={stats.productData}
              valueFormatter={countFormatter}
              sortOrder="descending"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos de productos</p>
          )}
        </Card>
        <Card className="p-4 min-w-0">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Envíos por ciudad destino</h3>
          {stats.cityData.length > 0 ? (
            <DonutChart
              data={stats.cityData}
              category="name"
              value="value"
              colors={["blue", "amber", "violet", "emerald", "cyan", "pink", "red"]}
              valueFormatter={countFormatter}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos de ciudades</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <ModuleStat label="Almacenes" value={stats.warehousesCount} />
        <ModuleStat label="Proveedores" value={stats.suppliersCount} />
        <ModuleStat label="Clientes" value={stats.customersCount} />
        <ModuleStat label="Productos" value={stats.productsCount} />
        <ModuleStat label="Transportes" value={stats.transportsCount} />
        <ModuleStat label="Conductores" value={stats.driversCount} />
        <ModuleStat label="Rutas" value={stats.routesCount} />
      </div>
    </div>
  )
}

const moduleIcons: Record<string, React.ReactNode> = {
  Almacenes: <Warehouse className="h-4 w-4" />,
  Proveedores: <Building2 className="h-4 w-4" />,
  Clientes: <UsersIcon className="h-4 w-4" />,
  Productos: <Box className="h-4 w-4" />,
  Transportes: <Truck className="h-4 w-4" />,
  Conductores: <UserCog className="h-4 w-4" />,
  Rutas: <Map className="h-4 w-4" />,
}

function ModuleStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-1 p-3 text-center hover:shadow-sm transition-shadow duration-200">
      <div className="text-muted-foreground">{moduleIcons[label]}</div>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}
