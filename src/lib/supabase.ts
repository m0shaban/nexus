import { createClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for server-side operations
export const supabaseAdmin = (() => {
  if (!supabaseServiceKey) {
    console.warn('Missing env.SUPABASE_SERVICE_ROLE_KEY - admin client will not be available')
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey)
})()

// Type-safe admin client getter
export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.')
  }
  return supabaseAdmin
}
