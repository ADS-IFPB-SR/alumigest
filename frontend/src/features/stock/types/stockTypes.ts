/**
 * Tipos fundamentais do domínio de Estoque & Almoxarifado (US-21 e US-22).
 */

export type StockMovementType =
  | 'PURCHASE_ENTRY'
  | 'PRODUCTION_RESERVATION'
  | 'PRODUCTION_OUTFLOW'
  | 'RESERVATION_CANCELLATION'
  | 'MANUAL_ADJUSTMENT'
  | 'SCRAP_LOSS';

export type StockAlertStatus = 'IN_STOCK' | 'ORDER_POINT' | 'NEED_PURCHASE';

export type StockDisplayAlertStatus = StockAlertStatus | 'NO_BALANCE';

export type StockSortField = 'NAME' | 'AVAILABLE' | 'CRITICALITY';

export type StockCategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'FILM';

export interface StockItem {
  id: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  category: StockCategoryType;
  unitMeasure: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number; // RN-01: physicalQuantity - reservedQuantity
  minimumStock: number;
  alertStatus: StockAlertStatus;
  lastUpdated?: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  unitMeasure?: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number | null;
  previousPhysicalQuantity: number;
  newPhysicalQuantity: number;
  previousReservedQuantity?: number;
  newReservedQuantity?: number;
  orderId?: string | null;
  referenceDocument?: string;
  supplier?: string | null;
  reason?: string;
  registeredBy?: string;
  createdAt: string;
}

export interface KardexMaterialTarget {
  readonly id: string;
  readonly skuCode?: string;
  readonly name: string;
  readonly unitMeasure?: string;
}

export interface StockMovementRequest {
  materialId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  referenceDocument?: string;
  registeredBy?: string;
  supplier?: string;
}

export interface InitialStockEntryRequest {
  quantity: number;
  unitCost: number;
  minimumStock?: number;
  supplier?: string;
  referenceDocument?: string;
  reason?: string;
  registeredBy?: string;
}

export interface MaterialWithStockCreateRequest {
  categoryType: StockCategoryType;
  aluminumProfile?: Record<string, unknown>;
  glass?: Record<string, unknown>;
  hardware?: Record<string, unknown>;
  film?: Record<string, unknown>;
  initialStock?: InitialStockEntryRequest | null;
}

export interface MaterialWithStockResponse {
  materialId: string;
  categoryType: StockCategoryType;
  material: unknown;
  stockItem: StockItem;
  initialMovement?: StockMovement | null;
}

export interface StockFilterParams {
  category?: string;
  alertStatus?: StockAlertStatus;
  search?: string;
  needsPurchase?: boolean;
  belowMinStock?: boolean;
  sort?: StockSortField;
}