import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          email?: string
          updated_at?: string
        }
      }
    }
  }
}