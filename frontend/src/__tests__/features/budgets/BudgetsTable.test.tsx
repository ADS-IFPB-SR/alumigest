import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { BudgetsTable } from '../../../features/budgets/components/BudgetsTable';
import { renderWithProviders } from '../../../test/test-utils';
import type { BudgetSummary } from '../../../features/budgets/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BudgetsTable', () => {
  const mockOnSort = vi.fn();

  const mockBudgets: BudgetSummary[] = [
    {
      id: 'budget-1',
      code: 'ORC-2026-001',
      customerName: 'Maria Silva',
      createdAt: '2026-09-10T10:00:00Z',
      validUntil: '2026-09-25T10:00:00Z',
      itemCount: 3,
      subtotal: 5000,
      discountPercent: 10,
      discountValue: 500,
      total: 4500,
      status: 'APPROVED',
      isExpired: false,
    },
    {
      id: 'budget-2',
      code: 'ORC-2026-002',
      customerName: 'Carlos Souza',
      createdAt: '2026-08-01T10:00:00Z',
      validUntil: '2026-08-15T10:00:00Z',
      itemCount: 1,
      subtotal: 1200,
      discountPercent: 0,
      discountValue: 0,
      total: 1200,
      status: 'DRAFT',
      isExpired: true,
    },
    {
      id: 'budget-3',
      code: 'ORC-2026-003',
      customerName: 'Ana Oliveira',
      createdAt: '2026-07-01T10:00:00Z',
      validUntil: '2026-07-15T10:00:00Z',
      itemCount: 2,
      subtotal: 3000,
      discountPercent: 0,
      discountValue: 0,
      total: 3000,
      status: 'EXPIRED',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar os cabeçalhos das colunas, incluindo Status e Ações', () => {
    renderWithProviders(
      <BudgetsTable
        data={mockBudgets}
        sortField="createdAt"
        sortDirection="desc"
        onSort={mockOnSort}
      />,
    );

    expect(screen.getByText('Código')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('Data de Emissão')).toBeInTheDocument();
    expect(screen.getByText('Validade')).toBeInTheDocument();
    expect(screen.getByText('Qtd de Itens')).toBeInTheDocument();
    expect(screen.getByText('Valor Total (R$)')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  it('deve exibir dados financeiros consolidados com valor líquido real formatado em BRL', () => {
    renderWithProviders(
      <BudgetsTable
        data={mockBudgets}
        sortField="total"
        sortDirection="asc"
        onSort={mockOnSort}
      />,
    );

    expect(screen.getByText('ORC-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    // Valor líquido já com desconto (R$ 4.500,00)
    expect(screen.getByText('R$ 4.500,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument();
  });

  it('deve exibir o badge de status correto, incluindo Expirado quando isExpired for true ou status for EXPIRED', () => {
    renderWithProviders(
      <BudgetsTable
        data={mockBudgets}
        sortField="createdAt"
        sortDirection="desc"
        onSort={mockOnSort}
      />,
    );

    // Orçamento 1 é APPROVED
    expect(screen.getByText('Aprovado')).toBeInTheDocument();

    // Orçamento 2 (DRAFT com isExpired: true) e Orçamento 3 (EXPIRED) devem renderizar "Expirado"
    const expiredBadges = screen.getAllByText('Expirado');
    expect(expiredBadges).toHaveLength(2);
  });

  it('deve disparar ordenação ao clicar no cabeçalho ordenável', () => {
    renderWithProviders(
      <BudgetsTable
        data={mockBudgets}
        sortField="code"
        sortDirection="asc"
        onSort={mockOnSort}
      />,
    );

    const clientHeaderButton = screen.getByRole('button', { name: /ordenar por cliente/i });
    fireEvent.click(clientHeaderButton);

    expect(mockOnSort).toHaveBeenCalledWith('customerName');

    const totalButton = screen.getByRole('button', { name: /ordenar por valor total/i });
    fireEvent.click(totalButton);

    expect(mockOnSort).toHaveBeenCalledWith('total');
  });

  it('deve navegar para a página de detalhes ao clicar na linha da tabela', () => {
    renderWithProviders(
      <BudgetsTable
        data={mockBudgets}
        sortField="createdAt"
        sortDirection="desc"
        onSort={mockOnSort}
      />,
    );

    const codeCell = screen.getByText('ORC-2026-001');
    fireEvent.click(codeCell);

    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos/budget-1');
  });

  it('deve navegar para a página de detalhes ao clicar no botão de ação da coluna Ações', () => {
    renderWithProviders(
      <BudgetsTable
        data={mockBudgets}
        sortField="createdAt"
        sortDirection="desc"
        onSort={mockOnSort}
      />,
    );

    const actionButton = screen.getByRole('button', {
      name: /ver detalhes do orçamento orc-2026-001/i,
    });
    fireEvent.click(actionButton);

    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos/budget-1');
  });

  it('deve lidar com cliente através de budget.customer.name, cliente ausente e datas inválidas ou vazias', () => {
    const edgeBudgets: any[] = [
      {
        id: 'budget-fallback',
        code: 'ORC-FALLBACK',
        customer: { name: 'Cliente Objeto' },
        createdAt: '',
        validUntil: 'data-invalida',
        itemCount: 1,
        total: 100,
        status: 'DRAFT',
      },
      {
        id: 'budget-empty-customer',
        code: 'ORC-EMPTY',
        customerName: '',
        customer: null,
        createdAt: '2026-01-01T00:00:00Z',
        validUntil: '',
        itemCount: 1,
        total: 0,
        status: 'DRAFT',
      },
    ];

    renderWithProviders(
      <BudgetsTable
        data={edgeBudgets}
        sortField="createdAt"
        sortDirection="desc"
        onSort={mockOnSort}
      />,
    );

    expect(screen.getByText('Cliente Objeto')).toBeInTheDocument();
    expect(screen.getByText('data-invalida')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
  });
});
