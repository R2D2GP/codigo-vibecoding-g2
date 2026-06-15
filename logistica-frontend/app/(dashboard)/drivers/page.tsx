import { Suspense } from "react"
import { DriverTable } from "./driver-table"

export default function DriversPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Conductores</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <DriverTable />
      </Suspense>
    </div>
  )
}
