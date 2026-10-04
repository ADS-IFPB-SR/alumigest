import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderDetailPage } from '../../pages/OrderDetailPage';
import * as useOrdersModule from '../../features/orders/hooks/useOrders';
import * as useBudgetsModule from '../../features/budgets/hooks/useBudgets';
import type { Order } from '../../features/orders/types';

vi.mock('../../features/orders/hooks/useOrders');
vi.mock('../../features/budgets/hooks/useBudgets');

const mockOrder: Order = {
  id: 'order-uuid-1',
  codigo: 'PED-2026-0001',
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

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useOrdersModule, 'useCancelOrder').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(useBudgetsModule, 'useDownloadPdfTecnico').mockReturnValue({
      mutate: mockDownloadPdf,
      isPending: false,
    } as any);
  });

  it('deve exibir indicador de carregamento enquanto busca dados do pedido', () => {
    vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/pedidos/order-uuid-1']}>
        <Routes>
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('order-detail-loading')).toBeInTheDocument();
  });

  it('deve exibir estado de erro caso o pedido não seja encontrado', () => {
    vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={['/pedidos/order-uuid-inexistente']}>
        <Routes>
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('order-detail-error')).toBeInTheDocument();
    expect(screen.getByText(/pedido não encontrado/i)).toBeInTheDocument();
  });

  it('deve renderizar os detalhes completos do pedido com lock imutável, financeiro e itens', () => {
    vi.spyOn(useOrdersModule, 'useOrder').mockReturnValue({
      data: mockOrder,
      isLoading: false,
      isError: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/pedidos/order-uuid-1']}>
        <Routes>
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('order-detail-page')).toBeInTheDocument();
    expect(screen.getByText('PED-2026-0001')).toBeInTheDocument();
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
      <MemoryRouter initialEntries={['/pedidos/order-uuid-1']}>
        <Routes>
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
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
      <MemoryRouter initialEntries={['/pedidos/order-uuid-1']}>
        <Routes>
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
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
});
