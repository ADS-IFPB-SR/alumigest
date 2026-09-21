import { api } from '../../../lib/api';
import type { 
  BudgetFilters, 
  BudgetPageResponse, 
  BudgetSummary, 
  BudgetStatus,
  Budget as BudgetDetail,
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

function formatValidUntil(val?: string): string | undefined {
  if (!val) return undefined;
  return val.includes('T') ? val : `${val}T23:59:59Z`;
}

function toBackendBudgetPayload(data: CreateBudgetPayload) {
  return {
    clientId: data.customerId,
    discountPercent: data.discountPercent,
    notes: data.notes,
    validUntil: formatValidUntil(data.validUntil),
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

function mapBackendToBudgetDetail(rawRes: any): BudgetDetail {
  // Desembrulha caso a resposta venha no formato ApiResponse { data: { ... } } ou wrapper de Spring
  const res = rawRes?.data ?? rawRes;
  
  // Mapeamento tolerante para dados do cliente (com parênteses protegidos para evitar erros de precedência)
  const clientData = res.customer ?? res.cliente ?? res.client ?? {};
  const clientId = res.clientId ?? res.customerId ?? clientData.id;
  const clientName = res.clientName ?? res.customerName ?? (clientData.name ?? clientData.nome ?? 'Cliente não identificado');

  // Deteta se os itens vierem em 'items', 'itens' ou 'esquadrias'
  const rawItems = res.items ?? res.itens ?? res.esquadrias ?? [];

  return {
    id: res.id,
    code: res.code ?? res.codigo,
    clientId: clientId,
    customerId: clientId,
    clientName: clientName,
    customerName: clientName,
    customer: {
      id: clientId,
      name: clientName,
      phone: res.clientPhone ?? res.telefoneCliente ?? (clientData.phone ?? clientData.telefone),
      email: res.clientEmail ?? res.emailCliente ?? (clientData.email),
      document: res.clientDocument ?? (clientData.document ?? clientData.cpfCnpj),
      address: res.clientAddress ?? (clientData.address ?? clientData.endereco),
    },
    status: res.status ?? 'DRAFT',
    createdAt: res.createdAt ?? res.dataCriacao ?? new Date().toISOString(),
    validUntil: res.validUntil ?? res.dataValidade ?? '',
    subtotal: Number(res.subtotal ?? res.valorSubtotal ?? 0),
    discountPercent: Number(res.discountPercent ?? res.percentualDesconto ?? 0),
    discountValue: Number(res.discountValue ?? res.valorDesconto ?? 0),
    total: Number(res.total ?? res.valorTotal ?? res.valorLiquido ?? 0),
    valorLiquido: Number(res.valorLiquido ?? res.total ?? res.valorTotal ?? 0),
    commercialConditions: res.commercialConditions ?? res.condicoesComerciais ?? res.paymentCondition,
    notes: res.notes ?? res.observacoes,
    itemCount: Array.isArray(rawItems) ? rawItems.length : 0,
    totalItems: Array.isArray(rawItems) ? rawItems.length : 0,
    items: Array.isArray(rawItems)
      ? rawItems.map((item: any) => ({
          id: item.id,
          tempId: item.id ? String(item.id) : String(Date.now()),
          productId: item.productId ?? item.produtoId,
          productName: item.productName ?? item.nomeProduto ?? (item.descricao || ''),
          templateType: item.templateType ?? item.tipoTemplate,
          templateConfig: parseJsonConfig(item.templateConfig ?? item.configuracaoTemplate, {} as any),
          handleConfig: parseJsonConfig(item.handleConfig ?? item.configuracaoPuxador, { handleType: 'PUXADOR_H', position: 'VERTICAL', heightMm: 1000 } as any),
          drillingConfig: parseJsonConfig(item.drillingConfig ?? item.configuracaoFuracao, { holeCount: 0, diameterMm: 0, distanceMm: 0 } as any),
          widthMm: Number(item.widthMm ?? item.larguraMm ?? item.width ?? 0),
          heightMm: Number(item.heightMm ?? item.alturaMm ?? item.height ?? 0),
          width: Number(item.widthMm ?? item.larguraMm ?? item.width ?? 0),
          height: Number(item.heightMm ?? item.alturaMm ?? item.height ?? 0),
          quantity: Number(item.quantity ?? item.quantidade ?? 1),
          laborCost: Number(item.laborCost ?? item.custoMaoDeObra ?? 0),
          subtotal: Number(item.subtotal ?? item.valorTotal ?? 0),
          unitPrice: item.unitPrice !== undefined ? Number(item.unitPrice) : (item.valorUnitario !== undefined ? Number(item.valorUnitario) : undefined),
          notes: item.notes ?? item.observacoes,
          options: Array.isArray(item.options ?? item.opcoes ?? item.materiais)
            ? (item.options ?? item.opcoes ?? item.materiais).map((opt: any) => ({
                id: opt.id,
                materialId: opt.materialId ?? opt.idMaterial,
                materialName: opt.materialName ?? opt.nomeMaterial ?? (opt.descricao || ''),
                unitMeasure: opt.unitMeasure ?? opt.unidadeMedida ?? '',
                categoryType: opt.categoryType ?? opt.tipoCategoria,
                selectedType: opt.selectedType,
                selectedColor: opt.selectedColor ?? opt.corSelecionada,
                quantity: Number(opt.quantity ?? opt.quantidade ?? 0),
                unitPrice: Number(opt.unitPrice ?? opt.precoUnitario ?? 0),
                totalPrice: Number(opt.totalPrice ?? opt.precoTotal ?? (Number(opt.quantity ?? opt.quantidade ?? 0) * Number(opt.unitPrice ?? opt.precoUnitario ?? 0))),
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
  let dataValidade: string | undefined;
  if (rawDate) {
    dataValidade = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  }

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
          itemCount: Number(b.itemCount ?? b.totalItems ?? 0),
          isExpired: Boolean(b.isExpired ?? b.expired),
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

  applyDiscount: async (id: string, data: DiscountRequest): Promise<BudgetDetail> => {
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

  getBudgetById: async (id: string) => {
    const response = await api.get(`http://localhost:8081/api/orcamentos/${id}`);
    return response.data?.data ?? response.data;
  },
};

