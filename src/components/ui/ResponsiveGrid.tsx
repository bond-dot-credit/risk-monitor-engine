import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileCols?: 1 | 2;
  tabletCols?: 2 | 3 | 4;
  desktopCols?: 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 'md'
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const getGridCols = () => {
    if (isMobile) {
      return `grid-cols-${mobileCols}`;
    } else if (isTablet) {
      return `grid-cols-${tabletCols}`;
    } else {
      return `grid-cols-${desktopCols}`;
    }
  };

  return (
    <div className={`grid ${getGridCols()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};