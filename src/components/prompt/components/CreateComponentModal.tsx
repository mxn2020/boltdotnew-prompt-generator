import React from 'react';
import { X, Code, Layers, FileText, Link } from 'lucide-react';
import { useCreateComponent } from '../../../hooks/useComponents';
import { cn } from '../../../lib/utils';
import type { ComponentType } from '../../../types/component';

interface CreateComponentModalProps {
  onClose: () => void;
  onSuccess?: (componentId: string) => void;
}

export function CreateComponentModal({ onClose, onSuccess }: CreateComponentModalProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    type: 'module' as ComponentType,
    category: 'general',
    tags: [] as string[],
    is_public: false,
    content: {},
  });

  const [tagInput, setTagInput] = React.useState('');
  const createComponent = useCreateComponent();

  const componentTypes = [
    { 
      value: 'module', 
      label: 'Module', 
      icon: Layers, 
      description: 'Reusable content blocks for prompts' 
    },
    { 
      value: 'wrapper', 
      label: 'Wrapper', 
      icon: Code, 
      description: 'Processing logic for prompt outputs' 
    },
    { 
      value: 'template', 
      label: 'Template', 
      icon: FileText, 
      description: 'Structured prompt templates' 
    },
    { 
      value: 'asset', 
      label: 'Asset', 
      icon: Link, 
      description: 'External resources and references' 
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createComponent.mutateAsync({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        content: getContentForType(formData.type),
        category: formData.category,
        tags: formData.tags,
        is_public: formData.is_public,
      });
      
      // Navigate to component editor
      window.location.href = `/component-editor/${result}`;
    } catch (error) {
      console.error('Failed to create component:', error);
    }
  };

  const getContentForType = (type: ComponentType) => {
    switch (type) {
      case 'module':
        return {
          moduleContent: 'Enter your module content here...',
          moduleConfig: {},
        };
      case 'wrapper':
        return {
          wrapperLogic: 'Define your wrapper logic here...',
          wrapperType: 'custom',
          wrapperConfig: {},
        };
      case 'template':
        return {
          templateStructure: {
            sections: [
              { title: 'Section 1', content: 'Template content...' }
            ]
          },
          templateVariables: [],
        };
      case 'asset':
        return {
          assetType: 'url',
          assetReference: '',
          assetMetadata: {},
        };
      default:
        return {};
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Component</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Component Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Component Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {componentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as ComponentType }))}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all',
                      formData.type === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Component title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">General</option>
                <option value="formatting">Formatting</option>
                <option value="development">Development</option>
                <option value="analysis">Analysis</option>
                <option value="creative">Creative</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this component does..."
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Make Public</div>
                <div className="text-sm text-gray-600">Allow others to discover and use this component</div>
              </div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createComponent.isPending || !formData.title.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createComponent.isPending ? 'Creating...' : 'Create Component'}
          </button>
        </div>
      </div>
    </div>
  );
}