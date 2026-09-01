import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, type CreateCustomerRequest } from '../services/customersApi';
import toast from 'react-hot-toast';

export const useCustomers = (search?: string) => {
  return useQuery({
    queryKey: ['customers', search ?? ''],
    queryFn: () => customersApi.getCustomers(search),
    staleTime: 60_000,
  });
};

export const useCustomer = (id: string | undefined) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getCustomerById(id!),
    enabled: Boolean(id),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.createCustomer(data),
    onSuccess: () => {
      toast.success('Cliente cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar cliente:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Erro ao cadastrar cliente. Verifique os dados.';
      toast.error(message);
    },
  });
};
