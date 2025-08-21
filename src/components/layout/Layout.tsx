import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar, { SidebarItem } from './Sidebar';
import Header from './Header';

export interface LayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  sidebarItems,
  title,
  subtitle,
  headerActions,
  className,
  showSidebar = true,
  showHeader = true,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar
                items={sidebarItems}
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
              />
            </div>
            
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div
                  className="fixed inset-0 bg-black/50"
                  onClick={toggleMobileMenu}
                />
                <div className="fixed left-0 top-0 h-full w-64">
                  <Sidebar
                    items={sidebarItems}
                    collapsed={false}
                    onToggle={toggleMobileMenu}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          {showHeader && (
            <Header
              title={title}
              subtitle={subtitle}
              actions={headerActions}
              onMenuToggle={toggleMobileMenu}
              showMenuButton={showSidebar}
            />
          )}

          {/* Page Content */}
          <main
            className={cn(
              'flex-1 overflow-y-auto p-4 md:p-6 lg:p-8',
              'transition-all duration-300 ease-in-out',
              showSidebar && !sidebarCollapsed && 'md:ml-64',
              className
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
