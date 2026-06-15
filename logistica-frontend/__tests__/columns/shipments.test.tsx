import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { columns } from "@/app/(dashboard)/shipments/columns"
import type { Shipment } from "@/types"
import type { ReactNode } from "react"

const { mockUseCan } = vi.hoisted(() => ({ mockUseCan: vi.fn() }))

vi.mock("@/hooks/use-can", () => ({
  useCan: mockUseCan,
}))

const mockShipment: Shipment = {
  id: 1, tracking_number: "SHP-00000001", customer: 1, driver: 1,
  transport: 1, route: 1, origin_warehouse: 1,
  destination_address: "Calle Principal 500", destination_city: "Bogotá",
  destination_country: "Colombia", status: "PENDING",
  estimated_delivery_date: "2024-06-15", actual_delivery_date: null,
  weight_total_kg: 100, base_cost: 250, calculated_cost: 275, notes: null,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  customer_name: "Cliente Test", origin_warehouse_name: "Almacén Central",
  driver_name: "Carlos Ruiz", transport_plate: "ABC-123", route_name: "Ruta Norte",
  items: [],
}

const noop = () => {}

beforeEach(() => { mockUseCan.mockReset() })

describe("status column", () => {
  it("muestra 'Pendiente' para PENDING", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onItems: noop, onDelete: noop })[4]
    const el = col.cell!({ row: { original: { ...mockShipment, status: "PENDING" as const } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Pendiente")).toBeInTheDocument()
  })

  it("muestra 'Entregado' para DELIVERED", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onItems: noop, onDelete: noop })[4]
    const el = col.cell!({ row: { original: { ...mockShipment, status: "DELIVERED" as const } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Entregado")).toBeInTheDocument()
  })
})

describe("calculated_cost column", () => {
  it("muestra formato con $ y 2 decimales", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onItems: noop, onDelete: noop })[5]
    const el = col.cell!({ row: { original: mockShipment } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("$275.00")).toBeInTheDocument()
  })
})

describe("actions column", () => {
  it("muestra Editar, Ítems, Eliminar cuando canEdit/canDelete son true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onItems: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: mockShipment } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Ítems")).toBeInTheDocument()
    expect(screen.getByText("Eliminar")).toBeInTheDocument()
  })

  it("oculta Editar y Eliminar pero muestra Ítems cuando canEdit/canDelete son false", () => {
    mockUseCan.mockReturnValue(false)
    const col = columns({ onEdit: noop, onItems: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: mockShipment } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.queryByText("Editar")).not.toBeInTheDocument()
    expect(screen.getByText("Ítems")).toBeInTheDocument()
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument()
  })
})
