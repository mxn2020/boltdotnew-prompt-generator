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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile || !stats) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
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
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative mx-auto md:mx-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={profile.avatar_url} 
                    alt={profile.full_name || profile.email}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4 text-primary-foreground" />
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
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {profile.full_name || 'Anonymous User'}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-muted-foreground mb-3">{profile.email}</p>
                
                {profile.bio && (
                  <p className="text-sm mb-3">{profile.bio}</p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(stats.join_date).toLocaleDateString()}</span>
                  </div>
                  
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
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
                      className="flex items-center gap-1 hover:underline"
                    >
                      <Github className="w-4 h-4" />
                      <span className="hidden sm:inline">@</span>{profile.github_username}
                    </a>
                  )}
                  
                  {profile.twitter_username && (
                    <a
                      href={`https://twitter.com/${profile.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="hidden sm:inline">@</span>{profile.twitter_username}
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
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.total_prompts >= 10 && (
                <AchievementBadge
                  icon={TrendingUp}
                  label="Prolific Creator"
                  description="Created 10+ prompts"
                  variant="secondary"
                />
              )}
              {stats.total_likes >= 50 && (
                <AchievementBadge
                  icon={Heart}
                  label="Community Favorite"
                  description="Received 50+ likes"
                  variant="destructive"
                />
              )}
              {stats.streak_days >= 7 && (
                <AchievementBadge
                  icon={Award}
                  label="Consistent Creator"
                  description={`${stats.streak_days} day streak`}
                  variant="secondary"
                />
              )}
              {stats.avg_rating >= 4.5 && (
                <AchievementBadge
                  icon={Star}
                  label="Quality Creator"
                  description="4.5+ average rating"
                  variant="outline"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.charAt(0)}</span>
                    <Badge variant="secondary" className="ml-2">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="prompts" className="mt-0">
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
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                    <p className="text-muted-foreground">Start creating prompts to see them here</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="collections" className="mt-0">
                {collections && collections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collections.map((collection) => (
                      <Card key={collection.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FolderOpen className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold">{collection.title}</h3>
                          </div>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {collection.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{collection.prompt_count} prompts</span>
                            <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
                    <p className="text-muted-foreground">Create collections to organize your prompts</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
                  <p className="text-muted-foreground">Activity tracking coming soon</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', bgColor)}>
            <Icon className={cn('w-4 h-4', color)} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-lg font-bold truncate">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AchievementBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}

function AchievementBadge({ icon: Icon, label, description, variant }: AchievementBadgeProps) {
  return (
    <Badge variant={variant} className="flex items-center gap-2 px-3 py-2">
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
      <span className="text-xs opacity-75 hidden sm:inline">({description})</span>
    </Badge>
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
    <div className="mt-6 pt-6 border-t">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="github">GitHub Username</Label>
            <Input
              id="github"
              value={formData.github_username}
              onChange={(e) => setFormData(prev => ({ ...prev, github_username: e.target.value }))}
              placeholder="username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Username</Label>
            <Input
              id="twitter"
              value={formData.twitter_username}
              onChange={(e) => setFormData(prev => ({ ...prev, twitter_username: e.target.value }))}
              placeholder="username"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}