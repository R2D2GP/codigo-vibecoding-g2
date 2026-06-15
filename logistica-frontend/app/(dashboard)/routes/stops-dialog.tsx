"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useStopList, useCreateStop, useUpdateStop, useDeleteStop } from "@/hooks/use-routes"
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
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  routeId: number
  routeName: string
}

const stopSchema = z.object({
  stop_order: z.coerce.number().int().min(1, "Debe ser positivo"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  latitude: z.coerce.number().nullable(),
  longitude: z.coerce.number().nullable(),
  estimated_offset_hours: z.coerce.number().min(0, "Debe ser positivo"),
})

type StopFormData = z.output<typeof stopSchema>

export function StopsDialog({ open, onOpenChange, routeId, routeName }: Props) {
  const { data: stops, isLoading } = useStopList(routeId)
  const createStop = useCreateStop(routeId)
  const updateStop = useUpdateStop(routeId, 0)
  const deleteStop = useDeleteStop(routeId)
  const form = useForm<StopFormData>({
    resolver: zodResolver(stopSchema) as any,
    defaultValues: { stop_order: 1, estimated_offset_hours: 0 },
  })

  async function onSubmit(data: StopFormData) {
    try {
      await createStop.mutateAsync(data)
      toast.success("Parada agregada")
      form.reset({ stop_order: (stops?.length ?? 0) + 2, estimated_offset_hours: 0 })
    } catch (err) {
      const detail = (err as AxiosError<{ detail?: string }>).response?.data?.detail
      toast.error(detail ?? "Error al agregar parada")
    }
  }

  async function handleDelete(stopId: number) {
    if (!confirm("¿Eliminar esta parada?")) return
    try {
      await deleteStop.mutateAsync(stopId)
      toast.success("Parada eliminada")
    } catch {
      toast.error("Error al eliminar parada")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Paradas - {routeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading && <p className="text-muted-foreground">Cargando...</p>}
            {stops?.length === 0 && <p className="text-muted-foreground">Sin paradas</p>}
            {stops?.map((stop) => (
              <div key={stop.id} className="flex items-start gap-2 rounded border p-2 text-sm">
                <div className="flex-1 space-y-1">
                  <p className="font-medium">#{stop.stop_order} - {stop.address}, {stop.city}</p>
                  <p className="text-muted-foreground">Offset: {stop.estimated_offset_hours}h</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(stop.id)} aria-label={`Eliminar parada #${stop.stop_order}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Agregar parada</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
              const firstKey = Object.keys(errors)[0] as keyof StopFormData
              try { form.setFocus(firstKey) } catch {}
            })} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="stop_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orden</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber ?? e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimated_offset_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offset (h)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Lat</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.000001" {...field} value={field.value == null ? "" : field.value} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Lng</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.000001" {...field} value={field.value == null ? "" : field.value} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={createStop.isPending}>
                  {createStop.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                  Agregar
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
