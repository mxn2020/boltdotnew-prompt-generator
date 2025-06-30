/*
  # Database Functions for PromptVerse Platform

  1. Functions
    - `increment_version_batch` - Auto-increment batch version on prompt updates
    - `increment_fork_count` - Increment fork count when prompt is cloned
    - `search_prompts` - Full-text search function for prompts

  2. Triggers
    - Auto-update version batch on prompt updates
*/

-- Function to increment version batch
CREATE OR REPLACE FUNCTION increment_version_batch(prompt_id uuid)
RETURNS integer AS $$
DECLARE
  new_batch integer;
BEGIN
  UPDATE prompts 
  SET version_batch = version_batch + 1
  WHERE id = prompt_id
  RETURNING version_batch INTO new_batch;
  
  RETURN new_batch;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment fork count
CREATE OR REPLACE FUNCTION increment_fork_count(prompt_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE prompts 
  SET fork_count = fork_count + 1
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(prompt_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE prompts 
  SET view_count = view_count + 1
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for advanced prompt search
CREATE OR REPLACE FUNCTION search_prompts(
  search_query text DEFAULT NULL,
  user_filter uuid DEFAULT NULL,
  category_filter text DEFAULT NULL,
  structure_filter text DEFAULT NULL,
  complexity_filter text DEFAULT NULL,
  public_only boolean DEFAULT false,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  content jsonb,
  structure_type text,
  category text,
  type text,
  language text,
  complexity text,
  is_public boolean,
  is_featured boolean,
  version_major integer,
  version_minor integer,
  version_batch integer,
  tags text[],
  view_count integer,
  like_count integer,
  fork_count integer,
  forked_from uuid,
  created_at timestamptz,
  updated_at timestamptz,
  search_rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.title,
    p.description,
    p.content,
    p.structure_type,
    p.category,
    p.type,
    p.language,
    p.complexity,
    p.is_public,
    p.is_featured,
    p.version_major,
    p.version_minor,
    p.version_batch,
    p.tags,
    p.view_count,
    p.like_count,
    p.fork_count,
    p.forked_from,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', search_query))
      ELSE 0
    END as search_rank
  FROM prompts p
  WHERE 
    (search_query IS NULL OR to_tsvector('english', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_query))
    AND (user_filter IS NULL OR p.user_id = user_filter)
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (structure_filter IS NULL OR p.structure_type = structure_filter)
    AND (complexity_filter IS NULL OR p.complexity = complexity_filter)
    AND (NOT public_only OR p.is_public = true)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN search_rank END DESC,
    p.updated_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;