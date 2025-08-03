import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { APIProvider } from '../../../types/APITypes';
import { APIConnectionStatus } from '../APIConnectionStatus';

// Mock dos ícones do Lucide React
jest.mock('lucide-react', () => ({
  Wifi: ({ className }: any) => <div data-testid="wifi-icon" className={className} />,
  WifiOff: ({ className }: any) => <div data-testid="wifi-off-icon" className={className} />,
  Activity: ({ className }: any) => <div data-testid="activity-icon" className={className} />,
  AlertCircle: ({ className }: any) => <div data-testid="alert-circle-icon" className={className} />,
  Clock: () => <div data-testid="clock-icon" />,
}));

describe('APIConnectionStatus Component', () => {
  const mockProvider: APIProvider = {
    id: 'test-provider',
    name: 'Test Provider',
    provider: 'OpenAI',
    status: 'Connected',
    keyPreview: 'sk-...xyz123',
    lastTested: new Date().toISOString(),
    requestsToday: 150,
    monthlyLimit: 10000,
    costPerRequest: 0.002,
    mcpEndpoint: 'https://api.test.com',
    githubToken: 'ghp_...token123',
    azureOrg: 'test-org',
    azureProject: 'test-project'
  };

  describe('Compact Mode', () => {
    it('renders compact mode correctly for Connected status', () => {
      render(<APIConnectionStatus provider={mockProvider} compact={true} />);
      
      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('renders compact mode correctly for Disconnected status', () => {
      const disconnectedProvider = { ...mockProvider, status: 'Disconnected' as const };
      render(<APIConnectionStatus provider={disconnectedProvider} compact={true} />);
      
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('renders compact mode correctly for Testing status', () => {
      const testingProvider = { ...mockProvider, status: 'Testing' as const };
      render(<APIConnectionStatus provider={testingProvider} compact={true} />);
      
      expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
      expect(screen.getByText('Testando...')).toBeInTheDocument();
    });

    it('renders compact mode correctly for undefined status', () => {
      const unknownProvider = { ...mockProvider, status: undefined as any };
      render(<APIConnectionStatus provider={unknownProvider} compact={true} />);
      
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Full Mode - Basic Rendering', () => {
    it('renders provider name and status', () => {
      render(<APIConnectionStatus provider={mockProvider} />);
      
      expect(screen.getByText('Test Provider')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });

    it('renders correct status icon for Connected', () => {
      render(<APIConnectionStatus provider={mockProvider} />);
      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
    });

    it('renders correct status icon for Disconnected', () => {
      const disconnectedProvider = { ...mockProvider, status: 'Disconnected' as const };
      render(<APIConnectionStatus provider={disconnectedProvider} />);
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });

    it('renders correct status icon for Testing', () => {
      const testingProvider = { ...mockProvider, status: 'Testing' as const };
      render(<APIConnectionStatus provider={testingProvider} />);
      expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
    });

    it('applies correct CSS classes for Connected status', () => {
      render(<APIConnectionStatus provider={mockProvider} />);
      const statusBadge = screen.getByText('Connected');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
    });

    it('applies correct CSS classes for Disconnected status', () => {
      const disconnectedProvider = { ...mockProvider, status: 'Disconnected' as const };
      render(<APIConnectionStatus provider={disconnectedProvider} />);
      const statusBadge = screen.getByText('Disconnected');
      expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');
    });

    it('applies correct CSS classes for Testing status', () => {
      const testingProvider = { ...mockProvider, status: 'Testing' as const };
      render(<APIConnectionStatus provider={testingProvider} />);
      const statusBadge = screen.getByText('Testando...');
      expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
    });
  });

  describe('Details Mode', () => {
    it('shows details when showDetails is true', () => {
      render(<APIConnectionStatus provider={mockProvider} showDetails={true} />);
      
      expect(screen.getByText(/Último teste:/)).toBeInTheDocument();
      expect(screen.getByText('sk-...xyz123')).toBeInTheDocument();
      expect(screen.getByText(/Requests hoje:/)).toBeInTheDocument();
      expect(screen.getByText(/Custo:/)).toBeInTheDocument();
    });

    it('hides details when showDetails is false', () => {
      render(<APIConnectionStatus provider={mockProvider} showDetails={false} />);
      
      expect(screen.queryByText(/Último teste:/)).not.toBeInTheDocument();
      expect(screen.queryByText('sk-...xyz123')).not.toBeInTheDocument();
    });

    it('calculates and displays cost correctly', () => {
      render(<APIConnectionStatus provider={mockProvider} showDetails={true} />);
      
      // 150 requests * 0.002 = 0.3 - but text is split across multiple elements
      expect(screen.getByText('0.3000')).toBeInTheDocument();
    });

    it('displays monthly limit progress', () => {
      render(<APIConnectionStatus provider={mockProvider} showDetails={true} />);
      
      expect(screen.getByText('150 / 10000')).toBeInTheDocument();
      expect(screen.getByText('Limite mensal')).toBeInTheDocument();
    });

    it('shows progress bar with correct color for low usage', () => {
      const lowUsageProvider = { ...mockProvider, requestsToday: 100, monthlyLimit: 10000 }; // 1%
      render(<APIConnectionStatus provider={lowUsageProvider} showDetails={true} />);
      
      const progressBar = document.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows progress bar with correct color for medium usage', () => {
      const mediumUsageProvider = { ...mockProvider, requestsToday: 7000, monthlyLimit: 10000 }; // 70%
      render(<APIConnectionStatus provider={mediumUsageProvider} showDetails={true} />);
      
      const progressBar = document.querySelector('.bg-yellow-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows progress bar with correct color for high usage', () => {
      const highUsageProvider = { ...mockProvider, requestsToday: 9000, monthlyLimit: 10000 }; // 90%
      render(<APIConnectionStatus provider={highUsageProvider} showDetails={true} />);
      
      const progressBar = document.querySelector('.bg-red-500');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('MCP Specific Details', () => {
    it('shows MCP configuration for StatusRafa MCP provider', () => {
      const mcpProvider = { ...mockProvider, provider: 'StatusRafa MCP' };
      render(<APIConnectionStatus provider={mcpProvider} showDetails={true} />);
      
      expect(screen.getByText('MCP Configuration:')).toBeInTheDocument();
      expect(screen.getByText(/Endpoint: https:\/\/api\.test\.com/)).toBeInTheDocument();
      expect(screen.getByText(/GitHub: ghp_\.\.\.token123/)).toBeInTheDocument();
      expect(screen.getByText(/Azure: test-org\/test-project/)).toBeInTheDocument();
    });

    it('does not show MCP configuration for non-MCP providers', () => {
      render(<APIConnectionStatus provider={mockProvider} showDetails={true} />);
      
      expect(screen.queryByText('MCP Configuration:')).not.toBeInTheDocument();
    });

    it('shows partial MCP config when some fields are missing', () => {
      const partialMcpProvider = { 
        ...mockProvider, 
        provider: 'StatusRafa MCP',
        githubToken: undefined,
        azureOrg: undefined,
        azureProject: undefined
      };
      render(<APIConnectionStatus provider={partialMcpProvider} showDetails={true} />);
      
      expect(screen.getByText('MCP Configuration:')).toBeInTheDocument();
      expect(screen.getByText(/Endpoint:/)).toBeInTheDocument();
      expect(screen.queryByText(/GitHub:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Azure:/)).not.toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('formats recent time as "agora mesmo"', () => {
      const recentProvider = { 
        ...mockProvider, 
        lastTested: new Date().toISOString() 
      };
      render(<APIConnectionStatus provider={recentProvider} showDetails={true} />);
      
      expect(screen.getByText(/agora mesmo/)).toBeInTheDocument();
    });

    it('formats time in minutes for recent tests', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const recentProvider = { 
        ...mockProvider, 
        lastTested: fiveMinutesAgo
      };
      render(<APIConnectionStatus provider={recentProvider} showDetails={true} />);
      
      expect(screen.getByText(/5min atrás/)).toBeInTheDocument();
    });

    it('formats time in hours for older tests', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const olderProvider = { 
        ...mockProvider, 
        lastTested: twoHoursAgo
      };
      render(<APIConnectionStatus provider={olderProvider} showDetails={true} />);
      
      expect(screen.getByText(/2h atrás/)).toBeInTheDocument();
    });

    it('formats old dates with full date format', () => {
      const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const oldProvider = { 
        ...mockProvider, 
        lastTested: yesterday
      };
      render(<APIConnectionStatus provider={oldProvider} showDetails={true} />);
      
      // Should show date format instead of relative time
      expect(screen.getByText(/Último teste:/)).toBeInTheDocument();
      // Just check that it's not showing relative time format
      expect(screen.queryByText(/atrás/)).not.toBeInTheDocument();
    });
  });

  describe('Progress Bar Edge Cases', () => {
    it('handles zero requests correctly', () => {
      const zeroProvider = { ...mockProvider, requestsToday: 0 };
      render(<APIConnectionStatus provider={zeroProvider} showDetails={true} />);
      
      expect(screen.getByText('0 / 10000')).toBeInTheDocument();
      expect(screen.getByText('0.0000')).toBeInTheDocument();
    });

    it('caps progress bar at 100% for over-limit usage', () => {
      const overLimitProvider = { ...mockProvider, requestsToday: 15000, monthlyLimit: 10000 };
      render(<APIConnectionStatus provider={overLimitProvider} showDetails={true} />);
      
      const progressBar = document.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Default Export', () => {
    it('exports default component', () => {
      // This test ensures the default export works
      const DefaultComponent = require('../APIConnectionStatus').default;
      render(<DefaultComponent provider={mockProvider} />);
      
      expect(screen.getByText('Test Provider')).toBeInTheDocument();
    });
  });
});
