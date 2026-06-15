# Backend API Reference — Logística API

## Base

| Item | Value |
|---|---|
| **Base URL** | `http://localhost:8000/api/v1/` |
| **Auth** | JWT Bearer (`Authorization: Bearer <access>`) |
| **Pagination** | PageNumberPagination, 20 items/page (`?page=2`) |
| **Search** | `?search=<term>` — busca en `search_fields` del viewset |
| **Ordering** | `?ordering=<field>` (prefijo `-` = descendente) |
| **Filtros exactos** | `?<field>=<value>` |
| **Filtros por rango** | `?<field>__gte=`, `?<field>__lte=` |
| **Filtros substring** | `?<field>__icontains=` |
| **Filtros null** | `?<field>__isnull=true` |
| **Swagger UI** | `http://localhost:8000/api/v1/docs/` |
| **OpenAPI schema** | `http://localhost:8000/api/v1/schema/` |

---

## Auth — `/api/v1/auth/token/`

| Servicio | Endpoint | Body |
|---|---|---|
| Login | `POST /api/v1/auth/token/` | `{ username, password }` → `{ access, refresh }` |
| Refresh | `POST /api/v1/auth/token/refresh/` | `{ refresh }` → `{ access }` |

Access token TTL = 1 h. Refresh token TTL = 7 d.

---

## Admin — `/admin/`

Django Admin site. Solo accesible para superusers. No relevante para el frontend.

---

## Customers — `/api/v1/customers/`

ModelViewSet. List, create, retrieve, update, partial update, destroy.

**Request/Response fields:**

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `name` | string(255) | | |
| `customer_type` | string(10) | | `COMPANY` / `INDIVIDUAL` |
| `tax_id` | string(50) | | unique, nullable |
| `email` | string(254) | | unique |
| `phone` | string(20) | | |
| `address` | string(500) | | |
| `city` | string(100) | | |
| `country` | string(100) | | default `Colombia` |
| `is_active` | boolean | | soft delete |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |

**Filtros:** `customer_type`, `city`, `city__icontains`, `country`, `is_active`
**Search:** `name`, `email`, `tax_id`
**Ordering:** `name`, `created_at`

---

## Warehouses — `/api/v1/warehouses/`

ModelViewSet.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `name` | string(255) | | |
| `address` | string(500) | | |
| `city` | string(100) | | |
| `country` | string(100) | | default `Colombia` |
| `latitude` | decimal(9,6) | | nullable |
| `longitude` | decimal(9,6) | | nullable |
| `capacity_m3` | decimal(10,2) | | |
| `is_active` | boolean | | soft delete |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |

**Filtros:** `city`, `city__icontains`, `country`, `is_active`, `capacity_m3__gte`, `capacity_m3__lte`
**Search:** `name`, `address`, `city`
**Ordering:** `name`, `created_at`, `capacity_m3`

---

## Suppliers — `/api/v1/suppliers/`

ModelViewSet.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `name` | string(255) | | |
| `tax_id` | string(50) | | unique, nullable |
| `contact_name` | string(255) | | |
| `email` | string(254) | | |
| `phone` | string(20) | | |
| `address` | string(500) | | |
| `city` | string(100) | | |
| `country` | string(100) | | default `Colombia` |
| `is_active` | boolean | | soft delete |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |

**Filtros:** `city`, `city__icontains`, `country`, `is_active`, `name`, `name__icontains`
**Search:** `name`, `email`, `tax_id`, `contact_name`
**Ordering:** `name`, `created_at`

---

## Products — `/api/v1/products/`

ModelViewSet.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `supplier` | int(FK) | | a `/api/v1/suppliers/` |
| `warehouse` | int(FK) | | a `/api/v1/warehouses/` |
| `name` | string(255) | | |
| `sku` | string(100) | | unique |
| `description` | text | | nullable |
| `category` | string(100) | | ej: laptop, celular |
| `weight_kg` | decimal(8,3) | | |
| `width_cm` | decimal(8,2) | | |
| `height_cm` | decimal(8,2) | | |
| `depth_cm` | decimal(8,2) | | |
| `unit_price` | decimal(12,2) | | |
| `stock_quantity` | int | | default 0 |
| `is_active` | boolean | | soft delete |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |
| `supplier_name` | string | sí | virtual — `supplier.name` |
| `warehouse_name` | string | sí | virtual — `warehouse.name` |

**Filtros:** `category`, `category__icontains`, `supplier`, `warehouse`, `is_active`, `unit_price__gte`, `unit_price__lte`, `stock_quantity__gte`, `stock_quantity__lte`
**Search:** `name`, `sku`, `description`
**Ordering:** `name`, `unit_price`, `created_at`

---

## Transport — `/api/v1/transport/`

ModelViewSet. **Queryset por defecto:** `is_available=True` (solo vehículos disponibles).

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `plate_number` | string(20) | | unique |
| `transport_type` | string(20) | | `TRUCK` / `VAN` / `MOTORCYCLE` / `CARGO_BIKE` |
| `brand` | string(100) | | |
| `model` | string(100) | | |
| `year` | int | | |
| `capacity_kg` | decimal(10,2) | | |
| `capacity_m3` | decimal(8,2) | | |
| `is_available` | boolean | | default true |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |

**Filtros:** `transport_type`, `is_available`, `year`, `year__gte`, `year__lte`, `capacity_kg__gte`, `capacity_kg__lte`
**Search:** `plate_number`, `brand`, `model`
**Ordering:** `plate_number`, `year`, `capacity_kg`

