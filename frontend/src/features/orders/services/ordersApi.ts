import { api } from '../../../lib/api';
import type {
  Order,
  OrderCancelRequest,
  OrderConvertRequest,
  OrderFilterParams,
  OrderSummary,
} from '../types';

export interface OrderPageResponse {
  content: OrderSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const ordersApi = {
  /**
   * Recupera os detalhes completos de um pedido de venda pelo ID (US-13.5).
   */
  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Converte um orçamento aprovado em pedido de venda (US-13.2 / US-13.3).
   * Chama o endpoint backend POST /api/v1/orders/convert/{budgetId}.
   */
  async convertBudget(budgetId: string, data: OrderConvertRequest): Promise<Order> {
    const response = await api.post<Order>(`/orders/convert/${budgetId}`, data);
    return response.data;
  },

  /**
   * Cancela um pedido de venda com justificativa obrigatória (US-15.1).
   */
  async cancelOrder(id: string, data: OrderCancelRequest): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/cancel`, data);
    return response.data;
  },

  /**
   * Lista pedidos de venda com paginação e filtros (US-13.4).
   */
  async getOrders(params?: OrderFilterParams): Promise<OrderPageResponse> {
    const response = await api.get<OrderPageResponse>('/orders', { params });
    return response.data;
  },
};

export const orderApi = ordersApi;
