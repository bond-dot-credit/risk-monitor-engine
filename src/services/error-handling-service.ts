/**
 * Error Handling Service
 * Centralized error management and reporting
 */

export interface ErrorInfo {
  id: string;
  type: 'network' | 'contract' | 'validation' | 'wallet' | 'system' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  timestamp: number;
  context?: Record<string, any>;
  resolved?: boolean;
}

export interface ErrorReport {
  errors: ErrorInfo[];
  totalCount: number;
  unresolvedCount: number;
  criticalCount: number;
  lastError?: ErrorInfo;
}

export class ErrorHandlingService {
  private errors: Map<string, ErrorInfo> = new Map();
  private readonly STORAGE_KEY = 'bond_credit_errors';
  private readonly MAX_ERRORS = 1000;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Report a new error
   */
  reportError(
    type: ErrorInfo['type'],
    severity: ErrorInfo['severity'],
    message: string,
    details?: string,
    context?: Record<string, any>
  ): string {
    const errorId = this.generateErrorId();
    
    const error: ErrorInfo = {
      id: errorId,
      type,
      severity,
      message,
      details,
      timestamp: Date.now(),
      context,
      resolved: false
    };

    this.errors.set(errorId, error);
    this.saveToStorage();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${severity.toUpperCase()}] ${type}: ${message}`, {
        details,
        context,
        errorId
      });
    }

    return errorId;
  }

  /**
   * Get error by ID
   */
  getError(errorId: string): ErrorInfo | null {
    return this.errors.get(errorId) || null;
  }

  /**
   * Get all errors
   */
  getAllErrors(): ErrorInfo[] {
    return Array.from(this.errors.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorInfo['type']): ErrorInfo[] {
    return this.getAllErrors().filter(error => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[] {
    return this.getAllErrors().filter(error => error.severity === severity);
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): ErrorInfo[] {
    return this.getAllErrors().filter(error => !error.resolved);
  }

  /**
   * Get error report
   */
  getErrorReport(): ErrorReport {
    const allErrors = this.getAllErrors();
    const unresolvedErrors = this.getUnresolvedErrors();
    const criticalErrors = this.getErrorsBySeverity('critical');

    return {
      errors: allErrors,
      totalCount: allErrors.length,
      unresolvedCount: unresolvedErrors.length,
      criticalCount: criticalErrors.length,
      lastError: allErrors[0] || undefined
    };
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): boolean {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Clear resolved errors
   */
  clearResolvedErrors(): number {
    let clearedCount = 0;
    for (const [id, error] of this.errors.entries()) {
      if (error.resolved) {
        this.errors.delete(id);
        clearedCount++;
      }
    }
    this.saveToStorage();
    return clearedCount;
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errors.clear();
    this.saveToStorage();
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: ErrorInfo): string {
    const baseMessage = error.message;

    // Add context-specific messages
    switch (error.type) {
      case 'network':
        return `Network Error: ${baseMessage}. Please check your internet connection and try again.`;
      
      case 'contract':
        return `Contract Error: ${baseMessage}. The smart contract may be temporarily unavailable.`;
      
      case 'validation':
        return `Validation Error: ${baseMessage}. Please check your input and try again.`;
      
      case 'wallet':
        return `Wallet Error: ${baseMessage}. Please ensure your wallet is connected and has sufficient funds.`;
      
      case 'system':
        return `System Error: ${baseMessage}. Please refresh the page and try again.`;
      
      case 'user':
        return baseMessage;
      
      default:
        return baseMessage;
    }
  }

  /**
   * Get error recovery suggestions
   */
  getRecoverySuggestions(error: ErrorInfo): string[] {
    const suggestions: string[] = [];

    switch (error.type) {
      case 'network':
        suggestions.push('Check your internet connection');
        suggestions.push('Try refreshing the page');
        suggestions.push('Check if the service is down');
        break;
      
      case 'contract':
        suggestions.push('Wait a few minutes and try again');
        suggestions.push('Check if the contract is still deployed');
        suggestions.push('Verify the contract address is correct');
        break;
      
      case 'validation':
        suggestions.push('Check all required fields are filled');
        suggestions.push('Ensure amounts are within valid ranges');
        suggestions.push('Verify input format is correct');
        break;
      
      case 'wallet':
        suggestions.push('Ensure wallet is connected');
        suggestions.push('Check wallet has sufficient balance');
        suggestions.push('Try reconnecting your wallet');
        break;
      
      case 'system':
        suggestions.push('Refresh the page');
        suggestions.push('Clear browser cache');
        suggestions.push('Try in a different browser');
        break;
      
      case 'user':
        suggestions.push('Please try again');
        break;
    }

    // Add severity-based suggestions
    if (error.severity === 'critical') {
      suggestions.unshift('Contact support if this persists');
    }

    return suggestions;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load errors from localStorage
   */
  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const errors = JSON.parse(stored);
          this.errors = new Map(errors);
        }
      }
    } catch (error) {
      console.error('Failed to load errors from storage:', error);
      this.errors = new Map();
    }
  }

  /**
   * Save errors to localStorage
   */
  private saveToStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        // Keep only the most recent errors
        const errors = Array.from(this.errors.entries());
        if (errors.length > this.MAX_ERRORS) {
          const sortedErrors = errors.sort((a, b) => b[1].timestamp - a[1].timestamp);
          this.errors = new Map(sortedErrors.slice(0, this.MAX_ERRORS));
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.errors.entries())));
      }
    } catch (error) {
      console.error('Failed to save errors to storage:', error);
    }
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService();

// Utility functions for common error scenarios
export const reportNetworkError = (message: string, context?: Record<string, any>) => {
  return errorHandlingService.reportError('network', 'medium', message, undefined, context);
};

export const reportContractError = (message: string, details?: string, context?: Record<string, any>) => {
  return errorHandlingService.reportError('contract', 'high', message, details, context);
};

export const reportValidationError = (message: string, context?: Record<string, any>) => {
  return errorHandlingService.reportError('validation', 'low', message, undefined, context);
};

export const reportWalletError = (message: string, context?: Record<string, any>) => {
  return errorHandlingService.reportError('wallet', 'medium', message, undefined, context);
};

export const reportSystemError = (message: string, details?: string, context?: Record<string, any>) => {
  return errorHandlingService.reportError('system', 'high', message, details, context);
};

export const reportUserError = (message: string, context?: Record<string, any>) => {
  return errorHandlingService.reportError('user', 'low', message, undefined, context);
};
