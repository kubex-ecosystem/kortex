import { fireEvent, render, screen } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter';

// Mock do useApp hook diretamente
const mockUseApp = {
  notifications: [
    {
      id: '1',
      title: 'Test Notification 1',
      message: 'This is a test notification',
      type: 'info' as const,
      read: false,
      timestamp: new Date().toISOString(),
    },
  ],
  markNotificationRead: jest.fn(),
  removeNotification: jest.fn(),
};

jest.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp,
}));

describe('NotificationCenter Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<NotificationCenter isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('displays close button', () => {
    render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByTitle('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('handles close click', () => {
    render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
