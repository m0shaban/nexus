export interface Note {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  content: string
  content_type: string
  title: string | null
  excerpt: string | null
  word_count: number
  ai_summary: string | null
  ai_questions: string[] | null
  ai_tags: string[] | null
  ai_sentiment: Record<string, unknown> | null
  ai_key_points: string[] | null
  ai_action_items: string[] | null
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'error'
  analysis_model_used: string | null
  analysis_tokens_used: number | null
  analysis_confidence_score: number | null
  telegram_message_id: number | null
  telegram_chat_id: number | null
  telegram_message_date: string | null
  raw_telegram_message: Record<string, unknown> | null
  category: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  custom_tags: string[] | null
  keywords: string[] | null
  is_archived: boolean
  is_favorite: boolean
  is_processed: boolean
  is_encrypted: boolean
  note_date: string
  reminder_date: string | null
  archived_at: string | null
}

export interface Project {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  note_id: string | null
  name: string
  description: string | null
  objectives: string | null
  project_key: string | null
  status: 'planning' | 'active' | 'completed' | 'abandoned' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress_percentage: number
  total_tasks_count: number
  completed_tasks_count: number
  active_tasks_count: number
  overdue_tasks_count: number
  start_date: string | null
  due_date: string | null
  actual_start_date: string | null
  actual_end_date: string | null
  completed_at: string | null
  estimated_budget: number | null
  actual_cost: number | null
  budget_currency: string
  category: string | null
  tags: string[] | null
  is_template: boolean
  is_public: boolean
  is_favorite: boolean
  is_archived: boolean
  archived_at: string | null
  metadata: Record<string, unknown>
  notes: string | null
  collaborators_count: number
}

export interface Task {
  id: string
  created_at: string
  updated_at: string
  project_id: string | null
  parent_task_id: string | null
  assigned_to: string | null
  created_by: string | null
  title: string
  description: string | null
  content: string | null
  task_key: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress_percentage: number
  estimated_hours: number | null
  actual_hours: number | null
  story_points: number | null
  order_index: number
  depth_level: number
  position: number
  due_date: string | null
  started_at: string | null
  completed_at: string | null
  category: string | null
  tags: string[] | null
  is_milestone: boolean
  is_recurring: boolean
  recurrence_pattern: Record<string, unknown> | null
  is_blocked: boolean
  blocked_reason: string | null
  metadata: Record<string, unknown>
}

export interface Streak {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  project_id: string | null
  note_id: string | null
  name: string
  description: string | null
  goal_description: string | null
  streak_key: string | null
  streak_type: 'habit' | 'goal'  // فقط القيم المدعومة في enum
  category: string | null
  target_frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  custom_frequency_days: number | null
  minimum_duration_minutes: number
  maximum_duration_minutes: number | null
  flexible_timing: boolean
  reminder_time: string | null
  reminder_days: unknown[] | null  // jsonb array
  reminder_enabled: boolean
  current_streak: number
  longest_streak: number
  total_completions: number
  total_days_tracked: number
  total_time_spent_minutes: number
  perfect_weeks: number
  perfect_months: number
  recovery_count: number
  best_recovery_streak: number
  last_activity_date: string | null  // date
  last_completion_date: string | null  // date
  last_missed_date: string | null  // date
  streak_start_date: string | null  // date
  longest_streak_start_date: string | null  // date
  longest_streak_end_date: string | null  // date
  next_due_date: string | null  // date
  completion_rate: number  // numeric with default 0.00
  current_week_rate: number  // numeric with default 0.00
  current_month_rate: number  // numeric with default 0.00
  last_30_days_rate: number  // numeric with default 0.00
  target_streak: number | null
  target_completion_date: string | null  // date
  reward_description: string | null
  motivation_message: string | null
  points_per_completion: number
  bonus_points_threshold: number
  bonus_points_amount: number
  total_points_earned: number
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  is_private: boolean
  is_archived: boolean
  archived_at: string | null
  challenge_mode: boolean
  challenge_description: string | null
  challenge_multiplier: number
  tags: unknown[] | null  // jsonb array
  metadata: Record<string, unknown>  // jsonb
  custom_fields: Record<string, unknown>  // jsonb
  notification_settings: Record<string, unknown>  // jsonb
}

export interface TelegramMessage {
  message_id: number
  from: {
    id: number
    is_bot: boolean
    first_name: string
    username?: string
  }
  chat: {
    id: number
    type: string  }
  date: number
  text?: string
  photo?: Array<Record<string, unknown>>
  document?: Record<string, unknown>
  voice?: Record<string, unknown>
}

