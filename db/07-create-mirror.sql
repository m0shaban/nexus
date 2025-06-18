-- ========================================
-- 07-create-mirror.sql
-- نظام المرآة للتطوير الشخصي والتأمل
-- ========================================

-- Drop tables if they exist
DROP TABLE IF EXISTS mirror_insights CASCADE;
DROP TABLE IF EXISTS mirror_goals CASCADE;
DROP TABLE IF EXISTS mirror_entries CASCADE;

-- Drop custom types if they exist (for clean re-deployment)
DROP TYPE IF EXISTS entry_type_enum CASCADE; -- Custom name for clarity
DROP TYPE IF EXISTS goal_type_enum CASCADE;   -- Custom name for clarity
DROP TYPE IF EXISTS insight_type_enum CASCADE;-- Custom name for clarity
DROP TYPE IF EXISTS importance_level_enum CASCADE;-- Custom name for clarity
DROP TYPE IF EXISTS trend_direction_enum CASCADE; -- Custom name for clarity
-- Assuming priority_level and complexity_level are already defined in previous scripts.
-- If not, you must define them here:
-- DROP TYPE IF EXISTS priority_level CASCADE;
-- CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
-- DROP TYPE IF EXISTS complexity_level CASCADE;
-- CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high', 'very_high');


-- Define custom ENUM types specific to this script
CREATE TYPE entry_type_enum AS ENUM ('daily_reflection', 'gratitude', 'goal_review', 'challenge', 'success', 'learning', 'mood_check', 'free_writing');
CREATE TYPE goal_type_enum AS ENUM ('personal', 'professional', 'health', 'relationship', 'financial', 'spiritual', 'learning', 'creative');
CREATE TYPE insight_type_enum AS ENUM ('pattern', 'trend', 'correlation', 'achievement', 'challenge', 'opportunity', 'warning', 'celebration');
CREATE TYPE importance_level_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE trend_direction_enum AS ENUM ('positive', 'negative', 'stable', 'fluctuating');

-- Function to update 'updated_at' columns automatically (if not defined globally)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create mirror_entries table (Diaries and Reflections)
CREATE TABLE mirror_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Entry Information
    entry_date DATE NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    entry_type entry_type_enum DEFAULT 'daily_reflection', -- Using ENUM type

    -- Self-assessment
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 10),
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),

    -- Emotions and States
    emotions JSONB DEFAULT '[]', -- List of emotions
    primary_emotion VARCHAR(100),
    emotional_intensity INTEGER CHECK (emotional_intensity >= 1 AND emotional_intensity <= 10),

    -- Goals and Achievements
    goals_worked_on JSONB DEFAULT '[]',
    achievements TEXT,
    challenges_faced TEXT,
    lessons_learned TEXT,

    -- Planning and Aspirations
    tomorrow_priorities JSONB DEFAULT '[]',
    week_goals TEXT,
    month_goals TEXT,

    -- Gratitude and Positivity
    gratitude_items JSONB DEFAULT '[]',
    positive_moments TEXT,
    people_to_thank JSONB DEFAULT '[]',

    -- AI Analysis
    ai_analysis TEXT,
    ai_insights JSONB DEFAULT '[]',
    ai_suggestions JSONB DEFAULT '[]',
    ai_mood_analysis JSONB DEFAULT '{}',
    ai_pattern_detection JSONB DEFAULT '{}',

    -- Status and Processing
    analysis_status VARCHAR(20) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'error')),
    is_private BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,

    -- Tags and Categorization
    tags JSONB DEFAULT '[]',
    categories JSONB DEFAULT '[]',
    weather VARCHAR(100),
    location VARCHAR(255),

    -- Additional Data
    custom_fields JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    voice_note_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Unique index to prevent duplicate daily entries of the same type
    UNIQUE(user_id, entry_date, entry_type)
);

