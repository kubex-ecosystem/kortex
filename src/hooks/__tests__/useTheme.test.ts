import { act, renderHook } from '@testing-library/react';
import { useTheme } from '../useTheme';

// Mock the useApp context
jest.mock('../../context/AppContext', () => ({
  useWebSocket: () => ({
    isConnected: false,
    connectionStatus: 'disconnected',
    alerts: [],
  }),
  useApp: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
    servers: [],
    tasks: [],
    notifications: [],
    logs: [],
    isConnected: false,
    isLoading: false,
    error: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    refreshData: jest.fn(),
    addTask: jest.fn(),
    addServer: jest.fn(),
    addNotification: jest.fn(),
    addLog: jest.fn(),
    removeTask: jest.fn(),
    removeServer: jest.fn(),
    removeNotification: jest.fn(),
    removeLog: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window.matchMedia
const matchMediaMock = jest.fn();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Mock document.documentElement.classList
const classListMock = {
  toggle: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(),
};

Object.defineProperty(document.documentElement, 'classList', {
  value: classListMock,
});

describe('useTheme Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });

  it('initializes with dark mode false by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);
  });

  it('loads saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(true);
    expect(classListMock.toggle).toHaveBeenCalledWith('dark', true);

    // Wait for useEffect to complete
    act(() => {
      // The hook should eventually set isDark to true based on localStorage
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('kortex-theme');
  });

  it('uses system preference when no saved theme', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => useTheme());

    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('toggles theme correctly', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('kortex-theme', 'dark');
    expect(classListMock.toggle).toHaveBeenCalledWith('dark', true);
  });

  it('toggles theme from dark to light', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const { result } = renderHook(() => useTheme());

    // Simulate that isDark is currently true
    act(() => {
      // First toggle to set up state
      result.current.toggleTheme();
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('kortex-theme', 'light');
  });

  it('applies dark class to document when toggling to dark', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(classListMock.toggle).toHaveBeenCalledWith('dark', true);
  });

  it('removes dark class from document when toggling to light', () => {
    const { result } = renderHook(() => useTheme());

    // First toggle to dark
    act(() => {
      result.current.toggleTheme();
    });

    // Then toggle back to light
    act(() => {
      result.current.toggleTheme();
    });

    expect(classListMock.toggle).toHaveBeenCalledWith('dark', false);
  });

  it('handles system theme changes when no saved preference', () => {
    const addEventListener = jest.fn();
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener,
      removeEventListener: jest.fn(),
    });

    renderHook(() => useTheme());

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('persists theme preference in localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('kortex-theme', 'dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('kortex-theme', 'light');
  });

  it('handles client-side detection correctly', () => {
    const { result } = renderHook(() => useTheme());

    // The hook should handle client-side detection
    expect(result.current).toHaveProperty('isDark');
    expect(result.current).toHaveProperty('toggleTheme');
  });

  it('handles localStorage not available gracefully', () => {
    // Temporarily make localStorage unavailable
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
    });

    expect(() => {
      renderHook(() => useTheme());
    }).not.toThrow();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
    });
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListener = jest.fn();
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener,
    });

    const { unmount } = renderHook(() => useTheme());

    unmount();

    // The hook should clean up listeners when unmounting
    expect(removeEventListener).toHaveBeenCalled();
  });
});
