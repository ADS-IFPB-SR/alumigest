export type DoorTemplateType =
  | 'SLIDING_DOOR_1F'
  | 'SLIDING_DOOR_2F'
  | 'SLIDING_DOOR_3F'
  | 'SLIDING_DOOR_4F'
  | 'SWING_DOOR_1F'
  | 'SWING_DOOR_2F'
  | 'AWNING_WINDOW_1F'
  | 'AWNING_WINDOW_1F_INV'
  | 'FRONT_DRAWER'
  | 'FIXED_PANEL';

export type OpeningDirection =
  | 'LEFT_TO_RIGHT'
  | 'RIGHT_TO_LEFT'
  | 'CENTER_TO_SIDES'
  | 'OUTSIDE'
  | 'INSIDE';

export type HandleType = 'BAR_TUBULAR' | 'PROFILE_HANDLE' | 'SHELL_LOCK' | 'LEVER_HANDLE' | 'NONE';
export type HandlePosition = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'CENTER';
export type HandleOrientation = 'HORIZONTAL' | 'VERTICAL';
export type HandleSide = 'ONE_SIDE' | 'BOTH_SIDES';
export type HandleCoverage = 'FULL' | 'PIECE';
export type DivisionType = 'EQUAL' | 'CUSTOM_DISTANCE';
export type CategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'FILM';

export const HANDLE_POSITION_LABELS: Record<HandlePosition, string> = {
  LEFT: 'Lateral Esquerda (Em pé)',
  RIGHT: 'Lateral Direita (Em pé)',
  TOP: 'Superior (Deitado no topo)',
  BOTTOM: 'Inferior (Deitado na base)',
  CENTER: 'Centro',
};

export type BudgetStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

// ============================================================
// TIPOS E MODELOS COMERCIAIS (US-09)
// ============================================================
export type DiscountType = 'PERCENTUAL' | 'VALOR_FIXO';

export type PaymentCondition =
  | 'A_VISTA_PIX'
  | 'ENTRADA_50_SALDO_ENTREGA'
  | 'CARTAO_12X'
  | 'A_COMBINAR';

export interface DiscountRequest {
  discountType: DiscountType;
  value: number;
  paymentCondition: PaymentCondition;
  paymentNotes?: string;
  validUntil?: string;
}

// ============================================================
// CONFIGURAÇÕES DE PUXADOR E FURAÇÃO
// ============================================================
export interface HandleConfig {
  handleType: HandleType;
  position?: HandlePosition;
  orientation?: HandleOrientation;
  side?: HandleSide;
  coverage?: HandleCoverage;
  pieceLengthCm?: number;
  handlePosition?: HandlePosition;
  handleLengthMm?: number;
}

export type DrillingPosition = 'SUPERIOR' | 'LATERAL' | 'FRONTAL';

export interface DrillingConfig {
  holeCount: number;
  divisionType?: DivisionType;
  drillingPosition?: DrillingPosition;
  customDistancesMm?: number[];
  customPositionsMm?: number[];
  drillingMode?: string;
}

// ============================================================
// REQUISITO DE CATEGORIA — Vínculo do Template
// ============================================================
export interface CategoryRequirement {
  id: string;
  categoryType: CategoryType;
  label: string;
  isOptional: boolean;
}

// ============================================================
// CONFIGURAÇÃO DE TEMPLATE (TemplateConfig)
// ============================================================
export interface TemplateConfig {
  templateType: string;
  aluminumColor?: string;
  glassFinish?: string;
  openingDirection?: OpeningDirection;
  handleType?: HandleType;
  handleConfig?: HandleConfig;
  drillingConfig?: DrillingConfig;
  isSlatted?: boolean;
  hasFixedPanel?: boolean;
}

import type {
  TemplateOptionSchema,
  DrillingConfig as CatalogDrillingConfig,
  SlidingMode,
} from '../../catalog/types/templates';

