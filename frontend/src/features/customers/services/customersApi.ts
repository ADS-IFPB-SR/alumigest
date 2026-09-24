import { api } from '../../../lib/api';

export type PersonType = 'FISICA' | 'JURIDICA';

export interface CustomerSummaryDTO {
  id: string;
  nomeCompleto: string;
  personType: PersonType;
  documento: string;
  telefone?: string;
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

export interface CreateCustomerRequest {
  nomeCompleto: string;
  personType: PersonType;
  documento?: string;
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
  }
};
