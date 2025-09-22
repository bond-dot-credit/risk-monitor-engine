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
  icon = '📋',
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (

    <Card className={`text-center py-12 ${className}`}>
      <CardContent>
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
          {description}
        </p>
        {actionText && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
