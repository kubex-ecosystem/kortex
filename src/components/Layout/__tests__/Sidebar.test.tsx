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
    expect(docLink).toHaveAttribute('href', 'https://docs.kubex.world/pulse/')
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

  it('handles closed state correctly', () => {
    render(<Sidebar {...defaultProps} isOpen={false} />)

    // When closed, sidebar should not be visible (display: none or similar)
    // The component still renders but should be hidden via CSS classes
    const sidebarElement = screen.getByRole('complementary', { hidden: true })
    expect(sidebarElement).toBeInTheDocument()
  })

  it('shows external link icon for documentation', () => {
    render(<Sidebar {...defaultProps} />)

    // Look for documentation link
    const docLink = screen.getByRole('link', { name: /documentation/i })
    expect(docLink).toBeInTheDocument()

    // Check if the link contains an external link icon (svg with specific path or class)
    const linkContent = docLink.innerHTML
    expect(linkContent).toContain('external-link')
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

    // Find close button by its title attribute
    const closeButton = screen.getByTitle('Close Sidebar')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
