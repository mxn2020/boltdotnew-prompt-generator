import React from 'react';
import { Search, Filter, Plus, Star, Download, Eye, Heart } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Component, ComponentType, ComponentFilters } from '../../../types/component';

interface ComponentLibraryProps {
  onSelectComponent?: (component: Component) => void;
  onCreateComponent?: () => void;
  embedded?: boolean;
}

// Mock data for demonstration
const mockComponents: Component[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'JSON Formatter',
    description: 'Formats output as structured JSON with proper validation',
    type: 'wrapper',
    content: {
      wrapperType: 'format-json',
      wrapperLogic: 'Format the response as valid JSON with proper structure and validation.',
    },
    category: 'formatting',
    tags: ['json', 'formatting', 'validation'],
    is_public: true,
    usage_count: 156,
    rating: 4.8,
    version_major: 1,
    version_minor: 2,
    version_batch: 0,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    user_id: 'user2',
    title: 'Code Review Assistant',
    description: 'Comprehensive code review module with best practices',
    type: 'module',
    content: {
      moduleContent: 'Review the provided code for:\n- Code quality and readability\n- Performance optimizations\n- Security vulnerabilities\n- Best practices adherence',
    },
    category: 'development',
    tags: ['code-review', 'development', 'quality'],
    is_public: true,
    usage_count: 89,
    rating: 4.6,
    version_major: 2,
    version_minor: 0,
    version_batch: 3,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-25T12:00:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    title: 'Data Analysis Template',
    description: 'Template for structured data analysis and reporting',
    type: 'template',
    content: {
      templateStructure: {
        sections: [
          { title: 'Data Overview', content: 'Analyze the provided dataset...' },
          { title: 'Key Insights', content: 'Identify significant patterns...' },
          { title: 'Recommendations', content: 'Provide actionable recommendations...' },
        ],
      },
    },
    category: 'analysis',
    tags: ['data', 'analysis', 'reporting'],
    is_public: true,
    usage_count: 234,
    rating: 4.9,
    version_major: 1,
    version_minor: 0,
    version_batch: 0,
    created_at: '2024-01-05T14:00:00Z',
    updated_at: '2024-01-18T09:30:00Z',
  },
];

export function ComponentLibrary({ onSelectComponent, onCreateComponent, embedded = false }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<ComponentFilters>({});
  const [selectedType, setSelectedType] = React.useState<ComponentType | 'all'>('all');

  const filteredComponents = mockComponents.filter(component => {
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
    { value: 'all', label: 'All Components', count: mockComponents.length },
    { value: 'module', label: 'Modules', count: mockComponents.filter(c => c.type === 'module').length },
    { value: 'wrapper', label: 'Wrappers', count: mockComponents.filter(c => c.type === 'wrapper').length },
    { value: 'template', label: 'Templates', count: mockComponents.filter(c => c.type === 'template').length },
    { value: 'asset', label: 'Assets', count: mockComponents.filter(c => c.type === 'asset').length },
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
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Component</span>
            </button>
          )}
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
        {filteredComponents.length === 0 ? (
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
}

function ComponentCard({ component, onSelect }: ComponentCardProps) {
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
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}