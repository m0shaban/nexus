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

// Client for browser/client-side operations with enhanced options for realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Service role client for server-side operations
export const supabaseAdmin = (() => {
  if (!supabaseServiceKey) {
    console.warn('Missing env.SUPABASE_SERVICE_ROLE_KEY - admin client will not be available')
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

// Type-safe admin client getter
export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.')
  }
  return supabaseAdmin
}

// Export createClient function for API routes
export { createClient } from '@supabase/supabase-js'

// Helper function to check if realtime is working
export const checkRealtimeStatus = async () => {
  try {
    // Create a test channel with unique name to avoid conflicts
    const channelId = `realtime-test-${Date.now()}`
    const channel = supabase.channel(channelId)
    
    // Use a timeout to avoid hanging if subscription never resolves
    const status = await Promise.race([
      new Promise<string>((resolve) => {
        // Subscribe to the channel and wait for status
        channel.on('system', { event: '*' }, () => {
          // This is just to have a listener
        }).subscribe((status) => {
          if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR') {
            resolve(status)
          }
        })
      }),
      new Promise<string>((resolve) => setTimeout(() => resolve('TIMEOUT'), 5000))
    ])
    
    // Clean up the channel safely after we've received the status
    setTimeout(() => {
      try {
        channel.unsubscribe()
        console.log('[checkRealtimeStatus] Successfully unsubscribed test channel')
      } catch (err) {
        console.error('[checkRealtimeStatus] Error unsubscribing test channel:', err)
      }
    }, 100)
    
    return status === 'SUBSCRIBED'
  } catch (error) {
    console.error('Error checking realtime status:', error)
    return false
  }
}
