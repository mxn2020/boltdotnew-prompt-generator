import React from 'react';
import { Clock, Zap, RotateCcw, Trash2 } from 'lucide-react';
import { AI_PROVIDERS, type AIProvider } from '../../lib/ai/providers';
import { formatDateTime } from '../../lib/utils';

interface GenerationHistoryItem {
  id: string;
  timestamp: Date;
  provider: AIProvider;
  model: string;
  userInput: string;
  generationTime: number;
  tokensUsed?: number;
  success: boolean;
  error?: string;
}

interface GenerationHistoryProps {
  history: GenerationHistoryItem[];
  onRegenerate: (item: GenerationHistoryItem) => void;
  onClear: () => void;
}

export function GenerationHistory({ history, onRegenerate, onClear }: GenerationHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Generation History</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No generations yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your AI generation history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Generation History</h3>
        </div>
        <button
          onClick={onClear}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border ${
              item.success
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {AI_PROVIDERS[item.provider].name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(item.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 truncate mb-2">
                  "{item.userInput}"
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{item.model}</span>
                  <span>{item.generationTime}ms</span>
                  {item.tokensUsed && <span>{item.tokensUsed} tokens</span>}
                </div>

                {!item.success && item.error && (
                  <p className="text-xs text-red-600 mt-1">{item.error}</p>
                )}
              </div>

              {item.success && (
                <button
                  onClick={() => onRegenerate(item)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}