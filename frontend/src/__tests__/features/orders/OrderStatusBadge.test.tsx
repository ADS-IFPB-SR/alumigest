import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderStatusBadge } from '../../../features/orders/components/OrderStatusBadge';
import type { OrderStatus } from '../../../features/orders/types';

describe('OrderStatusBadge', () => {
  const testCases: { status: OrderStatus; expectedLabel: string }[] = [
    { status: 'CREATED', expectedLabel: 'Criado' },
    { status: 'WAITING_PRODUCTION', expectedLabel: 'Aguardando Produção' },
    { status: 'IN_PRODUCTION', expectedLabel: 'Em Produção' },
    { status: 'COMPLETED', expectedLabel: 'Concluído' },
    { status: 'CANCELLED', expectedLabel: 'Cancelado' },
  ];

  testCases.forEach(({ status, expectedLabel }) => {
    it(`deve renderizar o label em português "${expectedLabel}" para o status "${status}"`, () => {
      render(<OrderStatusBadge status={status} />);
      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(expectedLabel);
    });
  });
});
