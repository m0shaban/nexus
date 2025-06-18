-- ========================================
-- 05-create-scenarios.sql
-- نظام تحليل السيناريوهات والتخطيط المسبق الذكي
-- AI-Powered Scenarios Analysis System
-- ========================================

-- \echo '🎯 إنشاء جداول السيناريوهات والتحليل الذكي...'

-- Drop tables if they exist (in correct order to respect dependencies)
DROP TABLE IF EXISTS scenario_outputs CASCADE;
DROP TABLE IF EXISTS scenario_actions CASCADE;
DROP TABLE IF EXISTS scenario_assumptions CASCADE;
DROP TABLE IF EXISTS scenario_variables CASCADE;
DROP TABLE IF EXISTS scenarios CASCADE;

-- Drop existing types if they exist (safe for re-running the script, especially in development)
DROP TYPE IF EXISTS complexity_level CASCADE;
DROP TYPE IF EXISTS analysis_status CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS scenario_status CASCADE;
DROP TYPE IF EXISTS scenario_type CASCADE;
DROP TYPE IF EXISTS variable_type CASCADE;
DROP TYPE IF EXISTS assumption_criticality CASCADE;
DROP TYPE IF EXISTS assumption_type CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS action_type CASCADE;
DROP TYPE IF EXISTS impact_level CASCADE;
DROP TYPE IF EXISTS implementation_status CASCADE;
DROP TYPE IF EXISTS output_type CASCADE;

-- Ensure uuid-ossp extension is enabled for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Types (ENUMs)
CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high', 'very_high');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE risk_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high', 'critical');
CREATE TYPE scenario_status AS ENUM ('draft', 'analyzing', 'ready', 'completed', 'archived', 'deprecated'); -- Added 'completed'
CREATE TYPE scenario_type AS ENUM ('general', 'strategic', 'financial', 'operational', 'risk_assessment', 'product_development');
CREATE TYPE variable_type AS ENUM ('qualitative', 'quantitative', 'boolean');
CREATE TYPE assumption_criticality AS ENUM ('low', 'medium', 'high');
CREATE TYPE assumption_type AS ENUM ('general', 'technical', 'market', 'financial', 'regulatory');
CREATE TYPE validation_status AS ENUM ('pending', 'validated', 'rejected', 'under_review');
CREATE TYPE action_type AS ENUM ('preventive', 'corrective', 'mitigation', 'exploratory', 'contingency');
CREATE TYPE impact_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE implementation_status AS ENUM ('planned', 'in_progress', 'completed', 'delayed', 'cancelled');
CREATE TYPE output_type AS ENUM ('prediction', 'recommendation', 'summary', 'report', 'visualisation_data');

