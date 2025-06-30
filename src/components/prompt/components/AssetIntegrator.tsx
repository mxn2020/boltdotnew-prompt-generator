import React from 'react';
import { Plus, X, Link, FileText, Image, ExternalLink, Search } from 'lucide-react';
import type { PromptAsset } from '../../../types/prompt';

interface AssetIntegratorProps {
  assets: PromptAsset[];
  onAddAsset: (asset: PromptAsset) => void;
  onRemoveAsset: (assetId: string) => void;
}

const assetTypes = [
  { value: 'prompt', label: 'Prompt Reference', icon: FileText, description: 'Reference another prompt as context' },
  { value: 'file', label: 'File Upload', icon: FileText, description: 'Upload a file as context' },
  { value: 'url', label: 'URL Reference', icon: ExternalLink, description: 'Reference external URL content' },
  { value: 'image', label: 'Image Asset', icon: Image, description: 'Include image for visual context' },
];

export function AssetIntegrator({ assets, onAddAsset, onRemoveAsset }: AssetIntegratorProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newAsset, setNewAsset] = React.useState({
    type: 'prompt' as const,
    reference: '',
    title: '',
    description: '',
  });

  const handleAddAsset = () => {
    if (!newAsset.reference.trim()) return;

    const asset: PromptAsset = {
      id: crypto.randomUUID(),
      type: newAsset.type,
      reference: newAsset.reference.trim(),
      title: newAsset.title.trim() || undefined,
      description: newAsset.description.trim() || undefined,
    };

    onAddAsset(asset);
    setNewAsset({ type: 'prompt', reference: '', title: '', description: '' });
    setShowAddForm(false);
  };

  const getAssetIcon = (type: string) => {
    const assetType = assetTypes.find(t => t.value === type);
    return assetType?.icon || FileText;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Block Assets
        </label>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Add Asset Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Add New Asset</h4>
          
          <div className="space-y-3">
            {/* Asset Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {assetTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setNewAsset(prev => ({ ...prev, type: type.value as any }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        newAsset.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newAsset.type === 'prompt' ? 'Prompt ID' : 
                 newAsset.type === 'url' ? 'URL' : 
                 newAsset.type === 'file' ? 'File Path' : 'Reference'}
              </label>
              <input
                type="text"
                value={newAsset.reference}
                onChange={(e) => setNewAsset(prev => ({ ...prev, reference: e.target.value }))}
                placeholder={
                  newAsset.type === 'prompt' ? 'Enter prompt ID or search...' :
                  newAsset.type === 'url' ? 'https://example.com' :
                  newAsset.type === 'file' ? 'Upload or enter file path...' :
                  'Enter reference...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Title and Description */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={newAsset.title}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Asset title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newAsset.description}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Asset description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleAddAsset}
                disabled={!newAsset.reference.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Asset
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assets List */}
      <div className="space-y-3">
        {assets.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Link className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No assets in this block</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Add your first asset
            </button>
          </div>
        ) : (
          assets.map((asset) => {
            const Icon = getAssetIcon(asset.type);
            return (
              <div
                key={asset.id}
                className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {asset.title || asset.reference}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {asset.type}
                    </span>
                  </div>
                  {asset.description && (
                    <p className="text-sm text-gray-600 mt-1">{asset.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {asset.reference}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveAsset(asset.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}