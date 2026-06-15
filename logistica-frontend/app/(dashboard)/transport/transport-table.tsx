"use client"

import { useState } from "react"
import { useTransportList, useDeleteTransport } from "@/hooks/use-transport"
import { useCan } from "@/hooks/use-can"
import { DataTable } from "@/components/shared/data-table"
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { CreateTransportDialog } from "./create-dialog"
import { EditTransportDialog } from "./edit-dialog"
import { toast } from "sonner"
import type { Transport } from "@/types"

export function TransportTable() {
  const { data, isLoading, isError, refetch } = useTransportList()
  const deleteMutation = useDeleteTransport()
  const canCreate = useCan("transport.add_transport")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Transport | null>(null)

  if (isLoading) return <DataTableSkeleton rows={8} columns={7} />
  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">Error al cargar transporte</p>
      <p className="text-xs text-muted-foreground">Ocurrió un error al obtener los datos</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Reintentar
      </Button>
    </div>
  )

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este vehículo?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Vehículo eliminado")
    } catch {
      toast.error("Error al eliminar vehículo")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo vehículo
          </Button>
        )}
      </div>
      <DataTable columns={columns({ onEdit: setEditing, onDelete: handleDelete })} data={data?.results ?? []} />
      <CreateTransportDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditTransportDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          transport={editing}
        />
      )}
    </div>
  )
}
