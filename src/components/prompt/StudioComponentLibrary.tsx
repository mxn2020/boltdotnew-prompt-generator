import React from 'react';
import { Search, Star, Download, Eye, Heart, Library, X, Filter, Grid, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Component {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'wrapper' | 'template' | 'asset';
  tags: string[];
  rating: number;
  usage_count: number;
  version_major: number;
  version_minor: number;
  version_batch: number;
  content?: string;
  author?: string;
  created_at?: string;
  is_featured?: boolean;
}

interface StudioComponentLibraryProps {
  onSelectComponent?: (component: Component) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Mock data for demonstration
const mockComponents: Component[] = [
  {
    id: '1',
    title: 'System Context Module',
    description: 'Provides system-level context and role definition for AI assistants',
    type: 'module',
    tags: ['system', 'context', 'role'],
    rating: 4.8,
    usage_count: 1205,
    version_major: 2,
    version_minor: 1,
    version_batch: 0,
    author: 'PromptLab',
    is_featured: true,
    content: 'You are a helpful AI assistant with expertise in...'
  },
  {
    id: '2',
    title: 'Output Format Wrapper',
    description: 'Structured wrapper for consistent output formatting',
    type: 'wrapper',
    tags: ['format', 'structure', 'output'],
    rating: 4.6,
    usage_count: 892,
    version_major: 1,
    version_minor: 3,
    version_batch: 2,
    author: 'Community',
    content: 'Please format your response as follows...'
  },
  {
    id: '3',
    title: 'Code Review Template',
    description: 'Complete template for performing thorough code reviews',
    type: 'template',
    tags: ['code', 'review', 'development'],
    rating: 4.9,
    usage_count: 756,
    version_major: 3,
    version_minor: 0,
    version_batch: 1,
    author: 'DevTools',
    is_featured: true,
    content: 'Review the following code for...'
  },
  {
    id: '4',
    title: 'JSON Schema Asset',
    description: 'Reusable JSON schema definitions for structured data',
    type: 'asset',
    tags: ['json', 'schema', 'data'],
    rating: 4.4,
    usage_count: 523,
    version_major: 1,
    version_minor: 2,
    version_batch: 0,
    author: 'DataTeam',
    content: '{"type": "object", "properties": {...}}'
  },
  {
    id: '5',
    title: 'Error Handling Module',
    description: 'Graceful error handling and user feedback patterns',
    type: 'module',
    tags: ['error', 'handling', 'feedback'],
    rating: 4.7,
    usage_count: 634,
    version_major: 1,
    version_minor: 1,
    version_batch: 3,
    author: 'Community',
    content: 'When encountering errors, please...'
  }
];

export function StudioComponentLibrary({ onSelectComponent, isOpen, onToggle }: StudioComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<'all' | Component['type']>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'rating' | 'usage' | 'recent'>('rating');

  const filteredComponents = mockComponents.filter(component => {
    if (searchQuery && !component.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !component.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (selectedType !== 'all' && component.type !== selectedType) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'usage':
        return b.usage_count - a.usage_count;
      case 'recent':
        return b.version_major - a.version_major;
      default:
        return 0;
    }
  });

  const componentTypeCounts = {
    all: mockComponents.length,
    module: mockComponents.filter(c => c.type === 'module').length,
    wrapper: mockComponents.filter(c => c.type === 'wrapper').length,
    template: mockComponents.filter(c => c.type === 'template').length,
    asset: mockComponents.filter(c => c.type === 'asset').length,
  };

  const typeColors = {
    module: 'bg-purple-100 text-purple-800 border-purple-200',
    wrapper: 'bg-blue-100 text-blue-800 border-blue-200',
    template: 'bg-green-100 text-green-800 border-green-200',
    asset: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onToggle}
      >
        <Library className="w-4 h-4 mr-2" />
        Components
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Library className="w-5 h-5 mr-2 text-primary" />
          Component Library
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="usage">Most Used</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Component Type Tabs */}
        <Tabs value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All ({componentTypeCounts.all})
            </TabsTrigger>
            <TabsTrigger value="module" className="flex-1">
              Modules ({componentTypeCounts.module})
            </TabsTrigger>
            <TabsTrigger value="wrapper" className="flex-1">
              Wrappers ({componentTypeCounts.wrapper})
            </TabsTrigger>
            <TabsTrigger value="template" className="flex-1">
              Templates ({componentTypeCounts.template})
            </TabsTrigger>
            <TabsTrigger value="asset" className="flex-1">
              Assets ({componentTypeCounts.asset})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Featured Components */}
        {selectedType === 'all' && searchQuery === '' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Featured Components</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mockComponents.filter(c => c.is_featured).map((component) => (
                <div key={component.id} className="flex-shrink-0">
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left justify-start min-w-48"
                    onClick={() => onSelectComponent?.(component)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{component.title}</span>
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                      </div>
                      <div className="text-xs text-muted-foreground">{component.description}</div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Components List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-8">
              <Library className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No components found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms.' : 'No components available for the selected type.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredComponents.map((component) => (
                <ComponentGridCard
                  key={component.id}
                  component={component}
                  onSelect={onSelectComponent}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredComponents.map((component) => (
                <ComponentListItem
                  key={component.id}
                  component={component}
                  onSelect={onSelectComponent}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredComponents.length} components available
          </p>
          <Button onClick={onToggle} variant="default" size="sm">
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ComponentCardProps {
  component: Component;
  onSelect?: (component: Component) => void;
}

function ComponentGridCard({ component, onSelect }: ComponentCardProps) {
  const typeColors = {
    module: 'bg-purple-100 text-purple-800 border-purple-200',
    wrapper: 'bg-blue-100 text-blue-800 border-blue-200',
    template: 'bg-green-100 text-green-800 border-green-200',
    asset: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect?.(component)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{component.title}</h3>
              {component.is_featured && (
                <Star className="w-3 h-3 fill-current text-yellow-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{component.description}</p>
          </div>
          <Badge variant="outline" className={cn('ml-2 text-xs', typeColors[component.type])}>
            {component.type}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {component.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {component.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{component.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{component.usage_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              <span>{component.rating}</span>
            </div>
          </div>
          <span>v{component.version_major}.{component.version_minor}.{component.version_batch}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ComponentListItem({ component, onSelect }: ComponentCardProps) {
  const typeColors = {
    module: 'bg-purple-100 text-purple-800 border-purple-200',
    wrapper: 'bg-blue-100 text-blue-800 border-blue-200',
    template: 'bg-green-100 text-green-800 border-green-200',
    asset: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <div 
      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={() => onSelect?.(component)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{component.title}</h3>
          {component.is_featured && (
            <Star className="w-3 h-3 fill-current text-yellow-400 flex-shrink-0" />
          )}
          <Badge variant="outline" className={cn('text-xs flex-shrink-0', typeColors[component.type])}>
            {component.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{component.description}</p>
      </div>
      
      <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-shrink-0">
        <div className="flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>{component.usage_count}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 fill-current text-yellow-400" />
          <span>{component.rating}</span>
        </div>
        <span>v{component.version_major}.{component.version_minor}.{component.version_batch}</span>
      </div>
    </div>
  );
}