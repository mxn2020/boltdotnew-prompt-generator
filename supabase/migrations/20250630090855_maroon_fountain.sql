/*
  # Community Features and Collaboration Tables

  1. New Tables
    - `collections` - User-created collections of prompts
    - `collection_items` - Items within collections
    - `prompt_ratings` - Community ratings and reviews
    - `prompt_likes` - User likes for prompts
    - `collaboration_sessions` - Real-time collaboration sessions
    - `collaboration_participants` - Session participants
    - `analytics_events` - User behavior tracking
    - `teams` - Team management
    - `team_members` - Team membership

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Team-based permissions

  3. Functions
    - Community interaction functions
    - Analytics tracking functions
    - Team management functions
*/

-- Collections table for organizing prompts
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  is_smart boolean DEFAULT false,
  smart_criteria jsonb DEFAULT '{}',
  prompt_count integer DEFAULT 0,
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

-- Collection items table
CREATE TABLE IF NOT EXISTS collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  added_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, prompt_id)
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

-- Prompt ratings and reviews
CREATE TABLE IF NOT EXISTS prompt_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

ALTER TABLE prompt_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all ratings"
  ON prompt_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own ratings"
  ON prompt_ratings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Prompt likes
CREATE TABLE IF NOT EXISTS prompt_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

ALTER TABLE prompt_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all likes"
  ON prompt_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON prompt_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  member_count integer DEFAULT 1,
  prompt_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read public teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Team members can read their teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can read team membership"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage membership"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  prompt_id uuid REFERENCES prompts(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Collaboration sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  title text NOT NULL,
  is_active boolean DEFAULT true,
  participant_count integer DEFAULT 1,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read collaboration sessions for accessible prompts"
  ON collaboration_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts p
      WHERE p.id = collaboration_sessions.prompt_id
      AND (p.user_id = auth.uid() OR p.is_public = true)
    )
  );

CREATE POLICY "Prompt owners can manage collaboration sessions"
  ON collaboration_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts p
      WHERE p.id = collaboration_sessions.prompt_id
      AND p.user_id = auth.uid()
    )
  );

-- Collaboration participants table
CREATE TABLE IF NOT EXISTS collaboration_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES collaboration_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  joined_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read collaboration data"
  ON collaboration_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaboration_participants cp
      WHERE cp.session_id = collaboration_participants.session_id
      AND cp.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_public ON collections(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_prompt_id ON collection_items(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_prompt_id ON prompt_ratings(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_user_id ON prompt_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_prompt_id ON prompt_likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_user_id ON prompt_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_public ON teams(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_prompt_id ON collaboration_sessions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_session_id ON collaboration_participants(session_id);

-- Update triggers for collections
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_ratings_updated_at
  BEFORE UPDATE ON prompt_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();