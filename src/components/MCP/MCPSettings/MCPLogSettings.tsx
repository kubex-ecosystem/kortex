import React, { useState } from 'react';
import { LogEntry } from '../../../types';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface MCPLogSettingsProps {
  onLogLevelChange: (level: LogLevel) => void;
  onMaxLogsChange: (maxLogs: number) => void;
  onClearLogs: () => void;
  currentLogLevel: LogLevel;
  maxLogs: number;
  totalLogs: number;
}

export const MCPLogSettings: React.FC<MCPLogSettingsProps> = ({
  onLogLevelChange,
  onMaxLogsChange,
  onClearLogs,
  currentLogLevel,
  maxLogs,
  totalLogs
}) => {
  const [localLogLevel, setLocalLogLevel] = useState<LogLevel>(currentLogLevel);
  const [localMaxLogs, setLocalMaxLogs] = useState(maxLogs);

  const logLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  const handleLogLevelChange = (level: LogLevel) => {
    setLocalLogLevel(level);
    onLogLevelChange(level);
  };

  const handleMaxLogsChange = (max: number) => {
    setLocalMaxLogs(max);
    onMaxLogsChange(max);
  };

  const getLogLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'debug': return 'text-gray-500';
      case 'info': return 'text-primary';
      case 'warn': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getLogLevelBadgeColor = (level: LogLevel) => {
    switch (level) {
      case 'debug': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'info': return 'bg-primary-subtle text-primary-foreground dark:bg-primary/20 dark:text-primary';
      case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Log Settings</h3>
      
      <div className="space-y-6">
        {/* Log Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Log Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {logLevels.map(level => (
              <button
                key={level}
                onClick={() => handleLogLevelChange(level)}
                className={`p-3 rounded-md border transition-colors ${
                  localLogLevel === level
                    ? 'bg-primary-subtle border-primary dark:bg-primary/20/30 dark:border-primary'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${getLogLevelColor(level)}`}>
                    {level.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getLogLevelBadgeColor(level)}`}>
                    {level}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Max Logs Configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maximum Logs to Keep
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={localMaxLogs}
              onChange={(e) => handleMaxLogsChange(parseInt(e.target.value))}
              min="100"
              max="10000"
              step="100"
              title="Maximum number of log entries to keep"
              className="w-32 p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              entries (currently {totalLogs})
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Older logs will be automatically removed when this limit is reached
          </p>
        </div>

        {/* Log Statistics */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Current Level:</span>
              <span className={`ml-2 font-medium ${getLogLevelColor(localLogLevel)}`}>
                {localLogLevel.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Logs:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {totalLogs}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Max Logs:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {localMaxLogs}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Usage:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {Math.round((totalLogs / localMaxLogs) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onClearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All Logs
          </button>
          <button
            onClick={() => {
              // Reset to defaults
              handleLogLevelChange('info');
              handleMaxLogsChange(1000);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
