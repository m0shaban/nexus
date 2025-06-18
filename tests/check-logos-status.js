/**
 * فحص حالة جداول نظام Logos AI
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة!')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'موجود' : 'مفقود')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'موجود' : 'مفقود')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 فحص حالة جداول نظام Logos AI...\n')

async function checkLogosStatus() {
  try {
    // 1. فحص الاتصال بقاعدة البيانات
    console.log('📡 اختبار الاتصال بقاعدة البيانات...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true })

    if (connectionError) {
      console.error('❌ فشل الاتصال بقاعدة البيانات:', connectionError.message)
      return
    }
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n')

    // 2. فحص الجداول المطلوبة
    console.log('📋 فحص جداول نظام Logos AI:')
    const logosTables = [
      'logos_conversations', 
      'logos_messages', 
      'logos_user_preferences', 
      'logos_analysis_sessions'
    ]
    
    let tablesExist = 0
    
    for (const tableName of logosTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count(*)', { count: 'exact', head: true })

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
            console.log(`  ❌ ${tableName}: الجدول غير موجود`)
          } else {
            console.log(`  ⚠️ ${tableName}: خطأ - ${error.message}`)
          }
        } else {
          console.log(`  ✅ ${tableName}: موجود ويعمل`)
          tablesExist++
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: خطأ في الوصول`)
      }
    }

    console.log(`\n📊 النتيجة: ${tablesExist}/${logosTables.length} جداول موجودة`)

    // 3. فحص المستخدم التجريبي
    console.log('\n👤 فحص المستخدم التجريبي:')
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'
    
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', testUserId)
        .single()

      if (userError) {
        console.log('  ❌ المستخدم التجريبي غير موجود')
      } else {
        console.log(`  ✅ المستخدم التجريبي موجود: ${user.email || 'لا يوجد إيميل'} (${user.full_name || 'لا يوجد اسم'})`)
      }
    } catch (err) {
      console.log('  ❌ خطأ في فحص المستخدم التجريبي')
    }

    // 4. التوصيات
    console.log('\n💡 التوصيات:')
    if (tablesExist === 0) {
      console.log('   🔧 يجب تنفيذ سكريپت setup-logos-database.sql في Supabase')
      console.log('   📋 انسخ محتويات الملف وألصقها في Supabase SQL Editor')
    } else if (tablesExist < logosTables.length) {
      console.log('   ⚠️ بعض الجداول مفقودة - راجع سكريپت setup-logos-database.sql')
    } else {
      console.log('   ✅ جميع جداول Logos موجودة ومتاحة!')
      console.log('   🚀 يمكن الآن اختبار تكامل النظام')
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error)
  }
}

// تشغيل الفحص
checkLogosStatus()
  .then(() => {
    console.log('\n🏁 تم الانتهاء من فحص نظام Logos AI')
  })
  .catch(err => {
    console.error('❌ خطأ في تشغيل الفحص:', err)
  })
