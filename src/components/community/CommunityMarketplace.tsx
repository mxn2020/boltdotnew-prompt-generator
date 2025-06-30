import React from 'react';
import { Search, Filter, TrendingUp, Star, Eye, Heart, GitFork, Clock, Users } from 'lucide-react';
import { useTrendingPrompts, useRecommendedPrompts, useTogglePromptLike } from '../../hooks/useCommunity';
import { PromptCard } from '../prompt/PromptCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommunityMarketplaceProps {
  onSelectPrompt?: (promptId: string) => void;
}

export function CommunityMarketplace({ onSelectPrompt }: CommunityMarketplaceProps) {
  const [activeTab, setActiveTab] = React.useState<'trending' | 'recommended' | 'recent'>('trending');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [timePeriod, setTimePeriod] = React.useState('7 days');

  const { data: trendingPrompts, isLoading: loadingTrending } = useTrendingPrompts(timePeriod);
  const { data: recommendedPrompts, isLoading: loadingRecommended } = useRecommendedPrompts();
  const toggleLike = useTogglePromptLike();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
    <Card>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl">Community Marketplace</CardTitle>
            <p className="text-sm text-muted-foreground">
              Discover, share, and collaborate on amazing prompts from the community
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">
              {(trendingPrompts?.length || 0) + (recommendedPrompts?.length || 0)} prompts
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search community prompts..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 day">Last 24 hours</SelectItem>
                <SelectItem value="7 days">Last week</SelectItem>
                <SelectItem value="30 days">Last month</SelectItem>
                <SelectItem value="365 days">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="w-full justify-start rounded-none border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content */}
        <TabsContent value="trending" className="mt-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'trending' && renderPrompts()}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'recommended' && renderPrompts()}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'recent' && renderPrompts()}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

interface TrendingPromptCardProps {
  prompt: any;
  onSelect: () => void;
  onLike: () => void;
}

function TrendingPromptCard({ prompt, onSelect, onLike }: TrendingPromptCardProps) {
  return (
    <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1" onClick={onSelect}>
          <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
            {prompt.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-600">
            {Math.round(prompt.trend_score)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <Badge variant="secondary">
          {prompt.structure_type}
        </Badge>
        <Badge variant="outline">
          {prompt.category}
        </Badge>
        {prompt.tags.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="h-auto p-1 hover:text-red-500"
        >
          <Heart className="w-4 h-4 mr-1" />
          <span>{prompt.like_count}</span>
        </Button>
      </div>
    </Card>
  );
}

interface RecommendedPromptCardProps {
  prompt: any;
  onSelect: () => void;
  onLike: () => void;
}

function RecommendedPromptCard({ prompt, onSelect, onLike }: RecommendedPromptCardProps) {
  return (
    <Card className="p-4 hover:border-purple-500/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1" onClick={onSelect}>
          <h3 className="font-semibold mb-1 hover:text-purple-600 transition-colors">
            {prompt.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Star className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-600">
            {Math.round(prompt.recommendation_score)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <Badge variant="secondary">
          {prompt.structure_type}
        </Badge>
        <Badge variant="outline">
          {prompt.category}
        </Badge>
        {prompt.tags.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="h-auto p-1 hover:text-red-500"
        >
          <Heart className="w-4 h-4 mr-1" />
          <span>{prompt.like_count}</span>
        </Button>
      </div>
    </Card>
  );
}