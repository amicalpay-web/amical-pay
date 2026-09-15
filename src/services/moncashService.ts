import { apiUrl } from './api'

type MonCashPaymentResponse = {
  orderId: string
  redirectUrl: string
}

export const moncashService = {
  createPayment: async (orderId: string, amount: number): Promise<MonCashPaymentResponse> => {
    const response = await fetch(apiUrl('/api/payments/moncash/create'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount }),
    })

    const payload = (await response.json()) as MonCashPaymentResponse & { error?: string }
    if (!response.ok || !payload.redirectUrl) {
      throw new Error(payload.error || 'Impossible de démarrer le paiement MonCash')
    }

    return payload
  },
}
