import { api } from '../../../lib/api';
import type { OrderSummary } from '../../orders/types';
import type { ProductionStatus } from '../types';

export interface UpdateProductionStatusPayload {
  orderId: string;
  status: ProductionStatus;
  observacao?: string;
}

export const productionApi = {

  async getProductionOrders(): Promise<OrderSummary[]> {
    const response = await api.get<OrderSummary[]>('/production/orders');
    return response.data;
  },

  async updateProductionStatus(
    payload: UpdateProductionStatusPayload
  ): Promise<OrderSummary> {
    const { orderId, status, observacao } = payload;
    const response = await api.patch<OrderSummary>(
      `/production/orders/${orderId}/status`,
      {
        status,
        observacao,
      }
    );
    return response.data;
  },
};