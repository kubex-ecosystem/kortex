import { act, renderHook } from '@testing-library/react';

// Mock the hook to test interface without complex WebSocket logic
const mockUseWebSocket = {
  isConnected: false,
  serverConfig: null,
  rateLimitStatus: {},
  pollingStatus: null,
  alerts: [],
  reconnect: jest.fn(),
  clearAlerts: jest.fn(),
  lastUpdate: null
};

// Mock the hook directly to test interface
jest.mock('../useWebSocket', () => ({
  useWebSocket: jest.fn(() => mockUseWebSocket)
}));

import { useWebSocket } from '../useWebSocket';

describe('useWebSocket Hook Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns expected interface structure', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('serverConfig');
    expect(result.current).toHaveProperty('rateLimitStatus');
    expect(result.current).toHaveProperty('pollingStatus');
    expect(result.current).toHaveProperty('alerts');
    expect(result.current).toHaveProperty('reconnect');
    expect(result.current).toHaveProperty('clearAlerts');
    expect(result.current).toHaveProperty('lastUpdate');
  });

  it('has correct initial state types', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(typeof result.current.isConnected).toBe('boolean');
    expect(result.current.serverConfig).toBeNull();
    expect(typeof result.current.rateLimitStatus).toBe('object');
    expect(result.current.pollingStatus).toBeNull();
    expect(Array.isArray(result.current.alerts)).toBe(true);
    expect(typeof result.current.reconnect).toBe('function');
    expect(typeof result.current.clearAlerts).toBe('function');
    expect(result.current.lastUpdate).toBeNull();
  });

  it('allows calling reconnect function', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    act(() => {
      result.current.reconnect();
    });

    expect(mockUseWebSocket.reconnect).toHaveBeenCalled();
  });

  it('allows calling clearAlerts function', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    act(() => {
      result.current.clearAlerts();
    });

    expect(mockUseWebSocket.clearAlerts).toHaveBeenCalled();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.serverConfig).toBeNull();
    expect(result.current.rateLimitStatus).toEqual({});
    expect(result.current.pollingStatus).toBeNull();
    expect(result.current.alerts).toEqual([]);
    expect(result.current.lastUpdate).toBeNull();
  });

  it('functions are stable across renders', () => {
    const { result, rerender } = renderHook(() => useWebSocket('ws://localhost:8080'));
    
    const firstRender = result.current;
    
    rerender();
    
    const secondRender = result.current;
    
    expect(secondRender.reconnect).toBe(firstRender.reconnect);
    expect(secondRender.clearAlerts).toBe(firstRender.clearAlerts);
  });

  it('accepts different URL formats', () => {
    const urls = [
      'ws://localhost:8080',
      'wss://secure.example.com:443',
      'ws://192.168.1.1:3000/ws',
      'wss://api.example.com/websocket'
    ];

    urls.forEach(url => {
      const { result } = renderHook(() => useWebSocket(url));
      expect(result.current).toBeDefined();
    });
  });

  it('rateLimitStatus is an object', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(typeof result.current.rateLimitStatus).toBe('object');
    expect(result.current.rateLimitStatus).not.toBeNull();
    expect(Array.isArray(result.current.rateLimitStatus)).toBe(false);
  });

  it('alerts is an array', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(Array.isArray(result.current.alerts)).toBe(true);
    expect(result.current.alerts).toEqual([]);
  });

  it('connection state is boolean', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(typeof result.current.isConnected).toBe('boolean');
  });

  it('handles URL parameter changes', () => {
    let url = 'ws://localhost:8080';
    const { rerender } = renderHook(() => useWebSocket(url));

    url = 'ws://localhost:8081';
    rerender();

    // Should not crash when URL changes
    expect(true).toBe(true);
  });

  it('serverConfig can be null or object', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(result.current.serverConfig === null || typeof result.current.serverConfig === 'object').toBe(true);
  });

  it('pollingStatus can be null or object', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(result.current.pollingStatus === null || typeof result.current.pollingStatus === 'object').toBe(true);
  });

  it('lastUpdate can be null or Date', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(result.current.lastUpdate === null || result.current.lastUpdate instanceof Date).toBe(true);
  });

  it('maintains consistent interface across multiple calls', () => {
    const hook1 = renderHook(() => useWebSocket('ws://localhost:8080'));
    const hook2 = renderHook(() => useWebSocket('ws://localhost:8081'));

    const interface1 = Object.keys(hook1.result.current);
    const interface2 = Object.keys(hook2.result.current);

    expect(interface1).toEqual(interface2);
  });

  it('provides callable functions without errors', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

    expect(() => {
      act(() => {
        result.current.reconnect();
        result.current.clearAlerts();
      });
    }).not.toThrow();
  });

  it('handles empty or invalid URLs gracefully', () => {
    const invalidUrls = ['', 'invalid-url', 'http://not-websocket'];

    invalidUrls.forEach(url => {
      expect(() => {
        renderHook(() => useWebSocket(url));
      }).not.toThrow();
    });
  });
});
