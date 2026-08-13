export type MaterialType = 'Glass' | 'Profile' | 'Film' | 'Hardware';

export type UnitMeasure = 'M2' | 'METRO' | 'BARRA_3M' | 'BARRA_6M' | 'UN' | 'PAR' | 'KG' | 'LITRO';

export type CalculationType = 'SQUARE_METER' | 'LINEAR_METER' | 'UNIT' | 'PAIR' | 'WEIGHT_KG';

export interface GlassDTO {
  id: string; // Updated to match UUID pattern from backend
  name: string;
  thicknessMm: number;
  colorFinish: string;
  pricePerSqm: number;
  maxWidthMm: number;
  maxHeightMm: number;
  supplierId?: string;
  supplierName?: string;
  active?: boolean;
}

export interface ProfileDTO {
  id: string; // UUID from AluminumProfileResponseDTO
  name: string;
  commercialReference: string;
  ncmCode: string;
  colorFinish: string;
  standardLengthM: number;
  unitMeasure: UnitMeasure;
  costPrice: number;
  salePrice: number;
  active: boolean;
  createdAt?: string; // OffsetDateTime
  updatedAt?: string; // OffsetDateTime
}

export interface HardwareDTO {
  id: string; // UUID from HardwareResponseDTO
  skuCode: string;
  name: string;
  unitMeasure: UnitMeasure;
  calculationType: CalculationType;
  costPrice: number;
  salePrice: number;
  active: boolean;
  createdAt?: string; // OffsetDateTime
  updatedAt?: string; // OffsetDateTime
}

export interface FilmDTO {
  id: string; // UUID from FilmResponseDTO
  name: string;
  colorFinish: string;
  salePrice: number;
  unitMeasure: string; // Backend currently returns String, not UnitMeasure enum here
  active?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
