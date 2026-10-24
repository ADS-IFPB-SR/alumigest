import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { parseApiError } from '../../../utils/error';
import type { Order, OrderSummary } from '../../orders/types';
import {
  productionApi,
  type UpdateProductionStatusPayload,
} from '../services/productionApi';
import {
  normalizeProductionStatus,
  type ProductionStatus,
} from '../types';

export const PRODUCTION_KANBAN_QUERY_KEY = ['production', 'kanban'] as const;

// Referência estável para evitar recriação de array vazio a cada renderização
const EMPTY_ORDERS: OrderSummary[] = [];

interface MutationContext {
  previousOrders?: OrderSummary[];
}

/**
 * Hook para gerenciamento do Kanban de Produção (US-18.2).
 * Integra busca paginada, agrupamento memoizado (filtrando apenas status válidos do fluxo)
 * e mutação otimista com rollback.
 */
export function useProductionKanban() {
  const queryClient = useQueryClient();

  // 1. Consulta principal de pedidos
  const kanbanQuery = useQuery<OrderSummary[], Error>({
    queryKey: PRODUCTION_KANBAN_QUERY_KEY,
    queryFn: productionApi.getProductionOrders,
  });

  const orders = kanbanQuery.data ?? EMPTY_ORDERS;

  // 2. Agrupamento memoizado descartando status fora do ciclo fabril (ex: CANCELLED, CREATED)
  const groupedOrders = useMemo(() => {
    return orders.reduce<Record<ProductionStatus, OrderSummary[]>>(
      (acc, order) => {
        const statusKey = normalizeProductionStatus(order.status);
        if (statusKey) {
          acc[statusKey].push(order);
        }
        return acc;
      },
      {
        WAITING_PRODUCTION: [],
        IN_PRODUCTION: [],
        COMPLETED: [],
      }
    );
  }, [orders]);

  // 3. Mutação com Atualização Otimista e Rollback
  const updateStatusMutation = useMutation<
    Order,
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
              status: status as OrderSummary['status'],
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

      const message = parseApiError(error, 'Erro ao alterar etapa de produção.');
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
    const currentOrder = orders.find((o) => o.id === orderId);
    if (currentOrder && normalizeProductionStatus(currentOrder.status) === newStatus) {
      return;
    }
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