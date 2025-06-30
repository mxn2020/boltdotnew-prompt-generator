import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Settings, Save, Download, Plus, AlertCircle, History, GitBranch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ensureUserProfile } from '../lib/profile';
import { usePromptStore } from '../stores/promptStore';
import { usePrompt, useCreatePrompt, useUpdatePrompt } from '../hooks/usePrompts';
import { useVersions, useCreateVersion, useRestoreVersion } from '../hooks/useVersions';
import { PromptEditor as PromptEditorComponent } from '../components/prompt/PromptEditor';
import { VersionHistory } from '../components/version/VersionHistory';
import { DiffViewer } from '../components/version/DiffViewer';
import { ExportDialog } from '../components/export/ExportDialog';
import { VersionDiffer } from '../lib/version/differ';
import type { StructureType, Complexity, Prompt } from '../types/prompt';
import type { PromptVersion, VersionComparison } from '../types/version';

export function PromptEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const promptId = searchParams.get('prompt');
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
  const createVersion = useCreateVersion();
  const restoreVersion = useRestoreVersion();
  
  const { data: versions = [] } = useVersions(promptId || '');
  
  const [showVersionHistory, setShowVersionHistory] = React.useState(false);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [versionComparison, setVersionComparison] = React.useState<VersionComparison | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Load existing prompt or create new one
  React.useEffect(() => {
    if (promptId && existingPrompt && !currentPrompt?.id) {
      // Only load existing prompt if we don't already have it loaded
      console.log('Loading existing prompt:', existingPrompt);
      setCurrentPrompt(existingPrompt);
    } else if (!promptId && !currentPrompt) {
      // Create new prompt only if we don't have one
      console.log('Creating new prompt');
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
  }, [promptId, existingPrompt, setCurrentPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!currentPrompt) return;

    // Clear any previous errors
    setSaveError(null);

    try {
      // Check if user is authenticated
      if (!user) {
        setSaveError('You must be logged in to save prompts');
        return;
      }

      // Ensure user has a profile - create one if it doesn't exist
      const profileResult = await ensureUserProfile(user);
      if (!profileResult.success) {
        setSaveError(profileResult.error || 'Failed to verify user profile');
        return;
      }

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
        navigate(`/editor?prompt=${newPrompt.id}`, { replace: true });
        setCurrentPrompt(newPrompt);
      }
      
      markAsSaved();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      
      // Enhanced error handling
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

  const handleExport = (result: { content: string; mimeType: string; filename: string }) => {
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
    navigate('/editor', { replace: true });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {/* Error Display */}
          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{saveError}</p>
                <button
                  onClick={() => setSaveError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prompt Editor</h1>
              <p className="text-gray-600 mt-1">
                Create and edit prompts with advanced structuring and version control
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

        {/* Main Editor Interface */}
        <div className={`grid gap-8 ${showVersionHistory ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1 xl:grid-cols-3'}`}>
          {/* Left Panel - Prompt Details */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt Details</h3>
              
              <div className="space-y-4">
                {/* Prompt Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
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
                    onChange={(e) => {
                      const newStructureType = e.target.value as StructureType;
                      console.log('Changing structure type from', currentPrompt?.structure_type, 'to', newStructureType);
                      updatePromptField('structure_type', newStructureType);
                      
                      // Clear content when structure type changes to avoid compatibility issues
                      if (currentPrompt?.structure_type !== newStructureType) {
                        console.log('Clearing content due to structure type change');
                        updatePromptField('content', {});
                      }
                    }}
                    disabled={!!currentPrompt?.id}
                    className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      currentPrompt?.id ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="standard">Standard (Segments)</option>
                    <option value="structured">Structured (Sections)</option>
                    <option value="modulized">Modulized (Modules)</option>
                    <option value="advanced">Advanced (Blocks)</option>
                  </select>
                  {currentPrompt?.id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Structure type cannot be changed for existing prompts
                    </p>
                  )}
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

                {/* Privacy Setting */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={currentPrompt?.is_public || false}
                      onChange={(e) => updatePromptField('is_public', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Make Public</div>
                      <div className="text-sm text-gray-600">Allow others to discover and use this prompt</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Editor */}
          <div className={showVersionHistory ? "xl:col-span-2" : "xl:col-span-2"}>
            <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[600px]">
              <PromptEditorComponent />
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