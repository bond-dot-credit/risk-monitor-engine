import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'default',
  className = ''
}) => {
  const baseClasses = 'rounded-lg border p-4';
  
  const variantClasses = {
    default: 'bg-white border-gray-200 text-gray-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>
      {children}
    </h5>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  );
};