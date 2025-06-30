import React from 'react';
import { Sparkles, Settings, Zap, Brain, RefreshCw } from 'lucide-react';
import { AI_PROVIDERS, type AIProvider } from '../../lib/ai/providers';
import { useAvailableProviders } from '../../hooks/useAIGeneration';
import { cn } from '../../lib/utils';

interface ConfigurationPanelProps {
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  lastGeneration?: {
    provider: AIProvider;
    model: string;
    generationTime: number;
    tokensUsed?: number;
  };
}

export function ConfigurationPanel({
  provider,
  onProviderChange,
  isGenerating,
  onGenerate,
  canGenerate,
  lastGeneration,
}: ConfigurationPanelProps) {
  const availableProviders = useAvailableProviders();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Generation</h3>
      </div>

      {/* Provider Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Provider
          </label>
          <div className="grid grid-cols-1 gap-3">
            {availableProviders.map((providerId) => {
              const providerConfig = AI_PROVIDERS[providerId];
              const isSelected = provider === providerId;
              
              return (
                <button
                  key={providerId}
                  onClick={() => onProviderChange(providerId)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-all',
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      isSelected ? 'bg-purple-500' : 'bg-gray-300'
                    )} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {providerConfig.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {providerConfig.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generation Button */}
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={cn(
            'w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all',
            canGenerate && !isGenerating
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate with AI</span>
            </>
          )}
        </button>

        {/* Generation Stats */}
        {lastGeneration && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Last Generation</span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Provider: {AI_PROVIDERS[lastGeneration.provider].name}</div>
              <div>Model: {lastGeneration.model}</div>
              <div>Time: {lastGeneration.generationTime}ms</div>
              {lastGeneration.tokensUsed && (
                <div>Tokens: {lastGeneration.tokensUsed}</div>
              )}
            </div>
          </div>
        )}

        {/* Provider Status */}
        {availableProviders.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                No AI providers configured
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Add your OpenAI or Anthropic API keys to enable AI generation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}