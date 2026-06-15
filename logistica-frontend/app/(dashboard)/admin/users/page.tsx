import { Suspense } from "react"
import { UsersTable } from "./users-table"

export default function UsersPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  )
}
