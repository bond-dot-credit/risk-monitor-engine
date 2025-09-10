import React from 'react';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    />
  )
);
Progress.displayName = 'Progress';

const CircularProgress = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { value: number; max?: number }
>(({ className, value, max = 100, ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <svg
      ref={ref}
      className={cn('h-24 w-24', className)}
      viewBox="0 0 100 100"
      {...props}
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-gray-200"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        className="text-primary transition-all duration-300 ease-in-out"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy="0.3em"
        className="text-xl font-bold fill-current"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
});
CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress };