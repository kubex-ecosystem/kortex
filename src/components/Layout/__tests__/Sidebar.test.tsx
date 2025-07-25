import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/dashboard',
    query: {},
    asPath: '/dashboard',
  }),
}))

describe('Sidebar Component', () => {
  const defaultProps = {
    isOpen: true,
    currentPage: 'Dashboard',
    onPageChange: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar component', () => {
    render(<Sidebar {...defaultProps} />)
    
    // Check if main navigation is rendered
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('displays documentation link in resources section', () => {
    render(<Sidebar {...defaultProps} />)
    
    // Look for documentation link
    const docLink = screen.getByRole('link', { name: /documentation/i })
    expect(docLink).toBeInTheDocument()
    expect(docLink).toHaveAttribute('href', 'https://kortex.rafa-mori.dev/')
    expect(docLink).toHaveAttribute('target', '_blank')
    expect(docLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows resources section header', () => {
    render(<Sidebar {...defaultProps} />)
    
    // Check for Resources section
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('renders navigation menu items', () => {
    render(<Sidebar {...defaultProps} />)
    
    // Check for main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('handles closed state', () => {
    render(<Sidebar {...defaultProps} isOpen={false} />)
    
    // Sidebar should not be visible when closed
    const nav = screen.queryByRole('navigation')
    expect(nav).not.toBeInTheDocument()
  })

  it('shows external link icon for documentation', () => {
    render(<Sidebar {...defaultProps} />)
    
    // Look for external link icon
    const docLink = screen.getByRole('link', { name: /documentation/i })
    expect(docLink).toBeInTheDocument()
    
    // Check if external link icon is present
    const icon = docLink.querySelector('[data-lucide="external-link"]')
    expect(icon).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Sidebar {...defaultProps} />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // Check for accessible links
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn()
    render(<Sidebar {...defaultProps} onClose={mockOnClose} />)
    
    // Find close button and click it
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
