import { useAuthStore } from "@/stores/auth-store"

export function useCan(permission: string): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  if (user.is_superadmin) return true
  return user.permissions.includes(permission)
}
