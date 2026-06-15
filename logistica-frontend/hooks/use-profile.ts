import { useAuthStore } from "@/stores/auth-store"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { User } from "@/types"

export function useProfile() {
  return useMutation({
    mutationFn: (data: Partial<User>) =>
      api.patch("/auth/profile/", data).then((r) => r.data),
    onSuccess: (data) => {
      const store = useAuthStore.getState()
      if (store.user) {
        store.login(
          store.accessToken ?? "",
          store.refreshToken ?? "",
          {
            ...store.user,
            email: data.email ?? "",
            first_name: data.first_name ?? "",
            last_name: data.last_name ?? "",
          }
        )
      }
    },
  })
}
