import { AI_FEATURE_CONFIGS, type AIFeatureConfig } from '../../types/payment';
import { getAIConfig } from './config';
import type { AIProvider } from './providers';
import type { Complexity } from '../../types/prompt';

export interface CostCalculation {
  baseCost: number;
  multiplier: number;
  totalCost: number;
  breakdown: {
    provider: number;
    model: number;
    complexity: number;
    length: number;
  };
}

export class AIFeatureCostCalculator {
  static calculateCost(
    featureType: string,
    provider: AIProvider,
    model: string,
    complexity: Complexity,
    promptLength: number
  ): CostCalculation {
    const config = AI_FEATURE_CONFIGS[featureType];
    if (!config) {
      throw new Error(`Unknown feature type: ${featureType}`);
    }

    const baseCost = config.base_cost;
    
    // Calculate multipliers
    const providerMultiplier = config.multipliers.provider[provider] || 1.0;
    const modelMultiplier = config.multipliers.model[model] || 1.0;
    const complexityMultiplier = config.multipliers.complexity[complexity] || 1.0;
    const lengthMultiplier = this.getLengthMultiplier(config, promptLength);

    // Total multiplier
    const totalMultiplier = providerMultiplier * modelMultiplier * complexityMultiplier * lengthMultiplier;
    
    // Final cost (rounded up to nearest integer)
    const totalCost = Math.ceil(baseCost * totalMultiplier);

    return {
      baseCost,
      multiplier: totalMultiplier,
      totalCost,
      breakdown: {
        provider: providerMultiplier,
        model: modelMultiplier,
        complexity: complexityMultiplier,
        length: lengthMultiplier,
      },
    };
  }

  private static getLengthMultiplier(config: AIFeatureConfig, promptLength: number): number {
    if (promptLength <= 500) {
      return config.multipliers.length.short;
    } else if (promptLength <= 1500) {
      return config.multipliers.length.medium;
    } else {
      return config.multipliers.length.long;
    }
  }

  static getEstimatedCost(
    featureType: string,
    provider?: AIProvider,
    complexity: Complexity = 'simple',
    promptLength: number = 500
  ): number {
    const config = getAIConfig();
    const actualProvider = provider || config.provider;
    const defaultModel = actualProvider === 'openai' ? config.model : 'claude-3-sonnet-20240229';
    const calculation = this.calculateCost(featureType, actualProvider, defaultModel, complexity, promptLength);
    return calculation.totalCost;
  }

  static formatCostBreakdown(calculation: CostCalculation): string {
    const { baseCost, breakdown, totalCost } = calculation;
    
    return [
      `Base cost: ${baseCost} credits`,
      `Provider multiplier: ${breakdown.provider}x`,
      `Model multiplier: ${breakdown.model}x`,
      `Complexity multiplier: ${breakdown.complexity}x`,
      `Length multiplier: ${breakdown.length}x`,
      `Total: ${totalCost} credits`
    ].join('\n');
  }
}