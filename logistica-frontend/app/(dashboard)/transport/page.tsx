import { Suspense } from "react"
import { TransportTable } from "./transport-table"

export default function TransportPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Transporte</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <TransportTable />
      </Suspense>
    </div>
  )
}
