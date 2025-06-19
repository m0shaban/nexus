#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('👥 البحث عن مستخدم حقيقي للاختبار...');

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c';

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  // البحث عن المستخدمين الموجودين
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, created_at')
    .limit(5);
    
  if (usersError) {
    console.error('❌ خطأ في قراءة المستخدمين:', usersError);
  } else if (users && users.length > 0) {
    console.log(`👥 عدد المستخدمين الموجودين: ${users.length}`);
    const firstUser = users[0];
    console.log('🔍 أول مستخدم موجود:');
    console.log('  - المعرف:', firstUser.id);
    console.log('  - الإيميل:', firstUser.email);
    
    // البحث عن ملاحظة موجودة للمستخدم
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, content')
      .eq('user_id', firstUser.id)
      .limit(1);
      
    if (notesError) {
      console.error('❌ خطأ في قراءة الملاحظات:', notesError);
    } else if (notes && notes.length > 0) {
      const note = notes[0];
      console.log('📝 ملاحظة موجودة للاختبار:');
      console.log('  - المعرف:', note.id);
      console.log('  - العنوان:', note.title);
      
      // الآن اختبار التحويل
      console.log('\n🔄 اختبار تحويل الملاحظة...');
      
      const response = await fetch('http://localhost:3000/api/projects/convert-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
          projectName: `مشروع تجريبي - ${new Date().toISOString()}`,
          projectDescription: 'اختبار إصلاح تحويل الملاحظة'
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
        
        console.log('🎉 الإصلاح يعمل بنجاح!');
        
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
      
    } else {
      console.log('❌ لا توجد ملاحظات للمستخدم للاختبار');
    }
  } else {
    console.log('❌ لا يوجد مستخدمين في النظام');
  }
  
} catch (error) {
  console.error('❌ خطأ في الاختبار:', error);
}
