-- ========================================
-- 09-create-analytics-views.sql
-- إنشاء الواجهات التحليلية والتقارير
-- ========================================

-- حذف الـ views إذا كانت موجودة للسماح بإعادة الإنشاء
DROP VIEW IF EXISTS user_analytics CASCADE;
DROP VIEW IF EXISTS daily_activity_analytics CASCADE;
DROP VIEW IF EXISTS project_analytics CASCADE;
DROP VIEW IF EXISTS mood_analytics CASCADE;
DROP VIEW IF EXISTS streak_analytics CASCADE;
DROP VIEW IF EXISTS logo_analytics CASCADE;

-- حذف الدوال إذا كانت موجودة للسماح بإعادة الإنشاء
DROP FUNCTION IF EXISTS calculate_completion_rate(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_dashboard_summary(UUID) CASCADE;


-- دالة مساعدة لحساب نسبة الإنجاز
CREATE OR REPLACE FUNCTION calculate_completion_rate(
    completed_count INTEGER,
    total_count INTEGER
)
RETURNS DECIMAL AS $$
BEGIN
    IF total_count IS NULL OR total_count = 0 THEN
        RETURN 0.00;
    ELSE
        RETURN ROUND((completed_count::DECIMAL / total_count::DECIMAL) * 100, 2);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- إنشاء view لإحصائيات المستخدمين
CREATE OR REPLACE VIEW user_analytics AS
SELECT
    u.id,
    u.full_name,
    u.email,
    u.created_at as user_since,
    u.last_login_at, -- تم التصحيح: u.last_login_at بدلاً من u.last_login

    -- إحصائيات الملاحظات
    COUNT(DISTINCT n.id) as total_notes,
    COUNT(DISTINCT n.id) FILTER (WHERE n.created_at >= CURRENT_DATE - INTERVAL '30 days') as notes_this_month,
    COUNT(DISTINCT n.id) FILTER (WHERE n.analysis_status = 'completed') as analyzed_notes,

    -- إحصائيات المشاريع
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_projects, -- يفترض أن 'active' قيمة صحيحة في project_status
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_projects,
    AVG(p.progress_percentage) FILTER (WHERE p.status IN ('active', 'on_hold')) as avg_project_progress,

    -- إحصائيات المهام
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    calculate_completion_rate(
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::INTEGER,
        COUNT(DISTINCT t.id)::INTEGER
    ) as task_completion_rate,

    -- إحصائيات السيناريوهات
    COUNT(DISTINCT s.id) as total_scenarios,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as analyzed_scenarios,
    AVG(s.confidence_score) as avg_scenario_confidence,

    -- إحصائيات السلاسل
    COUNT(DISTINCT st.id) as total_streaks,
    COUNT(DISTINCT st.id) FILTER (WHERE st.status = 'active') as active_streaks, -- تم التصحيح لاستخدام عمود الحالة
    AVG(st.current_streak) FILTER (WHERE st.status = 'active') as avg_current_streak, -- تم التصحيح لاستخدام عمود الحالة
    MAX(st.longest_streak) as max_streak_achieved,

    -- إحصائيات المرآة
    COUNT(DISTINCT me.id) as total_mirror_entries,
    COUNT(DISTINCT me.id) FILTER (WHERE me.entry_date >= CURRENT_DATE - INTERVAL '30 days') as recent_reflections,
    AVG(me.mood_rating) FILTER (WHERE me.mood_rating IS NOT NULL AND me.entry_date >= CURRENT_DATE - INTERVAL '30 days') as avg_recent_mood,

    -- إحصائيات الشعارات (يفترض وجود جدول 'logos' والأعمدة ذات الصلة)
    COUNT(DISTINCT l.id) as total_logos,
    COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'active') as active_logos,
    AVG(l.quality_score) FILTER (WHERE l.quality_score IS NOT NULL) as avg_logo_quality

FROM users u
LEFT JOIN notes n ON u.id = n.user_id
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN tasks t ON p.id = t.project_id -- يفترض ربط المهام بالمشاريع المملوكة للمستخدم
LEFT JOIN scenarios s ON u.id = s.user_id
LEFT JOIN streaks st ON u.id = st.user_id
LEFT JOIN mirror_entries me ON u.id = me.user_id
LEFT JOIN logos l ON u.id = l.user_id
WHERE u.is_active = true
GROUP BY u.id, u.full_name, u.email, u.created_at, u.last_login_at;


