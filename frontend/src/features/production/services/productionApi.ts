import { api } from '../../../lib/api';
import type { Order, OrderSummary } from '../../orders/types';
import type { ProductionStatus } from '../types';

export interface UpdateProductionStatusPayload {
  orderId: string;
  status: ProductionStatus;
}

export const productionApi = {

  async getProductionOrders(): Promise<OrderSummary[]> {
    const response = await api.get<{ content?: OrderSummary[] } | OrderSummary[]>('/orders', {
      params: { size: 100 },
    });

    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.content ?? [];
  },

  
  async updateProductionStatus(payload: UpdateProductionStatusPayload): Promise<Order> {
    const { orderId, status } = payload;
    const response = await api.patch<Order>(
      `/orders/${orderId}/production-status`,
      { status }
    );
    return response.data;
  },
};