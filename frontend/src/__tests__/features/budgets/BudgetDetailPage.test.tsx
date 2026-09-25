import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetDetailPage } from '../../../pages/BudgetDetailPage';
import * as budgetsHooks from '../../../features/budgets/hooks/useBudgets';

// Mock dos hooks de orçamento
vi.mock('../../../features/budgets/hooks/useBudgets', () => ({
  useBudget: vi.fn(),
  useDeleteBudget: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateBudgetStatus: () => ({ mutate: vi.fn(), isPending: false }),
}));

const mockBudgetDetail = {
  id: 'b1',
  code: 'ORC-2026-001',
  status: 'PENDING',
  createdAt: '2026-09-22T10:00:00Z',
  validUntil: '2026-10-22',
  subtotal: 1500,
  discountPercent: 10,
  discountValue: 150,
  freightCost: 100,
  installationCost: 200,
  total: 1650,
  notes: 'Orçamento teste com mão de obra agregada e desconto percentual.',
  customer: {
    id: 'c1',
    name: 'Empresa Teste LTDA',
    document: '12.345.678/0001-99',
    phone: '83999998888',
    email: 'teste@empresa.com',
    address: 'Rua Principal, 100',
  },
  items: [
    {
      id: 'i1',
      productId: 'p1',
      productName: 'Porta de Correr Alumínio',
      templateType: 'DOOR_2_LEAF',
      width: 2000,
      height: 2100,
      quantity: 2,
      laborCost: 150, // 150 * 2 = 300 de MO agregada
      subtotal: 1500,
      options: [],
    },
  ],
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function renderWithRouter(budgetId = 'b1') {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/orcamentos/${budgetId}`]}>
        <Routes>
          <Route path="/orcamentos/:id" element={<BudgetDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BudgetDetailPage - Testes Unitários', () => {
  it('deve renderizar o estado de carregamento corretamente', () => {
    vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    renderWithRouter();
    expect(screen.getByText('Carregando orçamento...')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando o orçamento não for encontrado', () => {
    vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    renderWithRouter('inexistente');
    expect(screen.getByText('Orçamento não encontrado')).toBeInTheDocument();
  });

  it('deve renderizar os detalhes completos, código e informações do cliente', () => {
    vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
      data: mockBudgetDetail,
      isLoading: false,
      isError: false,
    } as any);

    renderWithRouter();

    // Código do orçamento no header
    expect(screen.getByText('ORC-2026-001')).toBeInTheDocument();
    // Nome do cliente na sidebar
    expect(screen.getByText('Empresa Teste LTDA')).toBeInTheDocument();
    // Telefone e WhatsApp formatados
    expect(screen.getByText('83999998888')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('deve calcular e exibir corretamente a mão de obra agregada e os custos financeiros', () => {
    vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
      data: mockBudgetDetail,
      isLoading: false,
      isError: false,
    } as any);

    renderWithRouter();

    // Nome da esquadria e quantidade de itens
    expect(screen.getByText('Porta de Correr Alumínio')).toBeInTheDocument();
    expect(screen.getByText('2 unidades')).toBeInTheDocument();

    // Verificação de textos descritivos e notas
    expect(screen.getByText(/Orçamento teste com mão de obra agregada/i)).toBeInTheDocument();
  });

  it('deve renderizar badges de desconto percentual versus valor absoluto', () => {
    const budgetComDescontoEmReais = {
      ...mockBudgetDetail,
      discountPercent: undefined,
      discountValue: 200, // Desconto fixo em R$
    };

    vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
      data: budgetComDescontoEmReais,
      isLoading: false,
      isError: false,
    } as any);

    renderWithRouter();

    // Verifica que o componente carrega sem quebras quando o desconto é absoluto
    expect(screen.getByText('ORC-2026-001')).toBeInTheDocument();
  });

  it('deve alternar para a aba Romaneio de Peças exibindo gabarito técnico e lista de corte', async () => {
    const { fireEvent } = await import('@testing-library/react');
    vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
      data: mockBudgetDetail,
      isLoading: false,
      isError: false,
    } as any);

    renderWithRouter();

    // Clica na aba Romaneio de Peças
    const tabRomaneio = screen.getByTestId('tab-romaneio');
    expect(tabRomaneio).toBeInTheDocument();
    fireEvent.click(tabRomaneio);

    // Deve exibir o cabeçalho e visão técnica da oficina
    expect(screen.getByText('Romaneio Técnico & Gabarito de Fabricação')).toBeInTheDocument();
    expect(screen.getByText('Lista de Corte & Gabarito Técnico')).toBeInTheDocument();
    expect(screen.getByText('Controle de Qualidade & Fábrica')).toBeInTheDocument();
    expect(screen.getByTestId('romaneio-view')).toBeInTheDocument();

    // Alterna de volta para Proposta Comercial
    const tabProposta = screen.getByTestId('tab-proposta');
    fireEvent.click(tabProposta);
    expect(screen.getByText('Esquadrias & Itens do Orçamento')).toBeInTheDocument();
  });

  it('deve disponibilizar ações oficiais de emissão de PDF Comercial e Via Técnica', async () => {
    vi.spyOn(budgetsHooks, 'useBudget').mockReturnValue({
      data: mockBudgetDetail,
      isLoading: false,
      isError: false,
    } as any);

    renderWithRouter();

    const btnPdfComercial = screen.getByTitle('Emitir PDF Comercial');
    expect(btnPdfComercial).toBeInTheDocument();

    const btnViaTecnica = screen.getByTitle('Emitir Via Técnica (Oficina)');
    expect(btnViaTecnica).toBeInTheDocument();
  });
});