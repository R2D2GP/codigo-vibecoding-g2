# Spec: Suppliers (Proveedores)

## Modelo

- [ ] Crear modelo `Supplier` en `apps/suppliers/models.py`
  - Campos:
    - `name`: CharField(max_length=255), NOT NULL — Nombre del proveedor
    - `tax_id`: CharField(max_length=50), UNIQUE, null=True — Identificación fiscal
    - `contact_name`: CharField(max_length=255), NOT NULL — Nombre del contacto
    - `email`: CharField(max_length=254), NOT NULL — Correo de contacto
    - `phone`: CharField(max_length=20), NOT NULL — Teléfono de contacto
    - `address`: CharField(max_length=500), NOT NULL — Dirección del proveedor
    - `city`: CharField(max_length=100), NOT NULL — Ciudad
    - `country`: CharField(max_length=100), NOT NULL, default='Colombia' — País
    - `is_active`: BooleanField(default=True)
    - `created_at`: DateTimeField(auto_now_add=True)
    - `updated_at`: DateTimeField(auto_now=True)
  - Meta: `db_table = 'suppliers'`
  - `__str__` retorna `self.name`

## Serializer

- [ ] `SupplierSerializer` — Meta: model = Supplier, fields = '__all__', read_only_fields = ['id', 'created_at', 'updated_at']

## ViewSet

- [ ] `SupplierViewSet` — queryset = Supplier.objects.filter(is_active=True), filterset_fields: ['city', 'country', 'is_active'], search_fields: ['name', 'email', 'tax_id', 'contact_name'], ordering_fields: ['name', 'created_at']

## URLs

- [ ] Router con `r'suppliers'`

## Admin

- [ ] `@admin.register(Supplier)` — list_display: ['id', 'name', 'contact_name', 'email', 'city', 'is_active'], list_filter: ['city', 'country', 'is_active'], search_fields: ['name', 'email', 'tax_id']

## Filters

- [ ] `SupplierFilter` — Meta: model = Supplier, fields: {city, country, is_active, name}
