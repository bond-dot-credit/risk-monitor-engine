import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  min?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inside';
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    min = 0, 
    size = 'md', 
    variant = 'default',
    showLabel = false,
    labelPosition = 'top',
    animated = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };
    
    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    };

    const getVariantColor = (percentage: number) => {
      if (variant !== 'default') return variantClasses[variant];
      
      if (percentage >= 80) return 'bg-red-500';
      if (percentage >= 60) return 'bg-yellow-500';
      if (percentage >= 40) return 'bg-blue-500';
      return 'bg-green-500';
    };

    return (
      <div className={cn('w-full', className)} {...props}>
        {showLabel && labelPosition === 'top' && (
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(
            'w-full bg-secondary rounded-full overflow-hidden',
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              getVariantColor(percentage),
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          >
            {showLabel && labelPosition === 'inside' && (
              <div className="flex items-center justify-center h-full text-xs text-white font-medium">
                {percentage.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
        
        {showLabel && labelPosition === 'bottom' && (
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Progress</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  min?: number;
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  animated?: boolean;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    min = 0, 
    size = 'md', 
    strokeWidth = 4,
    variant = 'default',
    showLabel = false,
    animated = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
    const radius = size === 'sm' ? 20 : size === 'md' ? 30 : 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
    };
    
    const variantClasses = {
      default: 'text-primary',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      danger: 'text-red-500',
    };

    const getVariantColor = (percentage: number) => {
      if (variant !== 'default') return variantClasses[variant];
      
      if (percentage >= 80) return 'text-red-500';
      if (percentage >= 60) return 'text-yellow-500';
      if (percentage >= 40) return 'text-blue-500';
      return 'text-green-500';
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', sizeClasses[size], className)}
        {...props}
      >
        <svg
          className={cn('transform -rotate-90', sizeClasses[size])}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-secondary opacity-20"
          />
          
          {/* Progress circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300 ease-in-out',
              getVariantColor(percentage),
              animated && 'animate-pulse'
            )}
          />
        </svg>
        
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'text-sm font-medium',
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
            )}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress };
