import React from 'react';
import { Card, CardContent } from './Card';
import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingStatesProps {
  type?: 'skeleton' | 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  count?: number;
  className?: string;
}

export const LoadingStates: React.FC<LoadingStatesProps> = ({
  type = 'spinner',
  size = 'md',
  text,
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );

  const renderSpinner = () => (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LoadingSpinner size={size} text={text} />
    </div>
  );

  const renderDots = () => (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      {text && <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );

  const renderPulse = () => (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );

  switch (type) {
    case 'skeleton':
      return renderSkeleton();
    case 'spinner':
      return renderSpinner();
    case 'dots':
      return renderDots();
    case 'pulse':
      return renderPulse();
    default:
      return renderSpinner();
  }
};

// Specific loading components for common use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Card className={className}>
    <CardContent className="p-6">
      <LoadingStates type="skeleton" count={3} />
    </CardContent>
  </Card>
);

export const TableSkeleton: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={className}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center space-x-4 py-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export const GridSkeleton: React.FC<{ 
  columns?: number; 
  rows?: number; 
  className?: string 
}> = ({ 
  columns = 3, 
  rows = 2, 
  className = '' 
}) => (
  <div className={`grid grid-cols-${columns} gap-4 ${className}`}>
    {Array.from({ length: columns * rows }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
