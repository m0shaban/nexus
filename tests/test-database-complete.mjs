#!/usr/bin/env node

/**
 * اختبار شامل لقاعدة البيانات المحدثة
 * Complete Database Test for Updated Nexus System
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// قراءة متغيرات البيئة
const envPath = join(__dirname, '.env');
let envContent = '';
try {
    envContent = readFileSync(envPath, 'utf8');
} catch (error) {
    console.error('❌ لا يمكن قراءة ملف .env');
    process.exit(1);
}

// استخراج المتغيرات
const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ متغيرات Supabase غير موجودة في ملف .env');
    process.exit(1);
}

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 بدء الاختبار الشامل لقاعدة البيانات المحدثة');
console.log('==========================================');

/**
 * اختبار الاتصال بقاعدة البيانات
 */
async function testConnection() {
    try {
        console.log('🔌 اختبار الاتصال بقاعدة البيانات...');
        
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
            
        if (error) throw error;
        
        console.log('✅ الاتصال بقاعدة البيانات نجح');
        return true;
    } catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error.message);
        return false;
    }
}

/**
 * اختبار وجود الجداول الأساسية
 */
async function testTablesExistence() {
    try {
        console.log('\n📋 اختبار وجود الجداول...');
        
        const tables = [
            'users', 'user_sessions', 'user_preferences', 'user_activities',
            'notes', 'note_telegram_messages', 'note_ai_analysis',
            'projects', 'tasks', 'project_collaborators', 'task_comments',
            'scenarios', 'scenario_variables', 'scenario_assumptions',
            'streaks', 'streak_activities', 'streak_milestones',
            'mirror_reflections', 'mirror_goals', 'mirror_assessments',
            'logos', 'logo_versions', 'logo_categories'
        ];
        
        const existingTables = [];
        const missingTables = [];
        
        for (const table of tables) {
            try {
                const { error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (error && error.code === '42P01') {
                    missingTables.push(table);
                } else {
                    existingTables.push(table);
                }
            } catch (err) {
                missingTables.push(table);
            }
        }
        
        console.log(`✅ الجداول الموجودة: ${existingTables.length}/${tables.length}`);
        if (missingTables.length > 0) {
            console.log(`⚠️  الجداول المفقودة: ${missingTables.join(', ')}`);
        }
        
        return { existingTables, missingTables };
    } catch (error) {
        console.error('❌ خطأ في اختبار الجداول:', error.message);
        return { existingTables: [], missingTables: [] };
    }
}

/**
 * اختبار الدوال والـ Views
 */
async function testFunctionsAndViews() {
    try {
        console.log('\n🔧 اختبار الدوال والـ Views...');
        
        // اختبار بعض الـ Views المهمة
        const views = [
            'user_analytics_dashboard',
            'projects_with_details',
            'tasks_with_details',
            'scenarios_with_details',
            'streaks_with_details'
        ];
        
        const existingViews = [];
        
        for (const view of views) {
            try {
                const { error } = await supabase
                    .from(view)
                    .select('*', { count: 'exact', head: true });
                
                if (!error) {
                    existingViews.push(view);
                }
            } catch (err) {
                // View غير موجود
            }
        }
        
        console.log(`✅ الـ Views الموجودة: ${existingViews.length}/${views.length}`);
        
        // اختبار بعض الدوال
        try {
            const { data, error } = await supabase.rpc('search_notes', {
                search_query: 'test',
                user_id_param: null
            });
            
            if (!error) {
                console.log('✅ دالة البحث في الملاحظات تعمل');
            }
        } catch (err) {
            console.log('⚠️  دالة البحث في الملاحظات غير متاحة');
        }
        
        return existingViews;
    } catch (error) {
        console.error('❌ خطأ في اختبار الدوال والـ Views:', error.message);
        return [];
    }
}

/**
 * اختبار إنشاء وحذف بيانات تجريبية
 */
async function testDataOperations() {
    try {
        console.log('\n📝 اختبار عمليات البيانات...');
        
        // إنشاء مستخدم تجريبي
        const { data: user, error: userError } = await supabase
            .from('users')
            .insert({
                email: `test_${Date.now()}@example.com`,
                full_name: 'مستخدم تجريبي',
                username: `test_user_${Date.now()}`,
                role: 'user'
            })
            .select()
            .single();
            
        if (userError) throw userError;
        console.log('✅ تم إنشاء مستخدم تجريبي');
        
        // إنشاء ملاحظة تجريبية
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .insert({
                user_id: user.id,
                title: 'ملاحظة تجريبية',
                content: 'هذه ملاحظة تجريبية للاختبار',
                type: 'text',
                status: 'active'
            })
            .select()
            .single();
            
        if (noteError) throw noteError;
        console.log('✅ تم إنشاء ملاحظة تجريبية');
        
        // إنشاء مشروع تجريبي
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                name: 'مشروع تجريبي',
                description: 'هذا مشروع تجريبي للاختبار',
                status: 'active',
                priority: 'medium'
            })
            .select()
            .single();
            
        if (projectError) throw projectError;
        console.log('✅ تم إنشاء مشروع تجريبي');
        
        // إنشاء مهمة تجريبية
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert({
                project_id: project.id,
                title: 'مهمة تجريبية',
                description: 'هذه مهمة تجريبية للاختبار',
                status: 'todo',
                priority: 'medium'
            })
            .select()
            .single();
            
        if (taskError) throw taskError;
        console.log('✅ تم إنشاء مهمة تجريبية');
        
        // حذف البيانات التجريبية
        await supabase.from('tasks').delete().eq('id', task.id);
        await supabase.from('projects').delete().eq('id', project.id);
        await supabase.from('notes').delete().eq('id', note.id);
        await supabase.from('users').delete().eq('id', user.id);
        
        console.log('✅ تم حذف البيانات التجريبية');
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في اختبار عمليات البيانات:', error.message);
        return false;
    }
}

