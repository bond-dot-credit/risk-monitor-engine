import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingStates } from '@/components/ui/LoadingStates';
import { errorHandlingService, ErrorInfo } from '@/services/error-handling-service';

interface ErrorManagerProps {
  className?: string;
}

export const ErrorManager: React.FC<ErrorManagerProps> = ({
  className = ''
}) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('unresolved');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadErrors();
    
    // Refresh errors every 30 seconds
    const interval = setInterval(loadErrors, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadErrors = () => {
    const allErrors = errorHandlingService.getAllErrors();
    setErrors(allErrors);
  };

  const getFilteredErrors = () => {
    switch (filter) {
      case 'unresolved':
        return errors.filter(error => !error.resolved);
      case 'critical':
        return errors.filter(error => error.severity === 'critical');
      default:
        return errors;
    }
  };

  const handleResolveError = (errorId: string) => {
    errorHandlingService.resolveError(errorId);
    loadErrors();
  };

  const handleClearResolved = () => {
    const clearedCount = errorHandlingService.clearResolvedErrors();
    loadErrors();
    console.log(`Cleared ${clearedCount} resolved errors`);
  };

  const handleClearAll = () => {
    errorHandlingService.clearAllErrors();
    loadErrors();
  };

  const getSeverityBadge = (severity: ErrorInfo['severity']) => {
    switch (severity) {
      case 'critical':
        return <StatusBadge status="error" text="🚨 Critical" />;
      case 'high':
        return <StatusBadge status="error" text="🔴 High" />;
      case 'medium':
        return <StatusBadge status="warning" text="🟡 Medium" />;
      case 'low':
        return <StatusBadge status="info" text="🔵 Low" />;
    }
  };

  const getTypeBadge = (type: ErrorInfo['type']) => {
    const typeConfig = {
      network: { icon: '🌐', color: 'bg-blue-100 text-blue-800' },
      contract: { icon: '📄', color: 'bg-purple-100 text-purple-800' },
      validation: { icon: '✅', color: 'bg-green-100 text-green-800' },
      wallet: { icon: '💳', color: 'bg-yellow-100 text-yellow-800' },
      system: { icon: '⚙️', color: 'bg-gray-100 text-gray-800' },
      user: { icon: '👤', color: 'bg-indigo-100 text-indigo-800' }
    };

    const config = typeConfig[type];
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.icon} {type}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const filteredErrors = getFilteredErrors();
  const errorReport = errorHandlingService.getErrorReport();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚨 Error Management
            {errorReport.criticalCount > 0 && (
              <StatusBadge status="error" text={`${errorReport.criticalCount} Critical`} />
            )}
          </CardTitle>
          <CardDescription>
            Monitor and manage system errors and issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {errorReport.totalCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Errors</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {errorReport.unresolvedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unresolved</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {errorReport.criticalCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {errors.length - errorReport.unresolvedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All ({errorReport.totalCount})
            </Button>
            <Button
              onClick={() => setFilter('unresolved')}
              variant={filter === 'unresolved' ? 'default' : 'outline'}
              size="sm"
            >
              Unresolved ({errorReport.unresolvedCount})
            </Button>
            <Button
              onClick={() => setFilter('critical')}
              variant={filter === 'critical' ? 'default' : 'outline'}
              size="sm"
            >
              Critical ({errorReport.criticalCount})
            </Button>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              onClick={handleClearResolved}
              variant="outline"
              size="sm"
              disabled={errors.length === errorReport.unresolvedCount}
            >
              Clear Resolved
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <div className="space-y-4">
        {filteredErrors.length > 0 ? (
          filteredErrors.map((error) => (
            <Card key={error.id} className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityBadge(error.severity)}
                      {getTypeBadge(error.type)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 dark:text-gray-100 mb-2">
                      {errorHandlingService.getUserFriendlyMessage(error)}
                    </p>
                    
                    {showDetails && error.details && (
                      <details className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <summary className="cursor-pointer font-medium">Technical Details</summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                          {error.details}
                        </pre>
                      </details>
                    )}
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Recovery Suggestions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {errorHandlingService.getRecoverySuggestions(error).map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {!error.resolved && (
                      <Button
                        onClick={() => handleResolveError(error.id)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        ✓ Resolve
                      </Button>
                    )}
                    {error.resolved && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ✓ Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No {filter === 'all' ? '' : filter} errors found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all' 
                  ? 'No errors have been recorded yet.'
                  : filter === 'unresolved'
                  ? 'All errors have been resolved!'
                  : 'No critical errors at this time.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
