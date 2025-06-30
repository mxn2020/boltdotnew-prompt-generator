import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { 
  Prompt, 
  PromptType, 
  AssetFieldDefinition, 
  CreateAssetData,
  PromptFilters,
  PromptSortOptions 
} from '../types/prompt';

export function useAssets(filters?: PromptFilters, sort?: PromptSortOptions) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assets', filters, sort, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('prompts')
        .select('*')
        .neq('prompt_type', 'prompt'); // Only get assets

      // Apply filters
      if (filters?.search) {
        query = query.textSearch('title,description', filters.search);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.complexity) {
        query = query.eq('complexity', filters.complexity);
      }

      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      } else {
        // Default to user's assets and public assets
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('updated_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!user,
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .neq('prompt_type', 'prompt')
        .single();

      if (error) throw error;
      return data as Prompt;
    },
    enabled: !!id,
  });
}

export function useAssetFieldDefinitions(assetType: PromptType) {
  return useQuery({
    queryKey: ['asset-fields', assetType],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_asset_fields', {
        asset_type_param: assetType
      });

      if (error) throw error;
      return data as AssetFieldDefinition[];
    },
    enabled: !!assetType && assetType !== 'prompt',
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (assetData: CreateAssetData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_asset', {
        asset_title: assetData.title,
        asset_description: assetData.description,
        asset_type_param: assetData.asset_type,
        asset_content: assetData.content,
        asset_fields_data: assetData.asset_fields || {},
        asset_category: assetData.category || 'general',
        asset_language: assetData.language || 'english',
        asset_complexity: assetData.complexity || 'simple',
        asset_tags: assetData.tags || [],
        asset_is_public: assetData.is_public || false
      });

      if (error) throw error;
      return data as string; // Returns the asset ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('prompts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .neq('prompt_type', 'prompt')
        .select()
        .single();

      if (error) throw error;
      return data as Prompt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', data.id] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .neq('prompt_type', 'prompt');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useAssetsByType(assetType: PromptType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assets-by-type', assetType, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('prompt_type', assetType)
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!user && assetType !== 'prompt',
  });
}