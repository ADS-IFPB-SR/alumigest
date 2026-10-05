import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ordersApi } from '../services/ordersApi';
import type { OrderCancelRequest, OrderFilterParams } from '../types';

export { useConvertBudget } from './useConvertBudget';

/**
 * Hook para listar pedidos de venda paginados com filtros de busca, status e canal.
 * Utiliza keepPreviousData para garantir navegação suave entre fatias da paginação lazy.
 */
export const useOrders = (params?: OrderFilterParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook para buscar um pedido de venda específico por ID.
 */
export const useOrder = (id?: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: Boolean(id),
  });
};

/**
 * Hook de mutação para cancelar um pedido de venda com justificativa.
 */
export const useCancelOrder = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderCancelRequest) => ordersApi.cancelOrder(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
      }
    },
  });
};