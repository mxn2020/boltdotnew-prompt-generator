import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BoltBadge } from '../BoltBadge';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? 'lg:pl-64' : ''}`}>
          <div className="container mx-auto py-6 px-4">
            {children}
            
            {/* Footer with Bolt Badge */}
            <div className="mt-16 pt-8 border-t text-center">
              <BoltBadge size="md" variant="auto" position="footer" />
              <p className="text-sm text-muted-foreground">
                Powered by Bolt.new
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}