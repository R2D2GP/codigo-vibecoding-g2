"use client"

import { useState } from "react"
import { useGroupList, useDeleteGroup } from "@/hooks/use-groups"
import { DataTable } from "@/components/shared/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateGroupDialog } from "./create-dialog"
import { EditGroupDialog } from "./edit-dialog"
import type { Group } from "@/types"

export function GroupsTable() {
  const { data, isLoading, isError } = useGroupList()
  const deleteMutation = useDeleteGroup()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)

  if (isLoading) return <div className="text-muted-foreground">Cargando roles...</div>
  if (isError) return <div className="text-destructive">Error al cargar roles</div>

  const handleDelete = (id: number) => {
    if (confirm("¿Eliminar este rol?")) deleteMutation.mutate(id)
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo rol
        </Button>
      </div>
      <DataTable columns={columns({ onEdit: setEditing, onDelete: handleDelete })} data={data?.results ?? []} />
      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditGroupDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null) }}
          group={editing}
        />
      )}
    </div>
  )
}
