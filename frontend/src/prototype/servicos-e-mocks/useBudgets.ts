import { useState, useCallback } from 'react';
import type { Budget, Customer, BudgetStatus } from '../tipos';
import { getBudgets, getBudgetById, createBudget, updateBudget, updateBudgetStatus, getCustomers, saveCustomer } from './budgetStorage';
import type { BudgetItem } from '../tipos';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>(() => getBudgets());
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());

  const refresh = useCallback(() => {
    setBudgets(getBudgets());
    setCustomers(getCustomers());
  }, []);

  const addCustomer = useCallback((customer: Customer) => {
    saveCustomer(customer);
    setCustomers(getCustomers());
    return customer;
  }, []);

  const addBudget = useCallback((customer: Customer, items: BudgetItem[], discountPercent: number, notes?: string) => {
    const budget = createBudget(customer, items, discountPercent, notes);
    setBudgets(getBudgets());
    return budget;
  }, []);

  const editBudget = useCallback((id: string, customer: Customer, items: BudgetItem[], discountPercent: number, notes?: string) => {
    const updated = updateBudget(id, customer, items, discountPercent, notes);
    setBudgets(getBudgets());
    return updated;
  }, []);

  const changeStatus = useCallback((id: string, status: BudgetStatus) => {
    const updated = updateBudgetStatus(id, status);
    setBudgets(getBudgets());
    return updated;
  }, []);

  const findBudget = useCallback((id: string) => {
    return getBudgetById(id);
  }, []);

  return {
    budgets,
    customers,
    refresh,
    addCustomer,
    addBudget,
    editBudget,
    changeStatus,
    findBudget,
  };
}
