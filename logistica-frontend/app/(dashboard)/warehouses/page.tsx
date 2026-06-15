import { Suspense } from "react"
import { WarehouseTable } from "./warehouse-table"

export default function WarehousesPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Almacenes</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <WarehouseTable />
      </Suspense>
    </div>
  )
}
