'use client'

import LogosTest from '@/components/LogosTest'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 اختبار تكامل NVIDIA AI
          </h1>
          <p className="text-lg text-gray-600 text-right">
            اختبر قدرات الذكاء الاصطناعي المحدثة في نظام Nexus
          </p>
        </div>

        <LogosTest />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-right">📋 تعليمات الاختبار</h2>
          
          <div className="space-y-4 text-right">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">🔍 الاختبار المباشر للـ API</h3>
              <p className="text-sm text-gray-600">
                يختبر الاتصال المباشر بـ NVIDIA API باستخدام رسالة افتراضية
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">📝 الاختبار المخصص</h3>
              <p className="text-sm text-gray-600">
                يتيح لك إرسال رسالة مخصصة لاختبار قدرات الذكاء الاصطناعي
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">🤖 اختبار شاتبوت اللوغوس</h3>
              <p className="text-sm text-gray-600">
                يختبر التكامل الكامل مع قاعدة البيانات ونظام المحادثات
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium mb-2 text-right">⚠️ ملاحظات مهمة</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-right">
              <li>• تأكد من إعداد NVIDIA_API_KEY في ملف .env.local</li>
              <li>• يجب تثبيت الحزمة: npm install openai</li>
              <li>• تأكد من الاتصال بالإنترنت للوصول إلى NVIDIA API</li>
              <li>• لاختبار قاعدة البيانات، قم بتشغيل ملف complete-database-setup.sql</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
