import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { columns } from "@/app/(dashboard)/transport/columns"
import type { Transport } from "@/types"
import type { ReactNode } from "react"

const { mockUseCan } = vi.hoisted(() => ({ mockUseCan: vi.fn() }))

vi.mock("@/hooks/use-can", () => ({
  useCan: mockUseCan,
}))

const mockTransport: Transport = {
  id: 1, plate_number: "ABC-123", transport_type: "TRUCK",
  brand: "Toyota", model: "Hilux", year: 2020,
  capacity_kg: 1500, capacity_m3: 8, is_available: true,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
}

const noop = () => {}

beforeEach(() => { mockUseCan.mockReset() })

describe("transport_type column", () => {
  it("muestra 'Camión' para TRUCK", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[2]
    const el = col.cell!({ row: { original: { ...mockTransport, transport_type: "TRUCK" as const } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Camión")).toBeInTheDocument()
  })

  it("muestra 'Moto' para MOTORCYCLE", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[2]
    const el = col.cell!({ row: { original: { ...mockTransport, transport_type: "MOTORCYCLE" as const } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Moto")).toBeInTheDocument()
  })
})

describe("is_available column", () => {
  it("muestra 'Sí' cuando is_available es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: { ...mockTransport, is_available: true } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Sí")).toBeInTheDocument()
  })

  it("muestra 'No' cuando is_available es false", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[6]
    const el = col.cell!({ row: { original: { ...mockTransport, is_available: false } } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("No")).toBeInTheDocument()
  })
})

describe("actions column", () => {
  it("muestra botón Editar cuando canEdit es true", () => {
    mockUseCan.mockReturnValue(true)
    const col = columns({ onEdit: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockTransport } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Eliminar")).toBeInTheDocument()
  })

  it("oculta botones cuando canEdit/canDelete son false", () => {
    mockUseCan.mockReturnValue(false)
    const col = columns({ onEdit: noop, onDelete: noop })[7]
    const el = col.cell!({ row: { original: mockTransport } } as any) as ReactNode
    render(<>{el}</>)
    expect(screen.queryByText("Editar")).not.toBeInTheDocument()
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument()
  })
})
