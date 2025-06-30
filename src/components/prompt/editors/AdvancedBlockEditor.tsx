import React from 'react';
import { Plus, GripVertical, X, Folder, FileText, ChevronDown, ChevronRight, Code } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import { ModuleComposer } from '../components/ModuleComposer';
import { AssetIntegrator } from '../components/AssetIntegrator';
import type { PromptBlock } from '../../../types/prompt';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdvancedBlockEditor() {
  const { 
    currentPrompt, 
    addBlock, 
    updateBlock, 
    removeBlock, 
    reorderBlocks 
  } = usePromptStore();

  const blocks = currentPrompt?.content?.blocks || [];

  const handleAddBlock = () => {
    addBlock({
      title: 'New Block',
      description: '',
      modules: [],
      assets: [],
    });
  };

  const handleUpdateBlock = (id: string, field: keyof PromptBlock, value: any) => {
    updateBlock(id, { [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">Advanced Prompt Architecture</h3>
          <p className="text-muted-foreground">
            Create sophisticated prompt structures with organizational blocks, modules, wrappers, and assets.
          </p>
        </div>
        <Button onClick={handleAddBlock} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </div>

      {/* Architecture Overview */}
      <Alert className="border-amber-200 bg-amber-50">
        <Folder className="h-4 w-4" />
        <AlertDescription className="text-amber-800">
          <div className="font-medium mb-2">🏗️ Advanced Architecture Features</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>• Organizational blocks for logical grouping</div>
            <div>• Nested modules with processing wrappers</div>
            <div>• Asset integration (prompts, files, URLs)</div>
            <div>• Complex dependency management</div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Blocks */}
      <div className="space-y-6">
        {blocks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No blocks yet</CardTitle>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Build sophisticated prompt architectures with organizational blocks containing modules and assets.
              </p>
              <Button onClick={handleAddBlock} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Block
              </Button>
            </CardContent>
          </Card>
        ) : (
          blocks.map((block, index) => (
            <AdvancedBlockItem
              key={block.id}
              block={block}
              onUpdate={handleUpdateBlock}
              onRemove={() => removeBlock(block.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AdvancedBlockItemProps {
  block: PromptBlock;
  onUpdate: (id: string, field: keyof PromptBlock, value: any) => void;
  onRemove: () => void;
}

function AdvancedBlockItem({ block, onUpdate, onRemove }: AdvancedBlockItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'modules' | 'assets'>('modules');

  const addModuleToBlock = () => {
    const newModule = {
      id: crypto.randomUUID(),
      title: 'New Module',
      content: '',
      order: block.modules.length,
    };
    
    onUpdate(block.id, 'modules', [...block.modules, newModule]);
  };

  const updateModuleInBlock = (moduleId: string, updates: any) => {
    const updatedModules = block.modules.map(module =>
      module.id === moduleId ? { ...module, ...updates } : module
    ); 
    
    // If we're updating wrappers, make sure it's an array
    if (updates.wrappers && !Array.isArray(updates.wrappers)) {
      updates.wrappers = [updates.wrappers].filter(Boolean);
    }
    
    onUpdate(block.id, 'modules', updatedModules);
  };

  const removeModuleFromBlock = (moduleId: string) => {
    const updatedModules = block.modules
      .filter(module => module.id !== moduleId)
      .map((module, index) => ({ ...module, order: index }));
    onUpdate(block.id, 'modules', updatedModules);
  };

  const addAssetToBlock = (asset: any) => {
    const currentAssets = block.assets || [];
    onUpdate(block.id, 'assets', [...currentAssets, asset]);
  };

  const removeAssetFromBlock = (assetId: string) => {
    const currentAssets = block.assets || [];
    const updatedAssets = currentAssets.filter(asset => asset.id !== assetId);
    onUpdate(block.id, 'assets', updatedAssets);
  };

  return (
    <Card className="border-amber-200 shadow-sm">
      {/* Block Header */}
      <CardHeader className="bg-amber-50/50 border-b border-amber-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="cursor-grab p-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <Folder className="h-5 w-5 text-amber-600" />

          <Input
            value={block.title}
            onChange={(e) => onUpdate(block.id, 'title', e.target.value)}
            placeholder="Block title..."
            className="flex-1 h-8 font-medium border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-amber-500"
          />

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {block.modules.length} modules
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {(block.assets || []).length} assets
            </Badge>
          </div>

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

      {/* Block Content */}
      {isExpanded && (
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor={`desc-${block.id}`}>Block Description</Label>
              <Textarea
                id={`desc-${block.id}`}
                value={block.description || ''}
                onChange={(e) => onUpdate(block.id, 'description', e.target.value)}
                placeholder="Describe the purpose and organization of this block..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules" className="gap-2">
                  Modules
                  <Badge variant="secondary" className="text-xs">
                    {block.modules.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="assets" className="gap-2">
                  Assets
                  <Badge variant="secondary" className="text-xs">
                    {(block.assets || []).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <TabsContent value="modules" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Block Modules</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addModuleToBlock}
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Add Module
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {block.modules.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">No modules in this block</p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={addModuleToBlock}
                            className="h-auto p-0"
                          >
                            Add your first module
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      block.modules.map((module) => (
                        <ModuleComposer
                          key={module.id}
                          module={module}
                          onUpdate={(updates) => updateModuleInBlock(module.id, updates)}
                          onRemove={() => removeModuleFromBlock(module.id)}
                          compact={true}
                        />
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assets" className="mt-6">
                <AssetIntegrator
                  assets={block.assets || []}
                  onAddAsset={addAssetToBlock}
                  onRemoveAsset={removeAssetFromBlock}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      )}
    </Card>
  );
}