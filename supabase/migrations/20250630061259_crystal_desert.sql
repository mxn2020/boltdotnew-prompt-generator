/*
  # Initial Database Schema for PromptCraft Platform

  1. New Tables
    - `profiles` - User profile information and preferences
    - `prompts` - Core prompts table with JSONB structure for all prompt types
    - `prompt_files` - File attachments for prompts
    - `prompt_tags` - Tags for categorization and search

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for public prompts

  3. Indexes
    - Full-text search indexes on prompts
    - Performance indexes for common queries
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  github_username text,
  twitter_username text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Prompts table with JSONB structure
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '{}',
  structure_type text NOT NULL CHECK (structure_type IN ('standard', 'structured', 'modulized', 'advanced')),
  category text NOT NULL DEFAULT 'ai',
  type text NOT NULL DEFAULT 'assistant',
  language text NOT NULL DEFAULT 'english',
  complexity text NOT NULL CHECK (complexity IN ('simple', 'medium', 'complex')) DEFAULT 'simple',
  is_public boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  version_major integer DEFAULT 1,
  version_minor integer DEFAULT 0,
  version_batch integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  fork_count integer DEFAULT 0,
  forked_from uuid REFERENCES prompts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prompts"
  ON prompts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public prompts"
  ON prompts
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Prompt files table
CREATE TABLE IF NOT EXISTS prompt_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own prompt files"
  ON prompt_files
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_structure_type ON prompts(structure_type);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_updated_at ON prompts(updated_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_prompts_search ON prompts USING gin(
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Tags search index
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING gin(tags);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();