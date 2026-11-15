import React from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import type { ClientBudgetSummaryDTO, BudgetStatus } from '../services/customersApi';
import { formatDate, formatCurrency, buildBudgetWhatsAppLink } from '../utils/customerHubUtils';

interface CustomerBudgetsTabProps {
  budgets: ClientBudgetSummaryDTO[];
  clientPhone?: string;
  clientName?: string;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onViewPdf?: (budgetId: string) => void;
}

function getStatusBadge(status: BudgetStatus, label?: string) {
  const displayLabel = label || status;
  switch (status) {
    case 'APPROVED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container border border-secondary/30">
          {displayLabel}
        </span>
      );
    case 'SENT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-container text-on-primary-container border border-primary/30">
          {displayLabel}
        </span>
      );
    case 'REJECTED':
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container border border-error/30">
          {displayLabel}
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-container text-on-tertiary-container border border-tertiary/30">
          {displayLabel}
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-highest text-on-surface border border-outline-variant">
          {displayLabel}
        </span>
      );
  }
}

export const CustomerBudgetsTab: React.FC<CustomerBudgetsTabProps> = ({
  budgets,
  clientPhone,
  clientName,
  isLoading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  onViewPdf,
}) => {
  if (isLoading && budgets.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-on-surface-variant">
        Carregando orçamentos vinculados...
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
        <FileText className="w-10 h-10 mx-auto text-outline opacity-50 mb-3" />
        <p className="text-sm font-semibold text-on-surface">
          Nenhum orçamento vinculado a este cliente
        </p>
        <p className="text-xs text-on-surface-variant mt-1">
          Clique no botão "Novo Orçamento" no topo para criar a primeira proposta comercial.
        </p>
      </div>
    );
  }

  const hasPhone = Boolean(clientPhone && clientPhone.replace(/\D/g, '').length >= 8);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container border-b border-outline-variant uppercase tracking-wider text-[11px] text-on-surface-variant font-bold">
            <tr>
              <th scope="col" className="py-3 px-4">Nº Orçamento</th>
              <th scope="col" className="py-3 px-4">Data</th>
              <th scope="col" className="py-3 px-4">Situação</th>
              <th scope="col" className="py-3 px-4">Valor da Proposta</th>
              <th scope="col" className="py-3 px-4 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-on-surface">
            {budgets.map((b) => {
              const whatsAppHref = buildBudgetWhatsAppLink(clientPhone, clientName, b.codigo, b.valorTotal);

              return (
                <tr
                  key={b.id}
                  className="hover:bg-surface-container-high transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    <span className="inline-block px-2 py-0.5 rounded bg-surface-container-highest text-on-surface text-xs">
                      {b.codigo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                    {formatDate(b.dataCriacao)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(b.status, b.statusDescricao)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-on-surface text-sm">
                    {formatCurrency(b.valorTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Visualizar proposta em PDF do orçamento ${b.codigo}`}
                        onClick={() => onViewPdf?.(b.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border border-outline-variant hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-error" />
                        <span>Proposta PDF</span>
                      </button>

                      <a
                        href={whatsAppHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Enviar proposta do orçamento ${b.codigo} via WhatsApp`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border transition ${
                          hasPhone
                            ? 'border-outline-variant hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                            : 'border-outline-variant opacity-50 cursor-not-allowed pointer-events-none text-on-surface-variant'
                        }`}
                      >
                        <WhatsAppIcon className={`w-3.5 h-3.5 ${hasPhone ? 'text-[#25D366]' : 'opacity-50'}`} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-outline-variant bg-surface flex items-center justify-between text-xs text-on-surface-variant">
          <span>Página {page + 1} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={page === 0}
              onClick={() => onPageChange?.(page - 1)}
              className="p-1 rounded border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima página"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange?.(page + 1)}
              className="p-1 rounded border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};