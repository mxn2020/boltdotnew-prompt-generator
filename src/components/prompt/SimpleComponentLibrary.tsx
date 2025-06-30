import React from 'react';
import { Search, Star, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface Component {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'wrapper' | 'template' | 'asset';
  tags: string[];
  rating: number;
  usage_count: number;
  content?: string;
  is_featured?: boolean;
}

interface SimpleComponentLibraryProps {
  onSelectComponent?: (component: Component) => void;
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
    content: 'When encountering errors, please...'
  },
  {
    id: '6',
    title: 'Data Analysis Prompt',
    description: 'Structured prompt for analyzing datasets and generating insights',
    type: 'template',
    tags: ['data', 'analysis', 'insights'],
    rating: 4.5,
    usage_count: 489,
    content: 'Analyze the following dataset and provide insights on...'
  }
];

export function SimpleComponentLibrary({ onSelectComponent }: SimpleComponentLibraryProps) {
  const [selectedType, setSelectedType] = React.useState<string>('all');

  const typeColors = {
    module: 'bg-purple-100 text-purple-800 border-purple-200',
    wrapper: 'bg-blue-100 text-blue-800 border-blue-200',
    template: 'bg-green-100 text-green-800 border-green-200',
    asset: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const typeIcons = {
    module: '⚙️',
    wrapper: '📦',
    template: '📋',
    asset: '🗂️',
  };

  const featuredComponents = mockComponents.filter(c => c.is_featured);
  const regularComponents = mockComponents.filter(c => !c.is_featured);

  // Filter components based on selected type
  const filteredComponents = selectedType === 'all' 
    ? mockComponents 
    : mockComponents.filter(c => c.type === selectedType);
  
  const filteredFeatured = filteredComponents.filter(c => c.is_featured);
  const filteredRegular = filteredComponents.filter(c => !c.is_featured);

  const typeFilters = [
    { value: 'all', label: 'All', icon: '📁', count: mockComponents.length },
    { value: 'module', label: 'Modules', icon: '⚙️', count: mockComponents.filter(c => c.type === 'module').length },
    { value: 'wrapper', label: 'Wrappers', icon: '📦', count: mockComponents.filter(c => c.type === 'wrapper').length },
    { value: 'template', label: 'Templates', icon: '📋', count: mockComponents.filter(c => c.type === 'template').length },
    { value: 'asset', label: 'Assets', icon: '🗂️', count: mockComponents.filter(c => c.type === 'asset').length },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-medium">Component Library</h3>
        <p className="text-sm text-muted-foreground">Search and select reusable components</p>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex flex-wrap gap-1">
        {typeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedType === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(filter.value)}
            className="h-8 text-xs"
          >
            <span className="mr-1">{filter.icon}</span>
            {filter.label}
            <Badge 
              variant="secondary" 
              className="ml-2 h-4 px-1 text-xs"
            >
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>
      
      {/* Search and Command Interface */}
      <Command className="rounded-lg border shadow-sm">
        <CommandInput placeholder="Search components..." />
        <CommandList className="max-h-64">
          <CommandEmpty>No components found.</CommandEmpty>
          
          {/* Featured Components */}
          {filteredFeatured.length > 0 && (
            <CommandGroup heading="Featured">
              {filteredFeatured.map((component) => (
                <CommandItem
                  key={component.id}
                  value={`${component.title} ${component.description} ${component.tags.join(' ')}`}
                  onSelect={() => onSelectComponent?.(component)}
                  className="flex items-start space-x-3 p-3 cursor-pointer"
                >
                  <div className="text-lg">{typeIcons[component.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{component.title}</p>
                      <Badge variant="outline" className={`text-xs ${typeColors[component.type]}`}>
                        {component.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {component.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                        <span>{component.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{component.usage_count}</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
            
          {/* All Components */}
          {filteredRegular.length > 0 && (
            <CommandGroup heading={selectedType === 'all' ? "All Components" : `${typeFilters.find(f => f.value === selectedType)?.label}`}>
              {filteredRegular.map((component) => (
                <CommandItem
                  key={component.id}
                  value={`${component.title} ${component.description} ${component.tags.join(' ')}`}
                  onSelect={() => onSelectComponent?.(component)}
                  className="flex items-start space-x-3 p-3 cursor-pointer"
                >
                  <div className="text-lg">{typeIcons[component.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{component.title}</p>
                      <Badge variant="outline" className={`text-xs ${typeColors[component.type]}`}>
                        {component.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {component.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                        <span>{component.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{component.usage_count}</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>

      {/* Stats */}
      <div className="text-xs text-muted-foreground text-center">
        {selectedType === 'all' 
          ? `${mockComponents.length} components available • ${featuredComponents.length} featured`
          : `${filteredComponents.length} ${typeFilters.find(f => f.value === selectedType)?.label.toLowerCase()} available • ${filteredFeatured.length} featured`
        }
      </div>
    </div>
  );
}