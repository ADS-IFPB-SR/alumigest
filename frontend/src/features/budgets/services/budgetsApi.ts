import { api } from '../../../lib/api';
import type {
  Customer,
  CustomerRequest,
  PageResponse,
  BudgetSummary,
  BudgetDetail,
  CreateBudgetPayload,
  WindowTemplate,
} from '../types';

// ============================================================
// CLIENTES
// Nota: A spec da API usa /clientes sem prefixo /v1.
// O baseURL do axios é '/api/v1'. Se necessário ajustar para '/api',
// use api.get('/v1/clientes') ou configure baseURL por chamada.
// ============================================================

export const budgetsApi = {
  // Busca clientes pelo nome/documento (autocomplete)
  searchClientes: async (busca: string): Promise<Customer[]> => {
    const response = await api.get<PageResponse<Customer>>('/clientes', {
      params: { busca, size: 10, ativo: true },
    });
    // O interceptor já extrai response.data.data → aqui é o PageResponse<Customer>
    return (response.data as unknown as PageResponse<Customer>).content ?? (response.data as unknown as Customer[]);
  },

  // Cria novo cliente
  createCliente: async (data: CustomerRequest): Promise<Customer> => {
    const response = await api.post<Customer>('/clientes', data);
    return response.data;
  },

  // ============================================================
  // TEMPLATES DE ESQUADRIAS
  // Reutiliza o endpoint de produtos do catálogo existente.
  // O campo templateType no produto diferencia templates de esquadrias.
  // ============================================================
  getWindowTemplates: async (): Promise<WindowTemplate[]> => {
    const response = await api.get<PageResponse<WindowTemplate>>('/catalog/products', {
      params: { size: 100 },
    });
    const data = response.data as unknown as PageResponse<WindowTemplate>;
    // Filtra apenas produtos que têm templateType (são templates de esquadria)
    const all = data.content ?? (response.data as unknown as WindowTemplate[]);
    return all.filter((p) => Boolean(p.templateType));
  },

  // ============================================================
  // ORÇAMENTOS
  // ============================================================

  // Lista orçamentos paginados
  getBudgets: async (page = 0): Promise<PageResponse<BudgetSummary>> => {
    const response = await api.get<PageResponse<BudgetSummary>>('/orcamentos', {
      params: { page, size: 20 },
    });
    return response.data as unknown as PageResponse<BudgetSummary>;
  },

  // Detalhe de um orçamento
  getBudget: async (id: string): Promise<BudgetDetail> => {
    const response = await api.get<BudgetDetail>(`/orcamentos/${id}`);
    return response.data;
  },

  // Cria novo orçamento
  createBudget: async (data: CreateBudgetPayload): Promise<BudgetDetail> => {
    const response = await api.post<BudgetDetail>('/orcamentos', data);
    return response.data;
  },

  // Atualiza orçamento existente
  updateBudget: async (id: string, data: CreateBudgetPayload): Promise<BudgetDetail> => {
    const response = await api.put<BudgetDetail>(`/orcamentos/${id}`, data);
    return response.data;
  },
};
