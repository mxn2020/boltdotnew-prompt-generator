import type { AIProvider } from './providers';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  defaultComplexity: 'simple' | 'medium' | 'complex';
  maxTokens: number;
}

// Global AI configuration - can be modified here to change the default model
export const AI_CONFIG: AIConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  defaultComplexity: 'simple',
  maxTokens: 4096,
};

// Helper function to get the current AI configuration
export function getAIConfig(): AIConfig {
  return AI_CONFIG;
}

// Helper function to get the display name for the current model
export function getCurrentModelDisplayName(): string {
  const config = getAIConfig();
  switch (config.model) {
    case 'gpt-4.1':
      return 'GPT-4.1';
    case 'gpt-4.1-mini':
      return 'GPT-4.1 Mini';
    case 'gpt-4.1-nano':
      return 'GPT-4.1 Nano';
    case 'gpt-4o':
      return 'GPT-4o';
    case 'gpt-4o-mini':
      return 'GPT-4o Mini';
    case 'o3-mini':
      return 'o3 Mini';
    case 'o4-mini':
      return 'o4 Mini';
    case 'o3':
      return 'o3';
    case 'o3-deep-research':
      return 'o3 Deep Research';
    case 'claude-3-opus-20240229':
      return 'Claude-3 Opus';
    case 'claude-3-sonnet-20240229':
      return 'Claude-3 Sonnet';
    case 'claude-3-haiku-20240307':
      return 'Claude-3 Haiku';
    default:
      return config.model;
  }
}
