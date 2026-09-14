import { api, ApiOrderResponse } from '@/config/api'
import { allProducts } from '@/data/products'
import { Order, Product, Region } from '@/types'

const orderCache = new Map<string, Order>()

const fallbackProduct = (productId: string, region: Region): Product => ({
  id: productId,
  name: productId,
  diamonds: 0,
  region,
  description: 'Free Fire diamonds order',
  sellingPriceUsd: 0,
  sellingPriceHtg: 0,
  availability: 'in_stock',
})

const toOrder = (apiOrder: ApiOrderResponse): Order => {
  const product =
    allProducts.find((candidate) => candidate.id === apiOrder.product_id) ||
    fallbackProduct(apiOrder.product_id, apiOrder.region)

  const order: Order = {
    id: apiOrder.id,
    orderNumber: apiOrder.order_number,
    product,
    playerId: apiOrder.player_id,
    whatsappNumber: apiOrder.whatsapp_number || '',
    email: apiOrder.email,
    region: apiOrder.region,
    currency: apiOrder.currency,
    totalPrice:
      apiOrder.total_price ??
      apiOrder.totalPrice ??
      (apiOrder.currency === 'USD' ? product.sellingPriceUsd : product.sellingPriceHtg),
    status: apiOrder.status,
    paymentMethod: 'moncash',
    createdAt: new Date(apiOrder.created_at),
  }

  orderCache.set(order.orderNumber, order)
  return order
}

export const ordersService = {
  createOrder: async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'> & { createdAt?: Date }
  ): Promise<Order> => {
    const response = await api.createOrder({
      product_id: orderData.product.id,
      player_id: orderData.playerId,
      whatsapp_number: orderData.whatsappNumber,
      email: orderData.email,
      region: orderData.region,
      currency: orderData.currency,
    })

    return toOrder(response)
  },

  getOrderByNumber: async (orderNumber: string): Promise<Order | undefined> => {
    if (orderCache.has(orderNumber)) {
      return orderCache.get(orderNumber)
    }

    try {
      const response = await api.getOrderByNumber(orderNumber)
      return toOrder(response)
    } catch (error) {
      console.error('Failed to fetch order by number:', error)
      return undefined
    }
  },
}
