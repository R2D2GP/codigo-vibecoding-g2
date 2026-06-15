# Estrategia MVP — Logística Frontend

## Stack

| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Componentes | shadcn/ui |
| Tablas | TanStack Table |
| Peticiones | Axios + TanStack Query |
| Estado global | Zustand (auth + UI state) |
| Autenticación | JWT Bearer (simplejwt) |

## Metodología: Spec-Driven Development (SDD)

Cada módulo pasa por 3 fases antes de darse por terminado:

```
Spect → Implement → Validator
  │          │           │
  │     (loop si       │
  │     hay errores)◄───┘
  ▼
 Siguiente módulo
```

## Alcance del MVP

CRUD completo de los 8 módulos del backend. Cada módulo = 1 página con tabla (TanStack Table) + diálogo modal de create/edit (shadcn Dialog + Form).

| # | Módulo | Página | Depende de |
|---|--------|--------|------------|
| — | Auth + Setup | `/login`, layout | — |
| 1 | Almacenes | `/warehouses` | — |
| 2 | Proveedores | `/suppliers` | — |
| 3 | Clientes | `/customers` | — |
| 4 | Transporte | `/transport` | — |
| 5 | Productos | `/products` | suppliers, warehouses |
| 6 | Rutas + Paradas | `/routes`, `/routes/{id}/stops` | warehouses |
| 7 | Conductores | `/drivers` | transport |
| 8 | Envíos + Items | `/shipments`, `/shipments/{id}/items` | customers, drivers, transport, routes, warehouses, products |

## Patrón por módulo

Cada módulo de frontend sigue la misma estructura:

```
app/(dashboard)/{modulo}/
├── page.tsx                  ← Server component: layout + título
├── columns.tsx               ← Columnas TanStack Table (client)
├── data-table.tsx            ← TanStack Table component (client)
├── create-dialog.tsx         ← shadcn Dialog + form crear (client)
└── edit-dialog.tsx           ← shadcn Dialog + form editar (client)

hooks/use-{modulo}.ts        ← TanStack Query hooks (GET list, GET by id, CREATE, UPDATE, DELETE)
```

Para módulos nested (route stops, shipment items) se usa:

```
app/(dashboard)/routes/{id}/stops/
├── page.tsx
├── columns.tsx
├── data-table.tsx
├── create-dialog.tsx
└── edit-dialog.tsx

hooks/use-route-stops.ts
```

## Estructura completa del proyecto

```
logistica-frontend/
├── app/
│   ├── layout.tsx              ← Providers (QueryClient, Auth)
│   ├── globals.css
│   ├── page.tsx                ← Redirect a /dashboard
│   ├── login/
│   │   └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Top nav
│   │   ├── page.tsx            ← Dashboard home / stats
│   │   ├── customers/
│   │   ├── warehouses/
│   │   ├── suppliers/
│   │   ├── transport/
│   │   ├── products/
│   │   ├── routes/
│   │   │   └── [id]/
│   │   │       └── stops/
│   │   ├── drivers/
│   │   └── shipments/
│   │       └── [id]/
│   │           └── items/
├── components/
│   ├── ui/                     ← shadcn components
│   └── shared/
│       ├── data-table.tsx       ← TanStack Table genérico
│       └── form-dialog.tsx     ← shadcn Dialog + Form genérico
├── hooks/
│   ├── use-auth.ts
│   ├── use-warehouses.ts
│   ├── use-suppliers.ts
│   ├── use-customers.ts
│   ├── use-transport.ts
│   ├── use-products.ts
│   ├── use-routes.ts
│   ├── use-route-stops.ts
│   ├── use-drivers.ts
│   ├── use-shipments.ts
│   └── use-shipment-items.ts
├── lib/
│   ├── api.ts                  ← Axios instance + JWT interceptor
│   └── utils.ts                ← cn() helper
├── providers/
│   └── query-provider.tsx
├── stores/
│   └── auth-store.ts           ← Zustand
├── types/
│   └── index.ts                ← TypeScript interfaces de cada entidad
└── specs/                      ← SDD task files
```

## Orden de construcción

```
Fase 0 — Setup (ejecutar 1 vez)
  ├── npx shadcn@latest init
  ├── lib/api.ts (Axios + interceptor)
  ├── lib/utils.ts (cn)
  ├── providers/query-provider.tsx
  ├── stores/auth-store.ts (Zustand)
  ├── types/index.ts
  ├── app/layout.tsx (providers wrapper)
  ├── app/login/page.tsx
  └── app/(dashboard)/layout.tsx (top nav)

Fase 1 — Sin dependencias
  ├── warehouses
  ├── suppliers
  ├── customers
  └── transport

Fase 2 — Dependen de Fase 1
  ├── products   (FK a supplier, warehouse)
  └── routes     (FK a warehouse) + nested stops

Fase 3 — Depende de Fase 1
  └── drivers    (FK a transport)

Fase 4 — Depende de todo
  └── shipments  (FK a customers, drivers, transport, routes, warehouse) + nested items
```

## Reglas

- **1 módulo a la vez** — nunca saltar al siguiente sin validar el actual
- **Siempre leer `docs/backend-api-reference.md`** antes de implementar un módulo
- **Código y nombres en inglés**, mensajes en español
- **Server Components** por defecto, `'use client'` solo en componentes interactivos
- **DataTable genérico** reutilizable para todos los módulos
- **Formularios modales** (Dialog) para create/edit, no páginas separadas
