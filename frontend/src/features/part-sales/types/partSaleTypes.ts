import type { MaterialCategoryType } from '../../catalog/types/templates';

export type { MaterialCategoryType };

export interface CalculatePartItemPayload {
  category: MaterialCategoryType;
  widthMm?: number | null;
  heightMm: number;
  quantity: number;
  unitPrice: number;
  lossFactor?: number | null;
}

export interface CalculatePartItemResult {
  calculatedUnitMeasure: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PartSaleItem {
  id: string;
  category: MaterialCategoryType;
  categoryLabel: string;
  description: string;
  materialId?: string;
  quantity: number;
  heightMm: number;
  widthMm?: number | null;
  unitPrice: number;
  lossFactor?: number;
  calculatedUnitMeasure: number;
  totalPrice: number;
}
