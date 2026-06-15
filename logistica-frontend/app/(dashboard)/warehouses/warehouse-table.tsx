"use client"

import { useState } from "react"
import { useWarehouseList, useDeleteWarehouse } from "@/hooks/use-warehouses"
import { useCan } from "@/hooks/use-can"
import { DataTable } from "@/components/shared/data-table"
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { CreateWarehouseDialog } from "./create-dialog"
import { EditWarehouseDialog } from "./edit-dialog"
import { toast } from "sonner"
import type { Warehouse } from "@/types"

const PAGE_SIZE = 20

export function WarehouseTable() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useWarehouseList(page)
  const deleteMutation = useDeleteWarehouse()
  const canCreate = useCan("warehouses.add_warehouse")
  const canEdit = useCan("warehouses.change_warehouse")
  const canDelete = useCan("warehouses.delete_warehouse")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Warehouse | null>(null)

  if (isLoading) return <DataTableSkeleton rows={8} columns={7} />
  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">Error al cargar almacenes</p>
      <p className="text-xs text-muted-foreground">Ocurrió un error al obtener los datos</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Reintentar
      </Button>
    </div>
  )

  const totalCount = data?.count ?? 0
  const lastPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este almacén?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Almacén eliminado")
    } catch {
      toast.error("Error al eliminar almacén")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo almacén
          </Button>
        )}
      </div>
      <DataTable disablePagination columns={columns({ onEdit: setEditing, onDelete: handleDelete, canEdit, canDelete })} data={data?.results ?? []} />
      <div className="flex items-center justify-between gap-2 py-4">
        <p className="text-sm text-muted-foreground">
          Página {page} de {lastPage} ({totalCount} registros)
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      <CreateWarehouseDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditWarehouseDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          warehouse={editing}
        />
      )}
    </div>
  )
}
