import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { SeparateSaleFormData } from '../schemas/separateSaleSchema';
import toast from 'react-hot-toast';

export const useCreateSeparateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SeparateSaleFormData) => {
      const response = await api.post('/budgets/separate-sale', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Venda de parte adicionada ao orçamento!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar venda avulsa:', error);
      const message = error?.response?.data?.message || 'Erro ao processar a requisição.';
      toast.error(message);
    },
  });
};