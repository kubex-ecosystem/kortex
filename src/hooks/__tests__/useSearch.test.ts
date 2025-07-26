import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSearch } from '../useSearch';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('useSearch Hook', () => {
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

  it('initializes with default values', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.query).toBe('');
    expect(result.current.isOpen).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it('updates query state when setQuery is called', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('dashboard');
    });

    expect(result.current.query).toBe('dashboard');
  });

  it('updates isOpen state when setIsOpen is called', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setIsOpen(true);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('filters search results based on query', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('dashboard');
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe('Dashboard');
    expect(result.current.results[0].description).toBe('Main dashboard overview');
  });

  it('filters search results by description', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('monitoring');
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe('Live Monitor');
    expect(result.current.results[0].description).toBe('Real-time system monitoring');
  });

  it('returns multiple results for broader queries', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('server');
    });

    // Should find "Servers" page and server entries
    expect(result.current.results.length).toBeGreaterThan(1);
    
    const serverPage = result.current.results.find(r => r.title === 'Servers');
    expect(serverPage).toBeDefined();
    expect(serverPage?.category).toBe('page');
  });

  it('limits results to maximum of 8 items', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('a'); // Very broad search
    });

    expect(result.current.results.length).toBeLessThanOrEqual(8);
  });

  it('returns empty results for empty query', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('');
    });

    expect(result.current.results).toEqual([]);
  });

  it('returns empty results for whitespace-only query', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('   ');
    });

    expect(result.current.results).toEqual([]);
  });

  it('handles case-insensitive search', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('DASHBOARD');
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe('Dashboard');
  });

  it('navigates to result path when handleResultClick is called', () => {
    const { result } = renderHook(() => useSearch());

    const mockResult = {
      id: '1',
      title: 'Dashboard',
      description: 'Main dashboard overview',
      category: 'page' as const,
      path: '/',
      icon: '📊'
    };

    act(() => {
      result.current.setQuery('test');
      result.current.setIsOpen(true);
    });

    act(() => {
      result.current.handleResultClick(mockResult);
    });

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(result.current.query).toBe('');
    expect(result.current.isOpen).toBe(false);
  });

  it('handles result click without path gracefully', () => {
    const { result } = renderHook(() => useSearch());

    const mockResult = {
      id: '8',
      title: 'MCP-01',
      description: 'Production server - Online',
      category: 'server' as const,
      icon: '✅'
    };

    act(() => {
      result.current.setQuery('test');
      result.current.setIsOpen(true);
    });

    act(() => {
      result.current.handleResultClick(mockResult);
    });

    // Should not call router.push for results without path
    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.query).toBe('');
    expect(result.current.isOpen).toBe(false);
  });

  it('handles escape key to close search', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
      result.current.setIsOpen(true);
    });

    // Simulate escape key press
    act(() => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
  });

  it('ignores non-escape key presses', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
      result.current.setIsOpen(true);
    });

    // Simulate other key press
    act(() => {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.query).toBe('test');
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useSearch());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  it('finds analytics page by analytics keyword', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('analytics');
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe('Analytics');
    expect(result.current.results[0].path).toBe('/analytics');
  });

  it('finds server entries by server category', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('MCP');
    });

    const mcpResults = result.current.results.filter(r => r.title.includes('MCP'));
    expect(mcpResults.length).toBeGreaterThan(0);
    
    mcpResults.forEach(result => {
      expect(result.category).toBe('server');
    });
  });
});
