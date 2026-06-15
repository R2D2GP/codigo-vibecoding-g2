"use client"

import { useState } from "react"
import { useRouteList, useDeleteRoute } from "@/hooks/use-routes"
import { useCan } from "@/hooks/use-can"
import { DataTable } from "@/components/shared/data-table"
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { CreateRouteDialog } from "./create-dialog"
import { EditRouteDialog } from "./edit-dialog"
import { StopsDialog } from "./stops-dialog"
import { toast } from "sonner"
import type { Route } from "@/types"

export function RouteTable() {
  const { data, isLoading, isError, refetch } = useRouteList()
  const deleteMutation = useDeleteRoute()
  const canCreate = useCan("routes.add_route")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Route | null>(null)
  const [stopsRoute, setStopsRoute] = useState<Route | null>(null)

  if (isLoading) return <DataTableSkeleton rows={8} columns={6} />
  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">Error al cargar rutas</p>
      <p className="text-xs text-muted-foreground">Ocurrió un error al obtener los datos</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Reintentar
      </Button>
    </div>
  )

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta ruta?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Ruta eliminada")
    } catch {
      toast.error("Error al eliminar ruta")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva ruta
          </Button>
        )}
      </div>
      <DataTable
        columns={columns({ onEdit: setEditing, onStops: setStopsRoute, onDelete: handleDelete })}
        data={data?.results ?? []}
      />
      <CreateRouteDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditRouteDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          route={editing}
        />
      )}
      {stopsRoute && (
        <StopsDialog
          open={!!stopsRoute}
          onOpenChange={(open) => { if (!open) setStopsRoute(null) }}
          routeId={stopsRoute.id}
          routeName={stopsRoute.name}
        />
      )}
    </div>
  )
}
