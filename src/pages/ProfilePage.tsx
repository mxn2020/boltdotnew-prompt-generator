import React from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  User, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Github, 
  Twitter,
  Edit,
  Camera,
  Star,
  Eye,
  Heart,
  GitFork,
  FolderOpen,
  TrendingUp,
  Award
} from 'lucide-react';
import { useProfile, useUpdateProfile, useUserStats, useUploadAvatar } from '../hooks/useProfile';
import { usePrompts } from '../hooks/usePrompts';
import { useCollections } from '../hooks/useCommunity';
import { PromptCard } from '../components/prompt/PromptCard';
import { cn } from '../lib/utils';
import type { UpdateProfileData } from '../types/user';

export function ProfilePage() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'prompts' | 'collections' | 'activity'>('prompts');

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: prompts } = usePrompts({ user_id: profile?.id });
  const { data: collections } = useCollections();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const handleUpdateProfile = async (data: UpdateProfileData) => {
    try {
      await updateProfile.mutateAsync(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar.mutateAsync(file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  if (profileLoading || statsLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile || !stats) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'prompts', label: 'Prompts', count: stats.total_prompts },
    { id: 'collections', label: 'Collections', count: stats.total_collections },
    { id: 'activity', label: 'Activity', count: 0 },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.email}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-3">{profile.email}</p>
              
              {profile.bio && (
                <p className="text-gray-700 mb-3">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(stats.join_date).toLocaleDateString()}</span>
                </div>
                
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
                
                {profile.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  >
                    <Github className="w-4 h-4" />
                    <span>@{profile.github_username}</span>
                  </a>
                )}
                
                {profile.twitter_username && (
                  <a
                    href={`https://twitter.com/${profile.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>@{profile.twitter_username}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <ProfileEditForm
              profile={profile}
              onSave={handleUpdateProfile}
              onCancel={() => setIsEditing(false)}
              isLoading={updateProfile.isPending}
            />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.total_views}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={stats.total_likes}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <StatCard
            icon={GitFork}
            label="Total Forks"
            value={stats.total_forks}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value={stats.avg_rating.toFixed(1)}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
        </div>

        {/* Achievement Badges */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
          <div className="flex flex-wrap gap-3">
            {stats.total_prompts >= 10 && (
              <Badge
                icon={TrendingUp}
                label="Prolific Creator"
                description="Created 10+ prompts"
                color="bg-green-100 text-green-800"
              />
            )}
            {stats.total_likes >= 50 && (
              <Badge
                icon={Heart}
                label="Community Favorite"
                description="Received 50+ likes"
                color="bg-red-100 text-red-800"
              />
            )}
            {stats.streak_days >= 7 && (
              <Badge
                icon={Award}
                label="Consistent Creator"
                description={`${stats.streak_days} day streak`}
                color="bg-purple-100 text-purple-800"
              />
            )}
            {stats.avg_rating >= 4.5 && (
              <Badge
                icon={Star}
                label="Quality Creator"
                description="4.5+ average rating"
                color="bg-yellow-100 text-yellow-800"
              />
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'prompts' && (
              <div>
                {prompts && prompts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prompts.map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        variant="compact"
                        showAuthor={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No prompts yet</h3>
                    <p className="text-gray-600">Start creating prompts to see them here</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collections' && (
              <div>
                {collections && collections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <FolderOpen className="w-4 h-4 text-indigo-600" />
                          <h3 className="font-semibold text-gray-900">{collection.title}</h3>
                        </div>
                        {collection.description && (
                          <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{collection.prompt_count} prompts</span>
                          <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections yet</h3>
                    <p className="text-gray-600">Create collections to organize your prompts</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Feed</h3>
                <p className="text-gray-600">Activity tracking coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className={cn('p-2 rounded-lg', bgColor)}>
          <Icon className={cn('w-4 h-4', color)} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface BadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
}

function Badge({ icon: Icon, label, description, color }: BadgeProps) {
  return (
    <div className={cn('flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium', color)}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      <span className="text-xs opacity-75">({description})</span>
    </div>
  );
}

interface ProfileEditFormProps {
  profile: any;
  onSave: (data: UpdateProfileData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ProfileEditForm({ profile, onSave, onCancel, isLoading }: ProfileEditFormProps) {
  const [formData, setFormData] = React.useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    website: profile.website || '',
    github_username: profile.github_username || '',
    twitter_username: profile.twitter_username || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Username
            </label>
            <input
              type="text"
              value={formData.github_username}
              onChange={(e) => setFormData(prev => ({ ...prev, github_username: e.target.value }))}
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter Username
            </label>
            <input
              type="text"
              value={formData.twitter_username}
              onChange={(e) => setFormData(prev => ({ ...prev, twitter_username: e.target.value }))}
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}