-- Add 'custom' to complexity constraint for prompts table
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_complexity_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_complexity_check 
  CHECK (complexity IN ('simple', 'medium', 'complex', 'custom'));

-- Update default complexity for new user-created prompts to 'custom'
-- Existing prompts keep their current complexity values
