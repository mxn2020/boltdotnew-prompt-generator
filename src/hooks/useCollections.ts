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
  // Legacy field for compatibility
  prompt_count?: number;
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

export interface CreateCollectionData {
  title: string;
  description?: string;
  parent_id?: string;
  is_public?: boolean;
  is_smart?: boolean;
  smart_criteria?: any;
}

export interface CollectionsQueryParams {
  search?: string;
  parentId?: string;
  isPublic?: boolean;
}

export function useCollections(params?: CollectionsQueryParams) {
  const { user } = useAuth();
  const { search, parentId, isPublic } = params || {};

  return useQuery({
    queryKey: ['collections', parentId, user?.id, search, isPublic],
    queryFn: async () => {
      console.log('Fetching collections with params:', { parentId, search, isPublic, userId: user?.id });
      
      if (!user) return [];

      let query = supabase
        .from('collections')
        .select('*')
        .order('updated_at', { ascending: false });

      // Apply filters
      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }

      if (isPublic !== undefined) {
        query = query.eq('is_public', isPublic);
      } else {
        // Show user's collections and public collections
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;

      console.log('Collections query result:', { data, error });

      if (error) throw error;
      
      // Ensure backward compatibility
      const collections = (data || []).map(collection => ({
        ...collection,
        prompt_count: collection.item_count, // For backward compatibility
      }));

      return collections as Collection[];
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      if (!id) return null;

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
    mutationFn: async (collectionData: CreateCollectionData) => {
      console.log('Creating collection:', collectionData);
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collections')
        .insert({
          ...collectionData,
          user_id: user.id,
          item_count: 0,
          view_count: 0,
          like_count: 0,
        })
        .select()
        .single();

      console.log('Collection creation result:', { data, error });

      if (error) throw error;
      
      // Add prompt_count for backward compatibility
      const collection = {
        ...data,
        prompt_count: data.item_count,
      };

      return collection as Collection;
    },
    onSuccess: (data, variables) => {
      console.log('Collection created successfully:', data);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      
      // If creating in a specific parent, invalidate that too
      if (variables.parent_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['collections', variables.parent_id] 
        });
      }

      // Force immediate refetch of the main collections query
      queryClient.refetchQueries({ 
        queryKey: ['collections', variables.parent_id, undefined] // undefined for search param
      });
    },
    onError: (error) => {
      console.error('Failed to create collection:', error);
    }
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