export interface WindowTemplateConfig {
  templateType?: string;
  profileMm?: number;
  aluminumColor?: string;
  glassColor?: string;
  glassFinish?: string;
  openingDirection?: OpeningDirection;
  slidingMode?: SlidingMode;
  handleType?: HandleType;
  handleConfig?: HandleConfig;
  drillingConfig?: DrillingConfig | CatalogDrillingConfig;
  optionSchema?: TemplateOptionSchema;
  isSlatted?: boolean;
  hasFixedPanel?: boolean;
}

// ============================================================
// PRODUTO / TEMPLATE DE ESQUADRIA
// ============================================================
export interface WindowTemplate {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  laborCost: number;
  isActive: boolean;
  templateType?: string;
  catalogTemplateType?: string | null;
  templateConfig?: WindowTemplateConfig;
  categoryRequirements?: (CategoryType | { categoryType: CategoryType; label?: string; isOptional?: boolean })[];
  items?: { id: string; materialId: string; materialName: string; quantity: number }[];
}

// ============================================================
// ESTADO INTERNO DO BUILDER
// ============================================================
export interface BudgetItemCalculationOptionRequest {
  materialId?: string;
  categoryType: string;
  manualQuantity?: number;
}

export interface BudgetItemCalculationRequest {
  templateType?: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  options: BudgetItemCalculationOptionRequest[];
}

export interface BudgetItemCalculationOptionResult {
  materialId: string;
  categoryType: string;
  suggestedQuantity: number;
  physicalMinimumQuantity: number;
  isBelowPhysicalMinimum: boolean;
  warningMessage?: string;
}

export interface BudgetItemCalculationResponse {
  physicalAreaM2: number;
  physicalPerimeterM: number;
  options: BudgetItemCalculationOptionResult[];
}

export interface MaterialSelection {
  requirementId: string;
  categoryType: CategoryType;
  label: string;
  isOptional: boolean;
  materialId: string;
  materialName: string;
  unitMeasure: string;
  unitPrice: number;
  /**
   * Quantidade de insumo calculada ou informada pelo usuário.
   */
  quantity?: number;
  /** Subtotal estimado */
  totalPrice?: number;
  suggestedQuantity?: number;
  physicalMinimumQuantity?: number;
  isBelowPhysicalMinimum?: boolean;
  warningMessage?: string;
  isManualOverride?: boolean;
  familyCode?: string;
}

export interface BuilderState {
  template: WindowTemplate | null;
  templateType?: DoorTemplateType;
  widthMm: number | '';
  heightMm: number | '';
  quantity: number | '';
  openingDirection: OpeningDirection;
  handleConfig: HandleConfig;
  drillingConfig: DrillingConfig;
  aluminumColor?: string;
  glassFinish?: string;
  laborCost?: number;
  notes?: string;
  materialSelections: MaterialSelection[];
}

