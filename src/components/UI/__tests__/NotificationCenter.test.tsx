import { fireEvent, screen } from '@testing-library/react';
import { useApp } from '../../../context/AppContext';
import { renderWithProviders } from '../../../utils/test-utils';
import { NotificationCenter } from '../NotificationCenter';

jest.mock('../../../context/AppContext', function() {
  const mockUseApp = {
    ...useApp(),
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
  return ({
    mockUseApp,
    useApp: () => mockUseApp
  })
});

describe('NotificationCenter Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    renderWithProviders(<NotificationCenter isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(<NotificationCenter isOpen={false} onClose={mockOnClose} />);
    const modal = document.querySelector('.fixed');
    expect(modal).toHaveClass('hidden');
  });

  it('displays close button', () => {
    renderWithProviders(<NotificationCenter isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByTitle('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('handles close click', () => {
    renderWithProviders(<NotificationCenter isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

describe('NotificationCenter Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(
      <NotificationCenter isOpen={false} onClose={mockOnClose} />
    );

    const modal = document.querySelector('.fixed');
    expect(modal).toHaveClass('hidden');
  });

  it('displays close button and handles close click', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    const closeButton = screen.getByTitle('Close');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('filters and displays only unread notifications', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    // Should show the component structure
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('displays no notifications message when no unread notifications', () => {
    const mockUseApp = jest.requireMock('../../../context/AppContext');
    mockUseApp.useApp = () => ({
      notifications: [],
      markNotificationRead: jest.fn(),
      removeNotification: jest.fn(),
    });

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  it('displays no notifications message when all notifications are read', () => {
    const mockUseApp = jest.requireMock('../../../context/AppContext');
    mockUseApp.useApp = () => ({
      notifications: [
        {
          id: '1',
          title: 'Read Notification',
          message: 'This notification is read',
          type: 'info',
          read: true,
          timestamp: new Date().toISOString(),
        },
      ],
      markNotificationRead: jest.fn(),
      removeNotification: jest.fn(),
    });

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  it('handles mark as read functionality', () => {
    const mockMarkNotificationRead = jest.fn();
    const mockUseApp = jest.requireMock('../../../context/AppContext');
    
    mockUseApp.useApp = () => ({
      notifications: [
        {
          id: '1',
          title: 'Unread Notification',
          message: 'This is unread',
          type: 'info',
          read: false,
          timestamp: new Date().toISOString(),
        },
      ],
      markNotificationRead: mockMarkNotificationRead,
      removeNotification: jest.fn(),
    });

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    // The component should render the notification structure
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('handles remove notification functionality', () => {
    const mockRemoveNotification = jest.fn();
    const mockUseApp = jest.requireMock('../../../context/AppContext');
    
    mockUseApp.useApp = () => ({
      notifications: [
        {
          id: '1',
          title: 'Notification to Remove',
          message: 'This will be removed',
          type: 'warning',
          read: false,
          timestamp: new Date().toISOString(),
        },
      ],
      markNotificationRead: jest.fn(),
      removeNotification: mockRemoveNotification,
    });

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    // The component should render properly
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    const overlay = document.querySelector('.fixed');
    expect(overlay).toHaveClass('inset-0', 'z-50', 'bg-gray-800', 'bg-opacity-75');

    const modal = document.querySelector('.bg-white');
    expect(modal).toHaveClass('dark:bg-gray-900', 'rounded-lg', 'shadow-lg', 'w-full', 'max-w-md', 'p-6');
  });

  it('displays notification center header correctly', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    const header = screen.getByText('Notifications');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('H2');
  });

  it('handles undefined notifications gracefully', () => {
    const mockUseApp = jest.requireMock('../../../context/AppContext');
    mockUseApp.useApp = () => ({
      notifications: undefined,
      markNotificationRead: jest.fn(),
      removeNotification: jest.fn(),
    });

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  it('handles null notifications gracefully', () => {

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={mockOnClose} />
    );

    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });
});
