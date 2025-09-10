import React from 'react';

interface CalendarProps {
  className?: string;
  onSelect?: (date: Date) => void;
  selected?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  className = '',
  onSelect,
  selected
}) => {
  // Simple calendar implementation
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate days for the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i));
  }
  
  const handleDateClick = (date: Date | null) => {
    if (date && onSelect) {
      onSelect(date);
    }
  };
  
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-10" />;
          }
          
          const isSelected = selected && date.toDateString() === selected.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`h-10 w-10 rounded-full text-sm ${
                isSelected 
                  ? 'bg-blue-600 text-white' 
                  : isToday 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};