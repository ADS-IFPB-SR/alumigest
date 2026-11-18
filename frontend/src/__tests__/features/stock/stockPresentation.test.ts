import { describe, it, expect } from 'vitest';
import {
  compareCatalogStockCriticality,
  formatStockNumber,
  formatStockQuantity,
  formatStockUnit,
  needsPurchaseOrReorder,
  resolveCatalogStockSnapshot,
  type StockItem,
} from '@/features/stock';

function makeStockItem(overrides: Partial<StockItem> = {}): StockItem {
  return {
    id: 'st-1',
    materialId: 'mat-1',
    materialSku: 'SKU-1',
    materialName: 'Material Teste',
    category: 'GLASS',
    unitMeasure: 'M2',
    physicalQuantity: 10,
    reservedQuantity: 2,
    availableQuantity: 8,
    minimumStock: 5,
    alertStatus: 'IN_STOCK',
    ...overrides,
  };
}

describe('stockPresentation — Utilitários de Apresentação de Estoque (US-22.1)', () => {
  it('[Partição de Equivalência] deve formatar unidades e quantidades amigáveis em singular e plural', () => {
    expect(formatStockUnit('M2', 4)).toBe('m²');
    expect(formatStockUnit('METRO', 2)).toBe('m');
    expect(formatStockUnit('BARRA_6M', 1)).toBe('barra');
    expect(formatStockUnit('BARRA_6M', 6)).toBe('barras');
    expect(formatStockUnit('PAR', 1)).toBe('par');
    expect(formatStockUnit('PAR', 3)).toBe('pares');
    expect(formatStockUnit('UN', 5)).toBe('un');
    expect(formatStockUnit('CAIXA', 2)).toBe('caixa');
    expect(formatStockUnit(undefined, 2)).toBe('un');
    expect(formatStockNumber(-0)).toBe('0');
    expect(formatStockQuantity(-5.75, 'M2')).toBe('-5,75 m²');
  });

  it('[Partição de Equivalência] deve resolver NO_BALANCE para material sem registro ou com físico=0 e reservado=0', () => {
    const missing = resolveCatalogStockSnapshot(undefined, 'BARRA_6M');
    expect(missing).toEqual({
      physicalQuantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      minimumStock: 0,
      displayStatus: 'NO_BALANCE',
      unitMeasure: 'BARRA_6M',
    });

    const zeroed = resolveCatalogStockSnapshot(
      makeStockItem({
        physicalQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        minimumStock: 0,
        alertStatus: 'IN_STOCK',
      })
    );
    expect(zeroed.displayStatus).toBe('NO_BALANCE');
  });

  it('[Análise de Valor Limite] deve manter ORDER_POINT quando físico=0, disponível=0 e mínimo>0', () => {
    const zeroWithMin = resolveCatalogStockSnapshot(
      makeStockItem({
        physicalQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        minimumStock: 3,
        alertStatus: 'ORDER_POINT',
      })
    );
    expect(zeroWithMin.displayStatus).toBe('ORDER_POINT');
  });

  it('[Tabela de Decisão] deve identificar necessidade de compra apenas para NEED_PURCHASE e ORDER_POINT', () => {
    expect(needsPurchaseOrReorder('NEED_PURCHASE')).toBe(true);
    expect(needsPurchaseOrReorder('ORDER_POINT')).toBe(true);
    expect(needsPurchaseOrReorder('IN_STOCK')).toBe(false);
    expect(needsPurchaseOrReorder('NO_BALANCE')).toBe(false);
  });

  it('[Ordenação] deve ordenar por criticidade e maior déficit no topo', () => {
    const severeDeficit = resolveCatalogStockSnapshot(
      makeStockItem({ physicalQuantity: 2, reservedQuantity: 10, availableQuantity: -8, alertStatus: 'NEED_PURCHASE' })
    );
    const mildDeficit = resolveCatalogStockSnapshot(
      makeStockItem({ physicalQuantity: 2, reservedQuantity: 4, availableQuantity: -2, alertStatus: 'NEED_PURCHASE' })
    );
    const reorder = resolveCatalogStockSnapshot(
      makeStockItem({ physicalQuantity: 5, reservedQuantity: 0, availableQuantity: 5, minimumStock: 5, alertStatus: 'ORDER_POINT' })
    );
    const healthy = resolveCatalogStockSnapshot(
      makeStockItem({ physicalQuantity: 20, reservedQuantity: 5, availableQuantity: 15, alertStatus: 'IN_STOCK' })
    );
    const noBalance = resolveCatalogStockSnapshot(undefined, 'UN');

    const sorted = [noBalance, healthy, mildDeficit, reorder, severeDeficit].sort(
      compareCatalogStockCriticality
    );

    expect(sorted.map((s) => s.displayStatus)).toEqual([
      'NEED_PURCHASE',
      'NEED_PURCHASE',
      'ORDER_POINT',
      'IN_STOCK',
      'NO_BALANCE',
    ]);
    expect(sorted[0].availableQuantity).toBe(-8);
    expect(sorted[1].availableQuantity).toBe(-2);
  });

  it('[Fallback] deve calcular displayStatus localmente quando alertStatus vier omitido', () => {
    expect(
      resolveCatalogStockSnapshot(
        makeStockItem({
          physicalQuantity: 1,
          reservedQuantity: 4,
          availableQuantity: -3,
          alertStatus: undefined as unknown as StockItem['alertStatus'],
        })
      ).displayStatus
    ).toBe('NEED_PURCHASE');

    expect(
      resolveCatalogStockSnapshot(
        makeStockItem({
          physicalQuantity: 5,
          reservedQuantity: 0,
          availableQuantity: 5,
          minimumStock: 5,
          alertStatus: undefined as unknown as StockItem['alertStatus'],
        })
      ).displayStatus
    ).toBe('ORDER_POINT');

    expect(
      resolveCatalogStockSnapshot(
        makeStockItem({
          physicalQuantity: 10,
          reservedQuantity: 0,
          availableQuantity: 10,
          minimumStock: 5,
          alertStatus: undefined as unknown as StockItem['alertStatus'],
        })
      ).displayStatus
    ).toBe('IN_STOCK');
  });
});