-- Create mirror_goals table (Personal Goals)
CREATE TABLE mirror_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Goal Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    goal_type goal_type_enum DEFAULT 'personal', -- Using ENUM type

    -- Status and Priority
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled', 'archived')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')), -- Assuming priority is defined

    -- Progress and Measurement
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    measurement_method VARCHAR(100), -- How to measure progress
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit_of_measurement VARCHAR(50),

    -- Timings
    start_date DATE,
    target_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    review_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (review_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    last_review_date DATE,
    next_review_date DATE,

    -- Details and Strategies
    why_important TEXT, -- Why this goal is important
    success_criteria TEXT, -- Success criteria
    action_steps JSONB DEFAULT '[]', -- Required steps
    obstacles JSONB DEFAULT '[]', -- Expected obstacles
    strategies JSONB DEFAULT '[]', -- Strategies to overcome obstacles
    resources_needed JSONB DEFAULT '[]', -- Required resources

    -- Motivation and Rewards
    motivation_reasons JSONB DEFAULT '[]',
    rewards_planned JSONB DEFAULT '[]',
    accountability_partner VARCHAR(255),

    -- Tracking and Statistics
    total_check_ins INTEGER DEFAULT 0,
    positive_check_ins INTEGER DEFAULT 0,
    last_positive_check_in DATE,
    streak_days INTEGER DEFAULT 0,

    -- AI Analysis
    ai_suggestions JSONB DEFAULT '[]',
    ai_progress_analysis TEXT,
    ai_risk_assessment TEXT,
    success_probability DECIMAL(3,2), -- Success probability (0-1)

    -- Additional Properties
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]',
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Date validity check
    CONSTRAINT valid_goal_dates CHECK (target_date IS NULL OR start_date IS NULL OR target_date >= start_date)
);

-- Create mirror_insights table (Discoveries and Patterns)
CREATE TABLE mirror_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Insight Information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    insight_type insight_type_enum DEFAULT 'pattern', -- Using ENUM type

    -- Importance and Impact
    importance_level importance_level_enum DEFAULT 'medium', -- Using ENUM type
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    impact_area VARCHAR(100), -- Affected area

    -- Data and Sources
    data_sources JSONB DEFAULT '[]', -- Data sources used
    time_period_start DATE,
    time_period_end DATE,
    sample_size INTEGER,

    -- Details and Analysis
    key_findings JSONB DEFAULT '[]',
    supporting_evidence JSONB DEFAULT '[]',
    correlation_strength DECIMAL(3,2), -- Correlation strength
    trend_direction trend_direction_enum CHECK (trend_direction IN ('positive', 'negative', 'stable', 'fluctuating')), -- Using ENUM type

    -- Actions and Recommendations
    recommendations JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    potential_improvements JSONB DEFAULT '[]',

    -- Status and Follow-up
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'acting_on', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Categorization and Tags
    categories JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    related_goals JSONB DEFAULT '[]', -- Related goal IDs

    -- Technical Data
    algorithm_used VARCHAR(100), -- Analysis algorithm used
    processing_metadata JSONB DEFAULT '{}',

    -- Priority and Display
    is_highlighted BOOLEAN DEFAULT false,
    is_actionable BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for mirror entries
CREATE INDEX idx_mirror_entries_user_id ON mirror_entries(user_id);
CREATE INDEX idx_mirror_entries_entry_date ON mirror_entries(entry_date);
CREATE INDEX idx_mirror_entries_entry_type ON mirror_entries(entry_type);
CREATE INDEX idx_mirror_entries_mood_rating ON mirror_entries(mood_rating);
CREATE INDEX idx_mirror_entries_analysis_status ON mirror_entries(analysis_status);
CREATE INDEX idx_mirror_entries_is_favorite ON mirror_entries(is_favorite);
CREATE INDEX idx_mirror_entries_created_at ON mirror_entries(created_at);

-- Create indexes for mirror goals
CREATE INDEX idx_mirror_goals_user_id ON mirror_goals(user_id);
CREATE INDEX idx_mirror_goals_status ON mirror_goals(status);
CREATE INDEX idx_mirror_goals_priority ON mirror_goals(priority);
CREATE INDEX idx_mirror_goals_goal_type ON mirror_goals(goal_type);
CREATE INDEX idx_mirror_goals_target_date ON mirror_goals(target_date);
CREATE INDEX idx_mirror_goals_progress_percentage ON mirror_goals(progress_percentage);
CREATE INDEX idx_mirror_goals_next_review_date ON mirror_goals(next_review_date);

