import { test, expect } from "./fixtures"
import { unique } from "./fixtures"

const S = "/shipments/"
const W = "/warehouses/"
const C = "/customers/"
const SP = "/suppliers/"
const P = "/products/"

async function cleanE2E(api: any) {
  for (const ep of [S, P, SP, W, C]) {
    try {
      const all = await api.listAll(ep)
      const e2e = all.filter((x: any) => {
        if (ep === S) return true  // delete ALL shipments (36+ seed records fill API page 1)
        if (ep === P) return (x.name || "").startsWith("E2E-")
        return (x.name || "").startsWith("E2E-")
      })
      for (const x of e2e) {
        try { await api.remove(ep, x.id) } catch { }
      }
    } catch { }
  }
}

interface Deps {
  warehouseId: number
  warehouseName: string
  customerId: number
  customerName: string
  supplierId: number
  supplierName: string
  productId: number
  productName: string
}

async function seedDeps(api: any): Promise<Deps> {
  const warehouseName = unique()
  const warehouseId = await api.seed(W, {
    name: warehouseName, address: "Test 123", city: "Bogotá", country: "Colombia", capacity_m3: 1000,
  })
  const customerName = unique()
  const customerId = await api.seed(C, {
    name: customerName, customer_type: "COMPANY", email: `${customerName.toLowerCase()}@test.com`,
    phone: "123456789", address: "Test 123", city: "Bogotá", country: "Colombia",
  })
  const supplierName = unique()
  const supplierId = await api.seed(SP, {
    name: supplierName, contact_name: "Test", email: `${supplierName.toLowerCase()}@test.com`,
    phone: "123456789", address: "Test 123", city: "Bogotá", country: "Colombia",
  })
  const productName = unique()
  const productId = await api.seed(P, {
    supplier: supplierId, warehouse: warehouseId,
    name: productName, sku: unique(), category: "Electrónicos",
    description: null, weight_kg: 1.5, width_cm: 30, height_cm: 20, depth_cm: 10,
    unit_price: 99.99, stock_quantity: 100,
  })
  return { warehouseId, warehouseName, customerId, customerName, supplierId, supplierName, productId, productName }
}

async function cleanupDeps(api: any, deps: Deps) {
  for (const [ep, id] of [[P, deps.productId], [SP, deps.supplierId], [W, deps.warehouseId], [C, deps.customerId]]) {
    try { await api.remove(ep as string, id as number) } catch { }
  }
}

interface SeedShipment {
  id: number
  trackingNumber: string
  customerName: string
  notes: string
}

async function seedShipment(api: any, deps: Deps): Promise<SeedShipment> {
  const tag = unique()
  const id = await api.seed(S, {
    customer: deps.customerId,
    origin_warehouse: deps.warehouseId,
    destination_address: "Test 123",
    destination_city: "Bogotá",
    status: "PENDING",
    weight_total_kg: 10,
    base_cost: 100,
    notes: tag,
  })
  const all = await api.listAll(S)
  const created = all.find((s: any) => s.id === id)
  if (!created) throw new Error(`Shipment ${id} not found`)
  return { id, trackingNumber: created.tracking_number, customerName: created.customer_name, notes: tag }
}

async function goToLastPage(page: any) {
  const btn = page.getByRole("button", { name: /siguiente/i })
  while (await btn.isEnabled().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(300)
  }
}

