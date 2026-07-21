export const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL ?? '')
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')

let redirectingToLogin = false

export function clearAuthSession() {
  localStorage.removeItem('squadra_token')
  localStorage.removeItem('squadra_user')
}

export function redirectToLogin() {
  if (redirectingToLogin) return
  if (window.location.pathname === '/Login') return
  redirectingToLogin = true
  clearAuthSession()
  window.location.href = '/Login'
}

export function authHeaders() {
  const token = localStorage.getItem('squadra_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const defaultHeaders = isFormData
    ? { ...(localStorage.getItem('squadra_token') ? { Authorization: `Bearer ${localStorage.getItem('squadra_token')}` } : {}) }
    : authHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  })

  // Token ausente, inválido ou expirado — não tratar 403 genérico (ex.: falta de permissão admin)
  if (response.status === 401) {
    redirectToLogin()
  }

  return response
}
