import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KardexDrawer } from '@/features/stock/components/KardexDrawer';
import { useKardex } from '@/features/stock/hooks/useStock';
import type { KardexMaterialTarget, StockItem, StockMovement } from '@/features/stock';

vi.mock('@/features/stock/hooks/useStock', () => ({
  useKardex: vi.fn(),
}));

const materialFixture: KardexMaterialTarget = {
  id: 'mat-1',
  skuCode: 'AL-SUP-001',
  name: 'Perfil Linha Suprema Branco 6m',
  unitMeasure: 'BARRA_6M',
};

const stockItemFixture: StockItem = {
  id: 'st-1',
  materialId: 'mat-1',
  materialSku: 'AL-SUP-001',
  materialName: 'Perfil Linha Suprema Branco 6m',
  category: 'PROFILE',
  unitMeasure: 'BARRA_6M',
  physicalQuantity: 2,
  reservedQuantity: 8,
  availableQuantity: -6,
  minimumStock: 4,
  alertStatus: 'NEED_PURCHASE',
};

const movementsFixture: StockMovement[] = [
  {
    id: 'mov-5',
    stockItemId: 'st-1',
    materialId: 'mat-1',
    materialSku: 'AL-SUP-001',
    materialName: 'Perfil Linha Suprema Branco 6m',
    unitMeasure: 'BARRA_6M',
    type: 'SCRAP_LOSS',
    quantity: 1,
    previousPhysicalQuantity: 3,
    newPhysicalQuantity: 2,
    previousReservedQuantity: 8,
    newReservedQuantity: 8,
    referenceDocument: 'INV-2026-03',
    reason: 'Barra empenada no manuseio',
    registeredBy: 'Almoxarife',
    createdAt: '2026-11-18T11:00:00Z',
  },
  {
    id: 'mov-4',
    stockItemId: 'st-1',
    materialId: 'mat-1',
    materialSku: 'AL-SUP-001',
    materialName: 'Perfil Linha Suprema Branco 6m',
    unitMeasure: 'BARRA_6M',
    type: 'RESERVATION_CANCELLATION',
    quantity: 2,
    previousPhysicalQuantity: 3,
    newPhysicalQuantity: 3,
    previousReservedQuantity: 10,
    newReservedQuantity: 8,
    referenceDocument: 'OS-2026-0087',
    reason: 'Estorno por cancelamento da O.S.',
    registeredBy: 'SYSTEM',
    createdAt: '2026-11-17T16:15:00Z',
  },
  {
    id: 'mov-3',
    stockItemId: 'st-1',
    materialId: 'mat-1',
    materialSku: 'AL-SUP-001',
    materialName: 'Perfil Linha Suprema Branco 6m',
    unitMeasure: 'BARRA_6M',
    type: 'PRODUCTION_OUTFLOW',
    quantity: 7,
    previousPhysicalQuantity: 10,
    newPhysicalQuantity: 3,
    previousReservedQuantity: 17,
    newReservedQuantity: 10,
    referenceDocument: 'OS-2026-0085',
    reason: 'Baixa física na conclusão da produção',
    registeredBy: 'SYSTEM',
    createdAt: '2026-11-16T14:20:00Z',
  },
  {
    id: 'mov-2',
    stockItemId: 'st-1',
    materialId: 'mat-1',
    materialSku: 'AL-SUP-001',
    materialName: 'Perfil Linha Suprema Branco 6m',
    unitMeasure: 'BARRA_6M',
    type: 'PRODUCTION_RESERVATION',
    quantity: 8,
    previousPhysicalQuantity: 10,
    newPhysicalQuantity: 10,
    previousReservedQuantity: 9,
    newReservedQuantity: 17,
    orderId: 'ord-88',
    referenceDocument: 'OS-2026-0088',
    reason: 'Reserva automática para O.S. OS-2026-0088',
    registeredBy: 'SYSTEM',
    createdAt: '2026-11-15T09:30:00Z',
  },
  {
    id: 'mov-1',
    stockItemId: 'st-1',
    materialId: 'mat-1',
    materialSku: 'AL-SUP-001',
    materialName: 'Perfil Linha Suprema Branco 6m',
    unitMeasure: 'BARRA_6M',
    type: 'PURCHASE_ENTRY',
    quantity: 10,
    unitCost: 138.5,
    previousPhysicalQuantity: 0,
    newPhysicalQuantity: 10,
    previousReservedQuantity: 0,
    newReservedQuantity: 0,
    referenceDocument: 'Asa #1024',
    reason: 'Compra distribuidora',
    registeredBy: 'Gerente',
    createdAt: '2026-11-10T08:00:00Z',
  },
];

