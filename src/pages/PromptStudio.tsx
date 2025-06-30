import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import type { AIProvider } from '../lib/ai/providers';
import type { GenerationConfig } from '../lib/ai/promptTemplates';
import type { StructureType, Complexity } from '../types/prompt';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { FileUpload } from '../components/prompt/FileUpload';
import { SimpleComponentLibrary } from '../components/prompt/SimpleComponentLibrary';
import { PromptConfigurationPanel } from '@/components/prompt/PromptConfigurationPanel';

export function PromptStudio() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = React.useState('');
  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>('openai');
  const [files, setFiles] = React.useState<File[]>([]);

  // Panel visibility states
  const [showFilePanel, setShowFilePanel] = React.useState(false);
  const [showLibraryPanel, setShowLibraryPanel] = React.useState(false);
  const [showConfigPanel, setShowConfigPanel] = React.useState(false);

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
      const result = await aiGeneration.mutateAsync({ config, provider: selectedProvider });

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

  const handleComponentSelect = (component: any) => {
    setPromptText(prev => prev + `\n\nUsing component: ${component.title}\n${component.description}`);
    setShowLibraryPanel(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Model:</span>
              <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as AIProvider)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">GPT-4 Turbo</SelectItem>
                  <SelectItem value="anthropic">Claude-3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                          <div className="space-y-3">
                            <FileUpload
                              files={files}
                              onFilesChange={setFiles}
                              maxFiles={5}
                              maxSize={10}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Component Library */}
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

                      {/* Prompt Configuration */}
                      <Popover open={showConfigPanel} onOpenChange={setShowConfigPanel}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Sliders className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[600px]"> {/* Changed from w-80 to w-[600px] */}
                          <PromptConfigurationPanel
                            config={promptConfig}
                            onChange={setPromptConfig}
                            isOpen={true}
                            onToggle={() => setShowConfigPanel(false)}
                          />
                        </PopoverContent>
                      </Popover>
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
                          Using {selectedProvider === 'openai' ? 'GPT-4' : 'Claude-3'} to generate an optimized prompt
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