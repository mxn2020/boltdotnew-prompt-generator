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
  ArrowLeft,
  FileText,
  Folder
} from 'lucide-react';
import { 
  useCollections, 
  useCreateCollection, 
  useDeleteCollection,
  useUpdateCollection,
  useCollection,
  useAddToCollection,
  useRemoveFromCollection,
  type Collection 
} from '../hooks/useCollections';
import { usePrompts } from '../hooks/usePrompts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export function CollectionsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingCollection, setEditingCollection] = React.useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = React.useState<Collection | null>(null);
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);
  const [currentPath, setCurrentPath] = React.useState<Array<{ id: string; title: string }>>([]);

  const { data: collections, isLoading } = useCollections({ parentId: selectedCollection || undefined });
  const { data: collectionDetails } = useCollection(selectedCollection || '');
  const { data: userPrompts } = usePrompts();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
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

  const handleUpdateCollection = async (data: {
    title: string;
    description?: string;
    is_public?: boolean;
  }) => {
    if (!editingCollection) return;
    
    try {
      await updateCollection.mutateAsync({
        id: editingCollection.id,
        ...data,
      });
      setEditingCollection(null);
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  const handleDeleteCollection = async () => {
    if (!deletingCollection) return;
    
    try {
      await deleteCollection.mutateAsync(deletingCollection.id);
      setDeletingCollection(null);
      // Navigate back if we deleted the current collection
      if (deletingCollection.id === selectedCollection) {
        handleNavigateBack();
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
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
    
    addToCollection.mutate({
      collectionId: selectedCollection,
      itemType: 'prompt',
      promptId,
    }, {
      onError: (error) => {
        console.error('Failed to add prompt to collection:', error);
        alert('Failed to add prompt to collection. Please try again.');
      },
      onSuccess: () => {
        // Show success message or update UI
        console.log('Prompt added to collection successfully');
      }
    });
  };

  const filteredCollections = collections?.filter(collection =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Collections</h1>
              <p className="text-muted-foreground mt-1">
                Organize your prompts into curated collections with nested folders
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </div>

          {/* Breadcrumb Navigation */}
          {currentPath.length > 0 && (
            <div className="mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={handleNavigateToRoot} className="cursor-pointer">
                      Collections
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentPath.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index === currentPath.length - 1 ? (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            onClick={() => {
                              const newPath = currentPath.slice(0, index + 1);
                              setCurrentPath(newPath);
                              setSelectedCollection(item.id);
                            }}
                            className="cursor-pointer"
                          >
                            {item.title}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              
              <Button variant="ghost" onClick={handleNavigateBack} className="mt-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Collections List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredCollections.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <CardTitle className="mb-2">
                    {selectedCollection ? 'No collections in this folder' : 'No collections yet'}
                  </CardTitle>
                  <p className="text-muted-foreground mb-6">
                    {selectedCollection 
                      ? 'This collection is empty. Add some prompts or create nested collections.'
                      : 'Create your first collection to organize your prompts'
                    }
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Collection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onNavigate={() => handleNavigateToCollection(collection)}
                    onEdit={() => setEditingCollection(collection)}
                    onDelete={() => setDeletingCollection(collection)}
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
              <Card>
                <CardContent className="text-center py-8">
                  <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <CardTitle className="mb-2">Select a Collection</CardTitle>
                  <p className="text-muted-foreground">
                    Choose a collection to view its contents and manage items
                  </p>
                </CardContent>
              </Card>
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

        {/* Edit Collection Modal */}
        {editingCollection && (
          <EditCollectionModal
            collection={editingCollection}
            onClose={() => setEditingCollection(null)}
            onSubmit={handleUpdateCollection}
            isLoading={updateCollection.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingCollection && (
          <DeleteCollectionModal
            collection={deletingCollection}
            onClose={() => setDeletingCollection(null)}
            onConfirm={handleDeleteCollection}
            isLoading={deleteCollection.isPending}
          />
        )}
      </div>
    </Layout>
  );
}

interface CollectionCardProps {
  collection: Collection;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CollectionCard({ collection, onNavigate, onEdit, onDelete }: CollectionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={onNavigate}>
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold hover:text-primary transition-colors">
                {collection.title}
              </h3>
              <div className="flex items-center gap-2">
                {collection.is_public ? (
                  <Badge variant="secondary">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}
                {collection.is_smart && (
                  <Badge variant="secondary">
                    <Star className="w-3 h-3 mr-1" />
                    Smart
                  </Badge>
                )}
              </div>
            </div>
            {collection.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {collection.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{collection.item_count} items</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{collection.view_count}</span>
            </div>
          </div>
          <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{collection.title}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPrompt(!showAddPrompt)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {collection.description && (
          <p className="text-sm text-muted-foreground">{collection.description}</p>
        )}

        {/* Add Prompt Section */}
        {showAddPrompt && (
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <h4 className="text-sm font-medium mb-2">Add Prompts</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {userPrompts.map((prompt) => (
                  <Button
                   key={prompt.id}
                   variant="ghost"
                   className="w-full justify-start text-left p-2 h-auto"
                   onClick={() => {
                     onAddPrompt(prompt.id);
                     setShowAddPrompt(false);
                   }}
                 >
                   <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                   <span className="truncate">{prompt.title}</span>
                 </Button>
               ))}
             </div>
           </CardContent>
         </Card>
       )}

       {/* Collection Items */}
       <div className="space-y-3">
         <h4 className="text-sm font-medium">
           Items ({collection.item_count})
         </h4>
         
         {collection.collection_items?.length > 0 ? (
           <div className="space-y-2">
             {collection.collection_items.map((item: any) => (
               <div
                 key={item.id}
                 className="flex items-center justify-between p-2 border rounded-lg"
               >
                 <div className="flex items-center gap-2 min-w-0 flex-1">
                   {item.item_type === 'prompt' ? (
                     <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                   ) : (
                     <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                   )}
                   <span className="text-sm font-medium truncate">
                     {item.item_type === 'prompt' 
                       ? item.prompts?.title 
                       : item.child_collection?.title
                     }
                     </span>
                 </div>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => onRemoveItem(item.id)}
                   className="text-muted-foreground hover:text-destructive flex-shrink-0"
                 >
                   <Trash2 className="w-3 h-3" />
                 </Button>
               </div>
             ))}
           </div>
         ) : (
           <p className="text-sm text-muted-foreground">No items in this collection</p>
         )}
       </div>
     </CardContent>
   </Card>
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
   <Dialog open={true} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-md">
       <DialogHeader>
         <DialogTitle>
           Create New Collection
           {parentCollection && (
             <span className="text-sm font-normal text-muted-foreground block mt-1">
               in "{parentCollection}"
             </span>
           )}
         </DialogTitle>
       </DialogHeader>

       <form onSubmit={handleSubmit} className="space-y-4">
         <div className="space-y-2">
           <Label htmlFor="collection-name">Collection Name</Label>
           <Input
             id="collection-name"
             value={formData.title}
             onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
             placeholder="Enter collection name..."
             required
           />
         </div>

         <div className="space-y-2">
           <Label htmlFor="collection-description">Description (optional)</Label>
           <Textarea
             id="collection-description"
             value={formData.description}
             onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
             placeholder="Describe your collection..."
             className="min-h-[80px]"
           />
         </div>

         <div className="flex items-center space-x-2">
           <Checkbox
             id="make-public"
             checked={formData.is_public}
             onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
           />
           <div className="grid gap-1.5 leading-none">
             <Label htmlFor="make-public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
               Make Public
             </Label>
             <p className="text-xs text-muted-foreground">
               Allow others to discover and view this collection
             </p>
           </div>
         </div>

         <DialogFooter className="gap-2">
           <Button type="button" variant="outline" onClick={onClose} className="flex-1">
             Cancel
           </Button>
           <Button 
             type="submit" 
             disabled={isLoading || !formData.title.trim()}
             className="flex-1"
           >
             {isLoading ? 'Creating...' : 'Create Collection'}
           </Button>
         </DialogFooter>
       </form>
     </DialogContent>
   </Dialog>
 );
}

interface EditCollectionModalProps {
  collection: Collection;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; is_public?: boolean }) => void;
  isLoading: boolean;
}

function EditCollectionModal({ collection, onClose, onSubmit, isLoading }: EditCollectionModalProps) {
  const [formData, setFormData] = React.useState({
    title: collection.title,
    description: collection.description || '',
    is_public: collection.is_public,
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
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-collection-name">Collection Name</Label>
            <Input
              id="edit-collection-name"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter collection name..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-collection-description">Description (optional)</Label>
            <Textarea
              id="edit-collection-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your collection..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-make-public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="edit-make-public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Make Public
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow others to discover and view this collection
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title.trim()}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteCollectionModalProps {
  collection: Collection;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function DeleteCollectionModal({ collection, onClose, onConfirm, isLoading }: DeleteCollectionModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Delete Collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-semibold text-destructive mb-2">
              Are you sure you want to delete "{collection.title}"?
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• This action cannot be undone</p>
              <p>• All nested collections will also be deleted</p>
              <p>• All items in this collection will be removed</p>
              {collection.item_count > 0 && (
                <p className="font-medium text-destructive">
                  • This will affect {collection.item_count} item{collection.item_count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="bg-muted/50 border rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <FolderOpen className="w-4 h-4 text-primary" />
              <span className="font-medium">{collection.title}</span>
              <div className="flex items-center gap-2 ml-auto">
                {collection.is_public ? (
                  <Badge variant="secondary" className="text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            </div>
            {collection.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
            variant="destructive"
            className="flex-1"
          >
            {isLoading ? 'Deleting...' : 'Delete Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
