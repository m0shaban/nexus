-- ========================================
-- 10-create-sample-data.sql
-- إنشاء بيانات تجريبية لاختبار النظام
-- ========================================

-- إنشاء مستخدم تجريبي
INSERT INTO users (
    id,
    email,
    full_name,
    username,
    telegram_user_id,
    telegram_username,
    telegram_first_name,
    preferences,
    settings
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test@nexus.app',
    'مستخدم تجريبي',
    'test_user',
    123456789,
    'test_user',
    'مستخدم',
    '{"theme": "dark", "language": "ar", "notifications": true}',
    '{"auto_analyze": true, "ai_suggestions": true}'
) ON CONFLICT (email) DO NOTHING;

-- إنشاء ملاحظات تجريبية
INSERT INTO notes (
    user_id,
    content,
    content_type,
    title,
    ai_summary,
    ai_questions,
    ai_tags,
    analysis_status,
    category,
    priority,
    is_favorite,
    note_date
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'اليوم تعلمت كيفية إنشاء قواعد البيانات المتقدمة. كان درسًا مفيدًا جداً في تصميم الجداول والعلاقات.',
    'text',
    'تعلم قواعد البيانات',
    'تعلم المستخدم أساسيات تصميم قواعد البيانات والجداول والعلاقات',
    '["ما هي أفضل الممارسات في تصميم قواعد البيانات؟", "كيف يمكن تحسين الأداء؟"]',
    '["تعلم", "قواعد البيانات", "تطوير"]',
    'completed',
    'التعلم',
    'high',
    true,
    CURRENT_DATE
),
(
    '00000000-0000-0000-0000-000000000001',
    'فكرة جديدة لمشروع: تطبيق لإدارة المهام اليومية مع تحليل ذكي للإنتاجية',
    'text',
    'فكرة مشروع جديد',
    'فكرة لتطوير تطبيق إدارة مهام مع ميزات ذكية',
    '["ما هي التقنيات المطلوبة؟", "كم سيستغرق التطوير؟"]',
    '["فكرة", "مشروع", "إنتاجية", "تطبيق"]',
    'completed',
    'الأفكار',
    'medium',
    false,
    CURRENT_DATE - INTERVAL '1 day'
),
(
    '00000000-0000-0000-0000-000000000001',
    'ملاحظة صوتية مهمة حول اجتماع اليوم',
    'voice',
    'ملاحظة صوتية',
    'ملخص الاجتماع والنقاط المهمة',
    '["ما هي الخطوات التالية؟"]',
    '["اجتماع", "مهم", "عمل"]',
    'completed',
    'العمل',
    'high',
    false,
    CURRENT_DATE - INTERVAL '2 days'
);

-- إنشاء مشاريع تجريبية
INSERT INTO projects (
    id,
    user_id,
    name,
    description,
    objectives,
    status,
    priority,
    progress_percentage,
    start_date,
    due_date,
    category,
    tags,
    is_favorite
) VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'تطوير تطبيق Nexus',
    'تطوير تطبيق شامل لإدارة الحياة الشخصية والمهنية',
    'إنشاء منصة متكاملة تساعد المستخدمين على تنظيم حياتهم وتحقيق أهدافهم',
    'active',
    'high',
    75,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '60 days',
    'تطوير البرمجيات',
    '["تطوير", "تطبيق", "إنتاجية"]',
    true
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'تعلم الذكاء الاصطناعي',
    'دراسة وتطبيق تقنيات الذكاء الاصطناعي في المشاريع',
    'فهم عميق لتقنيات AI وتطبيقها عملياً',
    'active',
    'medium',
    45,
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '90 days',
    'التعلم',
    '["تعلم", "ذكاء اصطناعي", "تطوير"]',
    false
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'تحسين اللياقة البدنية',
    'برنامج شامل لتحسين الصحة واللياقة',
    'الوصول لوزن مثالي وصحة جيدة',
    'active',
    'high',
    60,
    CURRENT_DATE - INTERVAL '45 days',
    CURRENT_DATE + INTERVAL '45 days',
    'الصحة',
    '["صحة", "رياضة", "لياقة"]',
    true
);

