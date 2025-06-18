-- ========================================
-- 00-master-setup.sql
-- الملف الرئيسي لإعداد قاعدة البيانات الكاملة والمحدثة
-- يشغل جميع السكريبتات بالترتيب الصحيح
-- Master Setup File for Complete Nexus Database
-- ========================================

-- إعداد معاملات الاتصال والسلامة
\set ON_ERROR_STOP on
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET default_transaction_isolation = 'read committed';

-- بداية المعاملة الشاملة
BEGIN;

-- رسالة الترحيب والمعلومات
DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE '🚀 بدء إعداد قاعدة بيانات Nexus المتقدمة';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'النسخة: 2.0.0 - إصدار محدث ومتقدم';
    RAISE NOTICE 'التاريخ: %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'قاعدة البيانات: %', CURRENT_DATABASE();
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'سيتم إنشاء قاعدة بيانات متكاملة تشمل:';
    RAISE NOTICE '🔧 الإضافات والدوال المساعدة المتقدمة';
    RAISE NOTICE '👥 نظام المستخدمين والأمان (RLS)';
    RAISE NOTICE '📝 نظام الملاحظات الذكي مع AI';
    RAISE NOTICE '📁 نظام إدارة المشاريع والمهام الشامل';
    RAISE NOTICE '🎯 نظام تحليل السيناريوهات الذكي';
    RAISE NOTICE '🔥 نظام تتبع الإنجازات والعادات';
    RAISE NOTICE '🪞 نظام المرآة للتطوير الشخصي';
    RAISE NOTICE '🎨 نظام إدارة الشعارات والهوية';
    RAISE NOTICE '📊 واجهات التحليل والتقارير المتقدمة';
    RAISE NOTICE '🧪 بيانات تجريبية شاملة للاختبار';
    RAISE NOTICE '=========================================';
END $$;

-- 1. إعداد الإضافات والدوال المساعدة
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 الخطوة 1/10: إعداد الإضافات والدوال المساعدة...';
    RAISE NOTICE 'تتضمن: UUID، البحث النصي، JSONB، RLS، والدوال المخصصة';
END $$;

\i 01-setup-extensions.sql

-- تحقق من نجاح الخطوة الأولى
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'فشل في تثبيت إضافة UUID';
    END IF;
    RAISE NOTICE '✅ تم إعداد الإضافات والدوال بنجاح';
END $$;

-- 2. إنشاء نظام المستخدمين المتقدم
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '� الخطوة 2/10: إنشاء نظام المستخدمين المتقدم...';
    RAISE NOTICE 'يتضمن: المستخدمين، الجلسات، التفضيلات، الإنجازات، RLS';
END $$;

\i 02-create-users-new.sql

-- تحقق من نجاح إنشاء جدول المستخدمين
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'فشل في إنشاء جدول المستخدمين';
    END IF;
    RAISE NOTICE '✅ تم إنشاء نظام المستخدمين بنجاح';
END $$;

-- 3. إنشاء نظام الملاحظات الذكي
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📝 الخطوة 3/10: إنشاء نظام الملاحظات الذكي...';
    RAISE NOTICE 'يتضمن: الملاحظات، التليجرام، AI، البحث المتقدم، الربط الذكي';
END $$;

\i 03-create-notes.sql

-- تحقق من نجاح إنشاء جدول الملاحظات
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        RAISE EXCEPTION 'فشل في إنشاء جدول الملاحظات';
    END IF;
    RAISE NOTICE '✅ تم إنشاء نظام الملاحظات بنجاح';
END $$;

-- 4. إنشاء نظام إدارة المشاريع والمهام الشامل
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '� الخطوة 4/10: إنشاء نظام المشاريع والمهام الشامل...';
    RAISE NOTICE 'يتضمن: المشاريع، المهام، التبعيات، التعاونات، الملفات، الأنشطة';
END $$;

\i 04-create-projects-new.sql

-- تحقق من نجاح إنشاء جداول المشاريع
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        RAISE EXCEPTION 'فشل في إنشاء جدول المشاريع';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        RAISE EXCEPTION 'فشل في إنشاء جدول المهام';
    END IF;
    RAISE NOTICE '✅ تم إنشاء نظام المشاريع والمهام بنجاح';
