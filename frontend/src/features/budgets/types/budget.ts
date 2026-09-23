/**
 * Interfaces TypeScript e DTOs de Contrato para o Módulo de Orçamentos (US-09 / US-46).
 * Alvo da tarefa [US-09.28] #199.
 */

// ============================================================
// ENUMS E TIPOS LITERAIS DE DOMÍNIO
// ============================================================

export type BudgetStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type DiscountType = 'PERCENTUAL' | 'VALOR_FIXO';

export type PaymentCondition =
  | 'A_VISTA_PIX'
  | 'ENTRADA_50_SALDO_ENTREGA'
  | 'CARTAO_12X'
  | 'A_COMBINAR';

export type CategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'FILM';

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
export type DrillingPosition = 'SUPERIOR' | 'LATERAL' | 'FRONTAL';

// ============================================================
// CONFIGURAÇÕES DE ESQUADRIAS E COMPONENTES
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

export interface DrillingConfig {
  holeCount: number;
  divisionType?: DivisionType;
  drillingPosition?: DrillingPosition;
  customDistancesMm?: number[];
  customPositionsMm?: number[];
  drillingMode?: string;
}

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
// OPÇÕES E ITENS DE ORÇAMENTO (BudgetItemOption, BudgetItem)
// ============================================================

export interface BudgetItemOption {
  id?: string;
  budgetItemId?: string;
  materialId: string;
  materialName: string;
  categoryType: CategoryType;
  unitMeasure: string;
  selectedColor?: string;
  selectedType?: string;
  quantity?: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface BudgetItem {
  id?: string;
  tempId: string;
  budgetId?: string;
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
  subtotal: number;
  unitPrice?: number;
  notes?: string;
  options: BudgetItemOption[];
}

// ============================================================
// DTOs DE REQUISIÇÃO (PAYLOADS DA API)
// ============================================================

/**
 * Payload para criação inicial de orçamento.
 * Alinhado ao backend record `BudgetCreateRequest(UUID clientId, String observacoes)`.
 */
export interface BudgetCreateRequest {
  clientId: string;
  observacoes?: string;
  notes?: string;
  items?: BudgetItemCreateRequest[];
}

/**
 * Payload para adição ou criação de item avulso ou parametrizado.
 * Alinhado ao backend record `BudgetItemCreateRequest`.
 */
export interface BudgetItemCreateRequest {
  productId: string;
  descricao?: string;
  larguraMm?: number;
  widthMm?: number;
  width?: number;
  alturaMm?: number;
  heightMm?: number;
  height?: number;
  quantidade?: number;
  quantity?: number;
  corAluminio?: string;
  tipoVidro?: string;
  orientacaoAbertura?: string;
  ferragens?: string;
  valorUnitario?: number;
  laborCost?: number;
  templateType?: string;
  templateConfig?: TemplateConfig | string;
  handleConfig?: HandleConfig | string;
  drillingConfig?: DrillingConfig | string;
  notes?: string;
  options?: {
    id?: string;
    materialId: string;
    quantity?: number;
    categoryType: CategoryType;
    unitPrice?: number;
    totalPrice?: number;
    materialName?: string;
    unitMeasure?: string;
  }[];
}

/**
 * Payload para aplicação de descontos e condições comerciais (US-09).
 * Suporta tanto as propriedades em português quanto em inglês para interoperabilidade.
 */
export interface DiscountRequest {
  tipoDesconto?: DiscountType;
  discountType?: DiscountType;
  valor?: number;
  value?: number;
  condicaoPagamento?: PaymentCondition;
  paymentCondition?: PaymentCondition;
  observacoesPagamento?: string;
  paymentNotes?: string;
  dataValidade?: string;
  validUntil?: string;
}

/**
 * Payload para atualização de status do orçamento (US-09.15).
 */
export interface StatusChangeRequest {
  novoStatus: BudgetStatus;
  status?: BudgetStatus;
  justificativa?: string;
}

export interface BudgetStatusUpdateDTO {
  novoStatus: BudgetStatus;
  justificativa?: string;
}

// DTO detalhado para atualização completa (BudgetRequestDTO)
export interface BudgetItemOptionRequestDTO {
  materialId: string;
  categoryType: string;
  unitMeasure?: string;
  selectedColor?: string;
  selectedType?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface BudgetItemRequestDTO {
  productId: string;
  productName?: string;
  templateType?: string;
  templateConfig?: string;
  handleConfig?: string;
  drillingConfig?: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  laborCost?: number;
  subtotal?: number;
  notes?: string;
  options?: BudgetItemOptionRequestDTO[];
}

export interface BudgetRequestDTO {
  clientId: string;
  discountPercent?: number;
  notes?: string;
  validUntil?: string;
  items: BudgetItemRequestDTO[];
}

// ============================================================
// RESPOSTAS DA API (CLIENTE, SUMÁRIO E DETALHES DE ORÇAMENTO)
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
  clientId?: string;
  customerName: string;
  clientName?: string;
  customer?: BudgetCustomer;
  status: BudgetStatus;
  statusLabel?: string;
  createdAt: string;
  validUntil: string;
  subtotal: number;
  discountPercent: number;
  discountValue: number;
  total: number;
  valorLiquido?: number;
  itemCount: number;
  totalItems?: number;
  paymentCondition?: PaymentCondition | string;
  paymentConditionLabel?: string;
  paymentNotes?: string;
  isExpired?: boolean;
  expired?: boolean;
}

/**
 * Modelo completo de Orçamento (Budget) do AlumiGest.
 */
export interface Budget {
  id: string;
  code: string;
  clientId?: string;
  customerId?: string;
  clientName?: string;
  customerName?: string;
  customer?: BudgetCustomer;
  subtotal: number;
  discountPercent: number;
  discountValue: number;
  total: number;
  valorLiquido?: number;
  paymentCondition?: PaymentCondition;
  paymentConditionLabel?: string;
  paymentNotes?: string;
  status: BudgetStatus;
  statusLabel?: string;
  notes?: string;
  validUntil: string;
  createdAt: string;
  updatedAt?: string;
  isExpired?: boolean;
  expired?: boolean;
  items: BudgetItem[];
  totalItems?: number;
  itemCount?: number;
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
// DTOs DO MOTOR DE CÁLCULO FÍSICO / PREVIEW (US-46 / US-06)
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

// ============================================================
// FUNÇÃO UTILITÁRIA DE RECÁLCULO DO VALOR LÍQUIDO (US-09)
// ============================================================

/**
 * Calcula o desconto e o valor líquido de um orçamento.
 *
 * @param subtotal Valor bruto acumulado dos itens
 * @param discountType Tipo do desconto (PERCENTUAL ou VALOR_FIXO)
 * @param discountValue Valor numérico do desconto (% ou R$)
 * @returns Objeto contendo o valor monetário do desconto e o valorLiquido recalculado.
 */
export function calculateBudgetNetTotal(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number
): { discountAmount: number; valorLiquido: number } {
  const safeSubtotal = Math.max(0, subtotal || 0);
  const safeValue = Math.max(0, discountValue || 0);

  let discountAmount = 0;
  if (discountType === 'PERCENTUAL') {
    discountAmount = (safeSubtotal * safeValue) / 100;
  } else {
    discountAmount = safeValue;
  }

  // O desconto não pode ultrapassar o subtotal
  if (discountAmount > safeSubtotal) {
    discountAmount = safeSubtotal;
  }

  const valorLiquido = Math.max(0, safeSubtotal - discountAmount);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    valorLiquido: Math.round(valorLiquido * 100) / 100,
  };
}
