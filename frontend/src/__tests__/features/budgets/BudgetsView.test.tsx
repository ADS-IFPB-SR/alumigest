import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { BudgetsView } from '../../../features/budgets/components/BudgetsView';
import { renderWithProviders } from '../../../test/test-utils';
import * as useBudgetsModule from '../../../features/budgets/hooks/useBudgets';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BudgetsView Component [Joseph Nichollas]', () => {
  const sampleBudget = {
    id: 'b-1',
    code: 'ORC-2026-001',
    customerName: 'Cliente Teste',
    createdAt: '2026-09-10T10:00:00Z',
    validUntil: '2026-09-25T10:00:00Z',
    itemCount: 2,
    subtotal: 1000,
    total: 1000,
    status: 'DRAFT' as const,
    isExpired: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar esqueleto de carregamento quando isLoading for true', () => {
    vi.spyOn(useBudgetsModule, 'useBudgets').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useBudgetsModule, 'useBudgetStatusCounts').mockReturnValue({
      data: undefined,
    } as any);

    const { container } = renderWithProviders(<BudgetsView />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('deve renderizar estado de erro e permitir retry quando isError for true', () => {
    const mockRefetch = vi.fn();
    vi.spyOn(useBudgetsModule, 'useBudgets').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    vi.spyOn(useBudgetsModule, 'useBudgetStatusCounts').mockReturnValue({
      data: undefined,
    } as any);

    renderWithProviders(<BudgetsView />);

    expect(screen.getByText('Erro ao carregar orçamentos')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar estado de nenhum orçamento cadastrado (no-data) quando lista vazia sem filtros', () => {
    vi.spyOn(useBudgetsModule, 'useBudgets').mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useBudgetsModule, 'useBudgetStatusCounts').mockReturnValue({
      data: undefined,
    } as any);

    renderWithProviders(<BudgetsView />);

    expect(screen.getByText('Nenhum orçamento cadastrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar primeiro orçamento/i })).toBeInTheDocument();
  });

  it('deve renderizar estado no-results quando filtrando e nenhum resultado for retornado', () => {
    vi.spyOn(useBudgetsModule, 'useBudgets').mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useBudgetsModule, 'useBudgetStatusCounts').mockReturnValue({
      data: { '': 0, DRAFT: 0 },
    } as any);

    renderWithProviders(<BudgetsView />);

    // Clica em Rascunhos para ativar o filtro
    const rascunhosTab = screen.getByText('Rascunhos');
    fireEvent.click(rascunhosTab);

    expect(screen.getByText('Nenhum orçamento encontrado')).toBeInTheDocument();
  });

  it('deve navegar para /orcamentos/novo ao clicar no botão "Novo Orçamento"', () => {
    vi.spyOn(useBudgetsModule, 'useBudgets').mockReturnValue({
      data: { content: [sampleBudget], totalElements: 1, totalPages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useBudgetsModule, 'useBudgetStatusCounts').mockReturnValue({
      data: { '': 1, DRAFT: 1 },
    } as any);

    renderWithProviders(<BudgetsView />);

    const novoBtn = screen.getByRole('button', { name: /novo orçamento/i });
    fireEvent.click(novoBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos/novo');
  });

  it('deve alternar ordenação e filtrar por status', () => {
    const useBudgetsSpy = vi.spyOn(useBudgetsModule, 'useBudgets').mockReturnValue({
      data: { content: [sampleBudget], totalElements: 1, totalPages: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useBudgetsModule, 'useBudgetStatusCounts').mockReturnValue({
      data: { '': 1, DRAFT: 1, APPROVED: 0 },
    } as any);

    renderWithProviders(<BudgetsView />);

    // Filtrar por Aprovados
    const aprovadosTab = screen.getByText('Aprovados');
    fireEvent.click(aprovadosTab);

    expect(useBudgetsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'APPROVED', page: 0 })
    );

    // Alternar ordenação na tabela
    const clienteCol = screen.getByRole('button', { name: /ordenar por cliente/i });
    fireEvent.click(clienteCol);

    expect(useBudgetsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'customerName,asc' })
    );

    // Clicar em outra coluna (Valor Total) define asc e altera campo
    const totalCol = screen.getByRole('button', { name: /ordenar por valor total/i });
    fireEvent.click(totalCol);

    expect(useBudgetsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'total,asc' })
    );

    // Clicar novamente na mesma coluna inverte para desc
    fireEvent.click(totalCol);
    expect(useBudgetsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'total,desc' })
    );

    // Testar busca
    const searchInput = screen.getByPlaceholderText('Buscar por código ou cliente...');
    fireEvent.change(searchInput, { target: { value: 'Cliente' } });
    expect(searchInput).toHaveValue('Cliente');
  });
});