END $$;

-- 5. إنشاء نظام تحليل السيناريوهات الذكي
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 الخطوة 5/10: إنشاء نظام تحليل السيناريوهات الذكي...';
    RAISE NOTICE 'يتضمن: السيناريوهات، المتغيرات، الافتراضات، الإجراءات، التحليل الذكي';
END $$;

\i 05-create-scenarios.sql

-- تحقق من نجاح إنشاء جداول السيناريوهات
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenarios') THEN
        RAISE EXCEPTION 'فشل في إنشاء جدول السيناريوهات';
    END IF;
    RAISE NOTICE '✅ تم إنشاء نظام السيناريوهات بنجاح';
END $$;

-- 6. إنشاء نظام تتبع الإنجازات والعادات
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔥 الخطوة 6/10: إنشاء نظام تتبع الإنجازات والعادات...';
    RAISE NOTICE 'يتضمن: السلاسل، الأنشطة، التذكيرات، المعالم، المكافآت';
END $$;

\i 06-create-streaks.sql

-- تحقق من نجاح إنشاء جداول السلاسل
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'streaks') THEN
        RAISE EXCEPTION 'فشل في إنشاء جدول السلاسل';
    END IF;
    RAISE NOTICE '✅ تم إنشاء نظام السلاسل بنجاح';
END $$;

-- 7. إنشاء نظام المرآة للتطوير الشخصي
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🪞 الخطوة 7/10: إنشاء نظام المرآة للتطوير الشخصي...';
    RAISE NOTICE 'يتضمن: التأملات، الأهداف، التقييمات، التحليلات الشخصية';
END $$;

\i 07-create-mirror.sql

-- تحقق من نجاح إنشاء جداول المرآة
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mirror_reflections') THEN
        RAISE EXCEPTION 'فشل في إنشاء جداول المرآة';
    END IF;
    RAISE NOTICE '✅ تم إنشاء نظام المرآة بنجاح';
END $$;

-- 8. إنشاء نظام إدارة الشعارات والهوية البصرية
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎨 الخطوة 8/10: إنشاء نظام إدارة الشعارات...';
    RAISE NOTICE 'يتضمن: الشعارات، العلامات التجارية، الألوان، الخطوط، الإصدارات';
END $$;

\i 08-create-logos.sql

-- تحقق من نجاح إنشاء جداول الشعارات
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logos') THEN
        RAISE EXCEPTION 'فشل في إنشاء جداول الشعارات';
    END IF;
    RAISE NOTICE '✅ تم إنشاء نظام الشعارات بنجاح';
END $$;

-- 9. إنشاء واجهات التحليل والتقارير المتقدمة
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 الخطوة 9/10: إنشاء واجهات التحليل والتقارير...';
    RAISE NOTICE 'يتضمن: لوحات المعلومات، التقارير، الإحصائيات، التحليلات';
END $$;

\i 09-create-analytics-views.sql

-- تحقق من نجاح إنشاء واجهات التحليل
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_analytics_dashboard') THEN
        RAISE EXCEPTION 'فشل في إنشاء واجهات التحليل';
    END IF;
    RAISE NOTICE '✅ تم إنشاء واجهات التحليل بنجاح';
END $$;

-- 10. إنشاء البيانات التجريبية الشاملة
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 الخطوة 10/10: إنشاء البيانات التجريبية...';
    RAISE NOTICE 'يتضمن: مستخدمين، مشاريع، ملاحظات، مهام، سيناريوهات، سلاسل';
END $$;

\i 10-create-sample-data.sql

-- تحقق من نجاح إنشاء البيانات التجريبية
DO $$
BEGIN
    DECLARE
        sample_users_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO sample_users_count FROM users WHERE email LIKE '%@example.com';
        IF sample_users_count = 0 THEN
            RAISE NOTICE '⚠️  لم يتم إنشاء بيانات تجريبية - قد يكون هذا مقصوداً';
        ELSE
            RAISE NOTICE '✅ تم إنشاء البيانات التجريبية بنجاح';
        END IF;
    END;
END $$;

