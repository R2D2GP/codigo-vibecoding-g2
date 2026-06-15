import { Suspense } from "react"
import { CustomerTable } from "./customer-table"

export default function CustomersPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <CustomerTable />
      </Suspense>
    </div>
  )
}
