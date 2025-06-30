import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PromptVersion, CreateVersionData } from '../types/version';

export function useVersions(promptId: string) {
  return useQuery({
    queryKey: ['versions', promptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromptVersion[];
    },
    enabled: !!promptId,
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (versionData: CreateVersionData) => {
      if (!user) throw new Error('User not authenticated');

      // Get current prompt to create version from
      const { data: currentPrompt, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', versionData.prompt_id)
        .single();

      if (promptError) throw promptError;

      // Calculate new version numbers
      let newMajor = currentPrompt.version_major;
      let newMinor = currentPrompt.version_minor;
      let newBatch = currentPrompt.version_batch;

      if (versionData.version_type === 'major') {
        newMajor += 1;
        newMinor = 0;
        newBatch = 0;
      } else if (versionData.version_type === 'minor') {
        newMinor += 1;
        newBatch = 0;
      } else {
        newBatch += 1;
      }

      // Create version record
      const { data: version, error: versionError } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: versionData.prompt_id,
          version_major: newMajor,
          version_minor: newMinor,
          version_batch: newBatch,
          title: currentPrompt.title,
          description: currentPrompt.description,
          content: currentPrompt.content,
          structure_type: currentPrompt.structure_type,
          category: currentPrompt.category,
          type: currentPrompt.type,
          language: currentPrompt.language,
          complexity: currentPrompt.complexity,
          tags: currentPrompt.tags,
          changelog: versionData.changelog,
          created_by: user.id,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Update prompt with new version numbers
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          version_major: newMajor,
          version_minor: newMinor,
          version_batch: newBatch,
        })
        .eq('id', versionData.prompt_id);

      if (updateError) throw updateError;

      return version as PromptVersion;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['versions', data.prompt_id] });
      queryClient.invalidateQueries({ queryKey: ['prompt', data.prompt_id] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promptId, version }: { promptId: string; version: PromptVersion }) => {
      // Update prompt with version data
      const { error } = await supabase
        .from('prompts')
        .update({
          title: version.title,
          description: version.description,
          content: version.content,
          structure_type: version.structure_type,
          category: version.category,
          type: version.type,
          language: version.language,
          complexity: version.complexity,
          tags: version.tags,
          version_batch: version.version_batch + 1, // Increment batch for restore
        })
        .eq('id', promptId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompt', variables.promptId] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['versions', variables.promptId] });
    },
  });
}