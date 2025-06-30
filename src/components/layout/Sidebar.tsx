import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Library, 
  FolderOpen, 
  BarChart3, 
  Settings,
  Sparkles,
  Users,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Prompt Studio', href: '/studio', icon: Sparkles },
  { name: 'Prompt Editor', href: '/editor', icon: Plus },
  { name: 'Explorer', href: '/explorer', icon: Search },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Collections', href: '/collections', icon: FolderOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const secondaryNavigation = [
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Documentation', href: '/docs', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:border-r lg:bg-background">
      <div className="flex flex-col flex-grow overflow-y-auto">
        <div className="flex flex-col flex-grow px-4 py-6 space-y-6">
          {/* Primary Navigation */}
          <nav className="space-y-1">
            <div className="mb-4">
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Workspace
              </h3>
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10",
                        isActive && "bg-secondary"
                      )}
                      asChild
                    >
                      <Link to={item.href}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* AI Generation Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">AI Generation</span>
                <Badge variant="secondary" className="text-xs">New</Badge>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                Create intelligent prompts with AI assistance
              </p>
              <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <Link to="/studio?ai=true">
                  Generate Prompt
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Community Card */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Community</span>
              </div>
              <p className="text-xs text-green-700 mb-3">
                Discover trending prompts and connect with creators
              </p>
              <Button size="sm" variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white" asChild>
                <Link to="/community">
                  Explore Community
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Secondary Navigation */}
          <nav className="space-y-1">
            <div>
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Community
              </h3>
              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10",
                        isActive && "bg-secondary"
                      )}
                      asChild
                    >
                      <Link to={item.href}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}