export interface Scenario {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  project_id: string | null
  note_id: string | null
  title: string
  description: string
  context: string | null
  scenario_key: string | null
  initial_situation: string | null
  key_stakeholders: string[] | null
  external_factors: string[] | null
  constraints_limitations: string[] | null
  variables_count: number
  time_horizon: 'immediate' | 'short_term' | 'medium_term' | 'long_term' | 'indefinite'
  ai_analysis_status: 'pending' | 'analyzing' | 'completed' | 'error'
  ai_best_case_scenario: string | null
  ai_worst_case_scenario: string | null
  ai_most_likely_scenario: string | null
  ai_black_swan_events: string[] | null
  ai_pre_mortem_analysis: string | null
  ai_post_mortem_lessons: string[] | null
  ai_mitigation_strategies: string[] | null
  ai_contingency_plans: string[] | null
  ai_opportunities: string[] | null
  ai_threats: string[] | null
  ai_recommendations: string | null
  confidence_score: number | null
  risk_level: 'low' | 'medium' | 'high' | 'critical' | null
  impact_score: number | null
  feasibility_score: number | null
  innovation_score: number | null
  sustainability_score: number | null
  status: 'draft' | 'active' | 'completed' | 'archived'
  processing_status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  analysis_version: number
  analysis_iterations: number
  category: string | null
  scenario_type: 'general' | 'business' | 'technical' | 'risk' | 'opportunity'
  methodology: 'swot' | 'pestle' | 'scenario_planning' | 'monte_carlo' | 'delphi' | 'cross_impact' | 'morphological'
  tags: string[] | null
  metadata: Record<string, unknown>
  ai_model: string
  ai_temperature: number
  ai_max_tokens: number
  ai_prompt_template: string | null
  is_template: boolean
  is_public: boolean
  is_favorite: boolean
  is_archived: boolean
  is_shared: boolean
  archived_at: string | null
  views_count: number
  analysis_duration: string | null
  last_analyzed_at: string | null
  analysis_date: string | null
}

export interface JournalEntry {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  date: string // YYYY-MM-DD format for the journal entry date
  content: string
  mood_rating: number | null // 1-10 scale
  energy_level: number | null // 1-10 scale
  stress_level: number | null // 1-10 scale
  ai_reflection: string | null
  ai_insights: string[] | null
  ai_mood_analysis: {
    dominant_emotion: string
    confidence: number
    themes: string[]
    growth_areas: string[]
  } | null
  tags: string[] | null
  is_private: boolean
  reflection_status: 'pending' | 'analyzing' | 'completed' | 'error'
}

export interface JournalPrompt {
  id: string
  created_at: string
  user_id: string | null
  question: string
  category: 'reflection' | 'gratitude' | 'goals' | 'emotions' | 'relationships' | 'growth'
  is_active: boolean
  order_index: number
}

export interface MoodTrend {
  id: string
  created_at: string
  user_id: string | null
  date: string
  overall_mood: number
  energy_level: number
  stress_level: number
  notes: string | null
}

// ===================================================================
// THE LOGOS AI CHATBOT INTERFACES
// ===================================================================

export interface LogosConversation {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  title: string
  context_data: Record<string, unknown>
  is_active: boolean
  conversation_type: 'general' | 'strategic' | 'analysis' | 'debugging' | 'planning'
  priority_level: 'low' | 'normal' | 'high' | 'critical'
}

export interface LogosMessage {
  id: string
  created_at: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown>
  tokens_used: number | null
  processing_time_ms: number | null
  model_used: string | null
  confidence_score: number | null
  referenced_notes: string[] | null
  referenced_projects: string[] | null
  referenced_scenarios: string[] | null
  referenced_journal_entries: string[] | null
}

export interface LogosKnowledgeBase {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  title: string
  content: string
  source_file: string | null
  category: 'books' | 'methodologies' | 'frameworks' | 'technical' | 'strategic' | 'personal'
  tags: string[] | null
  is_active: boolean
  importance_score: number | null
  structured_data: Record<string, unknown>
  embeddings_vector: number[] | null
}

