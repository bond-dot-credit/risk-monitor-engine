import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'low' | 'medium' | 'high' | 'critical' | 'active' | 'inactive' | 'suspended' | 'pending' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  className, 
  collapsed = false,
  onToggle 
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="space-y-1">
        <Link
          href={item.href}
          className={cn(
            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            active 
              ? 'bg-accent text-accent-foreground' 
              : 'text-muted-foreground',
            level > 0 && 'ml-4',
            collapsed && 'justify-center px-2'
          )}
        >
          <span className={cn('mr-3', collapsed && 'mr-0')}>
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant={item.badgeVariant} 
                  size="sm"
                  className="ml-auto"
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
        
        {hasChildren && !collapsed && (
          <div className="ml-4 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-background border-r border-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <h2 className="text-lg font-semibold">Risk Monitor</h2>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-md hover:bg-accent hover:text-accent-foreground',
            'transition-colors',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {collapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map(item => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            v1.0.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
