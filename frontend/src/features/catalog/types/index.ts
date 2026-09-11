// Re-export template types
export * from './templates';

export type MaterialType = 'Glass' | 'Profile' | 'Film' | 'Hardware' | 'Product';

export type UnitMeasure = 'M2' | 'METRO' | 'BARRA_3M' | 'BARRA_6M' | 'UN' | 'PAR' | 'PAIR' | 'KG' | 'LITRO';

export type CalculationType = 'SQUARE_METER' | 'LINEAR_METER' | 'UNIT' | 'PAIR' | 'WEIGHT_KG';

export interface GlassDTO {
  id: string;
  name: string;
  thicknessMm: number;
  colorFinish: string;
  pricePerSqm: number;
  salePrice?: number;
  commercialReference?: string;
  skuCode?: string;
  maxWidthMm: number;
  maxHeightMm: number;
  supplierId?: string;
  supplierName?: string;
  active?: boolean;
  familyCode?: string;
}

export interface ProfileDTO {
  id: string;
  name: string;
  commercialReference: string;
  ncmCode: string;
  colorFinish: string;
  standardLengthM: number;
  unitMeasure: UnitMeasure;
  costPrice: number;
  salePrice: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  familyCode?: string;
}

export interface HardwareDTO {
  id: string;
  skuCode: string;
  commercialReference?: string;
  name: string;
  unitMeasure: UnitMeasure;
  calculationType: CalculationType;
  costPrice: number;
  salePrice: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  familyCode?: string;
}

export interface FilmDTO {
  id: string;
  name: string;
  commercialReference?: string;
  skuCode?: string;
  colorFinish: string;
  salePrice: number;
  unitMeasure: string;
  active?: boolean;
  familyCode?: string;
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

export interface MaterialSummary {
  id: string;
  name: string;
  skuCode?: string;
  commercialReference?: string;
  unitMeasure: string;
  salePrice: number;
  costPrice: number;
  colorFinish?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryName: string;
  templateType: import('./templates').DoorTemplateType;
  templateConfig?: import('./templates').TemplateConfig;
  categoryRequirements?: import('./templates').MaterialCategoryType[];
  isActive: boolean;
  items?: never[];
}

export interface ProductRequest {
  name: string;
  templateType: import('./templates').DoorTemplateType;
  templateConfig?: import('./templates').TemplateConfig;
  categoryRequirements: import('./templates').MaterialCategoryType[];
}
