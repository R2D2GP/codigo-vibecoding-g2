import { Suspense } from "react"
import { SupplierTable } from "./supplier-table"

export default function SuppliersPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Proveedores</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <SupplierTable />
      </Suspense>
    </div>
  )
}
