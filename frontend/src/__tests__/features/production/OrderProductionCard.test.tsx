import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderProductionCard } from '../../../features/production/components/OrderProductionCard';
import type { Order, OrderSummary } from '../../../features/orders/types';

describe('OrderProductionCard Component', () => {
  const mockOnClickDetails = vi.fn();

  beforeEach(() => {
    mockOnClickDetails.mockClear();
    vi.useFakeTimers();
    // Fixa o tempo do sistema em 16/10/2026
    vi.setSystemTime(new Date(2026, 9, 16, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseOrder: Order = {
    id: 'order-uuid-1',
    codigo: 'OS-2026-0001',
    orcamentoId: 'budget-uuid-1',
    orcamentoCodigo: 'ORC-2026-0099',
    clienteNome: 'Alumínio & Cia Ltda',
    clienteTelefone: '(83) 98888-7777',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'PRESENCIAL',
    dataAprovacao: '2026-10-10',
    dataPrevisaoEntrega: '2026-10-25', // NORMAL (+9 dias)
    valorBruto: 4500,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 4500,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-10T10:00:00Z',
    ativo: true,
    items: [
      {
        id: 'item-1',
        descricao: 'Janela 4 Folhas Suprema',
        quantidade: 2,
        valorUnitario: 1500,
        valorTotal: 3000,
        ordem: 0,
      },
      {
        id: 'item-2',
        descricao: 'Porta Balcão Linha Gold',
        quantidade: 1,
        valorUnitario: 1500,
        valorTotal: 1500,
        ordem: 1,
      },
    ],
  };

  const baseOrderSummary: OrderSummary = {
    id: 'order-uuid-2',
    codigo: 'OS-2026-0002',
    orcamentoId: 'budget-uuid-2',
    orcamentoCodigo: 'ORC-2026-0100',
    clienteNome: 'Condomínio Solar',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-12',
    dataPrevisaoEntrega: '2026-10-18', // CRITICAL (+2 dias)
    valorLiquido: 2800,
    quantidadeItens: 4,
    createdAt: '2026-10-12T14:00:00Z',
  };

  describe('Renderização com objeto Order completo', () => {
    it('deve renderizar dados básicos, código da OS, orçamento e cliente', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('ORC-2026-0099')).toBeInTheDocument();
      expect(screen.getByText('Alumínio & Cia Ltda')).toBeInTheDocument();
      expect(screen.getByText('10/10/2026')).toBeInTheDocument();
    });

    it('deve renderizar a lista discriminada de itens e somatório de peças', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('Janela 4 Folhas Suprema')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('Porta Balcão Linha Gold')).toBeInTheDocument();

      // Total de peças: 2 + 1 = 3
      expect(screen.getByText('3 PEÇAS')).toBeInTheDocument();
    });

    it('não deve exibir badge de prazo quando o status for NORMAL', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.queryByText('Atrasado')).not.toBeInTheDocument();
      expect(screen.queryByText('Prazo Crítico')).not.toBeInTheDocument();
    });
  });

  describe('Renderização com objeto OrderSummary (resumido)', () => {
    it('deve renderizar o pacote consolidado de esquadrias e badge no plural', () => {
      render(
        <OrderProductionCard
          order={baseOrderSummary}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
      expect(screen.getByText('Contém 4 esquadrias')).toBeInTheDocument();
      expect(screen.getByText('4 PEÇAS')).toBeInTheDocument();
    });

    it('deve utilizar singular "esquadria" e "PEÇA" quando a quantidade for 1', () => {
      const singleItemSummary: OrderSummary = {
        ...baseOrderSummary,
        quantidadeItens: 1,
      };

      render(
        <OrderProductionCard
          order={singleItemSummary}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByText('Contém 1 esquadria')).toBeInTheDocument();
      expect(screen.getByText('1 PEÇA')).toBeInTheDocument();
    });

    it('deve exibir badge de "Prazo Crítico" quando o prazo for de até 3 dias', () => {
      render(
        <OrderProductionCard
          order={baseOrderSummary} // dataPrevisaoEntrega: 18/10 (+2 dias)
          onClickDetails={mockOnClickDetails}
        />
      );

      const badge = screen.getByText('Prazo Crítico');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-amber-100');
    });
  });

  describe('Alertas de Prazo', () => {
    it('deve exibir badge "Atrasado" em vermelho quando o prazo estiver vencido', () => {
      const lateOrder: Order = {
        ...baseOrder,
        dataPrevisaoEntrega: '2026-10-14', // Ontem em relação a 16/10
      };

      render(
        <OrderProductionCard
          order={lateOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      const badge = screen.getByText('Atrasado');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('bg-rose-100');
    });
  });

  describe('Interações e Acessibilidade', () => {
    it('deve disparar onClickDetails com o ID correto ao clicar no botão de detalhes', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      const detailsButton = screen.getByRole('button', {
        name: /visualizar detalhes da ordem de serviço os-2026-0001/i,
      });
      fireEvent.click(detailsButton);

      expect(mockOnClickDetails).toHaveBeenCalledTimes(1);
      expect(mockOnClickDetails).toHaveBeenCalledWith('order-uuid-1');
    });

    it('deve possuir atributo draggable e manipular classes no dragstart e dragend', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      const card = screen.getByTestId('order-production-card');

      expect(card).toHaveAttribute('draggable', 'true');

      const setDataMock = vi.fn();
      const dragEvent = new Event('dragstart', { bubbles: true }) as any;
      dragEvent.dataTransfer = {
        setData: setDataMock,
        effectAllowed: '',
      };

      card.dispatchEvent(dragEvent);

      expect(setDataMock).toHaveBeenCalledWith('text/plain', 'order-uuid-1');
      expect(setDataMock).toHaveBeenCalledWith('sourceStatus', 'WAITING_PRODUCTION');
      expect(dragEvent.dataTransfer.effectAllowed).toBe('move');
      expect(card).toHaveClass('opacity-50');

      fireEvent.dragEnd(card);
      expect(card).not.toHaveClass('opacity-50');
    });
  });

  describe('Casos de borda (Robustez defensiva)', () => {
    it('deve renderizar sem quebrar quando não houver orcamentoCodigo', () => {
      const orderWithoutBudgetCode: Order = {
        ...baseOrder,
        orcamentoCodigo: undefined,
      };

      render(
        <OrderProductionCard
          order={orderWithoutBudgetCode}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
      expect(screen.queryByText('ORC-2026-0099')).not.toBeInTheDocument();
    });

    it('deve lidar com lista de items vazia em Order sem quebrar', () => {
      const orderEmptyItems: Order = {
        ...baseOrder,
        items: [],
      };

      render(
        <OrderProductionCard
          order={orderEmptyItems}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByText('Contém 0 esquadrias')).toBeInTheDocument();
      expect(screen.getByText('0 PEÇAS')).toBeInTheDocument();
    });

    it('deve utilizar fallback de quantidade 1 quando item não possuir quantidade definida', () => {
      const orderItemNoQuantity: Order = {
        ...baseOrder,
        items: [
          {
            id: 'item-no-qty',
            descricao: 'Vidro Temperado 8mm',
            quantidade: undefined as unknown as number,
            valorUnitario: 300,
            valorTotal: 300,
            ordem: 0,
          },
        ],
      };

      render(
        <OrderProductionCard
          order={orderItemNoQuantity}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByText('1 PEÇA')).toBeInTheDocument();
      expect(screen.getByText('Vidro Temperado 8mm')).toBeInTheDocument();
    });
  });

  describe('Botão de avanço rápido de etapa touch/mobile (BUG-504)', () => {
    const mockOnMoveOrder = vi.fn();

    beforeEach(() => {
      mockOnMoveOrder.mockClear();
    });

    it('deve renderizar botão "Iniciar Produção" e chamar onMoveOrder com IN_PRODUCTION ao clicar quando status for WAITING_PRODUCTION', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
          onMoveOrder={mockOnMoveOrder}
        />
      );

      const advanceBtn = screen.getByTestId('btn-advance-order-uuid-1');
      expect(advanceBtn).toBeInTheDocument();
      expect(advanceBtn).toHaveTextContent('Iniciar Produção');
      expect(advanceBtn).toHaveAttribute(
        'aria-label',
        'Iniciar Produção: mover ordem de serviço OS-2026-0001 para a próxima etapa'
      );

      fireEvent.click(advanceBtn);
      expect(mockOnMoveOrder).toHaveBeenCalledTimes(1);
      expect(mockOnMoveOrder).toHaveBeenCalledWith('order-uuid-1', 'IN_PRODUCTION');
    });

    it('deve renderizar botão "Finalizar" e chamar onMoveOrder com COMPLETED ao clicar quando status for IN_PRODUCTION', () => {
      const orderInProduction: Order = {
        ...baseOrder,
        status: 'IN_PRODUCTION',
      };

      render(
        <OrderProductionCard
          order={orderInProduction}
          onClickDetails={mockOnClickDetails}
          onMoveOrder={mockOnMoveOrder}
        />
      );

      const advanceBtn = screen.getByTestId('btn-advance-order-uuid-1');
      expect(advanceBtn).toBeInTheDocument();
      expect(advanceBtn).toHaveTextContent('Finalizar');
      expect(advanceBtn).toHaveAttribute(
        'aria-label',
        'Finalizar: mover ordem de serviço OS-2026-0001 para a próxima etapa'
      );

      fireEvent.click(advanceBtn);
      expect(mockOnMoveOrder).toHaveBeenCalledTimes(1);
      expect(mockOnMoveOrder).toHaveBeenCalledWith('order-uuid-1', 'COMPLETED');
    });

    it('NÃO deve renderizar o botão de avanço quando status for COMPLETED (etapa final)', () => {
      const orderCompleted: Order = {
        ...baseOrder,
        status: 'COMPLETED',
      };

      render(
        <OrderProductionCard
          order={orderCompleted}
          onClickDetails={mockOnClickDetails}
          onMoveOrder={mockOnMoveOrder}
        />
      );

      expect(screen.queryByTestId('btn-advance-order-uuid-1')).not.toBeInTheDocument();
    });

    it('NÃO deve renderizar o botão de avanço quando onMoveOrder não for fornecido (retrocompatibilidade desktop)', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.queryByTestId('btn-advance-order-uuid-1')).not.toBeInTheDocument();
    });

    it('deve parar a propagação do evento ao clicar no botão de avanço rápido', () => {
      render(
        <OrderProductionCard
          order={baseOrder}
          onClickDetails={mockOnClickDetails}
          onMoveOrder={mockOnMoveOrder}
        />
      );

      const advanceBtn = screen.getByTestId('btn-advance-order-uuid-1');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      advanceBtn.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(mockOnMoveOrder).toHaveBeenCalledWith('order-uuid-1', 'IN_PRODUCTION');
    });
  });
});
