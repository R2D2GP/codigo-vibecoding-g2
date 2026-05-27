# Spec: Transport (Transporte)

## Modelo

- [ ] Crear modelo `Transport` en `apps/transport/models.py`
  - Campos:
    - `plate_number`: CharField(max_length=20), NOT NULL, UNIQUE
    - `transport_type`: CharField(max_length=20), NOT NULL, choices: TRUCK, VAN, MOTORCYCLE, CARGO_BIKE
    - `brand`: CharField(max_length=100), NOT NULL
    - `model`: CharField(max_length=100), NOT NULL
    - `year`: IntegerField(), NOT NULL
    - `capacity_kg`: DecimalField(max_digits=10, decimal_places=2), NOT NULL
    - `capacity_m3`: DecimalField(max_digits=8, decimal_places=2), NOT NULL
    - `is_available`: BooleanField(default=True)
    - `created_at`: DateTimeField(auto_now_add=True)
    - `updated_at`: DateTimeField(auto_now=True)
  - Meta: `db_table = 'transport'`
  - `__str__` retorna `plate_number`

## Serializer

- [ ] `TransportSerializer`

## ViewSet

- [ ] `TransportViewSet` — queryset = Transport.objects.filter(is_available=True), filterset_fields: ['transport_type', 'is_available'], search_fields: ['plate_number', 'brand', 'model'], ordering_fields: ['plate_number', 'year', 'capacity_kg']

## URLs

- [ ] Router con `r'transport'`

## Admin

- [ ] `@admin.register(Transport)` — list_display: ['id', 'plate_number', 'transport_type', 'brand', 'model', 'year', 'is_available'], list_filter: ['transport_type', 'is_available'], search_fields: ['plate_number', 'brand']

## Filters

- [ ] `TransportFilter`
