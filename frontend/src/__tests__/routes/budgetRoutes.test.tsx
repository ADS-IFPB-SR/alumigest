import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { AppRoutes } from '../../App';
import { renderWithProviders } from '../../test/test-utils';

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock de dados de teste usando vi.hoisted para evitar erro de hoisting no vi.mock
const { mockBudgetSummary, mockBudgetDetail } = vi.hoisted(() => {
  const summary = {
    id: 'budget-101',
    code: 'ORC-2026-001',
    customerName: 'João da Silva',
    customer: {
      id: 'cust-1',
      name: 'João da Silva',
    },
    createdAt: '2026-09-10T10:00:00Z',
    validUntil: '2026-09-25T10:00:00Z',
    itemCount: 1,
    total: 4500.0,
    status: 'DRAFT' as const,
  };

  const detail = {
    id: 'budget-101',
    code: 'ORC-2026-001',
    customerId: 'cust-1',
    customerName: 'João da Silva',
    customer: {
      id: 'cust-1',
      name: 'João da Silva',
      document: '123.456.789-00',
      phone: '(83) 99999-9999',
      address: 'Rua das Flores, 100',
    },
    status: 'DRAFT' as const,
    subtotal: 4500,
    discountPercent: 0,
    discountValue: 0,
    total: 4500,
    laborCost: 500,
    notes: 'Orçamento de teste',
    commercialConditions: 'Condições à vista',
    validUntil: '2026-09-25T10:00:00Z',
    createdAt: '2026-09-10T10:00:00Z',
    items: [
      {
        id: 'item-1',
        productId: 1,
        productName: 'Porta de Correr 2 Folhas Prime',
        width: 2000,
        height: 2100,
        quantity: 1,
        subtotal: 4500,
        laborCost: 500,
        templateType: 'SLIDING_DOOR_2F' as const,
        templateConfig: {
          openingDirection: 'LEFT_TO_RIGHT',
          aluminumColor: 'Preto',
          glassFinish: 'Incolor',
        },
        handleConfig: { handleType: 'NONE' },
        drillingConfig: { holeCount: 0, divisionType: 'EQUAL' },
        options: [],
      },
    ],
  };

  return { mockBudgetSummary: summary, mockBudgetDetail: detail };
});

// Mock das APIs
vi.mock('../../features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    getBudgets: vi.fn().mockResolvedValue({
      content: [mockBudgetSummary],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
    }),
    getStatusCounts: vi.fn().mockResolvedValue({
      DRAFT: 1,
      SENT: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
      EXPIRED: 0,
    }),
    getBudget: vi.fn((id: string) => {
      if (id === 'budget-101') {
        return Promise.resolve(mockBudgetDetail);
      }
      return Promise.reject(new Error('Budget not found'));
    }),
    getWindowTemplates: vi.fn().mockResolvedValue([]),
    createBudget: vi.fn().mockResolvedValue({ id: 'budget-new', code: 'ORC-2026-002' }),
    updateBudget: vi.fn().mockResolvedValue(mockBudgetDetail),
    deleteBudget: vi.fn().mockResolvedValue({}),
    updateBudgetStatus: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../features/catalog/services/catalogApi', () => ({
  catalogApi: {
    getGlasses: vi.fn().mockResolvedValue({
      content: [{ id: 1, name: 'Vidro Temperado 8mm', skuCode: 'VID-01', active: true }],
      totalElements: 1,
      totalPages: 1,
    }),
    getProfiles: vi.fn().mockResolvedValue({
      content: [{ id: 1, commercialReference: 'LG-001', name: 'Perfil Linha Gold', active: true }],
      totalElements: 1,
      totalPages: 1,
    }),
    getFilms: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
    }),
    getHardwares: vi.fn().mockResolvedValue({
      content: [{ id: 1, skuCode: 'ESQ-01', name: 'Esquadreta Central', active: true }],
      totalElements: 1,
      totalPages: 1,
    }),
    getProducts: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
    }),
  },
}));

vi.mock('../../features/customers/services/customersApi', () => ({
  customersApi: {
    getCustomers: vi.fn().mockResolvedValue({
      content: [
        {
          id: 'cust-1',
          nomeCompleto: 'João da Silva',
          personType: 'FISICA',
          documento: '123.456.789-00',
          telefone: '(83) 99999-9999',
          ativo: true,
        },
      ],
      totalElements: 1,
      totalPages: 1,
    }),
    createCustomer: vi.fn().mockResolvedValue({
      id: 'cust-new',
      nomeCompleto: 'Maria Souza',
      ativo: true,
    }),
  },
}));

describe('Integridade das Rotas de Orçamentos (AppRoutes)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização direta de cada rota de orçamentos', () => {
    it('1. deve renderizar BudgetsPage na rota /orcamentos', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos' });

      // Deve renderizar título principal de orçamentos
      expect(
        await screen.findByRole('heading', { name: /Orçamentos/i, level: 2 }),
      ).toBeInTheDocument();

      // Botão de novo orçamento deve estar visível
      expect(screen.getByRole('button', { name: /Novo Orçamento/i })).toBeInTheDocument();

      // Deve exibir os dados do orçamento mockado na tabela
      expect(await screen.findByText('ORC-2026-001')).toBeInTheDocument();
      expect(screen.getByText('João da Silva')).toBeInTheDocument();
    });

    it('2. deve renderizar BudgetNewPage (BudgetEditor em modo criação) na rota /orcamentos/novo', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/novo' });

      // Título da página de criação
      expect(
        await screen.findByRole('heading', { name: 'Novo Orçamento', level: 1 }),
      ).toBeInTheDocument();

      // Seções do formulário de criação
      expect(screen.getByRole('heading', { name: 'Cliente', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Esquadrias/i, level: 2 })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Condições e Resumo', level: 2 }),
      ).toBeInTheDocument();
    });

    it('3. deve renderizar BudgetDetailPage na rota /orcamentos/:id', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/budget-101' });

      // Deve exibir o código do orçamento no cabeçalho
      expect(await screen.findByRole('heading', { name: 'ORC-2026-001', level: 1 })).toBeInTheDocument();

      // Deve exibir os detalhes do cliente e esquadrias
      expect(screen.getByText('João da Silva')).toBeInTheDocument();
      expect(screen.getByText('Porta de Correr 2 Folhas Prime')).toBeInTheDocument();

      // Deve conter os botões de ação na barra
      expect(screen.getByRole('button', { name: /WhatsApp/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /PDF Comercial/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Via Técnica/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Duplicar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Novo/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Imprimir/i })).not.toBeInTheDocument();
    });

    it('4. deve renderizar BudgetEditor na rota /orcamentos/:id/editar', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/budget-101/editar' });

      // Deve exibir o título de edição com o código do orçamento
      expect(
        await screen.findByRole('heading', {
          name: /Editar Orçamento ORC-2026-001/i,
          level: 1,
        }),
      ).toBeInTheDocument();

      // Cliente já vinculado deve aparecer
      expect(await screen.findByText('Cliente Vinculado')).toBeInTheDocument();
      expect(screen.getByText('João da Silva')).toBeInTheDocument();
    });

    it('5. deve renderizar SeparateSalePage na rota /orcamentos/venda-avulsa', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/venda-avulsa' });

      // Deve exibir o título da página de venda avulsa
      expect(
        await screen.findByRole('heading', { name: 'Venda das Partes', level: 2 }),
      ).toBeInTheDocument();

      // Deve exibir os seletores de tipo de venda
      expect(screen.getByRole('button', { name: /Venda de Vidro/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Venda de Alumínio/i })).toBeInTheDocument();
    });
  });

  describe('Precedência de rotas (evitar colisão com :id dinâmico)', () => {
    it('não deve interpretar /orcamentos/novo como parâmetro :id da página de detalhes', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/novo' });

      // Deve renderizar Novo Orçamento e NÃO a página de detalhes
      expect(
        await screen.findByRole('heading', { name: 'Novo Orçamento', level: 1 }),
      ).toBeInTheDocument();
      expect(screen.queryByText('Orçamento não encontrado')).not.toBeInTheDocument();
    });

    it('não deve interpretar /orcamentos/venda-avulsa como parâmetro :id da página de detalhes', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/venda-avulsa' });

      // Deve renderizar Venda das Partes e NÃO a página de detalhes
      expect(
        await screen.findByRole('heading', { name: 'Venda das Partes', level: 2 }),
      ).toBeInTheDocument();
      expect(screen.queryByText('Orçamento não encontrado')).not.toBeInTheDocument();
    });
  });

  describe('Fluxos de navegação integrada entre rotas', () => {
    it('deve navegar de /orcamentos para /orcamentos/novo ao clicar em "Novo Orçamento"', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos' });

      const newBudgetBtn = await screen.findByRole('button', { name: /Novo Orçamento/i });
      fireEvent.click(newBudgetBtn);

      // Deve navegar para a página de criação
      expect(
        await screen.findByRole('heading', { name: 'Novo Orçamento', level: 1 }),
      ).toBeInTheDocument();
    });

    it('deve navegar de /orcamentos para /orcamentos/:id ao clicar em uma linha da tabela', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos' });

      const budgetRowCode = await screen.findByText('ORC-2026-001');
      fireEvent.click(budgetRowCode);

      // Deve navegar para a página de detalhes do orçamento
      expect(
        await screen.findByRole('heading', { name: 'ORC-2026-001', level: 1 }),
      ).toBeInTheDocument();
      expect(screen.getByText('João da Silva')).toBeInTheDocument();
    });

    it('deve navegar de /orcamentos/:id para /orcamentos/:id/editar ao clicar no botão "Editar"', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/budget-101' });

      const editBtn = await screen.findByRole('button', { name: /Editar/i });
      fireEvent.click(editBtn);

      // Deve navegar para o editor em modo edição
      expect(
        await screen.findByRole('heading', {
          name: /Editar Orçamento ORC-2026-001/i,
          level: 1,
        }),
      ).toBeInTheDocument();
    });

    it('deve navegar de /orcamentos/:id de volta para /orcamentos ao clicar no link de retorno', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/budget-101' });

      // O link de retorno "Orçamentos"
      const backLink = await screen.findByTitle('Voltar aos orçamentos');
      fireEvent.click(backLink);

      // Deve retornar para a listagem
      expect(
        await screen.findByRole('heading', { name: /Orçamentos/i, level: 2 }),
      ).toBeInTheDocument();
    });

    it('deve navegar de /orcamentos/novo de volta para /orcamentos ao clicar em "Cancelar"', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/novo' });

      const cancelBtn = await screen.findByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelBtn);

      // Deve retornar para a listagem
      expect(
        await screen.findByRole('heading', { name: /Orçamentos/i, level: 2 }),
      ).toBeInTheDocument();
    });

    it('deve navegar de /orcamentos/:id/editar de volta para /orcamentos/:id ao clicar em "Cancelar"', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/budget-101/editar' });

      const cancelBtn = await screen.findByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelBtn);

      // Deve retornar para a página de detalhes
      expect(
        await screen.findByRole('heading', { name: 'ORC-2026-001', level: 1 }),
      ).toBeInTheDocument();
    });
  });

  describe('Tratamento de rotas inexistentes (404 / Placeholder)', () => {
    it('deve renderizar PlaceholderPage em rotas não mapeadas sem falhas', async () => {
      renderWithProviders(<AppRoutes />, { route: '/orcamentos/rota-inexistente/subrota-desconhecida' });

      expect(
        await screen.findByRole('heading', { name: 'Página em Desenvolvimento', level: 2 }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Esta funcionalidade está programada para implementação/i),
      ).toBeInTheDocument();
    });
  });
});
