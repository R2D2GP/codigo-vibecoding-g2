import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_superadmin: boolean
  permissions: string[]
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  login: (access: string, refresh: string, user: User) => void
  logout: () => void
}

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => sessionStorage)
    : undefined

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      login: (access, refresh, user) =>
        set({ accessToken: access, refreshToken: refresh, user }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "auth-storage", storage }
  )
)
