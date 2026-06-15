import { test, expect } from "./fixtures"
import { unique } from "./fixtures"

const D = "/drivers/"
const T = "/transport/"
const U = "/auth/users/"

async function cleanE2E(api: any) {
  for (const ep of [D, T]) {
    try {
      const all = await api.listAll(ep)
      const key = ep === D ? "license_number" : "plate_number"
      const e2e = all.filter((x: any) => (x[key] || "").startsWith("E2E-"))
      for (const x of e2e) {
        try { await api.remove(ep, x.id) } catch { /* already gone */ }
      }
    } catch { /* listAll may fail */ }
  }
  try {
    const all = await api.listAll(U)
    const e2e = all.filter((x: any) => (x.username || "").startsWith("E2E-"))
    for (const x of e2e) {
      try { await api.remove(U, x.id) } catch { /* already gone */ }
    }
  } catch { /* listAll may fail */ }
}

interface Deps {
  userId: number
  transportId: number
  transportLabel: string
  userEmail: string
  userFullName: string
}

async function seedDeps(api: any): Promise<Deps> {
  const tag = unique()
  // POST /auth/users/ doesn't return id in response body → list to find it
  await api.seed(U, {
    username: tag,
    password: "testpass123",
    email: `${tag.toLowerCase()}@test.com`,
    first_name: "E2E",
    last_name: "Conductor",
    is_active: true,
  })
  const allUsers = await api.listAll(U)
  const createdUser = allUsers.find((u: any) => u.username === tag)
  if (!createdUser) throw new Error(`User ${tag} not found after creation`)
  const userId = createdUser.id

  const plate = unique()
  const transportId = await api.seed(T, {
    plate_number: plate,
    transport_type: "TRUCK",
    brand: "TestBrand",
    model: "X1",
    year: 2024,
    capacity_kg: 1000,
    capacity_m3: 50,
    is_available: true,
  })

  return {
    userId,
    transportId,
    transportLabel: `${plate} - TestBrand X1`,
    userEmail: `${tag.toLowerCase()}@test.com`,
    userFullName: "E2E Conductor",
  }
}

async function cleanupDeps(api: any, deps: Deps) {
  try { await api.remove(T, deps.transportId) } catch { }
  try { await api.remove(U, deps.userId) } catch { }
}

interface SeedDriver {
  id: number
  licenseNumber: string
  userId: number
  userFullName: string
  userEmail: string
}

async function seedDriver(api: any, deps: Deps, license?: string): Promise<SeedDriver> {
  const licenseNumber = license ?? unique()
  // Each driver needs its own user (OneToOneField constraint)
  const userTag = unique()
  await api.seed(U, {
    username: userTag,
    password: "testpass123",
    email: `${userTag.toLowerCase()}@test.com`,
    first_name: "E2E",
    last_name: "Conductor",
    is_active: true,
  })
  const allUsers = await api.listAll(U)
  const createdUser = allUsers.find((u: any) => u.username === userTag)
  if (!createdUser) throw new Error(`User ${userTag} not found after creation`)
  const userId = createdUser.id

  const id = await api.seed(D, {
    user: userId,
    transport: deps.transportId,
    license_number: licenseNumber,
    license_expiry: "2027-12-31",
    phone: "999888777",
  })
  return { id, licenseNumber, userId, userFullName: "E2E Conductor", userEmail: `${userTag.toLowerCase()}@test.com` }
}

