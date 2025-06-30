import React from 'react';
import { Search, Filter, TrendingUp, Star, Eye, Heart, GitFork, Clock, Users } from 'lucide-react';
import { useTrendingPrompts, useRecommendedPrompts, useTogglePromptLike } from '../../hooks/useCommunity';
import { PromptCard } from '../prompt/PromptCard';
import { cn } from '../../lib/utils';
import type { CommunityFilters, CommunitySortOptions } from '../../types/community';

interface CommunityMarketplaceProps {
  onSelectPrompt?: (promptId: string) => void;
}

export function CommunityMarketplace({ onSelectPrompt }: CommunityMarketplaceProps) {
  const [activeTab, setActiveTab] = React.useState<'trending' | 'recommended' | 'recent'>('trending');
  const [filters, setFilters] = React.useState<CommunityFilters>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [timePeriod, setTimePeriod] = React.useState('7 days');

  const { data: trendingPrompts, isLoading: loadingTrending } = useTrendingPrompts(timePeriod);
  const { data: recommendedPrompts, isLoading: loadingRecommended } = useRecommendedPrompts();
  const toggleLike = useTogglePromptLike();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query || undefined }));
  };

  const handleLike = async (promptId: string) => {
    try {
      await toggleLike.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp, count: trendingPrompts?.length || 0 },
    { id: 'recommended', label: 'For You', icon: Star, count: recommendedPrompts?.length || 0 },
    { id: 'recent', label: 'Recent', icon: Clock, count: 0 },
  ];

  const renderPrompts = () => {
    if (activeTab === 'trending') {
      if (loadingTrending) {
        return <div className="text-center py-8">Loading trending prompts...</div>;
      }
      return trendingPrompts?.map((prompt) => (
        <TrendingPromptCard
          key={prompt.id}
          prompt={prompt}
          onSelect={() => onSelectPrompt?.(prompt.id)}
          onLike={() => handleLike(prompt.id)}
        />
      ));
    }

    if (activeTab === 'recommended') {
      if (loadingRecommended) {
        return <div className="text-center py-8">Loading recommendations...</div>;
      }
      return recommendedPrompts?.map((prompt) => (
        <RecommendedPromptCard
          key={prompt.id}
          prompt={prompt}
          onSelect={() => onSelectPrompt?.(prompt.id)}
          onLike={() => handleLike(prompt.id)}
        />
      ));
    }

    return <div className="text-center py-8">Recent prompts coming soon...</div>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Community Marketplace</h2>
            <p className="text-sm text-gray-600">
              Discover, share, and collaborate on amazing prompts from the community
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              {(trendingPrompts?.length || 0) + (recommendedPrompts?.length || 0)} prompts
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search community prompts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1 day">Last 24 hours</option>
              <option value="7 days">Last week</option>
              <option value="30 days">Last month</option>
              <option value="365 days">Last year</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2',
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs',
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderPrompts()}
        </div>
      </div>
    </div>
  );
}

interface TrendingPromptCardProps {
  prompt: any;
  onSelect: () => void;
  onLike: () => void;
}

function TrendingPromptCard({ prompt, onSelect, onLike }: TrendingPromptCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1" onClick={onSelect}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
            {prompt.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{prompt.description}</p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-600">
            {Math.round(prompt.trend_score)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {prompt.structure_type}
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          {prompt.category}
        </span>
        {prompt.tags.slice(0, 2).map((tag: string) => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{prompt.view_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitFork className="w-3 h-3" />
            <span>{prompt.fork_count}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span>{prompt.like_count}</span>
        </button>
      </div>
    </div>
  );
}

interface RecommendedPromptCardProps {
  prompt: any;
  onSelect: () => void;
  onLike: () => void;
}

function RecommendedPromptCard({ prompt, onSelect, onLike }: RecommendedPromptCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1" onClick={onSelect}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-purple-600 transition-colors">
            {prompt.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{prompt.description}</p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Star className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-600">
            {Math.round(prompt.recommendation_score)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {prompt.structure_type}
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          {prompt.category}
        </span>
        {prompt.tags.slice(0, 2).map((tag: string) => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{prompt.view_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitFork className="w-3 h-3" />
            <span>{prompt.fork_count}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span>{prompt.like_count}</span>
        </button>
      </div>
    </div>
  );
}