-- Create indexes for mirror insights
CREATE INDEX idx_mirror_insights_user_id ON mirror_insights(user_id);
CREATE INDEX idx_mirror_insights_insight_type ON mirror_insights(insight_type);
CREATE INDEX idx_mirror_insights_importance_level ON mirror_insights(importance_level);
CREATE INDEX idx_mirror_insights_status ON mirror_insights(status);
CREATE INDEX idx_mirror_insights_is_highlighted ON mirror_insights(is_highlighted);
CREATE INDEX idx_mirror_insights_created_at ON mirror_insights(created_at);

-- Text search indexes
CREATE INDEX idx_mirror_entries_content_search ON mirror_entries USING gin(to_tsvector('arabic', content));
CREATE INDEX idx_mirror_goals_title_search ON mirror_goals USING gin(to_tsvector('arabic', title));
CREATE INDEX idx_mirror_insights_description_search ON mirror_insights USING gin(to_tsvector('arabic', description));

-- Create triggers to update updated_at
CREATE TRIGGER update_mirror_entries_updated_at
    BEFORE UPDATE ON mirror_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mirror_goals_updated_at
    BEFORE UPDATE ON mirror_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mirror_insights_updated_at
    BEFORE UPDATE ON mirror_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE mirror_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for mirror_entries
CREATE POLICY "Users can view their own mirror entries" ON mirror_entries
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own mirror entries" ON mirror_entries
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own mirror entries" ON mirror_entries
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own mirror entries" ON mirror_entries
    FOR DELETE USING (user_id = auth.uid());

-- RLS policies for mirror_goals
CREATE POLICY "Users can view their own mirror goals" ON mirror_goals
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can insert their own mirror goals" ON mirror_goals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own mirror goals" ON mirror_goals
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own mirror goals" ON mirror_goals
    FOR DELETE USING (user_id = auth.uid());

-- RLS policies for mirror_insights
CREATE POLICY "Users can view their own mirror insights" ON mirror_insights
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own mirror insights" ON mirror_insights
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own mirror insights" ON mirror_insights
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own mirror insights" ON mirror_insights
    FOR DELETE USING (user_id = auth.uid());

