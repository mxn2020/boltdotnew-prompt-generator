import React from 'react';
import { Plus, Search, FolderOpen, Lock, Globe, Star, Trash2, Edit, Eye, RefreshCw } from 'lucide-react';
import { 
  useCollections, 
  useCreateCollection, 
  useDeleteCollection, 
  useCollection,
  type Collection, 
  type CreateCollectionData 
} from '../../hooks/useCollections'; // Updated import path
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface CollectionsManagerProps {
  onSelectCollection?: (collection: Collection) => void;
  embedded?: boolean;
}

export function CollectionsManager({ onSelectCollection, embedded = false }: CollectionsManagerProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);

  const { data: collections, isLoading, error, refetch } = useCollections({ search: searchQuery });
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const { data: collectionDetails } = useCollection(selectedCollection || '');

  const handleCreateCollection = async (data: CreateCollectionData) => {
    try {
      console.log('Creating collection with data:', data);
      const newCollection = await createCollection.mutateAsync(data);
      console.log('Collection created:', newCollection);
      setShowCreateForm(false);
      if (onSelectCollection) {
        onSelectCollection(newCollection);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert(`Failed to create collection: ${error.message}`);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await deleteCollection.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete collection:', error);
        alert(`Failed to delete collection: ${error.message}`);
      }
    }
  };

  const handleRefresh = () => {
    console.log('Manually refreshing collections...');
    refetch();
  };

  return (
    <Card className={embedded ? '' : 'w-full'}>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl">Collections</CardTitle>
            <p className="text-sm text-muted-foreground">
              Organize your prompts into curated collections
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="pl-10"
          />
        </div>
      </CardHeader>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-destructive/10 border-b border-destructive/20">
          <div className="text-destructive">
            <strong>Error loading collections:</strong> {(error as any).message}
          </div>
          <Button
            variant="link"
            onClick={handleRefresh}
            className="mt-2 text-destructive hover:text-destructive/80 p-0"
          >
            Try again
          </Button>
        </div>
      )}

      {/* Collections Grid */}
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <div>Loading collections...</div>
          </div>
        ) : !collections || collections.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No collections found' : 'No collections yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first collection to organize your prompts'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateForm(true)}>
                Create Collection
              </Button>
            )}
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
      </CardContent>

      {/* Create Collection Modal */}
      {showCreateForm && (
        <CreateCollectionModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCollection}
          isLoading={createCollection.isPending}
        />
      )}
    </Card>
  );
}

interface CollectionCardProps {
  collection: Collection;
  onSelect: () => void;
  onDelete: () => void;
}

function CollectionCard({ collection, onSelect, onDelete }: CollectionCardProps) {
  // Use item_count primarily, fallback to prompt_count for backward compatibility
  const itemCount = collection.item_count ?? collection.prompt_count ?? 0;

  return (
    <Card className="p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center space-x-2 mb-1">
            <FolderOpen className="w-4 h-4 text-primary" />
            <h3 className="font-semibold hover:text-primary transition-colors">
              {collection.title}
            </h3>
          </div>
          {collection.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {collection.is_public ? (
            <Badge variant="outline" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          )}
          {collection.is_smart && (
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
        <div className="flex items-center space-x-3">
          <span>{itemCount} items</span>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{collection.view_count}</span>
          </div>
        </div>
        <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={onSelect}
          className="flex-1"
          size="sm"
        >
          View Collection
        </Button>
        <Button variant="outline" size="sm" className="p-2">
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 hover:bg-destructive/10 hover:border-destructive/20"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </Card>
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Organize your prompts into a curated collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Collection Name *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter collection name..."
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your collection..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="is_public"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Make Public
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow others to discover and view this collection
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_smart"
                checked={formData.is_smart}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_smart: !!checked }))}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="is_smart"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Smart Collection
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically add prompts based on criteria
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}