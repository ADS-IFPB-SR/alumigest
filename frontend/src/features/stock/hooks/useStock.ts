import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { stockApi } from '../api/stockApi';
import type {
  MaterialWithStockCreateRequest,
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

/**
 * Hook para consultar os saldos consolidados de estoque com filtros reativos.
 */
export const useStockBalances = (params?: StockFilterParams) => {
  return useQuery({
    queryKey: ['stock-balances', params],
    queryFn: () => stockApi.listBalances(params),
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
 * Hook de mutação para registro manual de movimentação de estoque.
 */
export const useRegisterStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockMovementRequest) => stockApi.registerMovement(payload),
    onSuccess: () => {
      toast.success('Movimentação registrada com sucesso no Kardex!');
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-item'] });
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
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
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
    onSuccess: (response) => {
      const msg = response.initialMovement
        ? 'Material cadastrado e lote inicial registrado no estoque!'
        : 'Material cadastrado e provisionado no estoque com sucesso!';
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