#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔍 تحليل قاعدة البيانات الحالية...');

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c';

const supabase = createClient(supabaseUrl, supabaseKey);

// الجداول المتوقعة من المخطط
const expectedTables = [
  // المستخدمين والأمان
  'users', 'user_preferences', 'user_sessions', 'user_activity_log', 'user_achievements',
  
  // الملاحظات
  'notes', 'note_tags', 'note_tag_assignments', 'note_comments', 'note_files', 'note_analysis_history',
  
  // المشاريع والمهام
  'projects', 'project_collaborators', 'project_files', 'project_tags', 'project_activities',
  'tasks', 'task_comments', 'task_dependencies', 'task_attachments',
  
  // الـ Streaks
  'streaks', 'streak_activities', 'streak_milestones', 'streak_reminders', 'streak_rewards',
  
  // السيناريوهات
  'scenarios', 'scenario_variables', 'scenario_assumptions', 'scenario_actions', 'scenario_outputs',
  
  // Mirror (التأمل الذاتي)
  'mirror_entries', 'mirror_goals', 'mirror_insights',
  
  // الشعارات (Logos)
  'logos', 'logo_categories', 'logo_variations',
  'logos_conversations', 'logos_messages', 'logos_analysis_sessions', 'logos_user_preferences'
];

async function analyzeDatabase() {
  try {
    // الحصول على قائمة الجداول الموجودة
    const { data, error } = await supabase
      .rpc('get_table_names');
      
    if (error) {
      // طريقة بديلة للحصول على الجداول
      console.log('🔄 استخدام طريقة بديلة لفحص الجداول...');
      
      const results = [];
      for (const table of expectedTables) {
        try {
          const { data: testData, error: testError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
            
          if (!testError) {
            results.push({ table, exists: true, count: testData?.length || 0 });
          } else {
            results.push({ table, exists: false, error: testError.message });
          }
        } catch (err) {
          results.push({ table, exists: false, error: err.message });
        }
      }
      
      console.log('\n📊 تحليل الجداول:');
      const existingTables = [];
      const missingTables = [];
      
      results.forEach(result => {
        if (result.exists) {
          existingTables.push(result.table);
          console.log(`✅ ${result.table}`);
        } else {
          missingTables.push(result.table);
          console.log(`❌ ${result.table} - ${result.error}`);
        }
      });
      
      console.log(`\n📈 الإحصائيات:`);
      console.log(`✅ جداول موجودة: ${existingTables.length}`);
      console.log(`❌ جداول مفقودة: ${missingTables.length}`);
      console.log(`📊 النسبة: ${((existingTables.length / expectedTables.length) * 100).toFixed(1)}%`);
      
      if (missingTables.length > 0) {
        console.log(`\n🔧 الجداول المفقودة التي تحتاج إنشاء:`);
        missingTables.forEach(table => {
          console.log(`  - ${table}`);
        });
        
        // تصنيف الجداول المفقودة حسب الوحدة
        const moduleCategories = {
          'نظام الشعارات (Logos)': missingTables.filter(t => t.startsWith('logos')),
          'نظام التأمل (Mirror)': missingTables.filter(t => t.startsWith('mirror')),
          'نظام السيناريوهات': missingTables.filter(t => t.startsWith('scenario')),
          'نظام الـ Streaks': missingTables.filter(t => t.startsWith('streak')),
          'أخرى': missingTables.filter(t => !t.startsWith('logos') && !t.startsWith('mirror') && !t.startsWith('scenario') && !t.startsWith('streak'))
        };
        
        console.log(`\n🏗️ تصنيف الجداول المفقودة:`);
        Object.entries(moduleCategories).forEach(([category, tables]) => {
          if (tables.length > 0) {
            console.log(`\n${category}:`);
            tables.forEach(table => console.log(`  • ${table}`));
          }
        });
      } else {
        console.log(`\n🎉 ممتاز! جميع الجداول المتوقعة موجودة.`);
      }
      
      return { existingTables, missingTables };
      
    } else {
      console.log('✅ تم الحصول على قائمة الجداول بنجاح');
      console.log('📋 الجداول الموجودة:', data);
    }
    
  } catch (error) {
    console.error('❌ خطأ في تحليل قاعدة البيانات:', error);
  }
}

// تشغيل التحليل
analyzeDatabase().then((result) => {
  if (result && result.missingTables.length > 0) {
    console.log(`\n💡 توصيات:`);
    console.log(`1. إنشاء الجداول المفقودة حسب الأولوية`);
    console.log(`2. التأكد من صحة العلاقات بين الجداول`);
    console.log(`3. إضافة فهارس للبحث السريع`);
    console.log(`4. تحديث المخطط الأمني (RLS)`);
  } else {
    console.log(`\n🎯 قاعدة البيانات مكتملة وجاهزة للاستخدام!`);
  }
  
  console.log('\n🏁 انتهى التحليل');
});