export interface LogosUserPreferences {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  analysis_depth: 'quick' | 'standard' | 'comprehensive' | 'deep'
  response_style: 'casual' | 'professional' | 'strategic' | 'analytical'
  challenge_level: 'low' | 'medium' | 'high' | 'maximum'
  auto_context_from_notes: boolean
  auto_context_from_projects: boolean
  auto_context_from_journal: boolean
  auto_context_from_scenarios: boolean
  show_thinking_process: boolean
  show_confidence_scores: boolean
  preferred_language: 'ar' | 'en' | 'mixed'
  enable_proactive_suggestions: boolean
  enable_strategic_challenges: boolean
  enable_cross_module_analysis: boolean
}

export interface LogosConversationAnalytics {
  user_id: string
  conversation_type: string
  total_conversations: number
  avg_messages_per_conversation: number
  last_activity: string
  total_tokens_used: number
}

export interface LogosKnowledgeAnalytics {
  user_id: string
  category: string
  total_items: number
  avg_importance: number
  total_content_length: number
  unique_tags: number
}

export interface User {
  id: string
  created_at: string
  updated_at: string
  email: string
  name: string
  avatar_url: string | null
  bio: string | null
  timezone: string
  language: 'ar' | 'en'
  theme: string
  telegram_user_id: number | null
  telegram_username: string | null
  telegram_chat_id: number | null
  telegram_notifications_enabled: boolean
  subscription_type: string
  subscription_expires_at: string | null
  monthly_notes_limit: number
  monthly_ai_requests_limit: number
  monthly_notes_count: number
  monthly_ai_requests_count: number
  last_reset_date: string
  auto_analyze_notes: boolean
  email_notifications_enabled: boolean
  weekly_summary_enabled: boolean
  is_active: boolean
  is_verified: boolean
  last_login_at: string | null
  full_name: string | null
}

export interface MirrorEntry {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  entry_date: string
  title: string | null
  content: string
  entry_type: 'daily_reflection' | 'weekly_review' | 'monthly_review' | 'goal_tracking' | 'mood_log' | 'gratitude' | 'learning' | 'custom'
  mood_rating: number | null
  energy_level: number | null
  stress_level: number | null
  productivity_rating: number | null
  satisfaction_rating: number | null
  emotions: string[] | null
  primary_emotion: string | null
  emotional_intensity: number | null
  goals_worked_on: string[] | null
  achievements: string | null
  challenges_faced: string | null
  lessons_learned: string | null
  tomorrow_priorities: string[] | null
  week_goals: string | null
  month_goals: string | null
  gratitude_items: string[] | null
  positive_moments: string | null
  people_to_thank: string[] | null
  ai_analysis: string | null
  ai_insights: string[] | null
  ai_suggestions: string[] | null
  ai_mood_analysis: Record<string, unknown>
  ai_pattern_detection: Record<string, unknown>
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'error'
  is_private: boolean
  is_favorite: boolean
  tags: string[] | null
  categories: string[] | null
  weather: string | null
  location: string | null
  custom_fields: Record<string, unknown>
  attachments: string[] | null
  voice_note_url: string | null
}

export interface Logo {
  id: string
  created_at: string
  updated_at: string
  user_id: string | null
  name: string
  description: string | null
  brand_name: string | null
  company_name: string | null
  file_url: string
  file_name: string | null
  file_type: string | null
  file_size: number | null
  original_filename: string | null
  width: number | null
  height: number | null
  resolution_dpi: number | null
  color_mode: 'RGB' | 'CMYK' | 'Grayscale' | 'Monochrome' | null
  has_transparency: boolean
  logo_type: 'logo' | 'wordmark' | 'lettermark' | 'pictorial' | 'abstract' | 'mascot' | 'combination' | 'emblem'
  industry: string | null
  style: string | null
  primary_colors: string[] | null
  color_palette: string[] | null
  dominant_color: string | null
  usage_guidelines: string | null
  recommended_sizes: string[] | null
  usage_contexts: string[] | null
  status: 'draft' | 'active' | 'archived' | 'deprecated'
  visibility: 'private' | 'public' | 'shared'
  is_template: boolean
  is_favorite: boolean
  quality_score: number | null
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  review_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  ai_analysis: Record<string, unknown>
  design_elements: string[] | null
  typography_info: Record<string, unknown>
  similarity_score: number | null
  tags: string[] | null
  keywords: string[] | null
  categories: string[] | null
  creation_method: 'manual_upload' | 'ai_generated' | 'imported' | 'designed' | null
  design_brief: string | null
  client_requirements: string | null
  design_iterations: number
  license_type: string
  copyright_info: string | null
  attribution_required: boolean
  commercial_use_allowed: boolean
  download_count: number
  view_count: number
  like_count: number
}
