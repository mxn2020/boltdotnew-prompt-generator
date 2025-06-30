/*
  # Component Library and Collections System

  1. New Tables
    - `components` - Reusable prompt components (modules, wrappers, templates, assets)
    - `component_versions` - Version history for components
    - `component_ratings` - Community ratings for components
    - `component_usage` - Track component usage in prompts
    - `collections` - Enhanced collections with nested support
    - `collection_items` - Items within collections (prompts and other collections)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control

  3. Functions
    - Component management functions
    - Collection management functions
    - Nested collection support
*/

-- Components table for reusable prompt elements
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('module', 'wrapper', 'template', 'asset')),
  content jsonb NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  version_major integer DEFAULT 1,
  version_minor integer DEFAULT 0,
  version_batch integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own components"
  ON components
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public components"
  ON components
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can manage own components"
  ON components
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Component versions table
CREATE TABLE IF NOT EXISTS component_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE NOT NULL,
  version_major integer NOT NULL,
  version_minor integer NOT NULL,
  version_batch integer NOT NULL,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '{}',
  changelog text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL
);

ALTER TABLE component_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read versions of accessible components"
  ON component_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM components c
      WHERE c.id = component_versions.component_id
      AND (c.user_id = auth.uid() OR c.is_public = true)
    )
  );

CREATE POLICY "Users can create versions of own components"
  ON component_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM components c
      WHERE c.id = component_versions.component_id
      AND c.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

-- Component ratings table
CREATE TABLE IF NOT EXISTS component_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(component_id, user_id)
);

ALTER TABLE component_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all component ratings"
  ON component_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own component ratings"
  ON component_ratings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Component usage tracking
CREATE TABLE IF NOT EXISTS component_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE NOT NULL,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  used_at timestamptz DEFAULT now(),
  UNIQUE(component_id, prompt_id)
);

ALTER TABLE component_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own component usage"
  ON component_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can track own component usage"
  ON component_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enhanced collections table with nested support
DROP TABLE IF EXISTS collections CASCADE;
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  is_smart boolean DEFAULT false,
  smart_criteria jsonb DEFAULT '{}',
  item_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own collections"
  ON collections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public collections"
  ON collections
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can manage own collections"
  ON collections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Enhanced collection items table supporting both prompts and nested collections
DROP TABLE IF EXISTS collection_items CASCADE;
CREATE TABLE collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('prompt', 'collection')),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  child_collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  added_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  added_at timestamptz DEFAULT now(),
  CONSTRAINT valid_item_reference CHECK (
    (item_type = 'prompt' AND prompt_id IS NOT NULL AND child_collection_id IS NULL) OR
    (item_type = 'collection' AND child_collection_id IS NOT NULL AND prompt_id IS NULL)
  ),
  UNIQUE(collection_id, item_type, prompt_id, child_collection_id)
);

ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read collection items for accessible collections"
  ON collection_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_items.collection_id
      AND (c.user_id = auth.uid() OR c.is_public = true)
    )
  );

CREATE POLICY "Users can manage items in own collections"
  ON collection_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_items.collection_id
      AND c.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_components_user_id ON components(user_id);
