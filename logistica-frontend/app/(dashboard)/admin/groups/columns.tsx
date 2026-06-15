"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Group } from "@/types"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
  onEdit: (group: Group) => void
  onDelete: (id: number) => void
}

export function columns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Group>[] {
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "name", header: "Nombre" },
    {
      id: "permissions_count",
      header: "Permisos",
      cell: ({ row }) => `${row.original.permissions.length} permisos`,
      meta: { className: "hidden md:table-cell" },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(row.original.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]
}
