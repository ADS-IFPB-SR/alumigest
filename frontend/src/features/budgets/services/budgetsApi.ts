import { api } from '../../../lib/api';
import type { 
  BudgetFilters, 
  BudgetPageResponse, 
  BudgetSummary, 
  BudgetStatus,
  BudgetDetail,
  CreateBudgetPayload,
  WindowTemplate,
} from '../types';
import type { PageResponse } from '../../catalog/types';

const MOCK_BUDGETS: BudgetSummary[] = [
  {
    id: 'orc-1',
    code: 'ORC-2026-001',
    customerId: 'cli-1',
    customerName: 'Thiago Thasso de Melo',
    customer: {
      id: 'cli-1',
      name: 'Thiago Thasso de Melo',
    },
    status: 'DRAFT',
    createdAt: '2026-08-01T10:30:00',
    validUntil: '2026-08-16',
    subtotal: 3450.00,
    discountPercent: 5.00,
    discountValue: 172.50,
    total: 3277.50,
    itemCount: 4,
  },
  {
    id: 'orc-2',
    code: 'ORC-2026-002',
    customerId: 'cli-2',
    customerName: 'Maria Silva',
    customer: {
      id: 'cli-2',
      name: 'Maria Silva',
    },
    status: 'SENT',
    createdAt: '2026-08-05T14:00:00',
    validUntil: '2026-08-20',
    subtotal: 8750.00,
    discountPercent: 0.00,
    discountValue: 0.00,
    total: 8750.00,
    itemCount: 6,
  },
  {
    id: 'orc-3',
    code: 'ORC-2026-003',
    customerId: 'cli-3',
    customerName: 'João Pedro Construções',
    customer: {
      id: 'cli-3',
      name: 'João Pedro Construções',
    },
    status: 'APPROVED',
    createdAt: '2026-08-10T09:15:00',
    validUntil: '2026-08-25',
    subtotal: 15200.00,
    discountPercent: 10.00,
    discountValue: 1520.00,
    total: 13680.00,
    itemCount: 12,
  },
  {
    id: 'orc-4',
    code: 'ORC-2026-004',
    customerId: 'cli-4',
    customerName: 'Ana Costa',
    customer: {
      id: 'cli-4',
      name: 'Ana Costa',
    },
    status: 'REJECTED',
    createdAt: '2026-08-12T16:45:00',
    validUntil: '2026-08-27',
    subtotal: 2100.00,
    discountPercent: 0.00,
    discountValue: 0.00,
    total: 2100.00,
    itemCount: 2,
  },
  {
    id: 'orc-5',
    code: 'ORC-2026-005',
    customerId: 'cli-5',
    customerName: 'Roberto Engenharia LTDA',
    customer: {
      id: 'cli-5',
      name: 'Roberto Engenharia LTDA',
    },
    status: 'CANCELLED',
    createdAt: '2026-08-15T11:00:00',
    validUntil: '2026-08-30',
    subtotal: 5600.00,
    discountPercent: 3.00,
    discountValue: 168.00,
    total: 5432.00,
    itemCount: 5,
  },
  {
    id: 'orc-6',
    code: 'ORC-2026-006',
    customerId: 'cli-1',
    customerName: 'Thiago Thasso de Melo',
    customer: {
      id: 'cli-1',
      name: 'Thiago Thasso de Melo',
    },
    status: 'DRAFT',
    createdAt: '2026-08-18T08:20:00',
    validUntil: '2026-09-02',
    subtotal: 1890.00,
    discountPercent: 0.00,
    discountValue: 0.00,
    total: 1890.00,
    itemCount: 3,
  },
  {
    id: 'orc-7',
    code: 'ORC-2026-007',
    customerId: 'cli-6',
    customerName: 'Fernanda Oliveira',
    customer: {
      id: 'cli-6',
      name: 'Fernanda Oliveira',
    },
    status: 'SENT',
    createdAt: '2026-08-20T13:30:00',
    validUntil: '2026-09-04',
    subtotal: 6300.00,
    discountPercent: 7.50,
    discountValue: 472.50,
    total: 5827.50,
    itemCount: 8,
  },
  {
    id: 'orc-8',
    code: 'ORC-2026-008',
    customerId: 'cli-7',
    customerName: 'Carlos Eduardo Vidros ME',
    customer: {
      id: 'cli-7',
      name: 'Carlos Eduardo Vidros ME',
    },
    status: 'APPROVED',
    createdAt: '2026-08-22T10:00:00',
    validUntil: '2026-09-06',
    subtotal: 22400.00,
    discountPercent: 12.00,
    discountValue: 2688.00,
    total: 19712.00,
    itemCount: 15,
  },
  {
    id: 'orc-9',
    code: 'ORC-2026-009',
    customerId: 'cli-8',
    customerName: 'Luciana Almeida',
    customer: {
      id: 'cli-8',
      name: 'Luciana Almeida',
    },
    status: 'DRAFT',
    createdAt: '2026-08-24T15:45:00',
    validUntil: '2026-09-08',
    subtotal: 4200.00,
    discountPercent: 0.00,
    discountValue: 0.00,
    total: 4200.00,
    itemCount: 4,
  },
  {
    id: 'orc-10',
    code: 'ORC-2026-010',
    customerId: 'cli-9',
    customerName: 'Marcos Vidraçaria',
    customer: {
      id: 'cli-9',
      name: 'Marcos Vidraçaria',
    },
    status: 'SENT',
    createdAt: '2026-08-26T09:00:00',
    validUntil: '2026-09-10',
    subtotal: 9800.00,
    discountPercent: 5.00,
    discountValue: 490.00,
    total: 9310.00,
    itemCount: 7,
  },
  {
    id: 'orc-11',
    code: 'ORC-2026-011',
    customerId: 'cli-10',
    customerName: 'Patrícia Santos',
    customer: {
      id: 'cli-10',
      name: 'Patrícia Santos',
    },
    status: 'APPROVED',
    createdAt: '2026-08-27T08:00:00',
    validUntil: '2026-09-11',
    subtotal: 7500.00,
    discountPercent: 8.00,
    discountValue: 600.00,
    total: 6900.00,
    itemCount: 9,
  },
  {
    id: 'orc-12',
    code: 'ORC-2026-012',
    customerId: 'cli-2',
    customerName: 'Maria Silva',
    customer: {
      id: 'cli-2',
      name: 'Maria Silva',
    },
    status: 'REJECTED',
    createdAt: '2026-08-27T10:30:00',
    validUntil: '2026-09-11',
    subtotal: 3200.00,
    discountPercent: 0.00,
    discountValue: 0.00,
    total: 3200.00,
    itemCount: 3,
  },
];

