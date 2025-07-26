import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { UserMenu } from '../UserMenu';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

describe('UserMenu Component', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders user menu button with user info', () => {
    render(<UserMenu />);
    
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('toggles menu visibility when button is clicked', () => {
    render(<UserMenu />);
    
    const menuButton = screen.getByRole('button');
    
    // Initially menu should be closed
    expect(screen.queryByText('View Profile')).not.toBeInTheDocument();
    
    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByText('View Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Close menu
    fireEvent.click(menuButton);
    expect(screen.queryByText('View Profile')).not.toBeInTheDocument();
  });

  it('displays user information in dropdown header', () => {
    render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
    expect(screen.getByText('admin@kubex.local')).toBeInTheDocument();
    expect(screen.getAllByText('Administrator').length).toBeGreaterThan(0);
  });

  it('navigates to settings when profile is clicked', () => {
    render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click profile option
    fireEvent.click(screen.getByText('View Profile'));
    
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('navigates to settings when settings is clicked', () => {
    render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click settings option
    fireEvent.click(screen.getByText('Settings'));
    
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('opens documentation in new tab when clicked', () => {
    render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click documentation option
    fireEvent.click(screen.getByText('Documentation'));
    
    expect(window.open).toHaveBeenCalledWith(
      'https://kortex.rafa-mori.dev/',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('navigates to login when login page is clicked', () => {
    render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click login option
    fireEvent.click(screen.getByText('Login Page'));
    
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('handles logout functionality', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click logout option
    fireEvent.click(screen.getByText('Sign Out'));
    
    expect(consoleSpy).toHaveBeenCalledWith('Logout clicked - implementar com backend');
    expect(mockPush).toHaveBeenCalledWith('/login');
    
    consoleSpy.mockRestore();
  });

  it('displays all menu items with correct labels and descriptions', () => {
    render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Check all menu items
    expect(screen.getByText('View Profile')).toBeInTheDocument();
    expect(screen.getByText('Manage your account')).toBeInTheDocument();
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Application preferences')).toBeInTheDocument();
    
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('User guide and API reference')).toBeInTheDocument();
    
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.getByText('Access login screen')).toBeInTheDocument();
    
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.getByText('Exit your session')).toBeInTheDocument();
  });

  it('closes menu when clicking outside', () => {
    render(
      <div>
        <UserMenu />
        <div data-testid="outside-element">Outside</div>
      </div>
    );
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('View Profile')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByText('View Profile')).not.toBeInTheDocument();
  });

  it('rotates chevron icon when menu is open', () => {
    const { container } = render(<UserMenu />);
    
    const chevronIcon = container.querySelector('.transition-transform');
    
    // Initially should not have rotate class
    expect(chevronIcon).not.toHaveClass('rotate-180');
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Should have rotate class when open
    expect(chevronIcon).toHaveClass('rotate-180');
  });

  it('displays user avatar or fallback icon', () => {
    const { container } = render(<UserMenu />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button'));
    
    // Look for the user icon in the main button specifically
    const mainButton = container.querySelector('.relative > button');
    expect(mainButton).toBeInTheDocument();
    
    // Check if user icon is shown in the main button
    const userIcon = mainButton?.querySelector('svg.lucide-user');
    expect(userIcon).toBeInTheDocument();
  });
});