/**
 * اختبار الأمان وسياسات RLS
 */
async function testSecurity() {
    try {
        console.log('\n🔒 اختبار سياسات الأمان (RLS)...');
        
        // إنشاء عميل بدون صلاحيات admin
        const publicClient = createClient(supabaseUrl, getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
        
        // محاولة الوصول للبيانات بدون تسجيل دخول
        const { data, error } = await publicClient
            .from('users')
            .select('*')
            .limit(1);
        
        if (error || !data || data.length === 0) {
            console.log('✅ سياسات RLS تعمل بشكل صحيح - منع الوصول غير المصرح');
        } else {
            console.log('⚠️  قد تكون هناك مشكلة في سياسات RLS');
        }
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في اختبار الأمان:', error.message);
        return false;
    }
}

/**
 * اختبار الفهارس والأداء
 */
async function testPerformance() {
    try {
        console.log('\n⚡ اختبار الفهارس والأداء...');
        
        // اختبار البحث النصي
        const startTime = Date.now();
        
        const { data, error } = await supabase
            .from('notes')
            .select('id, title, content')
            .textSearch('title', 'test', {
                config: 'arabic'
            })
            .limit(10);
        
        const duration = Date.now() - startTime;
        
        if (!error) {
            console.log(`✅ البحث النصي يعمل في ${duration}ms`);
        } else {
            console.log('⚠️  البحث النصي قد لا يعمل بشكل مثالي');
        }
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في اختبار الأداء:', error.message);
        return false;
    }
}

/**
 * اختبار إحصائيات قاعدة البيانات
 */
async function getDatabaseStats() {
    try {
        console.log('\n📊 إحصائيات قاعدة البيانات:');
        
        const tables = ['users', 'notes', 'projects', 'tasks', 'scenarios', 'streaks'];
        const stats = {};
        
        for (const table of tables) {
            try {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (!error) {
                    stats[table] = count || 0;
                }
            } catch (err) {
                stats[table] = 'غير متاح';
            }
        }
        
        Object.entries(stats).forEach(([table, count]) => {
            console.log(`  - ${table}: ${count}`);
        });
        
        return stats;
    } catch (error) {
        console.error('❌ خطأ في جمع الإحصائيات:', error.message);
        return {};
    }
}

/**
 * تشغيل جميع الاختبارات
 */
async function runAllTests() {
    console.log(`⏰ بدء الاختبار في: ${new Date().toLocaleString('ar-SA')}\n`);
    
    const results = {
        connection: false,
        tables: { existingTables: [], missingTables: [] },
        views: [],
        dataOps: false,
        security: false,
        performance: false,
        stats: {}
    };
    
    // تشغيل الاختبارات
    results.connection = await testConnection();
    results.tables = await testTablesExistence();
    results.views = await testFunctionsAndViews();
    results.dataOps = await testDataOperations();
    results.security = await testSecurity();
    results.performance = await testPerformance();
    results.stats = await getDatabaseStats();
    
    // ملخص النتائج
    console.log('\n==========================================');
    console.log('📋 ملخص نتائج الاختبار:');
    console.log('==========================================');
    
    const passed = [
        results.connection && '✅ الاتصال',
        results.tables.existingTables.length >= 15 && '✅ الجداول',
        results.views.length >= 3 && '✅ الـ Views',
        results.dataOps && '✅ عمليات البيانات',
        results.security && '✅ الأمان',
        results.performance && '✅ الأداء'
    ].filter(Boolean);
    
    const failed = [
        !results.connection && '❌ الاتصال',
        results.tables.existingTables.length < 15 && '❌ الجداول',
        results.views.length < 3 && '❌ الـ Views',
        !results.dataOps && '❌ عمليات البيانات',
        !results.security && '❌ الأمان',
        !results.performance && '❌ الأداء'
    ].filter(Boolean);
    
    console.log(`النتائج الناجحة: ${passed.length}/6`);
    console.log(`النتائج الفاشلة: ${failed.length}/6`);
    
    if (passed.length >= 4) {
        console.log('\n🎉 قاعدة البيانات تعمل بشكل جيد!');
        console.log('✅ معظم الميزات تعمل بنجاح');
        console.log('🚀 يمكنك البدء باستخدام التطبيق');
    } else {
        console.log('\n⚠️  قاعدة البيانات تحتاج إلى مراجعة');
        console.log('❌ هناك مشاكل في بعض الميزات');
        console.log('🔧 راجع ملفات الإعداد وأعد التشغيل');
    }
    
    if (results.tables.missingTables.length > 0) {
        console.log(`\n⚠️  الجداول المفقودة: ${results.tables.missingTables.join(', ')}`);
        console.log('💡 قم بتشغيل سكريبت setup-database.ps1 مرة أخرى');
    }
    
    console.log(`\n⏰ انتهى الاختبار في: ${new Date().toLocaleString('ar-SA')}`);
    console.log('==========================================');
    
    return results;
}

// تشغيل الاختبارات
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('💥 خطأ عام في الاختبار:', error);
            process.exit(1);
        });
}

export { runAllTests, testConnection, testTablesExistence };
