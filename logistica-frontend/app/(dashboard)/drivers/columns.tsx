"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Driver } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  onEdit: (driver: Driver) => void
  onDelete: (id: number) => void
  canEdit: boolean
  canDelete: boolean
}

export function columns({ onEdit, onDelete, canEdit, canDelete }: ColumnsProps): ColumnDef<Driver>[] {
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "user_full_name", header: "Nombre" },
    { accessorKey: "user_email", header: "Email", meta: { className: "hidden lg:table-cell" } },
    { accessorKey: "license_number", header: "Licencia", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "license_expiry", header: "Vencimiento lic.", meta: { className: "hidden lg:table-cell" } },
    { accessorKey: "phone", header: "Teléfono", meta: { className: "hidden md:table-cell" } },
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
            <Button variant="outline" size="sm" onClick={() => onEdit(row.original)} aria-label={`Editar ${row.original.user_full_name}`}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(row.original.id)} aria-label={`Eliminar ${row.original.user_full_name}`}>
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ]
}
