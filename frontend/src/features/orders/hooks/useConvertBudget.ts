import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi } from '../services/ordersApi';
import type { Order, OrderConvertRequest } from '../types';

export interface ConvertBudgetMutationVariables {
  budgetId?: string;
  data: OrderConvertRequest;
}

/**
 * Hook de mutação TanStack Query para aprovar e converter orçamento em pedido de venda (US-13.3).
 *
 * Suporta tanto a chamada:
 * - `const { mutate } = useConvertBudget(); mutate({ budgetId, data });`
 * quanto:
 * - `const { mutate } = useConvertBudget(budgetId); mutate(data);`
 */
export const useConvertBudget = (defaultBudgetId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    unknown,
    ConvertBudgetMutationVariables | OrderConvertRequest
  >({
    mutationFn: async (variables) => {
      const budgetId =
        'budgetId' in variables && variables.budgetId
          ? variables.budgetId
          : defaultBudgetId;

      if (!budgetId) {
        throw new Error('ID do orçamento não informado para conversão.');
      }

      const payload =
        'data' in variables
          ? variables.data
          : (variables as OrderConvertRequest);

      return ordersApi.convertBudget(budgetId, payload);
    },
    onSuccess: (order, variables) => {
      const budgetId =
        'budgetId' in variables && variables.budgetId
          ? variables.budgetId
          : defaultBudgetId;

      toast.success(
        order?.codigo
          ? `Orçamento aprovado e Pedido ${order.codigo} gerado com sucesso!`
          : 'Orçamento aprovado e Pedido de Venda gerado com sucesso!'
      );

      if (budgetId) {
        queryClient.invalidateQueries({ queryKey: ['budget', budgetId] });
      }
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message ||
        'Erro ao aprovar orçamento e gerar pedido. Tente novamente.';
      toast.error(message);
    },
  });
};