function filterAndPaginateMockBudgets(filters: BudgetFilters): BudgetPageResponse {
  let filtered = [...MOCK_BUDGETS];

  if (filters.status) {
    filtered = filtered.filter((b) => b.status === filters.status);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.code.toLowerCase().includes(term) ||
        b.customerName.toLowerCase().includes(term) ||
        (b.customer?.name && b.customer.name.toLowerCase().includes(term)),
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
  };
}

function parseJsonConfig<T>(raw: unknown, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function toBackendBudgetPayload(data: CreateBudgetPayload) {
  return {
    clientId: data.customerId,
    discountPercent: data.discountPercent,
    notes: data.notes,
    items: data.items.map((item) => ({
      productId: item.productId,
      widthMm: item.width,
      heightMm: item.height,
      quantity: item.quantity,
      laborCost: item.laborCost ?? 0,
      templateType: item.templateType,
      templateConfig: typeof item.templateConfig === 'object' && item.templateConfig !== null 
        ? JSON.stringify(item.templateConfig) 
        : item.templateConfig,
      handleConfig: typeof item.handleConfig === 'object' && item.handleConfig !== null 
        ? JSON.stringify(item.handleConfig) 
        : item.handleConfig,
      drillingConfig: typeof item.drillingConfig === 'object' && item.drillingConfig !== null 
        ? JSON.stringify(item.drillingConfig) 
        : item.drillingConfig,
      notes: item.notes,
      options: (item.options ?? []).map((opt) => ({
        materialId: opt.materialId,
        quantity: opt.quantity,
        categoryType: opt.categoryType,
      })),
    })),
  };
}

function mapBackendToBudgetDetail(res: any): BudgetDetail {
  return {
    id: res.id,
    code: res.code,
    customerId: res.clientId,
    customerName: res.clientName,
    customer: {
      id: res.clientId,
      name: res.clientName,
    },
    status: res.status,
    createdAt: res.createdAt,
    validUntil: res.validUntil,
    subtotal: Number(res.subtotal ?? 0),
    discountPercent: Number(res.discountPercent ?? 0),
    discountValue: Number(res.discountValue ?? 0),
    total: Number(res.total ?? 0),
    notes: res.notes,
    itemCount: Array.isArray(res.items) ? res.items.length : 0,
    items: Array.isArray(res.items)
      ? res.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          templateType: item.templateType,
          templateConfig: parseJsonConfig(item.templateConfig, {} as any),
          handleConfig: parseJsonConfig(item.handleConfig, { handleType: 'PUXADOR_H', position: 'VERTICAL', heightMm: 1000 } as any),
          drillingConfig: parseJsonConfig(item.drillingConfig, { holeCount: 0, diameterMm: 0, distanceMm: 0 } as any),
          width: Number(item.widthMm ?? item.width ?? 0),
          height: Number(item.heightMm ?? item.height ?? 0),
          quantity: Number(item.quantity ?? 1),
          laborCost: Number(item.laborCost ?? 0),
          subtotal: Number(item.subtotal ?? 0),
          notes: item.notes,
          options: Array.isArray(item.options)
            ? item.options.map((opt: any) => ({
                id: opt.id,
                materialId: opt.materialId,
                materialName: opt.materialName,
                unitMeasure: opt.unitMeasure,
                categoryType: opt.categoryType,
                selectedType: opt.selectedType,
                selectedColor: opt.selectedColor,
                quantity: Number(opt.quantity ?? 0),
                unitPrice: Number(opt.unitPrice ?? 0),
                totalPrice: Number(opt.totalPrice ?? 0),
              }))
            : [],
        }))
      : [],
  };
}

