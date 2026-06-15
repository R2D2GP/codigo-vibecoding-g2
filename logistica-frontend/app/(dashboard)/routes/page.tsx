import { Suspense } from "react"
import { RouteTable } from "./route-table"

export default function RoutesPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Rutas</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <RouteTable />
      </Suspense>
    </div>
  )
}
