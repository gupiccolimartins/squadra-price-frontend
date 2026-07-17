export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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
  if (response.status === 401) {
    localStorage.removeItem('squadra_token')
    localStorage.removeItem('squadra_user')
    if (window.location.pathname !== '/Login') {
      window.location.href = '/Login'
    }
  }
  return response
}
