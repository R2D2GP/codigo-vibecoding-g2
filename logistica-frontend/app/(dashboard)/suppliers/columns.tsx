"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Supplier } from "@/types"
import { useCan } from "@/hooks/use-can"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  onEdit: (supplier: Supplier) => void
  onDelete: (id: number) => void
}

export function columns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Supplier>[] {
  const canEdit = useCan("suppliers.change_supplier")
  const canDelete = useCan("suppliers.delete_supplier")
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "contact_name", header: "Contacto", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "email", header: "Email", meta: { className: "hidden lg:table-cell" } },
    { accessorKey: "phone", header: "Teléfono", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "city", header: "Ciudad", meta: { className: "hidden md:table-cell" } },
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
