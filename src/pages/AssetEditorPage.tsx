import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  Save, 
  ArrowLeft, 
  FileText, 
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { useAsset, useAssetFieldDefinitions, useUpdateAsset } from '../hooks/useAssets';
import { usePromptStore } from '../stores/promptStore';
import { PromptEditor as PromptEditorComponent } from '../components/prompt/PromptEditor';
import { cn } from '../lib/utils';
import type { Prompt, PromptType, AssetFieldDefinition } from '../types/prompt';

export function AssetEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: asset, isLoading } = useAsset(id || '');
  const { data: fieldDefinitions } = useAssetFieldDefinitions(asset?.prompt_type || 'context');
  const updateAsset = useUpdateAsset();
  
  const { 
    currentPrompt, 
    setCurrentPrompt, 
    updatePromptField, 
    hasUnsavedChanges,
    markAsSaved 
  } = usePromptStore();

  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Load asset into prompt store
  React.useEffect(() => {
    if (asset && !currentPrompt?.id) {
      setCurrentPrompt(asset);
    }
  }, [asset, setCurrentPrompt, currentPrompt?.id]);

  const handleSave = async () => {
    if (!currentPrompt || !id) return;

    setSaveError(null);
    
    try {
      await updateAsset.mutateAsync({
        id,
        title: currentPrompt.title!,
        description: currentPrompt.description,
        content: currentPrompt.content!,
        asset_fields: currentPrompt.asset_fields || {},
        category: currentPrompt.category!,
        complexity: currentPrompt.complexity!,
        tags: currentPrompt.tags || [],
        is_public: currentPrompt.is_public || false,
      });
      
      markAsSaved();
    } catch (error) {
      console.error('Failed to save asset:', error);
      setSaveError('Failed to save asset. Please try again.');
    }
  };

  const updateAssetField = (fieldName: string, value: any) => {
    const assetFields = { ...(currentPrompt?.asset_fields || {}), [fieldName]: value };
    updatePromptField('asset_fields', assetFields);
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

  if (!asset || !currentPrompt) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Asset not found</h1>
          <button
            onClick={() => navigate('/explorer')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Return to Explorer
          </button>
        </div>
      </Layout>
    );
  }

  const getAssetTypeLabel = (type: PromptType) => {
    const labels: Record<PromptType, string> = {
      prompt: 'Prompt',
      context: 'Context Asset',
      response_schema: 'Response Schema Asset',
      response_examples: 'Response Examples Asset',
      persona: 'Persona Asset',
      instructions: 'Instructions Asset',
      constraints: 'Constraints Asset',
      examples: 'Examples Asset',
    };
    return labels[type] || 'Asset';
  };

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
                onClick={() => navigate('/explorer')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Explorer</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Asset Editor</h1>
                  <p className="text-gray-600">
                    {getAssetTypeLabel(currentPrompt.prompt_type!)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || updateAsset.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>
                  {updateAsset.isPending ? 'Saving...' : 'Save Asset'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Asset Details & Custom Fields */}
          <div className="xl:col-span-1 space-y-6">
            <AssetDetailsPanel
              asset={currentPrompt}
              onUpdate={updatePromptField}
            />
            
            {fieldDefinitions && fieldDefinitions.length > 0 && (
              <AssetCustomFieldsPanel
                assetType={currentPrompt.prompt_type!}
                fieldDefinitions={fieldDefinitions}
                values={currentPrompt.asset_fields || {}}
                onUpdate={updateAssetField}
              />
            )}
          </div>

          {/* Center Panel - Content Editor */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[600px]">
              <div className="p-4 border-b border-gray-200 bg-orange-50">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">
                    Asset Content Editor
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {getAssetTypeLabel(currentPrompt.prompt_type!)}
                  </span>
                </div>
              </div>
              <PromptEditorComponent />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface AssetDetailsPanelProps {
  asset: Partial<Prompt>;
  onUpdate: (field: keyof Prompt, value: any) => void;
}

function AssetDetailsPanel({ asset, onUpdate }: AssetDetailsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Details</h3>
      
      <div className="space-y-4">
        {/* Asset Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={asset.title || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter asset title..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={asset.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            className="w-full h-20 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Brief description of your asset..."
          />
        </div>

        {/* Asset Type (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Type
          </label>
          <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
            {asset.prompt_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select 
            value={asset.category || 'general'}
            onChange={(e) => onUpdate('category', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="general">General</option>
            <option value="ai">AI Assistant</option>
            <option value="web">Web Development</option>
            <option value="data">Data Analysis</option>
            <option value="creative">Creative Writing</option>
            <option value="business">Business</option>
            <option value="research">Research</option>
          </select>
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complexity
          </label>
          <select 
            value={asset.complexity || 'simple'}
            onChange={(e) => onUpdate('complexity', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="complex">Complex</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={(asset.tags || []).join(', ')}
            onChange={(e) => onUpdate('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter tags separated by commas..."
          />
        </div>

        {/* Privacy Setting */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={asset.is_public || false}
              onChange={(e) => onUpdate('is_public', e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <div>
              <div className="font-medium text-gray-900">Make Public</div>
              <div className="text-sm text-gray-600">Allow others to discover and use this asset</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

interface AssetCustomFieldsPanelProps {
  assetType: PromptType;
  fieldDefinitions: AssetFieldDefinition[];
  values: Record<string, any>;
  onUpdate: (fieldName: string, value: any) => void;
}

function AssetCustomFieldsPanel({ 
  assetType, 
  fieldDefinitions, 
  values, 
  onUpdate 
}: AssetCustomFieldsPanelProps) {
  const renderField = (field: AssetFieldDefinition) => {
    const value = values[field.field_name] || '';

    switch (field.field_type) {
      case 'text':
      case 'url':
      case 'email':
        return (
          <input
            type={field.field_type}
            value={value}
            onChange={(e) => onUpdate(field.field_name, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={field.field_description}
            required={field.is_required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onUpdate(field.field_name, e.target.value)}
            className="w-full h-20 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={field.field_description}
            required={field.is_required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onUpdate(field.field_name, parseInt(e.target.value) || 0)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={field.field_description}
            required={field.is_required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onUpdate(field.field_name, e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">{field.field_description}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onUpdate(field.field_name, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required={field.is_required}
          >
            <option value="">Select an option...</option>
            {field.field_options?.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.field_options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      onUpdate(field.field_name, [...currentValues, option]);
                    } else {
                      onUpdate(field.field_name, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onUpdate(field.field_name, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required={field.is_required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {assetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Fields
      </h3>
      
      <div className="space-y-4">
        {fieldDefinitions.map((field) => (
          <div key={field.field_name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {field.field_description && (
              <p className="text-xs text-gray-500 mt-1">{field.field_description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}