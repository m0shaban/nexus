const fs = require('fs')
const path = require('path')

// قراءة متغيرات البيئة
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const env = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value && !key.startsWith('#')) {
    env[key] = value
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 فحص حالة جداول نظام Logos AI...\n')
console.log('📡 معلومات الاتصال:')
console.log('URL:', supabaseUrl ? 'موجود' : 'مفقود')
console.log('Key:', supabaseKey ? 'موجود' : 'مفقود')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة!')
  process.exit(1)
}

// استخدام fetch API بدلاً من Supabase client
async function checkTables() {
  const logosTables = [
    'logos_conversations', 
    'logos_messages', 
    'logos_user_preferences', 
    'logos_analysis_sessions'
  ]

  console.log('\n📋 فحص الجداول المطلوبة:')

  let existingTables = 0

  for (const tableName of logosTables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=count`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      })

      if (response.ok) {
        console.log(`  ✅ ${tableName}: موجود ويعمل`)
        existingTables++
      } else {
        const error = await response.text()
        if (response.status === 404 || error.includes('does not exist')) {
          console.log(`  ❌ ${tableName}: الجدول غير موجود`)
        } else {
          console.log(`  ⚠️ ${tableName}: خطأ ${response.status}`)
        }
      }
    } catch (err) {
      console.log(`  ❌ ${tableName}: خطأ في الشبكة`)
    }
  }

  console.log(`\n📊 النتيجة: ${existingTables}/${logosTables.length} جداول موجودة`)

  // التوصيات
  console.log('\n💡 التوصيات:')
  if (existingTables === 0) {
    console.log('   🔧 يجب تنفيذ سكريپت setup-logos-database.sql في Supabase')
    console.log('   📋 الخطوات:')
    console.log('      1. افتح Supabase Dashboard')
    console.log('      2. اذهب إلى SQL Editor')
    console.log('      3. انسخ محتويات setup-logos-database.sql')
    console.log('      4. ألصق السكريپت وشغله')
  } else if (existingTables < logosTables.length) {
    console.log('   ⚠️ بعض الجداول مفقودة - راجع سكريپت setup-logos-database.sql')
  } else {
    console.log('   ✅ جميع جداول Logos موجودة ومتاحة!')
    console.log('   🚀 النظام جاهز لاختبار تكامل Logos AI')
  }

  console.log('\n🔗 روابط مفيدة:')
  console.log(`   📊 Supabase Dashboard: ${supabaseUrl.replace('/rest/v1', '').replace('https://', 'https://supabase.com/dashboard/project/')}/`)
  console.log('   📝 SQL Editor: اذهب للداشبورد > SQL Editor')
}

checkTables()
  .then(() => {
    console.log('\n🏁 تم الانتهاء من فحص نظام Logos AI')
  })
  .catch(err => {
    console.error('❌ خطأ:', err.message)
  })
