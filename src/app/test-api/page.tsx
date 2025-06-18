'use client'

import { useState } from 'react'

export default function TestAPI() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult('جاري الاختبار...')
    
    try {
      const response = await fetch('/api/logos/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test message',
          userId: '550e8400-e29b-41d4-a716-446655440000'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ نجح الاختبار!\n\nResponse: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ فشل الاختبار!\n\nStatus: ${response.status}\nError: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ خطأ في الاتصال!\n\nError: ${error.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">اختبار API اللوغوس</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'جاري الاختبار...' : 'اختبر API'}
      </button>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">نتيجة الاختبار:</h2>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h2 className="font-bold mb-2">معلومات مهمة:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>إذا رأيت رسالة &quot;يبدو أن نظام قاعدة البيانات لا يزال قيد الإعداد&quot; - هذا طبيعي</li>
          <li>هذا يعني أن API يعمل ولكن جداول قاعدة البيانات غير موجودة</li>
          <li>يمكنك استخدام chatbot بهذا الوضع أو إنشاء الجداول</li>
        </ul>
      </div>
    </div>
  )
}
