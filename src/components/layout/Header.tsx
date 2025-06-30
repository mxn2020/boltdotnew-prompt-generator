import { useState } from 'react';
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
  Sparkles,
  CreditCard,
  Menu
} from 'lucide-react';
import { BoltBadge } from '../BoltBadge';
import { Logo } from '../Logo';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { Badge } from "../ui/badge";
import { CreditsDisplay } from '../payment/CreditsDisplay';
import { SimpleThemeToggle } from '../SimpleThemeToggle';
import { useSubscriptionInfo } from '../../hooks/usePayment';

const navigation = [
  { name: 'Studio', href: '/studio', icon: Sparkles },
  { name: 'Editor', href: '/editor', icon: Plus },
  { name: 'Explorer', href: '/explorer', icon: Search },
  { name: 'Library', href: '/library', icon: Library },
  // { name: 'Analytics', href: '/analytics', icon: BarChart3 }, // Disabled - not available yet
];

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: subscriptionInfo } = useSubscriptionInfo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="md" />
              <span className="text-xl font-bold">PromptVerse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Button key={item.name} variant="ghost" asChild className="h-9">
                  <Link to={item.href} className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Bolt Badge */}
          <div className="hidden md:block">
            <BoltBadge size="sm" variant="auto" />
          </div>
          
          {/* Credits Display */}
          {user && subscriptionInfo?.can_use_ai && (
            <div className="hidden md:block">
              <CreditsDisplay compact={true} />
            </div>
          )}

          {/* Theme Toggle - Desktop (only for authenticated users) */}
          {user && (
            <div className="hidden md:block">
              <SimpleThemeToggle />
            </div>
          )}

          {user ? (
            <>
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  {/* Accessibility: DialogTitle and Description for SheetContent */}
                  <h2 className="sr-only">Main Menu</h2>
                  <p className="sr-only" id="main-menu-desc">Navigation and user options</p>
                  <div className="flex flex-col space-y-4">
                    {/* Mobile Credits */}
                    {subscriptionInfo?.can_use_ai && (
                      <div className="border-b pb-4">
                        <CreditsDisplay compact={true} />
                      </div>
                    )}
                    
                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-2">
                      {navigation.map((item) => (
                        <SheetClose asChild key={item.name}>
                          <Button variant="ghost" asChild className="justify-start h-12">
                            <Link to={item.href} className="flex items-center space-x-3">
                              <item.icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </Link>
                          </Button>
                        </SheetClose>
                      ))}
                    </nav>

                    {/* Mobile User Menu */}
                    <div className="border-t pt-4 space-y-2">
                      {/* Theme Toggle - Mobile */}
                      <div className="px-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Theme</span>
                          <SimpleThemeToggle />
                        </div>
                      </div>
                      
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className="justify-start h-12">
                          <Link to="/profile" className="flex items-center space-x-3">
                            <User className="h-5 w-5" />
                            <span>Profile</span>
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className="justify-start h-12">
                          <Link to="/settings" className="flex items-center space-x-3">
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                          </Link>
                        </Button>
                      </SheetClose>
                      {subscriptionInfo?.plan_type !== 'max' && (
                        <SheetClose asChild>
                          <Button variant="ghost" asChild className="justify-start h-12 text-primary">
                            <Link to="/settings?tab=billing" className="flex items-center space-x-3">
                              <CreditCard className="h-5 w-5" />
                              <span>Upgrade Plan</span>
                              <Badge variant="secondary" className="ml-auto">New</Badge>
                            </Link>
                          </Button>
                        </SheetClose>
                      )}
                      <Button 
                        variant="ghost" 
                        className="justify-start h-12 text-destructive hover:text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {subscriptionInfo?.plan_type !== 'max' && (
                    <DropdownMenuItem asChild>
                      <Link to="/settings?tab=billing" className="cursor-pointer text-primary">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Upgrade Plan</span>
                        <Badge variant="secondary" className="ml-auto">New</Badge>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Theme Toggle for non-authenticated users */}
              <SimpleThemeToggle />
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
