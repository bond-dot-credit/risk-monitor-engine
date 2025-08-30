import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        // Risk level variants
        low: 'border-transparent bg-green-100 text-green-800',
        medium: 'border-transparent bg-yellow-100 text-yellow-800',
        high: 'border-transparent bg-orange-100 text-orange-800',
        critical: 'border-transparent bg-red-100 text-red-800',
        // Status variants
        active: 'border-transparent bg-green-100 text-green-800',
        inactive: 'border-transparent bg-gray-100 text-gray-800',
        suspended: 'border-transparent bg-red-100 text-red-800',
        pending: 'border-transparent bg-yellow-100 text-yellow-800',
        // Credibility tier variants
        bronze: 'border-transparent bg-amber-100 text-amber-800',
        silver: 'border-transparent bg-gray-100 text-gray-800',
        gold: 'border-transparent bg-yellow-100 text-yellow-800',
        platinum: 'border-transparent bg-blue-100 text-blue-800',
        diamond: 'border-transparent bg-purple-100 text-purple-800',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'low' | 'medium' | 'high' | 'critical' | 'active' | 'inactive' | 'suspended' | 'pending' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  size?: 'default' | 'sm' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, children, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-1">{rightIcon}</span>}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };