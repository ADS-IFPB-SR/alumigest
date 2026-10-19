import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { AppRoutes } from '../../App';
import { renderWithProviders } from '../../test/test-utils';

// ── Mocks externos ──────────────────────────────────────────────────────────

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// ── Fixtures de dados (hoisted para ficarem disponíveis dentro de vi.mock) ──

const { mockOrderSummary } = vi.hoisted(() => {
  const summary = {
    id: 'order-001',
    codigo: 'PED-2026-0001',
    orcamentoId: 'orc-abc',
    orcamentoCodigo: 'ORC-2026-001',
    clienteNome: 'Cliente Teste',
    status: 'APPROVED' as const,
    canalAprovacao: 'WHATSAPP' as const,
    canalAprovacaoDescricao: 'WhatsApp',
    valorBruto: 5000,
    valorDesconto: 0,
    valorLiquido: 5000,
    dataAprovacao: '2026-10-01T10:00:00Z',
    dataPrevisaoEntrega: '2026-10-20T10:00:00Z',
    quantidadeItens: 2,
  };
  return { mockOrderSummary: summary };
});

// ── Mock da API de ordens ───────────────────────────────────────────────────

vi.mock('../../features/orders/services/ordersApi', () => ({
  ordersApi: {
    getOrders: vi.fn().mockResolvedValue({
      content: [mockOrderSummary],
      page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      totalElements: 1,
      totalPages: 1,
    }),
    getOrderById: vi.fn().mockRejectedValue(new Error('Not found')),
    cancelOrder: vi.fn(),
    convertBudget: vi.fn(),
    downloadComprovantePdf: vi.fn(),
    downloadLabelsPdf: vi.fn(),
    updateStatus: vi.fn(),
  },
  orderApi: {
    getOrders: vi.fn().mockResolvedValue({
      content: [mockOrderSummary],
      page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      totalElements: 1,
      totalPages: 1,
    }),
    getOrderById: vi.fn().mockRejectedValue(new Error('Not found')),
  },
}));

// ── Mock das APIs auxiliares (necessárias para AppRoutes compilar) ──────────

vi.mock('../../features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    getBudgets: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
    getStatusCounts: vi.fn().mockResolvedValue({}),
    getBudget: vi.fn().mockRejectedValue(new Error('not found')),
    getWindowTemplates: vi.fn().mockResolvedValue([]),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    updateBudgetStatus: vi.fn(),
  },
  extractFilenameFromContentDisposition: vi.fn((_, fallback: string) => fallback),
}));

vi.mock('../../features/catalog/services/catalogApi', () => ({
  catalogApi: {
    getGlasses: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 }),
    getProfiles: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 }),
    getFilms: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 }),
    getHardwares: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 }),
    getProducts: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 }),
  },
}));

vi.mock('../../features/customers/services/customersApi', () => ({
  customersApi: {
    getCustomers: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 }),
    createCustomer: vi.fn(),
  },
}));

// ── Testes ──────────────────────────────────────────────────────────────────

describe('Roteamento de Ordens de Serviço — BUG-039 (aliases → URL canônica)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. Rota canônica (deve continuar funcionando) ────────────────────────

  describe('Rota canônica /ordens-servico', () => {
    it('deve renderizar OrderListPage em /ordens-servico', async () => {
      renderWithProviders(<AppRoutes />, { route: '/ordens-servico' });

      expect(
        await screen.findByRole('heading', { name: /Ordens de Serviço/i, level: 2 }),
      ).toBeInTheDocument();
    });

    it('deve renderizar o estado de erro em /ordens-servico/:id inexistente', async () => {
      renderWithProviders(<AppRoutes />, { route: '/ordens-servico/order-001' });

      // O mock rejeita getOrderById → espera o estado de erro
      expect(await screen.findByTestId('order-detail-error')).toBeInTheDocument();
      expect(screen.getByText(/Ordem de Serviço não encontrada/i)).toBeInTheDocument();
    });
  });

  // ── 2. Alias /pedidos → deve redirecionar para /ordens-servico ───────────

  describe('Alias /pedidos → /ordens-servico', () => {
    it('deve redirecionar /pedidos para /ordens-servico (lista)', async () => {
      renderWithProviders(<AppRoutes />, { route: '/pedidos' });

      // Após o redirect, deve renderizar a OrderListPage canônica
      expect(
        await screen.findByRole('heading', { name: /Ordens de Serviço/i, level: 2 }),
      ).toBeInTheDocument();
    });

    it('deve redirecionar /pedidos/:id para /ordens-servico/:id preservando o identificador', async () => {
      renderWithProviders(<AppRoutes />, { route: '/pedidos/order-001' });

      // Após o redirect para /ordens-servico/order-001, o mock rejeita → estado de erro da detalhe
      expect(await screen.findByTestId('order-detail-error')).toBeInTheDocument();
      expect(screen.getByText(/Ordem de Serviço não encontrada/i)).toBeInTheDocument();
    });
  });

  // ── 3. Alias /work-orders → deve redirecionar para /ordens-servico ───────

  describe('Alias /work-orders → /ordens-servico', () => {
    it('deve redirecionar /work-orders para /ordens-servico (lista)', async () => {
      renderWithProviders(<AppRoutes />, { route: '/work-orders' });

      expect(
        await screen.findByRole('heading', { name: /Ordens de Serviço/i, level: 2 }),
      ).toBeInTheDocument();
    });

    it('deve redirecionar /work-orders/:id para /ordens-servico/:id preservando o identificador', async () => {
      renderWithProviders(<AppRoutes />, { route: '/work-orders/order-001' });

      // Após o redirect para /ordens-servico/order-001, o mock rejeita → estado de erro da detalhe
      expect(await screen.findByTestId('order-detail-error')).toBeInTheDocument();
      expect(screen.getByText(/Ordem de Serviço não encontrada/i)).toBeInTheDocument();
    });
  });

  // ── 4. Garantia de unicidade: aliases não duplicam conteúdo ─────────────

  describe('Sem duplicação de conteúdo após redirect', () => {
    it('/pedidos não deve renderizar dois cabeçalhos "Ordens de Serviço"', async () => {
      renderWithProviders(<AppRoutes />, { route: '/pedidos' });

      const headings = await screen.findAllByRole('heading', {
        name: /Ordens de Serviço/i,
        level: 2,
      });

      expect(headings).toHaveLength(1);
    });

    it('/work-orders não deve renderizar dois cabeçalhos "Ordens de Serviço"', async () => {
      renderWithProviders(<AppRoutes />, { route: '/work-orders' });

      const headings = await screen.findAllByRole('heading', {
        name: /Ordens de Serviço/i,
        level: 2,
      });

      expect(headings).toHaveLength(1);
    });
  });
});
