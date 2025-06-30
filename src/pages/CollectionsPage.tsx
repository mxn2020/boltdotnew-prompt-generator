import React from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Lock, 
  Globe, 
  Star, 
  Trash2, 
  Edit, 
  Eye,
  ChevronRight,
  ArrowLeft,
  FileText,
  Folder
} from 'lucide-react';
import { 
  useCollections, 
  useCreateCollection, 
  useDeleteCollection, 
  useCollection,
  useAddToCollection,
  useRemoveFromCollection,
  type Collection 
} from '../hooks/useCollections';
import { usePrompts } from '../hooks/usePrompts';
import { cn } from '../lib/utils';

export function CollectionsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);
  const [currentPath, setCurrentPath] = React.useState<Array<{ id: string; title: string }>>([]);

  const { data: collections, isLoading } = useCollections(selectedCollection);
  const { data: collectionDetails } = useCollection(selectedCollection || '');
  const { data: userPrompts } = usePrompts();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const addToCollection = useAddToCollection();
  const removeFromCollection = useRemoveFromCollection();

  const handleCreateCollection = async (data: {
    title: string;
    description?: string;
    is_public?: boolean;
  }) => {
    try {
      await createCollection.mutateAsync({
        ...data,
        parent_id: selectedCollection || undefined,
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection? This will also delete all nested collections.')) {
      try {
        await deleteCollection.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  const handleNavigateToCollection = (collection: Collection) => {
    setCurrentPath(prev => [...prev, { id: collection.id, title: collection.title }]);
    setSelectedCollection(collection.id);
  };

  const handleNavigateBack = () => {
    const newPath = [...currentPath];
    newPath.pop();
    setCurrentPath(newPath);
    setSelectedCollection(newPath[newPath.length - 1]?.id || null);
  };

  const handleNavigateToRoot = () => {
    setCurrentPath([]);
    setSelectedCollection(null);
  };

  const handleAddPromptToCollection = async (promptId: string) => {
    if (!selectedCollection) return;
    
    try {
      await addToCollection.mutateAsync({
        collectionId: selectedCollection,
        itemType: 'prompt',
        promptId,
      });
    } catch (error) {
      console.error('Failed to add prompt to collection:', error);
    }
  };

  const filteredCollections = collections?.filter(collection =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
              <p className="text-gray-600 mt-1">
                Organize your prompts into curated collections with nested folders
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

          {/* Breadcrumb Navigation */}
          {currentPath.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={handleNavigateToRoot}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Collections
              </button>
              {currentPath.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => {
                      const newPath = currentPath.slice(0, index + 1);
                      setCurrentPath(newPath);
                      setSelectedCollection(item.id);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {item.title}
                  </button>
                </React.Fragment>
              ))}
              {selectedCollection && (
                <button
                  onClick={handleNavigateBack}
                  className="ml-4 flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>
          )}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Collections List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-8">Loading collections...</div>
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedCollection ? 'No collections in this folder' : 'No collections yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedCollection 
                    ? 'This collection is empty. Add some prompts or create nested collections.'
                    : 'Create your first collection to organize your prompts'
                  }
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Collection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onNavigate={() => handleNavigateToCollection(collection)}
                    onDelete={() => handleDeleteCollection(collection.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Collection Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedCollection && collectionDetails ? (
              <CollectionDetailsSidebar
                collection={collectionDetails}
                userPrompts={userPrompts || []}
                onAddPrompt={handleAddPromptToCollection}
                onRemoveItem={(itemId) => removeFromCollection.mutateAsync({
                  collectionId: selectedCollection,
                  itemId
                })}
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a Collection
                  </h3>
                  <p className="text-gray-600">
                    Choose a collection to view its contents and manage items
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Collection Modal */}
        {showCreateForm && (
          <CreateCollectionModal
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateCollection}
            isLoading={createCollection.isPending}
            parentCollection={selectedCollection ? currentPath[currentPath.length - 1]?.title : undefined}
          />
        )}
      </div>
    </Layout>
  );
}

interface CollectionCardProps {
  collection: Collection;
  onNavigate: () => void;
  onDelete: () => void;
}

function CollectionCard({ collection, onNavigate, onDelete }: CollectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={onNavigate}>
          <div className="flex items-center space-x-3 mb-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
              {collection.title}
            </h3>
            <div className="flex items-center space-x-2">
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
          {collection.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
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

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{collection.item_count} items</span>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{collection.view_count}</span>
          </div>
        </div>
        <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

interface CollectionDetailsSidebarProps {
  collection: any;
  userPrompts: any[];
  onAddPrompt: (promptId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

function CollectionDetailsSidebar({ 
  collection, 
  userPrompts, 
  onAddPrompt, 
  onRemoveItem 
}: CollectionDetailsSidebarProps) {
  const [showAddPrompt, setShowAddPrompt] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{collection.title}</h3>
        <button
          onClick={() => setShowAddPrompt(!showAddPrompt)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {collection.description && (
        <p className="text-sm text-gray-600 mb-4">{collection.description}</p>
      )}

      {/* Add Prompt Section */}
      {showAddPrompt && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Add Prompts</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {userPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => {
                  onAddPrompt(prompt.id);
                  setShowAddPrompt(false);
                }}
                className="w-full text-left p-2 text-sm border border-gray-200 rounded hover:bg-white transition-colors"
              >
                {prompt.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collection Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">
          Items ({collection.item_count})
        </h4>
        
        {collection.collection_items?.length > 0 ? (
          <div className="space-y-2">
            {collection.collection_items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {item.item_type === 'prompt' ? (
                    <FileText className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Folder className="w-4 h-4 text-indigo-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {item.item_type === 'prompt' 
                      ? item.prompts?.title 
                      : item.child_collection?.title
                    }
                  </span>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No items in this collection</p>
        )}
      </div>
    </div>
  );
}

interface CreateCollectionModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; is_public?: boolean }) => void;
  isLoading: boolean;
  parentCollection?: string;
}

function CreateCollectionModal({ onClose, onSubmit, isLoading, parentCollection }: CreateCollectionModalProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    is_public: false,
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
          <h3 className="text-lg font-semibold text-gray-900">
            Create New Collection
            {parentCollection && (
              <span className="text-sm font-normal text-gray-600 block">
                in "{parentCollection}"
              </span>
            )}
          </h3>
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

          <div>
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