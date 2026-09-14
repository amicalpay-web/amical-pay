import { OrderStatus, Product, Region } from '@/types'

const PRODUCTION_API_URL = 'https://amical-pay-api.onrender.com'
const DEV_API_URL = 'http://localhost:5000'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : DEV_API_URL)

type ApiMethod = 'GET' | 'POST'

async function request<T>(path: string, method: ApiMethod = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const errorPayload = await response.json()
      message = errorPayload.error || message
    } catch {
      // Keep default error message if response is not JSON
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export interface ApiProductsResponse {
  region: Region
  count: number
  products: Product[]
}

export interface ApiOrderPayload {
  product_id: string
  player_id: string
  whatsapp_number?: string
  email: string
  region: Region
  currency: 'USD' | 'HTG'
}

export interface ApiOrderResponse {
  id: string
  order_number: string
  product_id: string
  player_id: string
  whatsapp_number?: string
  email: string
  region: Region
  currency: 'USD' | 'HTG'
  status: OrderStatus
  created_at: string
  updated_at: string
}

export const api = {
  getProductsByRegion(region: Region) {
    return request<ApiProductsResponse>(`/api/products?region=${region}`)
  },
  getProductById(id: string) {
    return request<Product>(`/api/products/${id}`)
  },
  createOrder(payload: ApiOrderPayload) {
    return request<ApiOrderResponse>('/api/orders', 'POST', payload)
  },
  getOrderByNumber(orderNumber: string) {
    return request<ApiOrderResponse>(`/api/orders/${orderNumber}`)
  },
}
