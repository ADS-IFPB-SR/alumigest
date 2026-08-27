import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../services/budgetsApi';
import type { CustomerRequest, CreateBudgetPayload } from '../types';
import toast from 'react-hot-toast';

// ============================================================
// CLIENTES
// ============================================================

export const useSearchClientes = (busca: string) => {
  return useQuery({
    queryKey: ['clientes', 'search', busca],
    queryFn: () => budgetsApi.searchClientes(busca),
    enabled: busca.trim().length >= 2,
    staleTime: 30_000,
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerRequest) => budgetsApi.createCliente(data),
    onSuccess: () => {
      toast.success('Cliente cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar cliente:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao cadastrar cliente.';
      toast.error(message);
    },
  });
};

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

export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getBudgets(),
    staleTime: 60_000,
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
