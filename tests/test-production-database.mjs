import { createClient } from '@supabase/supabase-js'

// إعدادات قاعدة البيانات من .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtsgkpgbdzgqrcqitayq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjE0MTcsImV4cCI6MjA2NTQzNzQxN30.YQsP9A5aL-sGkThnupPwPR0S1fUAA62p_ukiXLQcEnA'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔄 اختبار قاعدة البيانات الحقيقية...\n')

async function testDatabaseConnection() {
  console.log('🔗 اختبار الاتصال بقاعدة البيانات...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ خطأ في الاتصال:', error.message)
      return false
    }
    
    console.log('✅ تم الاتصال بنجاح!')
    console.log(`📊 عدد المستخدمين: ${data || 0}`)
    return true
  } catch (error) {
    console.log('❌ فشل الاتصال:', error.message)
    return false
  }
}

async function testTablesExistence() {
  console.log('\n📋 اختبار وجود الجداول الأساسية...')
  
  const tables = ['notes', 'projects', 'scenarios', 'users', 'tasks', 'streaks']
  const results = {}
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
        .limit(1)
      
      if (error) {
        console.log(`❌ جدول ${table}: غير موجود أو خطأ`)
        results[table] = false
      } else {
        console.log(`✅ جدول ${table}: موجود`)
        results[table] = true
      }
    } catch (error) {
      console.log(`❌ جدول ${table}: خطأ في الوصول`)
      results[table] = false
    }
  }
  
  return results
}

async function testDataInsertion() {
  console.log('\n📝 اختبار إدراج بيانات تجريبية...')
  
  try {
    // اختبار إنشاء ملاحظة
    const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .insert({
        content: 'اختبار النظام - ملاحظة تجريبية من فحص قاعدة البيانات',
        content_type: 'text',
        analysis_status: 'pending'
      })
      .select()
      .single()
    
    if (noteError) {
      console.log('❌ فشل إنشاء ملاحظة:', noteError.message)
      return false
    }
    
    console.log('✅ تم إنشاء ملاحظة تجريبية بنجاح')
    console.log(`📄 ID الملاحظة: ${noteData.id}`)
    
    // اختبار تحديث الملاحظة
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        ai_summary: 'ملخص تلقائي: اختبار نظام قاعدة البيانات',
        analysis_status: 'completed'
      })
      .eq('id', noteData.id)
    
    if (updateError) {
      console.log('❌ فشل تحديث الملاحظة:', updateError.message)
    } else {
      console.log('✅ تم تحديث الملاحظة بنجاح')
    }
    
    // اختبار حذف الملاحظة التجريبية
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteData.id)
    
    if (deleteError) {
      console.log('⚠️ لم يتم حذف الملاحظة التجريبية:', deleteError.message)
    } else {
      console.log('🗑️ تم حذف الملاحظة التجريبية بنجاح')
    }
    
    return true
  } catch (error) {
    console.log('❌ خطأ في اختبار البيانات:', error.message)
    return false
  }
}

async function testAPIs() {
  console.log('\n🔌 اختبار APIs المحلية...')
  
  try {
    // اختبار API الملاحظات
    const notesResponse = await fetch('http://localhost:3000/api/notes?limit=1')
    if (notesResponse.ok) {
      console.log('✅ API الملاحظات يعمل')
    } else {
      console.log('❌ API الملاحظات لا يعمل')
    }
    
    // اختبار API المشاريع  
    const projectsResponse = await fetch('http://localhost:3000/api/projects?limit=1')
    if (projectsResponse.ok) {
      console.log('✅ API المشاريع يعمل')
    } else {
      console.log('❌ API المشاريع لا يعمل')
    }
    
  } catch (error) {
    console.log('⚠️ الخادم المحلي غير مُشغل - تأكد من تشغيل npm run dev')
  }
}

async function runFullTest() {
  console.log('=' .repeat(60))
  console.log('🚀 اختبار شامل لقاعدة بيانات Nexus')
  console.log('=' .repeat(60))
  
  const connectionResult = await testDatabaseConnection()
  
  if (!connectionResult) {
    console.log('\n❌ فشل الاتصال بقاعدة البيانات - توقف الاختبار')
    return
  }
  
  const tablesResult = await testTablesExistence()
  const insertionResult = await testDataInsertion()
  await testAPIs()
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 ملخص النتائج:')
  console.log('=' .repeat(60))
  
  console.log(`🔗 الاتصال: ${connectionResult ? '✅ متصل' : '❌ غير متصل'}`)
  
  const tablesCount = Object.values(tablesResult).filter(Boolean).length
  const totalTables = Object.keys(tablesResult).length
  console.log(`📋 الجداول: ${tablesCount}/${totalTables} موجودة`)
  
  console.log(`📝 العمليات: ${insertionResult ? '✅ تعمل' : '❌ لا تعمل'}`)
  
  console.log('\n🎯 حالة النظام:')
  if (connectionResult && tablesCount === totalTables && insertionResult) {
    console.log('✅ النظام جاهز للإنتاج!')
    console.log('🚀 يمكنك الآن استخدام جميع ميزات Nexus')
  } else {
    console.log('⚠️ النظام يحتاج إعداد إضافي')
    if (!connectionResult) console.log('  - تحقق من إعدادات Supabase')
    if (tablesCount < totalTables) console.log('  - تنفيذ SQL scripts المفقودة')
    if (!insertionResult) console.log('  - تحقق من صلاحيات قاعدة البيانات')
  }
  
  console.log('\n' + '=' .repeat(60))
}

runFullTest().catch(console.error)
