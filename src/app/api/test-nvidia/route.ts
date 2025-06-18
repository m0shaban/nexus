import { NextRequest, NextResponse } from 'next/server'
import { generateLogosResponse } from '@/lib/nvidia-ai'

export async function GET() {
  try {
    console.log('🧪 Testing NVIDIA AI Integration...')
    
    const testMessage = 'مرحباً، اختبر قدراتك في التحليل الاستراتيجي'
    
    const result = await generateLogosResponse(testMessage, [], {})
    
    return NextResponse.json({
      success: true,
      test_message: testMessage,
      ai_response: result.content,
      metadata: result.metadata,
      nvidia_api_working: true,
      timestamp: new Date().toISOString()
    })
      } catch (error) {
    console.error('❌ NVIDIA AI Test Failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      nvidia_api_working: false,
      troubleshooting: {
        check_api_key: 'Verify NVIDIA_API_KEY in .env.local',
        check_dependencies: 'Ensure openai package is installed',
        check_network: 'Verify internet connection to NVIDIA API'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 })
    }
    
    console.log('🧪 Testing NVIDIA AI with custom message:', message)
    
    const result = await generateLogosResponse(message, [], {})
    
    return NextResponse.json({
      success: true,
      test_message: message,
      ai_response: result.content,
      metadata: result.metadata,
      nvidia_api_working: true,
      timestamp: new Date().toISOString()
    })
      } catch (error) {
    console.error('❌ NVIDIA AI Test Failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      nvidia_api_working: false,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
