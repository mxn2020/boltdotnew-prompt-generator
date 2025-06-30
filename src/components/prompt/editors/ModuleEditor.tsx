import React from 'react';
import { Plus, GripVertical, X, Settings, Code } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import type { PromptModule } from '../../../types/prompt';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { Badge } from "@/components/ui/badge";

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
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">Modulized Prompt Components</h3>
          <p className="text-muted-foreground">
            Build reusable modules with processing wrappers for advanced prompt composition.
          </p>
        </div>
        <Button onClick={handleAddModule} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Module
        </Button>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No modules yet</h4>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Create reusable modules that can be combined and processed with wrappers.
              </p>
              <Button onClick={handleAddModule} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Module
              </Button>
            </CardContent>
          </Card>
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
        <Alert className="border-purple-200 bg-purple-50">
          <Settings className="h-4 w-4" />
          <AlertDescription className="text-purple-800">
            <div className="font-medium mb-2">💡 Tips for Modulized Prompts</div>
            <ul className="space-y-1 text-sm">
              <li>• Design modules to be reusable across different prompts</li>
              <li>• Use wrappers to define how modules should be processed</li>
              <li>• Consider creating modules for common patterns like examples, constraints, or formatting</li>
              <li>• Modules can be saved to your library for use in other prompts</li>
            </ul>
          </AlertDescription>
        </Alert>
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
    <Card className="border-purple-200 shadow-sm">
      {/* Module Header */}
      <CardHeader className="bg-purple-50/50 border-b border-purple-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="cursor-grab p-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>

          <Input
            value={module.title}
            onChange={(e) => onUpdate(module.id, 'title', e.target.value)}
            placeholder="Module title..."
            className="flex-1 h-8 font-medium border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-purple-500"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="p-1"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Module Content */}
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor={`desc-${module.id}`}>Description</Label>
            <Input
              id={`desc-${module.id}`}
              value={module.description || ''}
              onChange={(e) => onUpdate(module.id, 'description', e.target.value)}
              placeholder="Brief description of this module..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor={`content-${module.id}`}>Module Content</Label>
            <Textarea
              id={`content-${module.id}`}
              value={module.content}
              onChange={(e) => onUpdate(module.id, 'content', e.target.value)}
              placeholder="Enter module content..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {module.content.length} characters
              </span>
            </div>
          </div>

          {/* Wrapper Selection */}
          <div className="space-y-2">
            <Label htmlFor={`wrapper-${module.id}`}>Processing Wrappers</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(module.wrappers || []).length > 0 ? (
                  (module.wrappers || []).map((wrapper) => (
                    <Badge 
                      key={wrapper} 
                      variant="secondary" 
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Code className="w-3 h-3" />
                      <span>{wrapper}</span>
                      <button 
                        onClick={() => {
                          const updatedWrappers = (module.wrappers || []).filter(w => w !== wrapper);
                          onUpdate(module.id, 'wrappers', updatedWrappers);
                        }}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No wrappers applied</div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    if (value && value !== 'no_wrapper') {
                      const currentWrappers = module.wrappers || [];
                      if (!currentWrappers.includes(value)) {
                        onUpdate(module.id, 'wrappers', [...currentWrappers, value]);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add wrapper" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_wrapper">No wrapper</SelectItem>
                    <SelectItem value="format-json">Format as JSON</SelectItem>
                    <SelectItem value="format-list">Format as List</SelectItem>
                    <SelectItem value="format-table">Format as Table</SelectItem>
                    <SelectItem value="validate-input">Validate Input</SelectItem>
                    <SelectItem value="transform-data">Transform Data</SelectItem>
                    <SelectItem value="conditional-logic">Conditional Logic</SelectItem>
                    <SelectItem value="error-handling">Error Handling</SelectItem>
                    <SelectItem value="format-markdown">Format as Markdown</SelectItem>
                    <SelectItem value="format-yaml">Format as YAML</SelectItem>
                    <SelectItem value="format-xml">Format as XML</SelectItem>
                    <SelectItem value="format-csv">Format as CSV</SelectItem>
                    <SelectItem value="summarize">Summarize Content</SelectItem>
                    <SelectItem value="translate">Translate Content</SelectItem>
                    <SelectItem value="custom">Custom Wrapper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Wrappers are applied in sequence, from first to last
              </p>
            </div>
          </div>

          {/* Configuration */}
          <Collapsible open={showConfig} onOpenChange={setShowConfig}>
            <CollapsibleContent className="space-y-2">
              <div className="border-t pt-4">
                <Label htmlFor={`config-${module.id}`}>Module Configuration (JSON)</Label>
                <Textarea
                  id={`config-${module.id}`}
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
                  className="min-h-[100px] font-mono text-sm resize-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}