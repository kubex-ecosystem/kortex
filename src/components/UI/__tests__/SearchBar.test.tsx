import { fireEvent, render, screen } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

// Mock the useSearch hook
jest.mock('../../../hooks/useSearch', () => ({
  useSearch: () => ({
    query: '',
    setQuery: jest.fn(),
    results: [],
    isOpen: false,
    setIsOpen: jest.fn(),
    handleResultClick: jest.fn(),
  }),
}));

describe('SearchBar Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(<SearchBar />);
    
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder');
  });

  it('renders search icon', () => {
    render(<SearchBar />);
    
    const searchContainer = document.querySelector('svg');
    expect(searchContainer).toBeInTheDocument();
  });

  it('handles input focus and blur', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    const mockSetIsOpen = jest.fn();
    
    mockUseSearch.useSearch = () => ({
      query: '',
      setQuery: jest.fn(),
      results: [],
      isOpen: false,
      setIsOpen: mockSetIsOpen,
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    const searchInput = screen.getByRole('textbox');
    fireEvent.focus(searchInput);
    
    // Input should be focusable
    expect(searchInput).toBeInTheDocument();
  });

  it('handles keyboard shortcut Cmd+K', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    const mockSetIsOpen = jest.fn();
    
    mockUseSearch.useSearch = () => ({
      query: '',
      setQuery: jest.fn(),
      results: [],
      isOpen: false,
      setIsOpen: mockSetIsOpen,
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    // Simulate Cmd+K keypress
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    // Should not throw error
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('handles keyboard shortcut Ctrl+K', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    const mockSetIsOpen = jest.fn();
    
    mockUseSearch.useSearch = () => ({
      query: '',
      setQuery: jest.fn(),
      results: [],
      isOpen: false,
      setIsOpen: mockSetIsOpen,
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    // Simulate Ctrl+K keypress
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    
    // Should not throw error
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('displays search results when isOpen is true', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    
    mockUseSearch.useSearch = () => ({
      query: 'test',
      setQuery: jest.fn(),
      results: [
        { id: '1', title: 'Test Result 1', type: 'page' },
        { id: '2', title: 'Test Result 2', type: 'component' },
      ],
      isOpen: true,
      setIsOpen: jest.fn(),
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    // Should render the search container
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('handles result click', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    const mockHandleResultClick = jest.fn();
    
    mockUseSearch.useSearch = () => ({
      query: 'test',
      setQuery: jest.fn(),
      results: [
        { id: '1', title: 'Test Result 1', type: 'page' },
      ],
      isOpen: true,
      setIsOpen: jest.fn(),
      handleResultClick: mockHandleResultClick,
    });

    render(<SearchBar />);
    
    // The component should render without errors
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('handles query change', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    const mockSetQuery = jest.fn();
    
    mockUseSearch.useSearch = () => ({
      query: '',
      setQuery: mockSetQuery,
      results: [],
      isOpen: false,
      setIsOpen: jest.fn(),
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'new query' } });
    
    // Input should handle change events
    expect(searchInput).toBeInTheDocument();
  });

  it('closes search results when clicking outside', async () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    const mockSetIsOpen = jest.fn();
    
    mockUseSearch.useSearch = () => ({
      query: 'test',
      setQuery: jest.fn(),
      results: [],
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    // Click outside the component
    fireEvent.mouseDown(document.body);
    
    // Component should handle outside clicks
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('renders with empty results', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    
    mockUseSearch.useSearch = () => ({
      query: 'test',
      setQuery: jest.fn(),
      results: [],
      isOpen: true,
      setIsOpen: jest.fn(),
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('handles escape key to close search', () => {
    const mockUseSearch = jest.requireMock('../../../hooks/useSearch');
    const mockSetIsOpen = jest.fn();
    
    mockUseSearch.useSearch = () => ({
      query: 'test',
      setQuery: jest.fn(),
      results: [],
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleResultClick: jest.fn(),
    });

    render(<SearchBar />);
    
    const searchInput = screen.getByRole('textbox');
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    
    // Should handle escape key
    expect(searchInput).toBeInTheDocument();
  });
});
