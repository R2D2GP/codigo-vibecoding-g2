"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Transport } from "@/types"
import { useCan } from "@/hooks/use-can"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
  onEdit: (transport: Transport) => void
  onDelete: (id: number) => void
}

const typeLabels: Record<string, string> = {
  TRUCK: "Camión",
  VAN: "Camioneta",
  MOTORCYCLE: "Moto",
  CARGO_BIKE: "Bicicleta",
}

export function columns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Transport>[] {
  const canEdit = useCan("transport.change_transport")
  const canDelete = useCan("transport.delete_transport")
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "plate_number", header: "Placa" },
    {
      accessorKey: "transport_type",
      header: "Tipo",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => typeLabels[row.original.transport_type] ?? row.original.transport_type,
    },
    { accessorKey: "brand", header: "Marca", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "model", header: "Modelo", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "year", header: "Año", meta: { className: "hidden lg:table-cell" } },
    {
      accessorKey: "is_available",
      header: "Disponible",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (row.original.is_available ? "Sí" : "No"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(row.original)} aria-label={`Editar ${row.original.plate_number}`}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(row.original.id)} aria-label={`Eliminar ${row.original.plate_number}`}>
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ]
}
