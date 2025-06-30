import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  Sparkles, 
  Paperclip,
  Library,
  Wand2,
  Loader2,
  Sliders
} from 'lucide-react';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { useCreatePrompt } from '../hooks/usePrompts';
import { getCurrentModelDisplayName } from '../lib/ai/config';
import { FileUpload } from '../components/prompt/FileUpload';
import { SimpleComponentLibrary } from '../components/prompt/SimpleComponentLibrary';
import type { GenerationConfig } from '../lib/ai/promptTemplates';
import type { StructureType, Complexity, PromptType } from '../types/prompt';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PromptConfigurationPanel } from '@/components/prompt/PromptConfigurationPanel';

export function PromptStudio() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  
  // Panel visibility states
  const [showFilePanel, setShowFilePanel] = React.useState(false);
  const [showLibraryPanel, setShowLibraryPanel] = React.useState(false);
  const [showConfigPanel, setShowConfigPanel] = React.useState(false);
  
  // Temporary state for mobile sheets
  const [tempFiles, setTempFiles] = React.useState<File[]>([]);
  const [tempPromptConfig, setTempPromptConfig] = React.useState({
    prompt_type: 'prompt' as PromptType,
    structure_type: 'standard' as StructureType,
    complexity: 'simple' as Complexity,
    category: 'ai',
    type: 'assistant',
    language: 'english'
  });
  
  // Prompt configuration
  const [promptConfig, setPromptConfig] = React.useState({
    prompt_type: 'prompt' as PromptType,
    structure_type: 'standard' as StructureType,
    complexity: 'simple' as Complexity,
    category: 'ai',
    type: 'assistant',
    language: 'english'
  });
  
  const aiGeneration = useAIGeneration();
  const createPrompt = useCreatePrompt();

  // Check if mobile (you might want to use a more sophisticated breakpoint hook)
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    
    const config: GenerationConfig = {
      userInput: promptText.trim(),
      structureType: promptConfig.structure_type,
      complexity: promptConfig.complexity,
      category: promptConfig.category,
      type: promptConfig.type,
      language: promptConfig.language,
      fileContext: files.length > 0 ? `Uploaded ${files.length} context files` : undefined,
    };

    try {
      const result = await aiGeneration.mutateAsync({ config });
      
      // Create a new prompt with the generated content
      const newPrompt = await createPrompt.mutateAsync({
        title: `Generated Prompt - ${new Date().toLocaleDateString()}`,
        description: `AI-generated prompt from: "${promptText.substring(0, 100)}..."`,
        content: result.content,
        structure_type: promptConfig.structure_type,
        category: promptConfig.category,
        type: promptConfig.type,
        language: promptConfig.language,
        complexity: promptConfig.complexity,
        is_public: false,
        tags: ['ai-generated'],
      });
      
      // Navigate to the prompt editor to view/edit the result
      navigate(`/editor?prompt=${newPrompt.id}`);
      
    } catch (error: any) {
      console.error('AI generation failed:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Mobile sheet handlers
  const handleFileSheetOpen = () => {
    setTempFiles([...files]);
    setShowFilePanel(true);
  };

  const handleFileSheetApply = () => {
    setFiles([...tempFiles]);
    setShowFilePanel(false);
  };

  const handleFileSheetCancel = () => {
    setTempFiles([]);
    setShowFilePanel(false);
  };

  const handleConfigSheetOpen = () => {
    setTempPromptConfig({...promptConfig});
    setShowConfigPanel(true);
  };

  const handleConfigSheetApply = () => {
    setPromptConfig({...tempPromptConfig});
    setShowConfigPanel(false);
  };

  const handleConfigSheetCancel = () => {
    setShowConfigPanel(false);
  };

  // File Attachment Component
  const FileAttachmentButton = () => {
    if (isMobile) {
      return (
        <Sheet open={showFilePanel} onOpenChange={setShowFilePanel}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="relative" onClick={handleFileSheetOpen}>
              <Paperclip className="w-4 h-4" />
              {files.length > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {files.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Add Context Files</SheetTitle>
              <SheetDescription>
                Upload files to provide additional context for your prompt
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <FileUpload
                files={tempFiles}
                onFilesChange={setTempFiles}
                maxFiles={5}
                maxSize={10}
              />
            </div>
            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={handleFileSheetCancel}>
                Cancel
              </Button>
              <Button onClick={handleFileSheetApply}>
                Apply ({tempFiles.length} files)
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Popover open={showFilePanel} onOpenChange={setShowFilePanel}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Paperclip className="w-4 h-4" />
            {files.length > 0 && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {files.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            maxFiles={5}
            maxSize={10}
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Component Library Button
  const ComponentLibraryButton = () => {
    if (isMobile) {
      return (
        <Sheet open={showLibraryPanel} onOpenChange={setShowLibraryPanel}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Library className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Component Library</SheetTitle>
              <SheetDescription>
                Search and select reusable components for your prompt
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <SimpleComponentLibrary
                onSelectComponent={(component) => {
                  setPromptText(prev => prev + `\n\nUsing component: ${component.title}\n${component.description}`);
                  setShowLibraryPanel(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Popover open={showLibraryPanel} onOpenChange={setShowLibraryPanel}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Library className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-96 overflow-hidden">
          <SimpleComponentLibrary
            onSelectComponent={(component) => {
              setPromptText(prev => prev + `\n\nUsing component: ${component.title}\n${component.description}`);
              setShowLibraryPanel(false);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Configuration Button
  const ConfigurationButton = () => {
    if (isMobile) {
      return (
        <Sheet open={showConfigPanel} onOpenChange={setShowConfigPanel}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleConfigSheetOpen}>
              <Sliders className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Prompt Configuration</SheetTitle>
              <SheetDescription>
                Customize generation parameters for your prompt
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 overflow-y-auto">
              <PromptConfigurationPanel
                config={tempPromptConfig}
                onChange={setTempPromptConfig}
                isOpen={true}
                onToggle={() => {}}
                isMobile={true}
              />
            </div>
            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={handleConfigSheetCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfigSheetApply}>
                Apply Configuration
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Popover open={showConfigPanel} onOpenChange={setShowConfigPanel}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Sliders className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px]">
          <PromptConfigurationPanel
            config={promptConfig}
            onChange={setPromptConfig}
            isOpen={true}
            onToggle={() => setShowConfigPanel(false)}
            isMobile={false}
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Main Chat Interface */}
          <div className="max-w-4xl mx-auto">
            <Card className="w-full">
              {/* Chat Header */}
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">
                  What can I help you create today?
                </CardTitle>
                <p className="text-muted-foreground">
                  Describe your prompt and I'll generate an optimized version using AI
                </p>
              </CardHeader>

              {/* Chat Content */}
              <CardContent className="space-y-6">
                {/* Main Textarea */}
                <div className="relative">
                  <Textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe the prompt you want to create..."
                    className="min-h-[120px] resize-none"
                    disabled={aiGeneration.isPending}
                  />
                
                 {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {/* File Attachment */}
                      <FileAttachmentButton />

                      {/* Component Library */}
                      <ComponentLibraryButton />

                      {/* Prompt Configuration */}
                      <ConfigurationButton />
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={!promptText.trim() || aiGeneration.isPending}
                      className="min-w-[120px]"
                    >
                      {aiGeneration.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Generation Status */}
                {aiGeneration.isPending && (
                  <Alert>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <AlertDescription>
                      <div>
                        <p className="font-medium">Creating your prompt with AI...</p>
                        <p className="text-sm text-muted-foreground">
                          Using {getCurrentModelDisplayName()} to generate an optimized prompt
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error State */}
                {aiGeneration.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div>
                        <p className="font-medium">Generation failed</p>
                        <p className="text-sm">
                          {aiGeneration.error?.message || 'Please try again or check your API configuration'}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setPromptText('Create a helpful AI assistant that can answer questions about web development and provide code examples.')}
                  >
                    <div>
                      <div className="font-medium text-sm">Web Dev Assistant</div>
                      <div className="text-xs text-muted-foreground">Create a coding helper</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setPromptText('Design a creative writing assistant that helps with storytelling, character development, and plot structure.')}
                  >
                    <div>
                      <div className="font-medium text-sm">Creative Writer</div>
                      <div className="text-xs text-muted-foreground">Storytelling assistant</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setPromptText('Build a data analysis expert that can interpret datasets, create visualizations, and provide insights.')}
                  >
                    <div>
                      <div className="font-medium text-sm">Data Analyst</div>
                      <div className="text-xs text-muted-foreground">Data insights helper</div>
                    </div>
                  </Button>
                </div>

                {/* Active Configuration Summary */}
                {(files.length > 0 || promptConfig.complexity !== 'simple' || promptConfig.category !== 'ai') && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Active Configuration</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {files.length > 0 && (
                        <Badge variant="outline">
                          {files.length} files attached
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {promptConfig.complexity} complexity
                      </Badge>
                      <Badge variant="outline">
                        {promptConfig.category} category
                      </Badge>
                      <Badge variant="outline">
                        {promptConfig.structure_type} structure
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keyboard Shortcut Hint */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘ + Enter</kbd> to generate
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}