import { api } from '../../../lib/api';
import type { BudgetFilters, BudgetPageResponse, BudgetSummary, BudgetStatus } from '../types';

const MOCK_BUDGETS: BudgetSummary[] = [
  {
    id: 1,
    numero: 'ORC-2026-001',
    clienteId: 1,
    clienteNome: 'Thiago Thasso de Melo',
    status: 'DRAFT',
    dataCriacao: '2026-08-01T10:30:00',
    dataValidade: '2026-08-16',
    subtotal: 3450.00,
    descontoPercentual: 5.00,
    valorDesconto: 172.50,
    valorTotal: 3277.50,
    quantidadeItens: 4,
  },
  {
    id: 2,
    numero: 'ORC-2026-002',
    clienteId: 2,
    clienteNome: 'Maria Silva',
    status: 'SENT',
    dataCriacao: '2026-08-05T14:00:00',
    dataValidade: '2026-08-20',
    subtotal: 8750.00,
    descontoPercentual: 0.00,
    valorDesconto: 0.00,
    valorTotal: 8750.00,
    quantidadeItens: 6,
  },
  {
    id: 3,
    numero: 'ORC-2026-003',
    clienteId: 3,
    clienteNome: 'João Pedro Construções',
    status: 'APPROVED',
    dataCriacao: '2026-08-10T09:15:00',
    dataValidade: '2026-08-25',
    subtotal: 15200.00,
    descontoPercentual: 10.00,
    valorDesconto: 1520.00,
    valorTotal: 13680.00,
    quantidadeItens: 12,
  },
  {
    id: 4,
    numero: 'ORC-2026-004',
    clienteId: 4,
    clienteNome: 'Ana Costa',
    status: 'REJECTED',
    dataCriacao: '2026-08-12T16:45:00',
    dataValidade: '2026-08-27',
    subtotal: 2100.00,
    descontoPercentual: 0.00,
    valorDesconto: 0.00,
    valorTotal: 2100.00,
    quantidadeItens: 2,
  },
  {
    id: 5,
    numero: 'ORC-2026-005',
    clienteId: 5,
    clienteNome: 'Roberto Engenharia LTDA',
    status: 'CANCELLED',
    dataCriacao: '2026-08-15T11:00:00',
    dataValidade: '2026-08-30',
    subtotal: 5600.00,
    descontoPercentual: 3.00,
    valorDesconto: 168.00,
    valorTotal: 5432.00,
    quantidadeItens: 5,
  },
  {
    id: 6,
    numero: 'ORC-2026-006',
    clienteId: 1,
    clienteNome: 'Thiago Thasso de Melo',
    status: 'DRAFT',
    dataCriacao: '2026-08-18T08:20:00',
    dataValidade: '2026-09-02',
    subtotal: 1890.00,
    descontoPercentual: 0.00,
    valorDesconto: 0.00,
    valorTotal: 1890.00,
    quantidadeItens: 3,
  },
  {
    id: 7,
    numero: 'ORC-2026-007',
    clienteId: 6,
    clienteNome: 'Fernanda Oliveira',
    status: 'SENT',
    dataCriacao: '2026-08-20T13:30:00',
    dataValidade: '2026-09-04',
    subtotal: 6300.00,
    descontoPercentual: 7.50,
    valorDesconto: 472.50,
    valorTotal: 5827.50,
    quantidadeItens: 8,
  },
  {
    id: 8,
    numero: 'ORC-2026-008',
    clienteId: 7,
    clienteNome: 'Carlos Eduardo Vidros ME',
    status: 'APPROVED',
    dataCriacao: '2026-08-22T10:00:00',
    dataValidade: '2026-09-06',
    subtotal: 22400.00,
    descontoPercentual: 12.00,
    valorDesconto: 2688.00,
    valorTotal: 19712.00,
    quantidadeItens: 15,
  },
  {
    id: 9,
    numero: 'ORC-2026-009',
    clienteId: 8,
    clienteNome: 'Luciana Almeida',
    status: 'DRAFT',
    dataCriacao: '2026-08-24T15:45:00',
    dataValidade: '2026-09-08',
    subtotal: 4200.00,
    descontoPercentual: 0.00,
    valorDesconto: 0.00,
    valorTotal: 4200.00,
    quantidadeItens: 4,
  },
  {
    id: 10,
    numero: 'ORC-2026-010',
    clienteId: 9,
    clienteNome: 'Marcos Vidraçaria',
    status: 'SENT',
    dataCriacao: '2026-08-26T09:00:00',
    dataValidade: '2026-09-10',
    subtotal: 9800.00,
    descontoPercentual: 5.00,
    valorDesconto: 490.00,
    valorTotal: 9310.00,
    quantidadeItens: 7,
  },
  {
    id: 11,
    numero: 'ORC-2026-011',
    clienteId: 10,
    clienteNome: 'Patrícia Santos',
    status: 'APPROVED',
    dataCriacao: '2026-08-27T08:00:00',
    dataValidade: '2026-09-11',
    subtotal: 7500.00,
    descontoPercentual: 8.00,
    valorDesconto: 600.00,
    valorTotal: 6900.00,
    quantidadeItens: 9,
  },
  {
    id: 12,
    numero: 'ORC-2026-012',
    clienteId: 2,
    clienteNome: 'Maria Silva',
    status: 'REJECTED',
    dataCriacao: '2026-08-27T10:30:00',
    dataValidade: '2026-09-11',
    subtotal: 3200.00,
    descontoPercentual: 0.00,
    valorDesconto: 0.00,
    valorTotal: 3200.00,
    quantidadeItens: 3,
  },
];

