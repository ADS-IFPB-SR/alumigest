import { api } from '@/lib/api';
import type {
  StockFilterParams,
  StockItem,
  StockMovement,
  StockMovementRequest,
} from '../types';

export const stockApi = {
  /**
   * Consulta os saldos consolidados de estoque (com filtros opcionais).
   */
  listBalances: async (params?: StockFilterParams): Promise<StockItem[]> => {
    const { data } = await api.get<StockItem[]>('/api/v1/stock', { params });
    return data;
  },

  /**
   * Obtém o saldo detalhado de um insumo específico pelo ID do material.
   */
  getBalance: async (materialId: string): Promise<StockItem> => {
    const { data } = await api.get<StockItem>(`/api/v1/stock/materials/${materialId}`);
    return data;
  },

  /**
   * Lista a trilha histórica de movimentações (Kardex).
   */
  listMovements: async (materialId?: string): Promise<StockMovement[]> => {
    const { data } = await api.get<StockMovement[]>('/api/v1/stock/movements', {
      params: materialId ? { materialId } : undefined,
    });
    return data;
  },

  /**
   * Registra manualmente uma movimentação de estoque (entrada, ajuste ou perda).
   */
  registerMovement: async (payload: StockMovementRequest): Promise<StockMovement> => {
    const { data } = await api.post<StockMovement>('/api/v1/stock/movements', payload);
    return data;
  },

  /**
   * Dispara a reserva automática de materiais para uma Ordem de Serviço ou Venda Avulsa.
   */
  reserveForOrder: async (orderId: string): Promise<void> => {
    await api.post(`/api/v1/stock/reserve-for-order/${orderId}`);
  },

  /**
   * Efetua a baixa física definitiva de materiais para uma O.S. concluída.
   */
  consumeForOrder: async (orderId: string): Promise<void> => {
    await api.post(`/api/v1/stock/consume-for-order/${orderId}`);
  },

  /**
   * Cancela as reservas de uma Ordem de Serviço cancelada.
   */
  cancelReservationsForOrder: async (orderId: string): Promise<void> => {
    await api.post(`/api/v1/stock/cancel-reservations/${orderId}`);
  },
};
