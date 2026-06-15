# logistica-frontend — AGENTS.md

Part of a 3-package monorepo:
- `logistica-api/` — Django REST API, specs at `logistica-api/AGENTS.md`
- `logistica-frontend/` — this package
- `task.manager/` — separate Express + React app, specs at `task.manager/opencode.md`

## Commands

```
npm run dev       # next dev — dev server on :3000
npm run build     # next build
npm run start     # next start (prod)
npm run lint      # eslint
```

No test or typecheck scripts exist. No opencode.json in this directory.
No test framework installed — add one if testing is needed.

## Tech stack quirks

- **Tailwind CSS 4**: uses `@import "tailwindcss"` (not `@tailwind` directives).
  Custom theme values go inside `@theme inline { ... }`.
- **Alias**: `@/*` maps to project root (configured in tsconfig paths + Next.js automatically).
- **Fonts**: Geist / Geist Mono loaded via `next/font/google`.
- **App Router**: `app/` directory — layout in `app/layout.tsx`.
- **No env vars are defined yet** for the frontend (API URL, etc. — the Django `.env.example` expects requests from `localhost:5173` but that was for a different frontend).

## Stack adicional

| Librería | Uso |
|---|---|
| shadcn/ui | Componentes base (botones, inputs, diálogos, forms, tabs) |
| TanStack Table | Todas las tablas del proyecto |
| TanStack Query | Server state (fetches, cache, mutations) |
| Axios | HTTP client con interceptor JWT |
| Zustand | Estado cliente (auth, UI) |

Agregar componentes shadcn con `npx shadcn@latest add <componente>`. No crearlos a mano.

## SDD Pipeline

Este proyecto usa **Spec-Driven Development**. El pipeline lo gestiona el **Orchestrator**:

| Agente | Archivo | Rol |
|---|---|---|
| 🎯 Orchestrator | `.opencode/agents/orchestrator.md` | Orquesta el pipeline. **Siempre ejecutar primero.** |
| 📋 Spect | `.opencode/agents/spect.md` | Crea `specs/{module}-tasks.md` |
| ⚙️ Implement | `.opencode/agents/implement.md` | Implementa código según specs |
| ✅ Validator | `.opencode/agents/validator.md` | Valida código vs specs |

**Flujo:** Spect → (aprobación humana) → Implement → Validator → (loop si errores) → siguiente módulo.

Reglas:
- **1 módulo a la vez**, respetando el orden de fases
- Leer `docs/backend-api-reference.md` antes de cada módulo
- Leer `docs/mvp.md` para orden y patrones
- Código en inglés, UI en español

## Backend API (`logistica-api/`)

**Base:** `http://localhost:8000/api/v1/` — JWT Bearer auth, 20 items/page pagination.
Full reference: `docs/backend-api-reference.md`

### 8 modules + auth

| Módulo | Prefix | ModelViewSet | Nested |
|---|---|---|---|
| Auth | `/auth/token/` | POST-only (login/refresh) | — |
| Customers | `/customers/` | sí | — |
| Warehouses | `/warehouses/` | sí | — |
| Suppliers | `/suppliers/` | sí | — |
| Products | `/products/` | sí | FK a supplier, warehouse |
| Transport | `/transport/` | sí | — |
| Drivers | `/drivers/` | sí | FK a transport, extend auth_user |
| Routes | `/routes/` | sí | `/routes/{id}/stops/` anidado |
| Shipments | `/shipments/` | sí | `/shipments/{id}/items/` anidado |

### Claves para el frontend

- **Auth primero:** `POST /auth/token/` con username+password → JWT pair. Enviar `Authorization: Bearer <access>` en toda request.
- **Tracking number** auto-generado al crear shipment (`SHP-XXXXXXXX`), read-only.
- **Productos** tienen `supplier_name` y `warehouse_name` virtuales (read-only).
- **Shipments** tienen 5 virtuals: `customer_name`, `origin_warehouse_name`, `driver_name`, `transport_plate`, `route_name`.
- **Stops e Items** son nested: `/routes/{id}/stops/`, `/shipments/{id}/items/`.
- **Filters comunes:** `?search=`, `?ordering=`, `?page=`, `?field__gte=`, `?field__lte=`, `?field__icontains=`.
- **Soft delete** en todos los módulos excepto shipments: el listado filtra `is_active=True`. DELETE = soft delete.
- **Transport** listado solo muestra `is_available=True` por defecto.
- **Convention naming:** código y URLs en inglés, mensajes de error en español.

### Dependencia entre módulos (orden de creación sugerido)

```
Phase 1: warehouses, suppliers, customers, transport
Phase 2: products (→warehouses,suppliers), routes (→warehouses)
Phase 3: drivers (→transport, auth_user)
Phase 4: shipments (→customers,drivers,transport,routes,warehouses,products)
```

## Zod 4 + react-hook-form quirk

`z.coerce.number()` in Zod 4 has input type `unknown`. When using `@hookform/resolvers` v5, `zodResolver(schema)` returns `Resolver<z.input<T>>`, which causes type errors with `useForm<z.output<T>>`. 

**Workaround:** use `useForm<z.output<typeof schema>>()` and cast the resolver:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema) as any,
})
```

Also remove `.optional()` from nullable coerce fields to avoid `undefined` type:
```typescript
latitude: z.coerce.number().nullable()  // not .nullable().optional()
```

## Build History

- 27-May-2026: Created DataTable shared component, form.tsx, fixed Zod 4 type issues. Build passes.
- 27-May-2026: Added suppliers module (hooks, page, table, columns, create/edit dialogs). Build passes.
- 27-May-2026: Added customers module (hooks, page, table, columns, create/edit dialogs with type select). Build passes.
