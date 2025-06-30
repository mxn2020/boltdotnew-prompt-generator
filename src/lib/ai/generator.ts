import { createOpenAIClient, createAnthropicClient, getDefaultModel } from './providers';
import { generateSystemPrompt, generateUserPrompt, type GenerationConfig } from './promptTemplates';
import type { AIProvider } from './providers';
import type { PromptContent } from '../../types/prompt';

export interface GenerationResult {
  content: PromptContent;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  generationTime: number;
}

export interface GenerationError {
  message: string;
  code: string;
  provider: AIProvider;
}

export class AIPromptGenerator {
  private openaiClient?: ReturnType<typeof createOpenAIClient>;
  private anthropicClient?: ReturnType<typeof createAnthropicClient>;

  constructor() {
    try {
      this.openaiClient = createOpenAIClient();
    } catch (error) {
      console.warn('OpenAI client not available:', error);
    }

    try {
      this.anthropicClient = createAnthropicClient();
    } catch (error) {
      console.warn('Anthropic client not available:', error);
    }
  }

  async generatePrompt(
    config: GenerationConfig,
    provider: AIProvider = 'openai'
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      let result: PromptContent;
      let tokensUsed: number | undefined;

      if (provider === 'openai' && this.openaiClient) {
        const response = await this.generateWithOpenAI(config);
        result = response.content;
        tokensUsed = response.tokensUsed;
      } else if (provider === 'anthropic' && this.anthropicClient) {
        const response = await this.generateWithAnthropic(config);
        result = response.content;
        tokensUsed = response.tokensUsed;
      } else {
        throw new Error(`Provider ${provider} not available or not configured`);
      }

      const generationTime = Date.now() - startTime;

      return {
        content: result,
        provider,
        model: getDefaultModel(provider),
        tokensUsed,
        generationTime,
      };
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'GENERATION_FAILED',
        provider,
      } as GenerationError;
    }
  }

  private async generateWithOpenAI(config: GenerationConfig) {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const systemPrompt = generateSystemPrompt(config);
    const userPrompt = generateUserPrompt(config);

    const response = await this.openaiClient.chat.completions.create({
      model: getDefaultModel('openai'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    let parsedContent: PromptContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse generated content as JSON');
    }

    return {
      content: parsedContent,
      tokensUsed: response.usage?.total_tokens,
    };
  }

  private async generateWithAnthropic(config: GenerationConfig) {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized');
    }

    const systemPrompt = generateSystemPrompt(config);
    const userPrompt = generateUserPrompt(config);

    const response = await this.anthropicClient.messages.create({
      model: getDefaultModel('anthropic'),
      max_tokens: 2048,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    let parsedContent: PromptContent;
    try {
      parsedContent = JSON.parse(content.text);
    } catch (error) {
      throw new Error('Failed to parse generated content as JSON');
    }

    return {
      content: parsedContent,
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
    };
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.openaiClient) providers.push('openai');
    if (this.anthropicClient) providers.push('anthropic');
    return providers;
  }
}