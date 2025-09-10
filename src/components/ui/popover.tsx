import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

const PopoverContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export const Popover: React.FC<PopoverProps> = ({ 
  children, 
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ 
  children, 
  className = ''
}) => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('PopoverTrigger must be used within Popover');
  }
  
  const { setIsOpen } = context;
  
  return (
    <div 
      className={className}
      onClick={() => setIsOpen(!context.isOpen)}
    >
      {children}
    </div>
  );
};

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  className = ''
}) => {
  const context = React.useContext(PopoverContext);
  const popoverRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('PopoverContent must be used within Popover');
  }
  
  const { isOpen } = context;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        context.setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [context]);

  if (!isOpen) return null;

  return (
    <div 
      ref={popoverRef}
      className={`absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${className}`}
    >
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};