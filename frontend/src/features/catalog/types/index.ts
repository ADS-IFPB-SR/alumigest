export type MaterialType = 'Glass' | 'Profile' | 'Film' | 'Hardware';

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
