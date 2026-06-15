"use client"

import { useState } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div
        className={cn(
          "flex flex-1 flex-col transition-[margin] duration-200",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Topbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
