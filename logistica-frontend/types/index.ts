export interface Customer {
  id: number
  name: string
  customer_type: "COMPANY" | "INDIVIDUAL"
  tax_id: string | null
  email: string
  phone: string
  address: string
  city: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Warehouse {
  id: number
  name: string
  address: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  capacity_m3: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: number
  name: string
  tax_id: string | null
  contact_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  supplier: number
  warehouse: number
  name: string
  sku: string
  description: string | null
  category: string
  weight_kg: number
  width_cm: number
  height_cm: number
  depth_cm: number
  unit_price: number
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  supplier_name: string
  warehouse_name: string
}

export interface Transport {
  id: number
  plate_number: string
  transport_type: "TRUCK" | "VAN" | "MOTORCYCLE" | "CARGO_BIKE"
  brand: string
  model: string
  year: number
  capacity_kg: number
  capacity_m3: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Driver {
  id: number
  user: number
  transport: number | null
  license_number: string
  license_expiry: string
  phone: string
  is_active: boolean
  created_at: string
  updated_at: string
  user_email: string
  user_full_name: string
}

export interface RouteStop {
  id: number
  route: number
  stop_order: number
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  estimated_offset_hours: number
}

export interface Route {
  id: number
  name: string
  origin_warehouse: number
  estimated_duration_hours: number
  estimated_distance_km: number
  is_active: boolean
  created_at: string
  updated_at: string
  origin_warehouse_name: string
  stops: RouteStop[]
}

export interface ShipmentItem {
  id: number
  shipment: number
  product: number
  quantity: number
  unit_price_at_time: number
  subtotal: number
  product_name: string
}

export interface Shipment {
  id: number
  tracking_number: string
  customer: number
  driver: number | null
  transport: number | null
  route: number | null
  origin_warehouse: number
  destination_address: string
  destination_city: string
  destination_country: string
  status:
    | "PENDING"
    | "CONFIRMED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED"
  estimated_delivery_date: string | null
  actual_delivery_date: string | null
  weight_total_kg: number
  base_cost: number
  calculated_cost: number
  notes: string | null
  created_at: string
  updated_at: string
  customer_name: string
  origin_warehouse_name: string
  driver_name: string | null
  transport_plate: string | null
  route_name: string | null
  items: ShipmentItem[]
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  groups: { id: number; name: string }[]
  group_ids: number[]
  date_joined: string
  last_login: string | null
}

export interface Group {
  id: number
  name: string
  permissions: Permission[]
  permission_ids: number[]
}

export interface Permission {
  id: number
  codename: string
  name: string
  app_label: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
