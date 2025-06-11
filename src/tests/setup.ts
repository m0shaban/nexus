import { vi } from 'vitest'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token'
process.env.TELEGRAM_WEBHOOK_SECRET = 'test-webhook-secret'
process.env.NVIDIA_API_KEY = 'test-nvidia-key'
process.env.NVIDIA_API_BASE_URL = 'https://test.api.nvidia.com/v1'
