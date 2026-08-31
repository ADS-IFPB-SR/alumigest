import { useQuery } from '@tanstack/react-query';
import { budgetsApi } from '../services/budgetsApi';
import type { BudgetFilters } from '../types';

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
