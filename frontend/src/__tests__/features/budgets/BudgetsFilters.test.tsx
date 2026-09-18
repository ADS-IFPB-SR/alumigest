import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { BudgetsFilters } from '../../../features/budgets/components/BudgetsFilters';
import { renderWithProviders } from '../../../test/test-utils';

describe('BudgetsFilters', () => {
  const mockOnStatusChange = vi.fn();
  const mockOnSearchChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve renderizar todas as opções de filtro por status, incluindo Rascunhos, Enviados, Aprovados e Expirados', () => {
    renderWithProviders(
      <BudgetsFilters
        activeStatus=""
        searchTerm=""
        onStatusChange={mockOnStatusChange}
        onSearchChange={mockOnSearchChange}
      />,
    );

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Rascunhos')).toBeInTheDocument();
    expect(screen.getByText('Enviados')).toBeInTheDocument();
    expect(screen.getByText('Aprovados')).toBeInTheDocument();
    expect(screen.getByText('Rejeitados')).toBeInTheDocument();
    expect(screen.getByText('Cancelados')).toBeInTheDocument();
    expect(screen.getByText('Expirados')).toBeInTheDocument();
  });

  it('deve chamar onStatusChange ao clicar na aba de filtro por status', () => {
    renderWithProviders(
      <BudgetsFilters
        activeStatus=""
        searchTerm=""
        onStatusChange={mockOnStatusChange}
        onSearchChange={mockOnSearchChange}
      />,
    );

    const expiredTab = screen.getByText('Expirados');
    fireEvent.click(expiredTab);

    expect(mockOnStatusChange).toHaveBeenCalledWith('EXPIRED');

    const approvedTab = screen.getByText('Aprovados');
    fireEvent.click(approvedTab);

    expect(mockOnStatusChange).toHaveBeenCalledWith('APPROVED');
  });

  it('deve exibir as contagens de status quando fornecidas', () => {
    const statusCounts = {
      '': 10,
      DRAFT: 4,
      SENT: 2,
      APPROVED: 3,
      REJECTED: 0,
      CANCELLED: 0,
      EXPIRED: 1,
    };

    renderWithProviders(
      <BudgetsFilters
        activeStatus="EXPIRED"
        searchTerm=""
        statusCounts={statusCounts}
        onStatusChange={mockOnStatusChange}
        onSearchChange={mockOnSearchChange}
      />,
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('deve chamar onSearchChange com debounce de 300ms ao digitar na busca', () => {
    renderWithProviders(
      <BudgetsFilters
        activeStatus=""
        searchTerm=""
        onStatusChange={mockOnStatusChange}
        onSearchChange={mockOnSearchChange}
      />,
    );

    const input = screen.getByPlaceholderText('Buscar por código ou cliente...');
    fireEvent.change(input, { target: { value: 'ORC-2026' } });

    // Imediatamente não deve ter chamado
    expect(mockOnSearchChange).not.toHaveBeenCalled();

    // Avança 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockOnSearchChange).toHaveBeenCalledWith('ORC-2026');
  });

  it('deve limpar o campo de busca ao clicar no botão de fechar', () => {
    renderWithProviders(
      <BudgetsFilters
        activeStatus=""
        searchTerm="Cliente Teste"
        onStatusChange={mockOnStatusChange}
        onSearchChange={mockOnSearchChange}
      />,
    );

    const input = screen.getByPlaceholderText('Buscar por código ou cliente...') as HTMLInputElement;
    expect(input.value).toBe('Cliente Teste');

    const clearButton = screen.getByRole('button', { name: 'close' });
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
  });
});
