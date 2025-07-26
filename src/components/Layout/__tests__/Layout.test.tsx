import { render, screen } from '@testing-library/react';
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

// Mock useApp hook
jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    servers: [],
    notifications: [],
    isConnected: false,
  }),
}));

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders layout structure', () => {
    render(
      <Layout>
        <div>Layout Test</div>
      </Layout>
    );
    
    // Verifica se a estrutura básica do layout está presente
    expect(screen.getByText('Layout Test')).toBeInTheDocument();
  });
});
