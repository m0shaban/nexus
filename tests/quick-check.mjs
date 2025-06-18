#!/usr/bin/env node
// ========================================
// Nexus Database Quick Check
// فحص سريع لحالة قاعدة بيانات Nexus
// ========================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ متغيرات البيئة غير موجودة');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🚀 فحص سريع لقاعدة بيانات Nexus');
console.log('='.repeat(40));

// قائمة الجداول الأساسية للاختبار
const CORE_TABLES = ['users', 'notes', 'projects', 'scenarios', 'streaks'];

async function quickCheck() {
    let successCount = 0;
    let totalCount = CORE_TABLES.length;
    
    for (const table of CORE_TABLES) {
        try {
            const { error } = await supabase
                .from(table)
                .select('id', { count: 'exact', head: true });
            
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: متاح`);
                successCount++;
            }
        } catch {
            console.log(`❌ ${table}: غير متاح`);
        }
    }
    
    console.log('\n' + '='.repeat(40));
    console.log(`📊 النتيجة: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    
    if (successCount === totalCount) {
        console.log('🎉 قاعدة البيانات تعمل بشكل ممتاز!');
    } else if (successCount > totalCount/2) {
        console.log('⚠️ قاعدة البيانات تعمل مع بعض المشاكل');
    } else {
        console.log('❌ قاعدة البيانات تحتاج إعداد');
    }
}

quickCheck();
