#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔧 إصلاح دالة توليد مفتاح المشروع...');

const supabaseUrl = 'https://mtsgkpgbdzgqrcqitayq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2drcGdiZHpncXJjcWl0YXlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg2MTQxNywiZXhwIjoyMDY1NDM3NDE3fQ.koF7RkRFiP-Pq9L7EXQn1Nz_xzybJXRUywLUgr7yM4c';

const supabase = createClient(supabaseUrl, supabaseKey);

const fixFunction = `
CREATE OR REPLACE FUNCTION generate_project_key()
RETURNS TRIGGER AS $$
DECLARE
    project_count INTEGER;
    project_key_candidate TEXT;
    key_exists BOOLEAN;
BEGIN
    IF NEW.project_key IS NULL THEN
        -- البحث عن أول رقم متاح
        project_count := 1;
        LOOP
            project_key_candidate := 'PROJ-' || LPAD(project_count::TEXT, 3, '0');
            
            -- التحقق من عدم وجود هذا المفتاح
            SELECT EXISTS(SELECT 1 FROM projects WHERE project_key = project_key_candidate) INTO key_exists;
            
            IF NOT key_exists THEN
                NEW.project_key := project_key_candidate;
                EXIT;
            END IF;
            
            project_count := project_count + 1;
            
            -- حماية من اللوب اللانهائي (حد أقصى 9999 مشروع)
            IF project_count > 9999 THEN
                RAISE EXCEPTION 'تم الوصول للحد الأقصى لعدد المشاريع (9999)';
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;

try {
  console.log('📝 تطبيق الإصلاح على قاعدة البيانات...');
  
  const { error } = await supabase.rpc('exec_sql', { sql: fixFunction });
  
  if (error) {
    console.error('❌ خطأ في تطبيق الإصلاح:', error);
    process.exit(1);
  }
  
  console.log('✅ تم تطبيق الإصلاح بنجاح!');
  
  // اختبار الدالة الجديدة
  console.log('🧪 اختبار الدالة المحدثة...');
  
  const { data: projects, error: selectError } = await supabase
    .from('projects')
    .select('project_key')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (selectError) {
    console.error('❌ خطأ في قراءة المشاريع:', selectError);
  } else {
    console.log('📋 آخر 5 مفاتيح مشاريع:');
    projects.forEach(p => console.log('  -', p.project_key));
  }
  
  console.log('🎯 الإصلاح مكتمل! يمكنك الآن تجربة تحويل الملاحظة مرة أخرى.');
  
} catch (error) {
  console.error('❌ خطأ غير متوقع:', error);
  process.exit(1);
}
