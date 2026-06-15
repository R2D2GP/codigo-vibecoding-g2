"use client"

import Link from "next/link"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function Topbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  if (!user) return null

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email || user.username}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            logout()
            router.push("/login")
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
