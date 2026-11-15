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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {displayLabel}
        </span>
      );
    case 'SENT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          {displayLabel}
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          {displayLabel}
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
          {displayLabel}
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {displayLabel}
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Carregando orçamentos vinculados...
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <FileText className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nenhum orçamento vinculado a este cliente
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Clique no botão "Novo Orçamento" no topo para criar a primeira proposta comercial.
        </p>
      </div>
    );
  }

  const hasPhone = Boolean(clientPhone && clientPhone.replace(/\D/g, '').length >= 8);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            <tr>
              <th scope="col" className="py-3 px-4">Nº Orçamento</th>
              <th scope="col" className="py-3 px-4">Data</th>
              <th scope="col" className="py-3 px-4">Situação</th>
              <th scope="col" className="py-3 px-4">Valor da Proposta</th>
              <th scope="col" className="py-3 px-4 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {budgets.map((b) => {
              const whatsAppHref = buildBudgetWhatsAppLink(clientPhone, clientName, b.codigo, b.valorTotal);

              return (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                      {b.codigo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {formatDate(b.dataCriacao)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(b.status, b.statusDescricao)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {formatCurrency(b.valorTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Visualizar proposta em PDF do orçamento ${b.codigo}`}
                        onClick={() => onViewPdf?.(b.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-rose-500" />
                        <span>Proposta PDF</span>
                      </button>

                      <a
                        href={whatsAppHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Enviar proposta do orçamento ${b.codigo} via WhatsApp`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold border transition ${
                          hasPhone
                            ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            : 'border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed pointer-events-none'
                        }`}
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500" />
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
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Página {page + 1} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={page === 0}
              onClick={() => onPageChange?.(page - 1)}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima página"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange?.(page + 1)}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
