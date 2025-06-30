import React from 'react';
import { GripVertical, X, Settings, Code, Layers } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { PromptModule } from '../../../types/prompt';

interface ModuleComposerProps {
  module: PromptModule;
  onUpdate: (updates: Partial<PromptModule>) => void;
  onRemove: () => void;
  compact?: boolean;
}

const wrapperTypes = [
  { value: '', label: 'No wrapper', description: 'Use module content as-is' },
  { value: 'format-json', label: 'Format as JSON', description: 'Structure output as JSON' },
  { value: 'format-list', label: 'Format as List', description: 'Present as bulleted list' },
  { value: 'format-table', label: 'Format as Table', description: 'Organize in table format' },
  { value: 'validate-input', label: 'Validate Input', description: 'Add input validation logic' },
  { value: 'transform-data', label: 'Transform Data', description: 'Apply data transformations' },
  { value: 'conditional-logic', label: 'Conditional Logic', description: 'Add conditional processing' },
  { value: 'custom', label: 'Custom Wrapper', description: 'Define custom processing logic' },
];

export function ModuleComposer({ module, onUpdate, onRemove, compact = false }: ModuleComposerProps) {
  const [showConfig, setShowConfig] = React.useState(false);
  const [showWrapper, setShowWrapper] = React.useState(false);

  const selectedWrapper = wrapperTypes.find(w => w.value === (module.wrapper_id || ''));

  return (
    <div className={cn(
      'bg-white border rounded-lg overflow-hidden',
      compact ? 'border-purple-200' : 'border-gray-200'
    )}>
      {/* Module Header */}
      <div className={cn(
        'flex items-center space-x-3 p-3 border-b',
        compact ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
      )}>
        <button className="text-gray-400 hover:text-gray-600 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </button>

        <Layers className={cn(
          'w-4 h-4',
          compact ? 'text-purple-600' : 'text-indigo-600'
        )} />

        <input
          type="text"
          value={module.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Module title..."
          className={cn(
            'flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2',
            compact ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'
          )}
        />

        {module.wrapper_id && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
            <Code className="w-3 h-3" />
            <span>{selectedWrapper?.label || 'Wrapper'}</span>
          </div>
        )}

        <button
          onClick={() => setShowWrapper(!showWrapper)}
          className="text-gray-600 hover:text-blue-600 transition-colors"
          title="Configure wrapper"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-gray-600 hover:text-gray-800 transition-colors"
          title="Module settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Module Content */}
      <div className="p-3 space-y-3">
        {/* Description */}
        {!compact && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={module.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Brief description of this module..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Content
          </label>
          <textarea
            value={module.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter module content..."
            className={cn(
              'w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2',
              compact ? 'h-24 focus:ring-purple-500' : 'h-32 focus:ring-indigo-500'
            )}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {module.content.length} characters
            </span>
          </div>
        </div>

        {/* Wrapper Configuration */}
        {showWrapper && (
          <div className="border-t border-gray-200 pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Wrapper
            </label>
            <select
              value={module.wrapper_id || ''}
              onChange={(e) => onUpdate({ wrapper_id: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {wrapperTypes.map((wrapper) => (
                <option key={wrapper.value} value={wrapper.value}>
                  {wrapper.label}
                </option>
              ))}
            </select>
            {selectedWrapper && selectedWrapper.value && (
              <p className="text-xs text-gray-600 mt-1">
                {selectedWrapper.description}
              </p>
            )}
          </div>
        )}

        {/* Advanced Configuration */}
        {showConfig && (
          <div className="border-t border-gray-200 pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Configuration (JSON)
            </label>
            <textarea
              value={JSON.stringify(module.config || {}, null, 2)}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value);
                  onUpdate({ config });
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"key": "value"}'
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}