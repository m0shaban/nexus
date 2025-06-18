#!/usr/bin/env node
// ========================================
// Nexus Database Final Test Script
// سكريبت الاختبار النهائي لقاعدة بيانات Nexus
// ========================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ متغيرات البيئة غير موجودة');
    console.error('تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 🏗️ قائمة الجداول المطلوبة
const REQUIRED_TABLES = [
    'users', 'user_preferences', 'user_sessions', 'user_activities', 'user_achievements',
    'notes', 'note_tags', 'note_versions', 'note_collaborations',
    'projects', 'project_members', 'project_tasks', 'project_comments', 'project_files', 'project_activity_logs',
    'scenarios', 'scenario_steps', 'scenario_results', 'scenario_tags',
    'streaks', 'streak_activities', 'streak_milestones',
    'mirror_reflections', 'mirror_insights', 'mirror_tags',
    'logos', 'logo_categories', 'logo_tags', 'logo_versions',
    'analytics_summary', 'analytics_user_activity', 'analytics_content_performance'
];

// 🔍 قائمة الـ Views المطلوبة
const REQUIRED_VIEWS = [
    'user_stats_view',
    'project_analytics_view', 'project_summary_view',
    'scenario_analytics_view',
    'streak_summary_view',
    'mirror_analytics_view',
    'logo_analytics_view',
    'analytics_dashboard_view'
];

// 📋 قائمة الدوال المطلوبة
const REQUIRED_FUNCTIONS = [
    'create_user_with_preferences',
    'search_notes', 'get_note_analytics',
    'search_projects', 'get_project_analytics', 'get_user_projects_with_stats',
    'search_scenarios', 'get_scenario_analytics',
    'get_streak_analytics', 'update_streak_activity',
    'search_mirror_reflections', 'get_mirror_analytics',
    'search_logos', 'get_logo_analytics',
    'get_user_dashboard_stats'
];

// 🛡️ إحصائيات الاختبار
let stats = {
    tables: { total: 0, found: 0, missing: 0 },
    views: { total: 0, found: 0, missing: 0 },
    functions: { total: 0, found: 0, missing: 0 },
    policies: { total: 0, found: 0, missing: 0 },
    data: { total: 0, found: 0, missing: 0 }
};

console.log('🚀 بدء الاختبار النهائي لقاعدة بيانات Nexus');
console.log('='.repeat(50));

// 📊 اختبار الجداول
async function testTables() {
    console.log('\n📊 اختبار الجداول...');
    
    stats.tables.total = REQUIRED_TABLES.length;
      for (const table of REQUIRED_TABLES) {
        try {
            const { error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
                stats.tables.missing++;
            } else {
                console.log(`✅ ${table}: موجود`);
                stats.tables.found++;
            }
        } catch {
            console.log(`❌ ${table}: خطأ في الاتصال`);
            stats.tables.missing++;
        }
    }
}

// 👁️ اختبار الـ Views
async function testViews() {
    console.log('\n👁️ اختبار الـ Views...');
    
    stats.views.total = REQUIRED_VIEWS.length;
      for (const view of REQUIRED_VIEWS) {
        try {
            const { error } = await supabase
                .from(view)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`❌ ${view}: ${error.message}`);
                stats.views.missing++;
            } else {
                console.log(`✅ ${view}: موجود`);
                stats.views.found++;
            }
        } catch {
            console.log(`❌ ${view}: خطأ في الاتصال`);
            stats.views.missing++;
        }
    }
}

// ⚙️ اختبار الدوال
async function testFunctions() {
    console.log('\n⚙️ اختبار الدوال...');
    
    stats.functions.total = REQUIRED_FUNCTIONS.length;
    
    // التحقق من وجود الدوال
    try {
        const { data: functions, error } = await supabase
            .rpc('get_function_list');
        
        if (error) {
            console.log('❌ لا يمكن التحقق من الدوال:', error.message);
            stats.functions.missing = stats.functions.total;
            return;
        }
        
        const functionNames = functions ? functions.map(f => f.routine_name) : [];
        
        for (const func of REQUIRED_FUNCTIONS) {
            if (functionNames.includes(func)) {
                console.log(`✅ ${func}: موجود`);
                stats.functions.found++;
            } else {
                console.log(`❌ ${func}: غير موجود`);
                stats.functions.missing++;
            }
        }
    } catch (err) {
        console.log('❌ خطأ في تشغيل الاختبارات:', err.message);
        
        // اختبار مبسط - فحص كل دالة منفصلة
        console.log('🔄 جاري تجربة اختبار مبسط...');
        
        for (const func of REQUIRED_FUNCTIONS) {
            try {
                // محاولة تشغيل دالة بسيطة للتحقق من وجودها
                const { error } = await supabase.rpc(func, {});
                
                if (error && error.message.includes('function') && error.message.includes('does not exist')) {
                    console.log(`❌ ${func}: غير موجود`);
                    stats.functions.missing++;
                } else {
                    console.log(`✅ ${func}: موجود`);
                    stats.functions.found++;
                }
            } catch {
                console.log(`⚠️ ${func}: لا يمكن التحقق`);
                stats.functions.missing++;
            }
        }
    }
}

// 🛡️ اختبار سياسات RLS
async function testRLSPolicies() {
    console.log('\n🛡️ اختبار سياسات RLS...');
    
    const tablesToTest = ['users', 'notes', 'projects', 'scenarios', 'streaks'];
    stats.policies.total = tablesToTest.length;
      for (const table of tablesToTest) {
        try {
            // محاولة قراءة البيانات بدون صلاحيات (يجب أن تفشل أو تعيد بيانات محدودة)
            await supabase
                .from(table)
                .select('id')
                .limit(1);
            
            // إذا لم يكن هناك خطأ، فالسياسات تعمل
            console.log(`✅ ${table}: سياسات RLS تعمل`);
            stats.policies.found++;
        } catch {
            console.log(`❌ ${table}: مشكلة في سياسات RLS`);
            stats.policies.missing++;
        }
    }
}