CREATE INDEX IF NOT EXISTS idx_components_public ON components(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_components_tags ON components USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_component_versions_component_id ON component_versions(component_id);
CREATE INDEX IF NOT EXISTS idx_component_ratings_component_id ON component_ratings(component_id);
CREATE INDEX IF NOT EXISTS idx_component_usage_component_id ON component_usage(component_id);
CREATE INDEX IF NOT EXISTS idx_component_usage_prompt_id ON component_usage(prompt_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_parent_id ON collections(parent_id);
CREATE INDEX IF NOT EXISTS idx_collections_public ON collections(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_prompt_id ON collection_items(prompt_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_child_collection_id ON collection_items(child_collection_id);

-- Full-text search for components
CREATE INDEX IF NOT EXISTS idx_components_search ON components USING gin(
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Update triggers
CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_ratings_updated_at
  BEFORE UPDATE ON component_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create a component
CREATE OR REPLACE FUNCTION create_component(
  component_title text,
  component_description text,
  component_type text,
  component_content jsonb,
  component_category text DEFAULT 'general',
  component_tags text[] DEFAULT '{}',
  component_is_public boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  component_id uuid;
BEGIN
  -- Create component
  INSERT INTO components (
    user_id,
    title,
    description,
    type,
    content,
    category,
    tags,
    is_public
  ) VALUES (
    auth.uid(),
    component_title,
    component_description,
    component_type,
    component_content,
    component_category,
    component_tags,
    component_is_public
  ) RETURNING id INTO component_id;
  
  -- Create initial version
  INSERT INTO component_versions (
    component_id,
    version_major,
    version_minor,
    version_batch,
    title,
    description,
    content,
    created_by
  ) VALUES (
    component_id,
    1,
    0,
    0,
    component_title,
    component_description,
    component_content,
    auth.uid()
  );
  
  RETURN component_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rate a component
CREATE OR REPLACE FUNCTION rate_component(
  component_uuid uuid,
  rating_value integer,
  review_text text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  old_rating integer;
  component_rating_count integer;
  component_rating_sum integer;
  new_average numeric;
BEGIN
  -- Get existing rating if any
  SELECT rating INTO old_rating
  FROM component_ratings
  WHERE component_id = component_uuid AND user_id = auth.uid();
  
  -- Insert or update rating
  INSERT INTO component_ratings (component_id, user_id, rating, review)
  VALUES (component_uuid, auth.uid(), rating_value, review_text)
  ON CONFLICT (component_id, user_id)
  DO UPDATE SET 
    rating = rating_value,
    review = review_text,
    updated_at = now();
  
  -- Recalculate average rating
  SELECT COUNT(*), SUM(rating)
  INTO component_rating_count, component_rating_sum
  FROM component_ratings
  WHERE component_id = component_uuid;
  
  new_average := ROUND(component_rating_sum::numeric / component_rating_count::numeric, 2);
  
  -- Update component with new average and count
  UPDATE components
  SET 
    rating = new_average,
    rating_count = component_rating_count
  WHERE id = component_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track component usage
CREATE OR REPLACE FUNCTION track_component_usage(
  component_uuid uuid,
  prompt_uuid uuid
)
RETURNS void AS $$
BEGIN
  -- Insert usage record
  INSERT INTO component_usage (component_id, prompt_id, user_id)
  VALUES (component_uuid, prompt_uuid, auth.uid())
  ON CONFLICT (component_id, prompt_id) DO NOTHING;
  
  -- Update usage count
  UPDATE components
  SET usage_count = usage_count + 1
  WHERE id = component_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add item to collection (supports both prompts and nested collections)
CREATE OR REPLACE FUNCTION add_to_collection_enhanced(
  collection_uuid uuid,
  item_type_param text,
  prompt_uuid uuid DEFAULT NULL,
  child_collection_uuid uuid DEFAULT NULL
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
  
  -- Validate item type and parameters
  IF item_type_param = 'prompt' AND prompt_uuid IS NULL THEN
    RAISE EXCEPTION 'prompt_id required for prompt items';
  END IF;
  
  IF item_type_param = 'collection' AND child_collection_uuid IS NULL THEN
    RAISE EXCEPTION 'child_collection_id required for collection items';
  END IF;
  
  -- Check if item already exists
  SELECT EXISTS(
    SELECT 1 FROM collection_items
    WHERE collection_id = collection_uuid 
    AND item_type = item_type_param
    AND (
      (item_type_param = 'prompt' AND prompt_id = prompt_uuid) OR
      (item_type_param = 'collection' AND child_collection_id = child_collection_uuid)
    )
  ) INTO item_exists;
  
  IF item_exists THEN
    RETURN false;
  END IF;
  
  -- Add item to collection
  INSERT INTO collection_items (
    collection_id, 
    item_type, 
    prompt_id, 
    child_collection_id, 
    added_by
  ) VALUES (
    collection_uuid, 
    item_type_param, 
    prompt_uuid, 
    child_collection_uuid, 
    auth.uid()
  );
  
  -- Update collection item count
  UPDATE collections
  SET item_count = item_count + 1
  WHERE id = collection_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get collection tree (with nested collections)
CREATE OR REPLACE FUNCTION get_collection_tree(
  parent_collection_uuid uuid DEFAULT NULL,
  target_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  parent_id uuid,
  title text,
  description text,
  is_public boolean,
  item_count integer,
  view_count integer,
  like_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  depth integer
) AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := COALESCE(target_user_id, auth.uid());
  
  RETURN QUERY
  WITH RECURSIVE collection_tree AS (
    -- Base case: root collections
    SELECT 
      c.id,
      c.parent_id,
      c.title,
      c.description,
      c.is_public,
      c.item_count,
      c.view_count,
      c.like_count,
      c.created_at,
      c.updated_at,
      0 as depth
    FROM collections c
    WHERE c.parent_id = parent_collection_uuid
    AND (c.user_id = user_uuid OR c.is_public = true)
    
    UNION ALL
    
    -- Recursive case: child collections
    SELECT 
      c.id,
      c.parent_id,
      c.title,
      c.description,
      c.is_public,
      c.item_count,
      c.view_count,
      c.like_count,
      c.created_at,
      c.updated_at,
      ct.depth + 1
    FROM collections c
    INNER JOIN collection_tree ct ON c.parent_id = ct.id
    WHERE c.user_id = user_uuid OR c.is_public = true
  )
  SELECT * FROM collection_tree
  ORDER BY depth, title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;