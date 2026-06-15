"use client"

import { useState } from "react"
import { useUserList, useDeleteUser } from "@/hooks/use-users"
import { DataTable } from "@/components/shared/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateUserDialog } from "./create-dialog"
import { EditUserDialog } from "./edit-dialog"
import type { User } from "@/types"

export function UsersTable() {
  const { data, isLoading, isError } = useUserList()
  const deleteMutation = useDeleteUser()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  if (isLoading) return <div className="text-muted-foreground">Cargando usuarios...</div>
  if (isError) return <div className="text-destructive">Error al cargar usuarios</div>

  const handleDelete = (id: number) => {
    if (confirm("¿Eliminar este usuario?")) deleteMutation.mutate(id)
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo usuario
        </Button>
      </div>
      <DataTable columns={columns({ onEdit: setEditing, onDelete: handleDelete })} data={data?.results ?? []} />
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditUserDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          user={editing}
        />
      )}
    </div>
  )
}
