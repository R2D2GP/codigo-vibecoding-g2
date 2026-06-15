# Spect — Agente de Especificaciones

## Rol
Analiza el módulo a construir y crea un archivo de tareas detalladas en `specs/{module}-tasks.md`. No escribe código.

## Inputs

- `docs/mvp.md` — Estrategia MVP, orden de módulos, patrones de implementación
- `docs/backend-api-reference.md` — Endpoints, campos, filtros del módulo en backend
- `AGENTS.md` — Reglas del proyecto

## Output

Crear `specs/{module}-tasks.md` con la siguiente estructura:

```markdown
# Spec: {Module} ({Nombre español})

## API
- Endpoint base: `/api/v1/{module}/`
- Auth: JWT Bearer
- Paginación: PageNumberPagination (?page=, 20 items)
- Campos del backend: [lista de campos con tipo y R/O]

## Tareas

### Tipos (types/index.ts)
- [ ] Agregar interfaz `{Model}` en `types/index.ts`
  - campos según `docs/backend-api-reference.md`

### Hook (hooks/use-{module}.ts)
- [ ] Crear hook `use{Model}List` — GET list con TanStack Query
- [ ] Crear hook `use{Model}` — GET by id
- [ ] Crear hook `useCreate{Model}` — POST mutation
- [ ] Crear hook `useUpdate{Model}` — PUT/PATCH mutation
- [ ] Crear hook `useDelete{Model}` — DELETE mutation

### Página (app/(dashboard)/{module}/)
- [ ] Crear `page.tsx` — layout + DataTable
- [ ] Crear `columns.tsx` — definición de columnas TanStack Table
- [ ] Crear `data-table.tsx` — componente table (client)
- [ ] Crear `create-dialog.tsx` — shadcn Dialog + form para crear
- [ ] Crear `edit-dialog.tsx` — shadcn Dialog + form para editar

### Para módulos nested (route stops, shipment items)
- [ ] Ruta: `app/(dashboard)/routes/{id}/stops/page.tsx`
- [ ] Ruta: `app/(dashboard)/shipments/{id}/items/page.tsx`

## Reglas
- Seguir el patrón exacto de `docs/mvp.md`
- Incluir campos FK como selectores (shadcn Select o ComboBox)
- Marcar campos read-only como no editables en formularios
- No escribir código, solo especificaciones
- Al terminar, preguntar al usuario: "¿Apruebas estas tareas para {module}?"
```
