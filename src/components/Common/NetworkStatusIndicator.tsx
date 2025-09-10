import React from 'react';
import { useNetworkStatus } from '@hooks/useNetworkStatus';

export default function NetworkStatusIndicator() {
  const online = useNetworkStatus();
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-full text-xs border shadow ${
        online
          ? 'bg-green-900/40 border-green-700 text-green-200'
          : 'bg-red-900/40 border-red-700 text-red-200'
      }`}>
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${online ? 'bg-green-400' : 'bg-red-400'}`}></span>
        {online ? 'Online' : 'Offline'}
      </div>
    </div>
  );
}

