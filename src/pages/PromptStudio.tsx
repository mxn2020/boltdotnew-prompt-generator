import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  Sparkles, 
  Plus, 
  Settings, 
  Mic, 
  Paperclip,
  Library,
  Wand2,
  ChevronDown,
  Send,
  Loader2
} from 'lucide-react';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { useCreatePrompt } from '../hooks/usePrompts';
import { ConfigurationPanel } from '../components/ai/ConfigurationPanel';
import { FileUpload } from '../components/prompt/FileUpload';
import { ComponentLibrary } from '../components/prompt/components/ComponentLibrary';
import * as Popover from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { AIProvider } from '../lib/ai/providers';
import type { GenerationConfig } from '../lib/ai/promptTemplates';
import { cn } from '../lib/utils';

export function PromptStudio() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = React.useState('');
  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>('openai');
  const [files, setFiles] = React.useState<File[]>([]);
  const [showConfigPanel, setShowConfigPanel] = React.useState(false);
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const [showLibrary, setShowLibrary] = React.useState(false);
  
  const aiGeneration = useAIGeneration();
  const createPrompt = useCreatePrompt();

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    
    const config: GenerationConfig = {
      userInput: promptText.trim(),
      structureType: 'standard',
      complexity: 'simple',
      category: 'ai',
      type: 'assistant',
      language: 'english',
      fileContext: files.length > 0 ? `Uploaded ${files.length} context files` : undefined,
    };

    try {
      const result = await aiGeneration.mutateAsync({ config, provider: selectedProvider });
      
      // Create a new prompt with the generated content
      const newPrompt = await createPrompt.mutateAsync({
        title: `Generated Prompt - ${new Date().toLocaleDateString()}`,
        description: `AI-generated prompt from: "${promptText.substring(0, 100)}..."`,
        content: result.content,
        structure_type: 'standard',
        category: 'ai',
        type: 'assistant',
        language: 'english',
        complexity: 'simple',
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/editor')}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Prompt</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Model:</span>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium">
                      {selectedProvider === 'openai' ? 'GPT-4' : 'Claude-3'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[150px] z-50">
                    <DropdownMenu.Item
                      onClick={() => setSelectedProvider('openai')}
                      className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer"
                    >
                      GPT-4 Turbo
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={() => setSelectedProvider('anthropic')}
                      className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer"
                    >
                      Claude-3 Sonnet
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-100">
              <h1 className="text-2xl font-semibold text-gray-900 text-center">
                What can I help you create today?
              </h1>
            </div>

            {/* Chat Content */}
            <div className="p-6">
              {/* Main Textarea */}
              <div className="relative">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the prompt you want to create..."
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  disabled={aiGeneration.isPending}
                />
                
                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    {/* Add Files */}
                    <Popover.Root open={showFileUpload} onOpenChange={setShowFileUpload}>
                      <Popover.Trigger asChild>
                        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm">Files</span>
                          {files.length > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                              {files.length}
                            </span>
                          )}
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-80 z-50">
                          <div className="mb-3">
                            <h3 className="font-medium text-gray-900">Add Context Files</h3>
                            <p className="text-sm text-gray-600">Upload files to provide additional context</p>
                          </div>
                          <FileUpload
                            files={files}
                            onFilesChange={setFiles}
                            maxFiles={5}
                            maxSize={10}
                          />
                          <Popover.Arrow className="fill-white" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>

                    {/* Add Library */}
                    <Popover.Root open={showLibrary} onOpenChange={setShowLibrary}>
                      <Popover.Trigger asChild>
                        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                          <Library className="w-4 h-4" />
                          <span className="text-sm">Library</span>
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content className="bg-white border border-gray-200 rounded-xl shadow-lg w-96 max-h-96 overflow-hidden z-50">
                          <ComponentLibrary
                            embedded={true}
                            onSelectComponent={(component) => {
                              // Add component to prompt text
                              setPromptText(prev => prev + `\n\nUsing component: ${component.title}\n${component.description}`);
                              setShowLibrary(false);
                            }}
                          />
                          <Popover.Arrow className="fill-white" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>

                    {/* AI Configuration */}
                    <Popover.Root open={showConfigPanel} onOpenChange={setShowConfigPanel}>
                      <Popover.Trigger asChild>
                        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content className="bg-white border border-gray-200 rounded-xl shadow-lg w-80 z-50">
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-3">AI Configuration</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Provider
                                </label>
                                <select
                                  value={selectedProvider}
                                  onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="openai">OpenAI GPT-4</option>
                                  <option value="anthropic">Anthropic Claude-3</option>
                                </select>
                              </div>
                              <div className="text-xs text-gray-500">
                                Advanced settings available in Prompt Editor
                              </div>
                            </div>
                          </div>
                          <Popover.Arrow className="fill-white" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!promptText.trim() || aiGeneration.isPending}
                    className={cn(
                      'flex items-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all',
                      promptText.trim() && !aiGeneration.isPending
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    {aiGeneration.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generation Status */}
              {aiGeneration.isPending && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">
                        Creating your prompt with AI...
                      </p>
                      <p className="text-xs text-purple-700">
                        Using {selectedProvider === 'openai' ? 'GPT-4' : 'Claude-3'} to generate an optimized prompt
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {aiGeneration.isError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Generation failed
                      </p>
                      <p className="text-xs text-red-700">
                        {aiGeneration.error?.message || 'Please try again or check your API configuration'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setPromptText('Create a helpful AI assistant that can answer questions about web development and provide code examples.')}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">Web Dev Assistant</div>
                  <div className="text-xs text-gray-600">Create a coding helper</div>
                </button>
                <button
                  onClick={() => setPromptText('Design a creative writing assistant that helps with storytelling, character development, and plot structure.')}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">Creative Writer</div>
                  <div className="text-xs text-gray-600">Storytelling assistant</div>
                </button>
                <button
                  onClick={() => setPromptText('Build a data analysis expert that can interpret datasets, create visualizations, and provide insights.')}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">Data Analyst</div>
                  <div className="text-xs text-gray-600">Data insights helper</div>
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘ + Enter</kbd> to generate
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}