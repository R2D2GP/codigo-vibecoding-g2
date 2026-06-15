"use client"

import { useState } from "react"
import { useCustomerList, useDeleteCustomer } from "@/hooks/use-customers"
import { useCan } from "@/hooks/use-can"
import { DataTable } from "@/components/shared/data-table"
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { CreateCustomerDialog } from "./create-dialog"
import { EditCustomerDialog } from "./edit-dialog"
import { toast } from "sonner"
import type { Customer } from "@/types"
import type { AxiosError } from "axios"

export function CustomerTable() {
  const { data, isLoading, isError, refetch } = useCustomerList()
  const deleteMutation = useDeleteCustomer()
  const canCreate = useCan("customers.add_customer")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  if (isLoading) return <DataTableSkeleton rows={8} columns={7} />
  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">Error al cargar clientes</p>
      <p className="text-xs text-muted-foreground">Ocurrió un error al obtener los datos</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Reintentar
      </Button>
    </div>
  )

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Cliente eliminado")
    } catch {
      toast.error("Error al eliminar cliente")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo cliente
          </Button>
        )}
      </div>
      <DataTable columns={columns({ onEdit: setEditing, onDelete: handleDelete })} data={data?.results ?? []} />
      <CreateCustomerDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditCustomerDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          customer={editing}
        />
      )}
    </div>
  )
}
