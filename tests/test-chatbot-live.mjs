#!/usr/bin/env node

// 🤖 اختبار مباشر لشاتبوت اللوغوس
import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3000'

console.log('🤖 اختبار شاتبوت اللوغوس مباشرة')
console.log('=' .repeat(50))

async function testChatbot() {
  try {
    console.log('📡 إرسال رسالة اختبار للشاتبوت...')
    
    const response = await fetch(`${API_BASE}/api/logos/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'مرحباً، أريد اختبار النظام',
        userId: 'test-user-' + Date.now(),
        conversationId: null
      }),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ نجح الاختبار!')
      console.log('\n📝 تفاصيل الاستجابة:')
      console.log('- الحالة:', data.success ? 'نجح' : 'فشل')
      console.log('- نوع الاستجابة:', data.mock ? 'تجريبية' : data.fallback ? 'احتياطية' : 'كاملة')
      console.log('- مدعوم بـ AI:', data.ai_powered ? 'نعم' : 'لا')
      
      if (data.message) {
        console.log('\n🤖 رد اللوغوس:')
        console.log(data.message.content.substring(0, 200) + '...')
      }
      
      if (data.setup_instructions) {
        console.log('\n⚙️ تعليمات الإعداد:')
        console.log('- الإجراء:', data.setup_instructions.action)
        console.log('- الملف:', data.setup_instructions.file)
        console.log('- الوصف:', data.setup_instructions.description)
      }
      
      if (data.conversationId) {
        console.log('\n💬 معرف المحادثة:', data.conversationId)
        
        // اختبار جلب المحادثة
        console.log('\n📋 اختبار جلب المحادثة...')
        const convResponse = await fetch(`${API_BASE}/api/logos/chat?conversationId=${data.conversationId}&userId=test-user-${Date.now()}`)
        const convData = await convResponse.json()
        
        if (convResponse.ok) {
          console.log('✅ نجح جلب المحادثة')
          console.log('- عدد الرسائل:', convData.messages?.length || 0)
        } else {
          console.log('❌ فشل جلب المحادثة:', convData.error)
        }
      }
      
    } else {
      console.log('❌ فشل الاختبار!')
      console.log('- رمز الخطأ:', response.status)
      console.log('- رسالة الخطأ:', data.error || 'غير محدد')
      if (data.details) {
        console.log('- التفاصيل:', data.details)
      }
    }
    
  } catch (error) {
    console.log('💥 خطأ في الاختبار:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 نصيحة: تأكد من تشغيل الخادم أولاً:')
      console.log('   npm run dev')
    }
  }
}

// اختبار متقدم مع رسائل متعددة
async function testAdvancedChat() {
  console.log('\n🧪 اختبار متقدم - محادثة كاملة')
  console.log('-' .repeat(30))
  
  const messages = [
    'أريد تطوير تطبيق ذكي',
    'ما هي الخطوات الأساسية؟',
    'أحتاج خطة تفصيلية'
  ]
  
  let conversationId = null
  const userId = 'advanced-test-' + Date.now()
  
  for (let i = 0; i < messages.length; i++) {
    try {
      console.log(`\n📝 رسالة ${i + 1}: ${messages[i]}`)
      
      const response = await fetch(`${API_BASE}/api/logos/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messages[i],
          userId,
          conversationId
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.message) {
        console.log(`✅ رد ${i + 1}: ${data.message.content.substring(0, 100)}...`)
        if (data.conversationId) {
          conversationId = data.conversationId
        }
      } else {
        console.log(`❌ فشل رسالة ${i + 1}:`, data.error)
        break
      }
      
      // انتظار قصير بين الرسائل
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`💥 خطأ في رسالة ${i + 1}:`, error.message)
      break
    }
  }
}

// تشغيل الاختبارات
async function runTests() {
  await testChatbot()
  await testAdvancedChat()
  
  console.log('\n🎯 ملخص الاختبار:')
  console.log('- إذا نجحت الاختبارات، الشاتبوت جاهز!')
  console.log('- إذا كانت الاستجابات "تجريبية"، قاعدة البيانات تحتاج إعداد')
  console.log('- إذا كانت مدعومة بـ AI، NVIDIA API يعمل بنجاح')
  
  console.log('\n🚀 لاختبار الواجهة:')
  console.log('1. افتح http://localhost:3000')
  console.log('2. انقر على أيقونة الشاتبوت (الدائرة الزرقاء)')
  console.log('3. اكتب رسالة واضغط Enter')
}

runTests().catch(console.error)
