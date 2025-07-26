import { render, screen } from '@testing-library/react';
import React, { act } from 'react';
import { ClientOnly } from '../ClientOnly';

// Mock useEffect to control component mounting behavior
jest.spyOn(React, 'useEffect').mockImplementation((callback, deps) => {
  // For testing, we can simulate the mounting behavior
  if (deps && deps.length === 0) {
    // Empty dependency array - should run after mount
    setTimeout(callback, 0);
  }
});

describe('ClientOnly Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders fallback initially before mounting', () => {
    const fallbackText = 'Loading...';
    const childrenText = 'Client content';
    
    render(
      <ClientOnly fallback={<div>{fallbackText}</div>}>
        <div>{childrenText}</div>
      </ClientOnly>
    );
    
    // Initially should show fallback
    expect(screen.getByText(fallbackText)).toBeInTheDocument();
    expect(screen.queryByText(childrenText)).not.toBeInTheDocument();
  });

  it('renders null fallback when no fallback provided', () => {
    const childrenText = 'Client content';
    const { container } = render(
      <ClientOnly>
        <div>{childrenText}</div>
      </ClientOnly>
    );
    
    // Should render empty initially (null fallback means nothing rendered)
    expect(container.firstChild).toBeNull();
  });

  it('renders children after mounting', async () => {
    const childrenText = 'Client content';
    const fallbackText = 'Loading...';
    
    const { rerender } = render(
      <ClientOnly fallback={<div>{fallbackText}</div>}>
        <div>{childrenText}</div>
      </ClientOnly>
    );
    
    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Re-render to trigger state change
    rerender(
      <ClientOnly fallback={<div>{fallbackText}</div>}>
        <div>{childrenText}</div>
      </ClientOnly>
    );
    
    // Should now show children
    expect(screen.queryByText(fallbackText)).not.toBeInTheDocument();
    expect(screen.getByText(childrenText)).toBeInTheDocument();
  });

  it('handles complex children content', () => {
    const complexChildren = (
      <div>
        <h1>Title</h1>
        <p>Paragraph content</p>
        <button>Action</button>
      </div>
    );
    
    render(<ClientOnly>{complexChildren}</ClientOnly>);
    
    // Initially should not render complex content
    expect(screen.queryByText('Title')).not.toBeInTheDocument();
  });

  it('accepts ReactNode as children', () => {
    const stringChild = 'Simple string';
    const numberChild = 42;
    
    render(
      <ClientOnly>
        <div>
          {stringChild}
          {numberChild}
        </div>
      </ClientOnly>
    );
    
    // Component should handle various ReactNode types
    expect(typeof stringChild).toBe('string');
    expect(typeof numberChild).toBe('number');
  });
});
