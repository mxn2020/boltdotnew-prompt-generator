import React from 'react';
import { Plus, GripVertical, X, Folder, FileText, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import { ModuleComposer } from '../components/ModuleComposer';
import { AssetIntegrator } from '../components/AssetIntegrator';
import type { PromptBlock } from '../../../types/prompt';

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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Advanced Prompt Architecture</h3>
          <p className="text-sm text-gray-600">
            Create sophisticated prompt structures with organizational blocks, modules, wrappers, and assets.
          </p>
        </div>
        <button
          onClick={handleAddBlock}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Block</span>
        </button>
      </div>

      {/* Architecture Overview */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-orange-900 mb-2">🏗️ Advanced Architecture Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-orange-800">
          <div>• Organizational blocks for logical grouping</div>
          <div>• Nested modules with processing wrappers</div>
          <div>• Asset integration (prompts, files, URLs)</div>
          <div>• Complex dependency management</div>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-6">
        {blocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No blocks yet</h4>
            <p className="text-gray-600 mb-4">
              Build sophisticated prompt architectures with organizational blocks containing modules and assets.
            </p>
            <button
              onClick={handleAddBlock}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Block</span>
            </button>
          </div>
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
    <div className="bg-white border-2 border-orange-200 rounded-lg overflow-hidden shadow-sm">
      {/* Block Header */}
      <div className="flex items-center space-x-3 p-4 bg-orange-50 border-b border-orange-200">
        <button className="text-gray-400 hover:text-gray-600 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-orange-600 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <Folder className="w-5 h-5 text-orange-600" />

        <input
          type="text"
          value={block.title}
          onChange={(e) => onUpdate(block.id, 'title', e.target.value)}
          placeholder="Block title..."
          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{block.modules.length} modules</span>
          <span>•</span>
          <span>{(block.assets || []).length} assets</span>
        </div>

        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Block Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Block Description
            </label>
            <textarea
              value={block.description || ''}
              onChange={(e) => onUpdate(block.id, 'description', e.target.value)}
              placeholder="Describe the purpose and organization of this block..."
              className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('modules')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'modules'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Modules ({block.modules.length})
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assets'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assets ({(block.assets || []).length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'modules' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Block Modules
                </label>
                <button
                  onClick={addModuleToBlock}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Module</span>
                </button>
              </div>

              <div className="space-y-3">
                {block.modules.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No modules in this block</p>
                    <button
                      onClick={addModuleToBlock}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      Add your first module
                    </button>
                  </div>
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
          )}

          {activeTab === 'assets' && (
            <div>
              <AssetIntegrator
                assets={block.assets || []}
                onAddAsset={addAssetToBlock}
                onRemoveAsset={removeAssetFromBlock}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}