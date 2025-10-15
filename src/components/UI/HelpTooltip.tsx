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
        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Help information"
      >
        <HelpCircle size={16} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
      </button>

      {isVisible && (
        <div className="absolute z-50 w-80 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl bottom-full mb-2 left-1/2 transform -translate-x-1/2">
          <div className="space-y-3">
            <h4 className="font-semibold text-text-head dark:text-white text-sm">
              {title}
            </h4>
            <p className="text-sm text-text-body dark:text-slate-400">
              {description}
            </p>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-primary dark:text-primary hover:text-primary-hover dark:hover:text-primary-hover transition-colors"
            >
              Learn more in docs
              <ExternalLink size={14} className="ml-1" />
            </a>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-200 dark:border-t-slate-700"></div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-slate-800 relative -top-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};
