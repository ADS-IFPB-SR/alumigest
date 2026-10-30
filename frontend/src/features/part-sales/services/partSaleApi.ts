import { api } from '@/lib/api';
import type {
  CalculatePartItemPayload,
  CalculatePartItemResult,
  CreatePartSaleRequest,
  PartSaleResponse,
  PartSaleStatus,
} from '../types/partSaleTypes';

export const partSaleApi = {
  async calculateItem(payload: CalculatePartItemPayload): Promise<CalculatePartItemResult> {
    const response = await api.post<CalculatePartItemResult>(
      '/part-sales/calculate-item',
      payload
    );
    return response.data;
  },

  async create(request: CreatePartSaleRequest): Promise<PartSaleResponse> {
    const response = await api.post<PartSaleResponse>('/part-sales', request);
    return response.data;
  },

  async getById(id: string): Promise<PartSaleResponse> {
    const response = await api.get<PartSaleResponse>(`/part-sales/${id}`);
    return response.data;
  },

  async list(): Promise<PartSaleResponse[]> {
    const response = await api.get<PartSaleResponse[]>('/part-sales');
    return response.data;
  },

  async updateStatus(id: string, status: PartSaleStatus): Promise<PartSaleResponse> {
    const response = await api.patch<PartSaleResponse>(`/part-sales/${id}/status`, { status });
    return response.data;
  },
};

export const partSalesApi = partSaleApi;
