import { fireEvent, render, screen } from '@testing-library/react';
import { HelpTooltip } from '../HelpTooltip';

describe('HelpTooltip Component', () => {
  const mockProps = {
    title: 'Test Help Title',
    description: 'This is a test description for the help tooltip.',
    docsUrl: 'https://example.com/docs',
  };

  it('renders help icon button', () => {
    render(<HelpTooltip {...mockProps} />);
    
    const helpButton = screen.getByRole('button', { name: /help information/i });
    expect(helpButton).toBeInTheDocument();
  });

  it('shows tooltip on mouse enter', () => {
    render(<HelpTooltip {...mockProps} />);
    
    const helpButton = screen.getByRole('button', { name: /help information/i });
    
    // Initially tooltip should not be visible
    expect(screen.queryByText(mockProps.title)).not.toBeInTheDocument();
    
    // Show tooltip on mouse enter
    fireEvent.mouseEnter(helpButton);
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByText('Learn more in docs')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(<HelpTooltip {...mockProps} />);
    
    const helpButton = screen.getByRole('button', { name: /help information/i });
    
    // Show tooltip
    fireEvent.mouseEnter(helpButton);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.mouseLeave(helpButton);
    expect(screen.queryByText(mockProps.title)).not.toBeInTheDocument();
  });

  it('renders documentation link with correct href', () => {
    render(<HelpTooltip {...mockProps} />);
    
    const helpButton = screen.getByRole('button', { name: /help information/i });
    fireEvent.mouseEnter(helpButton);
    
    const docsLink = screen.getByRole('link', { name: /learn more in docs/i });
    expect(docsLink).toHaveAttribute('href', mockProps.docsUrl);
    expect(docsLink).toHaveAttribute('target', '_blank');
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-tooltip-class';
    const { container } = render(
      <HelpTooltip {...mockProps} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('uses default className when none provided', () => {
    const { container } = render(<HelpTooltip {...mockProps} />);
    
    expect(container.firstChild).toHaveClass('relative', 'inline-block');
  });
});
