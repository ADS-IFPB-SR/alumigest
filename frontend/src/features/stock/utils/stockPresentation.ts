import type { StockAlertStatus, StockDisplayAlertStatus, StockItem } from '../types';

export interface CatalogStockSnapshot {
  readonly physicalQuantity: number;
  readonly reservedQuantity: number;
  readonly availableQuantity: number;
  readonly minimumStock: number;
  readonly displayStatus: StockDisplayAlertStatus;
  readonly unitMeasure: string;
}

const UNIT_LABELS: Readonly<Record<string, readonly [singular: string, plural: string]>> = {
  M2: ['m²', 'm²'],
  METRO: ['m', 'm'],
  LINEAR_METER: ['m', 'm'],
  BARRA_3M: ['barra', 'barras'],
  BARRA_6M: ['barra', 'barras'],
  UN: ['un', 'un'],
  PAR: ['par', 'pares'],
  PAIR: ['par', 'pares'],
  KG: ['kg', 'kg'],
  LITRO: ['L', 'L'],
};

const CRITICALITY_RANK: Readonly<Record<StockDisplayAlertStatus, number>> = {
  NEED_PURCHASE: 0,
  ORDER_POINT: 1,
  IN_STOCK: 2,
  NO_BALANCE: 3,
};

/**
 * Formata um número em pt-BR sem zeros decimais desnecessários.
 */
export function formatStockNumber(value: number): string {
  const normalized = Object.is(value, -0) ? 0 : value;
  return normalized.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

/**
 * Converte o enum técnico de unidade de medida para rótulo amigável (singular/plural).
 */
export function formatStockUnit(unitMeasure?: string, quantity = 0): string {
  if (!unitMeasure) {
    return 'un';
  }
  const normalized = unitMeasure.trim().toUpperCase();
  const entry = UNIT_LABELS[normalized];
  if (!entry) {
    return unitMeasure.toLowerCase();
  }
  return Math.abs(quantity) === 1 ? entry[0] : entry[1];
}

/**
 * Formata uma quantidade com sua unidade amigável (ex: "6 barras", "-5,75 m²").
 */
export function formatStockQuantity(quantity: number, unitMeasure?: string): string {
  return `${formatStockNumber(quantity)} ${formatStockUnit(unitMeasure, quantity)}`;
}

/**
 * Resolve o estado visual consolidado de estoque para um material no catálogo.
 * Materiais sem registro ou com físico = 0 e reservado = 0 exibem estado neutro "NO_BALANCE".
 */
export function resolveCatalogStockSnapshot(
  stockItem?: StockItem,
  fallbackUnitMeasure = 'UN'
): CatalogStockSnapshot {
  if (!stockItem) {
    return {
      physicalQuantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      minimumStock: 0,
      displayStatus: 'NO_BALANCE',
      unitMeasure: fallbackUnitMeasure,
    };
  }

  const physical = Number(stockItem.physicalQuantity ?? 0);
  const reserved = Number(stockItem.reservedQuantity ?? 0);
  const available = Number(stockItem.availableQuantity ?? physical - reserved);
  const minimum = Number(stockItem.minimumStock ?? 0);
  const unitMeasure = stockItem.unitMeasure || fallbackUnitMeasure;

  const displayStatus = resolveDisplayStatus(
    stockItem.alertStatus,
    physical,
    reserved,
    available,
    minimum
  );

  return {
    physicalQuantity: physical,
    reservedQuantity: reserved,
    availableQuantity: available,
    minimumStock: minimum,
    displayStatus,
    unitMeasure,
  };
}

function resolveDisplayStatus(
  backendStatus: StockAlertStatus | undefined,
  physical: number,
  reserved: number,
  available: number,
  minimum: number
): StockDisplayAlertStatus {
  if (physical === 0 && reserved === 0 && available >= 0) {
    return minimum > 0 && available <= minimum ? 'ORDER_POINT' : 'NO_BALANCE';
  }
  if (backendStatus) {
    return backendStatus;
  }
  if (available < 0) {
    return 'NEED_PURCHASE';
  }
  if (minimum > 0 && available <= minimum) {
    return 'ORDER_POINT';
  }
  return 'IN_STOCK';
}

/**
 * Indica se o item requer ação de suprimentos (em falta ou no ponto de pedido).
 */
export function needsPurchaseOrReorder(status: StockDisplayAlertStatus): boolean {
  return status === 'NEED_PURCHASE' || status === 'ORDER_POINT';
}

/**
 * Comparador por criticidade de suprimentos: Falta (maior déficit primeiro) -> Ponto de Pedido -> Em Estoque -> Sem Saldo.
 */
export function compareCatalogStockCriticality(
  a: CatalogStockSnapshot,
  b: CatalogStockSnapshot
): number {
  const rankDiff = CRITICALITY_RANK[a.displayStatus] - CRITICALITY_RANK[b.displayStatus];
  if (rankDiff !== 0) {
    return rankDiff;
  }
  return a.availableQuantity - b.availableQuantity;
}
