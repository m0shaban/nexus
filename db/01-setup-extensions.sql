-- ========================================
-- Nexus Database Setup - Extensions & Helpers
-- إعداد الإضافات والدوال المساعدة
-- ========================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create helper functions for common operations
-- =======================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate short IDs (similar to nanoid)
CREATE OR REPLACE FUNCTION generate_short_id(size integer DEFAULT 12)
RETURNS text AS $$
DECLARE
    alphabet text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    id text := '';
    i integer := 0;
BEGIN
    WHILE i < size LOOP
        id := id || substr(alphabet, floor(random() * length(alphabet))::int + 1, 1);
        i := i + 1;
    END LOOP;
    RETURN id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean and normalize Arabic text
CREATE OR REPLACE FUNCTION normalize_arabic_text(input_text text)
RETURNS text AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remove extra whitespace and normalize
    RETURN trim(regexp_replace(input_text, '\s+', ' ', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to extract keywords from text (for search)
CREATE OR REPLACE FUNCTION extract_keywords(input_text text)
RETURNS text[] AS $$
DECLARE
    words text[];
    clean_text text;
BEGIN
    IF input_text IS NULL THEN
        RETURN ARRAY[]::text[];
    END IF;
    
    -- Clean and normalize text
    clean_text := normalize_arabic_text(input_text);
    
    -- Split into words and filter
    words := string_to_array(lower(clean_text), ' ');
    
    -- Return words longer than 2 characters
    RETURN array(
        SELECT word FROM unnest(words) AS word 
        WHERE length(word) > 2
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate streak for a project
CREATE OR REPLACE FUNCTION calculate_project_streak(project_id_param uuid)
RETURNS integer AS $$
DECLARE
    last_activity_date date;
    current_streak integer := 0;
    check_date date;
BEGIN
    -- Get the last activity date for this project
    SELECT MAX(DATE(created_at)) INTO last_activity_date
    FROM tasks 
    WHERE project_id = project_id_param AND is_completed = true;
    
    IF last_activity_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Check if there's activity today or yesterday
    IF last_activity_date < CURRENT_DATE - INTERVAL '1 day' THEN
        RETURN 0;
    END IF;
    
    -- Count consecutive days backwards from last activity
    check_date := last_activity_date;
    
    WHILE check_date IS NOT NULL LOOP
        -- Check if there's completed task on this date
        IF EXISTS (
            SELECT 1 FROM tasks 
            WHERE project_id = project_id_param 
            AND is_completed = true 
            AND DATE(completed_at) = check_date
        ) THEN
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param uuid)
RETURNS json AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'total_notes', (SELECT count(*) FROM notes WHERE user_id = user_id_param),
        'total_projects', (SELECT count(*) FROM projects WHERE user_id = user_id_param),
        'active_projects', (SELECT count(*) FROM projects WHERE user_id = user_id_param AND status = 'active'),
        'completed_projects', (SELECT count(*) FROM projects WHERE user_id = user_id_param AND status = 'completed'),
        'total_tasks', (SELECT count(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = user_id_param),
        'completed_tasks', (SELECT count(*) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = user_id_param AND t.is_completed = true),
        'total_scenarios', (SELECT count(*) FROM scenarios WHERE user_id = user_id_param),
        'total_journal_entries', (SELECT count(*) FROM journal_entries WHERE user_id = user_id_param),
        'longest_streak', (SELECT COALESCE(MAX(longest_streak), 0) FROM streaks WHERE user_id = user_id_param)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Create custom types for enums
DO $$ BEGIN
    CREATE TYPE note_analysis_status AS ENUM ('pending', 'analyzing', 'completed', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('active', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scenario_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scenario_status AS ENUM ('pending', 'analyzing', 'completed', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE journal_category AS ENUM ('reflection', 'gratitude', 'goals', 'emotions', 'relationships', 'growth');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logos_conversation_type AS ENUM ('general', 'strategic', 'analysis', 'debugging', 'planning');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logos_priority_level AS ENUM ('low', 'normal', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logos_message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logos_analysis_depth AS ENUM ('quick', 'standard', 'comprehensive', 'deep');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logos_response_style AS ENUM ('casual', 'professional', 'strategic', 'analytical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logos_challenge_level AS ENUM ('low', 'medium', 'high', 'maximum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logos_kb_category AS ENUM ('books', 'methodologies', 'frameworks', 'technical', 'strategic', 'personal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_language AS ENUM ('ar', 'en', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Success message
SELECT 'Extensions and helper functions created successfully! ✅' as status;

-- رسالة تأكيد
DO $$
BEGIN
    RAISE NOTICE 'Extensions and helper functions created successfully!';
END $$;