describe('KardexDrawer — Gaveta Lateral de Extrato Kardex (US-22.2)', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[Partição de Equivalência] não deve renderizar quando fechada ou sem material', () => {
    const { container, rerender } = render(
      <KardexDrawer isOpen={false} material={materialFixture} onClose={onClose} />
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<KardexDrawer isOpen={true} material={null} onClose={onClose} />);
    expect(container).toBeEmptyDOMElement();
    expect(useKardex).not.toHaveBeenCalled();
  });

  it('[Tabela de Decisão] deve exibir cabeçalho com os 3 saldos, ponto de pedido e timeline completa com ícones semânticos', () => {
    vi.mocked(useKardex).mockReturnValue({
      data: movementsFixture,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useKardex>);

    render(
      <KardexDrawer
        isOpen={true}
        material={materialFixture}
        stockItem={stockItemFixture}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('kardex-material-sku')).toHaveTextContent('#AL-SUP-001');
    expect(screen.getByText('Perfil Linha Suprema Branco 6m')).toBeInTheDocument();
    expect(screen.getByTestId('kardex-minimum-stock')).toHaveTextContent('Ponto de Pedido: 4 barras');
    expect(screen.getByTestId('kardex-physical')).toHaveTextContent('2 barras');
    expect(screen.getByTestId('kardex-reserved')).toHaveTextContent('8 barras');
    expect(screen.getByTestId('kardex-available')).toHaveTextContent('-6 barras');
    expect(screen.getByTestId('badge-stock-need-purchase')).toHaveTextContent('Falta 6 barras');

    const timeline = screen.getByTestId('kardex-timeline');
    expect(timeline).toHaveTextContent('5 registros');
    expect(screen.getAllByTestId('kardex-timeline-item')).toHaveLength(5);

    expect(timeline).toHaveTextContent('🔴 Saída por Perda/Sucata');
    expect(timeline).toHaveTextContent('⚪ Estorno de Cancelamento');
    expect(timeline).toHaveTextContent('🟠 Baixa Física na Conclusão');
    expect(timeline).toHaveTextContent('🔵 Reserva para Produção');
    expect(timeline).toHaveTextContent('🟢 Entrada de Compras');
    expect(timeline).toHaveTextContent('OS-2026-0088');
    expect(timeline).toHaveTextContent('Asa #1024');
    expect(timeline).toHaveTextContent('Custo: R$ 138,50/un');
  });

  it('[Estado de Carregamento / Erro / Vazio] deve renderizar loading, erro com retry e estado vazio', () => {
    const refetchMock = vi.fn();
    vi.mocked(useKardex).mockReturnValueOnce({
      data: [],
      isLoading: true,
      isError: false,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useKardex>);

    const { rerender } = render(
      <KardexDrawer isOpen={true} material={materialFixture} onClose={onClose} />
    );
    expect(screen.getByTestId('kardex-loading')).toBeInTheDocument();

    vi.mocked(useKardex).mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useKardex>);

    rerender(<KardexDrawer isOpen={true} material={materialFixture} onClose={onClose} />);
    expect(screen.getByTestId('kardex-error')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refetchMock).toHaveBeenCalledTimes(1);

    vi.mocked(useKardex).mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: false,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useKardex>);

    rerender(<KardexDrawer isOpen={true} material={materialFixture} onClose={onClose} />);
    expect(screen.getByTestId('kardex-empty')).toHaveTextContent(
      'Nenhuma movimentação registrada no Kardex.'
    );
  });

  it('[Acessibilidade] deve fechar ao clicar em X, Fechar Extrato, backdrop ou pressionar Escape (e manter aberta ao clicar dentro)', () => {
    vi.mocked(useKardex).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useKardex>);

    render(
      <KardexDrawer
        isOpen={true}
        material={materialFixture}
        stockItem={stockItemFixture}
        onClose={onClose}
      />
    );

    // Clicar dentro do drawer não fecha
    fireEvent.click(screen.getByTestId('kardex-drawer'));
    expect(onClose).not.toHaveBeenCalled();

    // Clicar no backdrop fecha
    fireEvent.click(screen.getByTestId('kardex-drawer-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Clicar no botão X fecha
    fireEvent.click(screen.getByTestId('kardex-close-button'));
    expect(onClose).toHaveBeenCalledTimes(2);

    // Clicar no botão Fechar Extrato fecha
    fireEvent.click(screen.getByTestId('kardex-footer-close'));
    expect(onClose).toHaveBeenCalledTimes(3);

    // Pressionar outra tecla não fecha; Escape fecha
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onClose).toHaveBeenCalledTimes(3);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(4);
  });
});
