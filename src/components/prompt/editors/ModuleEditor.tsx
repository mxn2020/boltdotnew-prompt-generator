import React from 'react';
import { Plus, GripVertical, X, Settings } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import type { PromptModule } from '../../../types/prompt';

export function ModuleEditor() {
  const { 
    currentPrompt, 
    addModule, 
    updateModule, 
    removeModule, 
    reorderModules 
  } = usePromptStore();

  const modules = currentPrompt?.content?.modules || [];

  const handleAddModule = () => {
    addModule({
      title: '',
      content: '',
    });
  };

  const handleUpdateModule = (id: string, field: keyof PromptModule, value: any) => {
    updateModule(id, { [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Modulized Prompt Components</h3>
          <p className="text-sm text-gray-600">
            Build reusable modules with processing wrappers for advanced prompt composition.
          </p>
        </div>
        <button
          onClick={handleAddModule}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Module</span>
        </button>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h4 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h4>
            <p className="text-gray-600 mb-4">
              Create reusable modules that can be combined and processed with wrappers.
            </p>
            <button
              onClick={handleAddModule}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Module</span>
            </button>
          </div>
        ) : (
          modules.map((module, index) => (
            <ModuleItem
              key={module.id}
              module={module}
              onUpdate={handleUpdateModule}
              onRemove={() => removeModule(module.id)}
            />
          ))
        )}
      </div>

      {/* Tips */}
      {modules.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-900 mb-2">💡 Tips for Modulized Prompts</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Design modules to be reusable across different prompts</li>
            <li>• Use wrappers to define how modules should be processed</li>
            <li>• Consider creating modules for common patterns like examples, constraints, or formatting</li>
            <li>• Modules can be saved to your library for use in other prompts</li>
          </ul>
        </div>
      )}
    </div>
  );
}

interface ModuleItemProps {
  module: PromptModule;
  onUpdate: (id: string, field: keyof PromptModule, value: any) => void;
  onRemove: () => void;
}

function ModuleItem({ module, onUpdate, onRemove }: ModuleItemProps) {
  const [showConfig, setShowConfig] = React.useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Module Header */}
      <div className="flex items-center space-x-3 p-4 bg-purple-50 border-b border-gray-200">
        <button className="text-gray-400 hover:text-gray-600 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={module.title}
          onChange={(e) => onUpdate(module.id, 'title', e.target.value)}
          placeholder="Module title..."
          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-gray-600 hover:text-purple-600 transition-colors"
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
      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={module.description || ''}
            onChange={(e) => onUpdate(module.id, 'description', e.target.value)}
            placeholder="Brief description of this module..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Content
          </label>
          <textarea
            value={module.content}
            onChange={(e) => onUpdate(module.id, 'content', e.target.value)}
            placeholder="Enter module content..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {module.content.length} characters
            </span>
          </div>
        </div>

        {/* Wrapper Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Processing Wrapper
          </label>
          <select
            value={module.wrapper_id || ''}
            onChange={(e) => onUpdate(module.id, 'wrapper_id', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">No wrapper</option>
            <option value="format-json">Format as JSON</option>
            <option value="format-list">Format as List</option>
            <option value="validate-input">Validate Input</option>
            <option value="custom">Custom Wrapper</option>
          </select>
        </div>

        {/* Configuration */}
        {showConfig && (
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Configuration (JSON)
            </label>
            <textarea
              value={JSON.stringify(module.config || {}, null, 2)}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value);
                  onUpdate(module.id, 'config', config);
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"key": "value"}'
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}