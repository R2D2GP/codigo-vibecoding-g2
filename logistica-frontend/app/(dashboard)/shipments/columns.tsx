"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Shipment } from "@/types"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
  onEdit: (shipment: Shipment) => void
  onItems: (shipment: Shipment) => void
  onDelete: (id: number) => void
  canEdit: boolean
  canDelete: boolean
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  RETURNED: "Devuelto",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-gray-100 text-gray-800",
}

export function columns({ onEdit, onItems, onDelete, canEdit, canDelete }: ColumnsProps): ColumnDef<Shipment>[] {
  return [
    { accessorKey: "tracking_number", header: "Tracking" },
    { accessorKey: "customer_name", header: "Cliente" },
    { accessorKey: "origin_warehouse_name", header: "Origen", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "destination_city", header: "Destino", meta: { className: "hidden md:table-cell" } },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[row.original.status] ?? ""}`}>
          {statusLabels[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "calculated_cost",
      header: "Costo",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => `$${Number(row.original.calculated_cost).toFixed(2)}`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(row.original)} aria-label={`Editar ${row.original.tracking_number}`}>
              Editar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onItems(row.original)} aria-label={`Ítems de ${row.original.tracking_number}`}>
            Ítems
          </Button>
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(row.original.id)} aria-label={`Eliminar ${row.original.tracking_number}`}>
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ]
}
