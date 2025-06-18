#!/usr/bin/env node
/**
 * فحص حالة جداول نظام Logos AI
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 فحص حالة جداول نظام Logos AI...\n')

async function checkLogosStatus() {
  try {
    // 1. فحص الجداول الموجودة
    console.log('📋 الجداول الموجودة في قاعدة البيانات:')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'logos_%')

    if (tablesError) {
      console.error('❌ خطأ في جلب قائمة الجداول:', tablesError)
      return
    }

    const logosTables = ['logos_conversations', 'logos_messages', 'logos_user_preferences', 'logos_analysis_sessions']
    
    console.log('الجداول المطلوبة:')
    for (const tableName of logosTables) {
      const exists = tables?.some(t => t.table_name === tableName)
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}`)
    }

    console.log('\nالجداول الموجودة فعلياً:')
    if (tables && tables.length > 0) {
      tables.forEach(table => console.log(`  ✅ ${table.table_name}`))
    } else {
      console.log('  ❌ لا توجد جداول logos في قاعدة البيانات')
    }

    // 2. اختبار الوصول للجداول الموجودة
    console.log('\n🔧 اختبار الوصول للجداول:')
    
    for (const tableName of logosTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count(*)', { count: 'exact', head: true })

        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`)
        } else {
          console.log(`  ✅ ${tableName}: متاح (${data?.length || 0} صفوف)`)
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: خطأ في الوصول - ${err.message}`)
      }
    }

    // 3. فحص endpoints الـ API
    console.log('\n🌐 فحص API endpoints:')
    const endpoints = [
      '/api/logos/chat',
      '/api/logos/conversations', 
      '/api/logos/preferences',
      '/api/logos/analysis'
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        console.log(`  ${response.ok ? '✅' : '⚠️'} ${endpoint}: ${response.status}`)
      } catch (err) {
        console.log(`  ❌ ${endpoint}: غير متاح`)
      }
    }

    // 4. تحقق من وجود مستخدم تجريبي
    console.log('\n👤 فحص المستخدم التجريبي:')
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', testUserId)
      .single()

    if (userError) {
      console.log('  ❌ المستخدم التجريبي غير موجود')
    } else {
      console.log(`  ✅ المستخدم التجريبي موجود: ${user.email} (${user.full_name})`)
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error)
  }
}

// تشغيل الفحص
checkLogosStatus()
  .then(() => {
    console.log('\n📊 تم الانتهاء من فحص نظام Logos AI')
    console.log('\n💡 الخطوات التالية:')
    console.log('   1. تنفيذ سكريپت setup-logos-database.sql في Supabase إذا كانت الجداول مفقودة')
    console.log('   2. اختبار endpoints الـ API')
    console.log('   3. اختبار التكامل مع الواجهة')
  })
  .catch(console.error)
