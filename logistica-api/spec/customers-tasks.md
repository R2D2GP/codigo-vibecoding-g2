# Spec: Customers (Clientes)

## Modelo

- [ ] Crear modelo `Customer` en `apps/customers/models.py`
  - Campos:
    - `name`: CharField(max_length=255), NOT NULL
    - `customer_type`: CharField(max_length=10), NOT NULL, default='COMPANY', choices: COMPANY, INDIVIDUAL
    - `tax_id`: CharField(max_length=50), UNIQUE, null=True
    - `email`: EmailField(max_length=254), NOT NULL, UNIQUE
    - `phone`: CharField(max_length=20), NOT NULL
    - `address`: CharField(max_length=500), NOT NULL
    - `city`: CharField(max_length=100), NOT NULL
    - `country`: CharField(max_length=100), NOT NULL, default='Colombia'
    - `is_active`: BooleanField(default=True)
    - `created_at`: DateTimeField(auto_now_add=True)
    - `updated_at`: DateTimeField(auto_now=True)
  - Meta: `db_table = 'customers'`
  - `__str__` retorna `self.name`

## Serializer

- [ ] `CustomerSerializer` — Meta: model = Customer, fields = '__all__', read_only_fields = ['id', 'created_at', 'updated_at']

## ViewSet

- [ ] `CustomerViewSet` — filterset_fields: ['customer_type', 'city', 'country', 'is_active'], search_fields: ['name', 'email', 'tax_id'], ordering_fields: ['name', 'created_at']

## URLs

- [ ] Router con `r'customers'`

## Admin

- [ ] `@admin.register(Customer)` — list_display: ['id', 'name', 'customer_type', 'email', 'city', 'is_active'], list_filter: ['customer_type', 'city', 'country', 'is_active'], search_fields: ['name', 'email', 'tax_id']

## Filters

- [ ] `CustomerFilter` — Meta: model = Customer, fields: {customer_type, city, country, is_active}
