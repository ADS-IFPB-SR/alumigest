import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi } from '../services/ordersApi';
import type { OrderCancelRequest, OrderFilterParams } from '../types';

/**
 * Hook para carregar os detalhes completos de um pedido pelo ID (US-13.5).
 */
export const useOrder = (id: string | undefined) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: Boolean(id),
  });
};

/**
 * Hook para listagem paginada de pedidos com filtros (US-14.1).
 */
export const useOrders = (params?: OrderFilterParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook de mutação para cancelamento de pedido de venda com justificativa (US-15.1).
 */
export const useCancelOrder = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderCancelRequest) => {
      if (!id) throw new Error('ID do pedido não informado.');
      return ordersApi.cancelOrder(id, data);
    },
    onSuccess: () => {
      toast.success('Pedido cancelado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao cancelar pedido. Tente novamente.';
      toast.error(message);
    },
  });
};