-- إنشاء view لتحليل الأداء اليومي
CREATE OR REPLACE VIEW daily_activity_analytics AS
SELECT
    daily_users.activity_date, -- تم التصحيح: تحديد المصدر لتجنب الغموض
    COUNT(DISTINCT daily_users.user_id) as active_users, -- تم التصحيح: تحديد المصدر لتجنب الغموض

    -- أنشطة الملاحظات
    COUNT(DISTINCT n.id) as notes_created,
    COUNT(DISTINCT n.id) FILTER (WHERE n.content_type = 'voice') as voice_notes,
    COUNT(DISTINCT n.id) FILTER (WHERE n.telegram_message_id IS NOT NULL) as telegram_notes,

    -- أنشطة المشاريع والمهام
    COUNT(DISTINCT p.id) as projects_created,
    COUNT(DISTINCT t.id) as tasks_created,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as tasks_completed,

    -- أنشطة السيناريوهات
    COUNT(DISTINCT s.id) as scenarios_created,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as scenarios_analyzed,

    -- أنشطة السلاسل
    COUNT(DISTINCT sa.id) as streak_activities,
    COUNT(DISTINCT sa.id) FILTER (WHERE sa.status = 'completed') as successful_streak_activities, -- تم التصحيح لاستخدام عمود الحالة
    AVG(sa.mood_after) FILTER (WHERE sa.mood_after IS NOT NULL) as avg_streak_mood, -- تم التصحيح: استخدام mood_after

    -- أنشطة المرآة
    COUNT(DISTINCT me.id) as mirror_entries,
    AVG(me.mood_rating) FILTER (WHERE me.mood_rating IS NOT NULL) as avg_daily_mood,
    AVG(me.energy_level) FILTER (WHERE me.energy_level IS NOT NULL) as avg_energy_level,

    -- أنشطة الشعارات (يفترض وجود جدول 'logos')
    COUNT(DISTINCT l.id) as logos_created

FROM (
    -- جمع تواريخ الأنشطة المميزة ومعرفات المستخدمين من الوحدات المختلفة
    SELECT DISTINCT DATE(created_at) as activity_date, user_id FROM notes WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
    UNION ALL
    SELECT DISTINCT DATE(created_at) as activity_date, user_id FROM projects WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
    UNION ALL
    SELECT DISTINCT DATE(created_at) as activity_date, user_id FROM scenarios WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
    UNION ALL
    SELECT DISTINCT activity_date, user_id FROM streak_activities WHERE activity_date >= CURRENT_DATE - INTERVAL '90 days'
    UNION ALL
    SELECT DISTINCT entry_date as activity_date, user_id FROM mirror_entries WHERE entry_date >= CURRENT_DATE - INTERVAL '90 days'
    UNION ALL
    SELECT DISTINCT DATE(created_at) as activity_date, user_id FROM logos WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
) daily_users
LEFT JOIN notes n ON DATE(n.created_at) = daily_users.activity_date AND n.user_id = daily_users.user_id
LEFT JOIN projects p ON DATE(p.created_at) = daily_users.activity_date AND p.user_id = daily_users.user_id
LEFT JOIN tasks t ON DATE(t.created_at) = daily_users.activity_date AND t.project_id IN (SELECT id FROM projects WHERE user_id = daily_users.user_id)
LEFT JOIN scenarios s ON DATE(s.created_at) = daily_users.activity_date AND s.user_id = daily_users.user_id
LEFT JOIN streak_activities sa ON sa.activity_date = daily_users.activity_date AND sa.user_id = daily_users.user_id
LEFT JOIN mirror_entries me ON me.entry_date = daily_users.activity_date AND me.user_id = daily_users.user_id
LEFT JOIN logos l ON DATE(l.created_at) = daily_users.activity_date AND l.user_id = daily_users.user_id
GROUP BY daily_users.activity_date -- تم التصحيح: تحديد المصدر لتجنب الغموض
ORDER BY daily_users.activity_date DESC; -- تم التصحيح: تحديد المصدر لتجنب الغموض

