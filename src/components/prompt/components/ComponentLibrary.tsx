import React from 'react';
import { Search, Filter, Plus, Star, Download, Eye, Heart, Edit } from 'lucide-react';
import { useComponents, useCreateComponent, useRateComponent } from '../../../hooks/useComponents';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Component, ComponentType, ComponentFilters } from '../../../types/component';

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
    <div className={cn('bg-white', embedded ? 'rounded-lg border border-gray-200' : '')}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Component Library</h2>
            <p className="text-sm text-gray-600">
              Reusable modules, wrappers, and templates for prompt engineering
            </p>
          </div>
          {onCreateComponent && (
            <button
              onClick={onCreateComponent}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create Component</span>
            </button>
          )}
          <button
            onClick={() => navigate(`/component-editor/${component.id}`)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Component Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {componentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                selectedType === type.value
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {type.label} ({type.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Components Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading components...</div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No components found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms.' : 'No components available for the selected type.'}
            </p>
            {onCreateComponent && (
              <button
                onClick={onCreateComponent}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create First Component
              </button>
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
      </div>
    </div>
  );
}

interface ComponentCardProps {
  component: Component;
  onSelect?: (component: Component) => void;
  onRate?: (rating: number, review?: string) => void;
}

function ComponentCard({ component, onSelect, onRate }: ComponentCardProps) {
  const typeColors = {
    module: 'bg-purple-100 text-purple-800',
    wrapper: 'bg-blue-100 text-blue-800',
    template: 'bg-green-100 text-green-800',
    asset: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{component.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{component.description}</p>
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium ml-2',
          typeColors[component.type]
        )}>
          {component.type}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {component.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
          >
            {tag}
          </span>
        ))}
        {component.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
            +{component.tags.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
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

      <div className="flex items-center space-x-2">
        {onSelect && (
          <button
            onClick={() => onSelect(component)}
            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Use Component
          </button>
        )}
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onRate?.(5)}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}