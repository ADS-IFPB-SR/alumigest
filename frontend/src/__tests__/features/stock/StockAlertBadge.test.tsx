import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StockAlertBadge } from '@/features/stock/components/StockAlertBadge';

describe('StockAlertBadge', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

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

    it('deve renderizar tooltip via portal no document.body no hover e remover no unhover', () => {
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
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Insumos faltantes: Perfil 50x50');
      expect(document.body).toContainElement(tooltip);

      // Ao tirar o mouse (unhover)
      fireEvent.mouseLeave(badge);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('deve suportar tooltip via prop title como fallback', () => {
      render(
        <StockAlertBadge
          status="IN_STOCK"
          variant="kanban"
          title="Tudo disponível no estoque"
        />
      );

      const badge = screen.getByTestId('badge-stock-in-stock');
      fireEvent.mouseEnter(badge);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Tudo disponível no estoque');
    });

    it('deve posicionar tooltip acima quando houver espaço no topo e reposicionar no scroll', () => {
      render(
        <StockAlertBadge
          status="ORDER_POINT"
          variant="kanban"
          tooltip="Estoque no limite"
        />
      );

      const badge = screen.getByTestId('badge-stock-order-point');
      vi.spyOn(badge, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        bottom: 230,
        left: 100,
        right: 200,
        width: 100,
        height: 30,
        x: 100,
        y: 200,
        toJSON: () => {},
      });

      fireEvent.mouseEnter(badge);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      // badge.top (200) - tooltipHeight (60) - GAP (6) = 134px
      expect(tooltip.style.top).toBe('134px');

      // Dispara evento de scroll para checar reposicionamento
      fireEvent.scroll(window);
      expect(tooltip).toBeInTheDocument();
    });

    it('deve posicionar tooltip abaixo quando não houver espaço suficiente acima', () => {
      render(
        <StockAlertBadge
          status="NEED_PURCHASE"
          variant="kanban"
          tooltip="Insumos faltantes"
        />
      );

      const badge = screen.getByTestId('badge-stock-need-purchase');
      vi.spyOn(badge, 'getBoundingClientRect').mockReturnValue({
        top: 20,
        bottom: 50,
        left: 300,
        right: 400,
        width: 100,
        height: 30,
        x: 300,
        y: 20,
        toJSON: () => {},
      });

      fireEvent.mouseEnter(badge);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      // Como spaceAbove (20) < 74 e spaceBelow é grande, posiciona abaixo: bottom (50) + GAP (6) = 56px
      expect(tooltip.style.top).toBe('56px');
    });

    it('deve ajustar a posição horizontal do tooltip para não vazar a borda direita da viewport', () => {
      render(
        <StockAlertBadge
          status="NEED_PURCHASE"
          variant="kanban"
          tooltip="Insumos faltantes múltiplos"
        />
      );

      const badge = screen.getByTestId('badge-stock-need-purchase');
      vi.spyOn(badge, 'getBoundingClientRect').mockReturnValue({
        top: 150,
        bottom: 180,
        left: 950,
        right: 1020,
        width: 70,
        height: 30,
        x: 950,
        y: 150,
        toJSON: () => {},
      });

      fireEvent.mouseEnter(badge);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      // viewportWidth (1024) - tooltipWidth (280) - PADDING (8) = 736px
      expect(tooltip.style.left).toBe('736px');
    });
  });
});
