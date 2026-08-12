import { API_BASE_URL } from './api'

/**
 * URL para exibir a foto do produto a partir do campo `foto` da API.
 *
 * Em S3 a API já devolve URL HTTPS pré-assinada — usamos como está.
 * Em storage local a API devolve a key (`products/…` ou nome legado); aí montamos
 * `${API}/content/img/{key}` (ou CDN se `VITE_IMG_BASE_URL` estiver definida).
 */
export function resolveProductImageSrc(foto) {
  if (!foto || !String(foto).trim()) {
    return null
  }
  const value = String(foto).trim()
  if (/^(https?:|data:)/i.test(value)) {
    return value
  }

  const path = value.replace(/^\/+/, '')
  // Nome solto do legado → mesma normalização do backend (StorageKeys.normalizeProductKey).
  const key = path.includes('/') ? path : `products/legacy/${path}`

  const cdnBase = import.meta.env.VITE_IMG_BASE_URL
  if (cdnBase) {
    return `${cdnBase.replace(/\/$/, '')}/${key}`
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/content/img/${key}`
}
