import { api } from '../../../lib/api';
import type { Order, OrderSummary } from '../../orders/types';
import type { ProductionStatus } from '../types';

export interface UpdateProductionStatusPayload {
  orderId: string;
  status: ProductionStatus;
}

export type ProductionOrderSummary = OrderSummary & {
  items?: Array<{ id: string; descricao: string; quantidade: number }>;
};

export const productionApi = {
  async getProductionOrders(): Promise<ProductionOrderSummary[]> {
    const response = await api.get<{ content?: ProductionOrderSummary[] } | ProductionOrderSummary[]>('/orders', {
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
