import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { config } from '../config/env.js'

let adminClient: SupabaseClient | undefined

function getAdminClient(): SupabaseClient {
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server configuration is incomplete')
  }

  if (!adminClient) {
    adminClient = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return adminClient
}

export async function verifySupabaseToken(token: string): Promise<User> {
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase authentication configuration is incomplete')
  }

  const client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  const { data, error } = await client.auth.getUser(token)

  if (error || !data.user) {
    throw new Error('Invalid Supabase access token')
  }

  return data.user
}

export async function insertOrder(order: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await getAdminClient()
    .from('orders')
    .insert(order)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Could not persist order')
  }

  return data as Record<string, unknown>
}

export async function getOrderByNumber(orderNumber: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await getAdminClient()
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as Record<string, unknown> | null) || null
}

export async function getOrdersByUserId(userId: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await getAdminClient()
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as Record<string, unknown>[]
}

export async function updateOrder(
  orderNumber: string,
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data, error } = await getAdminClient()
    .from('orders')
    .update(updates)
    .eq('order_number', orderNumber)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Could not update order')
  }

  return data as Record<string, unknown>
}