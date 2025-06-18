-- ========================================
-- 06-create-streaks.sql
-- نظام تتبع الإنجازات والعادات والسلاسل المتقدم
-- Advanced Streaks and Habits Tracking System
-- ========================================

-- \echo '🔥 إنشاء جداول السلاسل والعادات...'

-- Drop tables if they exist (in correct order to respect dependencies)
DROP TABLE IF EXISTS streak_rewards CASCADE;
DROP TABLE IF EXISTS streak_milestones CASCADE;
DROP TABLE IF EXISTS streak_activities CASCADE;
DROP TABLE IF EXISTS streak_reminders CASCADE;
DROP TABLE IF EXISTS streaks CASCADE;

-- Drop existing types if they exist (safe for re-running the script, especially in development)
DROP TYPE IF EXISTS streak_type CASCADE;
DROP TYPE IF EXISTS frequency_type CASCADE;
DROP TYPE IF EXISTS activity_status CASCADE;
DROP TYPE IF EXISTS reminder_type CASCADE;
DROP TYPE IF EXISTS milestone_type CASCADE;
DROP TYPE IF EXISTS milestone_status CASCADE;
DROP TYPE IF EXISTS rarity_level CASCADE;
DROP TYPE IF EXISTS reward_type CASCADE;
DROP TYPE IF EXISTS trigger_condition CASCADE;
DROP TYPE IF EXISTS reward_status CASCADE;
DROP TYPE IF EXISTS streak_status CASCADE;

-- Assuming `complexity_level` and `priority_level` are defined in a previous script.
-- If not, uncomment and add their definitions here:
-- DROP TYPE IF EXISTS complexity_level CASCADE;
-- CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high', 'very_high');
-- DROP TYPE IF EXISTS priority_level CASCADE;
-- CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');


-- Ensure uuid-ossp extension is enabled for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Types (ENUMs) specific to this script
CREATE TYPE streak_type AS ENUM ('habit', 'goal', 'challenge');
CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'custom', 'once');
CREATE TYPE activity_status AS ENUM ('completed', 'skipped', 'missed', 'partially_completed');
CREATE TYPE reminder_type AS ENUM ('daily', 'weekly', 'custom_days', 'one_time');
CREATE TYPE milestone_type AS ENUM ('streak_count', 'total_completions', 'points_earned', 'duration');
CREATE TYPE milestone_status AS ENUM ('pending', 'achieved', 'missed');
CREATE TYPE rarity_level AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE reward_type AS ENUM ('points', 'badge', 'voucher', 'custom');
CREATE TYPE trigger_condition AS ENUM ('streak_milestone', 'total_points_reached', 'manual');
CREATE TYPE reward_status AS ENUM ('available', 'claimed', 'expired', 'redeemed');
CREATE TYPE streak_status AS ENUM ('active', 'paused', 'completed', 'archived', 'broken'); -- Added 'broken' for clarity

-- Function to update 'updated_at' columns automatically (Assuming this is defined globally in your overall schema)
-- If not defined globally, uncomment and include it here:
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

