import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { columns } from "@/app/(dashboard)/suppliers/columns"
import type { Supplier } from "@/types"
import type { ReactNode } from "react"

const { mockUseCan } = vi.hoisted(() => ({ mockUseCan: vi.fn() }))

vi.mock("@/hooks/use-can", () => ({
  useCan: mockUseCan,
}))

const mockSupplier: Supplier = {
  id: 1, name: "Proveedor Principal", tax_id: "987654321",
  contact_name: "Juan Pérez", email: "juan@proveedor.com",
  phone: "555-2000", address: "Calle Mayor 100", city: "Bogotá",
  country: "Colombia", is_active: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
}

const noop = () => {}

beforeEach(() => { mockUseCan.mockReset() })

describe("is_active column", () => {
  it("muestra 'Activo' cuando is_active es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: { ...mockSupplier, is_active: true } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Activo")).toBeInTheDocument()
  })

  it("muestra 'Inactivo' cuando is_active es false", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: { ...mockSupplier, is_active: false } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Inactivo")).toBeInTheDocument()
  })
})

describe("actions column", () => {
  it("muestra botón Editar cuando canEdit es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockSupplier } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Eliminar")).toBeInTheDocument()
  })

  it("oculta botones cuando canEdit/canDelete son false", () => {
    mockUseCan.mockReturnValue(false)
    const col = columns({ onEdit: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockSupplier } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.queryByText("Editar")).not.toBeInTheDocument()
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument()
  })
})
