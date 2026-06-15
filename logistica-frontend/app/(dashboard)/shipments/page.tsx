import { Suspense } from "react"
import { ShipmentTable } from "./shipment-table"

export default function ShipmentsPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Envíos</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <ShipmentTable />
      </Suspense>
    </div>
  )
}
