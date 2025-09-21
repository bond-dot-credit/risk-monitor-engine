import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📊',
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <Card className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      <CardContent className="p-0">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {description}
        </p>
        {actionText && onAction && (
          <Button onClick={onAction}>
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};