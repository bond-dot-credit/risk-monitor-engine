import React, { useState, forwardRef } from 'react';
import { ValidationResult } from '@/lib/validation';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  warning?: string;
  helperText?: string;
  validation?: ValidationResult;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onValidation?: (result: ValidationResult) => void;
  children?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  warning,
  helperText,
  validation,
  leftIcon,
  rightIcon,
  onValidation,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputClasses = () => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    if (error || validation?.error) {
      return `${baseClasses} border-red-300 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500`;
    }
    
    if (warning || validation?.warning) {
      return `${baseClasses} border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 focus:border-yellow-500 focus:ring-yellow-500`;
    }
    
    if (isFocused) {
      return `${baseClasses} border-blue-300 bg-blue-50 dark:bg-blue-900/20 focus:border-blue-500`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500`;
  };

  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium mb-1';
    
    if (error || validation?.error) {
      return `${baseClasses} text-red-700 dark:text-red-300`;
    }
    
    if (warning || validation?.warning) {
      return `${baseClasses} text-yellow-700 dark:text-yellow-300`;
    }
    
    return `${baseClasses} text-gray-700 dark:text-gray-300`;
  };

  const getMessageClasses = (type: 'error' | 'warning' | 'helper') => {
    const baseClasses = 'text-xs mt-1';
    
    switch (type) {
      case 'error':
        return `${baseClasses} text-red-600 dark:text-red-400`;
      case 'warning':
        return `${baseClasses} text-yellow-600 dark:text-yellow-400`;
      case 'helper':
        return `${baseClasses} text-gray-500 dark:text-gray-400`;
      default:
        return baseClasses;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);
    
    // Call validation callback if provided
    if (onValidation && validation) {
      onValidation(validation);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={getLabelClasses()}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children ? (
        children
      ) : (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            {...props}
            className={`${getInputClasses()} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
      )}
      
      {/* Error message */}
      {(error || validation?.error) && (
        <p className={getMessageClasses('error')}>
          {error || validation?.error}
        </p>
      )}
      
      {/* Warning message */}
      {(warning || validation?.warning) && !error && !validation?.error && (
        <p className={getMessageClasses('warning')}>
          {warning || validation?.warning}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !error && !validation?.error && !warning && !validation?.warning && (
        <p className={getMessageClasses('helper')}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