-- Function to create a daily mirror entry
CREATE OR REPLACE FUNCTION create_daily_mirror_entry(
    p_user_id UUID,
    p_entry_date DATE, -- Removed DEFAULT CURRENT_DATE here to allow subsequent parameters without default
    p_content TEXT,
    p_mood_rating INTEGER DEFAULT NULL,
    p_energy_level INTEGER DEFAULT NULL,
    p_achievements TEXT DEFAULT NULL,
    p_challenges TEXT DEFAULT NULL,
    p_gratitude_items JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    entry_id UUID;
BEGIN
    INSERT INTO mirror_entries (
        user_id, entry_date, content, mood_rating, energy_level,
        achievements, challenges_faced, gratitude_items, entry_type
    ) VALUES (
        p_user_id, COALESCE(p_entry_date, CURRENT_DATE), p_content, p_mood_rating, p_energy_level, -- Use COALESCE here for default
        p_achievements, p_challenges, p_gratitude_items, 'daily_reflection'
    )
    ON CONFLICT (user_id, entry_date, entry_type)
    DO UPDATE SET
        content = EXCLUDED.content,
        mood_rating = EXCLUDED.mood_rating,
        energy_level = EXCLUDED.energy_level,
        achievements = EXCLUDED.achievements,
        challenges_faced = EXCLUDED.challenges_faced,
        gratitude_items = EXCLUDED.gratitude_items,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO entry_id;

    RETURN entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress(
    p_goal_id UUID,
    p_new_value DECIMAL,
    p_notes TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    goal_record RECORD;
    new_percentage INTEGER;
BEGIN
    -- Get goal information
    SELECT * INTO goal_record FROM mirror_goals WHERE id = p_goal_id;

    -- Calculate new percentage
    new_percentage := CASE
        WHEN goal_record.target_value = 0 THEN 100
        ELSE LEAST(100, (p_new_value * 100 / goal_record.target_value)::INTEGER)
    END;

    -- Update goal
    UPDATE mirror_goals
    SET
        current_value = p_new_value,
        progress_percentage = new_percentage,
        last_review_date = CURRENT_DATE,
        total_check_ins = total_check_ins + 1,
        positive_check_ins = CASE
            WHEN p_new_value > current_value THEN positive_check_ins + 1
            ELSE positive_check_ins
        END,
        last_positive_check_in = CASE
            WHEN p_new_value > current_value THEN CURRENT_DATE
            ELSE last_positive_check_in
        END,
        notes = COALESCE(p_notes, notes),
        status = CASE
            WHEN new_percentage >= 100 THEN 'completed'
            WHEN status = 'draft' THEN 'active'
            ELSE status
        END,
        completed_at = CASE
            WHEN new_percentage >= 100 AND status != 'completed' THEN CURRENT_TIMESTAMP
            ELSE completed_at
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user mirror analytics
CREATE OR REPLACE FUNCTION get_mirror_analytics(
    p_user_id UUID,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_entries INTEGER,
    average_mood DECIMAL,
    average_energy DECIMAL,
    mood_trend VARCHAR,
    active_goals INTEGER,
    completed_goals INTEGER,
    goal_completion_rate DECIMAL,
    insights_count INTEGER,
    gratitude_items_count INTEGER
) AS $$
DECLARE
    recent_mood_avg DECIMAL;
    older_mood_avg DECIMAL;
BEGIN
    -- Calculate average mood for recent and older periods to determine trend
    SELECT AVG(mood_rating) INTO recent_mood_avg
    FROM mirror_entries
    WHERE user_id = p_user_id
    AND entry_date >= CURRENT_DATE - INTERVAL '15 days'
    AND mood_rating IS NOT NULL;

    SELECT AVG(mood_rating) INTO older_mood_avg
    FROM mirror_entries
    WHERE user_id = p_user_id
    AND entry_date >= CURRENT_DATE - INTERVAL '30 days'
    AND entry_date < CURRENT_DATE - INTERVAL '15 days'
    AND mood_rating IS NOT NULL;

    RETURN QUERY
    SELECT
        COUNT(DISTINCT me.entry_date)::INTEGER as total_entries,
        AVG(me.mood_rating)::DECIMAL as average_mood,
        AVG(me.energy_level)::DECIMAL as average_energy,
        CASE
            WHEN recent_mood_avg > COALESCE(older_mood_avg, recent_mood_avg) THEN 'improving'::VARCHAR -- Handle NULL older_mood_avg
            WHEN recent_mood_avg < COALESCE(older_mood_avg, recent_mood_avg) THEN 'declining'::VARCHAR
            ELSE 'stable'::VARCHAR
        END as mood_trend,
        COUNT(mg.*) FILTER (WHERE mg.status = 'active')::INTEGER as active_goals,
        COUNT(mg.*) FILTER (WHERE mg.status = 'completed')::INTEGER as completed_goals,
        (COUNT(mg.*) FILTER (WHERE mg.status = 'completed') * 100.0 /
         GREATEST(COUNT(mg.*) FILTER (WHERE mg.status IN ('active', 'completed', 'on_hold')), 1))::DECIMAL as goal_completion_rate,
        COUNT(mi.*)::INTEGER as insights_count,
        COALESCE(SUM(jsonb_array_length(me.gratitude_items)), 0)::INTEGER as gratitude_items_count
    FROM mirror_entries me
    LEFT JOIN mirror_goals mg ON mg.user_id = me.user_id
    LEFT JOIN mirror_insights mi ON mi.user_id = me.user_id
        AND mi.created_at >= CURRENT_DATE - (p_days_back || ' days')::interval -- Corrected interval syntax
    WHERE me.user_id = p_user_id
    AND me.entry_date >= CURRENT_DATE - (p_days_back || ' days')::interval -- Corrected interval syntax
    GROUP BY recent_mood_avg, older_mood_avg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Mirror system tables (entries, goals, insights) created successfully! ✅' as status;