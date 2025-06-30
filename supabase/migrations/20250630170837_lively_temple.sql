/*
  # Component Editor and Asset System Implementation

  1. Database Changes
    - Add `prompt_type` field to prompts table
    - Add asset-specific fields to prompts table
    - Update component system for standalone editing

  2. New Tables
    - `asset_fields` - Custom fields for different asset types
    - `component_editor_sessions` - Track component editing sessions

  3. Security
    - Update RLS policies for new fields
    - Add policies for asset management

  4. Functions
    - Asset management functions
    - Component editor functions
*/

-- Add prompt_type field to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS prompt_type text NOT NULL DEFAULT 'prompt' 
CHECK (prompt_type IN ('prompt', 'context', 'response_schema', 'response_examples', 'persona', 'instructions', 'constraints', 'examples'));

-- Add asset-specific fields to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS asset_fields jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS asset_metadata jsonb DEFAULT '{}';

-- Create index for prompt_type
CREATE INDEX IF NOT EXISTS idx_prompts_prompt_type ON prompts(prompt_type);

-- Asset fields table for custom field definitions
CREATE TABLE IF NOT EXISTS asset_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL,
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'date', 'url', 'email')),
  field_label text NOT NULL,
  field_description text,
  field_options jsonb DEFAULT '[]',
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(asset_type, field_name)
);

ALTER TABLE asset_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read asset field definitions"
  ON asset_fields
  FOR SELECT
  TO authenticated
  USING (true);

-- Component editor sessions for tracking editing state
CREATE TABLE IF NOT EXISTS component_editor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  session_data jsonb DEFAULT '{}',
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE component_editor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own component editor sessions"
  ON component_editor_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_asset_fields_asset_type ON asset_fields(asset_type);
CREATE INDEX IF NOT EXISTS idx_component_editor_sessions_user_id ON component_editor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_component_editor_sessions_component_id ON component_editor_sessions(component_id);

-- Insert default asset field definitions
INSERT INTO asset_fields (asset_type, field_name, field_type, field_label, field_description, is_required, display_order) VALUES
-- Context asset fields
('context', 'context_type', 'select', 'Context Type', 'Type of context information', true, 1),
('context', 'domain', 'text', 'Domain/Subject', 'The domain or subject area this context applies to', false, 2),
('context', 'scope', 'textarea', 'Scope', 'Define the scope and boundaries of this context', false, 3),
('context', 'background_info', 'textarea', 'Background Information', 'Relevant background information', false, 4),

-- Response Schema asset fields
('response_schema', 'schema_format', 'select', 'Schema Format', 'Format of the response schema', true, 1),
('response_schema', 'required_fields', 'textarea', 'Required Fields', 'List of required fields in the response', false, 2),
('response_schema', 'optional_fields', 'textarea', 'Optional Fields', 'List of optional fields in the response', false, 3),
('response_schema', 'validation_rules', 'textarea', 'Validation Rules', 'Rules for validating the response format', false, 4),

-- Response Examples asset fields
('response_examples', 'example_type', 'select', 'Example Type', 'Type of response example', true, 1),
('response_examples', 'use_case', 'text', 'Use Case', 'Specific use case this example demonstrates', false, 2),
('response_examples', 'input_context', 'textarea', 'Input Context', 'The input or context that leads to this response', false, 3),
('response_examples', 'expected_output', 'textarea', 'Expected Output', 'The expected response output', true, 4),

-- Persona asset fields
('persona', 'persona_name', 'text', 'Persona Name', 'Name or title of the persona', true, 1),
('persona', 'role', 'text', 'Role/Position', 'Professional role or position', false, 2),
('persona', 'expertise', 'textarea', 'Areas of Expertise', 'Key areas of knowledge and expertise', false, 3),
('persona', 'communication_style', 'select', 'Communication Style', 'How this persona communicates', false, 4),
('persona', 'personality_traits', 'textarea', 'Personality Traits', 'Key personality characteristics', false, 5),

-- Instructions asset fields
('instructions', 'instruction_type', 'select', 'Instruction Type', 'Type of instruction set', true, 1),
('instructions', 'priority_level', 'select', 'Priority Level', 'Priority level of these instructions', false, 2),
('instructions', 'prerequisites', 'textarea', 'Prerequisites', 'What needs to be known or done before following these instructions', false, 3),
('instructions', 'success_criteria', 'textarea', 'Success Criteria', 'How to determine if instructions were followed successfully', false, 4),

-- Constraints asset fields
('constraints', 'constraint_type', 'select', 'Constraint Type', 'Type of constraint', true, 1),
('constraints', 'severity', 'select', 'Severity', 'How strict this constraint is', false, 2),
('constraints', 'scope', 'text', 'Scope', 'What this constraint applies to', false, 3),
('constraints', 'exceptions', 'textarea', 'Exceptions', 'When this constraint might not apply', false, 4),

