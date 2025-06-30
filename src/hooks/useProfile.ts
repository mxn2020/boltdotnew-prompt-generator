import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { 
  UserProfile, 
  UserPreferences, 
  UserStats,
  UpdateProfileData,
  UpdatePreferencesData,
  APIKeyConfig,
  CreateAPIKeyData
} from '../types/user';

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: UpdateProfileData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUserPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['preferences', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get preferences from localStorage with defaults
      const defaultPreferences: UserPreferences = {
        theme: 'system',
        language: 'english',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        email_notifications: true,
        marketing_emails: false,
        weekly_digest: true,
        prompt_updates: true,
        collaboration_invites: true,
        default_prompt_privacy: false,
        default_structure_type: 'standard',
        default_complexity: 'custom',
        auto_save_interval: 30,
        show_onboarding: true,
      };

      const stored = localStorage.getItem(`preferences_${user.id}`);
      if (stored) {
        return { ...defaultPreferences, ...JSON.parse(stored) } as UserPreferences;
      }

      return defaultPreferences;
    },
    enabled: !!user,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: UpdatePreferencesData) => {
      if (!user) throw new Error('User not authenticated');

      // Get current preferences
      const current = queryClient.getQueryData(['preferences', user.id]) as UserPreferences;
      const updated = { ...current, ...updates };

      // Store in localStorage
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(updated));

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

export function useUserStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get user analytics
      const { data: analytics } = await supabase.rpc('get_user_analytics', {
        target_user_id: user.id,
        time_period: '365 days',
      });

      // Get profile for join date
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      // Calculate streak (mock for now)
      const streakDays = Math.floor(Math.random() * 30) + 1;

      const stats: UserStats = {
        total_prompts: analytics?.[0]?.total_prompts || 0,
        total_views: analytics?.[0]?.total_views || 0,
        total_likes: analytics?.[0]?.total_likes || 0,
        total_forks: analytics?.[0]?.total_forks || 0,
        total_collections: analytics?.[0]?.total_collections || 0,
        avg_rating: analytics?.[0]?.avg_rating || 0,
        join_date: profile?.created_at || new Date().toISOString(),
        last_active: new Date().toISOString(),
        streak_days: streakDays,
      };

      return stats;
    },
    enabled: !!user,
  });
}

export function useAPIKeys() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get API keys from localStorage (in production, these would be encrypted in the database)
      const stored = localStorage.getItem(`api_keys_${user.id}`);
      if (stored) {
        return JSON.parse(stored) as APIKeyConfig[];
      }

      return [];
    },
    enabled: !!user,
  });
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (keyData: CreateAPIKeyData) => {
      if (!user) throw new Error('User not authenticated');

      const newKey: APIKeyConfig = {
        id: crypto.randomUUID(),
        name: keyData.name,
        provider: keyData.provider,
        key_preview: `${keyData.api_key.slice(0, 8)}...${keyData.api_key.slice(-4)}`,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      // Get current keys
      const current = queryClient.getQueryData(['api-keys', user.id]) as APIKeyConfig[] || [];
      const updated = [...current, newKey];

      // Store in localStorage (in production, encrypt and store in database)
      localStorage.setItem(`api_keys_${user.id}`, JSON.stringify(updated));

      // Also store the actual key for the AI providers
      localStorage.setItem(`${keyData.provider}_api_key_${user.id}`, keyData.api_key);

      return newKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useDeleteAPIKey() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (keyId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get current keys
      const current = queryClient.getQueryData(['api-keys', user.id]) as APIKeyConfig[] || [];
      const keyToDelete = current.find(k => k.id === keyId);
      const updated = current.filter(k => k.id !== keyId);

      // Update localStorage
      localStorage.setItem(`api_keys_${user.id}`, JSON.stringify(updated));

      // Remove the actual API key
      if (keyToDelete) {
        localStorage.removeItem(`${keyToDelete.provider}_api_key_${user.id}`);
      }

      return keyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated');

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}