-- Function to update 'updated_at' columns automatically (Assuming this is defined globally, if not, it should be here)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- ========================================
-- 1. جدول السيناريوهات الرئيسي
-- ========================================
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    note_id UUID REFERENCES notes(id) ON DELETE SET NULL,

    -- المعلومات الأساسية
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    context TEXT,
    scenario_key VARCHAR(20) UNIQUE, -- SCEN-001

    -- الافتراضات والمدخلات
    initial_situation TEXT,
    key_stakeholders JSONB DEFAULT '[]',
    external_factors JSONB DEFAULT '[]',
    constraints_limitations JSONB DEFAULT '[]',

    -- المتغيرات والمعايير
    variables_count INTEGER DEFAULT 0,
    complexity_level complexity_level DEFAULT 'medium',
    time_horizon VARCHAR(20) DEFAULT 'short_term' CHECK (time_horizon IN ('immediate', 'short_term', 'medium_term', 'long_term', 'indefinite')),

    -- نتائج التحليل الذكي
    ai_analysis_status analysis_status DEFAULT 'pending',
    ai_best_case_scenario TEXT,
    ai_worst_case_scenario TEXT,
    ai_most_likely_scenario TEXT,
    ai_black_swan_events JSONB DEFAULT '[]',
    ai_pre_mortem_analysis TEXT,
    ai_post_mortem_lessons JSONB DEFAULT '[]',
    ai_mitigation_strategies JSONB DEFAULT '[]',
    ai_contingency_plans JSONB DEFAULT '[]',
    ai_opportunities JSONB DEFAULT '[]',
    ai_threats JSONB DEFAULT '[]',
    ai_recommendations TEXT,

    -- التقييمات والمقاييس
    confidence_score DECIMAL(4,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    risk_level risk_level DEFAULT 'medium',
    impact_score DECIMAL(4,2) CHECK (impact_score >= 0 AND impact_score <= 100),
    feasibility_score DECIMAL(4,2) CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    innovation_score DECIMAL(4,2) CHECK (innovation_score >= 0 AND innovation_score <= 100),
    sustainability_score DECIMAL(4,2) CHECK (sustainability_score >= 0 AND sustainability_score <= 100),

    -- الحالة والمعالجة
    status scenario_status DEFAULT 'draft',
    processing_status VARCHAR(20) DEFAULT 'idle' CHECK (processing_status IN ('idle', 'queued', 'processing', 'completed', 'failed', 'cancelled')),
    analysis_version INTEGER DEFAULT 1,
    analysis_iterations INTEGER DEFAULT 0,

    -- التصنيف والخصائص
    category VARCHAR(100),
    priority priority_level DEFAULT 'medium', -- Assuming priority_level is defined elsewhere or in previous script
    scenario_type scenario_type DEFAULT 'general',
    methodology VARCHAR(50) DEFAULT 'swot' CHECK (methodology IN ('swot', 'pestle', 'scenario_planning', 'monte_carlo', 'delphi', 'cross_impact', 'morphological')),

    -- الميتاداتا والعلامات
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',

    -- إعدادات الذكاء الاصطناعي
    ai_model VARCHAR(50) DEFAULT 'gpt-4',
    ai_temperature DECIMAL(3,2) DEFAULT 0.7,
    ai_max_tokens INTEGER DEFAULT 2000,
    ai_prompt_template TEXT,

    -- الحالة والخصائص الإضافية
    is_template BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false, -- Added this column for RLS policies
    archived_at TIMESTAMP WITH TIME ZONE,

    -- أداء وإحصائيات
    views_count INTEGER DEFAULT 0,
    analysis_duration INTERVAL,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    analysis_date TIMESTAMP WITH TIME ZONE, -- Added this column as used in update_scenario_analysis

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- التحقق من البيانات
    CONSTRAINT valid_scores CHECK (
        (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 100) AND
        (impact_score IS NULL OR impact_score BETWEEN 0 AND 100) AND
        (feasibility_score IS NULL OR feasibility_score BETWEEN 0 AND 100)
    )
);

-- ========================================
-- 2. جدول متغيرات السيناريو
-- ========================================
CREATE TABLE scenario_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,

    -- معلومات المتغير
    name VARCHAR(255) NOT NULL,
    description TEXT,
    variable_type variable_type DEFAULT 'qualitative',

    -- القيم والنطاقات
    min_value DECIMAL(15,4),
    max_value DECIMAL(15,4),
    current_value DECIMAL(15,4),
    unit VARCHAR(50),

    -- قيم التحليل
    best_case_value DECIMAL(15,4),
    worst_case_value DECIMAL(15,4),
    most_likely_value DECIMAL(15,4),

    -- الخصائص
    importance_weight DECIMAL(4,2) DEFAULT 1.0 CHECK (importance_weight >= 0 AND importance_weight <= 10),
    uncertainty_level DECIMAL(4,2) DEFAULT 0.5 CHECK (uncertainty_level >= 0 AND uncertainty_level <= 1),
    controllability DECIMAL(4,2) DEFAULT 0.5 CHECK (controllability >= 0 AND controllability <= 1),

    -- التصنيف
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- التحقق من البيانات
    CONSTRAINT valid_range CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value),
    CONSTRAINT valid_current_value CHECK (
        current_value IS NULL OR
        (min_value IS NULL OR current_value >= min_value) AND
        (max_value IS NULL OR current_value <= max_value)
    )
);

