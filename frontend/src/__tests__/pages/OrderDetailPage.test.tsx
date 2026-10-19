      import { describe, it, expect, vi, beforeEach } from 'vitest';
      import { render, screen, fireEvent, waitFor } from '@testing-library/react';
      import { MemoryRouter, Route, Routes } from 'react-router-dom';
      import toast from 'react-hot-toast';
      import { OrderDetailPage } from '../../pages/OrderDetailPage';
      import * as useOrdersModule from '../../features/orders/hooks/useOrders';
      import * as useBudgetsModule from '../../features/budgets/hooks/useBudgets';
      import type { Order } from '../../features/orders/types';

      vi.mock('react-hot-toast', () => ({
        default: {
          success: vi.fn(),
          error: vi.fn(),
        },
      }));

      vi.mock('../../features/orders/hooks/useOrders');
      vi.mock('../../features/budgets/hooks/useBudgets');

      const mockOrder: Order = {
        id: 'order-uuid-1',
        codigo: 'OS-2026-0001',
        orcamentoId: 'budget-uuid-1',
        orcamentoCodigo: 'ORC-2026-0001',
        clienteId: 'client-uuid-1',
        clienteNome: 'Construtora Horizonte',
        clienteTelefone: '(83) 98888-5555',
        clienteEndereco: 'Av. Epitácio Pessoa, 1000',
        status: 'WAITING_PRODUCTION',
        canalAprovacao: 'WHATSAPP',
        dataAprovacao: '2026-10-01',
        dataPrevisaoEntrega: '2026-10-16',
        valorBruto: 3000,
        valorDesconto: 200,
        taxaInstalacao: 150,
        taxaFrete: 50,
        valorLiquido: 3000,
        condicaoPagamento: 'Entrada 50% + Saldo na Entrega',
        observacoesPagamento: 'Pix para a chave CNPJ',
        observacoes: 'Instalar no 4º andar bloco B',
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: '2026-10-01T10:00:00Z',
        ativo: true,
        items: [
          {
            id: 'item-1',
            orderId: 'order-uuid-1',
            descricao: 'Porta de Giro 1 Folha',
            larguraMm: 900,
            alturaMm: 2100,
            quantidade: 1,
            corAluminio: 'Branco',
            tipoVidro: 'Mini Boreal 4mm',
            valorUnitario: 3000,
            valorTotal: 3000,
            ordem: 1,
            options: [],
          },
        ],
      };

      describe('OrderDetailPage — [US-13.5] Visualização Detalhada do Pedido de Venda', () => {
        const mockDownloadPdf = vi.fn();
        const mockDownloadComprovante = vi.fn();
        const mockDownloadLabels = vi.fn();

        beforeEach(() => {
          vi.clearAllMocks();

          vi.spyOn(useOrdersModule, 'useDownloadComprovantePdf').mockReturnValue({
            mutate: mockDownloadComprovante,
            isPending: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useDownloadLabelsPdf').mockReturnValue({
            mutate: mockDownloadLabels,
            isPending: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useCancelOrder').mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useUpdateOrderStatus').mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
          } as any);

          vi.spyOn(useBudgetsModule, 'useDownloadPdfTecnico').mockReturnValue({
            mutate: mockDownloadPdf,
            isPending: false,
          } as any);
        });

        it('deve exibir indicador de carregamento enquanto busca dados da ordem de serviço', () => {
          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          expect(screen.getByTestId('order-detail-loading')).toBeInTheDocument();
        });

        it('deve exibir estado de erro caso a ordem de serviço não seja encontrada', () => {
          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            refetch: vi.fn(),
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-inexistente']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          expect(screen.getByTestId('order-detail-error')).toBeInTheDocument();
          expect(screen.getByText(/ordem de serviço não encontrada/i)).toBeInTheDocument();
        });

        it('deve renderizar os detalhes completos do pedido com lock imutável, financeiro e itens', () => {
          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: mockOrder,
            isLoading: false,
            isError: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          expect(screen.getByTestId('order-detail-page')).toBeInTheDocument();
          expect(screen.getByText('#OS-2026-0001')).toBeInTheDocument();
          expect(screen.getAllByText('Construtora Horizonte').length).toBeGreaterThanOrEqual(1);
          expect(screen.getByTestId('order-status-badge')).toHaveTextContent('Aguardando Produção');
          expect(screen.getByText('Porta de Giro 1 Folha')).toBeInTheDocument();
          expect(screen.getByText('900 × 2100 mm')).toBeInTheDocument();

          // Cards laterais
          expect(screen.getByTestId('order-financial-summary-card')).toBeInTheDocument();
          expect(screen.getByTestId('order-delivery-timeline-card')).toBeInTheDocument();
          expect(screen.getByTestId('order-origin-budget-card')).toBeInTheDocument();
          expect(screen.getByText('ORC-2026-0001')).toBeInTheDocument();
        });

        it('deve exibir o alerta de cancelamento quando o pedido estiver CANCELLED', () => {
          const cancelledOrder: Order = {
            ...mockOrder,
            status: 'CANCELLED',
            justificativaCancelamento: 'Cliente adiou o cronograma da obra por 60 dias.',
          };

          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: cancelledOrder,
            isLoading: false,
            isError: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          expect(screen.getByTestId('order-cancelled-alert')).toBeInTheDocument();
          expect(
            screen.getByText('Cliente adiou o cronograma da obra por 60 dias.')
          ).toBeInTheDocument();
        });

        it('deve disparar download da Ficha de Fabricação ao clicar no botão quando em produção', () => {
          const inProductionOrder: Order = {
            ...mockOrder,
            status: 'IN_PRODUCTION',
          };

          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: inProductionOrder,
            isLoading: false,
            isError: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          const fichaBtn = screen.getByRole('button', { name: /ficha de fabricação/i });
          expect(fichaBtn).toBeInTheDocument();

          fireEvent.click(fichaBtn);

          expect(mockDownloadPdf).toHaveBeenCalledWith({
            id: 'budget-uuid-1',
            code: 'ORC-2026-0001',
          });
        });

        it('deve abrir o modal de cancelamento ao clicar no botão "Cancelar Ordem de Serviço"', () => {
          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: mockOrder,
            isLoading: false,
            isError: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          const cancelBtn = screen.getByRole('button', { name: /cancelar ordem de serviço/i });
          expect(cancelBtn).toBeInTheDocument();

          fireEvent.click(cancelBtn);

          expect(screen.getByTestId('cancel-order-modal')).toBeInTheDocument();
        });

        it('deve disparar cancelOrder e exibir toast de sucesso ao confirmar cancelamento com justificativa válida', async () => {
          const mockMutate = vi.fn((_payload, options) => {
            options?.onSuccess?.();
          });

          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: mockOrder,
            isLoading: false,
            isError: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useCancelOrder').mockReturnValue({
            mutate: mockMutate,
            isPending: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          fireEvent.click(screen.getByRole('button', { name: /cancelar ordem de serviço/i }));
          expect(screen.getByTestId('cancel-order-modal')).toBeInTheDocument();

          const textarea = screen.getByLabelText(/justificativa obrigatória/i);
          fireEvent.change(textarea, {
            target: { value: 'Cancelamento formal por desistência do cliente em obra.' },
          });

          const confirmBtn = screen.getByRole('button', { name: /confirmar cancelamento/i });
          fireEvent.click(confirmBtn);

          await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
              { justificativa: 'Cancelamento formal por desistência do cliente em obra.' },
              expect.any(Object)
            );
            expect(toast.success).toHaveBeenCalledWith('Ordem de serviço cancelada com sucesso.');
          });
        });

        it('deve exibir toast de erro com a mensagem do backend caso a mutação de cancelamento falhe', async () => {
          const mockMutate = vi.fn((_payload, options) => {
            options?.onError?.({
              response: { data: { message: 'Não é possível cancelar um pedido em produção.' } },
            });
          });

          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: mockOrder,
            isLoading: false,
            isError: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useCancelOrder').mockReturnValue({
            mutate: mockMutate,
            isPending: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          fireEvent.click(screen.getByRole('button', { name: /cancelar ordem de serviço/i }));

          const textarea = screen.getByLabelText(/justificativa obrigatória/i);
          fireEvent.change(textarea, {
            target: { value: 'Tentativa de cancelamento de pedido.' },
          });

          fireEvent.click(screen.getByRole('button', { name: /confirmar cancelamento/i }));

          await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Não é possível cancelar um pedido em produção.');
          });
        });

        it('deve baixar o comprovante PDF oficial do pedido (US-16.1)', () => {
          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: mockOrder,
            isLoading: false,
            isError: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          fireEvent.click(screen.getByRole('button', { name: /baixar comprovante pdf/i }));

          expect(mockDownloadComprovante).toHaveBeenCalledWith({
            id: 'order-uuid-1',
            codigo: 'OS-2026-0001',
          });
        });

        it('deve disparar o download das etiquetas térmicas PDF do pedido (US-17.4)', () => {
          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: mockOrder,
            isLoading: false,
            isError: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          fireEvent.click(screen.getByRole('button', { name: /imprimir etiquetas/i }));

          expect(mockDownloadLabels).toHaveBeenCalledWith({
            id: 'order-uuid-1',
            codigo: 'OS-2026-0001',
          });
        });

        it('deve avançar para WAITING_PRODUCTION ao clicar no CTA quando a ordem estiver em CREATED', () => {
          const createdOrder: Order = { ...mockOrder, status: 'CREATED' };
          const mockUpdateStatus = vi.fn((_status, options) => {
            options?.onSuccess?.();
          });

          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: createdOrder,
            isLoading: false,
            isError: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useUpdateOrderStatus').mockReturnValue({
            mutate: mockUpdateStatus,
            isPending: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          const advanceWaitingBtn = screen.getByRole('button', { name: /avançar para aguardando produção/i });
          expect(advanceWaitingBtn).toBeInTheDocument();

          fireEvent.click(advanceWaitingBtn);

          expect(mockUpdateStatus).toHaveBeenCalledWith('WAITING_PRODUCTION', expect.any(Object));
          expect(toast.success).toHaveBeenCalledWith('Ordem de serviço avançada para aguardando produção.');
        });

        it('deve avançar para IN_PRODUCTION ao clicar no CTA quando a ordem estiver em WAITING_PRODUCTION', () => {
          const mockUpdateStatus = vi.fn((status, options) => {
            options?.onSuccess?.();
          });

          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: mockOrder, // status: 'WAITING_PRODUCTION'
            isLoading: false,
            isError: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useUpdateOrderStatus').mockReturnValue({
            mutate: mockUpdateStatus,
            isPending: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          const advanceProductionBtn = screen.getByRole('button', { name: /avançar para produção/i });
          expect(advanceProductionBtn).toBeInTheDocument();

          fireEvent.click(advanceProductionBtn);

          expect(mockUpdateStatus).toHaveBeenCalledWith('IN_PRODUCTION', expect.any(Object));
          expect(toast.success).toHaveBeenCalledWith('Ordem de serviço avançada para produção.');
        });

        it('deve avançar para COMPLETED ao clicar no CTA quando a ordem estiver em IN_PRODUCTION', () => {
          const inProductionOrder: Order = { ...mockOrder, status: 'IN_PRODUCTION' };
          const mockUpdateStatus = vi.fn((status, options) => {
            options?.onSuccess?.();
          });

          vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
            data: inProductionOrder,
            isLoading: false,
            isError: false,
          } as any);

          vi.spyOn(useOrdersModule, 'useUpdateOrderStatus').mockReturnValue({
            mutate: mockUpdateStatus,
            isPending: false,
          } as any);

          render(
            <MemoryRouter initialEntries={['/ordens-servico/order-uuid-1']}>
              <Routes>
                <Route path="/ordens-servico/:id" element={<OrderDetailPage />} />
              </Routes>
            </MemoryRouter>
          );

          const completeBtn = screen.getByRole('button', { name: /concluir produção/i });
          expect(completeBtn).toBeInTheDocument();

          fireEvent.click(completeBtn);

          expect(mockUpdateStatus).toHaveBeenCalledWith('COMPLETED', expect.any(Object));
          expect(toast.success).toHaveBeenCalledWith('Ordem de serviço concluída com sucesso.');
        });
      });