function filterAndPaginateMockBudgets(filters: BudgetFilters): BudgetPageResponse {
  let filtered = [...MOCK_BUDGETS];

  if (filters.status) {
    const targetStatus = filters.status;
    filtered = filtered.filter((b) => {
      if (b.status === targetStatus) return true;
      if (targetStatus === 'DRAFT' && b.status === 'RASCUNHO') return true;
      if (targetStatus === 'RASCUNHO' && b.status === 'DRAFT') return true;
      if (targetStatus === 'SENT' && b.status === 'ENVIADO') return true;
      if (targetStatus === 'ENVIADO' && b.status === 'SENT') return true;
      if (targetStatus === 'APPROVED' && b.status === 'APROVADO') return true;
      if (targetStatus === 'APROVADO' && b.status === 'APPROVED') return true;
      if (targetStatus === 'REJECTED' && b.status === 'REJEITADO') return true;
      if (targetStatus === 'REJEITADO' && b.status === 'REJECTED') return true;
      if (targetStatus === 'CANCELLED' && b.status === 'CANCELADO') return true;
      if (targetStatus === 'CANCELADO' && b.status === 'CANCELLED') return true;
      return false;
    });
  }

  if (filters.search) {
    const term = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.numero.toLowerCase().includes(term) ||
        b.clienteNome.toLowerCase().includes(term),
    );
  }

  if (filters.sort) {
    const [field, direction] = filters.sort.split(',');
    const dir = direction === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const aVal = a[field as keyof BudgetSummary];
      const bVal = b[field as keyof BudgetSummary];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir;
      }
      return 0;
    });
  }

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / filters.size));
  const start = filters.page * filters.size;
  const content = filtered.slice(start, start + filters.size);

  return {
    content,
    page: {
      size: filters.size,
      number: filters.page,
      totalElements,
      totalPages,
    },
    totalElements,
    totalPages,
    size: filters.size,
    number: filters.page,
    first: filters.page === 0,
    last: filters.page >= totalPages - 1,
  };
}

export const budgetsApi = {
  getBudgets: async (filters: BudgetFilters): Promise<BudgetPageResponse> => {
    try {
      const params: Record<string, string | number> = {
        page: filters.page,
        size: filters.size,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.sort) {
        params.sort = filters.sort;
      }

      const response = await api.get<BudgetPageResponse>('/budgets', { params });
      if (response.data && Array.isArray(response.data.content)) {
        return response.data;
      }
      return filterAndPaginateMockBudgets(filters);
    } catch {
      return filterAndPaginateMockBudgets(filters);
    }
  },

  getStatusCounts: async (): Promise<Record<BudgetStatus | '', number>> => {
    try {
      const response = await api.get<Record<BudgetStatus | '', number>>('/budgets/status-counts');
      if (response.data) {
        return response.data;
      }
    } catch {
    }

    const counts: Record<string, number> = { '': MOCK_BUDGETS.length };
    for (const budget of MOCK_BUDGETS) {
      const st = budget.status;
      counts[st] = (counts[st] || 0) + 1;
    }
    return counts as Record<BudgetStatus | '', number>;
  },
};
