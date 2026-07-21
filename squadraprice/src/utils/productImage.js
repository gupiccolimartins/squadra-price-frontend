import { API_BASE_URL } from './api'

/**
 * Builds the public URL for a product photo filename stored in DB (`produto.Foto`).
 * Absolute http(s)/data URLs are returned as-is.
 */
export function resolveProductImageSrc(foto) {
  if (!foto || !String(foto).trim()) {
    return null
  }
  const value = String(foto).trim()
  if (/^(https?:|data:)/i.test(value)) {
    return value
  }
  const base = (import.meta.env.VITE_IMG_BASE_URL || API_BASE_URL).replace(/\/$/, '')
  return `${base}/content/img/${value.replace(/^\/+/, '')}`
}
