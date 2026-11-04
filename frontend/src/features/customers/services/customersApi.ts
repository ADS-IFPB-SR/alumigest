import { api } from '../../../lib/api';

export type PersonType = 'FISICA' | 'JURIDICA';

export interface CustomerSummaryDTO {
  id: string;
  nomeCompleto: string;
  personType: PersonType;
  documento: string;
  telefone?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
}

export interface CustomerResponseDTO {
  id: string;
  nomeCompleto: string;
  personType: PersonType;
  documento: string;
  telefone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
  ativo: boolean;
}

export type BudgetStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface ClientDashboardDTO {
  id: string;
  nomeCompleto: string;
  personType: PersonType;
  documento?: string;
  telefone?: string;
  email?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  totalContratado: number;
  quantidadeOrdensServico: number;
  quantidadeOrcamentos: number;
}

export interface ClientBudgetSummaryDTO {
  id: string;
  codigo: string;
  dataCriacao: string;
  dataValidade?: string;
  valorTotal: number;
  status: BudgetStatus;
  statusDescricao?: string;
}

export interface CreateCustomerRequest {
  nomeCompleto: string;
  personType?: PersonType;
  documento: string;
  telefone: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export const customersApi = {
  getCustomers: async (params?: { busca?: string; page?: number; size?: number; ativo?: boolean }): Promise<PageResponse<CustomerSummaryDTO>> => {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    };
    if (params?.busca && params.busca.trim().length >= 2) {
      queryParams.busca = params.busca.trim();
    }
    if (params?.ativo !== undefined) {
      queryParams.ativo = params.ativo;
    }
    const response = await api.get<any>('/api/clientes', {
      baseURL: '',
      params: queryParams,
    });
    return {
      content: response.data.content || [],
      page: {
        size: response.data.size ?? queryParams.size,
        number: response.data.page ?? queryParams.page,
        totalElements: response.data.totalElements ?? 0,
        totalPages: response.data.totalPages ?? 1,
      }
    };
  },

  createCustomer: async (data: CreateCustomerRequest): Promise<CustomerResponseDTO> => {
    const response = await api.post<CustomerResponseDTO>('/api/clientes', data, {
      baseURL: '',
    });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<CustomerResponseDTO> => {
    const response = await api.get<CustomerResponseDTO>(`/api/clientes/${id}`, {
      baseURL: '',
    });
    return response.data;
  },

  getCustomerDashboard: async (id: string): Promise<ClientDashboardDTO> => {
    const response = await api.get<ClientDashboardDTO>(`/api/clientes/${id}/dashboard`, {
      baseURL: '',
    });
    return response.data;
  },

  getCustomerBudgets: async (id: string, params?: { page?: number; size?: number }): Promise<PageResponse<ClientBudgetSummaryDTO>> => {
    const queryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    };
    const response = await api.get<any>(`/api/clientes/${id}/budgets`, {
      baseURL: '',
      params: queryParams,
    });
    return {
      content: response.data.content || [],
      page: {
        size: response.data.size ?? queryParams.size,
        number: response.data.page ?? queryParams.page,
        totalElements: response.data.totalElements ?? 0,
        totalPages: response.data.totalPages ?? 1,
      }
    };
  }
};
