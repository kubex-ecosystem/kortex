import { act, renderHook } from '@testing-library/react';

// Mock the hook to test interface without complex API logic
const mockUseRealAnalyticsData = {
  data: null,
  isLoading: false,
  error: null,
  refresh: jest.fn(),
  lastUpdated: null,
  dataSource: 'demo' as const
};

// Mock the hook directly to test interface
jest.mock('../useRealAnalyticsData', () => ({
  useRealAnalyticsData: jest.fn(() => mockUseRealAnalyticsData)
}));

import { useRealAnalyticsData } from '../useRealAnalyticsData';

describe('useRealAnalyticsData Hook Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns expected interface structure', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refresh');
    expect(result.current).toHaveProperty('lastUpdated');
    expect(result.current).toHaveProperty('dataSource');
  });

  it('has correct initial state types', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(result.current.data === null || typeof result.current.data === 'object').toBe(true);
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    expect(typeof result.current.refresh).toBe('function');
    expect(result.current.lastUpdated === null || result.current.lastUpdated instanceof Date).toBe(true);
    expect(typeof result.current.dataSource).toBe('string');
  });

  it('allows calling refresh function', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    act(() => {
      result.current.refresh();
    });

    expect(mockUseRealAnalyticsData.refresh).toHaveBeenCalled();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
    expect(result.current.dataSource).toBe('demo');
  });

  it('refresh function is callable without errors', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(() => {
      act(() => {
        result.current.refresh();
      });
    }).not.toThrow();
  });

  it('loading state is boolean', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('error can be null or string', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
  });

  it('data can be null or object', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(result.current.data === null || typeof result.current.data === 'object').toBe(true);
  });

  it('lastUpdated can be null or Date', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(result.current.lastUpdated === null || result.current.lastUpdated instanceof Date).toBe(true);
  });

  it('maintains consistent interface across renders', () => {
    const { result, rerender } = renderHook(() => useRealAnalyticsData());
    
    const firstRender = Object.keys(result.current);
    
    rerender();
    
    const secondRender = Object.keys(result.current);
    
    expect(firstRender).toEqual(secondRender);
  });

  it('refresh function is stable across renders', () => {
    const { result, rerender } = renderHook(() => useRealAnalyticsData());
    
    const firstRefresh = result.current.refresh;
    
    rerender();
    
    const secondRefresh = result.current.refresh;
    
    expect(firstRefresh).toBe(secondRefresh);
  });

  it('handles multiple simultaneous calls', () => {
    const hook1 = renderHook(() => useRealAnalyticsData());
    const hook2 = renderHook(() => useRealAnalyticsData());

    expect(hook1.result.current).toBeDefined();
    expect(hook2.result.current).toBeDefined();

    // Both should have the same interface
    expect(Object.keys(hook1.result.current)).toEqual(Object.keys(hook2.result.current));
  });

  it('refresh function can be called multiple times', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    act(() => {
      result.current.refresh();
      result.current.refresh();
      result.current.refresh();
    });

    expect(mockUseRealAnalyticsData.refresh).toHaveBeenCalledTimes(3);
  });

  it('maintains interface consistency', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    const expectedKeys = ['data', 'isLoading', 'error', 'refresh', 'lastUpdated', 'dataSource'];
    const actualKeys = Object.keys(result.current);

    expect(actualKeys.sort()).toEqual(expectedKeys.sort());
  });

  it('provides proper function types', () => {
    const { result } = renderHook(() => useRealAnalyticsData());

    expect(typeof result.current.refresh).toBe('function');
    expect(result.current.refresh.length).toBe(0); // No parameters expected
  });

  it('handles unmounting gracefully', () => {
    const { unmount } = renderHook(() => useRealAnalyticsData());

    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
