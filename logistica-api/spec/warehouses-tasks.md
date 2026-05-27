# Spec: Warehouses (Almacenes)

## Modelo

- [ ] Crear modelo `Warehouse` en `apps/warehouses/models.py`
  - Campos (según database-schema.md):
    - `name`: CharField(max_length=255), NOT NULL — Nombre del almacén
    - `address`: CharField(max_length=500), NOT NULL — Dirección completa
    - `city`: CharField(max_length=100), NOT NULL — Ciudad
    - `country`: CharField(max_length=100), NOT NULL, default='Colombia' — País
    - `latitude`: DecimalField(max_digits=9, decimal_places=6), null=True — Coordenada geográfica
    - `longitude`: DecimalField(max_digits=9, decimal_places=6), null=True — Coordenada geográfica
    - `capacity_m3`: DecimalField(max_digits=10, decimal_places=2), NOT NULL — Capacidad total en m³
    - `is_active`: BooleanField(default=True) — Soft delete
    - `created_at`: DateTimeField(auto_now_add=True) — Fecha de creación
    - `updated_at`: DateTimeField(auto_now=True) — Última actualización
  - Meta: `db_table = 'warehouses'`
  - Métodos: `__str__` que retorna `self.name`

## Serializer

- [ ] Crear `WarehouseSerializer` en `apps/warehouses/serializers.py`
  - Meta: model = Warehouse, fields = '__all__', read_only_fields = ['id', 'created_at', 'updated_at']

## ViewSet

- [ ] Crear `WarehouseViewSet` en `apps/warehouses/views.py`
  - queryset = Warehouse.objects.filter(is_active=True)
  - serializer_class = WarehouseSerializer
  - filterset_fields: ['city', 'country', 'is_active']
  - search_fields: ['name', 'address', 'city']
  - ordering_fields: ['name', 'created_at', 'capacity_m3']

## URLs

- [ ] Crear router en `apps/warehouses/urls.py`
  - DefaultRouter, registrar con `r'warehouses'`

## Admin

- [ ] Registrar modelo en `apps/warehouses/admin.py`
  - list_display: ['id', 'name', 'city', 'country', 'capacity_m3', 'is_active']
  - list_filter: ['city', 'country', 'is_active']
  - search_fields: ['name', 'address', 'city']

## Filters

- [ ] Definir filtros en `apps/warehouses/filters.py`
  - WarehouseFilter(django_filters.FilterSet)
  - Meta: model = Warehouse
  - fields: city, country, is_active, capacity_m3
