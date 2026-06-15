import type { ColumnDef } from "@tanstack/react-table"
import type { Warehouse } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  onEdit: (warehouse: Warehouse) => void
  onDelete: (id: number) => void
  canEdit: boolean
  canDelete: boolean
}

export function columns({ onEdit, onDelete, canEdit, canDelete }: ColumnsProps): ColumnDef<Warehouse>[] {
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "city", header: "Ciudad", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "country", header: "País", meta: { className: "hidden md:table-cell" } },
    {
      accessorKey: "capacity_m3",
      header: "Capacidad (m³)",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => `${row.original.capacity_m3} m³`,
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
