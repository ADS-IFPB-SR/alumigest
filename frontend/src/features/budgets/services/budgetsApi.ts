import { api } from '../../../lib/api';
import type { 
  BudgetFilters, 
  BudgetPageResponse, 
  BudgetSummary, 
  BudgetStatus,
  BudgetDetail,
  Budget,
  CreateBudgetPayload,
  WindowTemplate,
  BudgetItemCalculationRequest,
  BudgetItemCalculationResponse,
  DiscountRequest,
  BudgetItem,
  BudgetItemCreateRequest,
} from '../types';
import type { PageResponse } from '../../catalog/types';



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
    validUntil: data.validUntil ? (data.validUntil.includes('T') ? data.validUntil : `${data.validUntil}T23:59:59Z`) : undefined,
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

function toBackendDiscountPayload(data: DiscountRequest) {
  const tipoDesconto = data.tipoDesconto ?? data.discountType;
  const valor = data.valor ?? data.value ?? 0;
  const condicaoPagamento = data.condicaoPagamento ?? data.paymentCondition;
  const observacoesPagamento = data.observacoesPagamento ?? data.paymentNotes;
  const rawDate = data.dataValidade ?? data.validUntil;
  const dataValidade = rawDate ? (rawDate.includes('T') ? rawDate.split('T')[0] : rawDate) : undefined;

  return {
    tipoDesconto,
    valor,
    condicaoPagamento,
    observacoesPagamento,
    dataValidade,
  };
}

function toBackendBudgetItemPayload(item: BudgetItemCreateRequest) {
  return {
    productId: item.productId,
    widthMm: item.widthMm ?? item.width ?? 0,
    heightMm: item.heightMm ?? item.height ?? 0,
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
  };
}

function mapBackendToBudgetItem(res: any): BudgetItem {
  return {
    tempId: res.id ? String(res.id) : String(Date.now()),
    productId: res.productId,
    productName: res.productName || '',
    templateType: res.templateType || '',
    templateConfig: parseJsonConfig(res.templateConfig, {} as any),
    handleConfig: parseJsonConfig(res.handleConfig, { handleType: 'PUXADOR_H', position: 'VERTICAL', heightMm: 1000 } as any),
    drillingConfig: parseJsonConfig(res.drillingConfig, { holeCount: 0, diameterMm: 0, distanceMm: 0 } as any),
    widthMm: Number(res.widthMm ?? res.width ?? 0),
    heightMm: Number(res.heightMm ?? res.height ?? 0),
    quantity: Number(res.quantity ?? 1),
    laborCost: Number(res.laborCost ?? 0),
    subtotal: Number(res.subtotal ?? 0),
    unitPrice: res.unitPrice !== undefined ? Number(res.unitPrice) : undefined,
    notes: res.notes,
    options: Array.isArray(res.options)
      ? res.options.map((opt: any) => ({
          id: opt.id,
          materialId: opt.materialId,
          materialName: opt.materialName || '',
          categoryType: opt.categoryType,
          unitMeasure: opt.unitMeasure || '',
          quantity: Number(opt.quantity ?? 0),
          unitPrice: Number(opt.unitPrice ?? 0),
          totalPrice: Number(opt.totalPrice ?? (Number(opt.quantity ?? 0) * Number(opt.unitPrice ?? 0))),
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

        const totalElements = Number(response.data.totalElements ?? mappedContent.length);
        const totalPages = Number(response.data.totalPages ?? Math.max(1, Math.ceil(totalElements / filters.size)));
        const pageNumber = Number(response.data.page ?? filters.page);
        const pageSize = Number(response.data.size ?? filters.size);

        return {
          content: mappedContent,
          page: pageNumber,
          size: pageSize,
          totalElements,
          totalPages,
          isFirst: pageNumber === 0,
          isLast: pageNumber >= totalPages - 1,
        };
      }
      throw new Error('Formato de resposta inválido da API');
    } catch (error) {
      console.error('Erro ao buscar orçamentos', error);
      throw error;
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

  previewItemCalculation: async (payload: BudgetItemCalculationRequest): Promise<BudgetItemCalculationResponse> => {
    const response = await api.post<BudgetItemCalculationResponse>('/api/orcamentos/items/preview-calculation', payload, {
      baseURL: '',
    });
    return response.data;
  },

  applyDiscount: async (id: string, data: DiscountRequest): Promise<Budget> => {
    const payload = toBackendDiscountPayload(data);
    const response = await api.put<any>(`/api/budgets/${id}/discount`, payload, {
      baseURL: '',
    });
    return mapBackendToBudgetDetail(response.data);
  },

  addBudgetItem: async (id: string, item: BudgetItemCreateRequest): Promise<BudgetItem> => {
    const backendPayload = toBackendBudgetItemPayload(item);
    const response = await api.post<any>(`/api/budgets/${id}/items`, backendPayload, {
      baseURL: '',
    });
    return mapBackendToBudgetItem(response.data);
  },
};

