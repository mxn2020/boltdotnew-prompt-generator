export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  github_username?: string;
  twitter_username?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  email_notifications: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  prompt_updates: boolean;
  collaboration_invites: boolean;
  default_prompt_privacy: boolean;
  default_structure_type: 'standard' | 'structured' | 'modulized' | 'advanced';
  default_complexity: 'simple' | 'medium' | 'complex' | 'custom';
  auto_save_interval: number;
  show_onboarding: boolean;
}

export interface APIKeyConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  key_preview: string;
  is_active: boolean;
  created_at: string;
  last_used?: string;
}

export interface UserStats {
  total_prompts: number;
  total_views: number;
  total_likes: number;
  total_forks: number;
  total_collections: number;
  avg_rating: number;
  join_date: string;
  last_active: string;
  streak_days: number;
}

export interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  website?: string;
  github_username?: string;
  twitter_username?: string;
}

export interface UpdatePreferencesData extends Partial<UserPreferences> {}

export interface CreateAPIKeyData {
  name: string;
  provider: 'openai' | 'anthropic';
  api_key: string;
}