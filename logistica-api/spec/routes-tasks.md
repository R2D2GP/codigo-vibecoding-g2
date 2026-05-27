# Spec: Routes (Rutas) + Route Stops (Paradas)

## Modelo Route

- [ ] `Route` en `apps/routes/models.py`
  - `name`: CharField(255), NOT NULL
  - `origin_warehouse`: FK → Warehouse, NOT NULL
  - `estimated_duration_hours`: DecimalField(6,2), NOT NULL
  - `estimated_distance_km`: DecimalField(10,2), NOT NULL
  - `is_active`, `created_at`, `updated_at`
  - Meta: `db_table = 'routes'`

## Modelo RouteStop

- [ ] `RouteStop` en `apps/routes/models.py`
  - `route`: FK → Route (related_name='stops'), NOT NULL
  - `stop_order`: IntegerField, NOT NULL
  - `address`: CharField(500), NOT NULL
  - `city`: CharField(100), NOT NULL
  - `latitude`: DecimalField(9,6), null=True
  - `longitude`: DecimalField(9,6), null=True
  - `estimated_offset_hours`: DecimalField(6,2), NOT NULL
  - Meta: `db_table = 'route_stops'`, unique_together: (route, stop_order)

## Serializers

- [ ] `RouteSerializer` — incluir `origin_warehouse_name` read_only
- [ ] `RouteStopSerializer`

## ViewSets

- [ ] `RouteViewSet` — CRUD para rutas
- [ ] `RouteStopViewSet` — CRUD filtrando por `route_id` desde URL. `get_queryset` filtra por `route` si está presente en URL

## URLs

- [ ] Router para `routes` + ruta manual `routes/{route_pk}/stops/`

## Admin

- [ ] `RouteAdmin` — list_display: ['id', 'name', 'origin_warehouse', 'estimated_duration_hours', 'estimated_distance_km', 'is_active']
- [ ] `RouteStopAdmin` — list_display: ['id', 'route', 'stop_order', 'address', 'city']

## Filters

- [ ] `RouteFilter`
- [ ] `RouteStopFilter`
