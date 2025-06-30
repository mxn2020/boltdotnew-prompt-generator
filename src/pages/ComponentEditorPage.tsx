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
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!component || !componentData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Component not found</h1>
          <Button onClick={() => navigate('/library')} variant="outline">
            Return to Library
          </Button>
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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {/* Error Display */}
          {saveError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/library')} className="p-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Library</span>
                <span className="sm:hidden">Back</span>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Component Editor</h1>
                  <Badge variant="secondary" className="mt-1">
                    {componentData.type} component
                  </Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges || updateComponent.isPending}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateComponent.isPending ? 'Saving...' : 'Save Component'}
            </Button>
          </div>
        </div>

        {/* Editor Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
    <Card>
      <CardHeader>
        <CardTitle>Component Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Component Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={component.title || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
            placeholder="Enter component title..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={component.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Brief description of your component..."
            className="min-h-[80px]"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={component.category || 'general'} onValueChange={(value) => onUpdate('category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="formatting">Formatting</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={(component.tags || []).join(', ')}
            onChange={(e) => onUpdate('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
            placeholder="Enter tags separated by commas..."
          />
        </div>

        {/* Privacy Setting */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="public"
            checked={component.is_public || false}
            onCheckedChange={(checked) => onUpdate('is_public', checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Make Public
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow others to discover and use this component
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="h-full min-h-[600px]">
      <CardHeader>
        <CardTitle>
          {component.type?.charAt(0).toUpperCase()}{component.type?.slice(1)} Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderEditor()}
      </CardContent>
    </Card>
  );
}

function ModuleContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Module Content</Label>
        <Textarea
          value={content.moduleContent || ''}
          onChange={(e) => onUpdate('moduleContent', e.target.value)}
          placeholder="Enter your module content here..."
          className="min-h-[200px] font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label>Module Configuration (JSON)</Label>
        <Textarea
          value={JSON.stringify(content.moduleConfig || {}, null, 2)}
          onChange={(e) => {
            try {
              const config = JSON.parse(e.target.value);
              onUpdate('moduleConfig', config);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"key": "value"}'
          className="min-h-[120px] font-mono text-sm"
        />
      </div>
    </div>
  );
}

function WrapperContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Wrapper Type</Label>
        <Select value={content.wrapperType || 'custom'} onValueChange={(value) => onUpdate('wrapperType', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="format-json">Format as JSON</SelectItem>
            <SelectItem value="format-list">Format as List</SelectItem>
            <SelectItem value="format-table">Format as Table</SelectItem>
            <SelectItem value="validate-input">Validate Input</SelectItem>
            <SelectItem value="transform-data">Transform Data</SelectItem>
            <SelectItem value="conditional-logic">Conditional Logic</SelectItem>
            <SelectItem value="custom">Custom Wrapper</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Wrapper Logic</Label>
        <Textarea
          value={content.wrapperLogic || ''}
          onChange={(e) => onUpdate('wrapperLogic', e.target.value)}
          placeholder="Define your wrapper logic here..."
          className="min-h-[200px] font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label>Wrapper Configuration (JSON)</Label>
        <Textarea
          value={JSON.stringify(content.wrapperConfig || {}, null, 2)}
          onChange={(e) => {
            try {
              const config = JSON.parse(e.target.value);
              onUpdate('wrapperConfig', config);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"key": "value"}'
          className="min-h-[120px] font-mono text-sm"
        />
      </div>
    </div>
  );
}

function TemplateContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Template Structure (JSON)</Label>
        <Textarea
          value={JSON.stringify(content.templateStructure || {}, null, 2)}
          onChange={(e) => {
            try {
              const structure = JSON.parse(e.target.value);
              onUpdate('templateStructure', structure);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"sections": [{"title": "Section 1", "content": "Template content..."}]}'
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Template Variables (JSON)</Label>
        <Textarea
          value={JSON.stringify(content.templateVariables || [], null, 2)}
          onChange={(e) => {
            try {
              const variables = JSON.parse(e.target.value);
              onUpdate('templateVariables', variables);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='[{"name": "variable1", "type": "string", "required": true}]'
          className="min-h-[120px] font-mono text-sm"
        />
      </div>
    </div>
  );
}

function AssetContentEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Asset Type</Label>
        <Select value={content.assetType || 'url'} onValueChange={(value) => onUpdate('assetType', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prompt">Prompt Reference</SelectItem>
            <SelectItem value="file">File Upload</SelectItem>
            <SelectItem value="url">URL Reference</SelectItem>
            <SelectItem value="image">Image Asset</SelectItem>
            <SelectItem value="document">Document Asset</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Asset Reference</Label>
        <Input
          value={content.assetReference || ''}
          onChange={(e) => onUpdate('assetReference', e.target.value)}
          placeholder="Enter asset reference (URL, file path, etc.)"
        />
      </div>

      <div className="space-y-2">
        <Label>Asset Metadata (JSON)</Label>
        <Textarea
          value={JSON.stringify(content.assetMetadata || {}, null, 2)}
          onChange={(e) => {
            try {
              const metadata = JSON.parse(e.target.value);
              onUpdate('assetMetadata', metadata);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"description": "Asset description", "tags": ["tag1", "tag2"]}'
          className="min-h-[120px] font-mono text-sm"
        />
      </div>
    </div>
  );
}