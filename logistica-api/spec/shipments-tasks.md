# Spec: Shipments (Envíos) + Shipment Items

## Modelo Shipment

- [ ] `Shipment` en `apps/shipments/models.py`
  - `tracking_number`: CharField(50), UNIQUE, NOT NULL
  - `customer`: FK → Customer, NOT NULL
  - `driver`: FK → Driver, null=True
  - `transport`: FK → Transport, null=True
  - `route`: FK → Route, null=True
  - `origin_warehouse`: FK → Warehouse, NOT NULL
  - `destination_address`: CharField(500), NOT NULL
  - `destination_city`: CharField(100), NOT NULL
  - `destination_country`: CharField(100), default='Colombia'
  - `status`: CharField(20), NOT NULL, default='PENDING', choices: PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED
  - `estimated_delivery_date`: DateField, null=True
  - `actual_delivery_date`: DateTimeField, null=True
  - `weight_total_kg`: DecimalField(10,3), default=0
  - `base_cost`: DecimalField(12,2), default=0
  - `calculated_cost`: DecimalField(12,2), default=0
  - `notes`: TextField, null=True
  - `created_at`, `updated_at`
  - Meta: `db_table = 'shipments'`
  - Method to auto-generate tracking_number on save

## Modelo ShipmentItem

- [ ] `ShipmentItem` en `apps/shipments/models.py`
  - `shipment`: FK → Shipment, related_name='items', NOT NULL
  - `product`: FK → Product, NOT NULL
  - `quantity`: IntegerField, NOT NULL
  - `unit_price_at_time`: DecimalField(12,2), NOT NULL
  - `subtotal`: DecimalField(12,2), NOT NULL
  - Meta: `db_table = 'shipment_items'`, unique_together: (shipment, product)

## Serializers

- [ ] `ShipmentItemSerializer`
- [ ] `ShipmentSerializer` — incluir `items` como nested (read_only), `customer_name`, `origin_warehouse_name` como read_only

## ViewSets

- [ ] `ShipmentViewSet` — CRUD, filterset_fields: ['status', 'customer', 'driver', 'is_active'], search_fields: ['tracking_number', 'destination_city'], ordering_fields: ['created_at', 'estimated_delivery_date']
- [ ] `ShipmentItemViewSet` — filtrar por shipment_id desde URL

## URLs

- [ ] Router para `shipments` + ruta anidada `shipments/{shipment_pk}/items/`

## Admin

- [ ] `ShipmentAdmin` — list_display: ['id', 'tracking_number', 'customer', 'status', 'destination_city', 'calculated_cost', 'created_at'], list_filter: ['status', 'destination_city']
- [ ] `ShipmentItemAdmin`

## Filters

- [ ] `ShipmentFilter`
- [ ] `ShipmentItemFilter`
