import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Search, Filter, Grid, List, Plus, Loader2 } from 'lucide-react';
import { usePrompts, useClonePrompt, useDeletePrompt } from '../hooks/usePrompts';
import { useAssets } from '../hooks/useAssets';
import { PromptCard } from '../components/prompt/PromptCard';
import type { PromptFilters, PromptSortOptions } from '../types/prompt';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function PromptExplorer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'prompts' | 'assets'>('prompts');
  const [filters, setFilters] = React.useState<PromptFilters>({});
  const [sort, setSort] = React.useState<PromptSortOptions>({
    field: 'updated_at',
    direction: 'desc'
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const { data: prompts, isLoading, error } = usePrompts(filters, sort);
  const { data: assets, isLoading: assetsLoading } = useAssets(filters, sort);
  const clonePrompt = useClonePrompt();
  const deletePrompt = useDeletePrompt();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query || undefined }));
  };

  const handleEdit = (prompt: any) => {
    if (prompt.prompt_type === 'prompt') {
      navigate(`/editor?prompt=${prompt.id}`);
    } else {
      navigate(`/asset-editor/${prompt.id}`);
    }
  };

  const handleClone = async (prompt: any) => {
    try {
      const clonedPrompt = await clonePrompt.mutateAsync(prompt.id);
      navigate(`/editor?prompt=${clonedPrompt.id}`);
    } catch (error) {
      console.error('Failed to clone prompt:', error);
    }
  };

  const handleDelete = async (prompt: any) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePrompt.mutateAsync(prompt.id);
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  };

  const handleNewPrompt = () => {
    navigate('/editor');
  };

  const handleNewAsset = () => {
    navigate('/editor?asset=true');
  };

  const isLoaded = activeTab === 'prompts' ? !isLoading : !assetsLoading;
  const items = activeTab === 'prompts' ? prompts : assets;
  const isEmpty = !items || items.length === 0;

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Prompt Explorer</h1>
              <p className="text-muted-foreground mt-1">
                Browse, search, and manage your prompt and asset library
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activeTab === 'prompts' ? (
                <Button onClick={handleNewPrompt} className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  New Prompt
                </Button>
              ) : (
                <Button onClick={handleNewAsset} variant="secondary" className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  New Asset
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search prompts..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Category Filter */}
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="ai">AI Assistant</SelectItem>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="data">Data Analysis</SelectItem>
                    <SelectItem value="creative">Creative Writing</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>

                {/* Structure Filter */}
                <Select
                  value={filters.structure_type || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, structure_type: value === 'all' ? undefined : value as any }))}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Structures" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Structures</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="structured">Structured</SelectItem>
                    <SelectItem value="modulized">Modulized</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>

                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)}>
                  <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
                    <Grid className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view" size="sm">
                    <List className="w-4 h-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="prompts" className="mt-0">
            {!isLoaded ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">Failed to load prompts. Please try again.</p>
                </CardContent>
              </Card>
            ) : isEmpty ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? `No ${activeTab} found` : `No ${activeTab} yet`}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery
                        ? 'Try adjusting your search or filters to find what you\'re looking for.'
                        : activeTab === 'prompts'
                          ? 'Start building your prompt library by creating your first prompt in the Studio.'
                          : 'Create your first asset to enhance your prompts with reusable components.'
                      }
                    </p>
                    {activeTab === 'prompts' ? (
                      <Button onClick={handleNewPrompt}>
                        {searchQuery ? 'Create New Prompt' : 'Create Your First Prompt'}
                      </Button>
                    ) : (
                      <Button onClick={handleNewAsset} variant="secondary">
                        {searchQuery ? 'Create New Asset' : 'Create Your First Asset'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {items.map((item) => (
                  <PromptCard
                    key={item.id}
                    prompt={item}
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onDelete={handleDelete}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                    isAsset={item.prompt_type !== 'prompt'}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assets" className="mt-0">
            {assetsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : isEmpty ? (

              <Card>
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first asset to enhance your prompts with reusable components.
                    </p>
                    <Button onClick={handleNewAsset} variant="secondary">
                      Create Your First Asset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {items.map((item) => (
                  <PromptCard
                    key={item.id}
                    prompt={item}
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onDelete={handleDelete}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                    isAsset={item.prompt_type !== 'prompt'}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}