import { ordersApi } from '../services/ordersApi';

export const useOrders = (params?: OrderFilterParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
  });
};