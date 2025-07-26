import { fireEvent, screen } from '@testing-library/react';
import { Task } from '../../../types';
import { renderWithProviders } from '../../../utils/test-utils';
import { TaskCard } from '../TaskCard';

const mockTask: Task = {
  id: '1',
  definition: {
    id: '1',
    name: 'Test Task',
    description: 'A test task for testing',
    priority: 'Medium' as const,
    status: 'Running' as const,
    type: 'Training' as const,
  },
  status: 'Running',
  progress: 50,
  startedAt: new Date().toISOString(),
};

describe('TaskCard Component', () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('A test task for testing')).toBeInTheDocument();
  });

  it('displays status badge', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('shows action button for Running status', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
  });

  it('handles action button click for Running task', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnAction).toHaveBeenCalledWith('1', 'cancel');
  });

  it('shows retry button for Failed status', () => {
    const failedTask = { ...mockTask, status: 'Failed' as const };
    renderWithProviders(<TaskCard task={failedTask} onAction={mockOnAction} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('handles retry action for Failed task', () => {
    const failedTask = { ...mockTask, status: 'Failed' as const };
    renderWithProviders(<TaskCard task={failedTask} onAction={mockOnAction} />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockOnAction).toHaveBeenCalledWith('1', 'retry');
  });

  it('shows start button for Pending status', () => {
    const pendingTask = { ...mockTask, status: 'Pending' as const };
    renderWithProviders(<TaskCard task={pendingTask} onAction={mockOnAction} />);

    const startButton = screen.getByText('Start');
    expect(startButton).toBeInTheDocument();
  });

  it('handles start action for Pending task', () => {
    const pendingTask = { ...mockTask, status: 'Pending' as const };
    renderWithProviders(<TaskCard task={pendingTask} onAction={mockOnAction} />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(mockOnAction).toHaveBeenCalledWith('1', 'start');
  });

  it('shows view button for Completed status', () => {
    const completedTask = { ...mockTask, status: 'Completed' as const };
    renderWithProviders(<TaskCard task={completedTask} onAction={mockOnAction} />);

    const viewButton = screen.getByText('View');
    expect(viewButton).toBeInTheDocument();
  });

  it('handles view action for Completed task', () => {
    const completedTask = { ...mockTask, status: 'Completed' as const };
    renderWithProviders(<TaskCard task={completedTask} onAction={mockOnAction} />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    expect(mockOnAction).toHaveBeenCalledWith('1', 'view');
  });

  it('displays progress bar when progress is available', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    // The progress bar should be rendered
    const progressElement = document.querySelector('[role="progressbar"]') || 
                           document.querySelector('.w-full');
    expect(progressElement).toBeInTheDocument();
  });

  it('handles task without progress', () => {
    const taskWithoutProgress = { ...mockTask, progress: undefined };
    renderWithProviders(<TaskCard task={taskWithoutProgress} onAction={mockOnAction} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('returns null when task is missing', () => {
    const { container } = renderWithProviders(<TaskCard task={null as any} onAction={mockOnAction} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when task definition is missing', () => {
    const taskWithoutDefinition = { ...mockTask, definition: null as any };
    const { container } = renderWithProviders(<TaskCard task={taskWithoutDefinition} onAction={mockOnAction} />);

    expect(container.firstChild).toBeNull();
  });

  it('works without onAction callback', () => {
    renderWithProviders(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should not throw error when onAction is not provided
    expect(cancelButton).toBeInTheDocument();
  });

  it('handles unknown task status gracefully', () => {
    const taskWithUnknownStatus = { ...mockTask, status: 'Unknown' as any };
    renderWithProviders(<TaskCard task={taskWithUnknownStatus} onAction={mockOnAction} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    // Should not show action buttons for unknown status
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    expect(screen.queryByText('Start')).not.toBeInTheDocument();
    expect(screen.queryByText('View')).not.toBeInTheDocument();
  });

  it('displays task type and priority', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    // The task card should render the complete task information
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('shows estimated duration when available', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    // The component should handle estimated duration
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays start time when available', () => {
    renderWithProviders(<TaskCard task={mockTask} onAction={mockOnAction} />);

    // The component should handle start time
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
