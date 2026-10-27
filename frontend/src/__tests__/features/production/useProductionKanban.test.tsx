import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  useProductionKanban,
  PRODUCTION_KANBAN_QUERY_KEY,
} from '../../../features/production/hooks/useProductionKanban';
import { productionApi } from '../../../features/production/services/productionApi';
import type { Order, OrderSummary } from '../../../features/orders/types';

// Mock da camada de serviço da API de Produção
vi.mock('../../../features/production/services/productionApi', () => ({
  productionApi: {
    getProductionOrders: vi.fn(),
    updateProductionStatus: vi.fn(),
  },
}));

// Mock do react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useProductionKanban Hook — [US-18.2 / #502]', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  const createMockOrder = (
    id: string,
    status: OrderSummary['status'],
    codigo = `OS-2026-${id}`
  ): OrderSummary => ({
    id,
    codigo,
    orcamentoId: `orc-${id}`,
    orcamentoCodigo: `ORC-2026-${id}`,
    clienteNome: `Cliente ${id}`,
    status,
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-01',
    dataPrevisaoEntrega: '2026-10-30',
    valorLiquido: 1500,
    quantidadeItens: 2,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
  });

  // =========================================================================
  // 1. PARTICIONAMENTO DE EQUIVALÊNCIA (Equivalence Partitioning)
  // =========================================================================
  describe('1. [Particionamento de Equivalência]', () => {
    it('EP-01: deve carregar e agrupar pedidos com status fabris válidos nas 3 colunas canônicas', async () => {
      const mockOrders: OrderSummary[] = [
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
        createMockOrder('ord-2', 'IN_PRODUCTION'),
        createMockOrder('ord-3', 'COMPLETED'),
        createMockOrder('ord-4', 'WAITING_PRODUCTION'),
      ];

      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.orders).toHaveLength(4);
      expect(result.current.groupedOrders.WAITING_PRODUCTION).toHaveLength(2);
      expect(result.current.groupedOrders.IN_PRODUCTION).toHaveLength(1);
      expect(result.current.groupedOrders.COMPLETED).toHaveLength(1);

      expect(result.current.groupedOrders.WAITING_PRODUCTION[0].id).toBe('ord-1');
      expect(result.current.groupedOrders.WAITING_PRODUCTION[1].id).toBe('ord-4');
      expect(result.current.groupedOrders.IN_PRODUCTION[0].id).toBe('ord-2');
      expect(result.current.groupedOrders.COMPLETED[0].id).toBe('ord-3');
    });

    it('EP-02: deve descartar do agrupamento fabril ordens com status fora do ciclo produtivo (CREATED, CANCELLED)', async () => {
      const mockOrders: OrderSummary[] = [
        createMockOrder('ord-fabril', 'IN_PRODUCTION'),
        createMockOrder('ord-created', 'CREATED'),
        createMockOrder('ord-cancelled', 'CANCELLED'),
      ];

      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // As ordens ainda existem no array bruto de orders
      expect(result.current.orders).toHaveLength(3);

      // Mas as colunas do Kanban só contêm a ordem com status fabril válido
      expect(result.current.groupedOrders.WAITING_PRODUCTION).toHaveLength(0);
      expect(result.current.groupedOrders.IN_PRODUCTION).toHaveLength(1);
      expect(result.current.groupedOrders.IN_PRODUCTION[0].id).toBe('ord-fabril');
      expect(result.current.groupedOrders.COMPLETED).toHaveLength(0);
    });

    it('EP-03: deve exibir toast de sucesso ao atualizar etapa com sucesso', async () => {
      const initialOrders: OrderSummary[] = [
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
      ];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);

      const updatedOrder: Order = {
        ...(initialOrders[0] as unknown as Order),
        status: 'IN_PRODUCTION',
      };
      vi.mocked(productionApi.updateProductionStatus).mockResolvedValue(updatedOrder);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-1', 'IN_PRODUCTION');
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Etapa de produção atualizada com sucesso!');
        expect(productionApi.updateProductionStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            orderId: 'ord-1',
            status: 'IN_PRODUCTION',
          }),
          expect.anything()
        );
      });
    });

    it('EP-04: deve exibir toast de erro customizado quando a API rejeitar a mutação', async () => {
      const initialOrders: OrderSummary[] = [
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
      ];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);

      const apiError = new Error('Transição inválida para o pedido.');
      vi.mocked(productionApi.updateProductionStatus).mockRejectedValue(apiError);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-1', 'COMPLETED');
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Transição inválida para o pedido.');
      });
    });

    it('EP-05: deve ignorar (no-op) e não disparar mutação nem toast ao tentar mover pedido para o mesmo status [Bug #498]', async () => {
      const initialOrders: OrderSummary[] = [
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
      ];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-1', 'WAITING_PRODUCTION');
      });

      expect(productionApi.updateProductionStatus).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 2. ANÁLISE DE VALOR LIMITE (Boundary Value Analysis)
  // =========================================================================
  describe('2. [Análise de Valor Limite]', () => {
    it('BVA-01: deve utilizar a referência estável EMPTY_ORDERS quando data for undefined (estado inicial/loading)', () => {
      // API pendente, sem retorno ainda
      vi.mocked(productionApi.getProductionOrders).mockReturnValue(new Promise(() => {}));

      const { result, rerender } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.orders).toEqual([]);

      const firstReference = result.current.orders;
      rerender();
      // Garante referência idêntica para evitar disparos em dependências de useMemo/useEffect
      expect(result.current.orders).toBe(firstReference);
    });

    it('BVA-02: deve inicializar todas as 3 colunas do agrupador como arrays vazios quando a API retornar lista vazia ([])', async () => {
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue([]);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.orders).toEqual([]);
      expect(result.current.groupedOrders).toEqual({
        WAITING_PRODUCTION: [],
        IN_PRODUCTION: [],
        COMPLETED: [],
      });
    });

    it('BVA-03: deve operar corretamente no limite de exatamente 1 ordem no quadro fabril', async () => {
      const singleOrder = [createMockOrder('ord-unique', 'IN_PRODUCTION')];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(singleOrder);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.groupedOrders.IN_PRODUCTION).toHaveLength(1);
      expect(result.current.groupedOrders.WAITING_PRODUCTION).toHaveLength(0);
      expect(result.current.groupedOrders.COMPLETED).toHaveLength(0);
    });

    it('BVA-04: não deve alterar ordens existentes ao tentar mover um orderId inexistente no cache', async () => {
      const orders = [
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
        createMockOrder('ord-2', 'IN_PRODUCTION'),
      ];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(orders);
      vi.mocked(productionApi.updateProductionStatus).mockResolvedValue({} as Order);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-inexistente', 'COMPLETED');
      });

      // As ordens originais no cache permanecem inalteradas
      const cacheOrders = queryClient.getQueryData<OrderSummary[]>(PRODUCTION_KANBAN_QUERY_KEY);
      expect(cacheOrders?.find((o) => o.id === 'ord-1')?.status).toBe('WAITING_PRODUCTION');
      expect(cacheOrders?.find((o) => o.id === 'ord-2')?.status).toBe('IN_PRODUCTION');
    });
  });

  // =========================================================================
  // 3. TABELA DE DECISÃO (Decision Table)
  // =========================================================================
  describe('3. [Tabela de Decisão]', () => {
    it('DT-01: Estado Carregamento (Loading=true, Error=false) -> orders vazio e isLoading=true', () => {
      vi.mocked(productionApi.getProductionOrders).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.orders).toEqual([]);
    });

    it('DT-02: Estado Erro na Carga (Loading=false, Error=true) -> error preenchido e isError=true', async () => {
      const loadError = new Error('Falha de conexão com a API.');
      vi.mocked(productionApi.getProductionOrders).mockRejectedValue(loadError);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(loadError);
      expect(result.current.orders).toEqual([]);
    });

    it('DT-03: Estado Sucesso na Carga (Loading=false, Error=false) -> orders e groupedOrders preenchidos', async () => {
      const loaded = [createMockOrder('ord-1', 'WAITING_PRODUCTION')];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(loaded);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.orders).toEqual(loaded);
      expect(result.current.groupedOrders.WAITING_PRODUCTION).toHaveLength(1);
    });

    it('DT-04: Falha na mutação com context.previousOrders definido -> restaura o cache anterior', async () => {
      const initialOrders = [
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
        createMockOrder('ord-2', 'IN_PRODUCTION'),
      ];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);
      vi.mocked(productionApi.updateProductionStatus).mockRejectedValue(new Error('Erro 500'));

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-1', 'COMPLETED');
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // O cache do react-query foi restaurado para o estado anterior
      const restoredOrders = queryClient.getQueryData<OrderSummary[]>(PRODUCTION_KANBAN_QUERY_KEY);
      expect(restoredOrders?.find((o) => o.id === 'ord-1')?.status).toBe('WAITING_PRODUCTION');
    });

    it('DT-05: Falha na mutação quando context ou previousOrders for indefinido -> lida sem quebras com fallback de mensagem', async () => {
      // Configura mutação sem cache inicial no queryClient
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue([]);
      vi.mocked(productionApi.updateProductionStatus).mockRejectedValue('Erro genérico em string');

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Limpa dados de cache para forçar previousOrders a ser undefined no onMutate
      queryClient.removeQueries({ queryKey: PRODUCTION_KANBAN_QUERY_KEY });

      act(() => {
        result.current.updateStatus({ orderId: 'ord-x', status: 'IN_PRODUCTION' });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao alterar etapa de produção.');
      });
    });

    it('DT-06: Execução via updateStatusAsync -> resolve a Promise em sucesso ou rejeita em erro', async () => {
      const initialOrders = [createMockOrder('ord-1', 'WAITING_PRODUCTION')];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);

      const expectedResponse: Order = {
        ...(initialOrders[0] as unknown as Order),
        status: 'IN_PRODUCTION',
      };
      vi.mocked(productionApi.updateProductionStatus).mockResolvedValue(expectedResponse);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let asyncResult: Order | undefined;
      await act(async () => {
        asyncResult = await result.current.updateStatusAsync({
          orderId: 'ord-1',
          status: 'IN_PRODUCTION',
        });
      });

      expect(asyncResult).toEqual(expectedResponse);
    });
  });

  // =========================================================================
  // 4. TRANSIÇÃO DE ESTADOS E MUTAÇÃO OTIMISTA (State Transition)
  // =========================================================================
  describe('4. [Transição de Estados e Mutação Otimista]', () => {
    it('ST-01: deve realizar a transição canônica WAITING_PRODUCTION -> IN_PRODUCTION', async () => {
      const initialOrders = [createMockOrder('ord-1', 'WAITING_PRODUCTION')];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);
      vi.mocked(productionApi.updateProductionStatus).mockResolvedValue({
        ...(initialOrders[0] as unknown as Order),
        status: 'IN_PRODUCTION',
      });

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-1', 'IN_PRODUCTION');
      });

      await waitFor(() => {
        expect(productionApi.updateProductionStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            orderId: 'ord-1',
            status: 'IN_PRODUCTION',
          }),
          expect.anything()
        );
      });
    });

    it('ST-02: deve realizar a transição canônica IN_PRODUCTION -> COMPLETED', async () => {
      const initialOrders = [createMockOrder('ord-2', 'IN_PRODUCTION')];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);
      vi.mocked(productionApi.updateProductionStatus).mockResolvedValue({
        ...(initialOrders[0] as unknown as Order),
        status: 'COMPLETED',
      });

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-2', 'COMPLETED');
      });

      await waitFor(() => {
        expect(productionApi.updateProductionStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            orderId: 'ord-2',
            status: 'COMPLETED',
          }),
          expect.anything()
        );
      });
    });

    it('ST-03: deve permitir a transição reversa COMPLETED -> IN_PRODUCTION', async () => {
      const initialOrders = [createMockOrder('ord-3', 'COMPLETED')];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);
      vi.mocked(productionApi.updateProductionStatus).mockResolvedValue({
        ...(initialOrders[0] as unknown as Order),
        status: 'IN_PRODUCTION',
      });

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-3', 'IN_PRODUCTION');
      });

      await waitFor(() => {
        expect(productionApi.updateProductionStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            orderId: 'ord-3',
            status: 'IN_PRODUCTION',
          }),
          expect.anything()
        );
      });
    });

    it('ST-04: Ciclo Completo de Mutação Otimista: cancelamento, atualização otimista síncrona, rollback em erro e invalidação final', async () => {
      const initialOrders = [
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
        createMockOrder('ord-2', 'IN_PRODUCTION'),
      ];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);

      // Segura a Promise da mutação para podermos inspecionar o estado intermediário do cache otimista
      let rejectMutation!: (reason?: any) => void;
      vi.mocked(productionApi.updateProductionStatus).mockImplementation(
        () =>
          new Promise((_, reject) => {
            rejectMutation = reject;
          })
      );

      const cancelQueriesSpy = vi.spyOn(queryClient, 'cancelQueries');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // 1. Dispara a movimentação otimista
      act(() => {
        result.current.onMoveOrder('ord-1', 'IN_PRODUCTION');
      });

      // 2. Valida que cancelQueries foi executado e o cache foi atualizado de forma otimista
      await waitFor(() => {
        expect(cancelQueriesSpy).toHaveBeenCalledWith({
          queryKey: PRODUCTION_KANBAN_QUERY_KEY,
        });
        const optimisticCache = queryClient.getQueryData<OrderSummary[]>(PRODUCTION_KANBAN_QUERY_KEY);
        expect(optimisticCache?.find((o) => o.id === 'ord-1')?.status).toBe('IN_PRODUCTION');
      });

      // 3. A API falha -> Dispara rollback
      act(() => {
        rejectMutation(new Error('Falha no servidor ao atualizar'));
      });

      // 4. Valida que o cache reverteu exatamente para WAITING_PRODUCTION e toast.error foi acionado
      await waitFor(() => {
        const rolledBackCache = queryClient.getQueryData<OrderSummary[]>(PRODUCTION_KANBAN_QUERY_KEY);
        expect(rolledBackCache?.find((o) => o.id === 'ord-1')?.status).toBe('WAITING_PRODUCTION');
        expect(toast.error).toHaveBeenCalledWith('Falha no servidor ao atualizar');
      });

      // 5. Valida que onSettled disparou a invalidação da query
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: PRODUCTION_KANBAN_QUERY_KEY,
      });
    });

    it('ST-05: Ciclo de Mutação Otimista bem-sucedida com invalidação em onSettled', async () => {
      const initialOrders = [createMockOrder('ord-1', 'WAITING_PRODUCTION')];
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue(initialOrders);
      vi.mocked(productionApi.updateProductionStatus).mockResolvedValue({
        ...(initialOrders[0] as unknown as Order),
        status: 'IN_PRODUCTION',
      });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.onMoveOrder('ord-1', 'IN_PRODUCTION');
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Etapa de produção atualizada com sucesso!');
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: PRODUCTION_KANBAN_QUERY_KEY,
      });
    });

    it('ST-06: refetchKanban deve disparar refetch da query principal', async () => {
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue([]);

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(productionApi.getProductionOrders).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refetchKanban();
      });

      await waitFor(() => {
        expect(productionApi.getProductionOrders).toHaveBeenCalledTimes(2);
      });
    });

    it('ST-07: isUpdating deve refletir o estado de pendência da mutação em andamento', async () => {
      vi.mocked(productionApi.getProductionOrders).mockResolvedValue([
        createMockOrder('ord-1', 'WAITING_PRODUCTION'),
      ]);

      let resolveMutation!: (value: any) => void;
      vi.mocked(productionApi.updateProductionStatus).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveMutation = resolve;
          })
      );

      const { result } = renderHook(() => useProductionKanban(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isUpdating).toBe(false);

      act(() => {
        result.current.onMoveOrder('ord-1', 'IN_PRODUCTION');
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      act(() => {
        resolveMutation({ id: 'ord-1', status: 'IN_PRODUCTION' });
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });
});
