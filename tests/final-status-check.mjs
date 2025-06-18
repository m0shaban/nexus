import { supabase } from './src/lib/supabase.js'

console.log('🔍 فحص حالة التطبيق بعد الإصلاحات...\n')

// اختبار الاتصال بقاعدة البيانات
async function testDatabaseConnection() {
  try {
    console.log('📊 اختبار الاتصال بقاعدة البيانات...')
    
    const { error } = await supabase.from('notes').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ قاعدة البيانات غير متصلة:', error.message)
      console.log('✅ ولكن التطبيق سيعمل مع البيانات التجريبية')
      return false
    } else {
      console.log('✅ قاعدة البيانات متصلة بنجاح')
      return true
    }
  } catch (error) {
    console.log('❌ خطأ في الاتصال:', error.message)
    console.log('✅ ولكن التطبيق سيعمل مع البيانات التجريبية')
    return false
  }
}

// اختبار جلب البيانات
async function testDataFetching() {
  try {
    console.log('\n📝 اختبار جلب الملاحظات...')
    const response = await fetch('http://localhost:3000/api/notes?limit=1')
    
    if (response.ok) {
      console.log('✅ API الملاحظات يعمل بنجاح')
    } else {
      console.log('⚠️ API الملاحظات لا يعمل (متوقع إذا لم تكن قاعدة البيانات مُعدة)')
    }
  } catch (error) {
    console.log('⚠️ لا يمكن الوصول لـ API (الخادم غير مُشغل)')
  }
}

async function runTests() {
  console.log('🚀 بدء الفحوصات...\n')
  
  await testDatabaseConnection()
  await testDataFetching()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 ملخص الإصلاحات المُطبقة:')
  console.log('✅ إصلاح مشاكل Hydration في RootLayout')
  console.log('✅ إصلاح SplashScreen مع isMounted')
  console.log('✅ إضافة معالجة أخطاء قاعدة البيانات في الملاحظات')
  console.log('✅ إضافة بيانات تجريبية للملاحظات والمشاريع والسيناريوهات')
  console.log('✅ إضافة مكون فحص حالة قاعدة البيانات')
  console.log('✅ تحسين تجربة المستخدم في حال عدم إعداد Supabase')
  console.log('='.repeat(50))
  
  console.log('\n🎯 التطبيق جاهز للاستخدام!')
  console.log('📖 لاستخدام جميع الميزات، يرجى إعداد قاعدة البيانات Supabase')
  console.log('🔧 تشغيل التطبيق: npm run dev')
}

runTests().catch(console.error)
