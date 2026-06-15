# Implement — Agente de Implementación

## Rol
Lee las tareas definidas por Spect en `specs/{module}-tasks.md` y escribe el código siguiendo el stack del proyecto.

## Inputs

- `specs/{module}-tasks.md` — Lista de tareas a implementar
- `docs/mvp.md` — Patrones de implementación, estructura
- `docs/backend-api-reference.md` — Endpoints, campos, filtros
- `AGENTS.md` — Reglas del proyecto

## Patrones de implementación

### types/index.ts — Interfaz del modelo

```typescript
export interface Warehouse {
  id: number
  name: string
  address: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  capacity_m3: number
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### lib/api.ts — Axios instance (solo crear 1 vez en Setup)

```typescript
import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(err)
  }
)
```

### providers/query-provider.tsx — TanStack Query (solo crear 1 vez en Setup)

```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

### stores/auth-store.ts — Zustand (solo crear 1 vez en Setup)

```typescript
import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: { username: string } | null
  login: (access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  login: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
  logout: () => set({ accessToken: null, refreshToken: null, user: null }),
}))
```

### hooks/use-{module}.ts — TanStack Query hooks

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Warehouse } from '@/types'

export function useWarehouseList() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get('/warehouses/').then((r) => r.data),
  })
}

export function useWarehouse(id: number) {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => api.get(`/warehouses/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) =>
      api.post('/warehouses/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}

export function useUpdateWarehouse(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Warehouse>) =>
      api.patch(`/warehouses/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}

export function useDeleteWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/warehouses/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  })
}
```

### components/shared/data-table.tsx — TanStack Table genérico

```typescript
'use client'
import {
  ColumnDef, flexRender, getCoreRowModel, useReactTable,
  getPaginationRowModel, getSortedRowModel, SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data, columns, state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} onClick={h.column.getToggleSortingHandler()}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted() as string] ?? ''}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
```

### Página tipo (server component + client components)

**page.tsx** (Server Component):
```typescript
import { Suspense } from 'react'
import { WarehouseTable } from './warehouse-table'

export default function WarehousesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Almacenes</h1>
      <Suspense fallback={<div>Cargando...</div>}>
        <WarehouseTable />
      </Suspense>
    </div>
  )
}
```

**warehouse-table.tsx** (Client Component — wrapped by Suspense):
```typescript
'use client'
import { useWarehouseList, useDeleteWarehouse } from '@/hooks/use-warehouses'
import { DataTable } from '@/components/shared/data-table'
import { columns } from './columns'

export function WarehouseTable() {
  const { data, isLoading } = useWarehouseList()
  const deleteMutation = useDeleteWarehouse()
  if (isLoading) return <div>Cargando...</div>
  return <DataTable columns={columns} data={data?.results ?? []} />
}
```

**columns.tsx**:
```typescript
'use client'
import type { ColumnDef } from '@tanstack/react-table'
import type { Warehouse } from '@/types'
import { Button } from '@/components/ui/button'

export const columns: ColumnDef<Warehouse>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'city', header: 'Ciudad' },
  { accessorKey: 'capacity_m3', header: 'Capacidad (m³)' },
  { accessorKey: 'is_active', header: 'Activo' },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Editar</Button>
        <Button variant="destructive" size="sm">Eliminar</Button>
      </div>
    ),
  },
]
```

## Reglas

- **No agregar comentarios** en el código
- Seguir Server Components por defecto, `'use client'` solo en interactivos
- Usar el DataTable genérico de `components/shared/data-table.tsx`
- Usar shadcn Dialog + Form para create/edit
- Formularios modales, no páginas separadas
- Campos FK = shadcn Select o ComboBox poblado con TanStack Query
- Manejar loading, error y empty states en cada página
- Respetar las reglas de idioma: código en inglés, UI en español
- Verificar imports antes de finalizar
- No crear shadcn components manualmente — usar `npx shadcn@latest add <component>`
