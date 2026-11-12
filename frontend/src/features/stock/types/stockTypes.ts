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

export type StockAlertLevel = 'SAFE' | 'ORDER_POINT' | 'PURCHASE_DEMAND';

export interface StockItem {
  id: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  category: 'GLASS' | 'PROFILE' | 'HARDWARE' | 'FILM' | string;
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
  type: StockMovementType;
  quantity: number;
  previousPhysicalQuantity: number;
  newPhysicalQuantity: number;
  previousReservedQuantity?: number;
  newReservedQuantity?: number;
  referenceDocument?: string;
  reason?: string;
  registeredBy?: string;
  createdAt: string;
}

export interface StockMovementRequest {
  materialId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  referenceDocument?: string;
  registeredBy?: string;
}

export interface StockFilterParams {
  category?: string;
  alertStatus?: StockAlertStatus;
  search?: string;
}
