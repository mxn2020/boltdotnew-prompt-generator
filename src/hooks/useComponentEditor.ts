import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Component } from '../types/component';

export interface ComponentEditorSession {
  id: string;
  session_data: Record<string, any>;
  last_activity: string;
}

export function useComponentEditorSession(componentId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['component-editor-session', componentId, user?.id],
    queryFn: async () => {
      if (!user || !componentId) return null;

      const { data, error } = await supabase.rpc('get_component_editor_session', {
        component_uuid: componentId
      });

      if (error) throw error;
      return data?.[0] as ComponentEditorSession | null;
    },
    enabled: !!user && !!componentId,
  });
}

export function useSaveComponentEditorSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ componentId, sessionData }: { 
      componentId: string; 
      sessionData: Record<string, any> 
    }) => {
      const { data, error } = await supabase.rpc('save_component_editor_session', {
        component_uuid: componentId,
        session_data_param: sessionData
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['component-editor-session', variables.componentId] 
      });
    },
  });
}

export function useComponentForEditing(componentId: string) {
  return useQuery({
    queryKey: ['component-for-editing', componentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', componentId)
        .single();

      if (error) throw error;
      return data as Component;
    },
    enabled: !!componentId,
  });
}