import { BookOpen, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const DocumentationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('pulse-docs-banner-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember user's choice for 7 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    localStorage.setItem('pulsedocs-banner-dismissed', expiry.toISOString());
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-3 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium">📚 Documentation Available!</span>
            <span className="ml-2 opacity-90">
              Get the most out of Pulse with our comprehensive guides, API reference, and examples.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://docs.kubex.world/pulse/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            View Docs
          </a>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
