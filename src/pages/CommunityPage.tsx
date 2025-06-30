import React from 'react';
import { Layout } from '../components/layout/Layout';
import { CommunityMarketplace } from '../components/community/CommunityMarketplace';
import { CollectionsManager } from '../components/community/CollectionsManager';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { Users, TrendingUp, FolderOpen, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';

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

  const renderContent = () => {
    switch (activeTab) {
      case 'marketplace':
        return <CommunityMarketplace onSelectPrompt={handleSelectPrompt} />;
      case 'collections':
        return <CollectionsManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <CommunityMarketplace onSelectPrompt={handleSelectPrompt} />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
              <p className="text-gray-600">
                Discover, share, and collaborate on amazing prompts with the community
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
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
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderContent()}
        </div>

        {/* Community Stats */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">10,000+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">50,000+</div>
              <div className="text-sm text-gray-600">Prompts Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1M+</div>
              <div className="text-sm text-gray-600">Prompt Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">25,000+</div>
              <div className="text-sm text-gray-600">Collections</div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        {activeTab === 'marketplace' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started with Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Discover Trending</h4>
                <p className="text-sm text-gray-600">
                  Explore the most popular and trending prompts in the community
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Create Collections</h4>
                <p className="text-sm text-gray-600">
                  Organize your favorite prompts into themed collections
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Track Performance</h4>
                <p className="text-sm text-gray-600">
                  Monitor your prompt analytics and community engagement
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}