-- إنشاء view لتحليل المشاريع
CREATE OR REPLACE VIEW project_analytics AS
SELECT
    p.id,
    p.name,
    p.status,
    p.priority,
    p.progress_percentage,
    p.created_at,
    p.due_date,

    -- إحصائيات المهام
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'todo') as pending_tasks,

    -- تحليل التوقيتات
    CASE
        WHEN p.due_date IS NULL THEN NULL
        WHEN p.due_date < CURRENT_DATE AND p.status != 'completed' THEN 'overdue'
        WHEN p.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END as timeline_status,

    -- معدل الإنجاز اليومي (تقديري)
    CASE
        WHEN p.created_at = CURRENT_DATE THEN NULL
        WHEN p.progress_percentage IS NULL OR p.progress_percentage = 0 THEN 0.00 -- معالجة حالات التقدم صفر أو فارغ
        ELSE p.progress_percentage::DECIMAL / GREATEST((CURRENT_DATE - DATE(p.created_at))::INTEGER, 1)::DECIMAL -- **تم التصحيح هنا**
    END as daily_progress_rate,

    -- تقدير الإكمال
    CASE
        WHEN p.progress_percentage >= 90 THEN 'nearly_complete'
        WHEN p.progress_percentage >= 50 THEN 'good_progress'
        WHEN p.progress_percentage >= 25 THEN 'some_progress'
        ELSE 'just_started'
    END as progress_level,

    -- إحصائيات الوقت
    AVG(t.estimated_hours) as avg_estimated_hours,
    SUM(t.actual_hours) as total_actual_hours,

    -- معلومات المستخدم
    u.full_name as owner_name

FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN users u ON p.user_id = u.id
WHERE p.status != 'archived'
GROUP BY p.id, p.name, p.status, p.priority, p.progress_percentage,
         p.created_at, p.due_date, u.full_name;


