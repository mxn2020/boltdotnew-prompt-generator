import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Component, ComponentFilters, ComponentSortOptions } from '../types/component';

export function useComponents(filters?: ComponentFilters, sort?: ComponentSortOptions) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['components', filters, sort, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('components')
        .select('*');

      // Apply filters
      if (filters?.search) {
        query = query.textSearch('title,description', filters.search);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      } else {
        // Default to user's components and public components
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
      return data as Component[];
    },
    enabled: !!user,
  });
}

export function useComponent(id: string) {
  return useQuery({
    queryKey: ['component', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Component;
    },
    enabled: !!id,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (componentData: {
      title: string;
      description?: string;
      type: string;
      content: any;
      category?: string;
      tags?: string[];
      is_public?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_component', {
        component_title: componentData.title,
        component_description: componentData.description,
        component_type: componentData.type,
        component_content: componentData.content,
        component_category: componentData.category || 'general',
        component_tags: componentData.tags || [],
        component_is_public: componentData.is_public || false
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('components')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Component;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      queryClient.invalidateQueries({ queryKey: ['component', data.id] });
    },
  });
}

export function useDeleteComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('components')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}

export function useRateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ componentId, rating, review }: { 
      componentId: string; 
      rating: number; 
      review?: string 
    }) => {
      const { error } = await supabase.rpc('rate_component', {
        component_uuid: componentId,
        rating_value: rating,
        review_text: review,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}

export function useTrackComponentUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ componentId, promptId }: { 
      componentId: string; 
      promptId: string 
    }) => {
      const { error } = await supabase.rpc('track_component_usage', {
        component_uuid: componentId,
        prompt_uuid: promptId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}