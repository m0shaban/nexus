#!/usr/bin/env node

// ✅ فحص شامل لحالة نظام Logos AI - الشاتبوت والقاعدة
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🤖 فحص شامل لنظام Logos AI Chatbot')
console.log('=' .repeat(50))

async function checkChatbotSystem() {
  const issues = []
  let tablesStatus = {}
  
  // 1. فحص وجود جميع جداول logos
  const logosTables = [
    'logos_conversations',
    'logos_messages', 
    'logos_user_preferences',
    'logos_analysis_sessions',
    'logos',
    'logo_categories',
    'logo_variations'
  ]
  
  console.log('📊 فحص جداول قاعدة البيانات:')
  for (const table of logosTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: غير موجود - ${error.message}`)
        issues.push(`الجدول ${table} غير موجود`)
        tablesStatus[table] = { exists: false, error: error.message }
      } else {
        console.log(`✅ ${table}: موجود (${count || 0} سجل)`)
        tablesStatus[table] = { exists: true, count: count || 0 }
      }
    } catch (err) {
      console.log(`❌ ${table}: خطأ في الاتصال - ${err.message}`)
      issues.push(`خطأ في فحص الجدول ${table}`)
      tablesStatus[table] = { exists: false, error: err.message }
    }
  }
  
  // 2. فحص وجود جدول المستخدمين
  console.log('\n👥 فحص جدول المستخدمين:')
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5)
    
    if (usersError) {
      console.log(`❌ جدول users: غير موجود - ${usersError.message}`)
      issues.push('جدول المستخدمين غير موجود - سيؤدي لفشل إنشاء المحادثات')
    } else {
      console.log(`✅ جدول users: موجود (${usersData.length} مستخدم)`)
      if (usersData.length > 0) {
        console.log(`📝 مستخدم تجريبي: ${usersData[0].email} (${usersData[0].id})`)
      }
    }
  } catch (err) {
    console.log(`❌ جدول users: خطأ - ${err.message}`)
    issues.push('خطأ في فحص جدول المستخدمين')
  }
  
  // 3. اختبار إنشاء محادثة تجريبية
  console.log('\n💬 اختبار إنشاء محادثة:')
  try {
    // محاولة إنشاء محادثة بمستخدم وهمي
    const testUserId = 'test-user-' + Date.now()
    const { data: testConv, error: convError } = await supabase
      .from('logos_conversations')
      .insert({
        user_id: testUserId,
        title: 'اختبار النظام',
        conversation_type: 'test',
        priority_level: 'normal'
      })
      .select()
      .single()
    
    if (convError) {
      if (convError.code === '23503') {
        console.log('⚠️  محادثة: فشل بسبب قيد المفتاح الخارجي (foreign key) - المستخدم غير موجود')
        issues.push('إنشاء المحادثات يتطلب مستخدم صحيح في جدول users')
      } else {
        console.log(`❌ محادثة: فشل - ${convError.message}`)
        issues.push(`فشل إنشاء محادثة: ${convError.message}`)
      }
    } else {
      console.log('✅ محادثة: تم إنشاؤها بنجاح')
      
      // اختبار إضافة رسالة
      const { error: msgError } = await supabase
        .from('logos_messages')
        .insert({
          conversation_id: testConv.id,
          role: 'user',
          content: 'رسالة اختبار'
        })
      
      if (msgError) {
        console.log(`❌ رسالة: فشل - ${msgError.message}`)
        issues.push(`فشل إضافة رسالة: ${msgError.message}`)
      } else {
        console.log('✅ رسالة: تم إضافتها بنجاح')
      }
      
      // تنظيف البيانات التجريبية
      await supabase.from('logos_conversations').delete().eq('id', testConv.id)
    }
  } catch (err) {
    console.log(`❌ اختبار المحادثة: خطأ - ${err.message}`)
    issues.push(`خطأ في اختبار المحادثة: ${err.message}`)
  }
  
  // 4. فحص متغيرات البيئة (NVIDIA API)
  console.log('\n🔑 فحص متغيرات البيئة:')
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'NVIDIA_API_KEY': process.env.NVIDIA_API_KEY
  }
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: موجود (${value.substring(0, 20)}...)`)
    } else {
      console.log(`❌ ${key}: غير موجود`)
      issues.push(`متغير البيئة ${key} غير موجود`)
    }
  })
  
  // 5. تقرير نهائي
  console.log('\n' + '='.repeat(50))
  console.log('📋 تقرير الحالة النهائي:')
  
  if (issues.length === 0) {
    console.log('🎉 النظام جاهز 100% للعمل!')
    console.log('✅ جميع الجداول موجودة')
    console.log('✅ يمكن إنشاء محادثات ورسائل')
    console.log('✅ متغيرات البيئة مضبوطة')
  } else {
    console.log(`⚠️  تم العثور على ${issues.length} مشكلة:`)
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`)
    })
    
    console.log('\n🔧 الحلول المقترحة:')
    if (issues.some(i => i.includes('المستخدمين'))) {
      console.log('• تشغيل: setup-logos-database.sql في Supabase')
      console.log('• أو إنشاء مستخدم تجريبي في جدول users')
    }
    if (issues.some(i => i.includes('غير موجود'))) {
      console.log('• تشغيل: setup-logos-database.sql لإنشاء الجداول المفقودة')
    }
  }
  
  // إرجاع النتائج للبرمجة
  return {
    success: issues.length === 0,
    issues,
    tables: tablesStatus,
    summary: {
      totalTables: logosTables.length,
      existingTables: Object.values(tablesStatus).filter(t => t.exists).length,
      missingTables: Object.values(tablesStatus).filter(t => !t.exists).length
    }
  }
}

// تشغيل الفحص
checkChatbotSystem()
  .then(result => {
    console.log('\n🏁 انتهى الفحص')
    process.exit(result.success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 خطأ في الفحص:', error)
    process.exit(1)
  })