test.describe("Shipments CRUD", () => {
  test.beforeEach(async ({ api }) => {
    await cleanE2E(api)
  })

  test("lista carga y renderiza la tabla con datos sembrados", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const s = await seedShipment(api, deps)

    await page.getByRole("link", { name: "Envíos" }).click()
    await page.waitForURL("**/shipments")
    await expect(page.getByText("Nuevo envío")).toBeVisible({ timeout: 15000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: s.trackingNumber })
    await expect(row).toHaveCount(1)
    await expect(row.getByText(s.customerName)).toBeVisible()
    await expect(page.getByText("Pendiente").first()).toBeVisible()

    await api.remove(S, s.id)
    await cleanupDeps(api, deps)
  })

  test("crear envío desde el formulario con tracking automático", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const myTag = unique()

    await page.getByRole("link", { name: "Envíos" }).click()
    await page.waitForURL("**/shipments")
    await page.getByRole("button", { name: "Nuevo envío" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByRole("combobox").nth(0).click()
    await page.getByRole("option", { name: deps.customerName }).click()
    await page.getByRole("combobox").nth(1).click()
    await page.getByRole("option", { name: deps.warehouseName }).click()
    await page.getByLabel("Dirección").fill("Test 123")
    await page.getByLabel("Ciudad").fill("Bogotá")
    await page.getByLabel("Notas").fill(myTag)

    await page.getByRole("button", { name: "Guardar" }).click()

    await expect(page.getByText("Envío creado")).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole("dialog")).not.toBeVisible()

    await expect(page.getByText("Nuevo envío")).toBeVisible({ timeout: 15000 })
    await goToLastPage(page)
    const all = await api.listAll(S)
    const created = all.find((s: any) => s.notes === myTag)
    expect(created).toBeDefined()
    expect(created!.tracking_number).toMatch(/^SHP-/)
    const createdRow = page.getByRole("row").filter({ hasText: created!.tracking_number })
    await expect(createdRow).toHaveCount(1)

    await api.remove(S, created!.id)
    await cleanupDeps(api, deps)
  })

  test("validación: formulario vacío permanece abierto", async ({ page }) => {
    await page.getByRole("link", { name: "Envíos" }).click()
    await page.waitForURL("**/shipments")
    await page.getByRole("button", { name: "Nuevo envío" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByRole("button", { name: "Guardar" }).click()
    await page.waitForTimeout(1500)

    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("editar envío (cambiar estado)", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const s = await seedShipment(api, deps)

    await page.getByRole("link", { name: "Envíos" }).click()
    await page.waitForURL("**/shipments")
    await expect(page.getByText("Nuevo envío")).toBeVisible({ timeout: 15000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: s.trackingNumber })
    await expect(row).toHaveCount(1)
    await row.getByRole("button", { name: /Editar/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByLabel("Estado").click()
    await page.getByRole("option", { name: "Confirmado" }).click()

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByText("Envío actualizado")).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole("dialog")).not.toBeVisible()

    await goToLastPage(page)
    await expect(row.getByText("Confirmado")).toBeVisible({ timeout: 15000 })

    await api.remove(S, s.id)
    await cleanupDeps(api, deps)
  })

  test("eliminar envío", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const s = await seedShipment(api, deps)

    await page.getByRole("link", { name: "Envíos" }).click()
    await page.waitForURL("**/shipments")
    await expect(page.getByText("Nuevo envío")).toBeVisible({ timeout: 15000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: s.trackingNumber })
    await expect(row).toHaveCount(1)

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Eliminar")
      dialog.accept()
    })

    await row.getByRole("button", { name: /Eliminar/ }).click()
    await page.waitForTimeout(2000)
    await expect(row).toHaveCount(0)

    await cleanupDeps(api, deps)
  })

  test("items CRUD: agregar y eliminar ítems del envío", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const s = await seedShipment(api, deps)

    const errors: string[] = []
    page.on("pageerror", (err) => { errors.push(err.message); console.log("PAGE ERROR:", err.message) })

    await page.getByRole("link", { name: "Envíos" }).click()
    await page.waitForURL("**/shipments")
    await expect(page.getByText("Nuevo envío")).toBeVisible({ timeout: 15000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: s.trackingNumber })
    await expect(row).toHaveCount(1)
    await row.getByRole("button", { name: /Ítems/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Cargando...")).not.toBeVisible({ timeout: 10000 })
    if (errors.length) console.log("Errors after dialog open:", errors)
    await expect(page.getByText(`Ítems - ${s.trackingNumber}`)).toBeVisible()
    await expect(page.getByText("Sin ítems")).toBeVisible()

    await page.getByLabel("Producto").click()
    await page.getByRole("option", { name: deps.productName }).click()
    await page.getByLabel("Cantidad").fill("5")
    await page.getByLabel("Precio unitario ($)").fill("99.99")
    await page.getByRole("button", { name: "Agregar" }).click()

    const dialog = page.getByRole("dialog")
    await expect(page.getByText("Ítem agregado")).toBeVisible({ timeout: 10000 })
    await expect(dialog.getByText("Sin ítems")).not.toBeVisible({ timeout: 10000 })
    await expect(dialog.getByText(/5 uds x /)).toBeVisible()

    page.once("dialog", (d) => {
      expect(d.message()).toContain("Eliminar")
      d.accept()
    })

    await dialog.getByRole("button", { name: /Eliminar ítem/ }).click()
    await expect(dialog.getByText("Sin ítems")).toBeVisible({ timeout: 10000 })

    await api.remove(S, s.id)
    await cleanupDeps(api, deps)
  })
})
