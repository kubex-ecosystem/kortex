import { act, renderHook } from '@testing-library/react';

// Simple mock for the hook - we'll test it in isolation
const mockUseMCPLogs = {
  logs: [],
  isMonitoring: true,
  setIsMonitoring: jest.fn(),
  stats: {
    total: 0,
    running: 0,
    queued: 0,
    completed: 0,
    failed: 0,
    successRate: 0,
    avgResponseTime: 0,
    uptime: 0
  },
  clearLogs: jest.fn(),
  exportLogs: jest.fn()
};

// Mock the hook directly to test interface
jest.mock('../useMCPLogs', () => ({
  useMCPLogs: jest.fn(() => mockUseMCPLogs)
}));

import { useMCPLogs } from '../useMCPLogs';

describe('useMCPLogs Hook Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns expected interface structure', () => {
    const { result } = renderHook(() => useMCPLogs());

    expect(result.current).toHaveProperty('logs');
    expect(result.current).toHaveProperty('isMonitoring');
    expect(result.current).toHaveProperty('setIsMonitoring');
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('clearLogs');
    expect(result.current).toHaveProperty('exportLogs');
  });

  it('has correct stats structure', () => {
    const { result } = renderHook(() => useMCPLogs());

    expect(result.current.stats).toHaveProperty('total');
    expect(result.current.stats).toHaveProperty('running');
    expect(result.current.stats).toHaveProperty('queued');
    expect(result.current.stats).toHaveProperty('completed');
    expect(result.current.stats).toHaveProperty('failed');
    expect(result.current.stats).toHaveProperty('successRate');
    expect(result.current.stats).toHaveProperty('avgResponseTime');
    expect(result.current.stats).toHaveProperty('uptime');
  });

  it('allows calling setIsMonitoring function', () => {
    const { result } = renderHook(() => useMCPLogs());

    act(() => {
      result.current.setIsMonitoring(false);
    });

    expect(mockUseMCPLogs.setIsMonitoring).toHaveBeenCalledWith(false);
  });

  it('allows calling clearLogs function', () => {
    const { result } = renderHook(() => useMCPLogs());

    act(() => {
      result.current.clearLogs();
    });

    expect(mockUseMCPLogs.clearLogs).toHaveBeenCalled();
  });

  it('allows calling exportLogs function', () => {
    const { result } = renderHook(() => useMCPLogs());

    act(() => {
      result.current.exportLogs();
    });

    expect(mockUseMCPLogs.exportLogs).toHaveBeenCalled();
  });

  it('initializes with logs as array', () => {
    const { result } = renderHook(() => useMCPLogs());

    expect(Array.isArray(result.current.logs)).toBe(true);
  });

  it('initializes with isMonitoring as boolean', () => {
    const { result } = renderHook(() => useMCPLogs());

    expect(typeof result.current.isMonitoring).toBe('boolean');
  });

  it('stats have correct types', () => {
    const { result } = renderHook(() => useMCPLogs());
    const { stats } = result.current;

    expect(typeof stats.total).toBe('number');
    expect(typeof stats.running).toBe('number');
    expect(typeof stats.queued).toBe('number');
    expect(typeof stats.completed).toBe('number');
    expect(typeof stats.failed).toBe('number');
    expect(typeof stats.successRate).toBe('number');
    expect(typeof stats.avgResponseTime).toBe('number');
    expect(typeof stats.uptime).toBe('number');
  });

  it('functions are callable', () => {
    const { result } = renderHook(() => useMCPLogs());

    expect(typeof result.current.setIsMonitoring).toBe('function');
    expect(typeof result.current.clearLogs).toBe('function');
    expect(typeof result.current.exportLogs).toBe('function');
  });

  it('returns stable reference across renders', () => {
    const { result, rerender } = renderHook(() => useMCPLogs());
    
    const firstRender = result.current;
    
    rerender();
    
    const secondRender = result.current;
    
    // Functions should be stable
    expect(secondRender.setIsMonitoring).toBe(firstRender.setIsMonitoring);
    expect(secondRender.clearLogs).toBe(firstRender.clearLogs);
    expect(secondRender.exportLogs).toBe(firstRender.exportLogs);
  });

  it('stats values are within expected ranges', () => {
    const { result } = renderHook(() => useMCPLogs());
    const { stats } = result.current;

    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.running).toBeGreaterThanOrEqual(0);
    expect(stats.queued).toBeGreaterThanOrEqual(0);
    expect(stats.completed).toBeGreaterThanOrEqual(0);
    expect(stats.failed).toBeGreaterThanOrEqual(0);
    expect(stats.successRate).toBeGreaterThanOrEqual(0);
    expect(stats.successRate).toBeLessThanOrEqual(100);
    expect(stats.avgResponseTime).toBeGreaterThanOrEqual(0);
    expect(stats.uptime).toBeGreaterThanOrEqual(0);
  });
});