---

## Drivers — `/api/v1/drivers/`

ModelViewSet. Driver extiende `auth_user` de Django via OneToOneField.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `user` | int(FK) | | PK de `auth_user` |
| `transport` | int(FK) | | nullable, a `/api/v1/transport/` |
| `license_number` | string(50) | | unique |
| `license_expiry` | date | | |
| `phone` | string(20) | | |
| `is_active` | boolean | | soft delete |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |
| `user_email` | string | sí | virtual — `user.email` |
| `user_full_name` | string | sí | virtual — `user.get_full_name()` |

**Filtros:** `is_active`, `license_expiry__gte`, `license_expiry__lte`
**Search:** `license_number`, `phone`, `user__email`
**Ordering:** `created_at`

---

## Routes — `/api/v1/routes/`

ModelViewSet. Al obtener una ruta, devuelve array anidado `stops` de solo lectura.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `name` | string(255) | | |
| `origin_warehouse` | int(FK) | | a `/api/v1/warehouses/` |
| `estimated_duration_hours` | decimal(6,2) | | |
| `estimated_distance_km` | decimal(10,2) | | |
| `is_active` | boolean | | soft delete |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |
| `origin_warehouse_name` | string | sí | virtual |
| `stops` | array | sí | paradas anidadas (solo lectura) |

**Filtros:** `origin_warehouse`, `is_active`, `estimated_duration_hours__gte`, `estimated_duration_hours__lte`
**Search:** `name`
**Ordering:** `name`, `estimated_duration_hours`, `estimated_distance_km`

### Route Stops — `/api/v1/routes/{route_pk}/stops/`

Nested ModelViewSet. `route` se auto-asigna del URL.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `route` | int(FK) | sí | auto-asignado |
| `stop_order` | int | | unique junto con `route` |
| `address` | string(500) | | |
| `city` | string(100) | | |
| `latitude` | decimal(9,6) | | nullable |
| `longitude` | decimal(9,6) | | nullable |
| `estimated_offset_hours` | decimal(6,2) | | horas desde inicio de ruta |

**Filtros:** `stop_order`, `stop_order__gte`, `city`, `city__icontains`

---

## Shipments — `/api/v1/shipments/`

ModelViewSet. Unidad central del negocio. **No filtra soft-delete.** Al obtener un envío, devuelve array anidado `items` de solo lectura.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `tracking_number` | string(50) | sí | auto-generado `SHP-XXXXXXXX` |
| `customer` | int(FK) | | a `/api/v1/customers/` |
| `driver` | int(FK) | | nullable |
| `transport` | int(FK) | | nullable |
| `route` | int(FK) | | nullable |
| `origin_warehouse` | int(FK) | | a `/api/v1/warehouses/` |
| `destination_address` | string(500) | | |
| `destination_city` | string(100) | | |
| `destination_country` | string(100) | | default `Colombia` |
| `status` | string(20) | | `PENDING` / `CONFIRMED` / `IN_TRANSIT` / `DELIVERED` / `CANCELLED` / `RETURNED` |
| `estimated_delivery_date` | date | | nullable |
| `actual_delivery_date` | datetime | | nullable |
| `weight_total_kg` | decimal(10,3) | | default 0 |
| `base_cost` | decimal(12,2) | | default 0 |
| `calculated_cost` | decimal(12,2) | | default 0 |
| `notes` | text | | nullable |
| `created_at` | datetime | sí | |
| `updated_at` | datetime | sí | |
| `customer_name` | string | sí | virtual |
| `origin_warehouse_name` | string | sí | virtual |
| `driver_name` | string | sí | virtual, nullable |
| `transport_plate` | string | sí | virtual, nullable |
| `route_name` | string | sí | virtual, nullable |
| `items` | array | sí | ítems anidados (solo lectura) |

**Filtros:** `status`, `customer`, `driver`, `driver__isnull`, `transport`, `transport__isnull`, `destination_city`, `destination_city__icontains`, `destination_country`, `estimated_delivery_date__gte`, `estimated_delivery_date__lte`, `calculated_cost__gte`, `calculated_cost__lte`
**Search:** `tracking_number`, `destination_city`, `destination_address`
**Ordering:** `created_at`, `estimated_delivery_date`, `calculated_cost`

### Shipment Items — `/api/v1/shipments/{shipment_pk}/items/`

Nested ModelViewSet. `shipment` se auto-asigna del URL.

| Campo | Tipo | R/O | Notas |
|---|---|---|---|
| `id` | int | sí | |
| `shipment` | int(FK) | sí | auto-asignado |
| `product` | int(FK) | | a `/api/v1/products/` |
| `quantity` | int | | |
| `unit_price_at_time` | decimal(12,2) | | snapshot del precio al crear envío |
| `subtotal` | decimal(12,2) | sí | auto-calculado |
| `product_name` | string | sí | virtual |

**Filtros:** `product`, `quantity__gte`, `quantity__lte`

---

## Entity relationship diagram

```
auth_user ──────────── drivers ──────── transport
                              │
customers ──── shipments ◄─────┘
                  │  │
                  │  └──── routes ──── route_stops
                  │            │
                  │        warehouses (origin)
                  │
           shipment_items
                  │
              products ──── suppliers
                  │
              warehouses (storage)
```

## Development order (dependencies)

```
Phase 1 (standalone):  warehouses, suppliers, customers, transport
Phase 2 (dep Phase 1): products, routes
Phase 3 (dep 1+2):     drivers
Phase 4 (dep all):      shipments
```
