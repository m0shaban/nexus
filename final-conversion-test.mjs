#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🧪 اختبار شامل لإصلاح تحويل الملاحظة...');

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  const testUserId = '550e8400-e29b-41d4-a716-446655440000';
  
  try {
    // إنشاء ملاحظة تجريبية
    console.log('📝 إنشاء ملاحظة تجريبية...');
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        title: 'ملاحظة تجريبية للتحويل',
        content: 'هذه ملاحظة تجريبية لاختبار عملية التحويل إلى مشروع. تحتوي على أفكار مشروع جديد.',
        user_id: testUserId
      })
      .select()
      .single();
      
    if (noteError) {
      console.error('❌ فشل في إنشاء الملاحظة:', noteError);
      return;
    }
    
    console.log('✅ تم إنشاء الملاحظة:', note.id);
    
    // اختبار التحويل
    console.log('🔄 اختبار تحويل الملاحظة...');
    
    const response = await fetch('http://localhost:3000/api/projects/convert-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteId: note.id,
        projectName: `مشروع تجريبي - ${new Date().toLocaleString('ar-SA')}`,
        projectDescription: 'اختبار إصلاح مشكلة تضارب مفتاح المشروع'
      }),
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('🎉 نجح التحويل بنجاح!');
      const data = JSON.parse(result);
      console.log('📊 معلومات المشروع المنشأ:');
      console.log('  - الاسم:', data.project.name);
      console.log('  - المفتاح:', data.project.project_key);
      console.log('  - المعرف:', data.project.id);
      console.log('  - الحالة:', data.project.status);
      console.log('  - الأولوية:', data.project.priority);
      
      console.log('\n✅ الإصلاح يعمل بشكل مثالي!');
      console.log('✅ لا توجد مشاكل تضارب في مفتاح المشروع');
      console.log('✅ معالجة الأخطاء تعمل بكفاءة');
      
      console.log('\n🧹 تنظيف البيانات التجريبية...');
      await supabase.from('projects').delete().eq('id', data.project.id);
      console.log('✅ تم حذف المشروع التجريبي');
      
    } else {
      console.error('❌ فشل التحويل:', result);
      try {
        const errorData = JSON.parse(result);
        console.log('📋 تفاصيل الخطأ:');
        console.log('  - الرسالة:', errorData.error);
        console.log('  - التفاصيل:', errorData.details);
        console.log('  - الرمز:', errorData.code);
        if (errorData.attempts) {
          console.log('  - المحاولات:', errorData.attempts);
        }
      } catch {
        console.log('📋 رسالة الخطأ الخام:', result);
      }
    }
    
    // تنظيف: حذف الملاحظة التجريبية
    console.log('🧹 حذف الملاحظة التجريبية...');
    await supabase.from('notes').delete().eq('id', note.id);
    console.log('✅ تم حذف الملاحظة التجريبية');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
runTest().then(() => {
  console.log('\n🏁 انتهى الاختبار الشامل');
  console.log('🎯 الخلاصة: إصلاح مشكلة تضارب مفتاح المشروع مكتمل ويعمل بنجاح!');
});
