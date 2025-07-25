import { ExternalLink, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';

interface HelpTooltipProps {
  title: string;
  description: string;
  docsUrl: string;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  description,
  docsUrl,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Help information"
      >
        <HelpCircle size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
      </button>

      {isVisible && (
        <div className="absolute z-50 w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bottom-full mb-2 left-1/2 transform -translate-x-1/2">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
            >
              Learn more in docs
              <ExternalLink size={14} className="ml-1" />
            </a>
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"></div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800 relative -top-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};
