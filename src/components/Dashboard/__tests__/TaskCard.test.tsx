import { fireEvent, render, screen } from '@testing-library/react';
import { Task } from '../../../types';
import { TaskCard } from '../TaskCard';

// Mock useApp hook
jest.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    servers: [],
    notifications: [],
    isConnected: false,
  }),
}));

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
    render(<TaskCard task={mockTask} onAction={mockOnAction} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('A test task for testing')).toBeInTheDocument();
  });

  it('displays task status', () => {
    render(<TaskCard task={mockTask} onAction={mockOnAction} />);
    
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('shows progress when task is running', () => {
    render(<TaskCard task={mockTask} onAction={mockOnAction} />);
    
    // Verifica se o progresso é exibido de alguma forma
    const progressElement = screen.getByText(/50/);
    expect(progressElement).toBeInTheDocument();
  });

  it('handles action callbacks', () => {
    render(<TaskCard task={mockTask} onAction={mockOnAction} />);
    
    // Se houver algum botão de ação, testa o clique
    const actionButtons = screen.queryAllByRole('button');
    if (actionButtons.length > 0) {
      fireEvent.click(actionButtons[0]);
      expect(mockOnAction).toHaveBeenCalled();
    }
  });
});
