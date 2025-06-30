import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { 
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
  Team,
  CreateTeamData,
  UpdateTeamData,
  TrendingPrompt,
  RecommendedPrompt,
  UserAnalytics,
  CommunityFilters,
  CommunitySortOptions
} from '../types/community';

// Collections
export function useCollections(filters?: CommunityFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collections', filters, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('collections')
        .select('*');

      if (filters?.search) {
        query = query.textSearch('title,description', filters.search);
      }

      if (user) {
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      } else {
        query = query.eq('is_public', true);
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as Collection[];
    },
    enabled: !!user,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_items (
            id,
            prompt_id,
            added_by,
            added_at,
            prompts (
              id,
              title,
              description,
              structure_type,
              category,
              complexity,
              tags,
              view_count,
              like_count,
              fork_count,
              created_at,
              updated_at
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (collectionData: CreateCollectionData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collections')
        .insert({
          ...collectionData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Collection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCollectionData) => {
      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Collection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', data.id] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

// Collection Items
export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, promptId }: { collectionId: string; promptId: string }) => {
      const { data, error } = await supabase.rpc('add_to_collection', {
        collection_uuid: collectionId,
        prompt_uuid: promptId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, promptId }: { collectionId: string; promptId: string }) => {
      const { data, error } = await supabase.rpc('remove_from_collection', {
        collection_uuid: collectionId,
        prompt_uuid: promptId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

// Prompt Interactions
export function useTogglePromptLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => {
      const { data, error } = await supabase.rpc('toggle_prompt_like', {
        prompt_uuid: promptId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useRatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promptId, rating, review }: { promptId: string; rating: number; review?: string }) => {
      const { error } = await supabase.rpc('rate_prompt', {
        prompt_uuid: promptId,
        rating_value: rating,
        review_text: review,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

// Teams
export function useTeams() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner (
            role
          )
        `)
        .eq('team_members.user_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamData: CreateTeamData) => {
      const { data, error } = await supabase.rpc('create_team', {
        team_name: teamData.name,
        team_description: teamData.description,
        team_is_public: teamData.is_public || false,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

// Trending & Recommendations
export function useTrendingPrompts(timePeriod: string = '7 days') {
  return useQuery({
    queryKey: ['trending-prompts', timePeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_prompts', {
        time_period: `${timePeriod}`,
        limit_count: 20,
      });

      if (error) throw error;
      return data as TrendingPrompt[];
    },
  });
}

export function useRecommendedPrompts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommended-prompts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recommended_prompts', {
        target_user_id: user?.id,
        limit_count: 10,
      });

      if (error) throw error;
      return data as RecommendedPrompt[];
    },
    enabled: !!user,
  });
}

// Analytics
export function useUserAnalytics(timePeriod: string = '30 days') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-analytics', user?.id, timePeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_analytics', {
        target_user_id: user?.id,
        time_period: `${timePeriod}`,
      });

      if (error) throw error;
      return data[0] as UserAnalytics;
    },
    enabled: !!user,
  });
}

export function useTrackEvent() {
  return useMutation({
    mutationFn: async ({
      eventType,
      eventData = {},
      promptId,
      collectionId,
    }: {
      eventType: string;
      eventData?: Record<string, any>;
      promptId?: string;
      collectionId?: string;
    }) => {
      const { data, error } = await supabase.rpc('track_analytics_event', {
        event_type_param: eventType,
        event_data_param: eventData,
        prompt_id_param: promptId,
        collection_id_param: collectionId,
      });

      if (error) throw error;
      return data;
    },
  });
}