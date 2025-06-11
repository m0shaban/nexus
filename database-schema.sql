-- Nexus Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'audio', 'document')),
  ai_summary TEXT,
  ai_questions JSONB,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'error')),
  raw_telegram_message JSONB
);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (temporary for development)
CREATE POLICY "Public read access" ON notes FOR SELECT USING (true);

-- Create policy for public insert access (temporary for development)
CREATE POLICY "Public insert access" ON notes FOR INSERT WITH CHECK (true);

-- Create policy for public update access (temporary for development)
CREATE POLICY "Public update access" ON notes FOR UPDATE USING (true);

-- Enable Realtime for the notes table
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_analysis_status ON notes(analysis_status);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Optional: Add updated_at column if you want to track modifications
-- ALTER TABLE notes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
-- CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
