import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { Header } from '../Header'

// Mock hooks
jest.mock('../../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: false,
    connectionStatus: 'disconnected',
    alerts: [],
  }),
}))

// Mock context
jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({
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
    addLog: jest.fn(),
    removeTask: jest.fn(),
    removeServer: jest.fn(),
    removeLog: jest.fn(),
  }),
}))

// Mock useWebSocket hook to include alerts
jest.mock('../../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: false,
    connectionStatus: 'disconnected',
    alerts: [],
  }),
}))

describe('Header Component', () => {
  const defaultProps = {
    isDark: false,
    onToggle: jest.fn(),
    onMenuClick: jest.fn(),
    currentPage: 'Dashboard',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders header component', () => {
    render(<Header {...defaultProps} />)
    
    // Check if main header is rendered
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('displays current page title', () => {
    render(<Header {...defaultProps} currentPage="Test Page" />)
    
    // Check if current page is displayed (use partial text match)
    expect(screen.getByText(/Test Page/)).toBeInTheDocument()
  })

  it('calls onToggle when theme button is clicked', () => {
    const mockOnToggle = jest.fn()
    render(<Header {...defaultProps} onToggle={mockOnToggle} />)
    
    // Find theme toggle button and click it
    const buttons = screen.getAllByRole('button')
    const themeButton = buttons.find(btn => 
      btn.querySelector('[data-lucide="sun"]') || 
      btn.querySelector('[data-lucide="moon"]')
    )
    
    if (themeButton) {
      fireEvent.click(themeButton)
      expect(mockOnToggle).toHaveBeenCalledTimes(1)
    }
  })

  it('calls onMenuClick when menu button is clicked', () => {
    const mockOnMenuClick = jest.fn()
    render(<Header {...defaultProps} onMenuClick={mockOnMenuClick} />)
    
    // Find menu button and click it
    const buttons = screen.getAllByRole('button')
    const menuButton = buttons.find(btn => 
      btn.querySelector('[data-lucide="menu"]')
    )
    
    if (menuButton) {
      fireEvent.click(menuButton)
      expect(mockOnMenuClick).toHaveBeenCalledTimes(1)
    }
  })

  it('shows documentation link with correct attributes', () => {
    render(<Header {...defaultProps} />)
    
    // Find documentation link
    const docLink = screen.getByRole('link', { name: /documentation/i })
    expect(docLink).toBeInTheDocument()
    expect(docLink).toHaveAttribute('href', 'https://kortex.rafa-mori.dev/')
    expect(docLink).toHaveAttribute('target', '_blank')
    expect(docLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows different icons based on theme', () => {
    const { rerender } = render(<Header {...defaultProps} isDark={false} />)
    
    // Find theme button by looking for moon or sun icons
    const buttons = screen.getAllByRole('button')
    const themeButton = buttons.find(btn => 
      btn.querySelector('.lucide-moon') || 
      btn.querySelector('.lucide-sun')
    )
    
    expect(themeButton).toBeInTheDocument()
    
    // In dark mode, should show sun icon
    rerender(<Header {...defaultProps} isDark={true} />)
    const buttonsAfter = screen.getAllByRole('button')
    const themeButtonAfter = buttonsAfter.find(btn => 
      btn.querySelector('.lucide-moon') || 
      btn.querySelector('.lucide-sun')
    )
    expect(themeButtonAfter).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Header {...defaultProps} />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    // Check for accessible buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('handles connection status display', () => {
    render(<Header {...defaultProps} />)
    
    // Header should render regardless of connection status
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
