import { api } from '../../../lib/api';
import type {
  Order,
  OrderCancelRequest,
  OrderConvertRequest,
  OrderFilterParams,
  OrderSummary,
} from '../types';

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
  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async convertBudget(budgetId: string, data: OrderConvertRequest): Promise<Order> {
    const response = await api.post<Order>(`/orders/convert/${budgetId}`, data);
    return response.data;
  },

  async cancelOrder(id: string, data: OrderCancelRequest): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/cancel`, data);
    return response.data;
  },

  async getOrders(params?: OrderFilterParams): Promise<PageResponse<OrderSummary>> {
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

    const response = await api.get<any>('/orders', {
      params: queryParams,
    });

    return {
      content: response.data.content || [],
      page: {
        size: response.data.page?.size ?? response.data.size ?? queryParams.size,
        number: response.data.page?.number ?? response.data.number ?? queryParams.page,
        totalElements: response.data.page?.totalElements ?? response.data.totalElements ?? 0,
        totalPages: response.data.page?.totalPages ?? response.data.totalPages ?? 1,
      }
    };
  }
};