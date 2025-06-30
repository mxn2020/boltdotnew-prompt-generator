import React from 'react';
import { X, Code, Layers, FileText, Link } from 'lucide-react';
import { useCreateComponent } from '../../../hooks/useComponents';
import { cn } from '../../../lib/utils';
import type { ComponentType } from '../../../types/component';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
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
      if (onSuccess) {
        onSuccess(result);
      } else {
        window.location.href = `/component-editor/${result}`;
      }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create New Component</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] pr-2">
          {/* Component Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Component Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {componentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      formData.type === type.value
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-muted-foreground'
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as ComponentType }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Component title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this component does..."
              className="min-h-[80px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="public" className="text-sm font-medium">
                Make Public
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow others to discover and use this component
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createComponent.isPending || !formData.title.trim()}
          >
            {createComponent.isPending ? 'Creating...' : 'Create Component'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}