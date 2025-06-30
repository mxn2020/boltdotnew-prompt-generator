import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { 
  Prompt, 
  CreatePromptData, 
  UpdatePromptData, 
  PromptFilters, 
  PromptSortOptions 
} from '../types/prompt';

export function usePrompts(filters?: PromptFilters, sort?: PromptSortOptions) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['prompts', filters, sort, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('prompts')
        .select('*');

      // Apply filters
      if (filters?.search) {
        query = query.textSearch('title,description', filters.search);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.structure_type) {
        query = query.eq('structure_type', filters.structure_type);
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
        // Default to user's prompts and public prompts
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

export function usePrompt(id: string) {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Prompt;
    },
    enabled: !!id,
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (promptData: CreatePromptData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prompts')
        .insert({
          ...promptData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePromptData) => {
      // First update the prompt with the changes (excluding version_batch)
      const { data, error } = await supabase
        .from('prompts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Then increment the version batch
      const { error: versionError } = await supabase.rpc('increment_version_batch', { prompt_id: id });
      
      if (versionError) throw versionError;

      // Fetch the updated prompt with the new version batch
      const { data: updatedPrompt, error: fetchError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return updatedPrompt as Prompt;
      return data as Prompt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompt', data.id] });
    },
  });
}

export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useClonePrompt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (promptId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get the original prompt
      const { data: originalPrompt, error: fetchError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single();

      if (fetchError) throw fetchError;

      // Create a clone
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          title: `${originalPrompt.title} (Copy)`,
          description: originalPrompt.description,
          content: originalPrompt.content,
          structure_type: originalPrompt.structure_type,
          category: originalPrompt.category,
          type: originalPrompt.type,
          language: originalPrompt.language,
          complexity: originalPrompt.complexity,
          tags: originalPrompt.tags,
          user_id: user.id,
          forked_from: originalPrompt.id,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Increment fork count on original
      await supabase.rpc('increment_fork_count', { prompt_id: promptId });

      return data as Prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}