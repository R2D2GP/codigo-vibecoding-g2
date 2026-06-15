import { Suspense } from "react"
import { ProductTable } from "./product-table"

export default function ProductsPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <ProductTable />
      </Suspense>
    </div>
  )
}
