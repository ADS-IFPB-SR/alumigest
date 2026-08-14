export type MaterialType = 'Glass' | 'Profile' | 'Film' | 'Hardware' | 'Product';

export interface GlassDTO {
  id: number;
  name: string;
  thicknessMm: number;
  colorFinish: string;
  pricePerSqm: number;
  maxWidthMm: number;
  maxHeightMm: number;
  supplierId: number;
  supplierName?: string;
  active?: boolean;
}

export interface ProfileDTO {
  id: number;
  skuCode: string; // using skuCode based on HardwareResponseDTO convention
  description: string;
  commercialLine: string;
  weightPerMeterKg: number;
  pricePerMeter: number;
  barLengthMm: number;
  supplierId?: number;
  active?: boolean;
}

export interface HardwareDTO {
  id: number;
  name: string;
  skuCode: string;
  unitMeasure: string;
  salePrice: number; // replacing precoUnitario to match Backend's HardwareResponseDTO
  costPrice?: number;
  calculationType?: string;
  supplierId?: number;
  active?: boolean;
}

export interface FilmDTO {
  id: number;
  name: string;
  colorFinish: string; // type replaced by colorFinish according to FilmResponseDTO
  salePrice: number; // precoMetroQuadrado replaced by salePrice
  unitMeasure?: string;
  active?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface MaterialSummary {
  id: string;
  name: string;
  skuCode?: string;
  unitMeasure: string;
  salePrice: number;
  costPrice: number;
  colorFinish?: string;
  isActive: boolean;
}

export interface ProductItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  laborCost: number;
  isActive: boolean;
  items: ProductItem[];
}

export interface ProductItemRequest {
  materialId: string;
  quantity: number;
}

export interface ProductRequest {
  name: string;
  categoryId: string;
  laborCost: number;
  items: ProductItemRequest[];
}
