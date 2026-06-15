"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { useUpdateDriver } from "@/hooks/use-drivers"
import { useTransportList } from "@/hooks/use-transport"
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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { Driver } from "@/types"

const schema = z.object({
  user: z.coerce.number().min(1, "ID de usuario requerido"),
  transport: z.coerce.number().nullable(),
  license_number: z.string().min(1, "El número de licencia es requerido"),
  license_expiry: z.string().min(1, "La fecha de vencimiento es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
})

type FormData = z.output<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver
}

export function EditDriverDialog({ open, onOpenChange, driver }: Props) {
  const update = useUpdateDriver(driver.id)
  const { data: transportData } = useTransportList()
  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: driver,
  })

  useEffect(() => {
    form.reset(driver)
  }, [driver, form])

  async function onSubmit(data: FormData) {
    try {
      await update.mutateAsync(data)
      toast.success("Conductor actualizado")
      onOpenChange(false)
    } catch (err) {
      const detail = (err as AxiosError<{ detail?: string }>).response?.data?.detail
      toast.error(detail ?? "Error al actualizar conductor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar conductor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const firstKey = Object.keys(errors)[0] as keyof FormData
            try { form.setFocus(firstKey) } catch {}
          })} className="space-y-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de usuario</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de licencia</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license_expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                          <SelectValue placeholder="Sin vehículo" />
                        </SelectTrigger>
                        <SelectContent>
                          {transportData?.results.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.plate_number} - {t.brand} {t.model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
