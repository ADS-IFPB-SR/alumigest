import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderFinancialSummaryCard } from '../../../features/orders/components/OrderFinancialSummaryCard';
import type { Order } from '../../../features/orders/types';

// Opcional: Mock da função de formatação usando 'vi'
vi.mock('../../../features/budgets/utils/calculations', () => ({
  formatBRL: (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
}));

describe('OrderFinancialSummaryCard - Condição de Pagamento (#439)', () => {
  const baseOrder: Partial<Order> = {
    id: 'test-order-123',
    valorBruto: 1000,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 1000,
  };

  it('deve exibir o rótulo formatado para um enum de condição de pagamento conhecido', () => {
    const orderWithKnownEnum = { 
      ...baseOrder, 
      condicaoPagamento: 'A_VISTA_PIX' 
    } as Order;

    render(<OrderFinancialSummaryCard order={orderWithKnownEnum} />);

    expect(screen.getByText('À Vista (PIX / Dinheiro)')).toBeInTheDocument();
    expect(screen.queryByText('A_VISTA_PIX')).not.toBeInTheDocument();
  });

  it('deve realizar o fallback seguro e exibir o valor cru caso o enum seja desconhecido', () => {
    const unknownPaymentMethod = 'CARTAO_BNDES_10X_SEM_JUROS';
    const orderWithUnknownEnum = { 
      ...baseOrder, 
      condicaoPagamento: unknownPaymentMethod 
    } as Order;

    render(<OrderFinancialSummaryCard order={orderWithUnknownEnum} />);

    expect(screen.getByText(unknownPaymentMethod)).toBeInTheDocument();
  });

  it('não deve exibir a seção de condição de pagamento se ela não for informada no pedido', () => {
    const orderWithoutPayment = { 
      ...baseOrder, 
      condicaoPagamento: undefined,
      observacoesPagamento: undefined
    } as Order;

    render(<OrderFinancialSummaryCard order={orderWithoutPayment} />);

    expect(screen.queryByText('Condição de Pagamento:')).not.toBeInTheDocument();
  });
});