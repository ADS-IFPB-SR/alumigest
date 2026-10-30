import type { MaterialCategoryType } from '@/features/catalog/types/templates';

export type { MaterialCategoryType };

export type PartSaleStatus = 'DRAFT' | 'APPROVED' | 'CANCELLED';

export interface CalculatePartItemPayload {
  category: MaterialCategoryType;
  widthMm?: number | null;
  heightMm?: number | null;
  quantity: number;
  unitPrice: number;
  lossFactor?: number | null;
}

export interface CalculatePartItemResult {
  calculatedUnitMeasure: number;
  unitPrice: number;
  totalPrice: number;
}

export type CalculatePartItemRequest = CalculatePartItemPayload;
export type CalculatePartItemResponse = CalculatePartItemResult;

export interface PartSaleItem {
  id: string;
  category: MaterialCategoryType;
  categoryLabel: string;
  description: string;
  materialId?: string;
  quantity: number;
  heightMm?: number | null;
  widthMm?: number | null;
  unitPrice: number;
  lossFactor?: number;
  calculatedUnitMeasure: number;
  totalPrice: number;
}

export interface CreatePartSaleItemRequest {
  materialType: MaterialCategoryType;
  referenceId: string;
  quantity: number;
  widthMm?: number | null;
  heightMm?: number | null;
  unitPrice: number;
}

export interface CreatePartSaleRequest {
  clientId: string;
  status?: PartSaleStatus;
  discountAmount?: number;
  items: CreatePartSaleItemRequest[];
}

export interface PartSaleItemResponse {
  id: string;
  materialType: MaterialCategoryType;
  materialId: string;
  description: string;
  quantity: number;
  widthMm?: number | null;
  heightMm?: number | null;
  calculatedUnitMeasure: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PartSaleResponse {
  id: string;
  code: string;
  clientId: string;
  clientName?: string | null;
  status: PartSaleStatus;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  items: PartSaleItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PartSaleItemDraft {
  tempId: string;
  materialType: MaterialCategoryType;
  referenceId: string;
  description: string;
  quantity: number;
  widthMm?: number | null;
  heightMm?: number | null;
  linearMeters?: number | null;
  unitPrice: number;
  totalPrice: number;
  calculatedAreaSqm?: number | null;
  notes?: string | null;
}