-- إنشاء مهام تجريبية
INSERT INTO tasks (
    project_id,
    title,
    description,
    status,
    priority,
    progress_percentage,
    due_date,
    order_index,
    tags,
    is_milestone
) VALUES 
-- مهام مشروع Nexus
(
    '10000000-0000-0000-0000-000000000001',
    'إعداد قاعدة البيانات',
    'تصميم وإنشاء جداول قاعدة البيانات الأساسية',
    'completed',
    'high',
    100,
    CURRENT_DATE - INTERVAL '20 days',
    1,
    '["قاعدة بيانات", "إعداد"]',
    true
),
(
    '10000000-0000-0000-0000-000000000001',
    'تطوير واجهة المستخدم',
    'تصميم وتطوير واجهات المستخدم الأساسية',
    'in_progress',
    'high',
    70,
    CURRENT_DATE + INTERVAL '15 days',
    2,
    '["UI", "تصميم"]',
    false
),
(
    '10000000-0000-0000-0000-000000000001',
    'دمج الذكاء الاصطناعي',
    'إضافة ميزات التحليل الذكي',
    'todo',
    'medium',
    0,
    CURRENT_DATE + INTERVAL '30 days',
    3,
    '["AI", "تحليل"]',
    true
),
-- مهام تعلم AI
(
    '10000000-0000-0000-0000-000000000002',
    'دراسة أساسيات Machine Learning',
    'فهم المفاهيم الأساسية للتعلم الآلي',
    'completed',
    'high',
    100,
    CURRENT_DATE - INTERVAL '10 days',
    1,
    '["تعلم", "ML"]',
    true
),
(
    '10000000-0000-0000-0000-000000000002',
    'تطبيق مشروع عملي',
    'بناء مشروع عملي باستخدام تقنيات AI',
    'in_progress',
    'medium',
    30,
    CURRENT_DATE + INTERVAL '20 days',
    2,
    '["مشروع", "تطبيق"]',
    false
),
-- مهام اللياقة
(
    '10000000-0000-0000-0000-000000000003',
    'ممارسة الرياضة يومياً',
    'التمرين لمدة 30 دقيقة يومياً',
    'in_progress',
    'high',
    80,
    CURRENT_DATE + INTERVAL '7 days',
    1,
    '["رياضة", "يومي"]',
    false
),
(
    '10000000-0000-0000-0000-000000000003',
    'تحسين النظام الغذائي',
    'اتباع نظام غذائي صحي ومتوازن',
    'in_progress',
    'medium',
    50,
    CURRENT_DATE + INTERVAL '14 days',
    2,
    '["غذاء", "صحة"]',
    false
);

-- إنشاء سيناريوهات تجريبية
INSERT INTO scenarios (
    user_id,
    project_id,
    title,
    description,
    assumptions,
    ai_best_case,
    ai_worst_case,
    ai_most_likely,
    confidence_score,
    risk_level,
    status,
    category,
    scenario_type
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'إطلاق تطبيق Nexus',
    'تحليل سيناريوهات إطلاق التطبيق في السوق',
    '["المنافسة متوسطة", "الميزانية محدودة", "الفريق صغير"]',
    'التطبيق يحقق نجاحاً كبيراً ويجذب آلاف المستخدمين خلال الشهر الأول',
    'التطبيق يواجه صعوبات تقنية ومنافسة شديدة مما يؤثر على النمو',
    'التطبيق ينمو بشكل تدريجي ويجذب مئات المستخدمين شهرياً',
    0.75,
    'medium',
    'completed',
    'الأعمال',
    'business'
),
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'مسار تعلم الذكاء الاصطناعي',
    'تحليل الخيارات المختلفة لتعلم AI',
    '["وقت محدود", "خبرة برمجية جيدة", "موارد تعليمية متاحة"]',
    'إتقان تقنيات AI واستخدامها في مشاريع ناجحة',
    'صعوبة في فهم المفاهيم المعقدة وتأخير في التعلم',
    'تطوير فهم جيد لـ AI وتطبيقه في مشاريع بسيطة',
    0.80,
    'low',
    'completed',
    'التعلم',
    'general'
);

