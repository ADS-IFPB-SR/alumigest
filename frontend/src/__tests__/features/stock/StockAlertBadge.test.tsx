import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StockAlertBadge } from '@/features/stock/components/StockAlertBadge';

describe('StockAlertBadge', () => {
  describe('Modo Padrão (Catálogo / Tabela)', () => {
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

  describe('Modo Kanban Make-to-Order (US-21.4)', () => {
    it('deve renderizar a tag "Insumos Disponíveis" quando variant for "kanban" e status for IN_STOCK', () => {
      render(<StockAlertBadge status="IN_STOCK" variant="kanban" />);

      expect(screen.getByTestId('badge-stock-in-stock')).toBeInTheDocument();
      expect(screen.getByText('Insumos Disponíveis')).toBeInTheDocument();
    });

    it('deve renderizar a tag "Falta Insumo / Comprar" quando variant for "kanban" e status for NEED_PURCHASE', () => {
      render(<StockAlertBadge status="NEED_PURCHASE" variant="kanban" />);

      expect(screen.getByTestId('badge-stock-need-purchase')).toBeInTheDocument();
      expect(screen.getByText('Falta Insumo / Comprar')).toBeInTheDocument();
    });

    it('deve renderizar label customizado quando informado explicitamente', () => {
      render(<StockAlertBadge status="IN_STOCK" label="Estoque OK" />);

      expect(screen.getByText('Estoque OK')).toBeInTheDocument();
    });

    it('deve definir o atributo title e renderizar o tooltip no hover quando tooltip for informado', () => {
      render(
        <StockAlertBadge
          status="NEED_PURCHASE"
          variant="kanban"
          tooltip="Insumos faltantes: Perfil 50x50"
        />
      );

      const badge = screen.getByTestId('badge-stock-need-purchase');
      expect(badge).toHaveAttribute('title', 'Insumos faltantes: Perfil 50x50');

      // Antes do hover não exibe o elemento com role="tooltip"
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Ao passar o mouse (hover)
      fireEvent.mouseEnter(badge);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Insumos faltantes: Perfil 50x50');

      // Ao tirar o mouse (unhover)
      fireEvent.mouseLeave(badge);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});
