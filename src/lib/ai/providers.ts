import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type AIProvider = 'openai' | 'anthropic';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  models: string[];
  maxTokens: number;
  supportsStreaming: boolean;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    description: 'GPT-4 and GPT-3.5 models for versatile prompt generation',
    models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
    maxTokens: 4096,
    supportsStreaming: true,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude-3 models optimized for complex prompt engineering',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    maxTokens: 4096,
    supportsStreaming: true,
  },
};

export function createOpenAIClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export function createAnthropicClient() {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4-turbo-preview';
    case 'anthropic':
      return 'claude-3-sonnet-20240229';
    default:
      return 'gpt-4-turbo-preview';
  }
}