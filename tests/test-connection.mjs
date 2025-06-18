#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔄 اختبار اتصال قاعدة البيانات...');
console.log('URL:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ متغيرات البيئة غير محددة');
    console.error('تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // اختبار الاتصال الأساسي
        console.log('🔗 اختبار الاتصال الأساسي...');
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ خطأ في الاتصال:', error.message);
            return false;
        }
        
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
        console.log('📊 عدد المستخدمين:', data);
        
        // اختبار الجداول الأساسية
        console.log('\n🔍 اختبار الجداول الأساسية...');
        
        const tables = ['users', 'projects', 'notes', 'tasks', 'scenarios', 'streaks'];
        
        for (const table of tables) {
            try {
                const { count, error: tableError } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (tableError) {
                    console.log(`❌ ${table}: غير موجود أو خطأ`);
                } else {
                    console.log(`✅ ${table}: موجود (${count} صف)`);
                }            } catch {
                console.log(`❌ ${table}: خطأ في الوصول`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ خطأ عام:', error);
        return false;
    }
}

testConnection().then(success => {
    if (success) {
        console.log('\n🎉 قاعدة البيانات تعمل بشكل صحيح!');
    } else {
        console.log('\n⚠️ هناك مشاكل في قاعدة البيانات');
        process.exit(1);
    }
});
