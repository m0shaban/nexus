#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔍 فحص حالة قاعدة البيانات...');

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c';

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  // فحص المشاريع الموجودة
  console.log('📋 فحص المشاريع الموجودة...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, project_key, name, created_at')
    .order('created_at', { ascending: false });
    
  if (projectsError) {
    console.error('❌ خطأ في قراءة المشاريع:', projectsError);
  } else {
    console.log(`📊 عدد المشاريع الموجودة: ${projects.length}`);
    if (projects.length > 0) {
      console.log('🔍 مفاتيح المشاريع الموجودة:');
      projects.forEach(p => {
        console.log(`  - ${p.project_key}: ${p.name} (${new Date(p.created_at).toLocaleDateString('ar-SA')})`);
      });
      
      // البحث عن المفاتيح المكررة
      const keyCounts = {};
      projects.forEach(p => {
        keyCounts[p.project_key] = (keyCounts[p.project_key] || 0) + 1;
      });
      
      const duplicates = Object.entries(keyCounts).filter(([key, count]) => count > 1);
      if (duplicates.length > 0) {
        console.log('⚠️ مفاتيح مكررة موجودة:');
        duplicates.forEach(([key, count]) => {
          console.log(`  - ${key}: ${count} مرات`);
        });
      } else {
        console.log('✅ لا توجد مفاتيح مكررة');
      }
    }
  }
  
  // اقتراح المفتاح التالي المتاح
  console.log('\n🔧 البحث عن المفتاح التالي المتاح...');
  let nextKey = 1;
  const existingKeys = projects?.map(p => p.project_key) || [];
  
  while (existingKeys.includes(`PROJ-${String(nextKey).padStart(3, '0')}`)) {
    nextKey++;
  }
  
  console.log(`💡 المفتاح التالي المتاح: PROJ-${String(nextKey).padStart(3, '0')}`);
  
} catch (error) {
  console.error('❌ خطأ غير متوقع:', error);
}
