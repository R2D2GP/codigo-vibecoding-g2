import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { columns } from "@/app/(dashboard)/customers/columns"
import type { Customer } from "@/types"
import type { ReactNode } from "react"

const { mockUseCan } = vi.hoisted(() => ({ mockUseCan: vi.fn() }))

vi.mock("@/hooks/use-can", () => ({
  useCan: mockUseCan,
}))

const mockCustomer: Customer = {
  id: 1,
  name: "Cliente Test",
  customer_type: "COMPANY",
  tax_id: "123456789",
  email: "cliente@test.com",
  phone: "555-1234",
  address: "Av. Principal 123",
  city: "Lima",
  country: "Perú",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

const noop = () => {}

beforeEach(() => {
  mockUseCan.mockReset()
})

describe("customer_type column", () => {
  it("muestra 'Empresa' para COMPANY", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[2] // customer_type
    const el = col.cell!({ row: { original: { ...mockCustomer, customer_type: "COMPANY" as const } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Empresa")).toBeInTheDocument()
  })

  it("muestra 'Individual' para INDIVIDUAL", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[2]
    const el = col.cell!({ row: { original: { ...mockCustomer, customer_type: "INDIVIDUAL" as const } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Individual")).toBeInTheDocument()
  })
})

describe("is_active column", () => {
  it("muestra 'Activo' cuando is_active es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6] // is_active
    const el = col.cell!({ row: { original: { ...mockCustomer, is_active: true } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Activo")).toBeInTheDocument()
  })

  it("muestra 'Inactivo' cuando is_active es false", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: { ...mockCustomer, is_active: false } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Inactivo")).toBeInTheDocument()
  })
})

describe("actions column", () => {
  it("muestra botón Editar cuando canEdit es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[7] // actions
    const el = col.cell!({ row: { original: mockCustomer } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Eliminar")).toBeInTheDocument()
  })

  it("oculta botones cuando canEdit/canDelete son false", () => {
    mockUseCan.mockReturnValue(false)
    const col = columns({ onEdit: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockCustomer } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.queryByText("Editar")).not.toBeInTheDocument()
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument()
  })
})
