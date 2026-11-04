import React from 'react';
import {
  ClipboardList,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Kanban,
  Maximize2,
} from 'lucide-react';
import type { ClientOrderSummaryDTO } from '../services/customersApi';
import type { Order } from '../../orders/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '../../orders/types';
import { formatDate, formatCurrency } from '../utils/customerHubUtils';

export interface CustomerOrdersTabProps {
  orders: ClientOrderSummaryDTO[];
  selectedOrderId?: string | null;
  onSelectOrder?: (orderId: string) => void;
  selectedOrderDetails?: Order | null;
  isLoadingDetails?: boolean;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onOpenLabels: (orderId: string) => void;
  onViewPdf?: (orderId: string) => void;
  onViewKanban?: (orderId: string) => void;
  isLoadingLabelsOrderId?: string | null;
}

function getStatusBadge(status: OrderStatus, label?: string) {
  const displayLabel = label || ORDER_STATUS_LABELS[status] || status;
  const colors = ORDER_STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} dark:bg-slate-800 dark:border-slate-700`}
    >
      {displayLabel}
    </span>
  );
}

export const CustomerOrdersTab: React.FC<CustomerOrdersTabProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  selectedOrderDetails,
  isLoadingDetails = false,
  isLoading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  onOpenLabels,
  onViewPdf,
  onViewKanban,
  isLoadingLabelsOrderId,
}) => {
  if (isLoading && orders.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Carregando ordens de serviço vinculadas...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <ClipboardList className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nenhuma Ordem de Serviço vinculada a este cliente
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Aprove uma proposta comercial para iniciar a fabricação e emitir etiquetas térmicas.
        </p>
      </div>
    );
  }

  // Identifica a O.S. ativa para exibição de suas esquadrias
  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) ||
    orders[0];

  const activeOrderId = activeOrder?.id;

  return (
    <div className="space-y-5">
      {/* 1. Tabela Principal de Ordens de Serviço */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th scope="col" className="py-3 px-4">Código O.S.</th>
                <th scope="col" className="py-3 px-4">Data</th>
                <th scope="col" className="py-3 px-4">Situação Fabril</th>
                <th scope="col" className="py-3 px-4">Valor Total</th>
                <th scope="col" className="py-3 px-4">Esquadrias</th>
                <th scope="col" className="py-3 px-4 text-right">Ações Diretas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {orders.map((order) => {
                const isSelected = order.id === activeOrderId;
                const isLoadingThisOrder = isLoadingLabelsOrderId === order.id;

                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder?.(order.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Código O.S. */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs">
                        #{order.codigo}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 font-medium">
                      {formatDate(order.dataAprovacao)}
                    </td>

                    {/* Situação Fabril */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status, order.statusDescricao)}
                    </td>

                    {/* Valor Total */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {formatCurrency(order.valorLiquido)}
                    </td>

                    {/* Resumo de Esquadrias */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        📐 {order.quantidadeItens} {order.quantidadeItens === 1 ? 'esq' : 'esq'}
                      </span>
                    </td>

                    {/* Ações Diretas */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Botão de Destaque: Etiquetas Térmicas (100x60mm) */}
                        <button
                          type="button"
                          data-testid="btn-open-labels-modal"
                          aria-label={`Emitir etiquetas térmicas da ordem ${order.codigo}`}
                          disabled={isLoadingThisOrder}
                          onClick={() => onOpenLabels(order.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition disabled:opacity-50 shadow-xs"
                          title="Imprimir Etiquetas Térmicas (100x60mm) na Elgin L42"
                        >
                          {isLoadingThisOrder ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700 dark:text-amber-300" />
                          ) : (
                            <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          )}
                          <span>🏷️ Etiquetas</span>
                        </button>

                        {/* Botão Comprovante PDF */}
                        {onViewPdf && (
                          <button
                            type="button"
                            onClick={() => onViewPdf(order.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                            title="Baixar Comprovante PDF da O.S."
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>PDF</span>
                          </button>
                        )}

                        {/* Botão Ver no Kanban */}
                        {onViewKanban && (
                          <button
                            type="button"
                            onClick={() => onViewKanban(order.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                            title="Ver no Kanban Fabril"
                          >
                            <Kanban className="w-3.5 h-3.5 text-blue-500" />
                            <span>Kanban</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação da Tabela */}
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

      {/* 2. Detalhamento Fiel & Limpo das Esquadrias da O.S. Ativa (conforme protótipo) */}
      {activeOrder && (
        <section
          data-testid="order-items-drawer"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm space-y-4"
        >
          {/* Cabeçalho do Bloco de Esquadrias */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-slate-100">
                <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>📐 Esquadrias da O.S.</span>
              </div>
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                #{activeOrder.codigo}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Medidas nominais em milímetros (L x A mm)
              </span>
            </div>

            {/* Ação Rápida de Emissão no Topo do Bloco de Peças */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="btn-open-labels-modal-top"
                onClick={() => onOpenLabels(activeOrder.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition shadow-xs"
              >
                <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>🏷️ Imprimir Etiquetas Desta O.S. (100x60mm)</span>
              </button>
            </div>
          </div>

          {/* Grid de Esquadrias Físicas */}
          {isLoadingDetails ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Carregando detalhamento de esquadrias da O.S...</span>
            </div>
          ) : selectedOrderDetails?.items && selectedOrderDetails.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {selectedOrderDetails.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col gap-2 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                      Item {String(idx + 1).padStart(2, '0')}: {item.descricao}
                    </span>
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                      {item.quantidade} un
                    </span>
                  </div>

                  {/* Medidas Nominais em Destaque */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-slate-900 dark:text-slate-100 w-fit shadow-xs">
                    <span className="text-blue-600 dark:text-blue-400">📐</span>
                    <span>{item.larguraMm} x {item.alturaMm} mm</span>
                  </div>

                  {/* Sub-especificações Técnicas */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>🎨 {item.corAluminio || 'Padrão'}</span>
                    <span>•</span>
                    <span>🪟 {item.tipoVidro || 'Vidro Padrão'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
              📐 Esta O.S. possui {activeOrder.quantidadeItens} {activeOrder.quantidadeItens === 1 ? 'esquadria registrada' : 'esquadrias registradas'}. Clique no botão acima para inspecionar e emitir etiquetas em lote.
            </div>
          )}
        </section>
      )}
    </div>
  );
};
