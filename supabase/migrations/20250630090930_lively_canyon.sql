/*
  # Community Functions for PromptVerse Platform

  1. Functions
    - Community interaction functions (like, rate, follow)
    - Collection management functions
    - Analytics tracking functions
    - Team management functions
    - Trending and recommendation functions

  2. Triggers
    - Auto-update counters and statistics
    - Analytics event triggers
*/

-- Function to like/unlike a prompt
CREATE OR REPLACE FUNCTION toggle_prompt_like(prompt_uuid uuid)
RETURNS boolean AS $$
DECLARE
  like_exists boolean;
  new_like_count integer;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM prompt_likes 
    WHERE prompt_id = prompt_uuid AND user_id = auth.uid()
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM prompt_likes 
    WHERE prompt_id = prompt_uuid AND user_id = auth.uid();
    
    -- Update like count
    UPDATE prompts 
    SET like_count = like_count - 1
    WHERE id = prompt_uuid
    RETURNING like_count INTO new_like_count;
    
    RETURN false;
  ELSE
    -- Add like
    INSERT INTO prompt_likes (prompt_id, user_id)
    VALUES (prompt_uuid, auth.uid());
    
    -- Update like count
    UPDATE prompts 
    SET like_count = like_count + 1
    WHERE id = prompt_uuid
    RETURNING like_count INTO new_like_count;
    
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rate a prompt
CREATE OR REPLACE FUNCTION rate_prompt(
  prompt_uuid uuid,
  rating_value integer,
  review_text text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  old_rating integer;
  prompt_rating_count integer;
  prompt_rating_sum integer;
  new_average numeric;
BEGIN
  -- Get existing rating if any
  SELECT rating INTO old_rating
  FROM prompt_ratings
  WHERE prompt_id = prompt_uuid AND user_id = auth.uid();
  
  -- Insert or update rating
  INSERT INTO prompt_ratings (prompt_id, user_id, rating, review)
  VALUES (prompt_uuid, auth.uid(), rating_value, review_text)
  ON CONFLICT (prompt_id, user_id)
  DO UPDATE SET 
    rating = rating_value,
    review = review_text,
    updated_at = now();
  
  -- Recalculate average rating
  SELECT COUNT(*), SUM(rating)
  INTO prompt_rating_count, prompt_rating_sum
  FROM prompt_ratings
  WHERE prompt_id = prompt_uuid;
  
  new_average := ROUND(prompt_rating_sum::numeric / prompt_rating_count::numeric, 2);
  
  -- Update prompt with new average (we'll add this column)
  -- For now, we'll store it in a JSONB field
  UPDATE prompts
  SET content = jsonb_set(
    COALESCE(content, '{}'),
    '{rating_average}',
    to_jsonb(new_average)
  )
  WHERE id = prompt_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add prompt to collection
CREATE OR REPLACE FUNCTION add_to_collection(
  collection_uuid uuid,
  prompt_uuid uuid
)
RETURNS boolean AS $$
DECLARE
  collection_owner uuid;
  item_exists boolean;
BEGIN
  -- Check if user owns the collection
  SELECT user_id INTO collection_owner
  FROM collections
  WHERE id = collection_uuid;
  
  IF collection_owner != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to modify this collection';
  END IF;
  
  -- Check if item already exists
  SELECT EXISTS(
    SELECT 1 FROM collection_items
    WHERE collection_id = collection_uuid AND prompt_id = prompt_uuid
  ) INTO item_exists;
  
  IF item_exists THEN
    RETURN false;
  END IF;
  
  -- Add item to collection
  INSERT INTO collection_items (collection_id, prompt_id, added_by)
  VALUES (collection_uuid, prompt_uuid, auth.uid());
  
  -- Update collection prompt count
  UPDATE collections
  SET prompt_count = prompt_count + 1
  WHERE id = collection_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove prompt from collection
CREATE OR REPLACE FUNCTION remove_from_collection(
  collection_uuid uuid,
  prompt_uuid uuid
)
RETURNS boolean AS $$
DECLARE
  collection_owner uuid;
  item_exists boolean;
BEGIN
  -- Check if user owns the collection
  SELECT user_id INTO collection_owner
  FROM collections
  WHERE id = collection_uuid;
  
  IF collection_owner != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to modify this collection';
  END IF;
  
  -- Check if item exists
  SELECT EXISTS(
    SELECT 1 FROM collection_items
    WHERE collection_id = collection_uuid AND prompt_id = prompt_uuid
  ) INTO item_exists;
  
  IF NOT item_exists THEN
    RETURN false;
  END IF;
  
  -- Remove item from collection
  DELETE FROM collection_items
  WHERE collection_id = collection_uuid AND prompt_id = prompt_uuid;
  
  -- Update collection prompt count
  UPDATE collections
  SET prompt_count = prompt_count - 1
  WHERE id = collection_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending prompts
CREATE OR REPLACE FUNCTION get_trending_prompts(
  time_period interval DEFAULT '7 days',
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  structure_type text,
  category text,
  complexity text,
  tags text[],
  view_count integer,
  like_count integer,
  fork_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  trend_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.structure_type,
    p.category,
    p.complexity,
    p.tags,
    p.view_count,
    p.like_count,
    p.fork_count,
    p.created_at,
    p.updated_at,
    -- Calculate trend score based on recent activity
    (
      COALESCE(p.like_count, 0) * 3 +
      COALESCE(p.fork_count, 0) * 5 +
      COALESCE(p.view_count, 0) * 1 +
      -- Boost for recent creation
      CASE 
        WHEN p.created_at > now() - time_period THEN 10
        ELSE 0
      END
    )::numeric / GREATEST(EXTRACT(EPOCH FROM (now() - p.created_at)) / 86400, 1) as trend_score
  FROM prompts p
  WHERE p.is_public = true
    AND p.created_at > now() - time_period * 2  -- Look at 2x the period for context
  ORDER BY trend_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recommended prompts for a user
CREATE OR REPLACE FUNCTION get_recommended_prompts(
  target_user_id uuid DEFAULT NULL,
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  structure_type text,
  category text,
  complexity text,
  tags text[],
  view_count integer,
  like_count integer,
  fork_count integer,
  created_at timestamptz,
  recommendation_score numeric
) AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := COALESCE(target_user_id, auth.uid());
  
  RETURN QUERY
  WITH user_preferences AS (
    -- Get user's preferred categories and tags from their liked prompts
    SELECT 
      p.category,
      unnest(p.tags) as tag
    FROM prompts p
    JOIN prompt_likes pl ON pl.prompt_id = p.id
    WHERE pl.user_id = user_uuid
  ),
  category_scores AS (
    SELECT category, COUNT(*) as score
    FROM user_preferences
    GROUP BY category
  ),
  tag_scores AS (
    SELECT tag, COUNT(*) as score
    FROM user_preferences
    GROUP BY tag
  )
  SELECT 
    p.id,
    p.title,
    p.description,
    p.structure_type,
    p.category,
    p.complexity,
    p.tags,
    p.view_count,
    p.like_count,
    p.fork_count,
    p.created_at,
    -- Calculate recommendation score
    (
      COALESCE(cs.score, 0) * 2 +  -- Category match
      (
        SELECT COALESCE(SUM(ts.score), 0)
        FROM tag_scores ts
        WHERE ts.tag = ANY(p.tags)
      ) +  -- Tag matches
      p.like_count * 0.1 +  -- General popularity
      CASE WHEN p.created_at > now() - interval '30 days' THEN 1 ELSE 0 END  -- Recency boost
    )::numeric as recommendation_score
  FROM prompts p
  LEFT JOIN category_scores cs ON cs.category = p.category
  WHERE p.is_public = true
    AND p.user_id != user_uuid  -- Don't recommend user's own prompts
    AND NOT EXISTS (
      SELECT 1 FROM prompt_likes pl
      WHERE pl.prompt_id = p.id AND pl.user_id = user_uuid
    )  -- Don't recommend already liked prompts
  ORDER BY recommendation_score DESC, p.like_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track analytics events
CREATE OR REPLACE FUNCTION track_analytics_event(
  event_type_param text,
  event_data_param jsonb DEFAULT '{}',
  prompt_id_param uuid DEFAULT NULL,
  collection_id_param uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO analytics_events (
    user_id,
    event_type,
    event_data,
    prompt_id,
    collection_id,
    session_id,
    created_at
  ) VALUES (
    auth.uid(),
    event_type_param,
    event_data_param,
    prompt_id_param,
    collection_id_param,
    current_setting('app.session_id', true),
    now()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics dashboard
CREATE OR REPLACE FUNCTION get_user_analytics(
  target_user_id uuid DEFAULT NULL,
  time_period interval DEFAULT '30 days'
)
RETURNS TABLE (
  total_prompts bigint,
  total_views bigint,
  total_likes bigint,
  total_forks bigint,
  total_collections bigint,
  avg_rating numeric,
  recent_activity jsonb
) AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := COALESCE(target_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM prompts WHERE user_id = user_uuid)::bigint as total_prompts,
    (SELECT COALESCE(SUM(view_count), 0) FROM prompts WHERE user_id = user_uuid)::bigint as total_views,
    (SELECT COALESCE(SUM(like_count), 0) FROM prompts WHERE user_id = user_uuid)::bigint as total_likes,
    (SELECT COALESCE(SUM(fork_count), 0) FROM prompts WHERE user_id = user_uuid)::bigint as total_forks,
    (SELECT COUNT(*) FROM collections WHERE user_id = user_uuid)::bigint as total_collections,
    (
      SELECT COALESCE(AVG(pr.rating), 0)
      FROM prompt_ratings pr
      JOIN prompts p ON p.id = pr.prompt_id
      WHERE p.user_id = user_uuid
    )::numeric as avg_rating,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date_trunc('day', ae.created_at),
          'event_type', ae.event_type,
          'count', COUNT(*)
        )
      )
      FROM analytics_events ae
      WHERE ae.user_id = user_uuid
        AND ae.created_at > now() - time_period
      GROUP BY date_trunc('day', ae.created_at), ae.event_type
      ORDER BY date_trunc('day', ae.created_at) DESC
    ) as recent_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a team
CREATE OR REPLACE FUNCTION create_team(
  team_name text,
  team_description text DEFAULT NULL,
  team_is_public boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  team_id uuid;
BEGIN
  -- Create team
  INSERT INTO teams (name, description, is_public, created_by)
  VALUES (team_name, team_description, team_is_public, auth.uid())
  RETURNING id INTO team_id;
  
  -- Add creator as owner
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (team_id, auth.uid(), 'owner');
  
  RETURN team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join a team
CREATE OR REPLACE FUNCTION join_team(team_uuid uuid)
RETURNS boolean AS $$
DECLARE
  team_is_public boolean;
  already_member boolean;
BEGIN
  -- Check if team is public
  SELECT is_public INTO team_is_public
  FROM teams
  WHERE id = team_uuid;
  
  IF NOT team_is_public THEN
    RAISE EXCEPTION 'Team is not public';
  END IF;
  
  -- Check if already a member
  SELECT EXISTS(
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid AND user_id = auth.uid()
  ) INTO already_member;
  
  IF already_member THEN
    RETURN false;
  END IF;
  
  -- Add as member
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (team_uuid, auth.uid(), 'member');
  
  -- Update member count
  UPDATE teams
  SET member_count = member_count + 1
  WHERE id = team_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;