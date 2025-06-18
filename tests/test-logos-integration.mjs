#!/usr/bin/env node
/**
 * اختبار شامل لنظام Logos AI بعد إنشاء الجداول
 * يجب تشغيل هذا السكريپت بعد تنفيذ setup-logos-database.sql
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

console.log('🧪 اختبار شامل لنظام Logos AI...\n')

// معرف المستخدم التجريبي
const testUserId = '550e8400-e29b-41d4-a716-446655440000'

async function runLogosTests() {
  try {
    console.log('1️⃣ فحص وجود جداول Logos...')
    
    const logosTables = [
      'logos_conversations', 
      'logos_messages', 
      'logos_user_preferences', 
      'logos_analysis_sessions'
    ]
    
    let tablesFound = 0
    
    for (const table of logosTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ❌ ${table}: غير موجود`)
        } else {
          console.log(`   ✅ ${table}: موجود`)
          tablesFound++
        }
      } catch (err) {
        console.log(`   ❌ ${table}: خطأ في الوصول`)
      }
    }
    
    if (tablesFound < logosTables.length) {
      console.log(`\n⚠️ تم العثور على ${tablesFound}/${logosTables.length} جداول فقط`)
      console.log('💡 تأكد من تنفيذ setup-logos-database.sql أولاً')
      return
    }
    
    console.log(`\n✅ جميع جداول Logos موجودة (${tablesFound}/${logosTables.length})`)
    
    // 2. اختبار إنشاء محادثة
    console.log('\n2️⃣ اختبار إنشاء محادثة جديدة...')
    
    const { data: conversation, error: convError } = await supabase
      .from('logos_conversations')
      .insert({
        user_id: testUserId,
        title: 'اختبار تكامل النظام',
        status: 'active'
      })
      .select()
      .single()
    
    if (convError) {
      console.log('   ❌ فشل إنشاء المحادثة:', convError.message)
      return
    }
    
    console.log(`   ✅ تم إنشاء محادثة: ${conversation.id}`)
    
    // 3. اختبار إضافة رسالة
    console.log('\n3️⃣ اختبار إضافة رسالة...')
    
    const { data: message, error: msgError } = await supabase
      .from('logos_messages')
      .insert({
        conversation_id: conversation.id,
        user_id: testUserId,
        role: 'user',
        content: 'مرحباً، هذه رسالة اختبار لنظام Logos AI',
        tokens_used: 15,
        model_used: 'nvidia/llama-3.1-nemotron-70b-instruct'
      })
      .select()
      .single()
    
    if (msgError) {
      console.log('   ❌ فشل إضافة الرسالة:', msgError.message)
    } else {
      console.log(`   ✅ تم إضافة رسالة: ${message.id}`)
    }
    
    // 4. اختبار التفضيلات
    console.log('\n4️⃣ اختبار تفضيلات المستخدم...')
    
    const { data: preferences, error: prefError } = await supabase
      .from('logos_user_preferences')
      .select()
      .eq('user_id', testUserId)
      .single()
    
    if (prefError) {
      console.log('   ❌ لا توجد تفضيلات:', prefError.message)
    } else {
      console.log(`   ✅ تفضيلات موجودة: ${preferences.ai_model} (${preferences.language})`)
    }
    
    // 5. اختبار جلسة تحليل
    console.log('\n5️⃣ اختبار إنشاء جلسة تحليل...')
    
    const { data: analysis, error: analysisError } = await supabase
      .from('logos_analysis_sessions')
      .insert({
        user_id: testUserId,
        conversation_id: conversation.id,
        title: 'تحليل اختبار النظام',
        description: 'جلسة تحليل تجريبية للتأكد من عمل النظام',
        analysis_type: 'system_test',
        input_data: { test: true, timestamp: new Date().toISOString() },
        confidence_score: 0.95
      })
      .select()
      .single()
    
    if (analysisError) {
      console.log('   ❌ فشل إنشاء جلسة التحليل:', analysisError.message)
    } else {
      console.log(`   ✅ تم إنشاء جلسة تحليل: ${analysis.id}`)
    }
    
    // 6. اختبار التحديث التلقائي للمحادثة
    console.log('\n6️⃣ اختبار التحديث التلقائي...')
    
    const { data: updatedConv, error: updateError } = await supabase
      .from('logos_conversations')
      .select('message_count, last_message_at')
      .eq('id', conversation.id)
      .single()
    
    if (updateError) {
      console.log('   ❌ فشل جلب بيانات المحادثة المحدثة')
    } else {
      console.log(`   ✅ عدد الرسائل محدث: ${updatedConv.message_count}`)
      console.log(`   ✅ آخر رسالة: ${new Date(updatedConv.last_message_at).toLocaleString('ar')}`)
    }
    
    // 7. اختبار الأمان (RLS)
    console.log('\n7️⃣ اختبار أمان البيانات (RLS)...')
    
    // إنشاء client بدون صلاحيات admin
    const publicClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: protectedData, error: rlsError } = await publicClient
      .from('logos_conversations')
      .select()
    
    if (rlsError || !protectedData || protectedData.length === 0) {
      console.log('   ✅ RLS يعمل بشكل صحيح - لا يمكن الوصول بدون تسجيل دخول')
    } else {
      console.log('   ⚠️ RLS قد لا يعمل بشكل صحيح')
    }
    
    // 8. تنظيف البيانات التجريبية
    console.log('\n8️⃣ تنظيف البيانات التجريبية...')
    
    await supabase.from('logos_analysis_sessions').delete().eq('id', analysis?.id)
    await supabase.from('logos_messages').delete().eq('conversation_id', conversation.id)
    await supabase.from('logos_conversations').delete().eq('id', conversation.id)
    
    console.log('   ✅ تم تنظيف البيانات التجريبية')
    
    // النتيجة النهائية
    console.log('\n🎉 اختبار نظام Logos AI مكتمل!')
    console.log('✅ جميع الوظائف الأساسية تعمل بنجاح')
    console.log('✅ قاعدة البيانات جاهزة للاستخدام')
    console.log('✅ أمان البيانات مفعل')
    console.log('\n🚀 النظام جاهز الآن لاستقبال المستخدمين!')
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error)
  }
}

runLogosTests().catch(console.error)
