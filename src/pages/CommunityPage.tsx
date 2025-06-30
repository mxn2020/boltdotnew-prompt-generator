import React from 'react';
import { Layout } from '../components/layout/Layout';
import { CommunityMarketplace } from '../components/community/CommunityMarketplace';
import { CollectionsManager } from '../components/community/CollectionsManager';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { Users, TrendingUp, FolderOpen, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CommunityPage() {
  const [activeTab, setActiveTab] = React.useState<'marketplace' | 'collections' | 'analytics'>('marketplace');

  const tabs = [
    { id: 'marketplace', label: 'Marketplace', icon: Users, description: 'Discover trending and recommended prompts' },
    { id: 'collections', label: 'Collections', icon: FolderOpen, description: 'Organize prompts into curated collections' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Track your prompt performance and engagement' },
  ];

  const handleSelectPrompt = (promptId: string) => {
    // Navigate to prompt editor with the selected prompt
    window.location.href = `/editor?prompt=${promptId}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Community Hub</h1>
              <p className="text-muted-foreground">
                Discover, share, and collaborate on amazing prompts with the community
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Description */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>

            {/* Content */}
            <div className="mb-8">
              <TabsContent value="marketplace" className="mt-0">
                <CommunityMarketplace onSelectPrompt={handleSelectPrompt} />
              </TabsContent>
              <TabsContent value="collections" className="mt-0">
                <CollectionsManager />
              </TabsContent>
              <TabsContent value="analytics" className="mt-0">
                <AnalyticsDashboard />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Community Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Community Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">10,000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">50,000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Prompts Created</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">1M+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Prompt Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">25,000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Collections</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        {activeTab === 'marketplace' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Getting Started with Community</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Discover Trending</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore the most popular and trending prompts in the community
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Create Collections</h4>
                  <p className="text-sm text-muted-foreground">
                    Organize your favorite prompts into themed collections
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium mb-2">Track Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your prompt analytics and community engagement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}