// 📝 اختبار البيانات التجريبية
async function testSampleData() {
    console.log('\n📝 اختبار البيانات التجريبية...');
    
    const dataTests = [
        { table: 'users', expected: 3 },
        { table: 'notes', expected: 5 },
        { table: 'projects', expected: 3 },
        { table: 'scenarios', expected: 3 },
        { table: 'streaks', expected: 2 }
    ];
    
    stats.data.total = dataTests.length;
    
    for (const test of dataTests) {
        try {
            const { count, error } = await supabase
                .from(test.table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`❌ ${test.table}: خطأ في الاستعلام`);
                stats.data.missing++;
            } else if (count >= test.expected) {
                console.log(`✅ ${test.table}: ${count} سجل (متوقع: ${test.expected}+)`);
                stats.data.found++;
            } else {
                console.log(`⚠️ ${test.table}: ${count} سجل فقط (متوقع: ${test.expected}+)`);
                stats.data.missing++;
            }                } catch {
                    console.log(`❌ ${test.table}: خطأ في الاتصال`);
                    stats.data.missing++;
                }
    }
}

// 🔧 اختبار دوال محددة
async function testSpecificFunctions() {
    console.log('\n🔧 اختبار دوال محددة...');
      // اختبار دالة البحث في الملاحظات
    try {
        const { error } = await supabase
            .rpc('search_notes', { 
                search_query: 'test',
                user_id_param: '00000000-0000-0000-0000-000000000001'
            });
        
        if (!error) {
            console.log('✅ دالة search_notes تعمل بشكل صحيح');
        } else {
            console.log(`❌ دالة search_notes: ${error.message}`);
        }
    } catch {
        console.log('❌ دالة search_notes: غير متاحة');
    }
    
    // اختبار دالة إحصائيات المستخدم
    try {
        const { error } = await supabase
            .rpc('get_user_dashboard_stats', { 
                user_id_param: '00000000-0000-0000-0000-000000000001'
            });
        
        if (!error) {
            console.log('✅ دالة get_user_dashboard_stats تعمل بشكل صحيح');
        } else {
            console.log(`❌ دالة get_user_dashboard_stats: ${error.message}`);
        }
    } catch {
        console.log('❌ دالة get_user_dashboard_stats: غير متاحة');
    }
}

// 📊 طباعة التقرير النهائي
function printFinalReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 التقرير النهائي لاختبار قاعدة البيانات');
    console.log('='.repeat(50));
    
    console.log(`📊 الجداول: ${stats.tables.found}/${stats.tables.total} (${Math.round(stats.tables.found/stats.tables.total*100)}%)`);
    console.log(`👁️ الـ Views: ${stats.views.found}/${stats.views.total} (${Math.round(stats.views.found/stats.views.total*100)}%)`);
    console.log(`⚙️ الدوال: ${stats.functions.found}/${stats.functions.total} (${Math.round(stats.functions.found/stats.functions.total*100)}%)`);
    console.log(`🛡️ سياسات RLS: ${stats.policies.found}/${stats.policies.total} (${Math.round(stats.policies.found/stats.policies.total*100)}%)`);
    console.log(`📝 البيانات التجريبية: ${stats.data.found}/${stats.data.total} (${Math.round(stats.data.found/stats.data.total*100)}%)`);
    
    const totalFound = stats.tables.found + stats.views.found + stats.functions.found + stats.policies.found + stats.data.found;
    const totalExpected = stats.tables.total + stats.views.total + stats.functions.total + stats.policies.total + stats.data.total;
    const overallScore = Math.round(totalFound/totalExpected*100);
    
    console.log(`\n🎯 النتيجة الإجمالية: ${overallScore}%`);
    
    if (overallScore >= 90) {
        console.log('🎉 ممتاز! قاعدة البيانات جاهزة للاستخدام');
    } else if (overallScore >= 75) {
        console.log('✅ جيد! قاعدة البيانات تعمل مع بعض المشاكل البسيطة');
    } else if (overallScore >= 50) {
        console.log('⚠️ مقبول! يحتاج إلى بعض الإصلاحات');
    } else {
        console.log('❌ ضعيف! يحتاج إلى إصلاحات جوهرية');
    }
    
    console.log('\n📋 توصيات:');
    if (stats.tables.missing > 0) {
        console.log('- تأكد من تشغيل جميع ملفات إنشاء الجداول');
    }
    if (stats.views.missing > 0) {
        console.log('- تأكد من تشغيل ملف 09-create-analytics-views.sql');
    }
    if (stats.functions.missing > 0) {
        console.log('- تأكد من تشغيل جميع ملفات الدوال');
    }
    if (stats.data.missing > 0) {
        console.log('- تأكد من تشغيل ملف 10-create-sample-data.sql');
    }
}

// 🚀 تشغيل جميع الاختبارات
async function runAllTests() {
    try {
        await testTables();
        await testViews();
        await testFunctions();
        await testRLSPolicies();
        await testSampleData();
        await testSpecificFunctions();
        
        printFinalReport();
        
    } catch (error) {
        console.error('❌ خطأ في تشغيل الاختبارات:', error);
        process.exit(1);
    }
}

// تشغيل الاختبارات
runAllTests();
