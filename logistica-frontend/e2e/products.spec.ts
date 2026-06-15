import { test, expect } from "./fixtures"
import { unique } from "./fixtures"

const P = "/products/"
const S = "/suppliers/"
const W = "/warehouses/"

async function cleanE2E(api: any) {
  for (const ep of [P, S, W]) {
    try {
      const all = await api.listAll(ep)
      const e2e = all.filter((x: any) => (x.name || "").startsWith("E2E-"))
      for (const x of e2e) {
        try { await api.remove(ep, x.id) } catch { /* already gone */ }
      }
    } catch { /* listAll might fail for missing endpoint */ }
  }
}

interface Deps { supplierId: number; warehouseId: number }
async function seedDeps(api: any): Promise<Deps> {
  const supplierId = await api.seed(S, {
    name: unique(), contact_name: "Test", email: "test@test.com",
    phone: "123456789", address: "Test 123", city: "Lima", country: "Perú",
  })
  const warehouseId = await api.seed(W, {
    name: unique(), address: "Test 123", city: "Lima", country: "Perú", capacity_m3: 1000,
  })
  return { supplierId, warehouseId }
}

async function cleanupDeps(api: any, deps: Deps) {
  await api.remove(S, deps.supplierId)
  await api.remove(W, deps.warehouseId)
}

async function seedProduct(api: any, deps: Deps, sku?: string) {
  const name = unique()
  const id = await api.seed(P, {
    supplier: deps.supplierId, warehouse: deps.warehouseId,
    name, sku: sku ?? unique(), category: "Electrónicos",
    description: null, weight_kg: 1.5, width_cm: 30, height_cm: 20, depth_cm: 10,
    unit_price: 99.99, stock_quantity: 100,
  })
  return { id, name }
}

