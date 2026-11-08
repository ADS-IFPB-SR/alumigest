import { api } from '@/lib/api';
import type {
  CalculatePartItemPayload,
  CalculatePartItemResult,
  CreatePartSaleRequest,
  MaterialOption,
  PartSaleFilterParams,
  PartSalePageResponse,
  PartSaleResponse,
  PartSaleStatus,
} from '../types/partSaleTypes';

export const partSaleApi = {
  async getMaterialsByCategory(category?: string): Promise<MaterialOption[]> {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await api.get<MaterialOption[]>(`/materials${params}`);
    return response.data;
  },

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

  async list(params?: PartSaleFilterParams): Promise<PartSalePageResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', String(params.page));
    if (params?.size !== undefined) searchParams.append('size', String(params.size));
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.sort) searchParams.append('sort', params.sort);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await api.get<PartSalePageResponse>(`/part-sales${query}`);
    return response.data;
  },

  async updateStatus(id: string, status: PartSaleStatus): Promise<PartSaleResponse> {
    const response = await api.patch<PartSaleResponse>(`/part-sales/${id}/status`, { status });
    return response.data;
  },
};

export const partSalesApi = partSaleApi;
