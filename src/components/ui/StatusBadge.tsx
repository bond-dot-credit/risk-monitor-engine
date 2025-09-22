import React from 'react';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  text: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  className = ''
}) => {
  const statusConfig = {
    success: {
      className: 'bg-green-500 text-white',
      icon: '✅'
    },
    error: {
      className: 'bg-red-500 text-white',
      icon: '❌'
    },
    warning: {
      className: 'bg-yellow-500 text-white',
      icon: '⚠️'
    },
    info: {
      className: 'bg-blue-500 text-white',
      icon: 'ℹ️'
    },
    pending: {
      className: 'bg-gray-500 text-white',
      icon: '⏳'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge className={`${config.className} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {text}
    </Badge>
  );
};

