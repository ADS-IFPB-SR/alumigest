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
  getCustomers: async (search?: string): Promise<CustomerSummaryDTO[]> => {
    const params: Record<string, string | number | boolean> = { size: 100 };
    if (search && search.trim().length >= 2) {
      params.busca = search;
    }
    const response = await api.get<PageResponse<CustomerSummaryDTO>>('/api/clientes', {
      baseURL: '',
      params,
    });
    return response.data?.content || [];
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