// ============================================================
// ITEM DO ORÃ‡AMENTO â€” estrutura persistida e enviada Ã  API
// ============================================================
export interface BudgetItemOption {
  id?: string;
  materialId: string;
  materialName: string;
  categoryType: CategoryType;
  unitMeasure: string;
  quantity?: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface BudgetItem {
  tempId: string;
  productId: string;
  productName: string;
  templateType: string;
  templateConfig: TemplateConfig;
  handleConfig: HandleConfig;
  drillingConfig: DrillingConfig;
  widthMm: number;
  heightMm: number;
  width?: number;
  height?: number;
  quantity: number;
  laborCost: number;
  options: BudgetItemOption[];
  subtotal: number;
  unitPrice?: number;
  notes?: string;
}

export interface BudgetFormState {
  customerId: string;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerAddress: string;
  items: BudgetItem[];
  laborCost: number;
  discountPercent: number;
  notes: string;
  commercialConditions: string;
  validUntil?: string;
}

// ============================================================
// CLIENTE VIRTUAL
// ============================================================
export interface Customer {
  id: string;
  nomeCompleto: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  observacoes?: string;
  ativo: boolean;
}

export interface CustomerRequest {
  nomeCompleto: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
}

// ============================================================
// RESPOSTAS E DTOs DA API (DEVELOP)
// ============================================================
export interface BudgetCustomer {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
}

export interface BudgetSummary {
  id: string;
  code: string;
  customerId?: string;
  customerName: string;
  customer?: BudgetCustomer;
  status: BudgetStatus;
  createdAt: string;
  validUntil: string;
  subtotal: number;
  discountPercent: number;
  discountValue: number;
  total: number;
  itemCount: number;
  paymentCondition?: PaymentCondition;
  paymentConditionLabel?: string;
  paymentNotes?: string;
  isExpired?: boolean;
}

export interface BudgetPageResponse {
  content: BudgetSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export interface BudgetFilters {
  page: number;
  size: number;
  status?: BudgetStatus | '';
  search?: string;
  sort?: string;
}

// ============================================================
// PAYLOADS DE CRIAÃ‡ÃƒO E DETALHE (MIX DEVELOP/MY)
// ============================================================
export interface BudgetDetail extends BudgetSummary {
  notes?: string;
  commercialConditions?: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    templateType: string;
    templateConfig: TemplateConfig;
    handleConfig: HandleConfig;
    drillingConfig: DrillingConfig;
    width: number;
    height: number;
    quantity: number;
    laborCost: number;
    options: BudgetItemOption[];
    subtotal: number;
    notes?: string;
  }[];
}

export interface CreateBudgetPayload {
  customerId: string;
  discountPercent: number;
  notes?: string;
  commercialConditions?: string;
  validUntil?: string;
  items: {
    productId: string;
    templateType: string;
    templateConfig: TemplateConfig;
    handleConfig: HandleConfig;
    drillingConfig: DrillingConfig;
    width: number;
    height: number;
    quantity: number;
    laborCost?: number;
    options: { materialId: string; quantity?: number; categoryType: string }[];
    notes?: string;
  }[];
}

// ============================================================
// CONSTANTES UI
// ============================================================
export interface TemplateTypeInfo {
  type: DoorTemplateType;
  label: string;
  description: string;
  icon: string;
  supportedDirections: OpeningDirection[];
}

export const TEMPLATE_TYPE_INFO: Record<DoorTemplateType, TemplateTypeInfo> = {
  SLIDING_DOOR_1F: { type: 'SLIDING_DOOR_1F', label: 'Porta de Correr 1 Folha', description: '1 Folha Móvel', icon: 'door_sliding', supportedDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] },
  SLIDING_DOOR_2F: { type: 'SLIDING_DOOR_2F', label: 'Porta de Correr 2 Folhas', description: '1 Fixa + 1 Móvel', icon: 'door_sliding', supportedDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] },
  SLIDING_DOOR_3F: { type: 'SLIDING_DOOR_3F', label: 'Porta de Correr 3 Folhas', description: '1 Fixa + 2 Móveis', icon: 'door_sliding', supportedDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] },
  SLIDING_DOOR_4F: { type: 'SLIDING_DOOR_4F', label: 'Porta de Correr 4 Folhas', description: '2 Fixas + 2 Móveis', icon: 'door_sliding', supportedDirections: ['CENTER_TO_SIDES'] },
  SWING_DOOR_1F: { type: 'SWING_DOOR_1F', label: 'Porta de Giro 1 Folha', description: 'De abrir, 1 Folha', icon: 'door_front', supportedDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] },
  SWING_DOOR_2F: { type: 'SWING_DOOR_2F', label: 'Porta de Giro 2 Folhas', description: 'De abrir, 2 Folhas', icon: 'door_front', supportedDirections: ['CENTER_TO_SIDES'] },
  AWNING_WINDOW_1F: { type: 'AWNING_WINDOW_1F', label: 'Porta Basculante 1 Folha', description: 'Abertura superior (Maxim-ar)', icon: 'window', supportedDirections: ['OUTSIDE'] },
  AWNING_WINDOW_1F_INV: { type: 'AWNING_WINDOW_1F_INV', label: 'Porta Basculante Inversa', description: 'Abertura inferior (Tombar)', icon: 'window', supportedDirections: ['INSIDE'] },
  FRONT_DRAWER: { type: 'FRONT_DRAWER', label: 'Gaveta Frontal', description: 'Frente de Gaveta', icon: 'kitchen', supportedDirections: ['OUTSIDE'] },
  FIXED_PANEL: { type: 'FIXED_PANEL', label: 'Painel Fixo', description: 'Quadro Fixo sem abertura', icon: 'grid_view', supportedDirections: [] },
};

