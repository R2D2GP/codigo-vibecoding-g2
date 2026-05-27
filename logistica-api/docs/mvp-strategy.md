# Estrategia MVP — Logística API

## Metodología: Spec-Driven Development (SDD)

El desarrollo del MVP sigue la metodología **SDD (Spec-Driven Development)**, donde cada módulo pasa por un pipeline de 3 fases antes de ser dado por terminado:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   SPECT     │ ──► │  IMPLEMENT   │ ──► │  VALIDATOR   │
│  (especs)   │     │  (código)    │     │  (revisión)  │
└─────────────┘     └──────────────┘     └──────────────┘
                                            │
                                      ┌─────┴─────┐
                                      │           │
                                    Errores    OK ✔
                                      │
                                      ▼
                                Vuelve a
                              IMPLEMENT
```

## Alcance del MVP

CRUD completo de los 8 módulos del sistema:

| # | Módulo | App Django | Endpoints |
|---|--------|-----------|-----------|
| 1 | Clientes | `apps.customers` | `/api/v1/customers/` |
| 2 | Almacenes | `apps.warehouses` | `/api/v1/warehouses/` |
| 3 | Proveedores | `apps.suppliers` | `/api/v1/suppliers/` |
| 4 | Transporte | `apps.transport` | `/api/v1/transport/` |
| 5 | Productos | `apps.products` | `/api/v1/products/` |
| 6 | Rutas + Paradas | `apps.routes` | `/api/v1/routes/`, `/api/v1/routes/{id}/stops/` |
| 7 | Conductores | `apps.drivers` | `/api/v1/drivers/` |
| 8 | Envíos + Items | `apps.shipments` | `/api/v1/shipments/`, `/api/v1/shipments/{id}/items/` |
| — | Autenticación | Django Auth + JWT | `/api/v1/auth/token/`, `/api/v1/auth/token/refresh/` |
| — | Documentación | drf-spectacular | `/api/v1/schema/`, `/api/v1/docs/` |

## Orden de desarrollo

Se sigue el grafo de dependencias definido en `docs/architecture.md`:

```
Fase 1 — Sin dependencias
  ├── warehouses
  ├── suppliers
  ├── customers
  └── transport

Fase 2 — Dependen de Fase 1
  ├── products  (→ warehouses, suppliers)
  └── routes    (→ warehouses)

Fase 3 — Depende de Fase 1 + 2
  └── drivers   (→ transport, auth_user)

Fase 4 — Depende de todo
  └── shipments (→ customers, drivers, transport, routes, warehouses, products)

Fase 5 — Infraestructura
  ├── Auth (JWT + Django Users)
  └── Documentación API (Swagger)
```

## Autenticación

- **Django Auth** como backend de usuarios (tabla `auth_user`)
- **JWT** con `djangorestframework-simplejwt` para API stateless
- Endpoints:
  - `POST /api/v1/auth/token/` → obtener access + refresh token
  - `POST /api/v1/auth/token/refresh/` → refrescar access token
- Conductores (`drivers`) se vinculan 1:1 con `auth_user`

## Arquitectura

- **Patrón**: ModelViewSet DRF por cada modelo
- **Soft delete**: `is_active=False` en todos los modelos
- **Paginación**: 20 ítems por página (PageNumberPagination)
- **Filtros**: django-filter, SearchFilter, OrderingFilter
- **Rutas anidadas**: route_stops bajo routes, shipment_items bajo shipments
- **Permisos**: Todos los endpoints requieren JWT por defecto

## Stack para Railway

| Componente | Tecnología |
|------------|-----------|
| Web Server | Gunicorn (WSGI) |
| Base de datos | PostgreSQL (Railway add-on) |
| Variables de entorno | `SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` |
| Deploy | `railway up` o GitHub integration |

### `Procfile` (para Railway)
```
web: gunicorn config.wsgi --log-file -
```

### `runtime.txt`
```
python-3.14
```

## Equipo de agentes SDD

| Agente | Archivo | Responsabilidad |
|--------|---------|----------------|
| 🎯 Orchestrator | `.opencode/agents/orchestrator.md` | Orquesta el pipeline. **Siempre ejecutar primero.** |
| 📋 Spect | `.opencode/agents/spect.md` | Crea `spec/{module}-tasks.md` con tareas detalladas |
| ⚙️ Implement | `.opencode/agents/implement.md` | Implementa el código según las specs |
| ✅ Validator | `.opencode/agents/validator.md` | Revisa el código y reporta errores en `spec/{module}-errors.md` |

## Criterios de aceptación del MVP

- [ ] Todos los modelos creados según `docs/database-schema.md`
- [ ] Todos los endpoints CRUD funcionales
- [ ] Autenticación JWT funcionando
- [ ] `python manage.py check` — sin errores
- [ ] `python manage.py migrate` — migraciones aplicadas limpiamente
- [ ] Swagger UI accesible en `/api/v1/docs/`
- [ ] Flujo completo: token → warehouse → supplier → product → customer → shipment con items

## Configuración de Railway

El archivo `config/settings/production.py` usa `python-decouple` para leer variables de entorno. En Railway se deben configurar:

```
SECRET_KEY=<generated-secret>
DEBUG=False
ALLOWED_HOSTS=.railway.app,localhost
CORS_ALLOWED_ORIGINS=https://frontend-domain.com
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<db-password>
DB_HOST=<railway-host>
DB_PORT=5432
```

Ver `requirements/production.txt` para dependencias de producción.
