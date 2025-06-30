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
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex flex-col flex-grow pt-5 pb-4">
          {/* Primary Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Workspace
              </h3>
              <div className="mt-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* AI Generation Quick Access */}
            <div className="mb-6">
              <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI Generation</span>
                </div>
                <p className="text-xs text-purple-700 mb-3">
                  Create intelligent prompts with AI assistance
                </p>
                <Link
                  to="/studio?ai=true"
                  className="block w-full text-center bg-purple-600 text-white text-xs py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Generate Prompt
                </Link>
              </div>
              
              {/* Community Highlights */}
              <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Community</span>
                </div>
                <p className="text-xs text-green-700 mb-3">
                  Discover trending prompts and connect with creators
                </p>
                <Link
                  to="/community"
                  className="block w-full text-center bg-green-600 text-white text-xs py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Explore Community
                </Link>
              </div>
            </div>

            {/* Secondary Navigation */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Community
              </h3>
              <div className="mt-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
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