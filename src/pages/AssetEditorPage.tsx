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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!asset || !currentPrompt) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Asset not found</h1>
          <Button onClick={() => navigate('/explorer')} variant="outline">
            Return to Explorer
          </Button>
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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {/* Error Display */}
          {saveError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {saveError}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveError(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/explorer')} className="p-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Explorer</span>
                <span className="sm:hidden">Back</span>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Asset Editor</h1>
                  <Badge variant="secondary" className="mt-1">
                    {getAssetTypeLabel(currentPrompt.prompt_type!)}
                  </Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges || updateAsset.isPending}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateAsset.isPending ? 'Saving...' : 'Save Asset'}
            </Button>
          </div>
        </div>

        {/* Editor Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
            <Card className="h-full min-h-[600px]">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Asset Content Editor
                  <Badge variant="outline" className="text-orange-700 border-orange-200">
                    {getAssetTypeLabel(currentPrompt.prompt_type!)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PromptEditorComponent />
              </CardContent>
            </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Asset Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={asset.title || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
            placeholder="Enter asset title..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={asset.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Brief description of your asset..."
            className="min-h-[80px]"
          />
        </div>

        {/* Asset Type (Read-only) */}
        <div className="space-y-2">
          <Label>Asset Type</Label>
          <Input
            value={asset.prompt_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            disabled
            className="bg-muted"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={asset.category || 'general'} onValueChange={(value) => onUpdate('category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="ai">AI Assistant</SelectItem>
              <SelectItem value="web">Web Development</SelectItem>
              <SelectItem value="data">Data Analysis</SelectItem>
              <SelectItem value="creative">Creative Writing</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Complexity */}
        <div className="space-y-2">
          <Label>Complexity</Label>
          <Select value={asset.complexity || 'simple'} onValueChange={(value) => onUpdate('complexity', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={(asset.tags || []).join(', ')}
            onChange={(e) => onUpdate('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
            placeholder="Enter tags separated by commas..."
          />
        </div>

        {/* Privacy Setting */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="public"
            checked={asset.is_public || false}
            onCheckedChange={(checked) => onUpdate('is_public', checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Make Public
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow others to discover and use this asset
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
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
          <Input
            type={field.field_type}
            value={value}
            onChange={(e) => onUpdate(field.field_name, e.target.value)}
            placeholder={field.field_description}
            required={field.is_required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onUpdate(field.field_name, e.target.value)}
            placeholder={field.field_description}
            required={field.is_required}
            className="min-h-[80px]"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onUpdate(field.field_name, parseInt(e.target.value) || 0)}
            placeholder={field.field_description}
            required={field.is_required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.field_name}
              checked={!!value}
              onCheckedChange={(checked) => onUpdate(field.field_name, checked)}
            />
            <Label htmlFor={field.field_name} className="text-sm">
              {field.field_description}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(value) => onUpdate(field.field_name, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.field_options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.field_options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.field_name}-${option}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      onUpdate(field.field_name, [...currentValues, option]);
                    } else {
                      onUpdate(field.field_name, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${field.field_name}-${option}`} className="text-sm">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => onUpdate(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {assetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Fields
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fieldDefinitions.map((field) => (
          <div key={field.field_name} className="space-y-2">
            <Label>
              {field.field_label}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderField(field)}
            {field.field_description && (
              <p className="text-xs text-muted-foreground">{field.field_description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}