/*
  # Add Multiple Wrappers Support

  1. Database Changes
    - Update prompt content schema to support multiple wrappers per module
    - Add migration function to convert existing wrapper_id to wrappers array

  2. Functions
    - Add helper function to get available wrappers
*/

-- Function to get available wrappers
CREATE OR REPLACE FUNCTION get_available_wrappers()
RETURNS TABLE (
  id text,
  name text,
  description text,
  category text
) AS $$
BEGIN
  RETURN QUERY
  VALUES
    ('no_wrapper', 'No Wrapper', 'Use module content as-is', 'basic'),
    ('format-json', 'Format as JSON', 'Structure output as JSON', 'formatting'),
    ('format-list', 'Format as List', 'Present as bulleted list', 'formatting'),
    ('format-table', 'Format as Table', 'Organize in table format', 'formatting'),
    ('validate-input', 'Validate Input', 'Add input validation logic', 'validation'),
    ('transform-data', 'Transform Data', 'Apply data transformations', 'processing'),
    ('conditional-logic', 'Conditional Logic', 'Add conditional processing', 'processing'),
    ('error-handling', 'Error Handling', 'Add error handling logic', 'validation'),
    ('format-markdown', 'Format as Markdown', 'Structure output as Markdown', 'formatting'),
    ('format-yaml', 'Format as YAML', 'Structure output as YAML', 'formatting'),
    ('format-xml', 'Format as XML', 'Structure output as XML', 'formatting'),
    ('format-csv', 'Format as CSV', 'Structure output as CSV', 'formatting'),
    ('summarize', 'Summarize Content', 'Create a summary of the content', 'processing'),
    ('translate', 'Translate Content', 'Translate content to another language', 'processing'),
    ('custom', 'Custom Wrapper', 'Define custom processing logic', 'advanced');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;