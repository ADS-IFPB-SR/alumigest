export type BudgetStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'RASCUNHO'
  | 'ENVIADO'
  | 'APROVADO'
  | 'REJEITADO'
  | 'CANCELADO';

export interface BudgetSummary {
  id: number | string;
  numero: string;
  clienteId?: number | string;
  clienteNome: string;
  status: BudgetStatus;
  dataCriacao: string;
  dataValidade: string;
  subtotal: number;
  descontoPercentual: number;
  valorDesconto: number;
  valorTotal: number;
  quantidadeItens: number;
}

export interface BudgetPageResponse {
  content: BudgetSummary[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  size?: number;
  number?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
}

export interface BudgetFilters {
  page: number;
  size: number;
  status?: BudgetStatus | '';
  search?: string;
  sort?: string;
}

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
  { label: string; icon: string; key: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED' }
> = {
  DRAFT: { label: 'Rascunho', icon: 'edit_note', key: 'DRAFT' },
  RASCUNHO: { label: 'Rascunho', icon: 'edit_note', key: 'DRAFT' },
  SENT: { label: 'Enviado', icon: 'send', key: 'SENT' },
  ENVIADO: { label: 'Enviado', icon: 'send', key: 'SENT' },
  APPROVED: { label: 'Aprovado', icon: 'check_circle', key: 'APPROVED' },
  APROVADO: { label: 'Aprovado', icon: 'check_circle', key: 'APPROVED' },
  REJECTED: { label: 'Rejeitado', icon: 'cancel', key: 'REJECTED' },
  REJEITADO: { label: 'Rejeitado', icon: 'cancel', key: 'REJECTED' },
  CANCELLED: { label: 'Cancelado', icon: 'block', key: 'CANCELLED' },
  CANCELADO: { label: 'Cancelado', icon: 'block', key: 'CANCELLED' },
};
