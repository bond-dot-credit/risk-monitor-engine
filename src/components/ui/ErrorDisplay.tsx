import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

export interface ErrorDisplayProps {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  type = 'error',
  details,
  onRetry,
  onDismiss,
  showDetails = false,
  className = ''
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

  const getErrorColor = () => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-red-200 bg-red-50 dark:bg-red-900/20';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error': return 'text-red-800 dark:text-red-200';
      case 'warning': return 'text-yellow-800 dark:text-yellow-200';
      case 'info': return 'text-blue-800 dark:text-blue-200';
      default: return 'text-red-800 dark:text-red-200';
    }
  };

  const getStatusBadge = () => {
    switch (type) {
      case 'error': return <StatusBadge status="error" text="Error" />;
      case 'warning': return <StatusBadge status="warning" text="Warning" />;
      case 'info': return <StatusBadge status="info" text="Info" />;
      default: return <StatusBadge status="error" text="Error" />;
    }
  };

  return (
    <Card className={`${getErrorColor()} ${className}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getTextColor()}`}>
          <span className="text-xl">{getErrorIcon()}</span>
          {title}
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`${getTextColor()} mb-4`}>
          {message}
        </p>
        
        {details && showDetails && (
          <details className={`${getTextColor()} text-sm mb-4`}>
            <summary className="cursor-pointer font-medium">Technical Details</summary>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
              {details}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              🔄 Retry
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} variant="outline" size="sm">
              ✕ Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
