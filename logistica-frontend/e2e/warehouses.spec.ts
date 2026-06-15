import { test, expect } from "./fixtures"
import { ENDPOINT } from "./fixtures"
import { unique } from "./fixtures"

async function cleanE2EData(api: any) {
  const all = await api.listAll(ENDPOINT)
  const e2eItems = all.filter((w: any) => w.name.startsWith("E2E-") || w.name.startsWith("E2E "))
  for (const item of e2eItems) {
    try { await api.remove(ENDPOINT, item.id) } catch {}
  }
}

test.describe("Warehouses CRUD", () => {
  test("lista carga y renderiza la tabla con datos sembrados", async ({ page, api }) => {
    await cleanE2EData(api)
    const name = unique()
    const id = await api.seed(ENDPOINT, {
      name, address: "Av. Prueba 123", city: "Lima", country: "Perú", capacity_m3: 1000,
    })

    await page.getByRole("link", { name: "Almacenes" }).click()
    await page.waitForURL("**/warehouses")
    await expect(page.getByText("Nuevo almacén")).toBeVisible({ timeout: 10000 })

    const row = page.getByRole("row").filter({ hasText: name })
    await expect(row).toHaveCount(1)

    await api.remove(ENDPOINT, id)
  })

  test("crear warehouse", async ({ page, api }) => {
    await cleanE2EData(api)
    const name = unique()

    await page.getByRole("link", { name: "Almacenes" }).click()
    await page.waitForURL("**/warehouses")
    await page.getByRole("button", { name: "Nuevo almacén" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByLabel("Nombre").fill(name)
    await page.getByLabel("Dirección").fill("Av. Nueva 456")
    await page.getByLabel("Ciudad").fill("Arequipa")
    await page.getByLabel("País").fill("Perú")
    await page.getByLabel("Capacidad (m³)").fill("500")
    await page.getByLabel("Latitud").fill("-12.0464")
    await page.getByLabel("Longitud").fill("-77.0428")

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Almacén creado")).toBeVisible()

    await expect(page.getByText("Nuevo almacén")).toBeVisible({ timeout: 10000 })
    while (await page.getByRole("button", { name: /siguiente/i }).isEnabled().catch(() => false)) {
      await page.getByRole("button", { name: /siguiente/i }).click()
      await page.waitForTimeout(300)
    }

    const row = page.getByRole("row").filter({ hasText: name })
    await expect(row).toHaveCount(1)

    const all = await api.listAll(ENDPOINT)
    const created = all.find((w: any) => w.name === name)
    if (created) await api.remove(ENDPOINT, created.id)
  })

  test("validación: formulario vacío muestra errores", async ({ page }) => {
    await page.getByRole("link", { name: "Almacenes" }).click()
    await page.waitForURL("**/warehouses")
    await page.getByRole("button", { name: "Nuevo almacén" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByRole("button", { name: "Guardar" }).click()
    await page.waitForTimeout(1000)

    await expect(page.getByText("El nombre es requerido")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("La dirección es requerida")).toBeVisible()
    await expect(page.getByText("La ciudad es requerida")).toBeVisible()
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("editar warehouse", async ({ page, api }) => {
    await cleanE2EData(api)
    const originalName = unique()
    const modifiedName = unique()
    const id = await api.seed(ENDPOINT, {
      name: originalName, address: "Av. Original 789", city: "Cusco", country: "Perú", capacity_m3: 200,
    })

    await page.getByRole("link", { name: "Almacenes" }).click()
    await page.waitForURL("**/warehouses")
    await expect(page.getByText("Nuevo almacén")).toBeVisible({ timeout: 10000 })

    // Navigate to page where the seeded item exists
    while (await page.getByRole("button", { name: /siguiente/i }).isEnabled().catch(() => false)) {
      await page.getByRole("button", { name: /siguiente/i }).click()
      await page.waitForTimeout(300)
    }

    const row = page.getByRole("row").filter({ hasText: originalName })
    await expect(row).toHaveCount(1)
    await row.getByRole("button", { name: /Editar/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    const nameInput = page.getByLabel("Nombre")
    await nameInput.clear()
    await nameInput.fill(modifiedName)

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Almacén actualizado")).toBeVisible()
    await expect(page.getByText("Nuevo almacén")).toBeVisible({ timeout: 10000 })
    const updatedRow = page.getByRole("row").filter({ hasText: modifiedName })
    await expect(updatedRow).toHaveCount(1)

    await api.remove(ENDPOINT, id)
  })

  test("eliminar warehouse (soft delete)", async ({ page, api }) => {
    await cleanE2EData(api)
    const name = unique()
    const id = await api.seed(ENDPOINT, {
      name, address: "Av. Delete 321", city: "Trujillo", country: "Perú", capacity_m3: 300,
    })

    await page.getByRole("link", { name: "Almacenes" }).click()
    await page.waitForURL("**/warehouses")
    await expect(page.getByText("Nuevo almacén")).toBeVisible({ timeout: 10000 })

    // Navigate to page where the seeded item exists
    while (await page.getByRole("button", { name: /siguiente/i }).isEnabled().catch(() => false)) {
      await page.getByRole("button", { name: /siguiente/i }).click()
      await page.waitForTimeout(300)
    }

    const row = page.getByRole("row").filter({ hasText: name })
    await expect(row).toHaveCount(1)

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Eliminar")
      dialog.accept()
    })

    await row.getByRole("button", { name: /Eliminar/ }).click()
    await page.waitForTimeout(2000)
    await expect(row).toHaveCount(0)
  })

  test("búsqueda/filtro", async ({ page, api }) => {
    await cleanE2EData(api)
    const names = [unique(), unique(), unique()]
    const ids = await Promise.all([
      api.seed(ENDPOINT, { name: names[0], address: "Calle A 1", city: "Lima", country: "Perú", capacity_m3: 100 }),
      api.seed(ENDPOINT, { name: names[1], address: "Calle B 2", city: "Arequipa", country: "Perú", capacity_m3: 200 }),
      api.seed(ENDPOINT, { name: names[2], address: "Calle G 3", city: "Cusco", country: "Perú", capacity_m3: 300 }),
    ])

    await page.getByRole("link", { name: "Almacenes" }).click()
    await page.waitForURL("**/warehouses")
    await expect(page.getByText("Nuevo almacén")).toBeVisible({ timeout: 10000 })

    // Navigate to last page where seeded items exist
    while (await page.getByRole("button", { name: /siguiente/i }).isEnabled().catch(() => false)) {
      await page.getByRole("button", { name: /siguiente/i }).click()
      await page.waitForTimeout(300)
    }

    const rowFilter = (n: string) => page.getByRole("row").filter({ hasText: n })
    await expect(rowFilter(names[0])).toHaveCount(1)
    await expect(rowFilter(names[1])).toHaveCount(1)
    await expect(rowFilter(names[2])).toHaveCount(1)

    const searchTerm = names[0].slice(-6)
    await page.getByPlaceholder("Buscar...").fill(searchTerm)
    // Search filters client-side; results on any page get filtered
    await expect(rowFilter(names[0])).toHaveCount(1)
    await expect(rowFilter(names[1])).toHaveCount(0)

    await page.getByPlaceholder("Buscar...").fill("")
    await page.waitForTimeout(500)
    await expect(rowFilter(names[1])).toHaveCount(1)
    await expect(rowFilter(names[2])).toHaveCount(1)

    for (const id of ids) await api.remove(ENDPOINT, id)
  })
})
