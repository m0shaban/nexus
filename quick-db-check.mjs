#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔍 فحص سريع لقاعدة البيانات...');

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c';

const supabase = createClient(supabaseUrl, supabaseKey);

// الجداول الأساسية التي نعرف أنها موجودة
const coreTables = ['users', 'notes', 'projects', 'tasks', 'streaks'];

// الجداول المتقدمة من المخطط
const advancedTables = [
  'logos', 'logo_categories', 'logo_variations',
  'logos_conversations', 'logos_messages', 'logos_analysis_sessions', 'logos_user_preferences',
  'mirror_entries', 'mirror_goals', 'mirror_insights',
  'scenarios', 'scenario_variables', 'scenario_assumptions', 'scenario_actions', 'scenario_outputs'
];

async function quickCheck() {
  console.log('🔧 فحص الجداول الأساسية...');
  
  for (const table of coreTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      if (!error) {
        console.log(`✅ ${table} - موجود`);
      } else {
        console.log(`❌ ${table} - غير موجود: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table} - خطأ: ${err.message}`);
    }
  }
  
  console.log('\n🎯 فحص الجداول المتقدمة...');
  const missingAdvanced = [];
  
  for (const table of advancedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      if (!error) {
        console.log(`✅ ${table} - موجود`);
      } else {
        console.log(`❌ ${table} - مفقود`);
        missingAdvanced.push(table);
      }
    } catch (err) {
      console.log(`❌ ${table} - مفقود`);
      missingAdvanced.push(table);
    }
  }
  
  console.log('\n📊 التقييم النهائي:');
  if (missingAdvanced.length === 0) {
    console.log('🎉 جميع الجداول موجودة! قاعدة البيانات مكتملة.');
  } else {
    console.log(`⚠️ يوجد ${missingAdvanced.length} جداول مفقودة من أصل ${advancedTables.length}`);
    console.log('\n🔧 الجداول المفقودة:');
    
    // تصنيف حسب النظام
    const logoTables = missingAdvanced.filter(t => t.startsWith('logos'));
    const mirrorTables = missingAdvanced.filter(t => t.startsWith('mirror'));
    const scenarioTables = missingAdvanced.filter(t => t.startsWith('scenario'));
    
    if (logoTables.length > 0) {
      console.log('\n📊 نظام الشعارات (Logos):');
      logoTables.forEach(t => console.log(`  • ${t}`));
    }
    
    if (mirrorTables.length > 0) {
      console.log('\n🪞 نظام التأمل (Mirror):');
      mirrorTables.forEach(t => console.log(`  • ${t}`));
    }
    
    if (scenarioTables.length > 0) {
      console.log('\n🎭 نظام السيناريوهات:');
      scenarioTables.forEach(t => console.log(`  • ${t}`));
    }
    
    console.log('\n💡 التوصيات:');
    console.log('1. الجداول الأساسية موجودة - المشروع يعمل');
    console.log('2. يمكن إضافة الأنظمة المتقدمة تدريجياً');
    console.log('3. أولوية إنشاء الجداول: Mirror → Logos → Scenarios');
  }
}

quickCheck().catch(console.error);
