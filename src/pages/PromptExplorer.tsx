import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Search, Filter, Grid, List, Plus, Loader2 } from 'lucide-react';
import { usePrompts, useClonePrompt, useDeletePrompt } from '../hooks/usePrompts';
import { PromptCard } from '../components/prompt/PromptCard';
import type { PromptFilters, PromptSortOptions } from '../types/prompt';

export function PromptExplorer() {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState<PromptFilters>({});
  const [sort, setSort] = React.useState<PromptSortOptions>({
    field: 'updated_at',
    direction: 'desc'
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const { data: prompts, isLoading, error } = usePrompts(filters, sort);
  const clonePrompt = useClonePrompt();
  const deletePrompt = useDeletePrompt();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query || undefined }));
  };

  const handleEdit = (prompt: any) => {
    navigate(`/studio?prompt=${prompt.id}`);
  };

  const handleClone = async (prompt: any) => {
    try {
      const clonedPrompt = await clonePrompt.mutateAsync(prompt.id);
      navigate(`/studio?prompt=${clonedPrompt.id}`);
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
    navigate('/studio');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prompt Explorer</h1>
              <p className="text-gray-600 mt-1">
                Browse, search, and manage your prompt library
              </p>
            </div>
            <button 
              onClick={handleNewPrompt}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Prompt</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search prompts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="ai">AI Assistant</option>
                <option value="web">Web Development</option>
                <option value="data">Data Analysis</option>
                <option value="creative">Creative Writing</option>
                <option value="business">Business</option>
                <option value="research">Research</option>
              </select>

              {/* Structure Filter */}
              <select
                value={filters.structure_type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, structure_type: e.target.value as any || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Structures</option>
                <option value="standard">Standard</option>
                <option value="structured">Structured</option>
                <option value="modulized">Modulized</option>
                <option value="advanced">Advanced</option>
              </select>

              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors border-l border-gray-300 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Failed to load prompts. Please try again.</p>
          </div>
        ) : !prompts || prompts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No prompts found' : 'No prompts yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Start building your prompt library by creating your first prompt in the Studio.'
                }
              </p>
              <button 
                onClick={handleNewPrompt}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {searchQuery ? 'Create New Prompt' : 'Create Your First Prompt'}
              </button>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={handleEdit}
                onClone={handleClone}
                onDelete={handleDelete}
                variant={viewMode === 'list' ? 'compact' : 'default'}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}