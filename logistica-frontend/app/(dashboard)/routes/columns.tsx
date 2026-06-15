"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Route } from "@/types"
import { useCan } from "@/hooks/use-can"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  onEdit: (route: Route) => void
  onStops: (route: Route) => void
  onDelete: (id: number) => void
}

export function columns({ onEdit, onStops, onDelete }: ColumnsProps): ColumnDef<Route>[] {
  const canEdit = useCan("routes.change_route")
  const canDelete = useCan("routes.delete_route")
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "origin_warehouse_name", header: "Almacén origen", meta: { className: "hidden md:table-cell" } },
    {
      accessorKey: "estimated_duration_hours",
      header: "Duración (h)",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => `${row.original.estimated_duration_hours}h`,
    },
    {
      accessorKey: "estimated_distance_km",
      header: "Distancia (km)",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => `${row.original.estimated_distance_km} km`,
    },
    {
      accessorKey: "stops",
      header: "Paradas",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => `${row.original.stops?.length ?? 0}`,
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
          <Button variant="outline" size="sm" onClick={() => onStops(row.original)} aria-label={`Paradas de ${row.original.name}`}>
            Paradas
          </Button>
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
