import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Collection {
  id: string;
  user_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  is_public: boolean;
  is_smart: boolean;
  smart_criteria: any;
  item_count: number;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_type: 'prompt' | 'collection';
  prompt_id?: string;
  child_collection_id?: string;
  added_by: string;
  added_at: string;
}

export function useCollections(parentId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collections', parentId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_collection_tree', {
        parent_collection_uuid: parentId || null,
        target_user_id: user.id
      });

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
            item_type,
            prompt_id,
            child_collection_id,
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
            ),
            child_collection:collections (
              id,
              title,
              description,
              item_count,
              view_count,
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
    mutationFn: async (collectionData: {
      title: string;
      description?: string;
      parent_id?: string;
      is_public?: boolean;
      is_smart?: boolean;
      smart_criteria?: any;
    }) => {
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
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
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

export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      collectionId, 
      itemType, 
      promptId, 
      childCollectionId 
    }: { 
      collectionId: string; 
      itemType: 'prompt' | 'collection';
      promptId?: string;
      childCollectionId?: string;
    }) => {
      const { data, error } = await supabase.rpc('add_to_collection_enhanced', {
        collection_uuid: collectionId,
        item_type_param: itemType,
        prompt_uuid: promptId,
        child_collection_uuid: childCollectionId,
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
    mutationFn: async ({ collectionId, itemId }: { collectionId: string; itemId: string }) => {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update collection item count
      await supabase
        .from('collections')
        .update({ item_count: supabase.raw('item_count - 1') })
        .eq('id', collectionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}