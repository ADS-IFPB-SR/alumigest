import { api } from '../../../lib/api';
import type { OrderFilterParams, OrderSummary } from '../types';

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export const ordersApi = {
  getOrders: async (params?: OrderFilterParams): Promise<PageResponse<OrderSummary>> => {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    };

    if (params?.busca && params.busca.trim().length >= 2) {
      queryParams.busca = params.busca.trim();
    }

    if (params?.status) {
      queryParams.status = params.status;
    }

    const response = await api.get<any>('/api/orders', {
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