import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { partSalesApi } from '../services/partSalesApi';
import type {
  CalculatePartItemRequest,
  CreatePartSaleRequest,
  PartSaleStatus,
} from '../types';

interface ApiErrorData {
  message?: string;
  error?: string;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as AxiosError<ApiErrorData>;
    return axiosErr.response?.data?.message || axiosErr.response?.data?.error || fallback;
  }
  return fallback;
}

export const usePartSalesList = () => {
  return useQuery({
    queryKey: ['part-sales'],
    queryFn: partSalesApi.list,
  });
};

export const usePartSale = (id: string | undefined) => {
  return useQuery({
    queryKey: ['part-sales', id],
    queryFn: () => partSalesApi.getById(id!),
    enabled: Boolean(id),
  });
};

export const useCalculatePartItem = () => {
  return useMutation({
    mutationFn: (request: CalculatePartItemRequest) => partSalesApi.calculateItem(request),
    onError: (error: unknown) => {
      console.error('Erro ao calcular item de venda:', error);
      toast.error(extractErrorMessage(error, 'Erro ao calcular valores do item.'));
    },
  });
};

export const useCreatePartSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePartSaleRequest) => partSalesApi.create(request),
    onSuccess: (data) => {
      toast.success(`Venda avulsa ${data.code} gerada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['part-sales'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao salvar venda avulsa:', error);
      toast.error(extractErrorMessage(error, 'Erro ao registrar venda avulsa.'));
    },
  });
};

export const useUpdatePartSaleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PartSaleStatus }) =>
      partSalesApi.updateStatus(id, status),
    onSuccess: (data) => {
      toast.success(`Status da venda ${data.code} atualizado para ${data.status}!`);
      queryClient.invalidateQueries({ queryKey: ['part-sales'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar status da venda:', error);
      toast.error(extractErrorMessage(error, 'Erro ao atualizar status da venda.'));
    },
  });
};

