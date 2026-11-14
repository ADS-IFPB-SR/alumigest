import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockAlertBadge } from '@/features/stock/components/StockAlertBadge';

describe('StockAlertBadge', () => {
  it('deve renderizar a tag "Em Dia" quando o status for IN_STOCK', () => {
    render(<StockAlertBadge status="IN_STOCK" />);

    expect(screen.getByTestId('badge-stock-in-stock')).toBeInTheDocument();
    expect(screen.getByText('Em Dia')).toBeInTheDocument();
  });

  it('deve renderizar a tag "Ponto de Pedido" quando o status for ORDER_POINT', () => {
    render(<StockAlertBadge status="ORDER_POINT" />);

    expect(screen.getByTestId('badge-stock-order-point')).toBeInTheDocument();
    expect(screen.getByText('Ponto de Pedido')).toBeInTheDocument();
  });

  it('deve renderizar a tag "Comprar" com déficit de quantidade quando o status for NEED_PURCHASE', () => {
    render(
      <StockAlertBadge
        status="NEED_PURCHASE"
        availableQuantity={-12}
        unitMeasure="m²"
      />
    );

    expect(screen.getByTestId('badge-stock-need-purchase')).toBeInTheDocument();
    expect(screen.getByText('Comprar (12 m²)')).toBeInTheDocument();
  });

  it('deve renderizar apenas "Comprar" quando a quantidade disponível for omitida', () => {
    render(<StockAlertBadge status="NEED_PURCHASE" />);

    expect(screen.getByTestId('badge-stock-need-purchase')).toBeInTheDocument();
    expect(screen.getByText('Comprar')).toBeInTheDocument();
  });
});
