"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  canEdit: boolean
  canDelete: boolean
}

export function columns({ onEdit, onDelete, canEdit, canDelete }: ColumnsProps): ColumnDef<Product>[] {
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "sku", header: "SKU", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "category", header: "Categoría", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "supplier_name", header: "Proveedor", meta: { className: "hidden lg:table-cell" } },
    { accessorKey: "warehouse_name", header: "Almacén", meta: { className: "hidden lg:table-cell" } },
    {
      accessorKey: "stock_quantity",
      header: "Stock",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => `${row.original.stock_quantity} uds`,
    },
    {
      accessorKey: "unit_price",
      header: "Precio",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => `$${Number(row.original.unit_price).toFixed(2)}`,
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="outline">Activo</Badge>
        ) : (
          <Badge variant="outline">Inactivo</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(row.original)} aria-label={`Editar ${row.original.name}`}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(row.original.id)} aria-label={`Eliminar ${row.original.name}`}>
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ]
}
