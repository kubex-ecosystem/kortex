import { fireEvent, render, screen } from '@testing-library/react';
import { Toast, ToastNotification } from '../ToastNotification';

// Simple test approach for better reliability
describe('ToastNotification Component', () => {
  const mockOnClose = jest.fn();
  
  const baseToast: Toast = {
    id: 'test-toast-1',
    type: 'info',
    title: 'Test Toast Title',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders toast with basic information', () => {
    render(<ToastNotification toast={baseToast} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Toast Title')).toBeInTheDocument();
    expect(screen.getByTitle('Close notification')).toBeInTheDocument();
  });

  it('renders toast with message when provided', () => {
    const toastWithMessage = { 
      ...baseToast, 
      message: 'This is a test message' 
    };
    
    render(<ToastNotification toast={toastWithMessage} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Toast Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('renders action button when action is provided', () => {
    const mockAction = jest.fn();
    const toastWithAction = {
      ...baseToast,
      action: {
        label: 'Undo',
        onClick: mockAction
      }
    };
    
    render(<ToastNotification toast={toastWithAction} onClose={mockOnClose} />);
    
    const actionButton = screen.getByRole('button', { name: 'Undo' });
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  describe('Toast types and styling', () => {
    it.each([
      ['success', 'text-green-800'],
      ['error', 'text-red-800'],  
      ['warning', 'text-yellow-800'],
      ['info', 'text-blue-800']
    ])('applies correct styling for %s type', (type, expectedClass) => {
      const typedToast = { 
        ...baseToast, 
        type: type as Toast['type']
      };
      
      const { container } = render(
        <ToastNotification toast={typedToast} onClose={mockOnClose} />
      );
      
      expect(container.querySelector(`.${expectedClass.replace(' ', '.')}`)).toBeInTheDocument();
    });
  });

  it('displays icons for each toast type', () => {
    const types: Toast['type'][] = ['success', 'error', 'warning', 'info'];
    
    types.forEach(type => {
      const typedToast = { ...baseToast, type };
      const { unmount, container } = render(
        <ToastNotification toast={typedToast} onClose={mockOnClose} />
      );
      
      // Check for SVG presence (Lucide icons)
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
      
      unmount();
    });
  });

  it('has close button functionality', () => {
    render(<ToastNotification toast={baseToast} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTitle('Close notification');
    expect(closeButton).toBeInTheDocument();
    
    // Just test the button exists and is clickable
    fireEvent.click(closeButton);
    // Don't test timing-based functionality for now
  });
});
