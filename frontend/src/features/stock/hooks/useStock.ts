import React from 'react';
import {
  QueryClient,
  QueryClientContext,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { stockApi } from '../api/stockApi';
import type {
  MaterialWithStockCreateRequest,
  OrderStockAlert,
  StockFilterParams,
  StockMovementRequest,
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

// Fallback client defensivo para testes unitários isolados que não fornecem QueryClientProvider
const fallbackClient = new QueryClient({
  defaultOptions: {
    queries: { enabled: false, retry: false },
  },
});

/**
 * Hook para consultar os saldos consolidados de estoque com filtros reativos.
 */
export const useStockBalances = (
  params?: StockFilterParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['stock-balances', params],
    queryFn: () => stockApi.listBalances(params),
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook para consultar o saldo de um material específico.
 */
export const useStockItem = (materialId: string | undefined) => {
  return useQuery({
    queryKey: ['stock-item', materialId],
    queryFn: () => stockApi.getBalance(materialId!),
    enabled: Boolean(materialId),
  });
};

/**
 * Hook para listar o histórico Kardex de movimentações.
 */
export const useStockMovements = (materialId?: string) => {
  return useQuery({
    queryKey: ['stock-movements', materialId],
    queryFn: () => stockApi.listMovements(materialId),
  });
};

/**
/**
 * Hook dedicado à Gaveta Lateral Kardex (US-22.2): busca a trilha de movimentações
 * apenas quando há um material selecionado e a gaveta está aberta.
 */
export const useKardex = (materialId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['stock-movements', materialId],
    queryFn: () => stockApi.listMovements(materialId),
    enabled: Boolean(materialId) && enabled,
  });
};

/**
 * Hook para consultar o status Make-to-Order agregado dos materiais reservados de uma O.S.
 * Retorna alertStatus (pior status) e lista de insumos com déficit (US-21.4).
 * Suporta fallback transparente quando renderizado fora de um QueryClientProvider.
 */
export const useStockAlertForOrder = (orderId: string | undefined): {
  data: OrderStockAlert | undefined;
  isLoading: boolean;
} => {
  const contextClient = React.useContext(QueryClientContext);
  const clientToUse = contextClient ?? fallbackClient;
  const isEnabled = Boolean(orderId) && Boolean(contextClient);

  return useQuery(
    {
      queryKey: ['stock-order-alert', orderId],
      queryFn: () => stockApi.getOrderStockAlert(orderId!),
      enabled: isEnabled,
      staleTime: 30_000,
    },
    clientToUse
  );
};

/**
 * Hook de mutação para registro manual de movimentação de estoque.
 */
export const useRegisterStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockMovementRequest) => stockApi.registerMovement(payload),
    onSuccess: () => {
      toast.success('Movimentação registrada com sucesso no Kardex!');
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-item'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-order-alert'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao registrar movimentação de estoque:', error);
      toast.error(extractErrorMessage(error, 'Erro ao registrar movimentação de estoque.'));
    },
  });
};

/**
 * Hook de mutação para disparar reserva de materiais de uma O.S.
 */
export const useReserveStockForOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => stockApi.reserveForOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-item'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-order-alert'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao reservar estoque:', error);
      toast.error(extractErrorMessage(error, 'Falha ao reservar estoque da O.S.'));
    },
  });
};

/**
 * Hook de mutação para efetuar baixa física definitiva dos materiais reservados de uma O.S. concluída.
 */
export const useConsumeStockForOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => stockApi.consumeForOrder(orderId),
    onSuccess: () => {
      toast.success('Baixa física de materiais registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-item'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-order-alert'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao realizar baixa física de estoque:', error);
      toast.error(extractErrorMessage(error, 'Falha ao realizar baixa física de estoque da O.S.'));
    },
  });
};

/**
 * Hook de mutação para estornar as reservas de materiais de uma O.S. cancelada.
 */
export const useCancelStockReservationsForOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => stockApi.cancelReservationsForOrder(orderId),
    onSuccess: () => {
      toast.success('Reservas de estoque estornadas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-item'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-order-alert'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao estornar reservas de estoque:', error);
      toast.error(extractErrorMessage(error, 'Falha ao estornar reservas de estoque da O.S.'));
    },
  });
};

/**
 * Hook de mutação para o fluxo 2 em 1 (Cadastro de Material + Auto-Provisionamento + Entrada Inicial).
 */
export const useCreateMaterialWithStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MaterialWithStockCreateRequest) =>
      stockApi.createMaterialWithStock(payload),
    onSuccess: (response, variables) => {
      const categoryLabels: Record<string, string> = {
        GLASS: 'Vidro cadastrado com sucesso!',
        PROFILE: 'Perfil cadastrado com sucesso!',
        HARDWARE: 'Ferragem cadastrada com sucesso!',
        FILM: 'Película cadastrada com sucesso!',
      };
      const baseLabel = categoryLabels[variables.categoryType] || 'Material cadastrado com sucesso!';

      const msg = response.initialMovement
        ? `${baseLabel} (Lote inicial registrado no estoque)`
        : baseLabel;
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-item'] });
      queryClient.invalidateQueries({ queryKey: ['stock-order-alert'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      queryClient.invalidateQueries({ queryKey: ['hardware'] });
      queryClient.invalidateQueries({ queryKey: ['films'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar material com estoque inicial:', error);
      toast.error(extractErrorMessage(error, 'Erro ao cadastrar material no catálogo e estoque.'));
    },
  });
};