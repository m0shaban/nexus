/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/telegram-webhook/route'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '123', content: 'Test message' },
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('/api/telegram-webhook', () => {
  const mockRequest = (body: any, headers: Record<string, string> = {}) => {
    return {
      json: async () => body,
      headers: {
        get: (key: string) => headers[key] || null
      }
    } as NextRequest
  }

  it('should reject requests without webhook secret', async () => {
    const request = mockRequest({
      message: { text: 'Hello', from: { id: 123 }, chat: { id: 456 } }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should reject requests without message', async () => {
    const request = mockRequest({}, {
      'X-Telegram-Bot-Api-Secret-Token': 'test-secret'
    })

    process.env.TELEGRAM_WEBHOOK_SECRET = 'test-secret'

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No message found')
  })

  it('should process text messages correctly', async () => {
    const request = mockRequest({
      message: {
        text: 'Hello from Telegram!',
        from: { id: 123, first_name: 'Test User' },
        chat: { id: 456 },
        date: 1234567890
      }
    }, {
      'X-Telegram-Bot-Api-Secret-Token': 'test-secret'
    })

    process.env.TELEGRAM_WEBHOOK_SECRET = 'test-secret'

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.note).toBeDefined()
  })
})
