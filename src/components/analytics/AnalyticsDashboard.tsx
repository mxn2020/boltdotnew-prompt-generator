import React from 'react';
import { BarChart3, TrendingUp, Eye, Heart, GitFork, Users, Calendar, Star } from 'lucide-react';
import { useUserAnalytics } from '../../hooks/useCommunity';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsDashboardProps {
  timePeriod?: string;
}

export function AnalyticsDashboard({ timePeriod = '30 days' }: AnalyticsDashboardProps) {
  const { data: analytics, isLoading } = useUserAnalytics(timePeriod);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">Start creating prompts to see your analytics</p>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Prompts',
      value: analytics.total_prompts,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Views',
      value: analytics.total_views,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Likes',
      value: analytics.total_likes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Total Forks',
      value: analytics.total_forks,
      icon: GitFork,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Collections',
      value: analytics.total_collections,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      label: 'Avg Rating',
      value: analytics.avg_rating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <Card>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your prompt performance and engagement over the last {timePeriod}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Growing</span>
          </div>
        </div>
      </CardHeader>

      {/* Stats Grid */}
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {analytics.recent_activity && analytics.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recent_activity.slice(0, 10).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className={cn('p-2 rounded-lg', bgColor)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

interface ActivityItemProps {
  activity: {
    date: string;
    event_type: string;
    count: number;
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'prompt_created':
        return BarChart3;
      case 'prompt_viewed':
        return Eye;
      case 'prompt_liked':
        return Heart;
      case 'prompt_forked':
        return GitFork;
      default:
        return Calendar;
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'prompt_created':
        return 'Prompts Created';
      case 'prompt_viewed':
        return 'Prompts Viewed';
      case 'prompt_liked':
        return 'Prompts Liked';
      case 'prompt_forked':
        return 'Prompts Forked';
      default:
        return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const Icon = getEventIcon(activity.event_type);

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">
          {getEventLabel(activity.event_type)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(activity.date).toLocaleDateString()}
        </p>
      </div>
      <span className="text-sm font-semibold">
        {activity.count}
      </span>
    </div>
  );
}