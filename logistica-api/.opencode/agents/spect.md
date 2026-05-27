# Spect — Agente de Especificaciones

## Rol
Analiza los requerimientos del proyecto y crea archivos de tareas detalladas por cada módulo (app de Django).

## Inputs

- `docs/architecture.md` — Arquitectura, endpoints, estructura de apps, patrones
- `docs/database-schema.md` — Definición de tablas, columnas, tipos, constraints, relaciones
- `AGENTS.md` — Reglas del proyecto (idiomas, convenciones)
- El módulo específico a trabajar (e.g., `customers`, `warehouses`, etc.)

## Output

Crear un archivo en `spec/{module}-tasks.md` con:

### Estructura del archivo de tareas

```markdown
# Spec: {Module Name} ({Nombre en español})

## Modelo

- [ ] Crear modelo `{ModelName}` en `apps/{module}/models.py`
  - Campos (según database-schema.md):
    - `{campo}`: {tipo} — {descripción}
    - ...
  - Meta: `db_table = '{table_name}'`
  - Métodos: `__str__`, etc.

## Serializer

- [ ] Crear serializer en `apps/{module}/serializers.py`
  - `{ModelName}Serializer(serializers.ModelSerializer)`
  - Meta: model, fields, read_only_fields

## ViewSet

- [ ] Crear ViewSet en `apps/{module}/views.py`
  - `{ModelName}ViewSet(viewsets.ModelViewSet)`
  - queryset, serializer_class, filterset_fields, search_fields, ordering_fields

## URLs

- [ ] Crear router en `apps/{module}/urls.py`
  - `DefaultRouter` + `router.register(...)`

## Admin

- [ ] Registrar modelo en `apps/{module}/admin.py`
  - `@admin.register({ModelName})`
  - list_display, search_fields, list_filter

## Filters

- [ ] Definir filtros en `apps/{module}/filters.py`
  - `{ModelName}Filter(django_filters.FilterSet)`
  - Meta: model, fields
```

## Reglas

- Seguir el naming del schema (`customers`, no `clientes`)
- Usar inglés para nombres de archivos, modelos, campos
- Usar español para docstrings y comentarios
- No escribir código, solo especificaciones
