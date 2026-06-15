import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { columns } from "@/app/(dashboard)/warehouses/columns"
import type { Warehouse } from "@/types"
import type { ReactNode } from "react"

const { mockUseCan } = vi.hoisted(() => ({ mockUseCan: vi.fn() }))

vi.mock("@/hooks/use-can", () => ({
  useCan: mockUseCan,
}))

const mockWarehouse: Warehouse = {
  id: 1,
  name: "Almacén Central",
  address: "Av. Industrial 500",
  city: "Bogotá",
  country: "Colombia",
  latitude: 4.711,
  longitude: -74.0721,
  capacity_m3: 5000,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

const noop = () => {}

beforeEach(() => {
  mockUseCan.mockReset()
})

describe("capacity_m3 column", () => {
  it("muestra formato con m³", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[4]
    const el = col.cell!({ row: { original: mockWarehouse } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("5000 m³")).toBeInTheDocument()
  })
})

describe("is_active column", () => {
  it("muestra 'Activo' cuando is_active es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[5]
    const el = col.cell!({ row: { original: { ...mockWarehouse, is_active: true } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Activo")).toBeInTheDocument()
  })

  it("muestra 'Inactivo' cuando is_active es false", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[5]
    const el = col.cell!({ row: { original: { ...mockWarehouse, is_active: false } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Inactivo")).toBeInTheDocument()
  })
})

describe("actions column", () => {
  it("muestra botón Editar cuando canEdit es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: mockWarehouse } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Eliminar")).toBeInTheDocument()
  })

  it("oculta botones cuando canEdit/canDelete son false", () => {
    mockUseCan.mockReturnValue(false)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: mockWarehouse } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.queryByText("Editar")).not.toBeInTheDocument()
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument()
  })
})
