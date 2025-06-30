import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  Save, 
  ArrowLeft, 
  Settings, 
  Code, 
  Layers, 
  FileText, 
  Link as LinkIcon,
  AlertCircle 
} from 'lucide-react';
import { 
  useComponentForEditing, 
  useComponentEditorSession, 
  useSaveComponentEditorSession 
} from '../hooks/useComponentEditor';
import { useUpdateComponent } from '../hooks/useComponents';
import { cn } from '../lib/utils';
import type { Component, ComponentType, ComponentContent } from '../types/component';

export function ComponentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: component, isLoading } = useComponentForEditing(id || '');
  const { data: session } = useComponentEditorSession(id || '');
  const saveSession = useSaveComponentEditorSession();
  const updateComponent = useUpdateComponent();

  const [componentData, setComponentData] = React.useState<Partial<Component> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Initialize component data
  React.useEffect(() => {
    if (component) {
      setComponentData(component);
    }
  }, [component]);

  // Auto-save session data
  React.useEffect(() => {
    if (componentData && id && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveSession.mutate({
          componentId: id,
          sessionData: componentData
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [componentData, id, hasUnsavedChanges, saveSession]);

  const handleSave = async () => {
    if (!componentData || !id) return;

    setSaveError(null);
    
    try {
      await updateComponent.mutateAsync({
        id,
        title: componentData.title!,
        description: componentData.description,
        content: componentData.content!,
        category: componentData.category!,
        tags: componentData.tags || [],
        is_public: componentData.is_public || false,
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save component:', error);
      setSaveError('Failed to save component. Please try again.');
    }
  };

  const updateComponentField = (field: keyof Component, value: any) => {
    setComponentData(prev => prev ? { ...prev, [field]: value } : null);
    setHasUnsavedChanges(true);
  };

  const updateComponentContent = (content: ComponentContent) => {
    setComponentData(prev => prev ? { ...prev, content } : null);
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!component || !componentData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Component not found</h1>
          <button
            onClick={() => navigate('/library')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Return to Library
          </button>
        </div>
      </Layout>
    );
  }

  const getComponentIcon = (type: ComponentType) => {
    switch (type) {
      case 'module':
        return Layers;
      case 'wrapper':
        return Code;
      case 'template':
        return FileText;
      case 'asset':
        return LinkIcon;
      default:
        return FileText;
    }
  };

  const Icon = getComponentIcon(componentData.type!);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {/* Error Display */}
          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{saveError}</p>
                <button
                  onClick={() => setSaveError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/library')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Library</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Component Editor</h1>
                  <p className="text-gray-600">
                    Editing {componentData.type} component
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || updateComponent.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>
                  {updateComponent.isPending ? 'Saving...' : 'Save Component'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Component Details */}
          <div className="xl:col-span-1 space-y-6">
            <ComponentDetailsPanel
              component={componentData}
              onUpdate={updateComponentField}
            />
          </div>

          {/* Center Panel - Content Editor */}
          <div className="xl:col-span-2">
            <ComponentContentEditor
              component={componentData}
              onUpdateContent={updateComponentContent}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface ComponentDetailsPanelProps {
  component: Partial<Component>;
  onUpdate: (field: keyof Component, value: any) => void;
}

function ComponentDetailsPanel({ component, onUpdate }: ComponentDetailsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Details</h3>
      
      <div className="space-y-4">
        {/* Component Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={component.title || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter component title..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={component.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            className="w-full h-20 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description of your component..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select 
            value={component.category || 'general'}
            onChange={(e) => onUpdate('category', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="general">General</option>
            <option value="formatting">Formatting</option>
            <option value="development">Development</option>
            <option value="analysis">Analysis</option>
            <option value="creative">Creative</option>
            <option value="business">Business</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={(component.tags || []).join(', ')}
            onChange={(e) => onUpdate('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter tags separated by commas..."
          />
        </div>

        {/* Privacy Setting */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={component.is_public || false}
              onChange={(e) => onUpdate('is_public', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="font-medium text-gray-900">Make Public</div>
              <div className="text-sm text-gray-600">Allow others to discover and use this component</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

interface ComponentContentEditorProps {
  component: Partial<Component>;
  onUpdateContent: (content: ComponentContent) => void;
}

function ComponentContentEditor({ component, onUpdateContent }: ComponentContentEditorProps) {
  const content = component.content || {};

  const updateContent = (field: string, value: any) => {
    onUpdateContent({ ...content, [field]: value });
  };

  const renderEditor = () => {
    switch (component.type) {
      case 'module':
        return <ModuleContentEditor content={content} onUpdate={updateContent} />;
      case 'wrapper':
        return <WrapperContentEditor content={content} onUpdate={updateContent} />;
      case 'template':
        return <TemplateContentEditor content={content} onUpdate={updateContent} />;
      case 'asset':
        return <AssetContentEditor content={content} onUpdate={updateContent} />;
      default:
        return <div>Unknown component type</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[600px]">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {component.type?.charAt(0).toUpperCase()}{component.type?.slice(1)} Content
        </h3>
      </div>
      <div className="p-6">
        {renderEditor()}
      </div>
    </div>
  );
}

function ModuleContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Module Content
        </label>
        <textarea
          value={content.moduleContent || ''}
          onChange={(e) => onUpdate('moduleContent', e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your module content here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Module Configuration (JSON)
        </label>
        <textarea
          value={JSON.stringify(content.moduleConfig || {}, null, 2)}
          onChange={(e) => {
            try {
              const config = JSON.parse(e.target.value);
              onUpdate('moduleConfig', config);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder='{"key": "value"}'
        />
      </div>
    </div>
  );
}

function WrapperContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wrapper Type
        </label>
        <select
          value={content.wrapperType || 'custom'}
          onChange={(e) => onUpdate('wrapperType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="format-json">Format as JSON</option>
          <option value="format-list">Format as List</option>
          <option value="format-table">Format as Table</option>
          <option value="validate-input">Validate Input</option>
          <option value="transform-data">Transform Data</option>
          <option value="conditional-logic">Conditional Logic</option>
          <option value="custom">Custom Wrapper</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wrapper Logic
        </label>
        <textarea
          value={content.wrapperLogic || ''}
          onChange={(e) => onUpdate('wrapperLogic', e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Define your wrapper logic here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wrapper Configuration (JSON)
        </label>
        <textarea
          value={JSON.stringify(content.wrapperConfig || {}, null, 2)}
          onChange={(e) => {
            try {
              const config = JSON.parse(e.target.value);
              onUpdate('wrapperConfig', config);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder='{"key": "value"}'
        />
      </div>
    </div>
  );
}

function TemplateContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template Structure (JSON)
        </label>
        <textarea
          value={JSON.stringify(content.templateStructure || {}, null, 2)}
          onChange={(e) => {
            try {
              const structure = JSON.parse(e.target.value);
              onUpdate('templateStructure', structure);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder='{"sections": [{"title": "Section 1", "content": "Template content..."}]}'
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template Variables (JSON)
        </label>
        <textarea
          value={JSON.stringify(content.templateVariables || [], null, 2)}
          onChange={(e) => {
            try {
              const variables = JSON.parse(e.target.value);
              onUpdate('templateVariables', variables);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder='[{"name": "variable1", "type": "string", "required": true}]'
        />
      </div>
    </div>
  );
}

function AssetContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asset Type
        </label>
        <select
          value={content.assetType || 'url'}
          onChange={(e) => onUpdate('assetType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="prompt">Prompt Reference</option>
          <option value="file">File Upload</option>
          <option value="url">URL Reference</option>
          <option value="image">Image Asset</option>
          <option value="document">Document Asset</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asset Reference
        </label>
        <input
          type="text"
          value={content.assetReference || ''}
          onChange={(e) => onUpdate('assetReference', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter asset reference (URL, file path, etc.)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asset Metadata (JSON)
        </label>
        <textarea
          value={JSON.stringify(content.assetMetadata || {}, null, 2)}
          onChange={(e) => {
            try {
              const metadata = JSON.parse(e.target.value);
              onUpdate('assetMetadata', metadata);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder='{"description": "Asset description", "tags": ["tag1", "tag2"]}'
        />
      </div>
    </div>
  );
}