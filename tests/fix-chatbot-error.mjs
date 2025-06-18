#!/usr/bin/env node

// 🔧 أداة تشخيص مشاكل الشاتبوت - حل خطأ "فشل في إرسال الرسالة"

console.log('🔧 تشخيص مشاكل شاتبوت اللوغوس')
console.log('=' .repeat(50))

// فحص متغيرات البيئة
function checkEnvironmentVariables() {
  console.log('\n🔑 فحص متغيرات البيئة:')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY', 
    'NVIDIA_API_KEY',
    'NVIDIA_API_BASE_URL'
  ]
  
  const missing = []
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      const value = process.env[varName]
      const preview = value.length > 20 ? value.substring(0, 20) + '...' : value
      console.log(`✅ ${varName}: ${preview}`)
    } else {
      console.log(`❌ ${varName}: مفقود`)
      missing.push(varName)
    }
  })
  
  return missing
}

// اختبار اتصال Supabase
async function testSupabaseConnection() {
  console.log('\n🗄️ اختبار اتصال Supabase:')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ متغيرات Supabase مفقودة')
      return false
    }
    
    // محاولة اتصال بسيط
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('✅ اتصال Supabase يعمل')
      return true
    } else {
      console.log('❌ فشل اتصال Supabase:', response.status, response.statusText)
      return false
    }
    
  } catch (error) {
    console.log('❌ خطأ في اتصال Supabase:', error.message)
    return false
  }
}

// اختبار NVIDIA AI
async function testNvidiaAI() {
  console.log('\n🤖 اختبار NVIDIA AI:')
  
  try {
    const apiKey = process.env.NVIDIA_API_KEY
    const baseUrl = process.env.NVIDIA_API_BASE_URL
    
    if (!apiKey || !baseUrl) {
      console.log('❌ متغيرات NVIDIA مفقودة')
      return false
    }
    
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ NVIDIA AI يعمل')
      console.log(`📊 عدد النماذج المتاحة: ${data.data?.length || 'غير محدد'}`)
      return true
    } else {
      console.log('❌ فشل NVIDIA AI:', response.status, response.statusText)
      return false
    }
    
  } catch (error) {
    console.log('❌ خطأ في NVIDIA AI:', error.message)
    return false
  }
}

// اختبار مباشر لـ API الشاتبوت
async function testChatAPI() {
  console.log('\n💬 اختبار API الشاتبوت:')
  
  try {
    // تحديد URL الخادم
    const serverUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000'
    
    console.log('🌐 اختبار على:', serverUrl)
    
    const response = await fetch(`${serverUrl}/api/logos/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'اختبار النظام',
        userId: 'test-user-' + Date.now(),
        conversationId: null
      }),
    })
    
    console.log('📡 حالة الاستجابة:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API الشاتبوت يعمل')
      console.log('📊 نوع الاستجابة:', data.mock ? 'تجريبية' : data.fallback ? 'احتياطية' : 'كاملة')
      console.log('🤖 مدعوم بـ AI:', data.ai_powered ? 'نعم' : 'لا')
      
      if (data.message?.content) {
        console.log('💬 عينة من الرد:', data.message.content.substring(0, 100) + '...')
      }
      
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ فشل API الشاتبوت')
      console.log('📝 تفاصيل الخطأ:', errorText)
      return false
    }
    
  } catch (error) {
    console.log('❌ خطأ في API الشاتبوت:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 الخادم لا يعمل. تأكد من تشغيل: npm run dev')
    }
    
    return false
  }
}

// حلول للمشاكل الشائعة
function provideSolutions(issues) {
  console.log('\n🔧 الحلول المقترحة:')
  
  if (issues.envMissing.length > 0) {
    console.log('\n1️⃣ متغيرات البيئة المفقودة:')
    issues.envMissing.forEach(varName => {
      console.log(`   - أضف ${varName} إلى ملف .env.local`)
    })
  }
  
  if (!issues.supabaseWorking) {
    console.log('\n2️⃣ مشكلة Supabase:')
    console.log('   - تحقق من صحة NEXT_PUBLIC_SUPABASE_URL')
    console.log('   - تحقق من صحة SUPABASE_SERVICE_ROLE_KEY')
    console.log('   - تأكد من تفعيل المشروع في Supabase')
  }
  
  if (!issues.nvidiaWorking) {
    console.log('\n3️⃣ مشكلة NVIDIA AI:')
    console.log('   - تحقق من صحة NVIDIA_API_KEY')
    console.log('   - تأكد من صحة NVIDIA_API_BASE_URL')
    console.log('   - الشاتبوت سيعمل في وضع محدود بدون AI')
  }
  
  if (!issues.chatAPIWorking) {
    console.log('\n4️⃣ مشكلة API الشاتبوت:')
    console.log('   - تأكد من تشغيل الخادم: npm run dev')
    console.log('   - فحص console المتصفح للأخطاء')
    console.log('   - فحص terminal الخادم للأخطاء')
    console.log('   - جرب إعادة تشغيل الخادم')
  }
  
  console.log('\n5️⃣ خطوات التشخيص الإضافية:')
  console.log('   - فحص Network tab في Developer Tools')
  console.log('   - فحص رسائل console في المتصفح')
  console.log('   - تأكد من عدم وجود برامج حماية تحجب الطلبات')
  console.log('   - جرب في متصفح مختلف أو وضع Incognito')
}

// تشغيل التشخيص الكامل
async function runDiagnosis() {
  const issues = {
    envMissing: [],
    supabaseWorking: false,
    nvidiaWorking: false,
    chatAPIWorking: false
  }
  
  // فحص متغيرات البيئة
  issues.envMissing = checkEnvironmentVariables()
  
  // فحص الخدمات
  issues.supabaseWorking = await testSupabaseConnection()
  issues.nvidiaWorking = await testNvidiaAI()
  issues.chatAPIWorking = await testChatAPI()
  
  // تقرير النتائج
  console.log('\n📋 ملخص التشخيص:')
  const allWorking = issues.envMissing.length === 0 && 
                    issues.supabaseWorking && 
                    issues.chatAPIWorking
  
  if (allWorking) {
    console.log('🎉 جميع الخدمات تعمل بشكل صحيح!')
    console.log('✅ الشاتبوت جاهز للاستخدام')
  } else {
    console.log('⚠️ تم العثور على مشاكل تحتاج إصلاح')
    provideSolutions(issues)
  }
  
  console.log('\n🚀 للاختبار المباشر:')
  console.log('1. تشغيل: npm run dev')
  console.log('2. فتح: http://localhost:3000')
  console.log('3. النقر على أيقونة الشاتبوت')
  console.log('4. كتابة رسالة واضغط Enter')
}

// تشغيل التشخيص
runDiagnosis().catch(error => {
  console.error('💥 خطأ في التشخيص:', error)
  process.exit(1)
})
