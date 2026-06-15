"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { useUpdateShipment } from "@/hooks/use-shipments"
import { useCustomerList } from "@/hooks/use-customers"
import { useWarehouseList } from "@/hooks/use-warehouses"
import { useDriverList } from "@/hooks/use-drivers"
import { useTransportList } from "@/hooks/use-transport"
import { useRouteList } from "@/hooks/use-routes"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { Shipment } from "@/types"

const schema = z.object({
  customer: z.coerce.number().min(1, "El cliente es requerido"),
  origin_warehouse: z.coerce.number().min(1, "El almacén es requerido"),
  driver: z.coerce.number().nullable(),
  transport: z.coerce.number().nullable(),
  route: z.coerce.number().nullable(),
  destination_address: z.string().min(1, "La dirección es requerida"),
  destination_city: z.string().min(1, "La ciudad es requerida"),
  destination_country: z.string().min(1, "El país es requerido"),
  status: z.enum(["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED", "RETURNED"]),
  estimated_delivery_date: z.string().nullable(),
  weight_total_kg: z.coerce.number().min(0, "Debe ser positivo"),
  base_cost: z.coerce.number().min(0, "Debe ser positivo"),
  notes: z.string().nullable(),
})

type FormData = z.output<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment: Shipment
}

export function EditShipmentDialog({ open, onOpenChange, shipment }: Props) {
  const update = useUpdateShipment(shipment.id)
  const { data: customersData } = useCustomerList()
  const { data: warehousesData } = useWarehouseList()
  const { data: driversData } = useDriverList()
  const { data: transportData } = useTransportList()
  const { data: routesData } = useRouteList()
  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: shipment,
  })

  useEffect(() => {
    form.reset(shipment)
  }, [shipment, form])

  async function onSubmit(data: FormData) {
    try {
      await update.mutateAsync(data)
      toast.success("Envío actualizado")
      onOpenChange(false)
    } catch (err) {
      const detail = (err as AxiosError<{ detail?: string }>).response?.data?.detail
      toast.error(detail ?? "Error al actualizar envío")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar envío - {shipment.tracking_number}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const firstKey = Object.keys(errors)[0] as keyof FormData
            try { form.setFocus(firstKey) } catch {}
          })} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Select value={String(field.value || "")} onValueChange={v => field.onChange(Number(v))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(customersData?.results ?? []).map((c) => (
                             <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="origin_warehouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almacén origen</FormLabel>
                    <FormControl>
                      <Select value={String(field.value || "")} onValueChange={v => field.onChange(Number(v))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(warehousesData?.results ?? []).map((w) => (
                             <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <fieldset className="rounded border p-3">
              <legend className="text-sm font-medium px-1">Asignación opcional</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conductor</FormLabel>
                      <FormControl>
                        <Select value={field.value != null ? String(field.value) : ""} onValueChange={v => field.onChange(v ? Number(v) : null)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            {(driversData?.results ?? []).map((d) => (
                               <SelectItem key={d.id} value={String(d.id)}>{d.user_full_name}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehículo</FormLabel>
                      <FormControl>
                        <Select value={field.value != null ? String(field.value) : ""} onValueChange={v => field.onChange(v ? Number(v) : null)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            {(transportData?.results ?? []).map((t) => (
                               <SelectItem key={t.id} value={String(t.id)}>{t.plate_number}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="route"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruta</FormLabel>
                      <FormControl>
                        <Select value={field.value != null ? String(field.value) : ""} onValueChange={v => field.onChange(v ? Number(v) : null)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            {(routesData?.results ?? []).map((r) => (
                               <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
            <fieldset className="rounded border p-3">
              <legend className="text-sm font-medium px-1">Destino</legend>
              <div className="space-y-3 pt-2">
                <FormField
                  control={form.control}
                  name="destination_address"
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
                    name="destination_city"
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
                  <FormField
                    control={form.control}
                    name="destination_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="rounded border p-3">
              <legend className="text-sm font-medium px-1">Detalles</legend>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pendiente</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                              <SelectItem value="IN_TRANSIT">En tránsito</SelectItem>
                              <SelectItem value="DELIVERED">Entregado</SelectItem>
                              <SelectItem value="CANCELLED">Cancelado</SelectItem>
                              <SelectItem value="RETURNED">Devuelto</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight_total_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="base_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo base ($)</FormLabel>
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
                  name="estimated_delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha estimada de entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {update.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
