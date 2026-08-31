import { useNavigate } from 'react-router-dom';
import type { BudgetSummary } from '../types';
import { StatusBadge } from './StatusBadge';

interface BudgetsTableProps {
  data: BudgetSummary[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

interface SortableHeaderProps {
  label: string;
  field: string;
  activeField?: string;
  direction?: 'asc' | 'desc';
  onSort: (field: string) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

function SortableHeader({
  label,
  field,
  activeField,
  direction,
  onSort,
  align = 'left',
  className = '',
}: SortableHeaderProps) {
  const isActive = activeField === field;

  return (
    <th
      scope="col"
      aria-label={label}
      className={`p-0 font-label-bold text-label-bold text-primary text-xs sm:text-sm ${className}`}
    >
      <button
        type="button"
        aria-label={`Ordenar por ${label}`}
        onClick={() => onSort(field)}
        className={`w-full p-xs sm:p-sm lg:p-md flex items-center gap-xs cursor-pointer select-none hover:bg-surface-container transition-colors ${
          align === 'right'
            ? 'justify-end text-right'
            : align === 'center'
              ? 'justify-center text-center'
              : 'justify-start text-left'
        }`}
      >
        <span>{label}</span>
        <span
          className={`material-symbols-outlined text-[14px] transition-all ${
            isActive
              ? 'text-primary opacity-100'
              : 'text-secondary/40 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isActive && direction === 'desc' ? 'arrow_downward' : 'arrow_upward'}
        </span>
      </button>
    </th>
  );
}

function formatDate(isoDate: string): string {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: number): string {
  return (value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function BudgetsTable({ data, sortField, sortDirection, onSort }: BudgetsTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (budget: BudgetSummary) => {
    navigate(`/orcamentos/${budget.id}`);
  };

  return (
    <div className="overflow-x-auto flex-1 w-full relative">
      <table className="table-zebra w-full text-left border-collapse min-w-[800px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-container-low border-b border-outline-variant group">
            <SortableHeader
              label="Código"
              field="code"
              activeField={sortField}
              direction={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Cliente"
              field="customerName"
              activeField={sortField}
              direction={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Data de Emissão"
              field="createdAt"
              activeField={sortField}
              direction={sortDirection}
              onSort={onSort}
            />
            <th className="p-xs sm:p-sm lg:p-md font-label-bold text-label-bold text-primary text-xs sm:text-sm">
              Validade
            </th>
            <th className="p-xs sm:p-sm lg:p-md font-label-bold text-label-bold text-primary text-xs sm:text-sm text-center">
              Qtd de Itens
            </th>
            <SortableHeader
              label="Valor Total (R$)"
              field="total"
              activeField={sortField}
              direction={sortDirection}
              onSort={onSort}
              align="right"
            />
            <th className="p-xs sm:p-sm lg:p-md font-label-bold text-label-bold text-primary text-xs sm:text-sm text-center">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="font-body text-xs sm:text-sm">
          {data.map((budget) => (
            <tr
              key={budget.id}
              onClick={() => handleRowClick(budget)}
              className="border-b border-outline-variant/40 hover:bg-surface-container-high transition-colors cursor-pointer group/row"
            >
              <td className="p-xs sm:p-sm lg:p-md">
                <span className="font-data-mono text-data-mono text-primary font-semibold text-xs">
                  {budget.code}
                </span>
              </td>

              <td className="p-xs sm:p-sm lg:p-md">
                <span className="text-on-surface font-medium">
                  {budget.customerName || budget.customer?.name || '-'}
                </span>
              </td>

              <td className="p-xs sm:p-sm lg:p-md">
                <span className="font-data-mono text-data-mono text-secondary text-xs">
                  {formatDate(budget.createdAt)}
                </span>
              </td>

              <td className="p-xs sm:p-sm lg:p-md">
                <span className="font-data-mono text-data-mono text-secondary text-xs">
                  {formatDate(budget.validUntil)}
                </span>
              </td>

              <td className="p-xs sm:p-sm lg:p-md text-center">
                <span className="font-data-mono text-data-mono text-secondary">
                  {budget.itemCount}
                </span>
              </td>

              <td className="p-xs sm:p-sm lg:p-md text-right">
                <span className="font-data-mono text-data-mono text-primary font-bold">
                  {formatCurrency(budget.total)}
                </span>
              </td>

              <td className="p-xs sm:p-sm lg:p-md text-center">
                <StatusBadge status={budget.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
