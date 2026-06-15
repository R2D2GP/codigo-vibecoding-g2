const ACCESS_KEY = "logistica_access_token"
const REFRESH_KEY = "logistica_refresh_token"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access?: string, refresh?: string): void {
  if (typeof window === "undefined") return
  if (access !== undefined) localStorage.setItem(ACCESS_KEY, access)
  if (refresh !== undefined) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!getAccessToken()
}
