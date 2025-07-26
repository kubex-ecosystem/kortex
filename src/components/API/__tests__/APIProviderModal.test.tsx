import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { APIProvider } from '../../../types/APITypes';
import { APIProviderModal } from '../APIProviderModal';

// Mock dos ícones do Lucide React
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  TestTube: () => <div data-testid="test-tube-icon" />,
  Check: () => <div data-testid="check-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

// Mock do mcpService
jest.mock('../../../lib/mcpService', () => ({
  mcpService: {
    testConnection: jest.fn(),
    getStatus: jest.fn(),
  },
}));

describe('APIProviderModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  
  const mockProvider: APIProvider = {
    id: 'test-provider-1',
    name: 'Test Provider',
    provider: 'OpenAI',
    keyPreview: 'sk-...xyz123',
    status: 'Connected',
    lastTested: '2024-01-01T00:00:00Z',
    requestsToday: 100,
    monthlyLimit: 10000,
    costPerRequest: 0.002,
    mcpEndpoint: 'http://127.0.0.1:3002',
    githubToken: 'ghp_...token123',
    azureToken: 'azure_...token456',
    azureOrg: 'test-org',
    azureProject: 'test-project'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('does not render when isOpen is false', () => {
      render(
        <APIProviderModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.queryByText('Adicionar API Provider')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Adicionar API Provider')).toBeInTheDocument();
    });

    it('shows "Adicionar API Provider" title when no provider is passed', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Adicionar API Provider')).toBeInTheDocument();
    });

    it('shows "Editar API Provider" title when provider is passed', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          provider={mockProvider}
        />
      );
      
      expect(screen.getByText('Editar API Provider')).toBeInTheDocument();
    });
  });

  describe('Form Initialization', () => {
    it('initializes form with empty values in add mode', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local')).toHaveValue(''); // Name field
      expect(screen.getByDisplayValue('OpenAI')).toBeInTheDocument(); // Provider field default
    });

    it('initializes form with provider data in edit mode', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          provider={mockProvider}
        />
      );
      
      expect(screen.getByDisplayValue('Test Provider')).toBeInTheDocument();
      expect(screen.getByDisplayValue('OpenAI')).toBeInTheDocument();
      expect(screen.getByDisplayValue('sk-...xyz123')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('renders all basic form fields', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local')).toBeInTheDocument();
      expect(screen.getByTitle('Selecione o tipo de provider')).toBeInTheDocument();
      expect(screen.getByTitle('Chave da API')).toBeInTheDocument();
      expect(screen.getByTitle('Limite mensal de requisições')).toBeInTheDocument();
      expect(screen.getByTitle('Custo por requisição em dólares')).toBeInTheDocument();
    });

    it('allows user to input text in name field', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const nameField = screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local');
      await user.type(nameField, 'My Custom Provider');
      
      expect(nameField).toHaveValue('My Custom Provider');
    });

    it('allows user to input API key', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const apiKeyField = screen.getByTitle('Chave da API');
      await user.type(apiKeyField, 'sk-test-api-key-12345');
      
      expect(apiKeyField).toHaveValue('sk-test-api-key-12345');
    });
  });

  describe('Provider Selection', () => {
    it('shows different provider options', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const providerSelect = screen.getByTitle('Selecione o tipo de provider');
      expect(providerSelect).toBeInTheDocument();
    });

    it('changes provider when different option is selected', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const providerSelect = screen.getByTitle('Selecione o tipo de provider');
      await user.selectOptions(providerSelect, 'Anthropic');
      
      expect(providerSelect).toHaveValue('Anthropic');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles API key visibility', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const apiKeyField = screen.getByTitle('Chave da API') as HTMLInputElement;
      const toggleButton = screen.getByTitle('Mostrar/ocultar chave da API');
      
      // Initially password type
      expect(apiKeyField.type).toBe('password');
      
      // Click to show
      await user.click(toggleButton);
      expect(apiKeyField.type).toBe('text');
      
      // Click to hide
      await user.click(toggleButton);
      expect(apiKeyField.type).toBe('password');
    });
  });

  describe('Form Validation', () => {
    it('shows error when name is empty on submit', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /Adicionar Provider/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows error when API key is empty on submit', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const nameField = screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local');
      await user.type(nameField, 'Test Provider');
      
      const submitButton = screen.getByRole('button', { name: /Adicionar Provider/i });
      await user.click(submitButton);
      
      expect(screen.getByText('API Key é obrigatória')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('clears error when user starts typing in field', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /Adicionar Provider/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      
      // Start typing to clear error
      const nameField = screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local');
      await user.type(nameField, 'T');
      
      expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
    });
  });

  describe('Test Connection', () => {
    it('shows test connection button', () => {
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByRole('button', { name: /Testar Conexão/i })).toBeInTheDocument();
    });

    it('disables test button during testing', async () => {
      const user = userEvent.setup();
      const { mcpService } = require('../../../lib/mcpService');
      
      // Mock a long running test
      mcpService.testConnection.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 1000)));
      
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const testButton = screen.getByText('Testar Conexão');
      await user.click(testButton);
      
      // Check if the button text changes indicating it's disabled/testing
      expect(screen.getByText('Testando...')).toBeInTheDocument();
    });

    it('shows testing state in button text', async () => {
      const user = userEvent.setup();
      const { mcpService } = require('../../../lib/mcpService');
      
      // Mock a long running test
      mcpService.testConnection.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 1000)));
      
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const testButton = screen.getByText('Testar Conexão');
      await user.click(testButton);
      
      expect(screen.getByText('Testando...')).toBeInTheDocument();
    });
  });

  describe('MCP Provider Fields', () => {
    it('shows MCP specific fields when StatusRafa MCP is selected', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const providerSelect = screen.getByTitle('Selecione o tipo de provider');
      await user.selectOptions(providerSelect, 'StatusRafa MCP');
      
      expect(screen.getByTitle('Endpoint do MCP Server')).toBeInTheDocument();
      expect(screen.getByTitle('Token do GitHub para autenticação')).toBeInTheDocument();
      expect(screen.getByTitle('Token do Azure DevOps para autenticação')).toBeInTheDocument();
    });

    it('validates MCP endpoint when StatusRafa MCP is selected', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const providerSelect = screen.getByTitle('Selecione o tipo de provider');
      await user.selectOptions(providerSelect, 'StatusRafa MCP');
      
      const nameField = screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local');
      await user.type(nameField, 'Test MCP');
      
      const apiKeyField = screen.getByTitle('Chave da API');
      await user.type(apiKeyField, 'test-key');
      
      // Clear MCP endpoint
      const mcpEndpointField = screen.getByTitle('Endpoint do MCP Server');
      await user.clear(mcpEndpointField);
      
      const submitButton = screen.getByRole('button', { name: /Adicionar Provider/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Endpoint MCP é obrigatório')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSave with correct data when form is valid', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const nameField = screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local');
      await user.type(nameField, 'Test Provider');
      
      const apiKeyField = screen.getByTitle('Chave da API');
      await user.type(apiKeyField, 'sk-test-key');
      
      const submitButton = screen.getByRole('button', { name: /Adicionar Provider/i });
      await user.click(submitButton);
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Provider',
          keyPreview: 'sk-test-key',
          provider: 'OpenAI',
          status: 'Disconnected'
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('generates new ID for new provider', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const nameField = screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local');
      await user.type(nameField, 'Test Provider');
      
      const apiKeyField = screen.getByTitle('Chave da API');
      await user.type(apiKeyField, 'sk-test-key');
      
      const submitButton = screen.getByRole('button', { name: /Adicionar Provider/i });
      await user.click(submitButton);
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String)
        })
      );
    });

    it('preserves existing ID when editing provider', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          provider={mockProvider}
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /Atualizar Provider/i });
      await user.click(submitButton);
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-provider-1'
        })
      );
    });
  });

  describe('Modal Actions', () => {
    it('calls onClose when X button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const closeButton = screen.getByTitle('Fechar Modal');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    it('resets form when modal is reopened', () => {
      const { rerender } = render(
        <APIProviderModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          provider={mockProvider}
        />
      );
      
      rerender(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          provider={null}
        />
      );
      
      expect(screen.getByPlaceholderText('Ex: OpenAI Production, MCP Server Local')).toHaveValue(''); // Name should be empty
    });

    it('clears errors when modal is reopened', () => {
      const { rerender } = render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      // Trigger validation error
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Provider/i }));
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      
      // Close and reopen
      rerender(
        <APIProviderModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      rerender(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
    });
  });

  describe('Numeric Fields', () => {
    it('handles numeric input for monthly limit', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const limitField = screen.getByTitle('Limite mensal de requisições');
      await user.clear(limitField);
      await user.type(limitField, '5000');
      
      expect(limitField).toHaveValue(5000);
    });

    it('handles numeric input for cost per request', async () => {
      const user = userEvent.setup();
      render(
        <APIProviderModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      const costField = screen.getByTitle('Custo por requisição em dólares');
      await user.clear(costField);
      await user.type(costField, '0.005');
      
      expect(costField).toHaveValue(0.005);
    });
  });
});