export const HANDLE_TYPE_LABELS: Record<HandleType, string> = {
  BAR_TUBULAR: 'Tubular Inox',
  PROFILE_HANDLE: 'Puxador Perfil',
  SHELL_LOCK: 'Fecho Concha',
  LEVER_HANDLE: 'Maçaneta',
  NONE: 'Nenhum',
};

export const HANDLE_SIDE_LABELS: Record<HandleSide, string> = {
  ONE_SIDE: '1 Lado',
  BOTH_SIDES: '2 Lados',
};

export const HANDLE_COVERAGE_LABELS: Record<HandleCoverage, string> = {
  FULL: 'Extensão Inteira',
  PIECE: 'Pedaço (tamanho em cm)',
};

export const DIVISION_TYPE_LABELS: Record<DivisionType, string> = {
  EQUAL: 'Por Igual',
  CUSTOM_DISTANCE: 'Distância Customizada',
};

export const OPENING_DIRECTION_LABELS: Record<OpeningDirection, string> = {
  LEFT_TO_RIGHT: 'Abrir p/ Direita',
  RIGHT_TO_LEFT: 'Abrir p/ Esquerda',
  CENTER_TO_SIDES: 'Centro p/ Lados',
  OUTSIDE: 'Para Fora',
  INSIDE: 'Para Dentro',
};

export const STATUS_LABELS: Record<BudgetStatus, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
};

export const BUDGET_STATUS_OPTIONS: { value: BudgetStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'SENT', label: 'Enviados' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: 'CANCELLED', label: 'Cancelados' },
  { value: 'EXPIRED', label: 'Expirados' },
];

export const BUDGET_STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; icon: string; key: BudgetStatus }
> = {
  DRAFT: { label: 'Rascunho', icon: 'edit_note', key: 'DRAFT' },
  SENT: { label: 'Enviado', icon: 'send', key: 'SENT' },
  APPROVED: { label: 'Aprovado', icon: 'check_circle', key: 'APPROVED' },
  REJECTED: { label: 'Rejeitado', icon: 'cancel', key: 'REJECTED' },
  CANCELLED: { label: 'Cancelado', icon: 'block', key: 'CANCELLED' },
  EXPIRED: { label: 'Expirado', icon: 'history', key: 'EXPIRED' },
};

// ============================================================
// CONSTANTES DE UI — CONDIÇÕES COMERCIAIS E DESCONTOS (US-09)
// ============================================================
export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTUAL: 'Percentual (%)',
  VALOR_FIXO: 'Valor Fixo (R$)',
};

export const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'PERCENTUAL', label: 'Percentual (%)' },
  { value: 'VALOR_FIXO', label: 'Valor Fixo (R$)' },
];

export const PAYMENT_CONDITION_LABELS: Record<PaymentCondition, string> = {
  A_VISTA_PIX: 'À Vista (PIX / Dinheiro)',
  ENTRADA_50_SALDO_ENTREGA: '50% Entrada + 50% na Entrega',
  CARTAO_12X: 'Cartão de Crédito até 12x',
  A_COMBINAR: 'A Combinar',
};

export const PAYMENT_CONDITION_OPTIONS: { value: PaymentCondition; label: string }[] = [
  { value: 'A_VISTA_PIX', label: 'À Vista (PIX / Dinheiro)' },
  { value: 'ENTRADA_50_SALDO_ENTREGA', label: '50% Entrada + 50% na Entrega' },
  { value: 'CARTAO_12X', label: 'Cartão de Crédito até 12x' },
  { value: 'A_COMBINAR', label: 'A Combinar' },
];
