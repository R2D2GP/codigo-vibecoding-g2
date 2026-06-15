import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { columns } from "@/app/(dashboard)/products/columns"
import type { Product } from "@/types"
import type { ReactNode } from "react"

const { mockUseCan } = vi.hoisted(() => ({ mockUseCan: vi.fn() }))

vi.mock("@/hooks/use-can", () => ({
  useCan: mockUseCan,
}))

const mockProduct: Product = {
  id: 1, supplier: 1, warehouse: 1, name: "Widget Pro", sku: "WGT-001",
  description: "Widget de alta calidad", category: "Electrónicos",
  weight_kg: 0.5, width_cm: 10, height_cm: 5, depth_cm: 3,
  unit_price: 29.99, stock_quantity: 100, is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  supplier_name: "Proveedor Principal", warehouse_name: "Almacén Central",
}

const noop = () => {}

beforeEach(() => { mockUseCan.mockReset() })

describe("stock_quantity column", () => {
  it("muestra formato con uds", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: mockProduct } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("100 uds")).toBeInTheDocument()
  })
})

describe("unit_price column", () => {
  it("muestra formato con $ y 2 decimales", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockProduct } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("$29.99")).toBeInTheDocument()
  })
})

describe("is_active column", () => {
  it("muestra 'Activo' cuando is_active es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[8]
    const el = col.cell!({ row: { original: { ...mockProduct, is_active: true } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Activo")).toBeInTheDocument()
  })

  it("muestra 'Inactivo' cuando is_active es false", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[8]
    const el = col.cell!({ row: { original: { ...mockProduct, is_active: false } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Inactivo")).toBeInTheDocument()
  })
})

describe("actions column", () => {
  it("muestra botón Editar cuando canEdit es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[9]
    const el = col.cell!({ row: { original: mockProduct } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Eliminar")).toBeInTheDocument()
  })

  it("oculta botones cuando canEdit/canDelete son false", () => {
    mockUseCan.mockReturnValue(false)
    const col = columns({ onEdit: noop, onDelete: noop })[9]
    const el = col.cell!({ row: { original: mockProduct } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.queryByText("Editar")).not.toBeInTheDocument()
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument()
  })
})
