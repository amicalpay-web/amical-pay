import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface ProfileRow {
  id: string
  display_name: string | null
  role: 'customer' | 'admin'
  balance_htg: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Record<string, unknown> & ProfileRow
        Insert: {
          [key: string]: unknown
          id: string
          display_name?: string | null
          role?: 'customer' | 'admin'
          balance_htg?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          [key: string]: unknown
          display_name?: string | null
          role?: 'customer' | 'admin'
          balance_htg?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseClient: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export type Profile = ProfileRow