"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useShipmentItemList, useCreateShipmentItem, useDeleteShipmentItem } from "@/hooks/use-shipments"
import { useProductList } from "@/hooks/use-products"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipmentId: number
  trackingNumber: string
}

const itemSchema = z.object({
  product: z.coerce.number().min(1, "El producto es requerido"),
  quantity: z.coerce.number().int().min(1, "Debe ser al menos 1"),
  unit_price_at_time: z.coerce.number().min(0, "Debe ser positivo"),
})

type ItemFormData = z.output<typeof itemSchema>

export function ItemsDialog({ open, onOpenChange, shipmentId, trackingNumber }: Props) {
  const { data: items, isLoading } = useShipmentItemList(shipmentId)
  const createItem = useCreateShipmentItem(shipmentId)
  const deleteItem = useDeleteShipmentItem(shipmentId)
  const { data: productsData } = useProductList()
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema) as any,
  })

  async function onSubmit(data: ItemFormData) {
    try {
      await createItem.mutateAsync(data)
      toast.success("Ítem agregado")
      form.reset()
    } catch (err) {
      const axiosErr = err as AxiosError<Record<string, unknown>>
      const detail = axiosErr.response?.data?.detail
      if (typeof detail === "string" && detail) {
        toast.error(detail)
      } else if (axiosErr.response?.data) {
        const fieldErrors = Object.entries(axiosErr.response.data)
          .filter(([k]) => k !== "detail")
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ")
        toast.error(fieldErrors || "Error al agregar ítem")
      } else {
        toast.error(axiosErr.message || "Error al agregar ítem")
      }
    }
  }

  async function handleDelete(itemId: number) {
    if (confirm("¿Eliminar este ítem?")) {
      deleteItem.mutate(itemId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ítems - {trackingNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading && <p className="text-muted-foreground">Cargando...</p>}
            {items?.results?.length === 0 && <p className="text-muted-foreground">Sin ítems</p>}
            {items?.results?.map((item) => (
              <div key={item.id} className="flex items-start gap-2 rounded border p-2 text-sm">
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} uds x ${Number(item.unit_price_at_time).toFixed(2)} = ${Number(item.subtotal).toFixed(2)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} aria-label={`Eliminar ítem de ${item.product_name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Agregar ítem</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
              const firstKey = Object.keys(errors)[0] as keyof ItemFormData
              try { form.setFocus(firstKey) } catch {}
            })} className="space-y-3">
                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producto</FormLabel>
                      <FormControl>
                        <Select value={String(field.value || "")} onValueChange={v => field.onChange(Number(v))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {productsData?.results.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>{p.name} (${Number(p.unit_price).toFixed(2)})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber ?? e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit_price_at_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio unitario ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" size="sm" disabled={createItem.isPending}>
                  {createItem.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
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
