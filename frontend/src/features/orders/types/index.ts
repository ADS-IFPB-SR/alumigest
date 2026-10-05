/**
 * Tipos e contratos de dados para o módulo de Pedidos de Venda (Orders).
 * Sprint 06 - US-13
 */

export type OrderStatus =
  | 'CREATED'
  | 'WAITING_PRODUCTION'
  | 'IN_PRODUCTION'
  | 'COMPLETED'
  | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Criado',
  WAITING_PRODUCTION: 'Aguardando Produção',
  IN_PRODUCTION: 'Em Produção',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  CREATED: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  WAITING_PRODUCTION: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  IN_PRODUCTION: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  CANCELLED: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
};

export type ApprovalChannel = 'WHATSAPP' | 'PRESENCIAL' | 'TELEFONE' | 'EMAIL';

export const APPROVAL_CHANNEL_LABELS: Record<ApprovalChannel, string> = {
  WHATSAPP: 'WhatsApp',
  PRESENCIAL: 'Presencial',
  TELEFONE: 'Telefone',
  EMAIL: 'E-mail',
};

export interface OrderItemOption {
  id: string;
  orderItemId: string;
  materialId?: string | null;
  materialName: string;
  unitMeasure: string;
  categoryType: string;
  selectedType?: string | null;
  selectedColor?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type JsonConfig = Record<string, unknown> | string | null;

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  descricao: string;
  larguraMm: number;
  alturaMm: number;
  quantidade: number;
  corAluminio?: string | null;
  tipoVidro?: string | null;
  orientacaoAbertura?: string | null;
  ferragens?: string | null;
  valorUnitario: number;
  valorTotal: number;
  templateConfig?: JsonConfig;
  handleConfig?: JsonConfig;
  drillingConfig?: JsonConfig;
  ordem: number;
  options?: OrderItemOption[];
}

export interface Order {
  id: string;
  codigo: string;
  orcamentoId: string;
  orcamentoCodigo?: string;
  clienteId?: string | null;
  clienteNome: string;
  clienteTelefone?: string | null;
  clienteEndereco?: string | null;
  status: OrderStatus;
  canalAprovacao: ApprovalChannel;
  dataAprovacao: string;
  dataPrevisaoEntrega: string;
  dataConclusao?: string | null;
  valorBruto: number;
  valorDesconto: number;
  taxaInstalacao: number;
  taxaFrete: number;
  valorLiquido: number;
  condicaoPagamento?: string | null;
  observacoesPagamento?: string | null;
  observacoes?: string | null;
  justificativaCancelamento?: string | null;
  createdAt: string;
  updatedAt: string;
  ativo: boolean;
  items?: OrderItem[];
}

export interface OrderSummary {
  id: string;
  codigo: string;
  orcamentoId: string;
  orcamentoCodigo?: string;
  clienteNome: string;
  clienteTelefone?: string | null;
  status: OrderStatus;
  statusDescricao?: string;
  canalAprovacao: ApprovalChannel;
  canalAprovacaoDescricao?: string;
  dataAprovacao: string;
  dataPrevisaoEntrega: string;
  valorLiquido: number;
  quantidadeItens: number;
  createdAt: string;
}

export interface OrderConvertRequest {
  canalAprovacao: ApprovalChannel;
  dataPrevisaoEntrega: string;
  observacoes?: string;
}

export interface OrderCancelRequest {
  justificativa: string;
}

export interface OrderFilterParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
  search?: string;
  channel?: ApprovalChannel;
  /** @deprecated Utilize search para alinhamento com padrões REST em inglês */
  busca?: string;
  /** @deprecated Utilize channel para alinhamento com padrões REST em inglês */
  canal?: ApprovalChannel;
}
