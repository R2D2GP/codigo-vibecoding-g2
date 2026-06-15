"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { useUpdateGroup, usePermissionList } from "@/hooks/use-groups"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { Group } from "@/types"

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  permission_ids: z.array(z.number()),
})

type FormData = z.output<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
}

export function EditGroupDialog({ open, onOpenChange, group }: Props) {
  const update = useUpdateGroup(group.id)
  const { data: permData } = usePermissionList()
  const permissions = permData?.results ?? []

  const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
    if (!acc[p.app_label]) acc[p.app_label] = []
    acc[p.app_label].push(p)
    return acc
  }, {})

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: group.name,
      permission_ids: group.permissions.map((p) => p.id),
    },
  })

  useEffect(() => {
    form.reset({
      name: group.name,
      permission_ids: group.permissions.map((p) => p.id),
    })
  }, [group, form])

  async function onSubmit(data: FormData) {
    try {
      await update.mutateAsync(data as any)
      toast.success("Rol actualizado")
      onOpenChange(false)
    } catch {
      toast.error("Error al actualizar rol")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar rol</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del rol</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permission_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Permisos</FormLabel>
                  <div className="space-y-3 border rounded-md p-3 max-h-64 overflow-y-auto">
                    {Object.entries(grouped).map(([appLabel, perms]) => (
                      <div key={appLabel}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                          {appLabel}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {perms.map((p) => (
                            <FormField
                              key={p.id}
                              control={form.control}
                              name="permission_ids"
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value.includes(p.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, p.id])
                                        } else {
                                          field.onChange(field.value.filter((id: number) => id !== p.id))
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="!mt-0 text-sm font-normal leading-tight">
                                    {p.name}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
