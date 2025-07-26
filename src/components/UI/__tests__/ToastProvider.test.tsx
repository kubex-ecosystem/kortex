import { fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, useToast, useToastHelpers } from '../ToastProvider';

// Test component to use hooks
const TestComponent = () => {
  const { addToast, removeToast, clearAllToasts } = useToast();
  
  return (
    <div>
      <button onClick={() => addToast({ type: 'info', title: 'Test Toast' })}>
        Add Toast
      </button>
      <button onClick={() => addToast({ type: 'success', title: 'Success Toast', message: 'Success message' })}>
        Add Success Toast
      </button>
      <button onClick={() => removeToast('test-id')}>
        Remove Toast
      </button>
      <button onClick={clearAllToasts}>
        Clear All
      </button>
    </div>
  );
};

const ToastHelpersTestComponent = () => {
  const helpers = useToastHelpers();
  
  return (
    <div>
      <button onClick={() => helpers.success('Success!', 'Operation completed')}>
        Success Helper
      </button>
      <button onClick={() => helpers.error('Error!', 'Something went wrong')}>
        Error Helper
      </button>
      <button onClick={() => helpers.warning('Warning!', 'Be careful')}>
        Warning Helper
      </button>
      <button onClick={() => helpers.info('Info!', 'FYI')}>
        Info Helper
      </button>
      <button onClick={() => helpers.wsReconnected()}>
        WS Reconnected
      </button>
      <button onClick={() => helpers.wsDisconnected()}>
        WS Disconnected
      </button>
      <button onClick={() => helpers.rateLimitWarning('OpenAI', 85.5)}>
        Rate Limit Warning
      </button>
      <button onClick={() => helpers.autoPaused('OpenAI')}>
        Auto Paused
      </button>
    </div>
  );
};

describe('ToastProvider Component', () => {
  it('renders children without crashing', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('provides toast context to children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    expect(screen.getByText('Add Toast')).toBeInTheDocument();
    expect(screen.getByText('Remove Toast')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('adds and displays toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Add a toast
    fireEvent.click(screen.getByText('Add Toast'));
    
    // Should display the toast
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });

  it('adds toast with message', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Add a toast with message
    fireEvent.click(screen.getByText('Add Success Toast'));
    
    // Should display both title and message
    expect(screen.getByText('Success Toast')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('clears all toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Add some toasts
    fireEvent.click(screen.getByText('Add Toast'));
    fireEvent.click(screen.getByText('Add Success Toast'));
    
    // Verify toasts are present
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Success Toast')).toBeInTheDocument();
    
    // Clear all toasts
    fireEvent.click(screen.getByText('Clear All'));
    
    // Toasts should be gone
    expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
    expect(screen.queryByText('Success Toast')).not.toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    // Mock console.error to prevent error output in test
    const originalError = console.error;
    console.error = jest.fn();
    
    const TestComponentOutsideProvider = () => {
      try {
        useToast();
        return <div>Should not render</div>;
      } catch (error) {
        return <div>Error caught: {(error as Error).message}</div>;
      }
    };
    
    render(<TestComponentOutsideProvider />);
    
    expect(screen.getByText('Error caught: useToast must be used within ToastProvider')).toBeInTheDocument();
    
    console.error = originalError;
  });
});

describe('useToastHelpers', () => {
  it('provides helper functions for different toast types', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test success helper
    fireEvent.click(screen.getByText('Success Helper'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('creates error toasts with extended duration', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test error helper
    fireEvent.click(screen.getByText('Error Helper'));
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('creates warning toasts', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test warning helper
    fireEvent.click(screen.getByText('Warning Helper'));
    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('creates info toasts', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test info helper
    fireEvent.click(screen.getByText('Info Helper'));
    expect(screen.getByText('Info!')).toBeInTheDocument();
    expect(screen.getByText('FYI')).toBeInTheDocument();
  });

  it('creates websocket reconnection toast', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test websocket reconnected helper
    fireEvent.click(screen.getByText('WS Reconnected'));
    expect(screen.getByText('WebSocket Reconnected')).toBeInTheDocument();
    expect(screen.getByText('Real-time updates are now active')).toBeInTheDocument();
  });

  it('creates websocket disconnection toast', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test websocket disconnected helper
    fireEvent.click(screen.getByText('WS Disconnected'));
    expect(screen.getByText('Connection Lost')).toBeInTheDocument();
    expect(screen.getByText('Attempting to reconnect...')).toBeInTheDocument();
  });

  it('creates rate limit warning toast with action', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test rate limit warning helper
    fireEvent.click(screen.getByText('Rate Limit Warning'));
    
    // Check for toast content that may have duplicate text
    const warningElements = screen.getAllByText('Rate Limit Warning');
    expect(warningElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('OpenAI usage at 85.5%')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('creates auto-paused toast with action', () => {
    render(
      <ToastProvider>
        <ToastHelpersTestComponent />
      </ToastProvider>
    );
    
    // Test auto-paused helper
    fireEvent.click(screen.getByText('Auto Paused'));
    expect(screen.getByText('Auto-Paused: OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Rate limit threshold reached')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
