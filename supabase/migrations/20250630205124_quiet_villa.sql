/*
  # Enhanced Collection Items Functionality

  1. New Functions
    - `get_collection_items` - Retrieve items in a collection with details
    - `add_prompt_to_collection` - Add a prompt to a collection
    - `remove_item_from_collection` - Remove an item from a collection
    - `get_prompt_collections` - Get collections containing a specific prompt

  2. Changes
    - Update collection_items table to better support both prompts and nested collections
    - Add functions to manage collection items more effectively
*/

-- Function to get items in a collection with details
CREATE OR REPLACE FUNCTION get_collection_items(collection_uuid uuid)
RETURNS TABLE (
  id uuid,
  collection_id uuid,
  item_type text,
  prompt_id uuid,
  prompt_title text,
  prompt_description text,
  prompt_structure_type text,
  prompt_category text,
  child_collection_id uuid,
  child_collection_title text,
  child_collection_description text,
  added_by uuid,
  added_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.collection_id,
    ci.item_type,
    ci.prompt_id,
    p.title as prompt_title,
    p.description as prompt_description,
    p.structure_type as prompt_structure_type,
    p.category as prompt_category,
    ci.child_collection_id,
    c.title as child_collection_title,
    c.description as child_collection_description,
    ci.added_by,
    ci.added_at
  FROM collection_items ci
  LEFT JOIN prompts p ON ci.prompt_id = p.id
  LEFT JOIN collections c ON ci.child_collection_id = c.id
  WHERE ci.collection_id = collection_uuid
  ORDER BY ci.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a prompt to a collection
CREATE OR REPLACE FUNCTION add_prompt_to_collection(
  collection_uuid uuid,
  prompt_uuid uuid
)
RETURNS uuid AS $$
DECLARE
  collection_owner uuid;
  item_exists boolean;
  item_id uuid;
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
    WHERE collection_id = collection_uuid 
    AND item_type = 'prompt' 
    AND prompt_id = prompt_uuid
  ) INTO item_exists;
  
  IF item_exists THEN
    -- Return existing item id
    SELECT id INTO item_id
    FROM collection_items
    WHERE collection_id = collection_uuid 
    AND item_type = 'prompt' 
    AND prompt_id = prompt_uuid;
    
    RETURN item_id;
  END IF;
  
  -- Add item to collection
  INSERT INTO collection_items (
    collection_id, 
    item_type, 
    prompt_id, 
    added_by
  ) VALUES (
    collection_uuid, 
    'prompt', 
    prompt_uuid, 
    auth.uid()
  ) RETURNING id INTO item_id;
  
  -- Update collection item count
  UPDATE collections
  SET item_count = item_count + 1
  WHERE id = collection_uuid;
  
  RETURN item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove an item from a collection
CREATE OR REPLACE FUNCTION remove_item_from_collection(
  collection_uuid uuid,
  item_uuid uuid
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
    WHERE id = item_uuid AND collection_id = collection_uuid
  ) INTO item_exists;
  
  IF NOT item_exists THEN
    RETURN false;
  END IF;
  
  -- Remove item from collection
  DELETE FROM collection_items
  WHERE id = item_uuid AND collection_id = collection_uuid;
  
  -- Update collection item count
  UPDATE collections
  SET item_count = item_count - 1
  WHERE id = collection_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get collections containing a specific prompt
CREATE OR REPLACE FUNCTION get_prompt_collections(prompt_uuid uuid)
RETURNS TABLE (
  collection_id uuid,
  collection_title text,
  collection_description text,
  is_public boolean,
  item_count integer,
  added_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as collection_id,
    c.title as collection_title,
    c.description as collection_description,
    c.is_public,
    c.item_count,
    ci.added_at
  FROM collections c
  JOIN collection_items ci ON c.id = ci.collection_id
  WHERE ci.prompt_id = prompt_uuid
  AND (c.user_id = auth.uid() OR c.is_public = true)
  ORDER BY ci.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;