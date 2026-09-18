import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetEditor } from '../../../features/budgets/components/BudgetEditor';
import { renderWithProviders } from '../../../test/test-utils';

// Hoisted mocks para Vitest
const {
  mockNavigate,
  mockToast,
  mockCustomers,
  mockState,
} = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockToast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    mockCustomers: [
      {
        id: 'cust-1',
        nomeCompleto: 'Carlos Eduardo Ferreira',
        documento: '123.456.789-00',
        telefone: '(83) 98888-1111',
        cidade: 'Sousa',
        uf: 'PB',
        logradouro: 'Rua Coronel José Vicente',
        numero: '150',
        bairro: 'Centro',
        ativo: true,
      },
      {
        id: 'cust-2',
        nomeCompleto: 'Vidros e Alumínios Sertão LTDA',
        documento: '12.345.678/0001-90',
        telefone: '(83) 3522-2222',
        cidade: 'Cajazeiras',
        uf: 'PB',
        ativo: true,
      },
    ],
    mockState: {
      params: {} as { id?: string },
      existingBudget: null as any,
      createBudgetMutate: vi.fn(),
      updateBudgetMutate: vi.fn(),
    },
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockState.params,
  };
});

vi.mock('react-hot-toast', () => ({
  default: mockToast,
}));

vi.mock('../../../features/customers/hooks/useCustomers', () => ({
  useCustomers: () => ({
    data: { content: mockCustomers, totalElements: 2 },
    isLoading: false,
  }),
  useCreateCustomer: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../../../features/budgets/hooks/useBudgets', () => ({
  useCreateBudget: () => ({
    mutate: mockState.createBudgetMutate,
    isPending: false,
  }),
  useUpdateBudget: () => ({
    mutate: mockState.updateBudgetMutate,
    isPending: false,
  }),
  useBudget: () => ({
    data: mockState.existingBudget,
    isLoading: false,
  }),
}));

// Mock dos modais do Builder/Catalog para isolar o teste do Editor
vi.mock('../../../features/budgets/components/builder/ProductPickerModal', () => ({
  ProductPickerModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="product-picker-modal">Modal de Produtos</div> : null,
}));

vi.mock('../../../features/budgets/components/builder/WindowBuilderModal', () => ({
  WindowBuilderModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="window-builder-modal">Modal do Builder</div> : null,
}));

