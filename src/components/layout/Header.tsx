import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Zap, 
  User, 
  Settings, 
  LogOut, 
  Plus,
  Search,
  Library,
  BarChart3,
  Sparkles,
  CreditCard
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CreditsDisplay } from '../payment/CreditsDisplay';
import { useSubscriptionInfo } from '../../hooks/usePayment';
import { cn } from '../../lib/utils';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: subscriptionInfo } = useSubscriptionInfo();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">PromptCraft</span>
            </Link>

            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  to="/studio"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Studio</span>
                </Link>
                <Link
                  to="/editor"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Editor</span>
                </Link>
                <Link
                  to="/explorer"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Explorer</span>
                </Link>
                <Link
                  to="/library"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <Library className="w-4 h-4" />
                  <span>Library</span>
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            {user && subscriptionInfo?.can_use_ai && (
              <div className="hidden md:block">
                <CreditsDisplay compact={true} />
              </div>
            )}

            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
                    sideOffset={5}
                  >
                    {/* Credits for mobile */}
                    <div className="md:hidden p-3 border-b border-gray-200">
                      <CreditsDisplay compact={true} />
                    </div>

                    <DropdownMenu.Item asChild>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenu.Item>

                    {subscriptionInfo?.plan_type !== 'max' && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/settings?tab=billing"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Upgrade Plan</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                    <DropdownMenu.Item
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}