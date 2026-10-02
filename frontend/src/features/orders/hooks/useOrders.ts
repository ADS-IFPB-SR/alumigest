import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../services/ordersApi';
import type { OrderFilterParams } from '../types';

export const useOrders = (params?: OrderFilterParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
    staleTime: 60_000,
  });
};