-- إنشاء view لتحليل الحالة المزاجية
CREATE OR REPLACE VIEW mood_analytics AS
SELECT
    user_id,
    entry_date,
    mood_rating,
    energy_level,
    stress_level,

    -- حساب المتوسطات المتحركة
    AVG(mood_rating) OVER (
        PARTITION BY user_id
        ORDER BY entry_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as mood_7day_avg,

    AVG(energy_level) OVER (
        PARTITION BY user_id
        ORDER BY entry_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as energy_7day_avg,

    -- تحديد الاتجاه
    mood_rating - LAG(mood_rating, 1) OVER (
        PARTITION BY user_id
        ORDER BY entry_date
    ) as mood_change,

    -- تصنيف الحالة
    CASE
        WHEN mood_rating >= 8 THEN 'excellent'
        WHEN mood_rating >= 6 THEN 'good'
        WHEN mood_rating >= 4 THEN 'neutral'
        WHEN mood_rating >= 2 THEN 'low'
        ELSE 'very_low'
    END as mood_category,

    -- حساب عدد الأيام الإيجابية
    COUNT(*) FILTER (WHERE mood_rating >= 6) OVER (
        PARTITION BY user_id
        ORDER BY entry_date
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) as positive_days_last_30,

    -- معلومات السياق
    primary_emotion,
    jsonb_array_length(gratitude_items) as gratitude_count

FROM mirror_entries
WHERE mood_rating IS NOT NULL
ORDER BY user_id, entry_date DESC;


-- إنشاء view لتحليل السلاسل
CREATE OR REPLACE VIEW streak_analytics AS
SELECT
    s.id,
    s.name,
    s.streak_type,
    s.current_streak,
    s.longest_streak,
    s.completion_rate,

    -- إحصائيات الأداء
    COUNT(sa.id) as total_activities,
    COUNT(sa.id) FILTER (WHERE sa.status = 'completed') as successful_activities,
    COUNT(sa.id) FILTER (WHERE sa.activity_date >= CURRENT_DATE - INTERVAL '7 days') as activities_this_week,
    COUNT(sa.id) FILTER (WHERE sa.status = 'completed' AND sa.activity_date >= CURRENT_DATE - INTERVAL '7 days') as successful_this_week,

    -- تحليل الاتجاه
    calculate_completion_rate(
        COUNT(sa.id) FILTER (WHERE sa.status = 'completed' AND sa.activity_date >= CURRENT_DATE - INTERVAL '7 days')::INTEGER,
        COUNT(sa.id) FILTER (WHERE sa.activity_date >= CURRENT_DATE - INTERVAL '7 days')::INTEGER
    ) as weekly_success_rate,

    -- تحليل المزاج والطاقة
    AVG(sa.mood_after) FILTER (WHERE sa.mood_after IS NOT NULL) as avg_mood, -- تم التصحيح: استخدام mood_after
    AVG(sa.energy_level) FILTER (WHERE sa.energy_level IS NOT NULL) as avg_energy,
    AVG(sa.duration_minutes) FILTER (WHERE sa.duration_minutes IS NOT NULL) as avg_duration,

    -- حالة الإنجاز
    CASE
        WHEN s.current_streak >= s.target_streak AND s.target_streak IS NOT NULL THEN 'target_achieved'
        WHEN s.current_streak >= 7 THEN 'strong_streak'
        WHEN s.current_streak >= 3 THEN 'building_momentum'
        WHEN s.current_streak >= 1 THEN 'getting_started'
        ELSE 'broken_streak'
    END as streak_status,

    -- آخر نشاط
    MAX(sa.activity_date) as last_activity_date,
    CURRENT_DATE - MAX(sa.activity_date) as days_since_last_activity,

    -- معلومات المستخدم
    u.full_name as user_name

FROM streaks s
LEFT JOIN streak_activities sa ON s.id = sa.streak_id
LEFT JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.streak_type, s.current_streak, s.longest_streak,
         s.completion_rate, s.target_streak, u.full_name;


-- إنشاء view لتحليل الشعارات
CREATE OR REPLACE VIEW logo_analytics AS
SELECT
    l.id,
    l.name,
    l.brand_name,
    l.logo_type,
    l.industry,
    l.quality_score,
    l.view_count,
    l.download_count,
    l.like_count,

    -- تحليل الأداء
    CASE
        WHEN l.view_count >= 100 THEN 'highly_viewed'
        WHEN l.view_count >= 50 THEN 'well_viewed'
        WHEN l.view_count >= 10 THEN 'moderately_viewed'
        ELSE 'low_views'
    END as popularity_level,

    -- نسبة التحويل (تحميل/مشاهدة)
    CASE
        WHEN l.view_count > 0 THEN (l.download_count * 100.0 / l.view_count)
        ELSE 0
    END as conversion_rate,

    -- تحليل الجودة
    CASE
        WHEN l.quality_score >= 8 THEN 'excellent'
        WHEN l.quality_score >= 6 THEN 'good'
        WHEN l.quality_score >= 4 THEN 'average'
        ELSE 'needs_improvement'
    END as quality_category,

    -- معلومات التنويعات
    COUNT(lv.id) as variation_count,

    -- معلومات المستخدم
    u.full_name as creator_name,

    -- حساب النقاط الإجمالية
    (l.quality_score * 0.4 +
     LEAST(l.view_count * 0.01, 10) +
     LEAST(l.download_count * 0.1, 20) +
     LEAST(l.like_count * 0.2, 30)) as overall_score

FROM logos l
LEFT JOIN logo_variations lv ON l.id = lv.logo_id AND lv.is_active = true
LEFT JOIN users u ON l.user_id = u.id
WHERE l.status = 'active'
GROUP BY l.id, l.name, l.brand_name, l.logo_type, l.industry,
         l.quality_score, l.view_count, l.download_count, l.like_count, u.full_name;


-- إنشاء دالة للحصول على ملخص شامل للمستخدم
CREATE OR REPLACE FUNCTION get_user_dashboard_summary(p_user_id UUID)
RETURNS TABLE (
    -- إحصائيات عامة
    total_notes INTEGER,
    active_projects INTEGER,
    current_streaks INTEGER,
    mirror_entries_this_month INTEGER,

    -- النشاط الأخير
    last_note_date DATE,
    last_project_update DATE,
    last_streak_activity DATE,
    last_mirror_entry DATE,

    -- تحليل المزاج
    avg_mood_this_month DECIMAL,
    mood_trend TEXT,

    -- إنجازات
    tasks_completed_this_week INTEGER,
    goals_achieved_this_month INTEGER,
    longest_active_streak INTEGER,

    -- تقييم الأداء
    overall_productivity_score DECIMAL,
    consistency_score DECIMAL,
    engagement_level TEXT
) AS $$
DECLARE
    recent_mood DECIMAL;
    older_mood DECIMAL;
BEGIN
    -- حساب متوسط المزاج للمقارنة
    SELECT AVG(mood_rating) INTO recent_mood
    FROM mirror_entries
    WHERE user_id = p_user_id
    AND entry_date >= CURRENT_DATE - INTERVAL '15 days'
    AND mood_rating IS NOT NULL;

    SELECT AVG(mood_rating) INTO older_mood
    FROM mirror_entries
    WHERE user_id = p_user_id
    AND entry_date >= CURRENT_DATE - INTERVAL '30 days'
    AND entry_date < CURRENT_DATE - INTERVAL '15 days'
    AND mood_rating IS NOT NULL;

    RETURN QUERY
    SELECT
        -- إحصائيات عامة
        COUNT(DISTINCT n.id)::INTEGER as total_notes,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active')::INTEGER as active_projects,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active')::INTEGER as current_streaks, -- تم التصحيح لاستخدام عمود الحالة
        COUNT(DISTINCT me.id) FILTER (WHERE me.entry_date >= DATE_TRUNC('month', CURRENT_DATE))::INTEGER as mirror_entries_this_month,

        -- النشاط الأخير
        MAX(DATE(n.created_at)) as last_note_date,
        MAX(DATE(p.updated_at)) as last_project_update,
        MAX(sa.activity_date) as last_streak_activity,
        MAX(me.entry_date) as last_mirror_entry,

        -- تحليل المزاج
        AVG(me.mood_rating) FILTER (WHERE me.entry_date >= DATE_TRUNC('month', CURRENT_DATE) AND me.mood_rating IS NOT NULL)::DECIMAL as avg_mood_this_month,
        CASE
            WHEN recent_mood > COALESCE(older_mood, recent_mood) THEN 'improving'
            WHEN recent_mood < COALESCE(older_mood, recent_mood) THEN 'declining'
            ELSE 'stable'
        END::TEXT as mood_trend,

        -- إنجازات
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed' AND t.completed_at >= CURRENT_DATE - INTERVAL '7 days')::INTEGER as tasks_completed_this_week,
        COUNT(DISTINCT mg.id) FILTER (WHERE mg.status = 'completed' AND mg.completed_at >= DATE_TRUNC('month', CURRENT_DATE))::INTEGER as goals_achieved_this_month,
        MAX(s.current_streak)::INTEGER as longest_active_streak,

        -- تقييم الأداء (مبسط)
        LEAST(10, (
            COALESCE(AVG(p.progress_percentage), 0) * 0.3 +
            COALESCE(AVG(s.completion_rate), 0) * 0.3 +
            COALESCE(recent_mood * 10, 50) * 0.4 -- Scale mood (1-10) to a 0-100 scale for weighting
        ) / 10)::DECIMAL as overall_productivity_score, -- Scale down to 0-10

        LEAST(10, (
            COUNT(DISTINCT DATE(n.created_at)) FILTER (WHERE n.created_at >= CURRENT_DATE - INTERVAL '30 days') * 0.5 +
            COUNT(DISTINCT sa.activity_date) FILTER (WHERE sa.activity_date >= CURRENT_DATE - INTERVAL '30 days') * 0.3 +
            COUNT(DISTINCT me.entry_date) FILTER (WHERE me.entry_date >= CURRENT_DATE - INTERVAL '30 days') * 0.2
        ))::DECIMAL as consistency_score,

        CASE
            WHEN COUNT(DISTINCT GREATEST(
                DATE(n.created_at),
                sa.activity_date,
                me.entry_date
            )) FILTER (WHERE GREATEST(
                DATE(n.created_at),
                sa.activity_date,
                me.entry_date
            ) >= CURRENT_DATE - INTERVAL '7 days') >= 5 THEN 'high'
            WHEN COUNT(DISTINCT GREATEST(
                DATE(n.created_at),
                sa.activity_date,
                me.entry_date
            ) >= CURRENT_DATE - INTERVAL '7 days') >= 2 THEN 'medium'
            ELSE 'low'
        END::TEXT as engagement_level

    FROM users u
    LEFT JOIN notes n ON u.id = n.user_id
    LEFT JOIN projects p ON u.id = p.user_id
    LEFT JOIN tasks t ON p.id = t.project_id
    LEFT JOIN streaks s ON u.id = s.user_id -- Alias 's' is used for streaks here
    LEFT JOIN streak_activities sa ON s.id = sa.streak_id
    LEFT JOIN mirror_entries me ON u.id = me.user_id
    LEFT JOIN mirror_goals mg ON u.id = mg.user_id
    WHERE u.id = p_user_id
    GROUP BY u.id; -- Group by user ID since it's a single user summary
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- رسالة تأكيد
SELECT 'Analytics views and dashboard functions created successfully! ✅' as status;