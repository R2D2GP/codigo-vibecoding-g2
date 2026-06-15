"use client"

import { useState } from "react"
import { useDriverList, useDeleteDriver } from "@/hooks/use-drivers"
import { useCan } from "@/hooks/use-can"
import { DataTable } from "@/components/shared/data-table"
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { CreateDriverDialog } from "./create-dialog"
import { EditDriverDialog } from "./edit-dialog"
import { toast } from "sonner"
import type { Driver } from "@/types"

export function DriverTable() {
  const { data, isLoading, isError, refetch } = useDriverList()
  const deleteMutation = useDeleteDriver()
  const canCreate = useCan("drivers.add_driver")
  const canEdit = useCan("drivers.change_driver")
  const canDelete = useCan("drivers.delete_driver")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)

  if (isLoading) return <DataTableSkeleton rows={8} columns={7} />
  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">Error al cargar conductores</p>
      <p className="text-xs text-muted-foreground">Ocurrió un error al obtener los datos</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Reintentar
      </Button>
    </div>
  )

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este conductor?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Conductor eliminado")
    } catch {
      toast.error("Error al eliminar conductor")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo conductor
          </Button>
        )}
      </div>
      <DataTable columns={columns({ onEdit: setEditing, onDelete: handleDelete, canEdit, canDelete })} data={data?.results ?? []} />
      <CreateDriverDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditDriverDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          driver={editing}
        />
      )}
    </div>
  )
}
