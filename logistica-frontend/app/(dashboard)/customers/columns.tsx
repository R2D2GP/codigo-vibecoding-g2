"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Customer } from "@/types"
import { useCan } from "@/hooks/use-can"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColumnsProps {
  onEdit: (customer: Customer) => void
  onDelete: (id: number) => void
}

const typeLabels: Record<string, string> = {
  COMPANY: "Empresa",
  INDIVIDUAL: "Individual",
}

export function columns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Customer>[] {
  const canEdit = useCan("customers.change_customer")
  const canDelete = useCan("customers.delete_customer")
  return [
    { accessorKey: "id", header: "ID", meta: { className: "hidden md:table-cell" } },
    { accessorKey: "name", header: "Nombre" },
    {
      accessorKey: "customer_type",
      header: "Tipo",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => typeLabels[row.original.customer_type] ?? row.original.customer_type,
    },
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
