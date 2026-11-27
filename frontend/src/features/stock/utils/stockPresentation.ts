import type {
  StockAlertStatus,
  StockDisplayAlertStatus,
  StockItem,
  StockMovement,
  StockMovementType,
} from '../types';

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

export type KardexImpactType =
  | 'PHYSICAL_IN'
  | 'PHYSICAL_OUT'
  | 'RESERVATION_IN'
  | 'RESERVATION_OUT';

export interface KardexMovementPresentation {
  readonly type: StockMovementType;
  readonly label: string;
  readonly badge: string;
  readonly deltaPrefix: '+' | '-';
  readonly impactType: KardexImpactType;
  readonly dotClass: string;
  readonly lineClass: string;
  readonly cardClass: string;
  readonly titleClass: string;
  readonly deltaClass: string;
}

const KARDEX_MOVEMENT_META: Readonly<Record<StockMovementType, KardexMovementPresentation>> = {
  PURCHASE_ENTRY: {
    type: 'PURCHASE_ENTRY',
    label: 'Entrada de Compras',
    badge: '🟢 Entrada de Compras',
    deltaPrefix: '+',
    impactType: 'PHYSICAL_IN',
    dotClass: 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/60',
    lineClass: 'border-emerald-300 dark:border-emerald-800',
    cardClass:
      'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/25 dark:border-emerald-800/60',
    titleClass: 'text-emerald-800 dark:text-emerald-300',
    deltaClass: 'text-emerald-700 dark:text-emerald-300',
  },
  PRODUCTION_RESERVATION: {
    type: 'PRODUCTION_RESERVATION',
    label: 'Reserva para Produção',
    badge: '🔵 Reserva para Produção',
    deltaPrefix: '+',
    impactType: 'RESERVATION_IN',
    dotClass: 'bg-blue-500 ring-blue-100 dark:ring-blue-950/60',
    lineClass: 'border-blue-300 dark:border-blue-800',
    cardClass:
      'bg-blue-50/70 border-blue-200 dark:bg-blue-950/25 dark:border-blue-800/60',
    titleClass: 'text-blue-800 dark:text-blue-300',
    deltaClass: 'text-blue-700 dark:text-blue-300',
  },
  PRODUCTION_OUTFLOW: {
    type: 'PRODUCTION_OUTFLOW',
    label: 'Baixa Física na Conclusão',
    badge: '🟠 Baixa Física na Conclusão',
    deltaPrefix: '-',
    impactType: 'PHYSICAL_OUT',
    dotClass: 'bg-amber-500 ring-amber-100 dark:ring-amber-950/60',
    lineClass: 'border-amber-300 dark:border-amber-800',
    cardClass:
      'bg-amber-50/70 border-amber-200 dark:bg-amber-950/25 dark:border-amber-800/60',
    titleClass: 'text-amber-800 dark:text-amber-300',
    deltaClass: 'text-amber-700 dark:text-amber-300',
  },
  RESERVATION_CANCELLATION: {
    type: 'RESERVATION_CANCELLATION',
    label: 'Estorno de Cancelamento',
    badge: '⚪ Estorno de Cancelamento',
    deltaPrefix: '-',
    impactType: 'RESERVATION_OUT',
    dotClass: 'bg-slate-400 ring-slate-200 dark:ring-slate-800',
    lineClass: 'border-slate-300 dark:border-slate-700',
    cardClass:
      'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700',
    titleClass: 'text-slate-700 dark:text-slate-200',
    deltaClass: 'text-slate-700 dark:text-slate-300',
  },
  SCRAP_LOSS: {
    type: 'SCRAP_LOSS',
    label: 'Saída por Perda/Sucata',
    badge: '🔴 Saída por Perda/Sucata',
    deltaPrefix: '-',
    impactType: 'PHYSICAL_OUT',
    dotClass: 'bg-rose-500 ring-rose-100 dark:ring-rose-950/60',
    lineClass: 'border-rose-300 dark:border-rose-800',
    cardClass:
      'bg-rose-50/70 border-rose-200 dark:bg-rose-950/25 dark:border-rose-800/60',
    titleClass: 'text-rose-800 dark:text-rose-300',
    deltaClass: 'text-rose-700 dark:text-rose-300',
  },
  MANUAL_ADJUSTMENT: {
    type: 'MANUAL_ADJUSTMENT',
    label: 'Ajuste Manual de Inventário',
    badge: '🟣 Ajuste Manual',
    deltaPrefix: '+',
    impactType: 'PHYSICAL_IN',
    dotClass: 'bg-indigo-500 ring-indigo-100 dark:ring-indigo-950/60',
    lineClass: 'border-indigo-300 dark:border-indigo-800',
    cardClass:
      'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/25 dark:border-indigo-800/60',
    titleClass: 'text-indigo-800 dark:text-indigo-300',
    deltaClass: 'text-indigo-700 dark:text-indigo-300',
  },
};

const KARDEX_DELTA_SUFFIX: Readonly<Record<KardexImpactType, string>> = {
  PHYSICAL_IN: 'entrada física',
  PHYSICAL_OUT: 'saída física',
  RESERVATION_IN: 'reservadas',
  RESERVATION_OUT: 'estornadas da reserva',
};

/**
 * Retorna os metadados visuais e semânticos para um tipo de movimentação Kardex.
 */
export function getKardexMovementPresentation(
  type: StockMovementType
): KardexMovementPresentation {
  return KARDEX_MOVEMENT_META[type] ?? KARDEX_MOVEMENT_META.MANUAL_ADJUSTMENT;
}

/**
 * Formata data e hora ISO para exibição cronológica na linha do tempo Kardex (pt-BR).
 */
export function formatKardexDateTime(isoDate?: string): string {
  if (!isoDate) {
    return '—';
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formata custo unitário em BRL quando presente na movimentação Kardex.
 */
export function formatKardexCurrency(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

/**
 * Formata a variação principal exibida no card da timeline Kardex.
 */
export function formatKardexDeltaSummary(
  movement: StockMovement,
  fallbackUnitMeasure = 'UN'
): string {
  const meta = getKardexMovementPresentation(movement.type);
  const unit = movement.unitMeasure || fallbackUnitMeasure;
  const qtyText = formatStockQuantity(Math.abs(Number(movement.quantity ?? 0)), unit);
  return `${meta.deltaPrefix}${qtyText} (${KARDEX_DELTA_SUFFIX[meta.impactType]})`;
}

/**
 * Calcula o saldo disponível resultante após uma movimentação Kardex (RN-01).
 */
export function computeKardexAvailableAfter(movement: StockMovement): number {
  const physical = Number(movement.newPhysicalQuantity ?? 0);
  const reserved = Number(movement.newReservedQuantity ?? 0);
  return physical - reserved;
}
