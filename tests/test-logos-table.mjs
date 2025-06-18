import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('\n🎨 فحص شامل لجدول Logos')
console.log('='.repeat(50))

async function checkLogosTable() {
  try {
    // 1. فحص وجود الجدول
    console.log('\n📋 فحص وجود جدول logos...')
    const { data, error, count } = await supabase
      .from('logos')
      .select('*', { count: 'exact' })
      .limit(3)

    if (error) {
      console.log('❌ مشكلة في جدول logos:', error.message)
      console.log('🔧 قد يحتاج الجدول إلى إنشاء أو إصلاح')
      return false
    }

    console.log('✅ جدول logos موجود ومتاح')
    console.log(`📊 عدد الشعارات الموجودة: ${count || 0}`)

    if (data && data.length > 0) {
      console.log('\n📷 عينة من الشعارات:')
      data.forEach((logo, index) => {
        console.log(`   ${index + 1}. ${logo.name || 'بدون اسم'} - ${logo.brand_name || 'بدون علامة تجارية'}`)
      })
    } else {
      console.log('📝 جدول logos فارغ - لا توجد شعارات')
    }

    // 2. اختبار إدراج شعار تجريبي
    console.log('\n🧪 اختبار إدراج شعار تجريبي...')
    const testLogo = {
      name: 'شعار تجريبي Nexus',
      description: 'شعار تطبيق Nexus للاختبار',
      brand_name: 'Nexus',
      company_name: 'Nexus Tech',
      file_url: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=NEXUS',
      file_name: 'nexus-logo.png',
      file_type: 'image/png',
      width: 300,
      height: 300,
      logo_type: 'logo',
      industry: 'Technology',
      style: 'Modern',
      primary_colors: ['#4F46E5', '#FFFFFF'],
      status: 'active',
      visibility: 'public'
    }

    const { data: newLogo, error: insertError } = await supabase
      .from('logos')
      .insert(testLogo)
      .select()
      .single()

    if (insertError) {
      console.log('⚠️ لا يمكن إدراج بيانات:', insertError.message)
      console.log('💡 قد تحتاج لإعداد RLS policies للجدول')
    } else {
      console.log('✅ تم إنشاء شعار تجريبي بنجاح!')
      console.log(`   🆔 ID: ${newLogo.id}`)
      console.log(`   🏷️ الاسم: ${newLogo.name}`)
      
      // حذف البيانات التجريبية
      await supabase.from('logos').delete().eq('id', newLogo.id)
      console.log('🗑️ تم حذف البيانات التجريبية')
    }

    return true

  } catch (error) {
    console.error('💥 خطأ عام في فحص logos:', error.message)
    return false
  }
}

async function main() {
  const isWorking = await checkLogosTable()
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 ملخص حالة جدول Logos')
  console.log('='.repeat(50))
  
  if (isWorking) {
    console.log('✅ جدول logos يعمل بشكل صحيح')
    console.log('🎨 جاهز لتخزين وإدارة الشعارات')
  } else {
    console.log('❌ جدول logos يحتاج إصلاح')
    console.log('🔧 قد تحتاج لتطبيق سكريپت SQL')
  }
  
  console.log('\n🚀 للاستخدام:')
  console.log('   - تشغيل التطبيق: npm run dev')
  console.log('   - فتح المتصفح: http://localhost:3001')
}

main()
