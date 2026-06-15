import { Suspense } from "react"
import { GroupsTable } from "./groups-table"

export default function GroupsPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Roles</h1>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <GroupsTable />
      </Suspense>
    </div>
  )
}
