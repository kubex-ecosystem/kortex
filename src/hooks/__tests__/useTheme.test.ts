import { act, renderHook } from '@testing-library/react';
import { useTheme } from '../useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window.matchMedia
const matchMediaMock = jest.fn();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

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

  it('toggles theme correctly', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('kortex-theme', 'dark');
    expect(classListMock.toggle).toHaveBeenCalledWith('dark', true);
  });

  it('provides toggleTheme function', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.toggleTheme).toBe('function');
  });
});
