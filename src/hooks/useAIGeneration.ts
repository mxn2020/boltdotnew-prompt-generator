import { useMutation } from '@tanstack/react-query';
import { AIPromptGenerator, type GenerationResult, type GenerationError } from '../lib/ai/generator';
import type { GenerationConfig } from '../lib/ai/promptTemplates';
import type { AIProvider } from '../lib/ai/providers';

const aiGenerator = new AIPromptGenerator();

export function useAIGeneration() {
  return useMutation<GenerationResult, GenerationError, { config: GenerationConfig; provider?: AIProvider }>({
    mutationFn: async ({ config, provider = 'openai' }) => {
      return await aiGenerator.generatePrompt(config, provider);
    },
  });
}

export function useAvailableProviders() {
  return aiGenerator.getAvailableProviders();
}