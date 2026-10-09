import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrderListPage, getVisiblePages } from '../../pages/OrderListPage';
import * as useOrdersModule from '../../features/orders/hooks/useOrders';
import type { OrderSummary } from '../../features/orders/types';

vi.mock('../../features/orders/hooks/useOrders');

const mockSummaries: OrderSummary[] = [
  {
    id: 'order-1',
    codigo: 'OS-2026-0001',
    orcamentoId: 'budget-1',
    orcamentoCodigo: 'ORC-2026-0001',
    clienteNome: 'Construtora Horizonte',
    clienteTelefone: '(83) 98888-5555',
    status: 'WAITING_PRODUCTION',
    statusDescricao: 'Aguardando Produção',
    canalAprovacao: 'WHATSAPP',
    canalAprovacaoDescricao: 'WhatsApp',
    dataAprovacao: '2026-10-01',
    dataPrevisaoEntrega: '2026-10-16',
    valorLiquido: 4500,
    quantidadeItens: 2,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'order-2',
    codigo: 'OS-2026-0002',
    orcamentoId: 'budget-2',
    orcamentoCodigo: 'ORC-2026-0002',
    clienteNome: 'Vidraçaria Silva',
    clienteTelefone: '(83) 97777-4444',
    status: 'COMPLETED',
    statusDescricao: 'Concluído',
    canalAprovacao: 'PRESENCIAL',
    canalAprovacaoDescricao: 'Presencial',
    dataAprovacao: '2026-09-20',
    dataPrevisaoEntrega: '2026-10-05',
    valorLiquido: 1250.5,
    quantidadeItens: 1,
    createdAt: '2026-09-20T14:30:00Z',
  },
];