-- ========================================
-- 3. جدول افتراضات السيناريو
-- ========================================
CREATE TABLE scenario_assumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,

    -- محتوى الافتراض
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT,

    -- التقييم
    confidence_level DECIMAL(4,2) DEFAULT 50.0 CHECK (confidence_level >= 0 AND confidence_level <= 100),
    criticality_level assumption_criticality DEFAULT 'medium',
    testability_score DECIMAL(4,2) DEFAULT 50.0 CHECK (testability_score >= 0 AND testability_score <= 100),

    -- التصنيف
    assumption_type assumption_type DEFAULT 'general',
    category VARCHAR(100),

    -- مصادر ومراجع
    sources JSONB DEFAULT '[]',
    references_data JSONB DEFAULT '[]', -- Renamed 'references' column to 'references_data'

    -- حالة التحقق
    validation_status validation_status DEFAULT 'pending',
    validation_notes TEXT,
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP WITH TIME ZONE,

    -- الميتاداتا
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. جدول إجراءات السيناريو
-- ========================================
CREATE TABLE scenario_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,

    -- تفاصيل الإجراء
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_type action_type DEFAULT 'preventive',

    -- التوقيت والتنفيذ
    trigger_conditions TEXT,
    timing VARCHAR(20) DEFAULT 'immediate' CHECK (timing IN ('immediate', 'short_term', 'medium_term', 'long_term', 'conditional')),
    duration_estimate INTERVAL,

    -- التقييم والأولوية
    priority priority_level DEFAULT 'medium', -- Assuming priority_level is defined elsewhere or in previous script
    difficulty_level complexity_level DEFAULT 'medium',
    cost_estimate DECIMAL(12,2),
    cost_currency VARCHAR(3) DEFAULT 'USD',

    -- الموارد والمتطلبات
    required_resources JSONB DEFAULT '[]',
    responsible_parties JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',

    -- المخاطر والفوائد
    expected_impact impact_level DEFAULT 'medium',
    success_probability DECIMAL(4,2) DEFAULT 50.0 CHECK (success_probability >= 0 AND success_probability <= 100),
    risk_factors JSONB DEFAULT '[]',
    success_metrics JSONB DEFAULT '[]',

    -- حالة التنفيذ
    implementation_status implementation_status DEFAULT 'planned',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

    -- التصنيف
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',
    notes TEXT,

    -- التواريخ
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- التحقق من التواريخ
    CONSTRAINT valid_planned_dates CHECK (planned_end_date IS NULL OR planned_start_date IS NULL OR planned_end_date >= planned_start_date),
    CONSTRAINT valid_actual_dates CHECK (actual_end_date IS NULL OR actual_start_date IS NULL OR actual_end_date >= actual_start_date)
);

-- ========================================
-- 5. جدول مخرجات السيناريو
-- ========================================
CREATE TABLE scenario_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,

    -- نوع المخرج
    output_type output_type DEFAULT 'prediction',

    -- المحتوى
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,

    -- التقييم والثقة
    confidence_score DECIMAL(4,2) DEFAULT 50.0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    accuracy_score DECIMAL(4,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    relevance_score DECIMAL(4,2) DEFAULT 50.0 CHECK (relevance_score >= 0 AND relevance_score <= 100),

    -- الترتيب والأولوية
    priority priority_level DEFAULT 'medium',
    order_index INTEGER DEFAULT 0,

    -- تفاصيل الإنتاج
    generated_by VARCHAR(50) DEFAULT 'system',
    generation_method VARCHAR(50),
    ai_model VARCHAR(50),

    -- حالة التحقق
    verification_status validation_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,

    -- الميتاداتا
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Added missing column
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Added missing column
);

-- ========================================
-- 6. الفهارس والفهارس المتقدمة
-- ========================================
-- \echo '📇 إنشاء الفهارس للسيناريوهات...'

