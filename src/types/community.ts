export interface Collection {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  is_smart: boolean;
  smart_criteria: SmartCriteria;
  prompt_count: number;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface SmartCriteria {
  categories?: string[];
  tags?: string[];
  complexity?: string[];
  structure_types?: string[];
  min_rating?: number;
  created_after?: string;
  updated_after?: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  prompt_id: string;
  added_by: string;
  added_at: string;
}

export interface PromptRating {
  id: string;
  prompt_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface PromptLike {
  id: string;
  prompt_id: string;
  user_id: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_public: boolean;
  created_by: string;
  member_count: number;
  prompt_count: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  prompt_id?: string;
  collection_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CollaborationSession {
  id: string;
  prompt_id: string;
  created_by: string;
  title: string;
  is_active: boolean;
  participant_count: number;
  last_activity: string;
  created_at: string;
}

export interface CollaborationParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  last_seen: string;
}

export interface UserAnalytics {
  total_prompts: number;
  total_views: number;
  total_likes: number;
  total_forks: number;
  total_collections: number;
  avg_rating: number;
  recent_activity: AnalyticsActivity[];
}

export interface AnalyticsActivity {
  date: string;
  event_type: string;
  count: number;
}

export interface TrendingPrompt {
  id: string;
  title: string;
  description?: string;
  structure_type: string;
  category: string;
  complexity: string;
  tags: string[];
  view_count: number;
  like_count: number;
  fork_count: number;
  created_at: string;
  updated_at: string;
  trend_score: number;
}

export interface RecommendedPrompt {
  id: string;
  title: string;
  description?: string;
  structure_type: string;
  category: string;
  complexity: string;
  tags: string[];
  view_count: number;
  like_count: number;
  fork_count: number;
  created_at: string;
  recommendation_score: number;
}

export interface CreateCollectionData {
  title: string;
  description?: string;
  is_public?: boolean;
  is_smart?: boolean;
  smart_criteria?: SmartCriteria;
}

export interface UpdateCollectionData extends Partial<CreateCollectionData> {
  id: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateTeamData extends Partial<CreateTeamData> {
  id: string;
}

export interface CommunityFilters {
  search?: string;
  category?: string;
  structure_type?: string;
  complexity?: string;
  tags?: string[];
  min_rating?: number;
  time_period?: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface CommunitySortOptions {
  field: 'created_at' | 'updated_at' | 'like_count' | 'view_count' | 'fork_count' | 'trend_score';
  direction: 'asc' | 'desc';
}