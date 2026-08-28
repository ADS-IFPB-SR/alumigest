export type MaterialType = 'Glass' | 'Profile' | 'Film' | 'Hardware' | 'Product';

export type UnitMeasure = 'M2' | 'METRO' | 'BARRA_3M' | 'BARRA_6M' | 'UN' | 'PAR' | 'PAIR' | 'KG' | 'LITRO';

export type CalculationType = 'SQUARE_METER' | 'LINEAR_METER' | 'UNIT' | 'PAIR' | 'WEIGHT_KG';

export type DoorTemplateType = 'SWING' | 'SLIDING' | 'AWNING' | 'DRAWER';

export type MaterialCategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'ROLLERS' | 'FILM';

export type OpeningDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';

export type SlidingMode = 'BOTH_SLIDING' | 'LEFT_FIXED_RIGHT_SLIDING' | 'RIGHT_FIXED_LEFT_SLIDING';

export type HandleType = 'LEVER_HANDLE' | 'BAR_TUBULAR' | 'SHELL_LOCK' | 'NONE';

export type HandlePosition = 'LEFT' | 'RIGHT' | 'CENTER';

export type HoleDrillingMode = 'EQUAL' | 'CUSTOM';

export interface HandleConfigDTO {
  handleType?: HandleType | null;
  position?: HandlePosition | null;
  heightMm?: number | null;
  distanceFromEdgeMm?: number | null;
}

export interface DrillingConfigDTO {
  mode?: HoleDrillingMode | null;
  holeCount?: number | null;
  customDistancesMm?: number[] | null;
}

export interface TemplateOptionSchemaDTO {
  allowSlidingMode?: boolean | null;
  allowedSlidingModes?: SlidingMode[] | null;
  allowOpeningDirection?: boolean | null;
  allowedOpeningDirections?: OpeningDirection[] | null;
  allowHandleChange?: boolean | null;
  allowedHandleTypes?: HandleType[] | null;
  allowedHandlePositions?: HandlePosition[] | null;
  allowDrillingChange?: boolean | null;
  allowedDrillingModes?: HoleDrillingMode[] | null;
  allowedAluminumColors?: string[] | null;
  allowedGlassColors?: string[] | null;
}

export interface TemplateConfigDTO {
  profileMm?: number | null;
  aluminumColor?: string | null;
  glassColor?: string | null;
  openingDirection?: OpeningDirection | null;
  slidingMode?: SlidingMode | null;
  handleConfig?: HandleConfigDTO | null;
  drillingConfig?: DrillingConfigDTO | null;
  optionSchema?: TemplateOptionSchemaDTO | null;
}

export interface GlassDTO {
  id: string; // Updated to match UUID pattern from backend
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
  commercialReference?: string;
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
  commercialReference?: string;
  skuCode?: string;
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
  commercialReference?: string;
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
  templateType?: DoorTemplateType | null;
  templateConfig?: TemplateConfigDTO | null;
  categoryRequirements?: MaterialCategoryType[] | null;
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
  templateType?: DoorTemplateType | null;
  templateConfig?: TemplateConfigDTO | null;
  categoryRequirements?: MaterialCategoryType[] | null;
  items: ProductItemRequest[];
}
