/**
 * Módulo de Tipos para a feature de Orçamentos (Budgets).
 * Centraliza os contratos da US-09 / US-46 e tipos visuais do Builder/CAD.
 */

import type {
  HandlePosition,
  HandleType,
  HandleSide,
  HandleCoverage,
  DivisionType,
  OpeningDirection,
  BudgetStatus,
  DiscountType,
  PaymentCondition,
  CategoryType,
  DoorTemplateType,
  TemplateConfig,
  HandleConfig,
  DrillingConfig,
  BudgetItemOption,
  BudgetItem,
  BudgetSummary,
} from './budget';

import type {
  TemplateOptionSchema,
  DrillingConfig as CatalogDrillingConfig,
  SlidingMode,
} from '../../catalog/types/templates';

// ============================================================
// RE-EXPORTAÇÃO CENTRAL DE CONTRATOS E DTOs (budget.ts)
// ============================================================
export * from './budget';

// ============================================================
// LABELS E MAPEAMENTOS VISUAIS DE MECÂNICA
// ============================================================
export const HANDLE_POSITION_LABELS: Record<HandlePosition, string> = {
  LEFT: 'Lateral Esquerda (Em pé)',
  RIGHT: 'Lateral Direita (Em pé)',
  TOP: 'Superior (Deitado no topo)',
  BOTTOM: 'Inferior (Deitado na base)',
  CENTER: 'Centro',
};

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
// CONFIGURAÇÃO DO TEMPLATE NO CATÁLOGO
// ============================================================
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
// ESTADO INTERNO DO BUILDER E FORMULÁRIO DO EDITOR
// ============================================================
export interface MaterialSelection {
  requirementId: string;
  categoryType: CategoryType;
  label: string;
  isOptional: boolean;
  materialId: string;
  materialName: string;
  unitMeasure: string;
  unitPrice: number;
  quantity?: number;
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

export interface BudgetFormState {
  customerId: string;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerAddress: string;
  items: BudgetItem[];
  laborCost: number;
  discountPercent: number;
  discountType: DiscountType;
  discountInput: number;
  paymentCondition: PaymentCondition | '';
  notes: string;
  commercialConditions: string;
  validUntil?: string;
}

// ============================================================
// CLIENTE DO FORMULÁRIO RÁPIDO
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
// DETALHE DO ORÇAMENTO E PAYLOAD DE CRIAÇÃO
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
  discountPercent?: number;
  discountType?: DiscountType | 'PERCENTAGE' | 'FIXED';
  discountInput?: number;
  paymentCondition?: PaymentCondition;
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
// CONSTANTES DE UI — TIPOS DE ESQUADRIA E MECÂNICA
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
