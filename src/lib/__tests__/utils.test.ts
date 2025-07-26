import { cn, debounce, formatDate, slugify } from '../utils';

describe('Utils Library', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('btn', 'btn-primary', { 'btn-disabled': false });
      expect(result).toContain('btn');
      expect(result).toContain('btn-primary');
    });

    it('handles conditional classes', () => {
      const result = cn('base', { 'active': true, 'disabled': false });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });

    it('merges tailwind classes with twMerge', () => {
      const result = cn('p-4', 'p-2');
      // twMerge should keep only the last padding class
      expect(result).toBe('p-2');
    });

    it('handles empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles null and undefined', () => {
      const result = cn(null, undefined, 'valid-class');
      expect(result).toBe('valid-class');
    });
  });

  describe('formatDate function', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toBe('January 15, 2024');
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-12-25T12:00:00Z');
      const result = formatDate(date);
      expect(result).toBe('December 25, 2024');
    });

    it('handles ISO date strings', () => {
      const result = formatDate('2024-06-30T12:00:00Z');
      expect(result).toBe('June 30, 2024');
    });

    it('formats current date when given today', () => {
      const today = new Date();
      const result = formatDate(today);
      expect(result).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
    });
  });

  describe('slugify function', () => {
    it('converts text to lowercase slug', () => {
      const result = slugify('Hello World');
      expect(result).toBe('hello-world');
    });

    it('replaces spaces with hyphens', () => {
      const result = slugify('Multiple   Spaces   Here');
      expect(result).toBe('multiple-spaces-here');
    });

    it('removes special characters', () => {
      const result = slugify('Hello! @#$% World?');
      expect(result).toBe('hello-world');
    });

    it('removes leading and trailing hyphens', () => {
      const result = slugify('  -Hello World-  ');
      expect(result).toBe('hello-world');
    });

    it('collapses multiple hyphens', () => {
      const result = slugify('Hello---World');
      expect(result).toBe('hello-world');
    });

    it('handles empty string', () => {
      const result = slugify('');
      expect(result).toBe('');
    });

    it('handles only special characters', () => {
      const result = slugify('!@#$%^&*()');
      expect(result).toBe('');
    });

    it('preserves numbers and letters', () => {
      const result = slugify('Test 123 ABC');
      expect(result).toBe('test-123-abc');
    });
  });

  describe('debounce function', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('cancels previous calls when called again', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn('first');
      jest.advanceTimersByTime(200);
      
      debouncedFn('second');
      jest.advanceTimersByTime(500);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    it('handles multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('arg1', 'arg2', 'arg3');
      jest.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('works with different delay times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      jest.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('preserves function context and return type', () => {
      const originalFn = (x: number, y: number) => x + y;
      const debouncedFn = debounce(originalFn, 100);

      // Type checking - should accept same parameters
      debouncedFn(1, 2);
      jest.advanceTimersByTime(100);

      expect(typeof debouncedFn).toBe('function');
    });

    it('handles rapid successive calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 200);

      // Rapid calls
      for (let i = 0; i < 10; i++) {
        debouncedFn(`call-${i}`);
        jest.advanceTimersByTime(10);
      }

      // Only the last call should execute
      jest.advanceTimersByTime(200);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call-9');
    });
  });
});