-- ========================================
-- 1. جدول السلاسل الرئيسي
-- ========================================
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    note_id UUID REFERENCES notes(id) ON DELETE SET NULL,

    -- المعلومات الأساسية
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_description TEXT,
    streak_key VARCHAR(20) UNIQUE, -- STRK-001

    -- نوع السلسلة والفئة
    streak_type streak_type DEFAULT 'habit',
    category VARCHAR(100),
    difficulty_level complexity_level DEFAULT 'medium', -- Assuming complexity_level is defined

    -- إعدادات السلسلة والتكرار
    target_frequency frequency_type DEFAULT 'daily',
    custom_frequency_days INTEGER CHECK (custom_frequency_days > 0), -- e.g., 2 for every other day
    minimum_duration_minutes INTEGER DEFAULT 1 CHECK (minimum_duration_minutes > 0),
    maximum_duration_minutes INTEGER CHECK (maximum_duration_minutes IS NULL OR maximum_duration_minutes >= minimum_duration_minutes),
    flexible_timing BOOLEAN DEFAULT true,

    -- أوقات التذكير
    reminder_time TIME,
    reminder_days JSONB DEFAULT '[]', -- ['monday', 'tuesday', ...]
    reminder_enabled BOOLEAN DEFAULT true,

    -- الإحصائيات الحالية
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    total_completions INTEGER DEFAULT 0 CHECK (total_completions >= 0),
    total_days_tracked INTEGER DEFAULT 0 CHECK (total_days_tracked >= 0),
    total_time_spent_minutes INTEGER DEFAULT 0 CHECK (total_time_spent_minutes >= 0),

    -- إحصائيات متقدمة
    perfect_weeks INTEGER DEFAULT 0,
    perfect_months INTEGER DEFAULT 0,
    recovery_count INTEGER DEFAULT 0, -- عدد مرات استرداد السلسلة بعد انقطاعها
    best_recovery_streak INTEGER DEFAULT 0,

    -- التواريخ المهمة
    last_activity_date DATE,
    last_completion_date DATE,
    last_missed_date DATE,
    streak_start_date DATE,
    longest_streak_start_date DATE,
    longest_streak_end_date DATE,
    next_due_date DATE,

    -- نسب النجاح والأداء
    completion_rate DECIMAL(6,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    current_week_rate DECIMAL(6,2) DEFAULT 0.00 CHECK (current_week_rate >= 0 AND current_week_rate <= 100),
    current_month_rate DECIMAL(6,2) DEFAULT 0.00 CHECK (current_month_rate >= 0 AND current_month_rate <= 100),
    last_30_days_rate DECIMAL(6,2) DEFAULT 0.00 CHECK (last_30_days_rate >= 0 AND last_30_days_rate <= 100),

    -- الأهداف والمحفزات
    target_streak INTEGER CHECK (target_streak > 0),
    target_completion_date DATE,
    reward_description TEXT,
    motivation_message TEXT,

    -- نظام النقاط والمكافآت
    points_per_completion INTEGER DEFAULT 10 CHECK (points_per_completion >= 0),
    bonus_points_threshold INTEGER DEFAULT 7, -- نقاط إضافية كل X أيام
    bonus_points_amount INTEGER DEFAULT 50 CHECK (bonus_points_amount >= 0),
    total_points_earned INTEGER DEFAULT 0 CHECK (total_points_earned >= 0),

    -- الحالة والخصائص
    status streak_status DEFAULT 'active',
    priority priority_level DEFAULT 'medium', -- Assuming priority_level is defined
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,

    -- التحديات والصعوبات
    challenge_mode BOOLEAN DEFAULT false,
    challenge_description TEXT,
    challenge_multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (challenge_multiplier >= 0.1),

    -- الميتاداتا والعلامات
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',

    -- إعدادات التنبيهات
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',

    -- التواريخ النظام
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- التحقق من البيانات
    CONSTRAINT valid_target_date CHECK (target_completion_date IS NULL OR target_completion_date > CURRENT_DATE),
    CONSTRAINT valid_custom_frequency CHECK (
        (target_frequency != 'custom' AND custom_frequency_days IS NULL) OR
        (target_frequency = 'custom' AND custom_frequency_days IS NOT NULL)
    ),
    CONSTRAINT valid_streaks CHECK (current_streak <= longest_streak),
    CONSTRAINT valid_completion_counts CHECK (total_completions >= current_streak)
);

-- ========================================
-- 2. جدول أنشطة السلسلة
-- ========================================
CREATE TABLE streak_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streak_id UUID REFERENCES streaks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- تفاصيل النشاط
    activity_date DATE NOT NULL,
    completion_time TIME,
    duration_minutes INTEGER CHECK (duration_minutes > 0),

    -- حالة الإنجاز
    status activity_status DEFAULT 'completed',
    completion_percentage INTEGER DEFAULT 100 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    -- تفاصيل الأداء
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),

    -- ملاحظات وتفاصيل
    notes TEXT,
    location VARCHAR(255),
    weather_condition VARCHAR(50),

    -- المكافآت والنقاط
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
    bonus_points INTEGER DEFAULT 0 CHECK (bonus_points >= 0),
    achievement_unlocked VARCHAR(255),

    -- تأثير السلسلة
    streak_count_at_time INTEGER DEFAULT 0, -- السلسلة وقت هذا النشاط
    is_streak_breaker BOOLEAN DEFAULT false,
    is_recovery_day BOOLEAN DEFAULT false, -- يوم استرداد بعد انقطاع

    -- البيانات الإضافية
    external_data JSONB DEFAULT '{}', -- بيانات من تطبيقات خارجية
    device_used VARCHAR(100),

    -- العلامات والفئات
    tags JSONB DEFAULT '[]',
    category VARCHAR(100),

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- فريد لكل تاريخ وسلسلة
    UNIQUE(streak_id, activity_date)
);

