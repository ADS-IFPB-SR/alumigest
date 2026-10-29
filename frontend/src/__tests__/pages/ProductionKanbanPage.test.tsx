import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductionKanbanPage } from '../../pages/ProductionKanbanPage';
import { useProductionKanban } from '../../features/production/hooks/useProductionKanban';
import type { OrderSummary } from '../../features/orders/types';

// Mock do hook de produção para termos controle total dos dados e estados nos testes
vi.mock('../../features/production/hooks/useProductionKanban', () => ({
  useProductionKanban: vi.fn(),
}));

// Mock do hook de navegação do react-router-dom para inspecionar rotas
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProductionKanbanPage Component (US-18.5)', () => {
  const mockRefetch = vi.fn();
  const mockOnMoveOrder = vi.fn();

  // Conjunto de dados de teste representando diferentes clientes, prazos e etapas
  const mockOrders: OrderSummary[] = [
    {
      id: 'ord-1',
      codigo: 'OS-2026-0001',
      orcamentoId: 'orc-1',
      orcamentoCodigo: 'ORC-2026-001',
      clienteNome: 'Construtora Horizonte',
      status: 'WAITING_PRODUCTION',
      canalAprovacao: 'WHATSAPP',
      dataAprovacao: '2026-10-10',
      dataPrevisaoEntrega: '2020-01-01', // Passado -> Atrasado (LATE)
      valorLiquido: 5000,
      quantidadeItens: 4,
    },
    {
      id: 'ord-2',
      codigo: 'OS-2026-0002',
      orcamentoId: 'orc-2',
      orcamentoCodigo: 'ORC-2026-002',
      clienteNome: 'Residencial Alvorada',
      status: 'IN_PRODUCTION',
      canalAprovacao: 'PRESENCIAL',
      dataAprovacao: '2026-10-12',
      dataPrevisaoEntrega: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã -> Crítico (CRITICAL)
      valorLiquido: 8500,
      quantidadeItens: 6,
    },
    {
      id: 'ord-3',
      codigo: 'OS-2026-0003',
      orcamentoId: 'orc-3',
      orcamentoCodigo: 'ORC-2026-003',
      clienteNome: 'Lucas Engenharia',
      status: 'COMPLETED',
      canalAprovacao: 'EMAIL',
      dataAprovacao: '2026-10-14',
      dataPrevisaoEntrega: '2099-12-31', // Futuro distante -> No Prazo (NORMAL)
      valorLiquido: 12000,
      quantidadeItens: 10,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProductionKanban).mockReturnValue({
      orders: mockOrders,
      groupedOrders: {
        WAITING_PRODUCTION: [mockOrders[0]],
        IN_PRODUCTION: [mockOrders[1]],
        COMPLETED: [mockOrders[2]],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetchKanban: mockRefetch,
      onMoveOrder: mockOnMoveOrder,
      updateStatus: vi.fn(),
      updateStatusAsync: vi.fn(),
      isUpdating: false,
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={['/producao']}>
        <ProductionKanbanPage />
      </MemoryRouter>
    );
  };

  it('deve renderizar o cabeçalho, breadcrumb, métricas gerenciais, filtros e o quadro kanban', () => {
    renderComponent();

    // Título e Breadcrumb
    expect(screen.getByText('Ordens de Serviço (Kanban)')).toBeInTheDocument();
    expect(screen.getByText('Kanban')).toBeInTheDocument();

    // Botões do Topo
    expect(screen.getByTestId('btn-print-kanban')).toBeInTheDocument();
    expect(screen.getByTestId('btn-new-order')).toBeInTheDocument();

    // Métricas Executivas Reais (não redundantes)
    expect(screen.getByTestId('production-kanban-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('metric-in-production')).toHaveTextContent('1');
    expect(screen.getByTestId('metric-total-pieces')).toHaveTextContent('20 peças'); // 4 + 6 + 10
    expect(screen.getByTestId('metric-urgent')).toHaveTextContent('2'); // ord-1 (LATE) + ord-2 (CRITICAL)
    expect(screen.getByTestId('metric-ontime-rate')).toHaveTextContent('66.7%'); // (3 - 1) / 3 = 66.7%

    // Filtros e Quadro
    expect(screen.getByTestId('production-kanban-filters')).toBeInTheDocument();
    expect(screen.getByTestId('production-kanban-board')).toBeInTheDocument();

    // Cards renderizados
    expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('OS-2026-0003')).toBeInTheDocument();
  });

  it('deve filtrar ordens em tempo real pelo código da O.S.', () => {
    renderComponent();

    const searchInput = screen.getByTestId('input-search-kanban');
    fireEvent.change(searchInput, { target: { value: 'OS-2026-0001' } });

    expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0002')).not.toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0003')).not.toBeInTheDocument();

    expect(screen.getByTestId('filter-counter-badge')).toHaveTextContent('1 de 3');
  });

  it('deve filtrar ordens em tempo real pelo nome do cliente', () => {
    renderComponent();

    const searchInput = screen.getByTestId('input-search-kanban');
    fireEvent.change(searchInput, { target: { value: 'Alvorada' } });

    expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0001')).not.toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0003')).not.toBeInTheDocument();
  });

  it('deve filtrar ordens pelo prazo de entrega (LATE, CRITICAL, NORMAL)', () => {
    renderComponent();

    const deadlineSelect = screen.getByTestId('select-filter-deadline');

    // 1. Apenas atrasados (LATE)
    fireEvent.change(deadlineSelect, { target: { value: 'LATE' } });
    expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0002')).not.toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0003')).not.toBeInTheDocument();

    // 2. Apenas prazo crítico (CRITICAL)
    fireEvent.change(deadlineSelect, { target: { value: 'CRITICAL' } });
    expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0001')).not.toBeInTheDocument();

    // 3. No prazo (NORMAL)
    fireEvent.change(deadlineSelect, { target: { value: 'NORMAL' } });
    expect(screen.getByText('OS-2026-0003')).toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0001')).not.toBeInTheDocument();
  });

  it('deve filtrar ordens por etapa de produção', () => {
    renderComponent();

    const statusSelect = screen.getByTestId('select-filter-status');
    fireEvent.change(statusSelect, { target: { value: 'IN_PRODUCTION' } });

    expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0001')).not.toBeInTheDocument();
    expect(screen.queryByText('OS-2026-0003')).not.toBeInTheDocument();
  });

  it('deve resetar os filtros ao clicar no botão "Limpar"', () => {
    renderComponent();

    const searchInput = screen.getByTestId('input-search-kanban');
    fireEvent.change(searchInput, { target: { value: 'Horizonte' } });

    expect(screen.queryByText('OS-2026-0002')).not.toBeInTheDocument();

    // Clica no botão de limpar todos os filtros
    const clearBtn = screen.getByTestId('btn-clear-all-filters');
    fireEvent.click(clearBtn);

    // Todos os pedidos voltam a aparecer
    expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('OS-2026-0003')).toBeInTheDocument();
    expect(screen.getByTestId('filter-counter-badge')).toHaveTextContent('3 de 3');
  });

  it('deve permitir limpar apenas a busca de texto pelo botão X do input', () => {
    renderComponent();

    const searchInput = screen.getByTestId('input-search-kanban');
    fireEvent.change(searchInput, { target: { value: 'Horizonte' } });

    const clearTextBtn = screen.getByTestId('btn-clear-search-text');
    fireEvent.click(clearTextBtn);

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
  });

  it('deve acionar refetchKanban ao clicar no botão Atualizar', () => {
    renderComponent();

    const refreshBtn = screen.getByTestId('btn-refresh-kanban');
    fireEvent.click(refreshBtn);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('deve acionar window.print ao clicar em "Imprimir Fichas PCP"', () => {
    const printMock = vi.fn();
    window.print = printMock;
    renderComponent();

    const printBtn = screen.getByTestId('btn-print-kanban');
    fireEvent.click(printBtn);

    expect(printMock).toHaveBeenCalledTimes(1);
  });

  it('deve navegar para /orcamentos ao clicar em "+ Nova Ordem de Serviço"', () => {
    renderComponent();

    const newOrderBtn = screen.getByTestId('btn-new-order');
    fireEvent.click(newOrderBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos');
  });

  it('deve navegar para a página de detalhes da O.S. ao clicar no botão de detalhes', () => {
    renderComponent();

    const detailsBtn = screen.getByLabelText('Visualizar detalhes da ordem de serviço OS-2026-0001');
    fireEvent.click(detailsBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/ordens-servico/ord-1');
  });

  it('deve exibir o estado de erro e permitir tentar novamente quando houver falha na API', () => {
    vi.mocked(useProductionKanban).mockReturnValue({
      orders: [],
      groupedOrders: {
        WAITING_PRODUCTION: [],
        IN_PRODUCTION: [],
        COMPLETED: [],
      },
      isLoading: false,
      isError: true,
      error: new Error('Erro de conexão com o servidor.'),
      refetchKanban: mockRefetch,
      onMoveOrder: mockOnMoveOrder,
      updateStatus: vi.fn(),
      updateStatusAsync: vi.fn(),
      isUpdating: false,
    });

    renderComponent();

    expect(screen.getByTestId('kanban-error-state')).toBeInTheDocument();
    expect(screen.getByText('Erro de conexão com o servidor.')).toBeInTheDocument();

    const pageContainer = screen.getByTestId('production-kanban-page');
    expect(pageContainer).toHaveClass('overflow-y-auto');
    expect(pageContainer).not.toHaveClass('overflow-hidden');

    const retryBtn = screen.getByText('Tentar Novamente');
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
