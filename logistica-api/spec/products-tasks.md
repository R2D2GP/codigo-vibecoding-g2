# Spec: Products (Productos)

## Modelo

- [ ] Crear modelo `Product` en `apps/products/models.py`
  - FK `supplier` → Supplier (on_delete=CASCADE), NOT NULL
  - FK `warehouse` → Warehouse (on_delete=CASCADE), NOT NULL
  - `name`: CharField(255), NOT NULL
  - `sku`: CharField(100), UNIQUE, NOT NULL
  - `description`: TextField, null=True
  - `category`: CharField(100), NOT NULL
  - `weight_kg`: DecimalField(8,3), NOT NULL
  - `width_cm`: DecimalField(8,2), NOT NULL
  - `height_cm`: DecimalField(8,2), NOT NULL
  - `depth_cm`: DecimalField(8,2), NOT NULL
  - `unit_price`: DecimalField(12,2), NOT NULL
  - `stock_quantity`: IntegerField(default=0), NOT NULL
  - `is_active`: BooleanField(default=True)
  - `created_at`, `updated_at`
  - Meta: `db_table = 'products'`

## Serializer

- [ ] `ProductSerializer` — incluir `supplier_name`, `warehouse_name` como read_only (por nested representation)

## ViewSet

- [ ] `ProductViewSet` — filterset_fields: ['category', 'supplier', 'warehouse', 'is_active'], search_fields: ['name', 'sku', 'description'], ordering_fields: ['name', 'unit_price', 'created_at']

## URLs

- [ ] Router con `r'products'`

## Admin

- [ ] `@admin.register(Product)` — list_display: ['id', 'name', 'sku', 'category', 'unit_price', 'stock_quantity', 'is_active'], list_filter: ['category', 'supplier', 'is_active'], search_fields: ['name', 'sku']

## Filters

- [ ] `ProductFilter`