describe('OrderListPage — [US-13.4] Listagem Paginada de Pedidos de Venda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir indicador de carregamento quando isLoading for true', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando ordens de serviço\.\.\./i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando isError for true', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Erro ao carregar a lista de ordens de serviço/i)).toBeInTheDocument();
  });

  it('deve renderizar a tabela com os pedidos retornados com dados formatados', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: {
        content: mockSummaries,
        totalElements: 2,
        totalPages: 1,
        page: {
          totalElements: 2,
          totalPages: 1,
          size: 10,
          number: 0,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('#OS-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Construtora Horizonte')).toBeInTheDocument();
    expect(screen.getByText('ORC-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('01/10/2026')).toBeInTheDocument();
    expect(screen.getByText('16/10/2026')).toBeInTheDocument();
    expect(screen.getAllByText('WhatsApp').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('#OS-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('Vidraçaria Silva')).toBeInTheDocument();
    expect(screen.getAllByText('Presencial').length).toBeGreaterThanOrEqual(1);
  });

  it('deve exibir estado vazio quando não houver pedidos', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 1,
        page: {
          totalElements: 0,
          totalPages: 1,
          size: 10,
          number: 0,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Nenhuma ordem de serviço encontrada/i)).toBeInTheDocument();
  });

  it('deve atualizar busca com debounce ao digitar no campo de pesquisa', async () => {
    const useOrdersSpy = vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 1 },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por código, cliente ou orçamento\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Horizonte' } });

    await waitFor(
      () => {
        expect(useOrdersSpy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: 'Horizonte',
            page: 0,
          })
        );
      },
      { timeout: 1000 }
    );
  });

  it('deve aplicar filtros de status e de canal ao selecionar opções', () => {
    const useOrdersSpy = vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 1 },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    const statusSelect = screen.getByLabelText(/Filtrar por status/i);
    fireEvent.change(statusSelect, { target: { value: 'WAITING_PRODUCTION' } });

    const channelSelect = screen.getByLabelText(/Filtrar por canal de aprovação/i);
    fireEvent.change(channelSelect, { target: { value: 'WHATSAPP' } });

    expect(useOrdersSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'WAITING_PRODUCTION',
        channel: 'WHATSAPP',
      })
    );
  });

  it('deve atualizar o tamanho da página ao selecionar nova quantidade por página', () => {
    const useOrdersSpy = vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: { content: [], totalElements: 12, totalPages: 3 },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    const sizeSelect = screen.getByLabelText(/Por página:/i);
    fireEvent.change(sizeSelect, { target: { value: '20' } });

    expect(useOrdersSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        size: 20,
        page: 0,
      })
    );
  });

  it('deve renderizar janela de paginação deslizante e reticências quando totalPages for maior que 7', () => {
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: {
        content: mockSummaries,
        totalElements: 100,
        totalPages: 10,
        page: {
          totalElements: 100,
          totalPages: 10,
          size: 10,
          number: 0,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    // Deve conter página 1
    expect(screen.getByRole('button', { name: 'Ir para página 1' })).toBeInTheDocument();
    // Deve conter reticências
    expect(screen.getByText('…')).toBeInTheDocument();
    // Deve conter última página (10)
    expect(screen.getByRole('button', { name: 'Ir para página 10' })).toBeInTheDocument();
  });

  it('deve navegar para próxima página ao clicar no botão Próximo', () => {
    const useOrdersSpy = vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: {
        content: mockSummaries,
        totalElements: 30,
        totalPages: 3,
        page: {
          totalElements: 30,
          totalPages: 3,
          size: 10,
          number: 0,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /Próxima página/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);

    expect(useOrdersSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
      })
    );
  });

  it('deve ajustar a janela deslizante exibindo reticências no início e fim quando page > 4 (CA-4 da #412)', () => {
    const useOrdersSpy = vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      data: {
        content: mockSummaries,
        totalElements: 100,
        totalPages: 10,
        page: {
          totalElements: 100,
          totalPages: 10,
          size: 10,
          number: 0,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /Próxima página/i });

    // Navega 5 vezes até atingir a página 6 (page = 5, satisfazendo o critério explícito page > 4)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextBtn);
    }

    expect(useOrdersSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 5,
      })
    );

    // Ambas as reticências (início e fim) devem estar presentes
    const ellipses = screen.getAllByText('…');
    expect(ellipses).toHaveLength(2);

    // Botão da página ativa (6) deve ter aria-current="page"
    const activePageBtn = screen.getByRole('button', { name: 'Ir para página 6' });
    expect(activePageBtn).toBeInTheDocument();
    expect(activePageBtn).toHaveAttribute('aria-current', 'page');

    // Botões vizinhos 5 e 7 devem estar visíveis
    expect(screen.getByRole('button', { name: 'Ir para página 5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para página 7' })).toBeInTheDocument();

    // Primeira e última páginas (1 e 10) devem estar visíveis
    expect(screen.getByRole('button', { name: 'Ir para página 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para página 10' })).toBeInTheDocument();

    // Páginas distantes fora da janela não devem estar presentes
    expect(screen.queryByRole('button', { name: 'Ir para página 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ir para página 3' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ir para página 4' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ir para página 8' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ir para página 9' })).not.toBeInTheDocument();
  });
});

describe('getVisiblePages (função pura de paginação)', () => {
  it('deve retornar todas as páginas sem reticências quando totalPages <= 7', () => {
    expect(getVisiblePages(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(getVisiblePages(3, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('deve exibir reticências ao final quando estiver nas primeiras páginas (início)', () => {
    expect(getVisiblePages(0, 10)).toEqual([0, 1, 'ellipsis-end', 9]);
    expect(getVisiblePages(1, 10)).toEqual([0, 1, 2, 'ellipsis-end', 9]);
    expect(getVisiblePages(2, 10)).toEqual([0, 1, 2, 3, 'ellipsis-end', 9]);
  });

  it('deve exibir reticências no início e no fim para páginas intermediárias (meio - page > 4)', () => {
    // Para page = 5 (6ª página) em 10 páginas totais (Issue #412 / CA-4)
    expect(getVisiblePages(5, 10)).toEqual([0, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 9]);
  });

  it('deve exibir reticências apenas no início quando estiver nas últimas páginas (fim)', () => {
    expect(getVisiblePages(7, 10)).toEqual([0, 'ellipsis-start', 6, 7, 8, 9]);
    expect(getVisiblePages(8, 10)).toEqual([0, 'ellipsis-start', 7, 8, 9]);
    expect(getVisiblePages(9, 10)).toEqual([0, 'ellipsis-start', 8, 9]);
  });
});

