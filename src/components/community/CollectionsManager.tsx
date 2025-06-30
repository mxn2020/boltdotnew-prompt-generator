import React from 'react';
import { Plus, Search, FolderOpen, Lock, Globe, Star, Trash2, Edit, Eye } from 'lucide-react';
import { useCollections, useCreateCollection, useDeleteCollection, useCollection } from '../../hooks/useCommunity';
import { cn } from '../../lib/utils';
import type { Collection, CreateCollectionData } from '../../types/community';

interface CollectionsManagerProps {
  onSelectCollection?: (collection: Collection) => void;
  embedded?: boolean;
}

export function CollectionsManager({ onSelectCollection, embedded = false }: CollectionsManagerProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);

  const { data: collections, isLoading } = useCollections({ search: searchQuery });
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const { data: collectionDetails } = useCollection(selectedCollection || '');

  const handleCreateCollection = async (data: CreateCollectionData) => {
    try {
      const newCollection = await createCollection.mutateAsync(data);
      setShowCreateForm(false);
      if (onSelectCollection) {
        onSelectCollection(newCollection);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await deleteCollection.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  return (
    <div className={cn('bg-white', embedded ? 'rounded-lg border border-gray-200' : '')}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Collections</h2>
            <p className="text-sm text-gray-600">
              Organize your prompts into curated collections
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Collections Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading collections...</div>
        ) : !collections || collections.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first collection to organize your prompts
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onSelect={() => {
                  setSelectedCollection(collection.id);
                  onSelectCollection?.(collection);
                }}
                onDelete={() => handleDeleteCollection(collection.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateForm && (
        <CreateCollectionModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCollection}
          isLoading={createCollection.isPending}
        />
      )}
    </div>
  );
}

interface CollectionCardProps {
  collection: Collection;
  onSelect: () => void;
  onDelete: () => void;
}

function CollectionCard({ collection, onSelect, onDelete }: CollectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center space-x-2 mb-1">
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
              {collection.title}
            </h3>
          </div>
          {collection.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{collection.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {collection.is_public ? (
            <Globe className="w-4 h-4 text-green-600" />
          ) : (
            <Lock className="w-4 h-4 text-gray-400" />
          )}
          {collection.is_smart && (
            <Star className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center space-x-3">
          <span>{collection.prompt_count} prompts</span>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{collection.view_count}</span>
          </div>
        </div>
        <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onSelect}
          className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          View Collection
        </button>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}

interface CreateCollectionModalProps {
  onClose: () => void;
  onSubmit: (data: CreateCollectionData) => void;
  isLoading: boolean;
}

function CreateCollectionModal({ onClose, onSubmit, isLoading }: CreateCollectionModalProps) {
  const [formData, setFormData] = React.useState<CreateCollectionData>({
    title: '',
    description: '',
    is_public: false,
    is_smart: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Collection</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter collection name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your collection..."
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Make Public</div>
                <div className="text-sm text-gray-600">Allow others to discover and view this collection</div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_smart}
                onChange={(e) => setFormData(prev => ({ ...prev, is_smart: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900">Smart Collection</div>
                <div className="text-sm text-gray-600">Automatically add prompts based on criteria</div>
              </div>
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}