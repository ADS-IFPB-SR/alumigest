import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerOrdersTab } from '../../../../features/customers/components/CustomerOrdersTab';
import type { ClientOrderSummaryDTO } from '../../../../features/customers/services/customersApi';
import type { Order } from '../../../../features/orders/types';

describe('CustomerOrdersTab Component [US-47.4]', () => {
  const mockOrders: ClientOrderSummaryDTO[] = [
    {
      id: 'order-1',
      codigo: 'OS-2026-0001',
      orcamentoId: 'budget-1',
      status: 'WAITING_PRODUCTION',
      statusDescricao: 'Aguardando Produção',
      canalAprovacao: 'WHATSAPP',
      canalAprovacaoDescricao: 'WhatsApp',
      dataAprovacao: '2026-11-01',
      dataPrevisaoEntrega: '2026-11-15',
      dataConclusao: null,
      valorLiquido: 4500.5,
      quantidadeItens: 3,
      createdAt: '2026-11-01T10:00:00Z',
    },
    {
      id: 'order-2',
      codigo: 'OS-2026-0002',
      orcamentoId: 'budget-2',
      status: 'COMPLETED',
      statusDescricao: 'Concluído',
      canalAprovacao: 'PRESENCIAL',
      canalAprovacaoDescricao: 'Presencial',
      dataAprovacao: '2026-10-15',
      dataPrevisaoEntrega: '2026-10-30',
      dataConclusao: '2026-10-28',
      valorLiquido: 1200.0,
      quantidadeItens: 1,
      createdAt: '2026-10-15T09:00:00Z',
    },
  ];

  const mockOrderDetails: Order = {
    id: 'order-1',
    codigo: 'OS-2026-0001',
    orcamentoId: 'budget-1',
    clienteNome: 'Antônio Alfredo Figueiredo',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-11-01',
    dataPrevisaoEntrega: '2026-11-15',
    valorBruto: 4500.5,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 4500.5,
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
    ativo: true,
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        descricao: 'Porta de Giro 1 Folha Linha Suprema',
        larguraMm: 350,
        alturaMm: 1470,
        quantidade: 12,
        corAluminio: 'Preto Anodizado',
        tipoVidro: 'Incolor 6mm Temperado',
        valorUnitario: 100,
        valorTotal: 1200,
        ordem: 1,
      },
      {
        id: 'item-2',
        orderId: 'order-1',
        descricao: 'Janela Basculante 1 Folha',
        larguraMm: 600,
        alturaMm: 600,
        quantidade: 2,
        corAluminio: 'Branco Brilhante',
        tipoVidro: 'Mini-Boreal 4mm',
        valorUnitario: 200,
        valorTotal: 400,
        ordem: 2,
      },
    ],
  };

  it('deve renderizar estado vazio quando a lista de ordens estiver vazia', () => {
    render(<CustomerOrdersTab orders={[]} onOpenLabels={vi.fn()} />);

    expect(
      screen.getByText('Nenhuma Ordem de Serviço vinculada a este cliente')
    ).toBeInTheDocument();
  });

  it('deve exibir mensagem de carregamento quando isLoading for true e não houver ordens', () => {
    render(
      <CustomerOrdersTab
        orders={[]}
        isLoading={true}
        onOpenLabels={vi.fn()}
      />
    );

    expect(
      screen.getByText('Carregando ordens de serviço vinculadas...')
    ).toBeInTheDocument();
  });

  it('deve renderizar a tabela com os dados das Ordens de Serviço formatados', () => {
    render(<CustomerOrdersTab orders={mockOrders} onOpenLabels={vi.fn()} />);

    expect(screen.getAllByText('#OS-2026-0001').length).toBeGreaterThan(0);
    expect(screen.getByText('#OS-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('Aguardando Produção')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('deve acionar onOpenLabels ao clicar no botão de Etiquetas na tabela', () => {
    const handleOpenLabels = vi.fn();
    render(<CustomerOrdersTab orders={mockOrders} onOpenLabels={handleOpenLabels} />);

    const labelButtons = screen.getAllByTestId('btn-open-labels-modal');
    expect(labelButtons).toHaveLength(2);

    fireEvent.click(labelButtons[0]);
    expect(handleOpenLabels).toHaveBeenCalledWith('order-1');
  });

  it('deve renderizar o drawer de esquadrias com medidas nominais e permitir emissão de etiquetas pelo botão do topo', () => {
    const handleOpenLabels = vi.fn();
    render(
      <CustomerOrdersTab
        orders={mockOrders}
        selectedOrderId="order-1"
        selectedOrderDetails={mockOrderDetails}
        onOpenLabels={handleOpenLabels}
      />
    );

    expect(screen.getByTestId('order-items-drawer')).toBeInTheDocument();
    expect(screen.getByText(/Porta de Giro 1 Folha Linha Suprema/i)).toBeInTheDocument();
    expect(screen.getByText('350 x 1470 mm')).toBeInTheDocument();
    expect(screen.getByText('600 x 600 mm')).toBeInTheDocument();

    const topLabelButton = screen.getByTestId('btn-open-labels-modal-top');
    fireEvent.click(topLabelButton);
    expect(handleOpenLabels).toHaveBeenCalledWith('order-1');
  });

  it('deve selecionar ordem ao clicar na linha da tabela', () => {
    const handleSelectOrder = vi.fn();
    render(
      <CustomerOrdersTab
        orders={mockOrders}
        selectedOrderId="order-1"
        onSelectOrder={handleSelectOrder}
        onOpenLabels={vi.fn()}
      />
    );

    const secondRowCode = screen.getByText('#OS-2026-0002');
    fireEvent.click(secondRowCode.closest('tr')!);
    expect(handleSelectOrder).toHaveBeenCalledWith('order-2');
  });

  it('deve navegar entre páginas quando houver paginação', () => {
    const handlePageChange = vi.fn();
    render(
      <CustomerOrdersTab
        orders={mockOrders}
        page={0}
        totalPages={3}
        onPageChange={handlePageChange}
        onOpenLabels={vi.fn()}
      />
    );

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    const nextBtn = screen.getByLabelText('Próxima página');
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });
});