-- Indexes for Scenarios
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_scenarios_project_id ON scenarios(project_id);
CREATE INDEX idx_scenarios_note_id ON scenarios(note_id);
CREATE INDEX idx_scenarios_status ON scenarios(status);
CREATE INDEX idx_scenarios_ai_analysis_status ON scenarios(ai_analysis_status);
CREATE INDEX idx_scenarios_processing_status ON scenarios(processing_status);
CREATE INDEX idx_scenarios_category ON scenarios(category);
CREATE INDEX idx_scenarios_scenario_type ON scenarios(scenario_type);
CREATE INDEX idx_scenarios_risk_level ON scenarios(risk_level);
CREATE INDEX idx_scenarios_priority ON scenarios(priority);
CREATE INDEX idx_scenarios_complexity ON scenarios(complexity_level);
CREATE INDEX idx_scenarios_methodology ON scenarios(methodology);
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at DESC);
CREATE INDEX idx_scenarios_updated_at ON scenarios(updated_at DESC);
CREATE INDEX idx_scenarios_last_analyzed ON scenarios(last_analyzed_at DESC);
CREATE INDEX idx_scenarios_is_template ON scenarios(is_template) WHERE is_template = true;
CREATE INDEX idx_scenarios_is_public ON scenarios(is_public) WHERE is_public = true;
CREATE INDEX idx_scenarios_is_favorite ON scenarios(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_scenarios_is_shared ON scenarios(is_shared) WHERE is_shared = true;
CREATE INDEX idx_scenarios_tags ON scenarios USING gin(tags);
CREATE INDEX idx_scenarios_metadata ON scenarios USING gin(metadata);
-- Text search indexes for scenarios
CREATE INDEX idx_scenarios_search ON scenarios USING gin(to_tsvector('arabic', title || ' ' || COALESCE(description, '')));
-- These specific indexes are covered by idx_scenarios_search, but kept if distinct performance needs arise.
-- CREATE INDEX idx_scenarios_title_search ON scenarios USING gin(to_tsvector('arabic', title));
-- CREATE INDEX idx_scenarios_description_search ON scenarios USING gin(to_tsvector('arabic', description));


-- Indexes for Scenario Variables
CREATE INDEX idx_scenario_variables_scenario_id ON scenario_variables(scenario_id);
CREATE INDEX idx_scenario_variables_type ON scenario_variables(variable_type);
CREATE INDEX idx_scenario_variables_importance ON scenario_variables(importance_weight DESC);
CREATE INDEX idx_scenario_variables_uncertainty ON scenario_variables(uncertainty_level DESC);
CREATE INDEX idx_scenario_variables_category ON scenario_variables(category);
CREATE INDEX idx_scenario_variables_tags ON scenario_variables USING gin(tags);
CREATE INDEX idx_scenario_variables_search ON scenario_variables USING gin(to_tsvector('arabic', name || ' ' || COALESCE(description, '')));


-- Indexes for Scenario Assumptions
CREATE INDEX idx_scenario_assumptions_scenario_id ON scenario_assumptions(scenario_id);
CREATE INDEX idx_scenario_assumptions_type ON scenario_assumptions(assumption_type);
CREATE INDEX idx_scenario_assumptions_criticality ON scenario_assumptions(criticality_level);
CREATE INDEX idx_scenario_assumptions_validation_status ON scenario_assumptions(validation_status);
CREATE INDEX idx_scenario_assumptions_confidence ON scenario_assumptions(confidence_level DESC);
CREATE INDEX idx_scenario_assumptions_validated_by ON scenario_assumptions(validated_by);
CREATE INDEX idx_scenario_assumptions_search ON scenario_assumptions USING gin(to_tsvector('arabic', title || ' ' || COALESCE(description, '')));


-- Indexes for Scenario Actions
CREATE INDEX idx_scenario_actions_scenario_id ON scenario_actions(scenario_id);
CREATE INDEX idx_scenario_actions_type ON scenario_actions(action_type);
CREATE INDEX idx_scenario_actions_priority ON scenario_actions(priority);
CREATE INDEX idx_scenario_actions_status ON scenario_actions(implementation_status); -- Matches column name
CREATE INDEX idx_scenario_actions_timing ON scenario_actions(timing);
CREATE INDEX idx_scenario_actions_difficulty ON scenario_actions(difficulty_level);
CREATE INDEX idx_scenario_actions_impact ON scenario_actions(expected_impact);
CREATE INDEX idx_scenario_actions_planned_start ON scenario_actions(planned_start_date);
CREATE INDEX idx_scenario_actions_planned_end ON scenario_actions(planned_end_date);
CREATE INDEX idx_scenario_actions_search ON scenario_actions USING gin(to_tsvector('arabic', title || ' ' || COALESCE(description, '')));


-- Indexes for Scenario Outputs
CREATE INDEX idx_scenario_outputs_scenario_id ON scenario_outputs(scenario_id);
CREATE INDEX idx_scenario_outputs_type ON scenario_outputs(output_type);
CREATE INDEX idx_scenario_outputs_priority ON scenario_outputs(priority);
CREATE INDEX idx_scenario_outputs_verification_status ON scenario_outputs(verification_status);
CREATE INDEX idx_scenario_outputs_confidence ON scenario_outputs(confidence_score DESC);
CREATE INDEX idx_scenario_outputs_relevance ON scenario_outputs(relevance_score DESC);
CREATE INDEX idx_scenario_outputs_verified_by ON scenario_outputs(verified_by);
CREATE INDEX idx_scenario_outputs_order ON scenario_outputs(order_index);


-- ========================================
-- 7. الدوال المساعدة والـ Triggers
-- ========================================
-- \echo '⚙️ إنشاء الدوال والـ triggers للسيناريوهات...'

-- Function to generate scenario key
CREATE OR REPLACE FUNCTION generate_scenario_key()
RETURNS TRIGGER AS $$
DECLARE
    scenario_count INTEGER;
BEGIN
    IF NEW.scenario_key IS NULL THEN
        SELECT COUNT(*) + 1 INTO scenario_count FROM scenarios WHERE user_id = NEW.user_id;
        NEW.scenario_key := 'SCEN-' || LPAD(scenario_count::TEXT, 3, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update variables count
CREATE OR REPLACE FUNCTION update_variables_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE scenarios
    SET
        variables_count = (
            SELECT COUNT(*) FROM scenario_variables
            WHERE scenario_id = COALESCE(NEW.scenario_id, OLD.scenario_id)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.scenario_id, OLD.scenario_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate scenario's overall score (Note: This function doesn't actually update the scenario table. It just calculates and returns NEW.)
CREATE OR REPLACE FUNCTION calculate_scenario_score()
RETURNS TRIGGER AS $$
DECLARE
    avg_confidence DECIMAL(4,2);
    avg_feasibility DECIMAL(4,2);
    avg_impact DECIMAL(4,2);
    overall_score DECIMAL(4,2);
BEGIN
    -- Calculate averages
    SELECT
        AVG(confidence_score),
        AVG(feasibility_score),
        AVG(impact_score)
    INTO avg_confidence, avg_feasibility, avg_impact
    FROM scenarios
    WHERE id = NEW.id;

    -- Calculate overall score (equal weight for the three indicators)
    overall_score := COALESCE(
        (COALESCE(avg_confidence, 0) + COALESCE(avg_feasibility, 0) + COALESCE(avg_impact, 0)) / 3.0,
        0
    );

    -- If you intend to update the scenario's confidence_score or other fields based on this,
    -- you need an UPDATE statement here. For example:
    -- NEW.confidence_score := overall_score;
    -- (This would require the trigger to be BEFORE UPDATE/INSERT on scenarios)
    -- Currently, this function calculates but doesn't persist the 'overall_score'
    -- unless it's explicitly assigned to a NEW.* field.

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to search scenarios
CREATE OR REPLACE FUNCTION search_scenarios(
    search_query TEXT,
    user_id_param UUID DEFAULT NULL,
    status_filter scenario_status DEFAULT NULL, -- Use ENUM type
    type_filter scenario_type DEFAULT NULL,     -- Use ENUM type
    risk_filter risk_level DEFAULT NULL         -- Use ENUM type
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    status scenario_status, -- Use ENUM type
    scenario_type scenario_type, -- Use ENUM type
    risk_level risk_level,   -- Use ENUM type
    confidence_score DECIMAL(4,2), -- Use DECIMAL(4,2)
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.title,
        s.description,
        s.status,
        s.scenario_type,
        s.risk_level,
        s.confidence_score,
        s.created_at,
        ts_rank(to_tsvector('arabic', s.title || ' ' || COALESCE(s.description, '')), plainto_tsquery('arabic', search_query)) as rank
    FROM scenarios s
    WHERE
        (user_id_param IS NULL OR s.user_id = user_id_param)
        AND (status_filter IS NULL OR s.status = status_filter)
        AND (type_filter IS NULL OR s.scenario_type = type_filter)
        AND (risk_filter IS NULL OR s.risk_level = risk_filter)
        AND (
            search_query IS NULL OR search_query = '' OR
            to_tsvector('arabic', s.title || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('arabic', search_query)
        )
    ORDER BY rank DESC, s.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get scenario statistics
CREATE OR REPLACE FUNCTION get_scenario_statistics(scenario_id_param UUID)
RETURNS TABLE (
    variables_count INTEGER,
    assumptions_count INTEGER,
    actions_count INTEGER,
    outputs_count INTEGER,
    completed_actions INTEGER,
    pending_actions INTEGER,
    high_risk_factors INTEGER,
    avg_confidence DECIMAL(4,2),
    complexity_score DECIMAL(4,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM scenario_variables WHERE scenario_id = scenario_id_param) as variables_count,
        (SELECT COUNT(*)::INTEGER FROM scenario_assumptions WHERE scenario_id = scenario_id_param) as assumptions_count,
        (SELECT COUNT(*)::INTEGER FROM scenario_actions WHERE scenario_id = scenario_id_param) as actions_count,
        (SELECT COUNT(*)::INTEGER FROM scenario_outputs WHERE scenario_id = scenario_id_param) as outputs_count,
        (SELECT COUNT(*)::INTEGER FROM scenario_actions WHERE scenario_id = scenario_id_param AND implementation_status = 'completed') as completed_actions,
        (SELECT COUNT(*)::INTEGER FROM scenario_actions WHERE scenario_id = scenario_id_param AND implementation_status IN ('planned', 'in_progress')) as pending_actions,
        (SELECT COUNT(*)::INTEGER FROM scenario_assumptions WHERE scenario_id = scenario_id_param AND criticality_level = 'high') as high_risk_factors,
        (SELECT AVG(confidence_level) FROM scenario_assumptions WHERE scenario_id = scenario_id_param) as avg_confidence,
        (SELECT
            CASE
                WHEN (SELECT COUNT(*) FROM scenario_variables WHERE scenario_id = scenario_id_param) = 0 THEN 0
                ELSE LEAST(100, (
                    (SELECT COUNT(*) FROM scenario_variables WHERE scenario_id = scenario_id_param) * 10 +
                    (SELECT COUNT(*) FROM scenario_assumptions WHERE scenario_id = scenario_id_param) * 5 +
                    (SELECT COUNT(*) FROM scenario_actions WHERE scenario_id = scenario_id_param) * 3
                ))
            END
        ) as complexity_score;
END;
$$ LANGUAGE plpgsql;


-- Function to update analysis results
CREATE OR REPLACE FUNCTION update_scenario_analysis(
    scenario_id UUID,
    new_best_case TEXT DEFAULT NULL,
    new_worst_case TEXT DEFAULT NULL,
    new_most_likely TEXT DEFAULT NULL,
    new_pre_mortem TEXT DEFAULT NULL,
    new_confidence_score DECIMAL(4,2) DEFAULT NULL, -- Use DECIMAL(4,2)
    new_risk_level risk_level DEFAULT NULL,         -- Use ENUM type
    new_status scenario_status DEFAULT 'completed'  -- Use ENUM type
)
RETURNS void AS $$
BEGIN
    UPDATE scenarios
    SET
        ai_best_case_scenario = COALESCE(new_best_case, ai_best_case_scenario),
        ai_worst_case_scenario = COALESCE(new_worst_case, ai_worst_case_scenario),
        ai_most_likely_scenario = COALESCE(new_most_likely, ai_most_likely_scenario),
        ai_pre_mortem_analysis = COALESCE(new_pre_mortem, ai_pre_mortem_analysis),
        confidence_score = COALESCE(new_confidence_score, confidence_score),
        risk_level = COALESCE(new_risk_level, risk_level),
        status = new_status,
        analysis_date = CURRENT_TIMESTAMP,
        analysis_version = analysis_version + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = scenario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate overall risk score
CREATE OR REPLACE FUNCTION calculate_scenario_risk_score(scenario_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    risk_score_value DECIMAL := 0;
    risk_level_enum_value risk_level;
    confidence_value DECIMAL;
    impact_value DECIMAL;
BEGIN
    SELECT
        s.risk_level,
        COALESCE(s.confidence_score, 50.0), -- Default to 50 if null
        COALESCE(s.impact_score, 50.0)      -- Default to 50 if null
    INTO risk_level_enum_value, confidence_value, impact_value
    FROM scenarios s
    WHERE s.id = scenario_id;

    -- Map enum risk_level to a numeric value (0.0 to 1.0)
    risk_score_value := CASE risk_level_enum_value
        WHEN 'very_low' THEN 0.1
        WHEN 'low' THEN 0.3
        WHEN 'medium' THEN 0.5
        WHEN 'high' THEN 0.7
        WHEN 'very_high' THEN 0.9
        WHEN 'critical' THEN 1.0
        ELSE 0.5 -- Default for unforeseen cases
    END;

    -- Calculate compound risk score (values are between 0 and 100, normalize for formula)
    risk_score_value := (risk_score_value * (impact_value / 100.0)) / (confidence_value / 100.0);

    RETURN LEAST(risk_score_value, 1.0); -- Cap at 1.0 (or 100 if you want percentage)
END;
$$ LANGUAGE plpgsql;


-- Create triggers
CREATE TRIGGER trigger_generate_scenario_key
    BEFORE INSERT ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION generate_scenario_key();

CREATE TRIGGER trigger_update_scenarios_updated_at
    BEFORE UPDATE ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_scenario_variables_updated_at
    BEFORE UPDATE ON scenario_variables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_scenario_assumptions_updated_at
    BEFORE UPDATE ON scenario_assumptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_scenario_actions_updated_at
    BEFORE UPDATE ON scenario_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_scenario_outputs_updated_at
    BEFORE UPDATE ON scenario_outputs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_variables_count
    AFTER INSERT OR UPDATE OR DELETE ON scenario_variables
    FOR EACH ROW
    EXECUTE FUNCTION update_variables_count();

-- ========================================
-- 8. سياسات الأمان (RLS)
-- ========================================
-- \echo '🔒 تفعيل سياسات الأمان للسيناريوهات...'

-- Enable RLS on tables
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_outputs ENABLE ROW LEVEL SECURITY;

-- Scenario policies
CREATE POLICY "scenarios_owner_access" ON scenarios
    FOR ALL USING (user_id = auth.uid());

-- Allow project collaborators to view scenarios associated with their projects
CREATE POLICY "scenarios_project_collaborator_access" ON scenarios
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_collaborators
            WHERE user_id = auth.uid() AND invitation_status = 'accepted'
        )
    );

-- Allow public read access to scenarios marked as public
CREATE POLICY "scenarios_public_read" ON scenarios
    FOR SELECT USING (is_public = true);

-- Allow shared scenarios to be viewed by the user if is_shared is true
CREATE POLICY "scenarios_shared_read" ON scenarios
    FOR SELECT USING (is_shared = true AND user_id != auth.uid());


-- Policies for Scenario Variables
CREATE POLICY "scenario_variables_owner_access" ON scenario_variables
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM scenarios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "scenario_variables_collaborator_access" ON scenario_variables
    FOR SELECT USING (
        scenario_id IN (
            SELECT s.id FROM scenarios s
            WHERE s.project_id IN (
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            ) OR s.is_public = TRUE OR s.is_shared = TRUE
        )
    );

-- Policies for Scenario Assumptions
CREATE POLICY "scenario_assumptions_owner_access" ON scenario_assumptions
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM scenarios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "scenario_assumptions_collaborator_access" ON scenario_assumptions
    FOR SELECT USING (
        scenario_id IN (
            SELECT s.id FROM scenarios s
            WHERE s.project_id IN (
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            ) OR s.is_public = TRUE OR s.is_shared = TRUE
        )
    );

-- Policies for Scenario Actions
CREATE POLICY "scenario_actions_owner_access" ON scenario_actions
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM scenarios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "scenario_actions_collaborator_access" ON scenario_actions
    FOR ALL USING (
        scenario_id IN (
            SELECT s.id FROM scenarios s
            WHERE s.project_id IN (
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            ) OR s.is_public = TRUE OR s.is_shared = TRUE
        )
    );

-- Policies for Scenario Outputs
CREATE POLICY "scenario_outputs_owner_access" ON scenario_outputs
    FOR ALL USING (
        scenario_id IN (
            SELECT id FROM scenarios WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "scenario_outputs_collaborator_access" ON scenario_outputs
    FOR SELECT USING (
        scenario_id IN (
            SELECT s.id FROM scenarios s
            WHERE s.project_id IN (
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            ) OR s.is_public = TRUE OR s.is_shared = TRUE
        )
    );

-- ========================================
-- 9. Views and Useful Queries
-- ========================================
-- \echo '📊 إنشاء الـ Views للسيناريوهات...'

-- View to display scenarios with additional details
CREATE OR REPLACE VIEW scenarios_with_details AS
SELECT
    s.*,
    u.full_name as owner_name, -- Assuming 'full_name' column exists in 'users' table
    u.email as owner_email,
    p.name as project_name,
    COALESCE(sv.variables_count, 0) as total_variables,
    COALESCE(sa.assumptions_count, 0) as total_assumptions,
    COALESCE(sac.actions_count, 0) as total_actions,
    COALESCE(so.outputs_count, 0) as total_outputs,
    COALESCE(sac.completed_actions, 0) as completed_actions_count,
    CASE
        WHEN s.last_analyzed_at IS NULL THEN 'never'
        WHEN s.last_analyzed_at < CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 'outdated'
        WHEN s.last_analyzed_at < CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 'recent'
        ELSE 'current'
    END as analysis_freshness
FROM scenarios s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN projects p ON s.project_id = p.id
LEFT JOIN (
    SELECT scenario_id, COUNT(*) as variables_count
    FROM scenario_variables
    GROUP BY scenario_id
) sv ON s.id = sv.scenario_id
LEFT JOIN (
    SELECT scenario_id, COUNT(*) as assumptions_count
    FROM scenario_assumptions
    GROUP BY scenario_id
) sa ON s.id = sa.scenario_id
LEFT JOIN (
    SELECT
        scenario_id,
        COUNT(*) as actions_count,
        COUNT(CASE WHEN implementation_status = 'completed' THEN 1 END) as completed_actions
    FROM scenario_actions
    GROUP BY scenario_id
) sac ON s.id = sac.scenario_id
LEFT JOIN (
    SELECT scenario_id, COUNT(*) as outputs_count
    FROM scenario_outputs
    GROUP BY scenario_id
) so ON s.id = so.scenario_id;

-- Final success messages
-- \echo '✅ تم إنشاء جداول السيناريوهات بنجاح!'
-- \echo '🎯 نظام التحليل الذكي للسيناريوهات جاهز'
-- \echo '📊 الفهارس والدوال والسياسات الأمنية تم تطبيقها'

SELECT 'Nexus Scenarios Analysis System schema deployed successfully! ✅' as status;
