# Spec: Drivers (Conductores)

## Modelo

- [ ] `Driver` en `apps/drivers/models.py`
  - `user`: OneToOneField → AUTH_USER_MODEL, NOT NULL
  - `transport`: ForeignKey → Transport, null=True
  - `license_number`: CharField(50), UNIQUE, NOT NULL
  - `license_expiry`: DateField, NOT NULL
  - `phone`: CharField(20), NOT NULL
  - `is_active`, `created_at`, `updated_at`
  - Meta: `db_table = 'drivers'`

## Serializer

- [ ] `DriverSerializer` — incluir `user_email`, `user_full_name` como read_only

## ViewSet

- [ ] `DriverViewSet` — filterset_fields: ['is_active'], search_fields: ['license_number', 'phone'], ordering_fields: ['created_at']

## URLs

- [ ] Router con `r'drivers'`

## Admin

- [ ] `@admin.register(Driver)` — list_display: ['id', 'user', 'transport', 'license_number', 'license_expiry', 'is_active'], search_fields: ['license_number', 'user__email']

## Filters

- [ ] `DriverFilter`
