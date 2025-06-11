/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/analyze/route'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '123', content: 'Test note content' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
    }))
  }
}))

// Mock fetch for NVIDIA API
global.fetch = vi.fn()

describe('/api/analyze', () => {
  const mockRequest = (body: any) => {
    return {
      json: async () => body
    } as NextRequest
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject requests without noteId', async () => {
    const request = mockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Note ID is required')
  })

  it('should analyze note successfully', async () => {
    // Mock successful NVIDIA API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              summary: 'هذا ملخص للنص',
              questions: ['سؤال أول؟', 'سؤال ثاني؟', 'سؤال ثالث؟']
            })
          }
        }]
      })
    })

    process.env.NVIDIA_API_KEY = 'test-key'
    process.env.NVIDIA_API_BASE_URL = 'https://test.api.nvidia.com/v1'

    const request = mockRequest({ noteId: '123' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.summary).toBe('هذا ملخص للنص')
    expect(data.questions).toHaveLength(3)
  })
})