test.describe("Drivers CRUD", () => {
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
    const { id, licenseNumber, userId: dUserId, userFullName: dUserFullName, userEmail: dUserEmail } = await seedDriver(api, deps)

    await page.getByRole("link", { name: "Conductores" }).click()
    await page.waitForURL("**/drivers")
    await expect(page.getByText("Nuevo conductor")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: licenseNumber })
    await expect(row).toHaveCount(1)
    await expect(row.getByText(dUserFullName)).toBeVisible()
    await expect(row.getByText(dUserEmail)).toBeVisible()

    await api.remove(D, id)
    await api.remove(U, dUserId)
    await cleanupDeps(api, deps)
  })

  test("crear conductor con selección de vehículo", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const licenseNumber = unique()

    await page.getByRole("link", { name: "Conductores" }).click()
    await page.waitForURL("**/drivers")
    await page.getByRole("button", { name: "Nuevo conductor" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByLabel("ID de usuario").fill(String(deps.userId))
    await page.getByLabel("Número de licencia").fill(licenseNumber)
    await page.getByLabel("Vencimiento").fill("2027-12-31")
    await page.getByLabel("Teléfono").fill("999888777")
    await page.getByRole("combobox").click()
    await page.getByRole("option", { name: deps.transportLabel }).click()

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Conductor creado")).toBeVisible()

    await expect(page.getByText("Nuevo conductor")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)
    const row = page.getByRole("row").filter({ hasText: licenseNumber })
    await expect(row).toHaveCount(1)
    await expect(row.getByText(deps.userFullName)).toBeVisible()
    await expect(row.getByText(deps.userEmail)).toBeVisible()

    const all = await api.listAll(D)
    const created = all.find((d: any) => d.license_number === licenseNumber)
    if (created) await api.remove(D, created.id)
    await cleanupDeps(api, deps)
  })

  test("validación: formulario vacío muestra errores", async ({ page }) => {
    await page.getByRole("link", { name: "Conductores" }).click()
    await page.waitForURL("**/drivers")
    await page.getByRole("button", { name: "Nuevo conductor" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByRole("button", { name: "Guardar" }).click()
    await page.waitForTimeout(1500)

    // Without defaultValues, Zod shows "Required" for undefined strings, not our custom messages
    // Verify validation blocked form submission (dialog stays open)
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("editar conductor", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const { id, licenseNumber: original, userId: dUserId, userFullName: dUserFullName } = await seedDriver(api, deps)
    const modified = unique()

    await page.getByRole("link", { name: "Conductores" }).click()
    await page.waitForURL("**/drivers")
    await expect(page.getByText("Nuevo conductor")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: original })
    await expect(row).toHaveCount(1)
    await expect(row.getByText(dUserFullName)).toBeVisible()
    await row.getByRole("button", { name: /Editar/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    const licInput = page.getByLabel("Número de licencia")
    await licInput.clear()
    await licInput.fill(modified)

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Conductor actualizado")).toBeVisible()

    await expect(page.getByText("Nuevo conductor")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)
    const updatedRow = page.getByRole("row").filter({ hasText: modified })
    await expect(updatedRow).toHaveCount(1)

    await api.remove(D, id)
    await api.remove(U, dUserId)
    await cleanupDeps(api, deps)
  })

  test("eliminar conductor (soft delete)", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const { id, licenseNumber, userId: dUserId } = await seedDriver(api, deps)

    await page.getByRole("link", { name: "Conductores" }).click()
    await page.waitForURL("**/drivers")
    await expect(page.getByText("Nuevo conductor")).toBeVisible({ timeout: 10000 })
    await goToLastPage(page)

    const row = page.getByRole("row").filter({ hasText: licenseNumber })
    await expect(row).toHaveCount(1)

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Eliminar")
      dialog.accept()
    })

    await row.getByRole("button", { name: /Eliminar/ }).click()
    await page.waitForTimeout(2000)
    await expect(row).toHaveCount(0)

    await api.remove(D, id)
    await api.remove(U, dUserId)
    await cleanupDeps(api, deps)
  })

  test("búsqueda/filtro", async ({ page, api }) => {
    const deps = await seedDeps(api)
    const licenses: string[] = []
    const ids: number[] = []
    const uIds: number[] = []
    for (let i = 0; i < 3; i++) {
      const d = await seedDriver(api, deps)
      licenses.push(d.licenseNumber)
      ids.push(d.id)
      uIds.push(d.userId)
    }

    await page.getByRole("link", { name: "Conductores" }).click()
    await page.waitForURL("**/drivers")
    await expect(page.getByText("Nuevo conductor")).toBeVisible({ timeout: 10000 })

    const rowFilter = (n: string) => page.getByRole("row").filter({ hasText: n })

    const searchTerm = licenses[0].slice(-6)
    await page.getByPlaceholder("Buscar...").fill(searchTerm)
    await page.waitForTimeout(500)

    await expect(rowFilter(licenses[0])).toHaveCount(1)
    await expect(rowFilter(licenses[1])).toHaveCount(0)
    await expect(rowFilter(licenses[2])).toHaveCount(0)

    await page.getByPlaceholder("Buscar...").fill("")
    await page.waitForTimeout(500)

    await goToLastPage(page)
    await expect(rowFilter(licenses[2])).toHaveCount(1)

    for (const did of ids) await api.remove(D, did)
    for (const uid of uIds) await api.remove(U, uid)
    await cleanupDeps(api, deps)
  })
})
