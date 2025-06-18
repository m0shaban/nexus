import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface TestResponse {
  success: boolean
  nvidia_api_working?: boolean
  ai_response?: string
  message?: {
    content: string
    metadata?: Record<string, unknown>
  }
  metadata?: {
    model: string
    tokens_used: number
    processing_time: number
    confidence_score: number
  }
  error?: string
  troubleshooting?: Record<string, string>
  setup_instructions?: {
    action: string
    file: string
    description: string
  }
}

interface LogosTestProps {
  className?: string
}

export default function LogosTest({ className }: LogosTestProps) {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<TestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testDirectAPI = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/test-nvidia', {
        method: 'GET'
      })
      
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError('فشل في الاتصال بالـ API')
      console.error('API test error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testWithMessage = async () => {
    if (!message.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/test-nvidia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError('فشل في إرسال الرسالة')
      console.error('Message test error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testLogosChat = async () => {
    if (!message.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/logos/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message,
          userId: 'test-user-123'
        })
      })
      
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError('فشل في اختبار شاتبوت اللوغوس')
      console.error('Logos chat test error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-right">🧪 اختبار تكامل NVIDIA AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Direct API Test */}
          <div className="space-y-2">
            <Button 
              onClick={testDirectAPI} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'جاري الاختبار...' : '🔍 اختبار مباشر للـ API'}
            </Button>
          </div>

          {/* Custom Message Test */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة للاختبار..."
                className="text-right"
                dir="rtl"
              />
              <Button 
                onClick={testWithMessage} 
                disabled={loading || !message.trim()}
                variant="secondary"
              >
                📝 اختبار مخصص
              </Button>
            </div>
          </div>

          {/* Logos Chat Test */}
          <div className="space-y-2">
            <Button 
              onClick={testLogosChat} 
              disabled={loading || !message.trim()}
              className="w-full"
              variant="default"
            >
              🤖 اختبار شاتبوت اللوغوس
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-right">{error}</p>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-right text-lg">
                  {response.success ? '✅ نتيجة الاختبار' : '❌ فشل الاختبار'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-right">
                    <strong>الحالة:</strong> {response.success ? 'نجح' : 'فشل'}
                  </div>
                  <div className="text-right">
                    <strong>NVIDIA API:</strong> {response.nvidia_api_working ? '✅ يعمل' : '❌ لا يعمل'}
                  </div>
                </div>

                {/* Metadata */}
                {response.metadata && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-right mb-2">📊 معلومات التقنية:</h4>
                    <div className="text-sm space-y-1 text-right">
                      <div><strong>النموذج:</strong> {response.metadata.model}</div>
                      <div><strong>العمليات المستخدمة:</strong> {response.metadata.tokens_used}</div>
                      <div><strong>وقت المعالجة:</strong> {response.metadata.processing_time}ms</div>
                      <div><strong>نقاط الثقة:</strong> {(response.metadata.confidence_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {response.ai_response && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-right mb-2">🤖 استجابة الذكاء الاصطناعي:</h4>
                    <div className="text-right whitespace-pre-wrap text-sm">
                      {response.ai_response}
                    </div>
                  </div>
                )}

                {/* Chat Message */}
                {response.message && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-right mb-2">💬 رسالة الشاتبوت:</h4>
                    <div className="text-right whitespace-pre-wrap text-sm">
                      {response.message.content}
                    </div>
                      {response.message.metadata && (
                      <div className="mt-3 pt-3 border-t border-green-200 text-xs text-gray-600 text-right">
                        <strong>معلومات:</strong> 
                        {Boolean(response.message.metadata.nvidia_api) && ' • مدعوم بـ NVIDIA AI'}
                        {Boolean(response.message.metadata.fallback) && ' • وضع الطوارئ'}
                        {Boolean(response.message.metadata.mock) && ' • وضع تجريبي'}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Details */}
                {!response.success && response.error && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-right mb-2">❌ تفاصيل الخطأ:</h4>
                    <div className="text-right text-sm text-red-600">
                      {response.error}
                    </div>
                    
                    {response.troubleshooting && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <h5 className="font-medium text-right mb-2">🔧 خطوات الإصلاح:</h5>
                        <ul className="text-right text-sm space-y-1">
                          {Object.entries(response.troubleshooting).map(([key, value]) => (
                            <li key={key}>• {value as string}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Setup Instructions */}
                {response.setup_instructions && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-right mb-2">⚙️ تعليمات الإعداد:</h4>
                    <div className="text-right text-sm">
                      <strong>الإجراء:</strong> {response.setup_instructions.action}<br/>
                      <strong>الملف:</strong> {response.setup_instructions.file}<br/>
                      <strong>الوصف:</strong> {response.setup_instructions.description}
                    </div>
                  </div>
                )}

                {/* Raw Response (for debugging) */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 text-right">🔍 الاستجابة الكاملة (للمطورين)</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
