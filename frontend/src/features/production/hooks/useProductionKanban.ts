import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { OrderSummary } from '../../orders/types';
import {
  productionApi,
  type UpdateProductionStatusPayload,
} from '../services/productionApi';
import {
  normalizeProductionStatus,
  type ProductionStatus,
} from '../types';



export const PRODUCTION_KANBAN_QUERY_KEY = ['production', 'kanban'] as const;

interface MutationContext {
  previousOrders?: OrderSummary[];
}

export function useProductionKanban() {
  const queryClient = useQueryClient();

  const kanbanQuery = useQuery<OrderSummary[], Error>({
    queryKey: PRODUCTION_KANBAN_QUERY_KEY,
    queryFn: productionApi.getProductionOrders,
  });

  const orders = kanbanQuery.data || [];

  const groupedOrders = orders.reduce<Record<ProductionStatus, OrderSummary[]>>(
    (acc, order) => {
      const statusKey = normalizeProductionStatus(order.status) || 'WAITING_PRODUCTION';
      if (!acc[statusKey]) {
        acc[statusKey] = [];
      }
      acc[statusKey].push(order);
      return acc;
    },
    {
      WAITING_PRODUCTION: [],
      IN_PRODUCTION: [],
      COMPLETED: [],
    }
  );

  const updateStatusMutation = useMutation<
    OrderSummary,
    Error,
    UpdateProductionStatusPayload,
    MutationContext
  >({
    mutationFn: productionApi.updateProductionStatus,

    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTION_KANBAN_QUERY_KEY });

      const previousOrders = queryClient.getQueryData<OrderSummary[]>(
        PRODUCTION_KANBAN_QUERY_KEY
      );

      if (previousOrders) {
        const nextOrders = previousOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: status as any,
            };
          }
          return order;
        });

        queryClient.setQueryData(PRODUCTION_KANBAN_QUERY_KEY, nextOrders);
      }

      return { previousOrders };
    },

    onError: (error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          PRODUCTION_KANBAN_QUERY_KEY,
          context.previousOrders
        );
      }

      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message || 'Erro ao alterar etapa de produção.';
      toast.error(message);
    },

    onSuccess: () => {
      toast.success('Etapa de produção atualizada com sucesso!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_KANBAN_QUERY_KEY });
    },
  });

  const handleMoveOrder = (orderId: string, newStatus: ProductionStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return {
    orders,
    groupedOrders,
    isLoading: kanbanQuery.isLoading,
    isError: kanbanQuery.isError,
    error: kanbanQuery.error,
    refetchKanban: kanbanQuery.refetch,

    onMoveOrder: handleMoveOrder,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}