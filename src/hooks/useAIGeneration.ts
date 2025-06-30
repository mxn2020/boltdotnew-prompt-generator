import { useMutation } from '@tanstack/react-query';
import { AIPromptGenerator, type GenerationResult, type GenerationError } from '../lib/ai/generator';
import { AIFeatureCostCalculator } from '../lib/ai/costCalculator';
import { useSubscriptionInfo, useCheckCredits, useDeductCredits } from './usePayment';
import { useAuth } from '../contexts/AuthContext';
import { getAIConfig } from '../lib/ai/config';
import type { GenerationConfig } from '../lib/ai/promptTemplates';

const aiGenerator = new AIPromptGenerator();

export function useAIGeneration() {
  const { user } = useAuth();
  const { data: subscriptionInfo } = useSubscriptionInfo();
  const checkCredits = useCheckCredits();
  const deductCredits = useDeductCredits();
  const aiConfig = getAIConfig();

  return useMutation<GenerationResult, GenerationError, { config: GenerationConfig }>({
    mutationFn: async ({ config }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user can use AI features
      if (!subscriptionInfo?.can_use_ai) {
        throw new Error('AI features require Pro or Max plan. Please upgrade your subscription.');
      }

      // Calculate cost using global config
      const promptLength = config.userInput.length;
      const costCalculation = AIFeatureCostCalculator.calculateCost(
        'prompt_generation',
        aiConfig.provider,
        aiConfig.model,
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

      try {
        const result = await aiGenerator.generatePrompt(config, aiConfig.provider);
        success = true;
        return result;
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Generation failed';
        throw error;
      } finally {
        // Deduct credits regardless of success/failure
        await deductCredits.mutateAsync({
          userId: user.id,
          featureType: 'prompt_generation',
          provider: aiConfig.provider,
          model: aiConfig.model,
          promptLength,
          baseCost: costCalculation.baseCost,
          multiplier: costCalculation.multiplier,
          totalCost: costCalculation.totalCost,
          success,
          errorMessage
        });
      }
    },
  });
}

export function useAvailableProviders() {
  return aiGenerator.getAvailableProviders();
}