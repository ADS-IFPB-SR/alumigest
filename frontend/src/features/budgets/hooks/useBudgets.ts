import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, downloadPdfComercial, obterResumoWhatsApp } from '../services/budgetsApi';
import type { BudgetFilters, CreateBudgetPayload, BudgetStatus, DiscountRequest } from '../types';
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

export const useApplyDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountRequest }) =>
      budgetsApi.applyDiscount(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Condições comerciais aplicadas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao aplicar desconto e condições comerciais:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao aplicar desconto e condições comerciais.';
      toast.error(message);
    },
  });
};

// ============================================================
// PDF COMERCIAL & RESUMO WHATSAPP (US-10.10)
// ============================================================

/**
 * Hook para disparar o download do PDF comercial do orçamento.
 * Exibe toast de erro ao usuário em caso de falha na requisição.
 */
export const useDownloadPdfComercial = () => {
  return useMutation({
    mutationFn: ({ id, codigo }: { id: string; codigo: string }) =>
      downloadPdfComercial(id, codigo),
    onError: (error: unknown) => {
      console.error('Erro ao baixar PDF comercial:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao baixar o PDF. Tente novamente.';
      toast.error(message);
    },
  });
};

/**
 * Hook para obter o texto de resumo formatado para WhatsApp.
 * Exibe toast de erro ao usuário em caso de falha na requisição.
 */
export const useObterResumoWhatsApp = () => {
  return useMutation({
    mutationFn: (id: string) => obterResumoWhatsApp(id),
    onError: (error: unknown) => {
      console.error('Erro ao obter resumo para WhatsApp:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao obter resumo para WhatsApp. Tente novamente.';
      toast.error(message);
    },
  });
};