-- ========================================
-- 3. جدول تذكيرات السلسلة
-- ========================================
CREATE TABLE streak_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streak_id UUID REFERENCES streaks(id) ON DELETE CASCADE,

    -- إعدادات التذكير
    reminder_type reminder_type DEFAULT 'daily',
    reminder_time TIME NOT NULL,
    reminder_days JSONB DEFAULT '[]', -- أيام الأسبوع

    -- المحتوى
    title VARCHAR(255) NOT NULL,
    message TEXT,
    custom_message TEXT,

    -- الحالة والإعدادات
    is_active BOOLEAN DEFAULT true,
    notification_method JSONB DEFAULT '["push"]', -- ['push', 'email', 'sms']

    -- إعدادات متقدمة
    advance_notice_minutes INTEGER DEFAULT 0 CHECK (advance_notice_minutes >= 0),
    repeat_interval_minutes INTEGER DEFAULT 0 CHECK (repeat_interval_minutes >= 0),
    max_repeats INTEGER DEFAULT 1 CHECK (max_repeats >= 1),

    -- الشروط
    condition_rules JSONB DEFAULT '{}',
    weather_dependent BOOLEAN DEFAULT false,

    -- إحصائيات
    sent_count INTEGER DEFAULT 0,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2) DEFAULT 0.00,

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. جدول معالم السلسلة
-- ========================================
CREATE TABLE streak_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streak_id UUID REFERENCES streaks(id) ON DELETE CASCADE,

    -- تفاصيل المعلم
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL CHECK (target_value > 0),
    milestone_type milestone_type DEFAULT 'streak_count',

    -- المكافآت
    reward_points INTEGER DEFAULT 0 CHECK (reward_points >= 0),
    reward_description TEXT,
    badge_name VARCHAR(255),
    badge_icon VARCHAR(255),

    -- الحالة
    status milestone_status DEFAULT 'pending',
    achieved_at TIMESTAMP WITH TIME ZONE,
    achieved_value INTEGER,

    -- الخصائص
    is_repeatable BOOLEAN DEFAULT false,
    difficulty_level complexity_level DEFAULT 'medium', -- Assuming complexity_level is defined
    rarity_level rarity_level DEFAULT 'common',

    -- ترتيب العرض
    order_index INTEGER DEFAULT 0,

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 5. جدول مكافآت السلسلة
-- ========================================
CREATE TABLE streak_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streak_id UUID REFERENCES streaks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- تفاصيل المكافأة
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward_type reward_type DEFAULT 'points',

    -- القيمة والمبلغ
    value_amount DECIMAL(10,2) CHECK (value_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    points_amount INTEGER DEFAULT 0 CHECK (points_amount >= 0),

    -- شروط الحصول
    trigger_condition trigger_condition DEFAULT 'streak_milestone',
    required_streak_count INTEGER,
    required_points INTEGER,

    -- الحالة
    status reward_status DEFAULT 'available',
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- تفاصيل إضافية
    redemption_code VARCHAR(100),
    redemption_instructions TEXT,

    -- الأولوية والترتيب
    priority priority_level DEFAULT 'medium', -- Assuming priority_level is defined
    order_index INTEGER DEFAULT 0,

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 6. الفهارس والفهارس المتقدمة
-- ========================================
-- \echo '📇 إنشاء الفهارس للسلاسل والعادات...'

-- Indexes for Streaks
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_streaks_project_id ON streaks(project_id);
CREATE INDEX idx_streaks_note_id ON streaks(note_id);
CREATE INDEX idx_streaks_status ON streaks(status);
CREATE INDEX idx_streaks_type ON streaks(streak_type);
CREATE INDEX idx_streaks_category ON streaks(category);
CREATE INDEX idx_streaks_priority ON streaks(priority);
CREATE INDEX idx_streaks_frequency ON streaks(target_frequency);
CREATE INDEX idx_streaks_current_streak ON streaks(current_streak DESC);
CREATE INDEX idx_streaks_longest_streak ON streaks(longest_streak DESC);
CREATE INDEX idx_streaks_completion_rate ON streaks(completion_rate DESC);
CREATE INDEX idx_streaks_last_activity ON streaks(last_activity_date DESC);
CREATE INDEX idx_streaks_next_due ON streaks(next_due_date);
CREATE INDEX idx_streaks_created_at ON streaks(created_at DESC);
CREATE INDEX idx_streaks_updated_at ON streaks(updated_at DESC);
CREATE INDEX idx_streaks_is_archived ON streaks(is_archived) WHERE is_archived = false;
CREATE INDEX idx_streaks_challenge_mode ON streaks(challenge_mode) WHERE challenge_mode = true;
CREATE INDEX idx_streaks_tags ON streaks USING gin(tags);
CREATE INDEX idx_streaks_metadata ON streaks USING gin(metadata);

-- Indexes for Activities
CREATE INDEX idx_streak_activities_streak_id ON streak_activities(streak_id);
CREATE INDEX idx_streak_activities_user_id ON streak_activities(user_id);
CREATE INDEX idx_streak_activities_date ON streak_activities(activity_date DESC);
CREATE INDEX idx_streak_activities_status ON streak_activities(status);
CREATE INDEX idx_streak_activities_completion ON streak_activities(completion_percentage);
CREATE INDEX idx_streak_activities_quality ON streak_activities(quality_rating);
CREATE INDEX idx_streak_activities_duration ON streak_activities(duration_minutes);
CREATE INDEX idx_streak_activities_points ON streak_activities(points_earned DESC);
CREATE INDEX idx_streak_activities_streak_count ON streak_activities(streak_count_at_time);
CREATE INDEX idx_streak_activities_is_breaker ON streak_activities(is_streak_breaker) WHERE is_streak_breaker = true;
CREATE INDEX idx_streak_activities_is_recovery ON streak_activities(is_recovery_day) WHERE is_recovery_day = true;
CREATE INDEX idx_streak_activities_tags ON streak_activities USING gin(tags);

-- Indexes for Reminders
CREATE INDEX idx_streak_reminders_streak_id ON streak_reminders(streak_id);
CREATE INDEX idx_streak_reminders_type ON streak_reminders(reminder_type);
CREATE INDEX idx_streak_reminders_time ON streak_reminders(reminder_time);
CREATE INDEX idx_streak_reminders_active ON streak_reminders(is_active) WHERE is_active = true;
CREATE INDEX idx_streak_reminders_last_sent ON streak_reminders(last_sent_at DESC);

-- Indexes for Milestones
CREATE INDEX idx_streak_milestones_streak_id ON streak_milestones(streak_id);
CREATE INDEX idx_streak_milestones_type ON streak_milestones(milestone_type);
CREATE INDEX idx_streak_milestones_status ON streak_milestones(status);
CREATE INDEX idx_streak_milestones_target ON streak_milestones(target_value);
CREATE INDEX idx_streak_milestones_achieved ON streak_milestones(achieved_at DESC);
CREATE INDEX idx_streak_milestones_order ON streak_milestones(order_index);

-- Indexes for Rewards
CREATE INDEX idx_streak_rewards_streak_id ON streak_rewards(streak_id);
CREATE INDEX idx_streak_rewards_user_id ON streak_rewards(user_id);
CREATE INDEX idx_streak_rewards_type ON streak_rewards(reward_type);
CREATE INDEX idx_streak_rewards_status ON streak_rewards(status);
CREATE INDEX idx_streak_rewards_trigger ON streak_rewards(trigger_condition);
CREATE INDEX idx_streak_rewards_claimed ON streak_rewards(claimed_at DESC);
CREATE INDEX idx_streak_rewards_expires ON streak_rewards(expires_at);

-- Text search indexes
CREATE INDEX idx_streaks_search ON streaks USING gin(to_tsvector('arabic', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_streak_activities_search ON streak_activities USING gin(to_tsvector('arabic', COALESCE(notes, '')));

-- ========================================
-- 7. الدوال المساعدة والـ Triggers
-- ========================================
-- \echo '⚙️ إنشاء الدوال والـ triggers للسلاسل...'

-- Function to generate streak key
CREATE OR REPLACE FUNCTION generate_streak_key()
RETURNS TRIGGER AS $$
DECLARE
    streak_count INTEGER;
BEGIN
    IF NEW.streak_key IS NULL THEN
        SELECT COUNT(*) + 1 INTO streak_count FROM streaks WHERE user_id = NEW.user_id;
        NEW.streak_key := 'STRK-' || LPAD(streak_count::TEXT, 3, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak statistics
CREATE OR REPLACE FUNCTION update_streak_statistics()
RETURNS TRIGGER AS $$
DECLARE
    completion_count INTEGER;
    current_streak_count INTEGER;
    longest_streak_temp INTEGER := 0; -- Temporary variable for calculating longest streak
    total_days INTEGER;
    success_rate DECIMAL(6,2);
    activity_date_param DATE;
    current_streak_start_date DATE;
    current_streak_end_date DATE;
BEGIN
    activity_date_param := COALESCE(NEW.activity_date, OLD.activity_date);

    -- Calculate total completions
    SELECT COUNT(*) INTO completion_count
    FROM streak_activities
    WHERE streak_id = COALESCE(NEW.streak_id, OLD.streak_id)
    AND status = 'completed';

    -- Calculate current streak
    -- This logic for current streak can be complex. For simplicity, let's recount.
    -- A more robust implementation might involve iterating through consecutive days
    -- or using a dedicated daily job to update this.
    -- For now, let's base it on recent completions.
    -- Consider a simpler "current streak" definition or a more advanced one with gap tolerance.
    -- This calculation will count consecutive successful days leading up to the most recent activity.
    current_streak_count := 0;
    SELECT COUNT(*) INTO current_streak_count
    FROM (
        SELECT
            activity_date,
            activity_date - ROW_NUMBER() OVER (ORDER BY activity_date) * INTERVAL '1 day' AS grp
        FROM streak_activities
        WHERE streak_id = COALESCE(NEW.streak_id, OLD.streak_id)
          AND status = 'completed'
          AND activity_date <= CURRENT_DATE -- Only consider activities up to today
        ORDER BY activity_date DESC
    ) AS sub
    WHERE grp = (
        SELECT activity_date - ROW_NUMBER() OVER (ORDER BY activity_date) * INTERVAL '1 day'
        FROM streak_activities
        WHERE streak_id = COALESCE(NEW.streak_id, OLD.streak_id)
          AND status = 'completed'
          AND activity_date = (SELECT MAX(activity_date) FROM streak_activities WHERE streak_id = COALESCE(NEW.streak_id, OLD.streak_id) AND status = 'completed')
        LIMIT 1
    );


    -- Calculate total days tracked
    SELECT COUNT(DISTINCT activity_date) INTO total_days
    FROM streak_activities
    WHERE streak_id = COALESCE(NEW.streak_id, OLD.streak_id);

    -- Calculate completion rate
    IF total_days > 0 THEN
        success_rate := (completion_count::DECIMAL / total_days::DECIMAL) * 100;
    ELSE
        success_rate := 0;
    END IF;

    -- Update streak statistics
    UPDATE streaks
    SET
        total_completions = completion_count,
        current_streak = current_streak_count,
        -- Update longest_streak only if current_streak_count is greater
        longest_streak = GREATEST(COALESCE(longest_streak, 0), current_streak_count),
        total_days_tracked = total_days,
        completion_rate = success_rate,
        last_activity_date = activity_date_param,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.streak_id, OLD.streak_id);

    -- Update last_completion_date if activity was completed
    IF NEW IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE streaks
        SET last_completion_date = NEW.activity_date
        WHERE id = NEW.streak_id AND (last_completion_date IS NULL OR NEW.activity_date > last_completion_date);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate earned points for an activity
CREATE OR REPLACE FUNCTION calculate_activity_points()
RETURNS TRIGGER AS $$
DECLARE
    base_points INTEGER;
    bonus_points_threshold_val INTEGER;
    bonus_points_amount_val INTEGER;
    current_streak_value INTEGER;
    challenge_multiplier_val DECIMAL(3,2);
BEGIN
    -- Get base points, bonus settings, current streak, and challenge multiplier from the streak
    SELECT points_per_completion, bonus_points_threshold, bonus_points_amount, current_streak, challenge_multiplier
    INTO base_points, bonus_points_threshold_val, bonus_points_amount_val, current_streak_value, challenge_multiplier_val
    FROM streaks WHERE id = NEW.streak_id;

    -- Calculate base points for the new activity
    NEW.points_earned := base_points;
    NEW.bonus_points := 0;

    -- Add bonus points for long streaks (e.g., every 7 days)
    IF current_streak_value > 0 AND current_streak_value % COALESCE(bonus_points_threshold_val, 7) = 0 THEN
        NEW.bonus_points := COALESCE(bonus_points_amount_val, 0);
    END IF;

    -- Apply challenge multiplier if challenge mode is active
    IF challenge_multiplier_val > 1.0 THEN
        NEW.points_earned := ROUND(NEW.points_earned * challenge_multiplier_val);
        NEW.bonus_points := ROUND(NEW.bonus_points * challenge_multiplier_val);
    END IF;

    -- Update total points earned in the main streak table
    UPDATE streaks
    SET total_points_earned = total_points_earned + NEW.points_earned + NEW.bonus_points
    WHERE id = NEW.streak_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Function to search streaks
CREATE OR REPLACE FUNCTION search_streaks(
    search_query TEXT,
    user_id_param UUID DEFAULT NULL,
    status_filter streak_status DEFAULT NULL,
    type_filter streak_type DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    streak_type streak_type,
    current_streak INTEGER,
    longest_streak INTEGER,
    completion_rate DECIMAL(6,2),
    status streak_status,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.description,
        s.streak_type,
        s.current_streak,
        s.longest_streak,
        s.completion_rate,
        s.status,
        ts_rank(to_tsvector('arabic', s.name || ' ' || COALESCE(s.description, '')), plainto_tsquery('arabic', search_query)) as rank
    FROM streaks s
    WHERE
        (user_id_param IS NULL OR s.user_id = user_id_param)
        AND (status_filter IS NULL OR s.status = status_filter)
        AND (type_filter IS NULL OR s.streak_type = type_filter)
        AND (
            search_query IS NULL OR search_query = '' OR
            to_tsvector('arabic', s.name || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('arabic', search_query)
        )
    ORDER BY rank DESC, s.current_streak DESC, s.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user streak statistics
CREATE OR REPLACE FUNCTION get_user_streak_stats(user_id_param UUID)
RETURNS TABLE (
    total_streaks INTEGER,
    active_streaks INTEGER,
    completed_streaks INTEGER,
    total_points INTEGER,
    average_completion_rate DECIMAL(6,2),
    longest_streak_ever INTEGER,
    current_active_days INTEGER,
    most_consistent_category VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_streaks,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END)::INTEGER as active_streaks,
        COUNT(CASE WHEN s.status = 'completed' THEN 1 END)::INTEGER as completed_streaks,
        COALESCE(SUM(s.total_points_earned), 0)::INTEGER as total_points,
        COALESCE(AVG(s.completion_rate), 0) as average_completion_rate,
        COALESCE(MAX(s.longest_streak), 0)::INTEGER as longest_streak_ever,
        -- Sum of current_streak from active streaks
        COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.current_streak ELSE 0 END), 0)::INTEGER as current_active_days,
        (
            SELECT category
            FROM streaks
            WHERE user_id = user_id_param AND category IS NOT NULL
            GROUP BY category
            ORDER BY AVG(completion_rate) DESC
            LIMIT 1
        ) as most_consistent_category
    FROM streaks s
    WHERE s.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_generate_streak_key
    BEFORE INSERT ON streaks
    FOR EACH ROW
    EXECUTE FUNCTION generate_streak_key();

CREATE TRIGGER trigger_update_streaks_updated_at
    BEFORE UPDATE ON streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_streak_activities_updated_at
    BEFORE UPDATE ON streak_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_streak_reminders_updated_at
    BEFORE UPDATE ON streak_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_streak_milestones_updated_at
    BEFORE UPDATE ON streak_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_streak_rewards_updated_at
    BEFORE UPDATE ON streak_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_calculate_activity_points
    BEFORE INSERT ON streak_activities
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION calculate_activity_points();

CREATE TRIGGER trigger_update_streak_statistics
    AFTER INSERT OR UPDATE OR DELETE ON streak_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_streak_statistics();

-- ========================================
-- 8. سياسات الأمان (RLS)
-- ========================================
-- \echo '🔒 تفعيل سياسات الأمان للسلاسل...'

-- Enable RLS on tables
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_rewards ENABLE ROW LEVEL SECURITY;

-- Streak policies
CREATE POLICY "streaks_owner_access" ON streaks
    FOR ALL USING (user_id = auth.uid());

-- Allow project collaborators to view streaks associated with their projects
-- (Requires that projects.id is linked to streaks.project_id and project_collaborators to projects)
CREATE POLICY "streaks_project_collaborator_access" ON streaks
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_collaborators
            WHERE user_id = auth.uid() AND invitation_status = 'accepted'
        )
    );

-- Activities policies
CREATE POLICY "streak_activities_owner_access" ON streak_activities
    FOR ALL USING (user_id = auth.uid());

-- Allow project collaborators to view activities on streaks in their projects
CREATE POLICY "streak_activities_streak_collaborator_access" ON streak_activities
    FOR SELECT USING (
        streak_id IN (
            SELECT s.id FROM streaks s
            WHERE s.project_id IN (
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            )
        )
    );

-- Reminders policies
CREATE POLICY "streak_reminders_owner_access" ON streak_reminders
    FOR ALL USING (
        streak_id IN (
            SELECT id FROM streaks WHERE user_id = auth.uid()
        )
    );

-- Milestones policies
CREATE POLICY "streak_milestones_owner_access" ON streak_milestones
    FOR ALL USING (
        streak_id IN (
            SELECT id FROM streaks WHERE user_id = auth.uid()
        )
    );

-- Allow project collaborators to view milestones on streaks in their projects
CREATE POLICY "streak_milestones_collaborator_access" ON streak_milestones
    FOR SELECT USING (
        streak_id IN (
            SELECT s.id FROM streaks s
            WHERE s.project_id IN (
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            )
        )
    );

-- Rewards policies
CREATE POLICY "streak_rewards_owner_access" ON streak_rewards
    FOR ALL USING (user_id = auth.uid());

-- ========================================
-- 9. Views and Useful Queries
-- ========================================
-- \echo '📊 إنشاء الـ Views للسلاسل...'

-- View to display streaks with additional details
CREATE OR REPLACE VIEW streaks_with_details AS
SELECT
    s.*,
    u.full_name as owner_name, -- Assuming 'full_name' column exists in 'users' table
    u.email as owner_email,
    p.name as project_name,
    COALESCE(sa.activities_count, 0) as total_activities,
    COALESCE(sa.this_week_count, 0) as this_week_activities,
    COALESCE(sa.this_month_count, 0) as this_month_activities,
    COALESCE(sm.milestones_count, 0) as total_milestones,
    COALESCE(sm.achieved_milestones, 0) as achieved_milestones,
    COALESCE(sr.available_rewards, 0) as available_rewards_count,
    CASE
        WHEN s.last_activity_date = CURRENT_DATE THEN 'today'
        WHEN s.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN 'yesterday'
        WHEN s.last_activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN 'this_week'
        WHEN s.last_activity_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'this_month'
        ELSE 'older'
    END as last_activity_period,
    CASE
        WHEN s.next_due_date = CURRENT_DATE THEN 'due_today'
        WHEN s.next_due_date = CURRENT_DATE + INTERVAL '1 day' THEN 'due_tomorrow'
        WHEN s.next_due_date <= CURRENT_DATE THEN 'overdue'
        WHEN s.next_due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'future'
    END as due_status
FROM streaks s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN projects p ON s.project_id = p.id
LEFT JOIN (
    SELECT
        streak_id,
        COUNT(*) as activities_count,
        COUNT(CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week_count,
        COUNT(CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as this_month_count
    FROM streak_activities
    WHERE status = 'completed'
    GROUP BY streak_id
) sa ON s.id = sa.streak_id
LEFT JOIN (
    SELECT
        streak_id,
        COUNT(*) as milestones_count,
        COUNT(CASE WHEN status = 'achieved' THEN 1 END) as achieved_milestones
    FROM streak_milestones
    GROUP BY streak_id
) sm ON s.id = sm.streak_id
LEFT JOIN (
    SELECT
        streak_id,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_rewards
    FROM streak_rewards
    GROUP BY streak_id
) sr ON s.id = sr.streak_id;

-- Final success messages
-- \echo '✅ تم إنشاء جداول السلاسل والعادات بنجاح!'
-- \echo '🔥 نظام تتبع السلاسل المتقدم جاهز للاستخدام'
-- \echo '📊 الفهارس والدوال والسياسات الأمنية تم تطبيقها'

SELECT 'Nexus Streaks and Habits Tracking System schema deployed successfully! ✅' as status;