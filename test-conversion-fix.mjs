#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🧪 اختبار إصلاح تحويل الملاحظة إلى مشروع...');

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConversion() {
  try {
    // إنشاء ملاحظة تجريبية
    console.log('📝 إنشاء ملاحظة تجريبية...');
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        title: 'اختبار تحويل الملاحظة',
        content: 'هذه ملاحظة تجريبية لاختبار عملية التحويل إلى مشروع.',
        user_id: '00000000-0000-0000-0000-000000000000' // معرف تجريبي
      })
      .select()
      .single();
      
    if (noteError) {
      console.error('❌ فشل في إنشاء الملاحظة:', noteError);
      return;
    }
    
    console.log('✅ تم إنشاء الملاحظة:', note.id);
    
    // اختبار تحويل الملاحظة باستخدام API
    console.log('🔄 اختبار تحويل الملاحظة...');
    
    const response = await fetch('http://localhost:3000/api/projects/convert-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteId: note.id,
        projectName: 'مشروع تجريبي لاختبار التحويل',
        projectDescription: 'وصف المشروع التجريبي'
      }),
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ نجح التحويل!');
      const data = JSON.parse(result);
      console.log('📊 معلومات المشروع المنشأ:');
      console.log('  - الاسم:', data.project.name);
      console.log('  - المفتاح:', data.project.project_key);
      console.log('  - المعرف:', data.project.id);
      
      // تنظيف: حذف المشروع والملاحظة التجريبية
      console.log('🧹 تنظيف البيانات التجريبية...');
      await supabase.from('projects').delete().eq('id', data.project.id);
      await supabase.from('notes').delete().eq('id', note.id);
      console.log('✅ تم التنظيف بنجاح');
      
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
      
      // تنظيف: حذف الملاحظة التجريبية
      await supabase.from('notes').delete().eq('id', note.id);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testConversion().then(() => {
  console.log('🏁 انتهى الاختبار');
});
