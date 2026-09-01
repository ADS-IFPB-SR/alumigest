export type DoorTemplateType =
  | 'SLIDING_DOOR_2F'
  | 'SLIDING_DOOR_4F'
  | 'PIVOTING_DOOR'
  | 'SWING_DOOR_1F'
  | 'SWING_DOOR_2F'
  | 'SLIDING_WINDOW_2F'
  | 'SLIDING_WINDOW_4F'
  | 'MAXIM_AR_WINDOW'
  | 'GLASS_BOX_FRONTAL'
  | 'GLASS_BOX_CORNER'
  | 'FIXED_GLASS_FACADE';

export type OpeningDirection =
  | 'LEFT_TO_RIGHT'
  | 'RIGHT_TO_LEFT'
  | 'CENTER_TO_SIDES'
  | 'OUTSIDE'
  | 'INSIDE';

export type HandleType = 'BAR_TUBULAR' | 'SHELL_LOCK' | 'LEVER_HANDLE' | 'NONE';
export type HandleSide = 'ONE_SIDE' | 'BOTH_SIDES';
export type HandleCoverage = 'FULL' | 'PIECE';
export type DivisionType = 'EQUAL' | 'CUSTOM_DISTANCE';
export type CategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'FILM';

export type BudgetStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

// ============================================================
// CONFIGURAÇÕES DE PUXADOR E FURAÇÃO
// ============================================================
export interface HandleConfig {
  handleType: HandleType;
  side?: HandleSide;
  coverage?: HandleCoverage;
  pieceLengthCm?: number;
}

export interface DrillingConfig {
  holeCount: number;
  divisionType: DivisionType;
  customDistancesMm?: number[];
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
  templateConfig?: TemplateConfig;
  categoryRequirements?: CategoryRequirement[];
  items?: { id: string; materialId: string; materialName: string; quantity: number }[];
}

// ============================================================
// ESTADO INTERNO DO BUILDER
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
  /**
   * Quantidade técnica de insumo calculada e retornada pelo backend.
   * O frontend NÃO calcula este valor através de fórmulas geométricas locais.
   */
  quantity?: number;
  /** Subtotal estimado se quantity for fornecida pelo backend */
  totalPrice?: number;
}

export interface BuilderState {
  template: WindowTemplate | null;
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
// ITEM DO ORÇAMENTO — estrutura persistida e enviada à API
// ============================================================
export interface BudgetItemOption {
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
  quantity: number;
  laborCost: number;
  options: BudgetItemOption[];
  subtotal: number;
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
}

export interface BudgetPageResponse {
  content: BudgetSummary[];
  totalElements?: number;
  totalPages?: number;
  page?: {
    size?: number;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

export interface BudgetFilters {
  page: number;
  size: number;
  status?: BudgetStatus | '';
  search?: string;
  sort?: string;
}

// ============================================================
// PAYLOADS DE CRIAÇÃO E DETALHE (MIX DEVELOP/MY)
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
  SLIDING_DOOR_2F: {
    type: 'SLIDING_DOOR_2F',
    label: 'Porta de Correr 2 Folhas',
    description: '1 Folha Fixa + 1 Folha Móvel',
    icon: 'door_sliding',
    supportedDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
  },
  SLIDING_DOOR_4F: {
    type: 'SLIDING_DOOR_4F',
    label: 'Porta de Correr 4 Folhas',
    description: '2 Fixas Laterais + 2 Móveis Centrais',
    icon: 'door_sliding',
    supportedDirections: ['CENTER_TO_SIDES'],
  },
  PIVOTING_DOOR: {
    type: 'PIVOTING_DOOR',
    label: 'Porta Pivotante',
    description: 'Eixo Deslocado',
    icon: 'door_back',
    supportedDirections: ['OUTSIDE', 'INSIDE'],
  },
  SWING_DOOR_1F: {
    type: 'SWING_DOOR_1F',
    label: 'Porta de Abrir 1 Folha',
    description: 'Porta de Giro com 1 Folha',
    icon: 'door_front',
    supportedDirections: ['OUTSIDE', 'INSIDE'],
  },
  SWING_DOOR_2F: {
    type: 'SWING_DOOR_2F',
    label: 'Porta de Abrir 2 Folhas',
    description: 'Porta de Giro com 2 Folhas',
    icon: 'door_front',
    supportedDirections: ['OUTSIDE', 'INSIDE'],
  },
  SLIDING_WINDOW_2F: {
    type: 'SLIDING_WINDOW_2F',
    label: 'Janela de Correr 2 Folhas',
    description: '1 Fixa + 1 Móvel',
    icon: 'window',
    supportedDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
  },
  SLIDING_WINDOW_4F: {
    type: 'SLIDING_WINDOW_4F',
    label: 'Janela de Correr 4 Folhas',
    description: '2 Fixas + 2 Móveis',
    icon: 'window',
    supportedDirections: ['CENTER_TO_SIDES'],
  },
  MAXIM_AR_WINDOW: {
    type: 'MAXIM_AR_WINDOW',
    label: 'Janela Maxim-Ar',
    description: 'Projeção Superior Basculante',
    icon: 'window',
    supportedDirections: ['OUTSIDE'],
  },
  GLASS_BOX_FRONTAL: {
    type: 'GLASS_BOX_FRONTAL',
    label: 'Box de Banheiro Frontal',
    description: '1 Fixo + 1 Correr — F1',
    icon: 'bathroom',
    supportedDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
  },
  GLASS_BOX_CORNER: {
    type: 'GLASS_BOX_CORNER',
    label: 'Box de Banheiro em Canto',
    description: 'Formato em L — Canto',
    icon: 'bathroom',
    supportedDirections: ['CENTER_TO_SIDES'],
  },
  FIXED_GLASS_FACADE: {
    type: 'FIXED_GLASS_FACADE',
    label: 'Painel Fixo / Fachada',
    description: 'Painel em Vidro Fixo',
    icon: 'image',
    supportedDirections: ['OUTSIDE'],
  },
};

export const HANDLE_TYPE_LABELS: Record<HandleType, string> = {
  BAR_TUBULAR: 'Tubular Inox',
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
};

export const BUDGET_STATUS_OPTIONS: { value: BudgetStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'SENT', label: 'Enviados' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: 'CANCELLED', label: 'Cancelados' },
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
};
