import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Sparkles, Settings, Save, Download, Plus, AlertCircle, History, GitBranch } from 'lucide-react';
import { usePromptStore } from '../stores/promptStore';
import { usePrompt, useCreatePrompt, useUpdatePrompt } from '../hooks/usePrompts';
import { useVersions, useCreateVersion, useRestoreVersion } from '../hooks/useVersions';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { PromptEditor } from '../components/prompt/PromptEditor';
import { FileUpload } from '../components/prompt/FileUpload';
import { ConfigurationPanel } from '../components/ai/ConfigurationPanel';
import { GenerationHistory } from '../components/ai/GenerationHistory';
import { VersionHistory } from '../components/version/VersionHistory';
import { DiffViewer } from '../components/version/DiffViewer';
import { ExportDialog } from '../components/export/ExportDialog';
import { VersionDiffer } from '../lib/version/differ';
import type { StructureType, Complexity } from '../types/prompt';
import type { AIProvider } from '../lib/ai/providers';
import type { GenerationConfig } from '../lib/ai/promptTemplates';
import type { PromptVersion, VersionComparison } from '../types/version';

export function PromptStudio() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const promptId = searchParams.get('prompt');
  
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
  const createVersion = useCreateVersion();
  const restoreVersion = useRestoreVersion();
  const aiGeneration = useAIGeneration();
  
  const { data: versions = [] } = useVersions(promptId || '');
  
  const [userInput, setUserInput] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>('openai');
  const [generationHistory, setGenerationHistory] = React.useState<any[]>([]);
  const [lastGeneration, setLastGeneration] = React.useState<any>(null);
  const [showVersionHistory, setShowVersionHistory] = React.useState(false);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [versionComparison, setVersionComparison] = React.useState<VersionComparison | null>(null);

  // Load existing prompt or create new one
  React.useEffect(() => {
    if (promptId && existingPrompt) {
      setCurrentPrompt(existingPrompt);
    } else if (!promptId && !currentPrompt) {
      // Create new prompt
      setCurrentPrompt({
        title: 'Untitled Prompt',
        description: '',
        content: {},
        structure_type: 'standard',
        category: 'ai',
        type: 'assistant',
        language: 'english',
        complexity: 'simple',
        is_public: false,
        tags: [],
        version_major: 1,
        version_minor: 0,
        version_batch: 0,
      });
    }
  }, [promptId, existingPrompt, currentPrompt, setCurrentPrompt]);

  const handleSave = async () => {
    if (!currentPrompt) return;

    try {
      if (currentPrompt.id) {
        // Update existing prompt
        await updatePrompt.mutateAsync({
          id: currentPrompt.id,
          title: currentPrompt.title!,
          description: currentPrompt.description,
          content: currentPrompt.content!,
          structure_type: currentPrompt.structure_type!,
          category: currentPrompt.category!,
          type: currentPrompt.type!,
          language: currentPrompt.language!,
          complexity: currentPrompt.complexity!,
          is_public: currentPrompt.is_public,
          tags: currentPrompt.tags,
        });
      } else {
        // Create new prompt
        const newPrompt = await createPrompt.mutateAsync({
          title: currentPrompt.title!,
          description: currentPrompt.description,
          content: currentPrompt.content!,
          structure_type: currentPrompt.structure_type!,
          category: currentPrompt.category!,
          type: currentPrompt.type!,
          language: currentPrompt.language!,
          complexity: currentPrompt.complexity!,
          is_public: currentPrompt.is_public || false,
          tags: currentPrompt.tags || [],
        });
        
        // Update URL with new prompt ID
        navigate(`/studio?prompt=${newPrompt.id}`, { replace: true });
        setCurrentPrompt(newPrompt);
      }
      
      markAsSaved();
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!userInput.trim()) return;
    
    if (!currentPrompt) return;
    
    const config: GenerationConfig = {
      userInput: userInput.trim(),
      structureType: currentPrompt.structure_type!,
      complexity: currentPrompt.complexity!,
      category: currentPrompt.category!,
      type: currentPrompt.type!,
      language: currentPrompt.language!,
      fileContext: files.length > 0 ? `Uploaded ${files.length} context files` : undefined,
    };

    try {
      const result = await aiGeneration.mutateAsync({ config, provider: selectedProvider });
      
      // Update the current prompt with generated content
      updatePromptField('content', result.content);
      
      // Update generation stats
      setLastGeneration({
        provider: result.provider,
        model: result.model,
        generationTime: result.generationTime,
        tokensUsed: result.tokensUsed,
      });
      
      // Add to history
      const historyItem = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        provider: result.provider,
        model: result.model,
        userInput: userInput.trim(),
        generationTime: result.generationTime,
        tokensUsed: result.tokensUsed,
        success: true,
      };
      
      setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
      
    } catch (error: any) {
      console.error('AI generation failed:', error);
      
      // Add error to history
      const historyItem = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        provider: selectedProvider,
        model: 'unknown',
        userInput: userInput.trim(),
        generationTime: 0,
        success: false,
        error: error.message || 'Generation failed',
      };
      
      setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
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
        
        // Refresh current prompt
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

  const handleExport = (result: any) => {
    // Create download link
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

  const handleNewPrompt = () => {
    setCurrentPrompt({
      title: 'Untitled Prompt',
      description: '',
      content: {},
      structure_type: 'standard',
      category: 'ai',
      type: 'assistant',
      language: 'english',
      complexity: 'simple',
      is_public: false,
      tags: [],
      version_major: 1,
      version_minor: 0,
      version_batch: 0,
    });
    navigate('/studio', { replace: true });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prompt Studio</h1>
              <p className="text-gray-600 mt-1">
                Create intelligent prompts with AI-powered generation and advanced structuring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewPrompt}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Versions</span>
              </button>
              <button
                onClick={() => setShowExportDialog(true)}
                disabled={!currentPrompt}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || createPrompt.isPending || updatePrompt.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>
                  {createPrompt.isPending || updatePrompt.isPending ? 'Saving...' : 'Save'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Studio Interface */}
        <div className={`grid gap-8 ${showVersionHistory ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1 xl:grid-cols-4'}`}>
          {/* Left Panel - Input & Configuration */}
          <div className="xl:col-span-1 space-y-6">
            {/* User Input Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Describe Your Prompt</h3>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe what you want your prompt to do... (up to 1000 characters)"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">{userInput.length}/1000 characters</span>
              </div>
              
              {/* File Upload */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Context Files</h4>
                <FileUpload
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={5}
                  maxSize={10}
                />
              </div>
            </div>

            {/* AI Generation Panel */}
            <ConfigurationPanel
              provider={selectedProvider}
              onProviderChange={setSelectedProvider}
              isGenerating={aiGeneration.isPending}
              onGenerate={handleGenerateWithAI}
              canGenerate={!!userInput.trim() && !!currentPrompt}
              lastGeneration={lastGeneration}
            />

            {/* Configuration Panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
              
              <div className="space-y-4">
                {/* Prompt Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt Title
                  </label>
                  <input
                    type="text"
                    value={currentPrompt?.title || ''}
                    onChange={(e) => updatePromptField('title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter prompt title..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={currentPrompt?.description || ''}
                    onChange={(e) => updatePromptField('description', e.target.value)}
                    className="w-full h-20 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief description of your prompt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Structure Type
                  </label>
                  <select 
                    value={currentPrompt?.structure_type || 'standard'}
                    onChange={(e) => updatePromptField('structure_type', e.target.value as StructureType)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="standard">Standard (Segments)</option>
                    <option value="structured">Structured (Sections)</option>
                    <option value="modulized">Modulized (Modules)</option>
                    <option value="advanced">Advanced (Blocks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <select 
                    value={currentPrompt?.complexity || 'simple'}
                    onChange={(e) => updatePromptField('complexity', e.target.value as Complexity)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select 
                    value={currentPrompt?.category || 'ai'}
                    onChange={(e) => updatePromptField('category', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ai">AI Assistant</option>
                    <option value="web">Web Development</option>
                    <option value="data">Data Analysis</option>
                    <option value="creative">Creative Writing</option>
                    <option value="business">Business</option>
                    <option value="research">Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select 
                    value={currentPrompt?.type || 'assistant'}
                    onChange={(e) => updatePromptField('type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="assistant">Assistant</option>
                    <option value="analyzer">Analyzer</option>
                    <option value="generator">Generator</option>
                    <option value="optimizer">Optimizer</option>
                    <option value="tool">Tool</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select 
                    value={currentPrompt?.language || 'english'}
                    onChange={(e) => updatePromptField('language', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="english">English</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="spanish">Spanish</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generation History */}
            <GenerationHistory
              history={generationHistory}
              onRegenerate={(item) => {
                setUserInput(item.userInput);
                setSelectedProvider(item.provider);
                handleGenerateWithAI();
              }}
              onClear={() => setGenerationHistory([])}
            />
          </div>

          {/* Center Panel - Editor */}
          <div className={showVersionHistory ? "xl:col-span-3" : "xl:col-span-3"}>
            <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[600px]">
              {/* AI Generation Status */}
              {aiGeneration.isPending && (
                <div className="border-b border-gray-200 p-4 bg-purple-50">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">
                        Generating prompt with AI...
                      </p>
                      <p className="text-xs text-purple-700">
                        Using {selectedProvider} to create your {currentPrompt?.structure_type} prompt
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Generation Error */}
              {aiGeneration.isError && (
                <div className="border-b border-gray-200 p-4 bg-red-50">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Generation failed
                      </p>
                      <p className="text-xs text-red-700">
                        {aiGeneration.error?.message || 'Unknown error occurred'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <PromptEditor />
            </div>
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
                  // TODO: Implement version preview
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

        {showExportDialog && currentPrompt && (
          <ExportDialog
            prompt={currentPrompt as any}
            onClose={() => setShowExportDialog(false)}
            onExport={handleExport}
          />
        )}
      </div>
    </Layout>
  );
}