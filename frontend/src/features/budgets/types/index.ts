export type BudgetStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface BudgetCustomer {
  id?: string | number;
  name: string;
  phone?: string;
  email?: string;
  document?: string;
}

export interface BudgetSummary {
  id: string | number;
  code: string;
  customerId?: string | number;
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
  { label: string; icon: string; key: BudgetStatus }
> = {
  DRAFT: { label: 'Rascunho', icon: 'edit_note', key: 'DRAFT' },
  SENT: { label: 'Enviado', icon: 'send', key: 'SENT' },
  APPROVED: { label: 'Aprovado', icon: 'check_circle', key: 'APPROVED' },
  REJECTED: { label: 'Rejeitado', icon: 'cancel', key: 'REJECTED' },
  CANCELLED: { label: 'Cancelado', icon: 'block', key: 'CANCELLED' },
};

