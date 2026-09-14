import { config } from '../config/env.js'

type JsonObject = Record<string, unknown>

type MonCashPayment = {
  reference?: string
  transaction_id?: string
  cost?: number
  message?: string
  payer?: string
}

let accessToken = ''
let accessTokenExpiresAt = 0

function assertConfigured(): void {
  if (!config.MONCASH_CLIENT_ID || !config.MONCASH_CLIENT_SECRET) {
    throw new Error('MONCASH_CLIENT_ID and MONCASH_CLIENT_SECRET are required')
  }
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  assertConfigured()

  if (!forceRefresh && accessToken && Date.now() < accessTokenExpiresAt) {
    return accessToken
  }

  const credentials = Buffer.from(
    `${config.MONCASH_CLIENT_ID}:${config.MONCASH_CLIENT_SECRET}`
  ).toString('base64')
  const response = await fetch(`${config.MONCASH_API_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'scope=read,write&grant_type=client_credentials',
  })

  const payload = (await response.json()) as JsonObject
  if (!response.ok || typeof payload.access_token !== 'string') {
    throw new Error(`MonCash authentication failed: ${JSON.stringify(payload)}`)
  }

  accessToken = payload.access_token
  const expiresIn = typeof payload.expires_in === 'number' ? payload.expires_in : 60
  accessTokenExpiresAt = Date.now() + Math.max(expiresIn - 10, 1) * 1000
  return accessToken
}

async function request(path: string, body: JsonObject): Promise<JsonObject> {
  let token = await getAccessToken()
  let response = await fetch(`${config.MONCASH_API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (response.status === 401) {
    token = await getAccessToken(true)
    response = await fetch(`${config.MONCASH_API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  const payload = (await response.json()) as JsonObject
  if (!response.ok) {
    throw new Error(`MonCash request failed (${response.status}): ${JSON.stringify(payload)}`)
  }
  return payload
}

export function isMonCashConfigured(): boolean {
  return Boolean(config.MONCASH_CLIENT_ID && config.MONCASH_CLIENT_SECRET)
}

export async function createMonCashPayment(orderId: string, amount: number): Promise<{
  orderId: string
  redirectUrl: string
  raw: JsonObject
}> {
  const payload = await request('/v1/CreatePayment', { orderId, amount })
  const paymentToken = (payload.payment_token as JsonObject | undefined)?.token

  if (typeof paymentToken !== 'string' || !paymentToken) {
    throw new Error('MonCash did not return a payment token')
  }

  return {
    orderId,
    redirectUrl: `${config.MONCASH_GATEWAY_BASE_URL}/Payment/Redirect?token=${encodeURIComponent(paymentToken)}`,
    raw: payload,
  }
}

export async function retrieveOrderPayment(orderId: string): Promise<JsonObject> {
  return request('/v1/RetrieveOrderPayment', { orderId })
}

export async function retrieveTransactionPayment(transactionId: string): Promise<JsonObject> {
  return request('/v1/RetrieveTransactionPayment', { transactionId })
}

export function getPaymentFromResponse(payload: JsonObject): MonCashPayment {
  return (payload.payment as MonCashPayment | undefined) || {}
}
