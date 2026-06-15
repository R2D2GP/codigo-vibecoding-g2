"use client"

import { useState } from "react"
import { useShipmentList, useDeleteShipment } from "@/hooks/use-shipments"
import { useCan } from "@/hooks/use-can"
import { DataTable } from "@/components/shared/data-table"
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { CreateShipmentDialog } from "./create-dialog"
import { EditShipmentDialog } from "./edit-dialog"
import { ItemsDialog } from "./items-dialog"
import { toast } from "sonner"
import type { Shipment } from "@/types"

export function ShipmentTable() {
  const { data, isLoading, isError, refetch } = useShipmentList()
  const deleteMutation = useDeleteShipment()
  const canCreate = useCan("shipments.add_shipment")
  const canEdit = useCan("shipments.change_shipment")
  const canDelete = useCan("shipments.delete_shipment")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Shipment | null>(null)
  const [itemsShipment, setItemsShipment] = useState<Shipment | null>(null)

  if (isLoading) return <DataTableSkeleton rows={8} columns={7} />
  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">Error al cargar envíos</p>
      <p className="text-xs text-muted-foreground">Ocurrió un error al obtener los datos</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Reintentar
      </Button>
    </div>
  )

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este envío?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Envío eliminado")
    } catch {
      toast.error("Error al eliminar envío")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo envío
          </Button>
        )}
      </div>
      <DataTable
        columns={columns({ onEdit: setEditing, onItems: setItemsShipment, onDelete: handleDelete, canEdit, canDelete })}
        data={data?.results ?? []}
      />
      <CreateShipmentDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditShipmentDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          shipment={editing}
        />
      )}
      {itemsShipment && (
        <ItemsDialog
          open={!!itemsShipment}
          onOpenChange={(open) => { if (!open) setItemsShipment(null) }}
          shipmentId={itemsShipment.id}
          trackingNumber={itemsShipment.tracking_number}
        />
      )}
    </div>
  )
}
