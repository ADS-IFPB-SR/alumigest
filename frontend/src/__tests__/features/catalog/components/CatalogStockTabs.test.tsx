import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { GlassTab } from '@/features/catalog/components/GlassTab';
import { ProfileTab } from '@/features/catalog/components/ProfileTab';
import { HardwareTab } from '@/features/catalog/components/HardwareTab';
import { FilmTab } from '@/features/catalog/components/FilmTab';
import type { StockItem } from '@/features/stock';
import {
  useGlasses,
  useProfiles,
  useHardwares,
  useFilms,
} from '@/features/catalog/hooks/useCatalog';

vi.mock('@/features/catalog/hooks/useCatalog', () => ({
  useGlasses: vi.fn(),
  useProfiles: vi.fn(),
  useHardwares: vi.fn(),
  useFilms: vi.fn(),
}));

const makeStockMap = (items: StockItem[]): ReadonlyMap<string, StockItem> =>
  new Map(items.map((item) => [item.materialId, item]));

describe('Abas do Catálogo com Saldos e Badges de Estoque (US-22.1)', () => {
  const noop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('[Partição de Equivalência] GlassTab deve exibir colunas Físico, Reservado, Disponível e badges em claro e escuro', () => {
    vi.mocked(useGlasses).mockReturnValue({
      isLoading: false,
      data: {
        content: [
          {
            id: 'g1',
            name: 'Vidro Temperado 8mm Incolor',
            thicknessMm: 8,
            colorFinish: 'Incolor',
            pricePerSqm: 189.9,
            salePrice: 189.9,
            commercialReference: 'VID-008',
            maxWidthMm: 2000,
            maxHeightMm: 3000,
            active: true,
          },
          {
            id: 'g2',
            name: 'Vidro Temperado 10mm Fumê',
            thicknessMm: 10,
            colorFinish: 'Fumê',
            pricePerSqm: 249.0,
            salePrice: 249.0,
            commercialReference: 'VID-010',
            maxWidthMm: 2000,
            maxHeightMm: 3000,
            active: true,
          },
          {
            id: 'g3',
            name: 'Vidro Mini Boreal 4mm',
            thicknessMm: 4,
            colorFinish: 'Incolor',
            pricePerSqm: 76.0,
            salePrice: 76.0,
            commercialReference: 'VID-004',
            maxWidthMm: 2000,
            maxHeightMm: 3000,
            active: true,
          },
        ],
      },
    } as unknown as ReturnType<typeof useGlasses>);

    const stockMap = makeStockMap([
      {
        id: 's1',
        materialId: 'g1',
        materialSku: 'VID-008',
        materialName: 'Vidro Temperado 8mm Incolor',
        category: 'GLASS',
        unitMeasure: 'M2',
        physicalQuantity: 18,
        reservedQuantity: 6.5,
        availableQuantity: 11.5,
        minimumStock: 5,
        alertStatus: 'IN_STOCK',
      },
      {
        id: 's2',
        materialId: 'g2',
        materialSku: 'VID-010',
        materialName: 'Vidro Temperado 10mm Fumê',
        category: 'GLASS',
        unitMeasure: 'M2',
        physicalQuantity: 4,
        reservedQuantity: 9.75,
        availableQuantity: -5.75,
        minimumStock: 5,
        alertStatus: 'NEED_PURCHASE',
      },
    ]);

    const { rerender } = render(
      <GlassTab
        searchQuery=""
        filterStatus="ALL"
        stockByMaterialId={stockMap}
        onEdit={noop}
        onViewDetails={noop}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Físico' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Reservado' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Disponível' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Alerta Estoque' })).toBeInTheDocument();

    expect(screen.getByTestId('stock-physical-g1')).toHaveTextContent('18 m²');
    expect(screen.getByTestId('stock-reserved-g1')).toHaveTextContent('6,5 m²');
    expect(screen.getByTestId('stock-available-g1')).toHaveTextContent('11,5 m²');
    expect(screen.getByTestId('stock-available-g2')).toHaveTextContent('-5,75 m²');

    const desktopTable = screen.getByRole('table');
    expect(within(desktopTable).getByText('Em Estoque')).toBeInTheDocument();
    expect(within(desktopTable).getByText('Falta 5,75 m²')).toBeInTheDocument();
    expect(within(desktopTable).getByText('Sem Saldo')).toBeInTheDocument();
    expect(screen.getByTestId('stock-alert-legend')).toBeInTheDocument();

    // Cartão mobile também renderizado no DOM responsivo
    const mobileList = screen.getByTestId('mobile-cards-glass-table');
    expect(within(mobileList).getByTestId('mobile-glass-row-g2')).toHaveTextContent('Falta 5,75 m²');

    // Tema escuro
    document.documentElement.classList.add('dark');
    rerender(
      <GlassTab
        searchQuery=""
        filterStatus="ALL"
        stockByMaterialId={stockMap}
        onEdit={noop}
        onViewDetails={noop}
      />
    );
    expect(screen.getByTestId('stock-available-g2').className).toContain('dark:text-rose-300');
  });

  it('[Tabela de Decisão] ProfileTab deve filtrar apenas necessidade de compra e ordenar maior déficit primeiro', () => {
    vi.mocked(useProfiles).mockReturnValue({
      isLoading: false,
      data: {
        content: [
          {
            id: 'p-ok',
            name: 'Perfil Saudável',
            commercialReference: 'SU-OK',
            ncmCode: '76042920',
            colorFinish: 'Branco',
            standardLengthM: 6,
            unitMeasure: 'BARRA_6M',
            costPrice: 80,
            salePrice: 120,
            active: true,
          },
          {
            id: 'p-point',
            name: 'Perfil Ponto de Pedido',
            commercialReference: 'SU-PT',
            ncmCode: '76042920',
            colorFinish: 'Branco',
            standardLengthM: 6,
            unitMeasure: 'BARRA_6M',
            costPrice: 80,
            salePrice: 120,
            active: true,
          },
          {
            id: 'p-deficit',
            name: 'Perfil Em Falta',
            commercialReference: 'SU-001',
            ncmCode: '76042920',
            colorFinish: 'Branco',
            standardLengthM: 6,
            unitMeasure: 'BARRA_6M',
            costPrice: 80,
            salePrice: 142,
            active: true,
          },
        ],
      },
    } as unknown as ReturnType<typeof useProfiles>);

    const stockMap = makeStockMap([
      {
        id: 'sp1',
        materialId: 'p-ok',
        materialSku: 'SU-OK',
        materialName: 'Perfil Saudável',
        category: 'PROFILE',
        unitMeasure: 'BARRA_6M',
        physicalQuantity: 20,
        reservedQuantity: 2,
        availableQuantity: 18,
        minimumStock: 4,
        alertStatus: 'IN_STOCK',
      },
      {
        id: 'sp2',
        materialId: 'p-point',
        materialSku: 'SU-PT',
        materialName: 'Perfil Ponto de Pedido',
        category: 'PROFILE',
        unitMeasure: 'BARRA_6M',
        physicalQuantity: 4,
        reservedQuantity: 0,
        availableQuantity: 4,
        minimumStock: 4,
        alertStatus: 'ORDER_POINT',
      },
      {
        id: 'sp3',
        materialId: 'p-deficit',
        materialSku: 'SU-001',
        materialName: 'Perfil Em Falta',
        category: 'PROFILE',
        unitMeasure: 'BARRA_6M',
        physicalQuantity: 2,
        reservedQuantity: 8,
        availableQuantity: -6,
        minimumStock: 4,
        alertStatus: 'NEED_PURCHASE',
      },
    ]);

    render(
      <ProfileTab
        searchQuery=""
        filterStatus="ALL"
        stockByMaterialId={stockMap}
        onlyNeedsPurchase={true}
        onEdit={noop}
        onViewDetails={noop}
      />
    );

    const desktopTable = screen.getByRole('table');
    expect(within(desktopTable).queryByText('Perfil Saudável')).not.toBeInTheDocument();
    const rows = within(desktopTable).getAllByText(/Perfil (Em Falta|Ponto de Pedido)/);
    expect(rows[0]).toHaveTextContent('Perfil Em Falta');
    expect(within(desktopTable).getByText('Falta 6 barras')).toBeInTheDocument();
    expect(within(desktopTable).getByText('Ponto de Pedido')).toBeInTheDocument();

    const mobileList = screen.getByTestId('mobile-cards-profile-table');
    expect(within(mobileList).getByText('Falta 6 barras')).toBeInTheDocument();
    expect(within(mobileList).getByText('Ponto de Pedido')).toBeInTheDocument();
  });

  it('[Tabela de Decisão] HardwareTab deve ocultar coluna Alerta Estoque, badge mobile e legenda quando hideStockAlert=true', () => {
    vi.mocked(useHardwares).mockReturnValue({
      isLoading: false,
      data: {
        content: [
          {
            id: 'h1',
            skuCode: 'ROL-1125',
            name: 'Roldana Dupla Suprema',
            unitMeasure: 'UN',
            calculationType: 'UNIT',
            costPrice: 6,
            salePrice: 12.9,
            active: true,
          },
        ],
      },
    } as unknown as ReturnType<typeof useHardwares>);

    const stockMap = makeStockMap([
      {
        id: 'sh1',
        materialId: 'h1',
        materialSku: 'ROL-1125',
        materialName: 'Roldana Dupla Suprema',
        category: 'HARDWARE',
        unitMeasure: 'UN',
        physicalQuantity: 4,
        reservedQuantity: 16,
        availableQuantity: -12,
        minimumStock: 10,
        alertStatus: 'NEED_PURCHASE',
      },
    ]);

    render(
      <HardwareTab
        searchQuery=""
        filterStatus="ALL"
        stockByMaterialId={stockMap}
        hideStockAlert={true}
        onEdit={noop}
        onViewDetails={noop}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Físico' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Disponível' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Alerta Estoque' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('stock-alert-legend')).not.toBeInTheDocument();
    const mobileCard = screen.getByTestId('mobile-hardware-row-h1');
    expect(within(mobileCard).queryByTestId('badge-stock-need-purchase')).not.toBeInTheDocument();
  });

  it('[Estado Vazio] FilmTab deve exibir estado vazio quando filtro de compras não encontrar itens', () => {
    vi.mocked(useFilms).mockReturnValue({
      isLoading: false,
      data: {
        content: [
          {
            id: 'f1',
            name: 'Película G5 Fumê',
            commercialReference: 'PEL-G5',
            colorFinish: 'Fumê',
            salePrice: 39.9,
            unitMeasure: 'M2',
            active: true,
          },
        ],
      },
    } as unknown as ReturnType<typeof useFilms>);

    const stockMap = makeStockMap([
      {
        id: 'sf1',
        materialId: 'f1',
        materialSku: 'PEL-G5',
        materialName: 'Película G5 Fumê',
        category: 'FILM',
        unitMeasure: 'M2',
        physicalQuantity: 30,
        reservedQuantity: 5,
        availableQuantity: 25,
        minimumStock: 5,
        alertStatus: 'IN_STOCK',
      },
    ]);

    render(
      <FilmTab
        searchQuery=""
        filterStatus="ALL"
        stockByMaterialId={stockMap}
        onlyNeedsPurchase={true}
        onEdit={noop}
        onViewDetails={noop}
      />
    );

    expect(screen.getByTestId('catalog-purchase-empty-state')).toHaveTextContent(
      'Nenhum material desta categoria precisa de compra agora.'
    );
  });

  it('[Paginação e Grande Volume] GlassTab deve paginar 25 materiais (10/20/50), manter exportação e resetar página ao filtrar', () => {
    const manyGlasses = Array.from({ length: 25 }, (_, i) => {
      const idx = i + 1;
      return {
        id: `g-${idx}`,
        name: `Vidro Padrão ${String(idx).padStart(2, '0')}`,
        thicknessMm: 8,
        colorFinish: 'Incolor',
        pricePerSqm: 100 + idx,
        salePrice: 100 + idx,
        commercialReference: `VID-${String(idx).padStart(3, '0')}`,
        maxWidthMm: 2000,
        maxHeightMm: 3000,
        active: true,
      };
    });

    vi.mocked(useGlasses).mockReturnValue({
      isLoading: false,
      data: { content: manyGlasses },
    } as unknown as ReturnType<typeof useGlasses>);

    const stockMap = makeStockMap([
      {
        id: 'sg-23',
        materialId: 'g-23',
        materialSku: 'VID-023',
        materialName: 'Vidro Padrão 23',
        category: 'GLASS',
        unitMeasure: 'M2',
        physicalQuantity: 1,
        reservedQuantity: 9,
        availableQuantity: -8,
        minimumStock: 3,
        alertStatus: 'NEED_PURCHASE',
      },
    ]);

    const { rerender } = render(
      <GlassTab
        searchQuery=""
        filterStatus="ALL"
        stockByMaterialId={stockMap}
        onEdit={noop}
        onViewDetails={noop}
      />
    );

    const desktopTable = screen.getByRole('table');
    expect(screen.getByText('Total: 25')).toBeInTheDocument();
    expect(screen.getAllByTestId('catalog-pagination')[0]).toHaveTextContent(
      'Exibindo 1–20 de 25 materiais'
    );
    expect(within(desktopTable).getByText('Vidro Padrão 01')).toBeInTheDocument();
    expect(within(desktopTable).queryByText('Vidro Padrão 21')).not.toBeInTheDocument();

    // Vai para página 2 (itens 21-25)
    fireEvent.click(screen.getAllByRole('button', { name: 'Próxima página' })[0]);
    expect(screen.getAllByTestId('catalog-pagination')[0]).toHaveTextContent(
      'Exibindo 21–25 de 25 materiais'
    );
    expect(within(desktopTable).getByText('Vidro Padrão 23')).toBeInTheDocument();

    // Troca tamanho da página para 10 (reseta para página 1)
    fireEvent.change(screen.getByTestId('catalog-page-size-glass-table-desktop'), {
      target: { value: '10' },
    });
    expect(screen.getAllByTestId('catalog-pagination')[0]).toHaveTextContent(
      'Exibindo 1–10 de 25 materiais'
    );

    // Filtra apenas necessidade de compra e verifica que encontra o item que estava na página 2/3
    rerender(
      <GlassTab
        searchQuery="   Padrão 23  "
        filterStatus="ALL"
        stockByMaterialId={stockMap}
        onlyNeedsPurchase={true}
        onEdit={noop}
        onViewDetails={noop}
      />
    );
    expect(screen.getByText('Total: 1')).toBeInTheDocument();
    expect(within(desktopTable).getByText('Vidro Padrão 23')).toBeInTheDocument();
    expect(within(desktopTable).getByText('Falta 8 m²')).toBeInTheDocument();
  });
});