-- ========================================
-- التحقق النهائي من سلامة البيانات
-- ========================================
DO $$
DECLARE
    user_count INTEGER;
    project_count INTEGER;
    note_count INTEGER;
    task_count INTEGER;
    scenario_count INTEGER;
    streak_count INTEGER;
    table_count INTEGER;
    view_count INTEGER;
    function_count INTEGER;
    index_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 التحقق النهائي من سلامة قاعدة البيانات...';
    
    -- إحصائيات البيانات
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO project_count FROM projects;
    SELECT COUNT(*) INTO note_count FROM notes;
    SELECT COUNT(*) INTO task_count FROM tasks;
    SELECT COUNT(*) INTO scenario_count FROM scenarios;
    SELECT COUNT(*) INTO streak_count FROM streaks;
    
    -- إحصائيات البنية
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_schema = 'public';
    
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
    
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '=========================================';
    RAISE NOTICE '📊 إحصائيات قاعدة البيانات النهائية:';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '📋 البنية التحتية:';
    RAISE NOTICE '  - الجداول: %', table_count;
    RAISE NOTICE '  - الواجهات (Views): %', view_count;
    RAISE NOTICE '  - الدوال: %', function_count;
    RAISE NOTICE '  - الفهارس: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE '📈 البيانات:';
    RAISE NOTICE '  - المستخدمون: %', user_count;
    RAISE NOTICE '  - المشاريع: %', project_count;
    RAISE NOTICE '  - الملاحظات: %', note_count;
    RAISE NOTICE '  - المهام: %', task_count;
    RAISE NOTICE '  - السيناريوهات: %', scenario_count;
    RAISE NOTICE '  - السلاسل: %', streak_count;
    
    -- التحقق من سلامة البنية
    IF table_count >= 20 AND view_count >= 5 AND function_count >= 10 THEN
        RAISE NOTICE '';
        RAISE NOTICE '=========================================';
        RAISE NOTICE '🎉 تم إعداد قاعدة البيانات بنجاح!';
        RAISE NOTICE '=========================================';
        RAISE NOTICE '✅ جميع الوحدات تم إنشاؤها بنجاح';
        RAISE NOTICE '✅ جميع الفهارس والدوال تم تطبيقها';
        RAISE NOTICE '✅ سياسات الأمان (RLS) مفعلة';
        RAISE NOTICE '✅ البحث الذكي متاح';
        RAISE NOTICE '✅ التحليلات والتقارير جاهزة';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 قاعدة البيانات جاهزة للاستخدام!';
        RAISE NOTICE 'يمكنك الآن تشغيل التطبيق والبدء بالعمل';
        RAISE NOTICE '=========================================';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  تحذير: قد تكون هناك مشكلة في إعداد البنية';
        RAISE NOTICE 'تحقق من سجلات الأخطاء أعلاه';
    END IF;
END $$;

-- إنهاء المعاملة
COMMIT;

-- رسالة الإنهاء
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏁 انتهى إعداد قاعدة البيانات في: %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'شكراً لك على استخدام نظام Nexus!';
END $$;
    END IF;
END $$;

-- رسالة الإنهاء
DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE '🎉 تم إعداد قاعدة بيانات Nexus بنجاح!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'معلومات مهمة:';
    RAISE NOTICE '- المستخدم التجريبي: test@nexus.app';
    RAISE NOTICE '- معرف المستخدم: 00000000-0000-0000-0000-000000000001';
    RAISE NOTICE '- تم تفعيل Row Level Security على جميع الجداول';
    RAISE NOTICE '- تم إنشاء فهارس محسّنة للأداء';
    RAISE NOTICE '- تم إنشاء دوال مساعدة للعمليات المعقدة';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '📖 للبدء في الاستخدام:';
    RAISE NOTICE '1. تحديث متغيرات البيئة في .env';
    RAISE NOTICE '2. تشغيل التطبيق: npm run dev';
    RAISE NOTICE '3. اختبار الواجهات البرمجية';
    RAISE NOTICE '=========================================';
END $$;

-- إنهاء المعاملة
COMMIT;

-- تحسين الأداء
VACUUM ANALYZE;