-- إنشاء سلاسل إنجاز تجريبية
INSERT INTO streaks (
    id,
    user_id,
    project_id,
    name,
    description,
    streak_type,
    category,
    target_frequency,
    current_streak,
    longest_streak,
    total_completions,
    completion_rate,
    target_streak,
    is_active
) VALUES 
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'ممارسة الرياضة اليومية',
    'التمرين لمدة 30 دقيقة يومياً',
    'health',
    'الصحة واللياقة',
    'daily',
    7,
    12,
    25,
    85.5,
    30,
    true
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'البرمجة اليومية',
    'كتابة كود لمدة ساعة يومياً',
    'work',
    'التطوير والبرمجة',
    'daily',
    5,
    15,
    45,
    75.0,
    60,
    true
),
(
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'القراءة الأسبوعية',
    'قراءة كتاب أو مقال مفيد أسبوعياً',
    'learning',
    'التعلم والتطوير',
    'weekly',
    3,
    8,
    18,
    90.0,
    20,
    true
);

-- إنشاء أنشطة السلاسل
INSERT INTO streak_activities (
    streak_id,
    user_id,
    activity_date,
    completed,
    duration_minutes,
    mood_rating,
    energy_level,
    notes
) VALUES 
-- أنشطة الرياضة
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE, true, 45, 8, 7, 'تمرين رائع اليوم'),
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, true, 30, 7, 6, 'تمرين منتظم'),
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, true, 35, 8, 8, 'شعور ممتاز بعد التمرين'),
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, true, 40, 7, 7, 'تمرين شاق ولكن مفيد'),
-- أنشطة البرمجة
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', CURRENT_DATE, true, 75, 8, 8, 'تطوير ميزة جديدة'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, true, 60, 7, 7, 'حل مشاكل في الكود'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, true, 90, 9, 8, 'يوم برمجة منتج جداً');

-- إنشاء إدخالات المرآة
INSERT INTO mirror_entries (
    user_id,
    entry_date,
    content,
    entry_type,
    mood_rating,
    energy_level,
    stress_level,
    achievements,
    challenges_faced,
    gratitude_items,
    tomorrow_priorities,
    analysis_status
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    'يوم رائع ومنتج. تمكنت من إنجاز معظم المهام المخططة وشعرت بالرضا عن التقدم المحرز.',
    'daily_reflection',
    8,
    7,
    3,
    'أكملت إعداد قاعدة البيانات، تمرنت لمدة 45 دقيقة',
    'صعوبة في تصميم بعض الجداول المعقدة',
    '["الصحة الجيدة", "فريق العمل المتعاون", "التقدم في المشروع"]',
    '["مراجعة التصميم", "كتابة الوثائق", "اجتماع الفريق"]',
    'completed'
),
(
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE - 1,
    'يوم متوسط. واجهت بعض التحديات ولكن تمكنت من حلها.',
    'daily_reflection',
    6,
    6,
    5,
    'حل مشكلة تقنية معقدة',
    'ضغط الوقت والمواعيد النهائية',
    '["التعلم من الأخطاء", "دعم الأصدقاء"]',
    '["التركيز على المهام الرئيسية", "أخذ قسط من الراحة"]',
    'completed'
);

