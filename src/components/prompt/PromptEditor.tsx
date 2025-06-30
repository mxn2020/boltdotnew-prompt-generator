import React from 'react';
import { usePromptStore } from '../../stores/promptStore';
import { SegmentEditor } from './editors/SegmentEditor';
import { SectionEditor } from './editors/SectionEditor';
import { ModuleEditor } from './editors/ModuleEditor';
import { AdvancedBlockEditor } from './editors/AdvancedBlockEditor';
import { Sparkles } from 'lucide-react';

export function PromptEditor() {
  const { currentPrompt } = usePromptStore();

  // Determine if this is an asset
  const isAsset = currentPrompt?.prompt_type !== 'prompt';

  if (!currentPrompt) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No prompt selected</h3>
          <p className="text-sm">
            Create a new prompt or select an existing one to start editing.
          </p>
        </div>
      </div>
    );
  }

  const renderEditor = () => {
    switch (currentPrompt.structure_type) {
      case 'standard':
        return <SegmentEditor />;
      case 'structured':
        return <SectionEditor />;
      case 'modulized':
        return <ModuleEditor />;
      case 'advanced':
        return <AdvancedBlockEditor />;
      default:
        return <SegmentEditor />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className={`border-b p-4 ${isAsset ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentPrompt.title || 'Untitled Prompt'}
            </h2>
            <p className={`text-sm ${isAsset ? 'text-orange-600' : 'text-gray-500'}`}>
              {isAsset ? (
                <>
                  <span className="font-medium">{currentPrompt.prompt_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Asset</span> • {currentPrompt.structure_type} structure
                </>
              ) : (
                <>
                  {currentPrompt.structure_type} structure
                  {currentPrompt.id && currentPrompt.complexity !== 'custom' && (
                    <> • {currentPrompt.complexity} complexity</>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              v{currentPrompt.version_major || 1}.{currentPrompt.version_minor || 0}.{currentPrompt.version_batch || 0}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        {renderEditor()}
      </div>
    </div>
  );
}