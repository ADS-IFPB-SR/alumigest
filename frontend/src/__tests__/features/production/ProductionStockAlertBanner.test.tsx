import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductionStockAlertBanner } from '@/features/production/components/ProductionStockAlertBanner';
import { useStockBalances, type StockItem } from '@/features/stock';

vi.mock('@/features/stock', async () => {
  const actual = await vi.importActual<typeof import('@/features/stock')>('@/features/stock');
  return {
    ...actual,
    useStockBalances: vi.fn(),
  };
});

function renderBanner() {
  return render(
    <MemoryRouter>
      <ProductionStockAlertBanner />
    </MemoryRouter>
  );
}

function makeStockItem(overrides: Partial<StockItem> = {}): StockItem {
  return {
    id: 'st-1',
    materialId: 'mat-1',
    materialSku: 'VID-008',
    materialName: 'Vidro Temperado 8mm',
    category: 'GLASS',
    unitMeasure: 'M2',
    physicalQuantity: 10,
    reservedQuantity: 2,
    availableQuantity: 8,
    minimumStock: 3,
    alertStatus: 'IN_STOCK',
    ...overrides,
  };
}

describe('ProductionStockAlertBanner Component (US-22.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada enquanto os saldos estiverem carregando', () => {
    vi.mocked(useStockBalances).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStockBalances>);

    const { container } = renderBanner();
    expect(container).toBeEmptyDOMElement();
  });

  it('deve exibir aviso não bloqueante e acionar refetch quando ocorrer erro na consulta', () => {
    const refetchMock = vi.fn();
    vi.mocked(useStockBalances).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useStockBalances>);

    renderBanner();

    const errorBanner = screen.getByTestId('kanban-stock-alert-error');
    expect(errorBanner).toHaveTextContent(
      'Não foi possível verificar os alertas de insumos do almoxarifado'
    );
    fireEvent.click(screen.getByRole('button', { name: /Recarregar saldos/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('deve exibir faixa de almoxarifado em dia com link para /catalogo quando não houver pendências', () => {
    vi.mocked(useStockBalances).mockReturnValue({
      data: [makeStockItem()],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStockBalances>);

    renderBanner();

    const okBanner = screen.getByTestId('kanban-stock-alert-ok');
    expect(okBanner).toHaveTextContent('Almoxarifado em dia');
    expect(screen.getByTestId('kanban-stock-alert-cta')).toHaveAttribute('href', '/catalogo');
  });

  it('deve destacar 1 insumo em falta no singular com link para /catalogo?needsPurchase=true', () => {
    vi.mocked(useStockBalances).mockReturnValue({
      data: [
        makeStockItem({
          id: 'st-need',
          materialId: 'mat-need',
          materialSku: 'PER-001',
          materialName: 'Perfil Suprema Branco',
          unitMeasure: 'BARRA_6M',
          physicalQuantity: 1,
          reservedQuantity: 4,
          availableQuantity: -3,
          minimumStock: 2,
          alertStatus: 'NEED_PURCHASE',
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStockBalances>);

    renderBanner();

    const banner = screen.getByTestId('kanban-stock-alert-banner');
    expect(banner).toHaveAttribute('role', 'alert');
    expect(banner).toHaveTextContent('Alerta Fabril: 1 insumo em falta para produção');
    expect(banner).toHaveTextContent('PER-001');
    expect(banner).toHaveTextContent('falta 3 barras');
    expect(screen.getByTestId('kanban-stock-alert-cta')).toHaveAttribute(
      'href',
      '/catalogo?needsPurchase=true'
    );
  });

  it('deve ordenar por criticidade, limitar preview a 3 chips com overflow e somar ponto de pedido', () => {
    vi.mocked(useStockBalances).mockReturnValue({
      data: [
        makeStockItem({
          id: 'st-a',
          materialId: 'm-a',
          materialSku: 'SKU-A',
          materialName: 'Item A',
          physicalQuantity: 1,
          reservedQuantity: 2,
          availableQuantity: -1,
          alertStatus: 'NEED_PURCHASE',
        }),
        makeStockItem({
          id: 'st-b',
          materialId: 'm-b',
          materialSku: 'SKU-B',
          materialName: 'Item B',
          physicalQuantity: 0,
          reservedQuantity: 10,
          availableQuantity: -10,
          alertStatus: 'NEED_PURCHASE',
        }),
        makeStockItem({
          id: 'st-c',
          materialId: 'm-c',
          materialSku: 'SKU-C',
          materialName: 'Item C',
          physicalQuantity: 2,
          reservedQuantity: 7,
          availableQuantity: -5,
          alertStatus: 'NEED_PURCHASE',
        }),
        makeStockItem({
          id: 'st-d',
          materialId: 'm-d',
          materialSku: 'SKU-D',
          materialName: 'Item D',
          physicalQuantity: 3,
          reservedQuantity: 5,
          availableQuantity: -2,
          alertStatus: 'NEED_PURCHASE',
        }),
        makeStockItem({
          id: 'st-op',
          materialId: 'm-op',
          materialSku: 'SKU-OP',
          materialName: 'Item Ponto Pedido',
          physicalQuantity: 4,
          reservedQuantity: 0,
          availableQuantity: 4,
          minimumStock: 5,
          alertStatus: 'ORDER_POINT',
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStockBalances>);

    renderBanner();

    const banner = screen.getByTestId('kanban-stock-alert-banner');
    expect(banner).toHaveTextContent('Alerta Fabril: 4 insumos em falta para produção');
    expect(screen.getByTestId('kanban-stock-order-point-extra')).toHaveTextContent(
      '+1 no ponto de pedido'
    );

    const chips = screen.getAllByTestId('kanban-stock-alert-chip');
    expect(chips).toHaveLength(3);
    expect(chips[0]).toHaveTextContent('SKU-B');
    expect(chips[1]).toHaveTextContent('SKU-C');
    expect(chips[2]).toHaveTextContent('SKU-D');
    expect(screen.getByTestId('kanban-stock-alert-overflow')).toHaveTextContent('+1 outro');
  });

  it('deve exibir faixa âmbar quando houver apenas insumos no ponto de pedido', () => {
    vi.mocked(useStockBalances).mockReturnValue({
      data: [
        makeStockItem({
          id: 'st-op-1',
          materialId: 'm-op-1',
          materialSku: 'FER-002',
          materialName: 'Roldana Dupla',
          unitMeasure: 'UN',
          physicalQuantity: 4,
          reservedQuantity: 0,
          availableQuantity: 4,
          minimumStock: 5,
          alertStatus: 'ORDER_POINT',
        }),
        makeStockItem({
          id: 'st-op-2',
          materialId: 'm-op-2',
          materialSku: 'FER-003',
          materialName: 'Fecho Concha',
          unitMeasure: 'UN',
          physicalQuantity: 2,
          reservedQuantity: 0,
          availableQuantity: 2,
          minimumStock: 4,
          alertStatus: 'ORDER_POINT',
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStockBalances>);

    renderBanner();

    const banner = screen.getByTestId('kanban-stock-alert-banner');
    expect(screen.getByRole('status')).toBe(banner);
    expect(banner).toHaveTextContent('Atenção de Almoxarifado: 2 insumos no ponto de pedido');
    expect(banner).toHaveTextContent('disp. 2 un');
    expect(screen.getByTestId('kanban-stock-alert-cta')).toHaveTextContent('Consultar reposição');
    expect(screen.getByTestId('kanban-stock-alert-cta')).toHaveAttribute(
      'href',
      '/catalogo?needsPurchase=true'
    );
  });
});
