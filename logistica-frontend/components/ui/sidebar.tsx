"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Warehouse,
  Building2,
  Users,
  Truck,
  Box,
  Map,
  UserCog,
  Ship,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Package,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const baseNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/warehouses", label: "Almacenes", icon: Warehouse },
  { href: "/suppliers", label: "Proveedores", icon: Building2 },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/transport", label: "Transporte", icon: Truck },
  { href: "/products", label: "Productos", icon: Box },
  { href: "/routes", label: "Rutas", icon: Map },
  { href: "/drivers", label: "Conductores", icon: UserCog },
  { href: "/shipments", label: "Envíos", icon: Ship },
]

const adminNav = [
  { href: "/admin/users", label: "Usuarios", icon: UserCog },
  { href: "/admin/groups", label: "Roles", icon: Shield },
]

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: (collapsed: boolean) => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, accessToken } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = user?.is_superadmin
    ? [...baseNav, { separator: true }, ...adminNav]
    : baseNav

  useEffect(() => {
    if (!accessToken) router.replace("/login")
  }, [accessToken, router])

  if (!user) return null

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar — lg+ */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r bg-background transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo / Brand */}
        <div className={cn(
          "flex h-14 items-center border-b gap-2",
          collapsed ? "justify-center px-0" : "px-4"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-semibold">Logística</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto py-4 px-2">
          {navItems.map((item: any) => {
            if (item.separator) {
              return collapsed ? null : (
                <div key="separator" className="px-3 pt-4 pb-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground/60">
                    Administración
                  </span>
                </div>
              )
            }
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout + Toggle */}
        <div className="border-t py-2 px-2 space-y-0.5">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="truncate text-sm text-muted-foreground">{user.username}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              collapsed ? "w-full justify-center" : "w-full justify-start gap-3"
            )}
            onClick={() => {
              logout()
              router.push("/login")
            }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Salir</span>}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => onToggle(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Sheet drawer — below lg */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger className="lg:hidden fixed top-2 left-2 z-50 inline-flex items-center justify-center rounded-md p-2 hover:bg-accent">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <div className="flex items-center gap-2 px-3 py-4 border-b mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Logística</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item: any) => {
              if (item.separator) {
                return (
                  <div key="separator" className="px-3 pt-4 pb-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground/60">
                      Administración
                    </span>
                  </div>
                )
              }
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                  )}
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <Separator className="my-4" />
            <div className="px-3 py-2 text-sm text-muted-foreground">{user.username}</div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3"
              onClick={() => {
                logout()
                router.push("/login")
              }}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
