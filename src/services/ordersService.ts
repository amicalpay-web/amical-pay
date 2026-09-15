import { Order, OrderStatus, PaymentMethod, Product } from '@/types'
import { productsService } from './productsService'
import { authService } from './authService'
import { apiUrl } from './api'

type ApiOrder = {
  id: string
  order_number: string
  product_id: string
  player_id: string
  whatsapp_number?: string
  email: string
  region?: Order['region']
  currency?: Order['currency']
  total_price?: number | null
  payment_method?: string | null
  status?: string
  created_at: string
  completed_at?: string
}

const orderStatuses: OrderStatus[] = [
  'pending',
  'payment_verification',
  'processing',
  'completed',
  'failed',
]

const paymentMethods: PaymentMethod[] = ['paypal', 'moncash', 'natcash']

function normalizeStatus(status: string | undefined): OrderStatus {
  return orderStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : 'pending'
}

function normalizePaymentMethod(method: string | null | undefined, fallback: PaymentMethod): PaymentMethod {
  return paymentMethods.includes(method as PaymentMethod) ? (method as PaymentMethod) : fallback
}

async function toOrder(
  apiOrder: ApiOrder,
  fallbackProduct?: Product,
  fallbackTotalPrice = 0,
  fallbackPaymentMethod: PaymentMethod = 'moncash',
): Promise<Order> {
  const product = fallbackProduct || await productsService.getProductById(apiOrder.product_id)

  if (!product) {
    throw new Error(`Product not found for order ${apiOrder.order_number}`)
  }

  const totalPrice = Number(apiOrder.total_price)

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.order_number,
    product,
    playerId: apiOrder.player_id,
    whatsappNumber: apiOrder.whatsapp_number || '',
    email: apiOrder.email,
    region: apiOrder.region || product.region,
    currency: apiOrder.currency || 'USD',
    totalPrice: Number.isFinite(totalPrice) ? totalPrice : fallbackTotalPrice,
    status: normalizeStatus(apiOrder.status),
    paymentMethod: normalizePaymentMethod(apiOrder.payment_method, fallbackPaymentMethod),
    createdAt: new Date(apiOrder.created_at),
    ...(apiOrder.completed_at ? { completedAt: new Date(apiOrder.completed_at) } : {}),
  }
}

async function parseResponse(response: Response): Promise<ApiOrder | ApiOrder[]> {
  const payload = await response.json().catch(() => ({})) as ApiOrder | ApiOrder[] | { error?: string }

  if (!response.ok) {
    const message = !Array.isArray(payload) && 'error' in payload ? payload.error : undefined
    throw new Error(message || `Orders API returned ${response.status}`)
  }

  return payload as ApiOrder | ApiOrder[]
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await authService.getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const ordersService = {
  createOrder: async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    const response = await fetch(apiUrl('/api/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({
        product_id: orderData.product.id,
        player_id: orderData.playerId,
        whatsapp_number: orderData.whatsappNumber,
        email: orderData.email,
        region: orderData.region,
        currency: orderData.currency,
        total_price: orderData.totalPrice,
        payment_method: orderData.paymentMethod,
        fazer_category_id: orderData.product.fazerCategoryId,
        fazer_offer_id: orderData.product.fazerOfferId,
        fazer_fields: orderData.fazerFields,
      }),
    })

    const payload = await parseResponse(response) as ApiOrder
    return toOrder(payload, orderData.product, orderData.totalPrice, orderData.paymentMethod)
  },

  getOrderByNumber: async (orderNumber: string): Promise<Order | undefined> => {
    const response = await fetch(apiUrl(`/api/orders/${encodeURIComponent(orderNumber)}`))
    if (response.status === 404) return undefined

    const payload = await parseResponse(response) as ApiOrder
    return toOrder(payload)
  },

  getOrdersByPlayerId: async (playerId: string): Promise<Order[]> => {
    void playerId
    const response = await fetch(apiUrl('/api/orders/me'), {
      headers: await authHeaders(),
    })
    const payload = await parseResponse(response) as ApiOrder[]
    return Promise.all(payload.map((order) => toOrder(order)))
  },
}
