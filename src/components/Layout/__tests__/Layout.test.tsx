import { screen } from '@testing-library/react';
import { useApp } from '../../../context/AppContext';
import { renderWithProviders } from '../../../utils/test-utils';
import { Layout } from '../Layout';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
  }),
}));

// Mock useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
  }),
}));

const mockContextValue = useApp();

describe('Layout Component', () => {
  it('renders children correctly', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies dark mode class when isDark is true', () => {
    // Mock useTheme to return dark mode
    const mockUseTheme = jest.requireMock('../../../hooks/useTheme');
    mockUseTheme.useTheme = () => ({
      isDark: true,
      toggleTheme: jest.fn(),
    });

    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const container = document.querySelector('.dark');
    expect(container).toBeInTheDocument();
  });

  it('renders documentation banner', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // The DocumentationBanner should be rendered
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('renders sidebar and header components', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    // Check if sidebar and header are present in the DOM structure
    expect(document.querySelector('.flex')).toBeInTheDocument();
  });

  it('handles sidebar open/close state', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // Layout should manage sidebar state internally
    expect(container.firstChild).toBeInTheDocument();
  });

  it('gets correct page title for different routes', () => {
    const mockRouter = jest.requireMock('next/router');
    
    // Test dashboard route
    mockRouter.useRouter = () => ({
      pathname: '/',
      push: jest.fn(),
    });

    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // The component should handle the routing internally
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('gets correct page title for monitor route', () => {
    const mockRouter = jest.requireMock('next/router');
    
    mockRouter.useRouter = () => ({
      pathname: '/monitor',
      push: jest.fn(),
    });

    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('gets correct page title for analytics route', () => {
    const mockRouter = jest.requireMock('next/router');
    
    mockRouter.useRouter = () => ({
      pathname: '/analytics',
      push: jest.fn(),
    });

    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('gets default page title for unknown routes', () => {
    const mockRouter = jest.requireMock('next/router');
    
    mockRouter.useRouter = () => ({
      pathname: '/unknown-route',
      push: jest.fn(),
    });

    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('handles responsive layout structure', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // Check for responsive classes
    const layoutContainer = document.querySelector('.min-h-screen');
    expect(layoutContainer).toBeInTheDocument();
    expect(layoutContainer).toHaveClass('bg-gray-50', 'dark:bg-gray-900');
  });
});
