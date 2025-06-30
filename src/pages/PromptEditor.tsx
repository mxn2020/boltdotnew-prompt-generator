import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Save, Download, Plus, AlertCircle, History, FileText, MessageSquare, Info, Code, FileCheck, User, BookOpen, Shield, Lightbulb, FolderOpen } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useAuth } from '../contexts/AuthContext';
import { ensureUserProfile } from '../lib/profile';
import { usePromptStore } from '../stores/promptStore';
import { usePrompt, useCreatePrompt, useUpdatePrompt } from '../hooks/usePrompts';
import { useCreateAsset } from '../hooks/useAssets';
import { useVersions, useCreateVersion, useRestoreVersion } from '../hooks/useVersions';
import { PromptEditor as PromptEditorComponent } from '../components/prompt/PromptEditor';
import { VersionHistory } from '../components/version/VersionHistory';
import { DiffViewer } from '../components/version/DiffViewer';
import { PromptCollectionsPanel } from '../components/prompt/PromptCollectionsPanel';
import { ExportDialog } from '../components/export/ExportDialog';
import { VersionDiffer } from '../lib/version/differ';
import type { StructureType, Complexity, Prompt, PromptType } from '../types/prompt';
import type { PromptVersion, VersionComparison } from '../types/version';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PromptEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const promptId = searchParams.get('prompt');
  const isAsset = searchParams.get('asset') === 'true';
  const { user } = useAuth();
  
  const { 
    currentPrompt, 
    setCurrentPrompt, 
    updatePromptField, 
    hasUnsavedChanges,
    markAsSaved 
  } = usePromptStore();
  
  const { data: existingPrompt } = usePrompt(promptId || '');
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const createAsset = useCreateAsset();
  const createVersion = useCreateVersion();
  const restoreVersion = useRestoreVersion();
  
  const { data: versions = [] } = useVersions(promptId || '');
  
  const [showVersionHistory, setShowVersionHistory] = React.useState(false);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [versionComparison, setVersionComparison] = React.useState<VersionComparison | null>(null);
  const [showCollectionsPanel, setShowCollectionsPanel] = React.useState(false);
  const [showAssetTypeSelector, setShowAssetTypeSelector] = React.useState(isAsset);
  const [selectedAssetType, setSelectedAssetType] = React.useState<PromptType>('prompt');
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Load existing prompt or create new one
  React.useEffect(() => {
    if (promptId && existingPrompt && !currentPrompt?.id) {
      console.log('Loading existing prompt:', existingPrompt);
      setCurrentPrompt(existingPrompt);
    } else if (!promptId && !currentPrompt && !isAsset) {
      console.log('Creating new prompt');
      setCurrentPrompt({
        title: 'Untitled Prompt',
        description: '',
        content: {},
        prompt_type: 'prompt',
        structure_type: 'standard',
        category: 'ai',
        type: 'assistant',
        language: 'english',
        complexity: 'custom',
        is_public: false,
        tags: [],
        version_major: 1,
        version_minor: 0,
        version_batch: 0,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId, existingPrompt, isAsset]);

  const handleSave = async () => {
    if (!currentPrompt) return;

    setSaveError(null);

    try {
      if (!user) {
        setSaveError('You must be logged in to save prompts');
        return;
      }

      const profileResult = await ensureUserProfile(user);
      if (!profileResult.success) {
        setSaveError(profileResult.error || 'Failed to verify user profile');
        return;
      }

      if (currentPrompt.id) {
        await updatePrompt.mutateAsync({
          id: currentPrompt.id,
          title: currentPrompt.title!,
          description: currentPrompt.description,
          content: currentPrompt.content!,
          prompt_type: currentPrompt.prompt_type!,
          structure_type: currentPrompt.structure_type!,
          category: currentPrompt.category!,
          type: currentPrompt.type!,
          language: currentPrompt.language!,
          complexity: currentPrompt.complexity!,
          is_public: currentPrompt.is_public,
          tags: currentPrompt.tags,
          asset_fields: currentPrompt.asset_fields,
          asset_metadata: currentPrompt.asset_metadata,
        });
      } else {
        if (currentPrompt.prompt_type === 'prompt') {
          const newPrompt = await createPrompt.mutateAsync({
            title: currentPrompt.title!,
            description: currentPrompt.description,
            content: currentPrompt.content!,
            prompt_type: 'prompt',
            structure_type: currentPrompt.structure_type!,
            category: currentPrompt.category!,
            type: currentPrompt.type!,
            language: currentPrompt.language!,
            complexity: currentPrompt.complexity!,
            is_public: currentPrompt.is_public || false,
            tags: currentPrompt.tags || [],
          });
          
          navigate(`/editor?prompt=${newPrompt.id}`, { replace: true });
          setCurrentPrompt(newPrompt);
        } else {
          const assetId = await createAsset.mutateAsync({
            title: currentPrompt.title!,
            description: currentPrompt.description,
            asset_type: currentPrompt.prompt_type!,
            content: currentPrompt.content!,
            asset_fields: currentPrompt.asset_fields,
            category: currentPrompt.category!,
            language: currentPrompt.language!,
            complexity: currentPrompt.complexity!,
            tags: currentPrompt.tags || [],
            is_public: currentPrompt.is_public || false,
          });
          
          navigate(`/asset-editor/${assetId}`, { replace: true });
        }
      }
      
      markAsSaved();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code: string; message: string; details?: string };
        
        if (supabaseError.code === '23503') {
          setSaveError('User profile not found. Please refresh the page and try again, or contact support if the issue persists.');
        } else {
          setSaveError(`Save failed: ${supabaseError.message}`);
        }
      } else {
        setSaveError('An unexpected error occurred while saving. Please try again.');
      }
    }
  };

  const handleCreateVersion = async (type: 'major' | 'minor') => {
    if (!currentPrompt?.id) return;

    const changelog = prompt('Enter changelog for this version (optional):');
    
    try {
      await createVersion.mutateAsync({
        prompt_id: currentPrompt.id,
        version_type: type,
        changelog: changelog || undefined,
      });
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const handleRestoreVersion = async (version: PromptVersion) => {
    if (!currentPrompt?.id) return;

    if (window.confirm(`Are you sure you want to restore to version ${version.version_major}.${version.version_minor}.${version.version_batch}?`)) {
      try {
        await restoreVersion.mutateAsync({
          promptId: currentPrompt.id,
          version,
        });
        
        window.location.reload();
      } catch (error) {
        console.error('Failed to restore version:', error);
      }
    }
  };

  const handleCompareVersions = (from: PromptVersion, to: PromptVersion) => {
    const comparison = VersionDiffer.compareVersions(from, to);
    setVersionComparison(comparison);
  };

  const handleExport = (result: { content: string; mimeType: string; filename: string }) => {
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowExportDialog(false);
  };

  const handleNewPrompt = (isAssetPrompt = false) => {
    setCurrentPrompt({
      title: 'Untitled Prompt',
      description: '',
      content: {},
      prompt_type: 'prompt',
      structure_type: 'standard',
      category: 'ai',
      type: 'assistant',
      language: 'english',
      complexity: 'custom',
      is_public: false,
      tags: [],
      version_major: 1,
      version_minor: 0,
      version_batch: 0,
    });
    if (isAssetPrompt) {
      setShowAssetTypeSelector(true);
    } else {
      navigate('/editor', { replace: true });
    }
  };
  
  const handleCreateAsset = () => {
    if (!selectedAssetType) return;
    
    setCurrentPrompt({
      title: `Untitled ${selectedAssetType.replace('_', ' ')}`,
      description: '',
      content: {},
      prompt_type: selectedAssetType,
      structure_type: 'standard',
      category: 'general',
      type: 'asset',
      language: 'english',
      complexity: 'custom',
      is_public: false,
      tags: [],
      version_major: 1,
      version_minor: 0,
      version_batch: 0,
    });
    
    setShowAssetTypeSelector(false);
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
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Prompt Editor</h1>
              <p className="text-muted-foreground mt-1">
                Create and edit prompts with advanced structuring and version control
             </p>
           </div>
           <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
             <Button variant="outline" onClick={() => handleNewPrompt()} size="sm">
               <Plus className="w-4 h-4 mr-2" />
               <span className="hidden sm:inline">New</span>
             </Button>
             <Button variant="outline" onClick={() => handleNewPrompt(true)} size="sm">
               <FileText className="w-4 h-4 mr-2" />
               <span className="hidden sm:inline">New Asset</span>
             </Button>
             <Button 
               variant="outline" 
               onClick={() => setShowVersionHistory(!showVersionHistory)}
               size="sm"
             >
               <History className="w-4 h-4 mr-2" />
               <span className="hidden sm:inline">Versions</span>
             </Button>
             <Button 
               variant="outline" 
               onClick={() => setShowCollectionsPanel(!showCollectionsPanel)}
               disabled={!currentPrompt?.id}
               size="sm"
             >
               <FolderOpen className="w-4 h-4 mr-2" />
               <span className="hidden sm:inline">Collections</span>
             </Button>
             <Button 
               variant="outline" 
               onClick={() => setShowExportDialog(true)}
               disabled={!currentPrompt}
               size="sm"
             >
               <Download className="w-4 h-4 mr-2" />
               <span className="hidden sm:inline">Export</span>
             </Button>
             <Button 
               onClick={handleSave}
               disabled={!hasUnsavedChanges || createPrompt.isPending || updatePrompt.isPending}
               size="sm"
               className="min-w-[100px]"
             >
               <Save className="w-4 h-4 mr-2" />
               {createPrompt.isPending || updatePrompt.isPending ? 'Saving...' : 'Save'}
             </Button>
           </div>
         </div>
       </div>

       {/* Collections Panel */}
       {showCollectionsPanel && currentPrompt?.id && (
         <div className="mb-6 flex justify-end">
           <PromptCollectionsPanel
             promptId={currentPrompt.id}
             isOpen={true}
             onToggle={() => setShowCollectionsPanel(false)}
           />
         </div>
       )}

       {/* Asset Type Selector Modal */}
       <Dialog open={showAssetTypeSelector} onOpenChange={setShowAssetTypeSelector}>
         <DialogContent className="sm:max-w-2xl">
           <DialogHeader>
             <DialogTitle>Select Asset Type</DialogTitle>
           </DialogHeader>
           
           <div className="space-y-6">
             <p className="text-sm text-muted-foreground">
               Choose the type of asset you want to create:
             </p>
             
             {/* Main Prompt Section */}
             <div className="space-y-3">
               <h3 className="text-sm font-semibold text-foreground">Main Prompt</h3>
               <Button
                 variant={selectedAssetType === 'prompt' ? "default" : "outline"}
                 className="w-full p-4 h-auto text-left justify-start"
                 onClick={() => setSelectedAssetType('prompt')}
               >
                 <div className="flex items-start gap-3 w-full">
                   <MessageSquare className="w-5 h-5 mt-0.5 flex-shrink-0" />
                   <div className="flex-1">
                     <div className="font-medium">Prompt</div>
                     <div className="text-sm text-muted-foreground">Main AI prompt with structured content</div>
                   </div>
                 </div>
               </Button>
             </div>
             
             <Separator />
             
             {/* Asset Components Section */}
             <div className="space-y-3">
               <h3 className="text-sm font-semibold text-foreground">Asset Components</h3>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { value: 'context', label: 'Context', description: 'Background information', icon: Info },
                   { value: 'response_schema', label: 'Response Schema', description: 'Output structure', icon: Code },
                   { value: 'response_examples', label: 'Response Examples', description: 'Example outputs', icon: FileCheck },
                   { value: 'persona', label: 'Persona', description: 'Character definition', icon: User },
                   { value: 'instructions', label: 'Instructions', description: 'Specific guidance', icon: BookOpen },
                   { value: 'constraints', label: 'Constraints', description: 'Limitations & rules', icon: Shield },
                   { value: 'examples', label: 'Examples', description: 'Illustrative examples', icon: Lightbulb },
                 ].map((type) => {
                   const IconComponent = type.icon;
                   return (
                     <Button
                       key={type.value}
                       variant={selectedAssetType === type.value ? "default" : "outline"}
                       className="p-3 h-auto text-left justify-start hover:shadow-sm transition-shadow"
                       onClick={() => setSelectedAssetType(type.value as PromptType)}
                     >
                       <div className="flex items-start gap-2 w-full">
                         <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                         <div className="flex-1 min-w-0">
                           <div className="font-medium text-sm truncate">{type.label}</div>
                           <div className="text-xs text-muted-foreground line-clamp-2">{type.description}</div>
                         </div>
                       </div>
                     </Button>
                   );
                 })}
               </div>
             </div>
           </div>
           
           <div className="flex gap-3 pt-4">
             <Button variant="outline" onClick={() => setShowAssetTypeSelector(false)} className="flex-1">
               Cancel
             </Button>
             {selectedAssetType === 'prompt' ? (
               <Button onClick={() => {
               setShowAssetTypeSelector(false);
               handleNewPrompt(false);
               }} className="flex-1">
               Create Prompt
               </Button>
             ) : (
               <Button onClick={handleCreateAsset} className="flex-1">
               Create Asset
               </Button>
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* Main Editor Interface */}
       <div className={`grid gap-6 ${showVersionHistory ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1 xl:grid-cols-3'}`}>
         {/* Left Panel - Prompt Details */}
         <div className="xl:col-span-1 space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Prompt Details</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {/* Prompt Title */}
               <div className="space-y-2">
                 <Label htmlFor="title">Title</Label>
                 <Input
                   id="title"
                   value={currentPrompt?.title || ''}
                   onChange={(e) => updatePromptField('title', e.target.value)}
                   placeholder="Enter prompt title..."
                 />
               </div>

               {/* Description */}
               <div className="space-y-2">
                 <Label htmlFor="description">Description</Label>
                 <Textarea
                   id="description"
                   value={currentPrompt?.description || ''}
                   onChange={(e) => updatePromptField('description', e.target.value)}
                   placeholder="Brief description of your prompt..."
                   className="min-h-[80px]"
                 />
               </div>

               {/* Structure Type */}
               <div className="space-y-2">
                 <Label>Structure Type</Label>
                 <Select 
                   value={currentPrompt?.structure_type || 'standard'}
                   onValueChange={(value) => {
                     const newStructureType = value as StructureType;
                     updatePromptField('structure_type', newStructureType);
                     
                     if (currentPrompt?.structure_type !== newStructureType) {
                       updatePromptField('content', {});
                     }
                   }}
                   disabled={!!currentPrompt?.id || currentPrompt?.prompt_type !== 'prompt'}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="standard">Standard (Segments)</SelectItem>
                     <SelectItem value="structured">Structured (Sections)</SelectItem>
                     <SelectItem value="modulized">Modulized (Modules)</SelectItem>
                     <SelectItem value="advanced">Advanced (Blocks)</SelectItem>
                   </SelectContent>
                 </Select>
                 {currentPrompt?.id && currentPrompt?.prompt_type === 'prompt' && (
                   <p className="text-xs text-muted-foreground">
                     Structure type cannot be changed for existing prompts
                   </p>
                 )}
                 {currentPrompt?.prompt_type !== 'prompt' && (
                   <p className="text-xs text-muted-foreground">
                     Structure type is fixed for assets
                   </p>
                 )}
               </div>

               {/* Complexity - Only show for existing prompts, disabled for AI-generated ones */}
               {currentPrompt?.id && (
                 <div className="space-y-2">
                   <Label>Complexity</Label>
                   <Select 
                     value={currentPrompt?.complexity || 'custom'}
                     onValueChange={(value) => updatePromptField('complexity', value as Complexity)}
                     disabled={currentPrompt?.complexity !== 'custom'}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="simple">Simple (AI-generated)</SelectItem>
                       <SelectItem value="medium">Medium (AI-generated)</SelectItem>
                       <SelectItem value="complex">Complex (AI-generated)</SelectItem>
                       <SelectItem value="custom">Custom (User-created)</SelectItem>
                     </SelectContent>
                   </Select>
                   {currentPrompt?.complexity !== 'custom' && (
                     <p className="text-xs text-muted-foreground">
                       AI-generated complexity cannot be modified
                     </p>
                   )}
                 </div>
               )}

               {/* Category */}
               <div className="space-y-2">
                 <Label>Category</Label>
                 <Select 
                   value={currentPrompt?.category || 'ai'}
                   onValueChange={(value) => updatePromptField('category', value)}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="ai">AI Assistant</SelectItem>
                     <SelectItem value="web">Web Development</SelectItem>
                     <SelectItem value="data">Data Analysis</SelectItem>
                     <SelectItem value="creative">Creative Writing</SelectItem>
                     <SelectItem value="business">Business</SelectItem>
                     <SelectItem value="research">Research</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Type */}
               <div className="space-y-2">
                 <Label>Type</Label>
                 <Select 
                   value={currentPrompt?.type || 'assistant'}
                   onValueChange={(value) => updatePromptField('type', value)}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="assistant">Assistant</SelectItem>
                     <SelectItem value="analyzer">Analyzer</SelectItem>
                     <SelectItem value="generator">Generator</SelectItem>
                     <SelectItem value="optimizer">Optimizer</SelectItem>
                     <SelectItem value="tool">Tool</SelectItem>
                     <SelectItem value="agent">Agent</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Language */}
               <div className="space-y-2">
                 <Label>Language</Label>
                 <Select 
                   value={currentPrompt?.language || 'english'}
                   onValueChange={(value) => updatePromptField('language', value)}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="english">English</SelectItem>
                     <SelectItem value="french">French</SelectItem>
                     <SelectItem value="german">German</SelectItem>
                     <SelectItem value="spanish">Spanish</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Privacy Setting */}
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="public"
                   checked={currentPrompt?.is_public || false}
                   onCheckedChange={(checked) => updatePromptField('is_public', checked)}
                 />
                 <div className="grid gap-1.5 leading-none">
                   <Label htmlFor="public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                     Make Public
                   </Label>
                   <p className="text-xs text-muted-foreground">
                     Allow others to discover and use this prompt
                   </p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Center Panel - Editor */}
         <div className={showVersionHistory ? "xl:col-span-2" : "xl:col-span-2"}>
           <Card className="h-full min-h-[600px]">
             <PromptEditorComponent />
           </Card>
         </div>

         {/* Right Panel - Version History */}
         {showVersionHistory && (
           <div className="xl:col-span-1">
             <VersionHistory
               versions={versions}
               currentVersion={versions.find(v => 
                 v.version_major === currentPrompt?.version_major &&
                 v.version_minor === currentPrompt?.version_minor &&
                 v.version_batch === currentPrompt?.version_batch
               )}
               onSelectVersion={(version) => {
                 console.log('Selected version:', version);
               }}
               onRestoreVersion={handleRestoreVersion}
               onCreateVersion={handleCreateVersion}
               onCompareVersions={handleCompareVersions}
             />
           </div>
         )}
       </div>

       {/* Modals */}
       {versionComparison && (
         <DiffViewer
           comparison={versionComparison}
           onClose={() => setVersionComparison(null)}
         />
       )}

       {showExportDialog && currentPrompt && currentPrompt.id && (
         <ExportDialog
           prompt={currentPrompt as Prompt}
           onClose={() => setShowExportDialog(false)}
           onExport={handleExport}
         />
       )}
     </div>
   </Layout>
 );
}