-- إنشاء أهداف المرآة
INSERT INTO mirror_goals (
    user_id,
    title,
    description,
    goal_type,
    status,
    priority,
    progress_percentage,
    target_value,
    current_value,
    unit_of_measurement,
    start_date,
    target_date,
    why_important,
    success_criteria
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'تعلم 3 تقنيات جديدة',
    'تعلم وإتقان 3 تقنيات برمجية جديدة هذا العام',
    'learning',
    'active',
    'high',
    67,
    3,
    2,
    'تقنية',
    CURRENT_DATE - INTERVAL '90 days',
    CURRENT_DATE + INTERVAL '180 days',
    'لتطوير مهاراتي وزيادة قيمتي في سوق العمل',
    'إتقان كل تقنية وتطبيقها في مشروع عملي'
),
(
    '00000000-0000-0000-0000-000000000001',
    'خسارة 10 كيلو',
    'الوصول للوزن المثالي وتحسين الصحة',
    'health',
    'active',
    'high',
    40,
    10,
    4,
    'كيلوجرام',
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE + INTERVAL '120 days',
    'للحصول على صحة أفضل وثقة بالنفس',
    'الوصول للوزن المستهدف والحفاظ عليه'
);

-- إنشاء شعارات تجريبية
INSERT INTO logos (
    id,
    user_id,
    name,
    description,
    brand_name,
    file_url,
    file_type,
    logo_type,
    industry,
    primary_colors,
    status,
    visibility,
    quality_score,
    tags,
    creation_method
) VALUES 
(
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'شعار Nexus',
    'الشعار الرسمي لتطبيق Nexus',
    'Nexus',
    '/uploads/logos/nexus-logo.svg',
    'svg',
    'combination',
    'Technology',
    '["#3B82F6", "#1E40AF", "#FFFFFF"]',
    'active',
    'public',
    9.2,
    '["تطبيق", "تقنية", "إنتاجية"]',
    'designed'
),
(
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'شعار شركة تقنية',
    'شعار لشركة تطوير البرمجيات',
    'TechCorp',
    '/uploads/logos/techcorp-logo.png',
    'png',
    'wordmark',
    'Technology',
    '["#10B981", "#064E3B"]',
    'active',
    'private',
    8.5,
    '["شركة", "تقنية", "برمجيات"]',
    'designed'
);

-- إنشاء تنويعات الشعارات
INSERT INTO logo_variations (
    logo_id,
    variation_name,
    variation_type,
    file_url,
    file_type,
    is_primary,
    recommended_usage
) VALUES 
(
    '30000000-0000-0000-0000-000000000001',
    'النسخة الأساسية',
    'color',
    '/uploads/logos/nexus-logo.svg',
    'svg',
    true,
    'الاستخدام العام على الخلفيات البيضاء'
),
(
    '30000000-0000-0000-0000-000000000001',
    'النسخة البيضاء',
    'reversed',
    '/uploads/logos/nexus-logo-white.svg',
    'svg',
    false,
    'الاستخدام على الخلفيات الداكنة'
),
(
    '30000000-0000-0000-0000-000000000001',
    'الأيقونة فقط',
    'icon_only',
    '/uploads/logos/nexus-icon.svg',
    'svg',
    false,
    'استخدام كأيقونة تطبيق أو في المساحات الضيقة'
);

-- تحديث الإحصائيات
UPDATE projects SET 
    total_tasks_count = (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id),
    completed_tasks_count = (SELECT COUNT(*) FROM tasks WHERE project_id = projects.id AND status = 'completed')
WHERE user_id = '00000000-0000-0000-0000-000000000001';

UPDATE projects SET 
    progress_percentage = CASE 
        WHEN total_tasks_count = 0 THEN 0
        ELSE (completed_tasks_count * 100 / total_tasks_count)
    END
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- تحديث عدد الشعارات في التصنيفات
UPDATE logo_categories SET logo_count = (
    SELECT COUNT(*) 
    FROM logos 
    WHERE logos.industry = logo_categories.name 
    AND logos.status = 'active'
);

-- رسالة تأكيد
DO $$
BEGIN
    RAISE NOTICE 'Sample data created successfully! Test user ID: 00000000-0000-0000-0000-000000000001';
    RAISE NOTICE 'You can now test the system with the sample data.';
END $$;
