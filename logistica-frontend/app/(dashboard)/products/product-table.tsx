"use client"

import { useState } from "react"
import { useProductList, useDeleteProduct } from "@/hooks/use-products"
import { useCan } from "@/hooks/use-can"
import { DataTable } from "@/components/shared/data-table"
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { CreateProductDialog } from "./create-dialog"
import { EditProductDialog } from "./edit-dialog"
import { toast } from "sonner"
import type { Product } from "@/types"

export function ProductTable() {
  const { data, isLoading, isError, refetch } = useProductList()
  const deleteMutation = useDeleteProduct()
  const canCreate = useCan("products.add_product")
  const canEdit = useCan("products.change_product")
  const canDelete = useCan("products.delete_product")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  if (isLoading) return <DataTableSkeleton rows={8} columns={8} />
  if (isError) return (
    <div className="flex flex-col items-center gap-3 py-12 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">Error al cargar productos</p>
      <p className="text-xs text-muted-foreground">Ocurrió un error al obtener los datos</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Reintentar
      </Button>
    </div>
  )

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Producto eliminado")
    } catch {
      toast.error("Error al eliminar producto")
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo producto
          </Button>
        )}
      </div>
      <DataTable columns={columns({ onEdit: setEditing, onDelete: handleDelete, canEdit, canDelete })} data={data?.results ?? []} />
      <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditProductDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          product={editing}
        />
      )}
    </div>
  )
}
