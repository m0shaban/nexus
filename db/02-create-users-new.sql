-- ========================================
-- Nexus Database - Users System
-- نظام المستخدمين والملفات الشخصية
-- ========================================

-- Create users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic user info
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    avatar_url text,
    
    -- Profile settings
    bio text,
    timezone text DEFAULT 'UTC',
    language user_language DEFAULT 'ar',
    theme text DEFAULT 'dark',
    
    -- Telegram integration
    telegram_user_id bigint UNIQUE,
    telegram_username text,
    telegram_chat_id bigint,
    telegram_notifications_enabled boolean DEFAULT true,
    
    -- Subscription and limits
    subscription_type text DEFAULT 'free',
    subscription_expires_at timestamp with time zone,
    monthly_notes_limit integer DEFAULT 1000,
    monthly_ai_requests_limit integer DEFAULT 100,
    
    -- Usage tracking
    monthly_notes_count integer DEFAULT 0,
    monthly_ai_requests_count integer DEFAULT 0,
    last_reset_date date DEFAULT CURRENT_DATE,
    
    -- Preferences
    auto_analyze_notes boolean DEFAULT true,
    email_notifications_enabled boolean DEFAULT true,
    weekly_summary_enabled boolean DEFAULT true,
    
    -- Status
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    last_login_at timestamp with time zone,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_timezone CHECK (timezone IS NULL OR length(timezone) > 0),
    CONSTRAINT valid_monthly_limits CHECK (monthly_notes_limit > 0 AND monthly_ai_requests_limit > 0),
    CONSTRAINT valid_monthly_counts CHECK (monthly_notes_count >= 0 AND monthly_ai_requests_count >= 0)
);
-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- UI Preferences
    sidebar_collapsed boolean DEFAULT false,
    default_note_view text DEFAULT 'list',
    notes_per_page integer DEFAULT 20,
    auto_save_enabled boolean DEFAULT true,
    auto_save_interval integer DEFAULT 30, -- seconds
    
    -- AI Analysis Preferences
    default_analysis_depth logos_analysis_depth DEFAULT 'standard',
    auto_analyze_new_notes boolean DEFAULT true,
    auto_generate_summaries boolean DEFAULT true,
    auto_generate_questions boolean DEFAULT true,
    preferred_ai_model text DEFAULT 'gpt-4',
    
    -- Notification Preferences
    desktop_notifications boolean DEFAULT true,
    email_digest_frequency text DEFAULT 'weekly',
    reminder_notifications boolean DEFAULT true,
    achievement_notifications boolean DEFAULT true,
    
    -- Privacy Settings
    allow_data_export boolean DEFAULT true,
    allow_anonymous_analytics boolean DEFAULT true,
    
    UNIQUE(user_id)
);

-- Create user sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token text NOT NULL UNIQUE,
    ip_address inet,
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    last_activity_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    metadata jsonb,
    ip_address inet,
    user_agent text
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type text NOT NULL,
    achievement_name text NOT NULL,
    description text,
    icon text,
    points integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, achievement_type, achievement_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_telegram_user_id ON users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON users(subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_reset_date ON users(last_reset_date);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_log(action);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to reset monthly counters
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        monthly_notes_count = 0,
        monthly_ai_requests_count = 0,
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Create function to check user limits
CREATE OR REPLACE FUNCTION check_user_limit(
    user_id_param uuid,
    limit_type text
)
RETURNS boolean AS $$
DECLARE
    user_record users;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Reset counters if needed
    IF user_record.last_reset_date < CURRENT_DATE - INTERVAL '1 month' THEN
        PERFORM reset_monthly_counters();
        SELECT * INTO user_record FROM users WHERE id = user_id_param;
    END IF;
    
    IF limit_type = 'notes' THEN
        RETURN user_record.monthly_notes_count < user_record.monthly_notes_limit;
    ELSIF limit_type = 'ai_requests' THEN
        RETURN user_record.monthly_ai_requests_count < user_record.monthly_ai_requests_limit;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment user counters
CREATE OR REPLACE FUNCTION increment_user_counter(
    user_id_param uuid,
    counter_type text
)
RETURNS void AS $$
BEGIN
    IF counter_type = 'notes' THEN
        UPDATE users 
        SET monthly_notes_count = monthly_notes_count + 1 
        WHERE id = user_id_param;
    ELSIF counter_type = 'ai_requests' THEN
        UPDATE users 
        SET monthly_ai_requests_count = monthly_ai_requests_count + 1 
        WHERE id = user_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    user_id_param uuid,
    action_param text,
    entity_type_param text DEFAULT NULL,
    entity_id_param uuid DEFAULT NULL,
    metadata_param jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO user_activity_log (
        user_id, action, entity_type, entity_id, metadata
    ) VALUES (
        user_id_param, action_param, entity_type_param, entity_id_param, metadata_param
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to grant achievement
CREATE OR REPLACE FUNCTION grant_achievement(
    user_id_param uuid,
    achievement_type_param text,
    achievement_name_param text,
    description_param text DEFAULT NULL,
    icon_param text DEFAULT NULL,
    points_param integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
    INSERT INTO user_achievements (
        user_id, achievement_type, achievement_name, description, icon, points
    ) VALUES (
        user_id_param, achievement_type_param, achievement_name_param, 
        description_param, icon_param, points_param
    )
    ON CONFLICT (user_id, achievement_type, achievement_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Success message
SELECT 'Users system created successfully! ✅' as status;