describe('BudgetEditor — [US-09.33] Alinhamento com Seleção de Cliente e Notas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.params = {};
    mockState.existingBudget = null;
  });

  it('deve renderizar o editor em modo de criação com CustomerSelector ativo e botão de adicionar esquadria desabilitado', () => {
    renderWithProviders(<BudgetEditor />);

    expect(screen.getByRole('heading', { name: /Novo Orçamento/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar cliente por nome ou documento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Cliente/i })).toBeInTheDocument();

    // Botão de adicionar esquadria deve estar desabilitado sem cliente
    const btnAddWindows = screen.getAllByRole('button', { name: /Adicionar Esquadria/i });
    expect(btnAddWindows[0]).toBeDisabled();
  });

  it('deve selecionar um cliente no CustomerSelector e refletir os dados no card do orçamento', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BudgetEditor />);

    const searchInput = screen.getByPlaceholderText(/Buscar cliente por nome ou documento/i);
    await user.click(searchInput);

    // O dropdown de clientes deve aparecer com Carlos Eduardo
    const customerOption = await screen.findByText('Carlos Eduardo Ferreira');
    expect(customerOption).toBeInTheDocument();

    await user.click(customerOption);

    // Deve exibir o card do cliente selecionado com dados refletidos
    await waitFor(() => {
      expect(screen.getByText('Carlos Eduardo Ferreira')).toBeInTheDocument();
      expect(screen.getByText(/Doc: 123.456.789-00/i)).toBeInTheDocument();
      expect(screen.getByText(/Tel: \(83\) 98888-1111/i)).toBeInTheDocument();
      expect(screen.getByText(/Endereço: Sousa, PB/i)).toBeInTheDocument();
    });

    // O botão de adicionar esquadria agora deve estar habilitado
    const btnAddWindows = screen.getAllByRole('button', { name: /Adicionar Esquadria/i });
    expect(btnAddWindows[0]).toBeEnabled();
  });

  it('deve permitir desvincular o cliente selecionado através do botão de limpar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BudgetEditor />);

    // 1. Seleciona o cliente
    const searchInput = screen.getByPlaceholderText(/Buscar cliente por nome ou documento/i);
    await user.click(searchInput);
    const customerOption = await screen.findByText('Carlos Eduardo Ferreira');
    await user.click(customerOption);

    expect(await screen.findByText('Carlos Eduardo Ferreira')).toBeInTheDocument();

    // 2. Clica no botão de trocar/remover cliente
    const btnClear = screen.getByRole('button', { name: /Trocar cliente/i });
    await user.click(btnClear);

    // 3. Deve voltar a exibir o campo de busca e desabilitar o botão de esquadrias
    expect(screen.getByPlaceholderText(/Buscar cliente por nome ou documento/i)).toBeInTheDocument();
    expect(screen.queryByText(/Endereço: Sousa, PB/i)).not.toBeInTheDocument();
    const btnAddWindows = screen.getAllByRole('button', { name: /Adicionar Esquadria/i });
    expect(btnAddWindows[0]).toBeDisabled();
  });

  it('deve permitir preencher observações gerais e condições comerciais no formulário', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BudgetEditor />);

    // Localiza campos de observações e condições comerciais
    const notesTextarea = screen.getByLabelText(/Observações/i);
    await user.type(notesTextarea, 'Cliente solicitou entrega urgente na terça-feira.');
    expect(notesTextarea).toHaveValue('Cliente solicitou entrega urgente na terça-feira.');

    const conditionsTextarea = screen.getByLabelText(/Condições Comerciais/i);
    await user.type(conditionsTextarea, 'Pagamento em 3x sem juros no cartão.');
    expect(conditionsTextarea).toHaveValue('Pagamento em 3x sem juros no cartão.');
  });

  it('deve carregar os dados de cliente e observações ao editar um orçamento existente', () => {
    mockState.params = { id: 'budget-abc-123' };
    mockState.existingBudget = {
      id: 'budget-abc-123',
      code: 'ORC-2026-089',
      clientId: 'cust-1',
      clientName: 'Carlos Eduardo Ferreira',
      customer: {
        id: 'cust-1',
        name: 'Carlos Eduardo Ferreira',
        document: '123.456.789-00',
        phone: '(83) 98888-1111',
        address: 'Rua Coronel José Vicente, 150',
      },
      discountPercent: 5,
      notes: 'Observações de teste pré-existentes',
      commercialConditions: 'Entrada de 50%',
      validUntil: '2026-10-30T00:00:00Z',
      items: [],
    };

    renderWithProviders(<BudgetEditor />);

    // Deve exibir o cabeçalho de edição com o código do orçamento
    expect(screen.getByRole('heading', { name: /Editar Orçamento ORC-2026-089/i })).toBeInTheDocument();

    // Deve carregar os dados do cliente no card
    expect(screen.getByText('Carlos Eduardo Ferreira')).toBeInTheDocument();
    expect(screen.getByText(/Doc: 123.456.789-00/i)).toBeInTheDocument();

    // Deve preencher as observações no formulário
    expect(screen.getByLabelText(/Observações/i)).toHaveValue(
      'Observações de teste pré-existentes',
    );
  });

  it('deve abrir o ProductPickerModal ao clicar em Adicionar Esquadria com cliente selecionado', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BudgetEditor />);

    // Seleciona cliente
    const searchInput = screen.getByPlaceholderText(/Buscar cliente por nome ou documento/i);
    await user.click(searchInput);
    const customerOption = await screen.findByText('Carlos Eduardo Ferreira');
    await user.click(customerOption);

    // Clica em adicionar esquadria
    const btnAddWindows = screen.getAllByRole('button', { name: /Adicionar Esquadria/i });
    await user.click(btnAddWindows[0]);

    expect(screen.getByTestId('product-picker-modal')).toBeInTheDocument();
  });

  it('deve refletir a condição de pagamento selecionada no resumo financeiro em tempo real', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BudgetEditor />);

    const summaryCard = screen.getByTestId('budget-financial-summary');
    // Estado inicial: fallback informativo padrão
    expect(summaryCard).toHaveTextContent('A combinar no fechamento');

    // Seleciona a condição de pagamento no formulário
    const paymentSelect = screen.getByLabelText(/Condição de Pagamento/i);
    await user.selectOptions(paymentSelect, 'A_VISTA_PIX');

    // Verifica se o resumo financeiro exibiu o rótulo mapeado
    expect(summaryCard).toHaveTextContent('À Vista (PIX / Dinheiro)');
    expect(summaryCard).not.toHaveTextContent('A combinar no fechamento');

    // Altera para outra opção e confirma atualização imediata
    await user.selectOptions(paymentSelect, 'CARTAO_12X');
    expect(summaryCard).toHaveTextContent('Cartão de Crédito até 12x');
  });
});

