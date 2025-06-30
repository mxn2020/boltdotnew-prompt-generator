import { useMutation } from '@tanstack/react-query';
import { AIPromptGenerator, type GenerationResult, type GenerationError } from '../lib/ai/generator';
import { AIFeatureCostCalculator } from '../lib/ai/costCalculator';
import { useSubscriptionInfo, useCheckCredits, useDeductCredits } from './usePayment';
import { useAuth } from '../contexts/AuthContext';
import type { GenerationConfig } from '../lib/ai/promptTemplates';
import type { AIProvider } from '../lib/ai/providers';

const aiGenerator = new AIPromptGenerator();

export function useAIGeneration() {
  const { user } = useAuth();
  const { data: subscriptionInfo } = useSubscriptionInfo();
  const checkCredits = useCheckCredits();
  const deductCredits = useDeductCredits();

  return useMutation<GenerationResult, GenerationError, { config: GenerationConfig; provider?: AIProvider }>({
    mutationFn: async ({ config, provider = 'openai' }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user can use AI features
      if (!subscriptionInfo?.can_use_ai) {
        throw new Error('AI features require Pro or Max plan. Please upgrade your subscription.');
      }

      // Calculate cost
      const promptLength = config.userInput.length;
      const costCalculation = AIFeatureCostCalculator.calculateCost(
        'prompt_generation',
        provider,
        provider === 'openai' ? 'gpt-4-turbo-preview' : 'claude-3-sonnet-20240229',
        config.complexity,
        promptLength
      );

      // Check if user has sufficient credits
      const hasCredits = await checkCredits.mutateAsync({
        userId: user.id,
        requiredCredits: costCalculation.totalCost
      });

      if (!hasCredits) {
        throw new Error(`Insufficient credits. This operation requires ${costCalculation.totalCost} credits.`);
      }

      let success = false;
      let errorMessage: string | undefined;
      let result: GenerationResult;

      try {
        result = await aiGenerator.generatePrompt(config, provider);
        success = true;
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Generation failed';
        throw error;
      } finally {
        // Deduct credits regardless of success/failure
        await deductCredits.mutateAsync({
          userId: user.id,
          featureType: 'prompt_generation',
          provider,
          model: provider === 'openai' ? 'gpt-4-turbo-preview' : 'claude-3-sonnet-20240229',
          promptLength,
          baseCost: costCalculation.baseCost,
          multiplier: costCalculation.multiplier,
          totalCost: costCalculation.totalCost,
          success,
          errorMessage
        });
      }

      return await aiGenerator.generatePrompt(config, provider);
    },
  });
}

export function useAvailableProviders() {
  return aiGenerator.getAvailableProviders();
}