export const budgetsApi = {
  // ============================================================
  // TEMPLATES DE ESQUADRIAS
  // ============================================================
  getWindowTemplates: async (): Promise<WindowTemplate[]> => {
    const response = await api.get<PageResponse<WindowTemplate>>('/catalog/products', {
      params: { size: 100 },
    });
    // @ts-ignore
    const data = response.data as unknown as PageResponse<WindowTemplate>;
    const all = data.content ?? (response.data as unknown as WindowTemplate[]);
    return all.filter((p: WindowTemplate) => Boolean(p.templateType));
  },

  // ============================================================
  // ORÇAMENTOS - LISTAGEM
  // ============================================================
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
        params.busca = filters.search;
      }

      if (filters.sort) {
        params.sort = filters.sort;
      }

      const response = await api.get<any>('/api/orcamentos', {
        baseURL: '',
        params,
      });
      if (response.data && Array.isArray(response.data.content)) {
        const mappedContent: BudgetSummary[] = response.data.content.map((b: any) => ({
          id: b.id,
          code: b.code,
          customerId: b.clientId,
          customerName: b.clientName,
          customer: {
            id: b.clientId,
            name: b.clientName,
          },
          status: b.status,
          createdAt: b.createdAt,
          validUntil: b.validUntil,
          subtotal: Number(b.subtotal ?? b.total ?? 0),
          discountPercent: Number(b.discountPercent ?? 0),
          discountValue: Number(b.discountValue ?? 0),
          total: Number(b.total ?? 0),
          itemCount: Number(b.itemCount ?? 1),
        }));

        return {
          content: mappedContent,
          page: response.data.page ?? {
            size: filters.size,
            number: filters.page,
            totalElements: mappedContent.length,
            totalPages: 1,
          },
        };
      }
      return filterAndPaginateMockBudgets(filters);
    } catch {
      return filterAndPaginateMockBudgets(filters);
    }
  },

  getStatusCounts: async (): Promise<Record<BudgetStatus | '', number>> => {
    return {} as Record<BudgetStatus | '', number>;
  },

  // ============================================================
  // ORÇAMENTOS - CRUD
  // ============================================================
  getBudget: async (id: string): Promise<BudgetDetail> => {
    const response = await api.get<any>(`/api/orcamentos/${id}`, {
      baseURL: '',
    });
    return mapBackendToBudgetDetail(response.data);
  },

  createBudget: async (data: CreateBudgetPayload): Promise<BudgetDetail> => {
    const backendPayload = toBackendBudgetPayload(data);
    const response = await api.post<any>('/api/orcamentos', backendPayload, {
      baseURL: '',
    });
    return mapBackendToBudgetDetail(response.data);
  },

  updateBudget: async (id: string, data: CreateBudgetPayload): Promise<BudgetDetail> => {
    const backendPayload = toBackendBudgetPayload(data);
    const response = await api.put<any>(`/api/orcamentos/${id}`, backendPayload, {
      baseURL: '',
    });
    return mapBackendToBudgetDetail(response.data);
  },

  deleteBudget: async (id: string): Promise<boolean> => {
    await api.delete(`/api/orcamentos/${id}`, {
      baseURL: '',
    });
    return true;
  },

  updateBudgetStatus: async (id: string, status: BudgetStatus): Promise<BudgetDetail> => {
    const response = await api.patch<any>(
      `/api/orcamentos/${id}/status`,
      { status },
      { baseURL: '' },
    );
    return mapBackendToBudgetDetail(response.data);
  },
};

