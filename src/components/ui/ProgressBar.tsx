import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = '', 
  animated = true 
}) => {
  const percentage = Math.min(Math.max(progress * 100, 0), 100);
  
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};