-- Examples asset fields
('examples', 'example_category', 'select', 'Example Category', 'Category of example', true, 1),
('examples', 'difficulty_level', 'select', 'Difficulty Level', 'Complexity level of this example', false, 2),
('examples', 'input_data', 'textarea', 'Input Data', 'Input data for the example', false, 3),
('examples', 'expected_result', 'textarea', 'Expected Result', 'Expected output or result', true, 4);

-- Insert field options for select fields
UPDATE asset_fields SET field_options = '["background", "domain_knowledge", "historical", "technical", "business"]'::jsonb 
WHERE field_name = 'context_type';

UPDATE asset_fields SET field_options = '["json", "xml", "yaml", "typescript", "openapi"]'::jsonb 
WHERE field_name = 'schema_format';

UPDATE asset_fields SET field_options = '["success", "error", "edge_case", "typical", "complex"]'::jsonb 
WHERE field_name = 'example_type';

UPDATE asset_fields SET field_options = '["formal", "casual", "technical", "friendly", "authoritative"]'::jsonb 
WHERE field_name = 'communication_style';

UPDATE asset_fields SET field_options = '["task", "behavioral", "formatting", "content", "process"]'::jsonb 
WHERE field_name = 'instruction_type';

UPDATE asset_fields SET field_options = '["high", "medium", "low"]'::jsonb 
WHERE field_name = 'priority_level';

UPDATE asset_fields SET field_options = '["hard", "soft", "preference", "requirement"]'::jsonb 
WHERE field_name = 'constraint_type';

UPDATE asset_fields SET field_options = '["strict", "flexible", "guideline"]'::jsonb 
WHERE field_name = 'severity';

UPDATE asset_fields SET field_options = '["basic", "intermediate", "advanced", "expert"]'::jsonb 
WHERE field_name = 'difficulty_level';

UPDATE asset_fields SET field_options = '["code", "text", "data", "scenario", "workflow"]'::jsonb 
WHERE field_name = 'example_category';

-- Function to get asset field definitions
CREATE OR REPLACE FUNCTION get_asset_fields(asset_type_param text)
RETURNS TABLE (
  field_name text,
  field_type text,
  field_label text,
  field_description text,
  field_options jsonb,
  is_required boolean,
  display_order integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    af.field_name,
    af.field_type,
    af.field_label,
    af.field_description,
    af.field_options,
    af.is_required,
    af.display_order
  FROM asset_fields af
  WHERE af.asset_type = asset_type_param
  ORDER BY af.display_order, af.field_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create asset with custom fields
CREATE OR REPLACE FUNCTION create_asset(
  asset_title text,
  asset_description text,
  asset_type_param text,
  asset_content jsonb,
  asset_fields_data jsonb DEFAULT '{}',
  asset_category text DEFAULT 'general',
  asset_language text DEFAULT 'english',
  asset_complexity text DEFAULT 'simple',
  asset_tags text[] DEFAULT '{}',
  asset_is_public boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  asset_id uuid;
BEGIN
  INSERT INTO prompts (
    user_id,
    title,
    description,
    content,
    prompt_type,
    structure_type,
    category,
    type,
    language,
    complexity,
    tags,
    is_public,
    asset_fields,
    asset_metadata
  ) VALUES (
    auth.uid(),
    asset_title,
    asset_description,
    asset_content,
    asset_type_param,
    'standard', -- Default structure for assets
    asset_category,
    'asset',
    asset_language,
    asset_complexity,
    asset_tags,
    asset_is_public,
    asset_fields_data,
    jsonb_build_object('asset_type', asset_type_param)
  ) RETURNING id INTO asset_id;
  
  RETURN asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save component editor session
CREATE OR REPLACE FUNCTION save_component_editor_session(
  component_uuid uuid,
  session_data_param jsonb
)
RETURNS uuid AS $$
DECLARE
  session_id uuid;
BEGIN
  INSERT INTO component_editor_sessions (
    user_id,
    component_id,
    session_data,
    last_activity
  ) VALUES (
    auth.uid(),
    component_uuid,
    session_data_param,
    now()
  ) 
  ON CONFLICT (user_id, component_id) 
  DO UPDATE SET 
    session_data = session_data_param,
    last_activity = now()
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get component editor session
CREATE OR REPLACE FUNCTION get_component_editor_session(component_uuid uuid)
RETURNS TABLE (
  id uuid,
  session_data jsonb,
  last_activity timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ces.id,
    ces.session_data,
    ces.last_activity
  FROM component_editor_sessions ces
  WHERE ces.component_id = component_uuid
    AND ces.user_id = auth.uid()
  ORDER BY ces.last_activity DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;