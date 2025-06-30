import React from 'react';
import { FolderOpen, Plus, Search, X } from 'lucide-react';
import { useCollections, useAddToCollection } from '../../hooks/useCollections';
import { cn } from '../../lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PromptCollectionsPanelProps {
  promptId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function PromptCollectionsPanel({ promptId, isOpen, onToggle }: PromptCollectionsPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: collections, isLoading } = useCollections({ search: searchQuery });
  const addToCollection = useAddToCollection();
  const [addedCollections, setAddedCollections] = React.useState<Set<string>>(new Set());

  const handleAddToCollection = async (collectionId: string) => {
    try {
      await addToCollection.mutateAsync({
        collectionId,
        itemType: 'prompt',
        promptId,
      });
      
      // Mark as added in UI
      setAddedCollections(prev => new Set([...prev, collectionId]));
    } catch (error) {
      console.error('Failed to add to collection:', error);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onToggle}
        className="relative"
      >
        <FolderOpen className="w-4 h-4 mr-2" />
        Add to Collection
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Add to Collection</CardTitle>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {/* Collections List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : collections?.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No collections found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'Create a collection to organize your prompts'}
              </p>
            </div>
          ) : (
            collections?.map((collection) => {
              const isAdded = addedCollections.has(collection.id);
              
              return (
                <div
                  key={collection.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg",
                    isAdded ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FolderOpen className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isAdded ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate">{collection.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {collection.item_count} items
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant={isAdded ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => !isAdded && handleAddToCollection(collection.id)}
                    disabled={isAdded || addToCollection.isPending}
                    className={cn(
                      "flex-shrink-0",
                      isAdded && "cursor-default"
                    )}
                  >
                    {isAdded ? (
                      <>
                        <span className="sr-only">Added</span>
                        <Badge variant="outline" className="text-xs">Added</Badge>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        <span>Add</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Create Collection Link */}
        <div className="pt-2 text-center">
          <Button variant="link" size="sm" onClick={() => window.location.href = '/collections'}>
            Create New Collection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}