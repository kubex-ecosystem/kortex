import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders with Running status', () => {
    render(<StatusBadge status="Running" />);
    
    expect(screen.getByText('Running')).toBeInTheDocument();
    const badge = screen.getByText('Running').parentElement;
    expect(badge).toHaveClass('bg-blue-100', 'dark:bg-blue-900/30', 'text-blue-800', 'dark:text-blue-200');
  });

  it('renders with Online status', () => {
    render(<StatusBadge status="Online" />);
    
    expect(screen.getByText('Online')).toBeInTheDocument();
    const badge = screen.getByText('Online').parentElement;
    expect(badge).toHaveClass('bg-green-100', 'dark:bg-green-900/30', 'text-green-800', 'dark:text-green-200');
  });

  it('renders with Completed status', () => {
    render(<StatusBadge status="Completed" />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
    const badge = screen.getByText('Completed').parentElement;
    expect(badge).toHaveClass('bg-green-100', 'dark:bg-green-900/30', 'text-green-800', 'dark:text-green-200');
  });

  it('renders with Connected status', () => {
    render(<StatusBadge status="Connected" />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
    const badge = screen.getByText('Connected').parentElement;
    expect(badge).toHaveClass('bg-green-100', 'dark:bg-green-900/30', 'text-green-800', 'dark:text-green-200');
  });

  it('renders with Failed status', () => {
    render(<StatusBadge status="Failed" />);
    
    expect(screen.getByText('Failed')).toBeInTheDocument();
    const badge = screen.getByText('Failed').parentElement;
    expect(badge).toHaveClass('bg-red-100', 'dark:bg-red-900/30', 'text-red-800', 'dark:text-red-200');
  });

  it('renders with Offline status', () => {
    render(<StatusBadge status="Offline" />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
    const badge = screen.getByText('Offline').parentElement;
    expect(badge).toHaveClass('bg-red-100', 'dark:bg-red-900/30', 'text-red-800', 'dark:text-red-200');
  });

  it('renders with Pending status', () => {
    render(<StatusBadge status="Pending" />);
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    const badge = screen.getByText('Pending').parentElement;
    expect(badge).toHaveClass('bg-yellow-100', 'dark:bg-yellow-900/30', 'text-yellow-800', 'dark:text-yellow-200');
  });

  it('renders with Warning status', () => {
    render(<StatusBadge status="Warning" />);
    
    expect(screen.getByText('Warning')).toBeInTheDocument();
    const badge = screen.getByText('Warning').parentElement;
    expect(badge).toHaveClass('bg-yellow-100', 'dark:bg-yellow-900/30', 'text-yellow-800', 'dark:text-yellow-200');
  });

  it('renders with unknown status and defaults to Pending', () => {
    render(<StatusBadge status="UnknownStatus" />);
    
    expect(screen.getByText('UnknownStatus')).toBeInTheDocument();
    const badge = screen.getByText('UnknownStatus').parentElement;
    expect(badge).toHaveClass('bg-yellow-100', 'dark:bg-yellow-900/30', 'text-yellow-800', 'dark:text-yellow-200');
  });

  it('applies custom className when provided', () => {
    render(<StatusBadge status="Online" className="custom-class" />);
    
    const badge = screen.getByText('Online').parentElement;
    expect(badge).toHaveClass('custom-class');
  });

  it('has proper badge structure and classes', () => {
    render(<StatusBadge status="Running" />);
    
    const badge = screen.getByText('Running').parentElement;
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'gap-1.5',
      'px-2.5',
      'py-1',
      'rounded-full',
      'text-xs',
      'font-medium',
      'border',
      'transition-all',
      'duration-200'
    );
  });

  it('displays icon for Running status with animation', () => {
    render(<StatusBadge status="Running" />);
    
    const badge = screen.getByText('Running').parentElement;
    const iconElement = badge?.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveClass('animate-spin');
  });

  it('displays icon for Online status', () => {
    render(<StatusBadge status="Online" />);
    
    const badge = screen.getByText('Online').parentElement;
    const iconElement = badge?.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
  });

  it('displays icon for Failed status', () => {
    render(<StatusBadge status="Failed" />);
    
    const badge = screen.getByText('Failed').parentElement;
    const iconElement = badge?.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
  });
});
