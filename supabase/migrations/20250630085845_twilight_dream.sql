/*
  # Version Control and Export System Tables

  1. New Tables
    - `prompt_versions` - Complete version history for prompts
    - `export_logs` - Track export operations and formats
    - `version_comparisons` - Cache version comparison results

  2. Security
    - Enable RLS on all new tables
    - Add policies for users to manage their own data

  3. Functions
    - Version management functions
    - Export tracking functions
*/

-- Prompt versions table for complete version history
CREATE TABLE IF NOT EXISTS prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  version_major integer NOT NULL DEFAULT 1,
  version_minor integer NOT NULL DEFAULT 0,
  version_batch integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '{}',
  structure_type text NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  language text NOT NULL,
  complexity text NOT NULL,
  tags text[] DEFAULT '{}',
  changelog text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL
);

ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read versions of their prompts"
  ON prompt_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their prompts"
  ON prompt_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts 
      WHERE prompts.id = prompt_versions.prompt_id 
      AND prompts.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

-- Export logs table for tracking export operations
CREATE TABLE IF NOT EXISTS export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  format text NOT NULL,
  options jsonb DEFAULT '{}',
  filename text NOT NULL,
  file_size integer NOT NULL,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own export logs"
  ON export_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export logs"
  ON export_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Version comparisons cache table
CREATE TABLE IF NOT EXISTS version_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_version_id uuid REFERENCES prompt_versions(id) ON DELETE CASCADE NOT NULL,
  to_version_id uuid REFERENCES prompt_versions(id) ON DELETE CASCADE NOT NULL,
  changes jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_version_id, to_version_id)
);

ALTER TABLE version_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read version comparisons for their prompts"
  ON version_comparisons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompt_versions pv1
      JOIN prompts p ON p.id = pv1.prompt_id
      WHERE pv1.id = version_comparisons.from_version_id
      AND p.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_version ON prompt_versions(prompt_id, version_major DESC, version_minor DESC, version_batch DESC);
CREATE INDEX IF NOT EXISTS idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_prompt_id ON export_logs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_version_comparisons_versions ON version_comparisons(from_version_id, to_version_id);

-- Function to get version history for a prompt
CREATE OR REPLACE FUNCTION get_prompt_versions(prompt_uuid uuid)
RETURNS TABLE (
  id uuid,
  prompt_id uuid,
  version_major integer,
  version_minor integer,
  version_batch integer,
  title text,
  description text,
  content jsonb,
  structure_type text,
  category text,
  type text,
  language text,
  complexity text,
  tags text[],
  changelog text,
  created_at timestamptz,
  created_by uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id,
    pv.prompt_id,
    pv.version_major,
    pv.version_minor,
    pv.version_batch,
    pv.title,
    pv.description,
    pv.content,
    pv.structure_type,
    pv.category,
    pv.type,
    pv.language,
    pv.complexity,
    pv.tags,
    pv.changelog,
    pv.created_at,
    pv.created_by
  FROM prompt_versions pv
  WHERE pv.prompt_id = prompt_uuid
  ORDER BY pv.version_major DESC, pv.version_minor DESC, pv.version_batch DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log export operations
CREATE OR REPLACE FUNCTION log_export_operation(
  prompt_uuid uuid,
  export_format text,
  export_options jsonb,
  export_filename text,
  export_file_size integer,
  export_success boolean DEFAULT true,
  export_error text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO export_logs (
    prompt_id,
    user_id,
    format,
    options,
    filename,
    file_size,
    success,
    error_message
  ) VALUES (
    prompt_uuid,
    auth.uid(),
    export_format,
    export_options,
    export_filename,
    export_file_size,
    export_success,
    export_error
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get export statistics
CREATE OR REPLACE FUNCTION get_export_stats(prompt_uuid uuid DEFAULT NULL)
RETURNS TABLE (
  format text,
  export_count bigint,
  success_rate numeric,
  total_size bigint,
  last_export timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    el.format,
    COUNT(*) as export_count,
    ROUND(
      (COUNT(*) FILTER (WHERE el.success = true)::numeric / COUNT(*)::numeric) * 100, 
      2
    ) as success_rate,
    SUM(el.file_size) as total_size,
    MAX(el.created_at) as last_export
  FROM export_logs el
  WHERE (prompt_uuid IS NULL OR el.prompt_id = prompt_uuid)
    AND el.user_id = auth.uid()
  GROUP BY el.format
  ORDER BY export_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;