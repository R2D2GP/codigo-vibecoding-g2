import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { columns } from "@/app/(dashboard)/routes/columns"
import type { Route } from "@/types"
import type { ReactNode } from "react"

const { mockUseCan } = vi.hoisted(() => ({ mockUseCan: vi.fn() }))

vi.mock("@/hooks/use-can", () => ({
  useCan: mockUseCan,
}))

const mockRoute: Route = {
  id: 1, name: "Ruta Norte", origin_warehouse: 1,
  estimated_duration_hours: 2.5, estimated_distance_km: 120, is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  origin_warehouse_name: "Almacén Central",
  stops: [{ id: 1, route: 1, stop_order: 1, address: "Calle A", city: "Bogotá", latitude: null, longitude: null, estimated_offset_hours: 1 }],
}

const noop = () => {}

beforeEach(() => { mockUseCan.mockReset() })

describe("estimated_duration_hours column", () => {
  it("muestra formato con h", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onStops: noop, onDelete: noop })[3]
    const el = col.cell!({ row: { original: mockRoute } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("2.5h")).toBeInTheDocument()
  })
})

describe("estimated_distance_km column", () => {
  it("muestra formato con km", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onStops: noop, onDelete: noop })[4]
    const el = col.cell!({ row: { original: mockRoute } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("120 km")).toBeInTheDocument()
  })
})

describe("stops column", () => {
  it("muestra cantidad de paradas", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onStops: noop, onDelete: noop })[5]
    const el = col.cell!({ row: { original: mockRoute } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("1")).toBeInTheDocument()
  })
})

describe("is_active column", () => {
  it("muestra 'Activo' cuando is_active es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onStops: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: { ...mockRoute, is_active: true } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Activo")).toBeInTheDocument()
  })

  it("muestra 'Inactivo' cuando is_active es false", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onStops: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: { ...mockRoute, is_active: false } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Inactivo")).toBeInTheDocument()
  })
})

describe("actions column", () => {
  it("muestra Editar, Paradas, Eliminar cuando canEdit/canDelete son true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onStops: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockRoute } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Paradas")).toBeInTheDocument()
    expect(screen.getByText("Eliminar")).toBeInTheDocument()
  })

  it("oculta Editar y Eliminar pero muestra Paradas cuando canEdit/canDelete son false", () => {
    mockUseCan.mockReturnValue(false)
    const col = columns({ onEdit: noop, onStops: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockRoute } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.queryByText("Editar")).not.toBeInTheDocument()
    expect(screen.getByText("Paradas")).toBeInTheDocument()
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument()
  })
})
