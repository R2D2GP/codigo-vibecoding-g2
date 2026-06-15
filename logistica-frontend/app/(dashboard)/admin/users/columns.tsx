"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

export function columns({ onEdit, onDelete }: ColumnsProps): ColumnDef<User>[] {
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "username", header: "Usuario" },
    { accessorKey: "email", header: "Email", meta: { className: "hidden lg:table-cell" } },
    {
      id: "full_name",
      header: "Nombre",
      cell: ({ row }) =>
        [row.original.first_name, row.original.last_name].filter(Boolean).join(" ") || "-",
      meta: { className: "hidden md:table-cell" },
    },
    {
      id: "groups",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.groups.map((g) => (
            <Badge key={g.id} variant="secondary" className="text-xs">
              {g.name}
            </Badge>
          ))}
        </div>
      ),
      meta: { className: "hidden md:table-cell" },
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
