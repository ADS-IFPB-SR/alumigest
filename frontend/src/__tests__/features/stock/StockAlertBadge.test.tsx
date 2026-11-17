import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StockAlertBadge } from '@/features/stock/components/StockAlertBadge';

describe('StockAlertBadge', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('Modo Padrão', () => {
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

    it('deve renderizar a tag "Comprar" com déficit quando o status for NEED_PURCHASE', () => {
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

  describe('Modo Catálogo (US-22.1)', () => {
    it('[Partição de Equivalência] deve exibir "Falta 6 barras" para NEED_PURCHASE no catálogo', () => {
      render(
        <StockAlertBadge
          variant="catalog"
          status="NEED_PURCHASE"
          availableQuantity={-6}
          unitMeasure="BARRA_6M"
        />
      );

      const badge = screen.getByTestId('badge-stock-need-purchase');
      expect(badge).toHaveTextContent('Falta 6 barras');
      expect(badge.className).toContain('dark:bg-rose-500/15');
    });

    it('[Partição de Equivalência] deve exibir "Em Estoque", "Ponto de Pedido" e "Sem Saldo" no catálogo', () => {
      const { rerender } = render(<StockAlertBadge variant="catalog" status="IN_STOCK" />);
      expect(screen.getByText('Em Estoque')).toBeInTheDocument();

      rerender(<StockAlertBadge variant="catalog" status="ORDER_POINT" />);
      expect(screen.getByText('Ponto de Pedido')).toBeInTheDocument();

      rerender(<StockAlertBadge variant="catalog" status="NO_BALANCE" />);
      expect(screen.getByTestId('badge-stock-no-balance')).toHaveTextContent('Sem Saldo');

      rerender(<StockAlertBadge variant="catalog" status="NEED_PURCHASE" />);
      expect(screen.getByTestId('badge-stock-need-purchase')).toHaveTextContent('Falta Insumo');

      rerender(<StockAlertBadge status="IN_STOCK" label="Estoque OK" />);
      expect(screen.getByText('Estoque OK')).toBeInTheDocument();
    });

    it('[Tema Escuro] deve renderizar badges com classes dark preservadas', () => {
      document.documentElement.classList.add('dark');

      render(<StockAlertBadge variant="catalog" status="ORDER_POINT" />);
      const badge = screen.getByTestId('badge-stock-order-point');
      expect(badge.className).toContain('dark:text-amber-300');
    });
  });

  describe('Compatibilidade Modo Kanban (US-21.4)', () => {
    it('deve renderizar rótulos e tooltip no hover quando variant="kanban"', () => {
      render(
        <StockAlertBadge
          status="NEED_PURCHASE"
          variant="kanban"
          tooltip="Insumos faltantes: Perfil 50x50"
        />
      );

      const badge = screen.getByTestId('badge-stock-need-purchase');
      expect(badge).toHaveTextContent('Falta Insumo / Comprar');
      expect(badge).toHaveAttribute('title', 'Insumos faltantes: Perfil 50x50');

      fireEvent.mouseEnter(badge);
      expect(screen.getByRole('tooltip')).toHaveTextContent('Insumos faltantes: Perfil 50x50');

      fireEvent.mouseLeave(badge);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('deve renderizar "Insumos Disponíveis" quando variant="kanban" e status="IN_STOCK"', () => {
      render(<StockAlertBadge status="IN_STOCK" variant="kanban" />);
      expect(screen.getByText('Insumos Disponíveis')).toBeInTheDocument();
    });
  });
});
