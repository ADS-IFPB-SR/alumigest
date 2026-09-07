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

export type MaterialCategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'FILM';

export interface ProductCategoryRequirement {
  id: string;
  categoryType: MaterialCategoryType;
  label: string; // Ex: 'Vidro das Folhas', 'Perfis e Trilhos', 'Kit Ferragens', 'Película'
  isOptional?: boolean;
  defaultMaterialId?: string;
}

export type DoorTemplateType =
  | 'SLIDING_DOOR_2F'    // Porta de Correr 2 Folhas
  | 'SLIDING_DOOR_4F'    // Porta de Correr 4 Folhas
  | 'PIVOTING_DOOR'      // Porta Pivotante
  | 'SWING_DOOR_1F'      // Porta de Giro 1 Folha
  | 'SWING_DOOR_2F'      // Porta de Giro 2 Folhas
  | 'SLIDING_WINDOW_2F'  // Janela de Correr 2 Folhas
  | 'SLIDING_WINDOW_4F'  // Janela de Correr 4 Folhas
  | 'MAXIM_AR_WINDOW'    // Janela Maxim-Ar
  | 'GLASS_BOX_FRONTAL'  // Box de Vidro Frontal F1
  | 'GLASS_BOX_CORNER'   // Box de Vidro Canto em L
  | 'FIXED_GLASS_FACADE'; // Painel Fixo / Fachada

export type AluminumColor = 'BLACK' | 'WHITE' | 'BRONZE' | 'NATURAL' | 'GOLD';

export type GlassFinish = 'CLEAR' | 'GREEN' | 'SMOKE' | 'BRONZE' | 'FROSTED' | 'REFLECTIVE';

export type OpeningDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'CENTER_TO_SIDES' | 'OUTSIDE' | 'INSIDE';

export type HandleType = 'BAR_TUBULAR' | 'SHELL_LOCK' | 'LEVER_HANDLE' | 'NONE';

export interface HandleConfig {
  handleType: HandleType;
  side: 'ONE_SIDE' | 'BOTH_SIDES'; // 1 lado ou nos 2 lados
  coverage: 'FULL' | 'PIECE'; // Inteiro ou Pedaço
  pieceLengthCm?: number; // Ex: 10, 15, 20, 30, 40, 60, 80, 100 cm
}

export interface HoleDrillingConfig {
  holeCount: number; // Quantidade de furos (ex: 2, 3, 4)
  divisionType: 'EQUAL' | 'CUSTOM_DISTANCE'; // 'Por igual' ou 'Com medida'
  customDistancesMm?: number[]; // Distâncias em mm entre furos ou das bordas
}

export interface TemplateConfig {
  templateType: DoorTemplateType;
  aluminumColor?: AluminumColor;
  glassFinish?: GlassFinish;
  openingDirection?: OpeningDirection;
  handleType?: HandleType;
  handleConfig?: HandleConfig;
  drillingConfig?: HoleDrillingConfig;
  isSlatted?: boolean;
  hasFixedPanel?: boolean;
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
  imageUrl?: string;
  templateType?: DoorTemplateType;
  templateConfig?: TemplateConfig;
  description?: string;
  categoryRequirements?: ProductCategoryRequirement[];
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
  imageUrl?: string;
  templateType?: DoorTemplateType;
  templateConfig?: TemplateConfig;
  description?: string;
  categoryRequirements?: ProductCategoryRequirement[];
  items?: ProductItemRequest[];
}

// ─── Budget Types ────────────────────────────────────────────

export type BudgetStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  address?: string;
}

export interface BudgetItemOption {
  materialId: string;
  materialName: string;
  unitMeasure: string;
  categoryType?: MaterialCategoryType;
  selectedType?: string;
  selectedColor?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BudgetItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  templateType?: DoorTemplateType;
  templateConfig?: TemplateConfig;
  handleConfig?: HandleConfig;
  drillingConfig?: HoleDrillingConfig;
  width: number;     // mm
  height: number;    // mm
  quantity: number;
  laborCost: number;
  options: BudgetItemOption[];
  subtotal: number;
  notes?: string;
}

export interface Budget {
  id: string;
  code: string; // ORC-2026-001
  customer: Customer;
  items: BudgetItem[];
  subtotal: number;
  discountPercent: number;
  discountValue: number;
  total: number;
  status: BudgetStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
}


