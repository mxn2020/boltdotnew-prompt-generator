import React from 'react';
import { GripVertical, X, Settings, Code, Layers, Plus, Tag } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { PromptModule } from '../../../types/prompt';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModuleComposerProps {
  module: PromptModule;
  onUpdate: (updates: Partial<PromptModule>) => void;
  onRemove: () => void;
  compact?: boolean;
}

const wrapperTypes = [
  { value: 'no_wrapper', label: 'No wrapper', description: 'Use module content as-is' },
  { value: 'format-json', label: 'Format as JSON', description: 'Structure output as JSON' },
  { value: 'format-list', label: 'Format as List', description: 'Present as bulleted list' },
  { value: 'format-table', label: 'Format as Table', description: 'Organize in table format' },
  { value: 'validate-input', label: 'Validate Input', description: 'Add input validation logic' },
  { value: 'transform-data', label: 'Transform Data', description: 'Apply data transformations' },
  { value: 'conditional-logic', label: 'Conditional Logic', description: 'Add conditional processing' },
  { value: 'error-handling', label: 'Error Handling', description: 'Add error handling logic' },
  { value: 'format-markdown', label: 'Format as Markdown', description: 'Structure output as Markdown' },
  { value: 'format-yaml', label: 'Format as YAML', description: 'Structure output as YAML' },
  { value: 'format-xml', label: 'Format as XML', description: 'Structure output as XML' },
  { value: 'format-csv', label: 'Format as CSV', description: 'Structure output as CSV' },
  { value: 'summarize', label: 'Summarize Content', description: 'Create a summary of the content' },
  { value: 'translate', label: 'Translate Content', description: 'Translate content to another language' },
  { value: 'custom', label: 'Custom Wrapper', description: 'Define custom processing logic' },
];

export function ModuleComposer({ module, onUpdate, onRemove, compact = false }: ModuleComposerProps) {
  const [showConfig, setShowConfig] = React.useState(false);
  const [showWrapper, setShowWrapper] = React.useState(false);
  const [selectedWrapper, setSelectedWrapper] = React.useState('');

  // Initialize wrappers array if it doesn't exist
  const wrappers = module.wrappers || [];
  
  const handleAddWrapper = () => {
    if (!selectedWrapper || selectedWrapper === 'no_wrapper') return;
    
    // Don't add duplicates
    if (wrappers.includes(selectedWrapper)) return;
    
    // Update wrappers array
    const updatedWrappers = [...wrappers, selectedWrapper];
    onUpdate({ wrappers: updatedWrappers });
    
    // Reset selection
    setSelectedWrapper('');
  };
  
  const handleRemoveWrapper = (wrapper: string) => {
    const updatedWrappers = wrappers.filter(w => w !== wrapper);
    onUpdate({ wrappers: updatedWrappers });
  };
  
  const getWrapperLabel = (wrapperId: string) => {
    const wrapper = wrapperTypes.find(w => w.value === wrapperId);
    return wrapper?.label || wrapperId;
  };

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
            compact ? 'focus:ring-purple-500' : 'focus:ring-indigo-500',
            'min-w-0'
          )}
        />

        {/* Wrapper Badges */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px]">
          {wrappers.map((wrapper) => (
            <Badge 
              key={wrapper} 
              variant="secondary" 
              className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <span className="truncate max-w-[80px]">{getWrapperLabel(wrapper)}</span>
              <button 
                onClick={() => handleRemoveWrapper(wrapper)}
                className="text-blue-700 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          </div>

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
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Processing Wrapper
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedWrapper}
                    onChange={(e) => setSelectedWrapper(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a wrapper...</option>
                    {wrapperTypes.map((wrapper) => (
                      <option key={wrapper.value} value={wrapper.value}>
                        {wrapper.label}
                      </option>
                    ))}
                  </select>
                  <Button 
                    onClick={handleAddWrapper}
                    disabled={!selectedWrapper || selectedWrapper === 'no_wrapper'}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {selectedWrapper && (
                  <p className="text-xs text-gray-600 mt-1">
                    {wrapperTypes.find(w => w.value === selectedWrapper)?.description}
                  </p>
                )}
              </div>
              
              {wrappers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applied Wrappers
                  </label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {wrappers.map((wrapper) => (
                        <Badge 
                          key={wrapper} 
                          variant="secondary" 
                          className="flex items-center gap-1 bg-blue-100 text-blue-700"
                        >
                          <Code className="w-3 h-3" />
                          <span>{getWrapperLabel(wrapper)}</span>
                          <button 
                            onClick={() => handleRemoveWrapper(wrapper)}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Wrappers are applied in the order listed above. Drag to reorder (coming soon).
                    </p>
                  </div>
                </div>
              )}
            </div>
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