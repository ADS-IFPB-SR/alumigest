import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../services/budgetsApi';
import type { BudgetFilters, CreateBudgetPayload, BudgetStatus } from '../types';
import toast from 'react-hot-toast';

// ============================================================
// TEMPLATES DE ESQUADRIAS
// ============================================================
export const useWindowTemplates = () => {
  return useQuery({
    queryKey: ['windowTemplates'],
    queryFn: budgetsApi.getWindowTemplates,
    staleTime: 5 * 60_000,
  });
};

// ============================================================
// ORÇAMENTOS
// ============================================================
export const useBudgets = (filters: BudgetFilters) => {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetsApi.getBudgets(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useBudgetStatusCounts = () => {
  return useQuery({
    queryKey: ['budgets', 'status-counts'],
    queryFn: () => budgetsApi.getStatusCounts(),
  });
};

export const useBudget = (id: string | undefined) => {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsApi.getBudget(id!),
    enabled: Boolean(id),
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetPayload) => budgetsApi.createBudget(data),
    onSuccess: () => {
      toast.success('Orçamento criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao criar orçamento:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao criar orçamento. Tente novamente.';
      toast.error(message);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBudgetPayload }) =>
      budgetsApi.updateBudget(id, data),
    onSuccess: (_, variables) => {
      toast.success('Orçamento atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', variables.id] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar orçamento:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao atualizar orçamento.';
      toast.error(message);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.deleteBudget(id),
    onSuccess: () => {
      toast.success('Orçamento excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao excluir orçamento:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao excluir orçamento.';
      toast.error(message);
    },
  });
};

export const useUpdateBudgetStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BudgetStatus }) =>
      budgetsApi.updateBudgetStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success('Status do orçamento atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', variables.id] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar status do orçamento:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao atualizar status.';
      toast.error(message);
    },
  });
};

export const useExportBudgetPdf = () => {
  return useMutation({
    mutationFn: async ({ id, code }: { id: string; code?: string }) => {
      const blob = await budgetsApi.exportBudgetPdf(id);
      return { blob, code };
    },
    onSuccess: ({ blob, code }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orcamento-${code || 'proposta'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download do PDF iniciado!');
    },
    onError: (error: unknown) => {
      console.error('Erro ao exportar PDF do orçamento:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message ||
        'O serviço de geração de PDF ainda não está disponível no servidor.';
      toast.error(message);
    },
  });
};

export const useRecalculateBudget = () => {
  return useMutation({
    mutationFn: (payload: unknown) => budgetsApi.recalculateBudget(payload),
  });
};