test.describe("Products CRUD", () => {
  test.beforeEach(async ({ api }) => {
    await cleanE2E(api)
  })

  async function goToLastPage(page: any) {
    while (await page.getByRole("button", { name: /siguiente/i }).isEnabled().catch(() => false)) {
      await page.getByRole("button", { name: /siguiente/i }).click()
      await page.waitForTimeout(300)
    }
  }

  test("lista carga y renderiza la tabla con datos sembrados", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const { id, name } = await seedProduct(api, deps)

    await page.getByRole("link", { name: "Productos" }).click()
    await page.waitForURL("**/products")
    await expect(page.getByText("Nuevo producto")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: name })
    await expect(row).toHaveCount(1)

    await api.remove(P, id)
    await cleanupDeps(api, deps)
  })

  test("crear producto con selección de proveedor y almacén", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const sName = (await api.list(S)).find((s: any) => s.id === deps.supplierId)?.name ?? ""
    const wName = (await api.list(W)).find((w: any) => w.id === deps.warehouseId)?.name ?? ""
    const productName = unique()
    const sku = unique()

    await page.getByRole("link", { name: "Productos" }).click()
    await page.waitForURL("**/products")
    await page.getByRole("button", { name: "Nuevo producto" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByLabel("Nombre").fill(productName)
    await page.getByLabel("SKU").fill(sku)
    await page.getByLabel("Categoría").fill("Electrónicos")

    await page.getByRole("combobox").nth(0).click()
    await page.getByRole("option", { name: sName }).click()
    await page.getByRole("combobox").nth(1).click()
    await page.getByRole("option", { name: wName }).click()

    await page.getByLabel("Stock inicial").fill("50")
    await page.getByLabel("Peso (kg)").fill("2")
    await page.getByLabel("Ancho (cm)").fill("30")
    await page.getByLabel("Alto (cm)").fill("20")
    await page.getByLabel("Fondo (cm)").fill("10")
    await page.getByLabel("Precio unitario ($)").fill("150.00")
    await page.getByLabel("Descripción").fill("Producto de prueba")

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Producto creado")).toBeVisible()

    await expect(page.getByText("Nuevo producto")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)
    const row = page.getByRole("row").filter({ hasText: productName })
    await expect(row).toHaveCount(1)

    const all = await api.listAll(P)
    const created = all.find((p: any) => p.name === productName)
    if (created) await api.remove(P, created.id)
    await cleanupDeps(api, deps)
  })

  test("validación: formulario vacío muestra errores", async ({ page }) => {
    await page.getByRole("link", { name: "Productos" }).click()
    await page.waitForURL("**/products")
    await page.getByRole("button", { name: "Nuevo producto" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByRole("button", { name: "Guardar" }).click()
    await page.waitForTimeout(1500)

    await expect(page.getByText("El nombre es requerido")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("El SKU es requerido")).toBeVisible()
    await expect(page.getByText("La categoría es requerida")).toBeVisible()
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("editar producto", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const { id, name: originalName } = await seedProduct(api, deps)
    const modifiedName = unique()

    await page.getByRole("link", { name: "Productos" }).click()
    await page.waitForURL("**/products")
    await expect(page.getByText("Nuevo producto")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: originalName })
    await expect(row).toHaveCount(1)
    await row.getByRole("button", { name: /Editar/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    const nameInput = page.getByLabel("Nombre")
    await nameInput.clear()
    await nameInput.fill(modifiedName)

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Producto actualizado")).toBeVisible()

    await expect(page.getByText("Nuevo producto")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)
    const updatedRow = page.getByRole("row").filter({ hasText: modifiedName })
    await expect(updatedRow).toHaveCount(1)

    await api.remove(P, id)
    await cleanupDeps(api, deps)
  })

  test("eliminar producto (soft delete)", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const { id, name } = await seedProduct(api, deps)

    await page.getByRole("link", { name: "Productos" }).click()
    await page.waitForURL("**/products")
    await expect(page.getByText("Nuevo producto")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: name })
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

  test("búsqueda/filtro", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const names: string[] = []
    const ids: number[] = []
    for (let i = 0; i < 3; i++) {
      const p = await seedProduct(api, deps)
      names.push(p.name)
      ids.push(p.id)
    }

    await page.getByRole("link", { name: "Productos" }).click()
    await page.waitForURL("**/products")
    await expect(page.getByText("Nuevo producto")).toBeVisible({ timeout: 10000 })

    const rowFilter = (n: string) => page.getByRole("row").filter({ hasText: n })

    // Search by first item's name suffix — all items on current page get filtered
    const searchTerm = names[0].slice(-6)
    await page.getByPlaceholder("Buscar...").fill(searchTerm)
    await page.waitForTimeout(500)

    await expect(rowFilter(names[0])).toHaveCount(1)
    await expect(rowFilter(names[1])).toHaveCount(0)
    await expect(rowFilter(names[2])).toHaveCount(0)

    // Clear search — items may be on different DataTable pages
    await page.getByPlaceholder("Buscar...").fill("")
    await page.waitForTimeout(500)

    // Navigate to last page where our seeded items are
    await goToLastPage(page)

    // Now at least the last item should be visible
    await expect(rowFilter(names[2])).toHaveCount(1)

    for (const pid of ids) await api.remove(P, pid)
    await cleanupDeps(api, deps)
  })

  test("SKU único: error al crear producto con SKU duplicado", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const sName = (await api.list(S)).find((s: any) => s.id === deps.supplierId)?.name ?? ""
    const wName = (await api.list(W)).find((w: any) => w.id === deps.warehouseId)?.name ?? ""
    const dupeSku = unique()
    const { id: existingId } = await seedProduct(api, deps, dupeSku)

    const productName = unique()

    await page.getByRole("link", { name: "Productos" }).click()
    await page.waitForURL("**/products")
    await page.getByRole("button", { name: "Nuevo producto" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByLabel("Nombre").fill(productName)
    await page.getByLabel("SKU").fill(dupeSku)
    await page.getByLabel("Categoría").fill("Electrónicos")

    await page.getByRole("combobox").nth(0).click()
    await page.getByRole("option", { name: sName }).click()
    await page.getByRole("combobox").nth(1).click()
    await page.getByRole("option", { name: wName }).click()

    await page.getByLabel("Stock inicial").fill("10")
    await page.getByLabel("Peso (kg)").fill("1")
    await page.getByLabel("Ancho (cm)").fill("10")
    await page.getByLabel("Alto (cm)").fill("10")
    await page.getByLabel("Fondo (cm)").fill("10")
    await page.getByLabel("Precio unitario ($)").fill("10")
    await page.getByLabel("Descripción").fill("Producto con SKU duplicado")

    await page.getByRole("button", { name: "Guardar" }).click()
    await page.waitForTimeout(3000)

    await expect(page.getByText("Error al crear producto")).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole("dialog")).toBeVisible()

    await api.remove(P, existingId)
    await cleanupDeps(api, deps)
  })
})
