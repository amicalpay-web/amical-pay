const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const productionApiUrl = import.meta.env.PROD ? 'https://api.amicalpay.com' : ''

export const API_BASE_URL = (configuredApiUrl || productionApiUrl).replace(/\/$/, '')

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}