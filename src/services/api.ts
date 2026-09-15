const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const productionApiUrl = 'https://api.amicalpay.com'
const isAbsoluteHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value)

// The frontend and API are separate Render services. Never let a missing,
// empty, or relative production variable make the browser call the frontend
// service's SPA fallback at /api/* (which returns index.html, not JSON).
const resolvedApiUrl = configuredApiUrl && isAbsoluteHttpUrl(configuredApiUrl)
  ? configuredApiUrl
  : import.meta.env.DEV
    ? ''
    : productionApiUrl

export const API_BASE_URL = resolvedApiUrl.replace(/\/$/, '')

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}