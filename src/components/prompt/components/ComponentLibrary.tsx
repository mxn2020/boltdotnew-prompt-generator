import React from 'react';
import { Search, Filter, Plus, Star, Download, Eye, Heart, Edit } from 'lucide-react';
import { useComponents, useCreateComponent, useRateComponent } from '../../../hooks/useComponents';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Component, ComponentType, ComponentFilters } from '../../../types/component';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ComponentLibraryProps {
  onSelectComponent?: (component: Component) => void;
  onCreateComponent?: () => void;
  embedded?: boolean;
}

export function ComponentLibrary({ onSelectComponent, onCreateComponent, embedded = false }: ComponentLibraryProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<ComponentFilters>({});
  const [selectedType, setSelectedType] = React.useState<ComponentType | 'all'>('all');

  const { data: components, isLoading } = useComponents(filters);
  const createComponent = useCreateComponent();
  const rateComponent = useRateComponent();

  const filteredComponents = (components || []).filter(component => {
    if (searchQuery && !component.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !component.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && component.type !== selectedType) {
      return false;
    }
    return true;
  });

  const componentTypes: { value: ComponentType | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All Components', count: components?.length || 0 },
    { value: 'module', label: 'Modules', count: components?.filter(c => c.type === 'module').length || 0 },
    { value: 'wrapper', label: 'Wrappers', count: components?.filter(c => c.type === 'wrapper').length || 0 },
    { value: 'template', label: 'Templates', count: components?.filter(c => c.type === 'template').length || 0 },
    { value: 'asset', label: 'Assets', count: components?.filter(c => c.type === 'asset').length || 0 },
  ];

  return (
    <Card className={cn(embedded ? 'border' : 'border-0 shadow-none')}>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Component Library</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Reusable modules, wrappers, and templates for prompt engineering
            </p>
          </div>
          {onCreateComponent && (
            <Button onClick={onCreateComponent} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Component
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" className="w-full lg:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </CardHeader>

      {/* Component Type Tabs */}
      <div className="border-b border-border px-6">
        <nav className="flex space-x-8">
          {componentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                selectedType === type.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              {type.label} ({type.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Components Grid */}
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No components found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search terms.' : 'No components available for the selected type.'}
            </p>
            {onCreateComponent && (
              <Button onClick={onCreateComponent}>
                Create First Component
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onSelect={onSelectComponent}
                onRate={(rating, review) => rateComponent.mutateAsync({
                  componentId: component.id,
                  rating,
                  review
                })}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ComponentCardProps {
  component: Component;
  onSelect?: (component: Component) => void;
  onRate?: (rating: number, review?: string) => void;
}

function ComponentCard({ component, onSelect, onRate }: ComponentCardProps) {
  const navigate = useNavigate();

  const typeColors = {
    module: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    wrapper: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    template: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    asset: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1 truncate">{component.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {component.description}
            </p>
          </div>
          <Badge className={cn('ml-2 flex-shrink-0', typeColors[component.type])}>
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

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{component.usage_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              <span>{component.rating.toFixed(1)}</span>
            </div>
          </div>
          <span>v{component.version_major}.{component.version_minor}.{component.version_batch}</span>
        </div>

        <div className="flex items-center gap-2">
          {onSelect && (
            <Button 
              onClick={() => onSelect(component)}
              className="flex-1"
              size="sm"
            >
              Use Component
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/component-editor/${component.id}`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRate?.(5)}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}