// frontend/src/pages/OrderListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../features/orders/hooks/useOrders';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { formatBRL } from '../features/budgets/utils/calculations';
import { ORDER_STATUS_LABELS, APPROVAL_CHANNEL_LABELS } from '../features/orders/types';

export function OrderListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError } = useOrders({
    page,
    size,
    busca: debouncedSearch,
    status: statusFilter ? (statusFilter as any) : undefined,
  });

  const totalElements = data?.page.totalElements || 0;
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);
  const totalPages = data?.page.totalPages || 1;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-surface">

      <div className="px-6 py-8 sm:px-8">
        <h2 id="page-title" className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">Pedidos de Venda</h2>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Acompanhe e gerencie a fila de pedidos confirmados para produção e entrega.
        </p>
      </div>

      <div className="px-6 sm:px-8 pb-8 flex-1 flex flex-col">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col overflow-hidden h-full max-h-full">

          <div className="p-4 bg-surface-container-low/30 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">

              {/* Filtro de Pesquisa Textual */}
              <div className="relative w-full sm:w-[280px]">
                <span id="search-icon" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" aria-hidden="true">
                  search
                </span>

                <input
                  type="text"
                  aria-labelledby="search-icon"
                  aria-label="Buscar pedidos"
                  placeholder="Buscar por código, cliente ou orçamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Filtro de Status Fabril */}
              <label htmlFor="filter-status-select" className="w-full sm:w-auto">
                <span className="sr-only">Filtrar por status do pedido</span>
                <select
                  id="filter-status-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Todos os Status</option>
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Filtro de Canal de Aprovação */}
              <label htmlFor="filter-channel-select" className="w-full sm:w-auto">
                <span className="sr-only">Filtrar por canal de aprovação</span>
                <select
                  id="filter-channel-select"
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Todos os Canais</option>
                  {Object.entries(APPROVAL_CHANNEL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="text-[13px] text-on-surface-variant font-body whitespace-nowrap">
              Total: <strong className="text-on-surface font-semibold">{totalElements}</strong> pedidos
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Nº do Pedido</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Orçamento Origem</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Cliente</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Data Fechamento</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Previsão Entrega</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Canal</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Valor Total</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[13px]">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-on-surface-variant">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        <span>Carregando pedidos...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-error">Erro ao carregar a lista de pedidos.</td>
                  </tr>
                ) : data?.content.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-on-surface-variant">Nenhum pedido encontrado.</td>
                  </tr>
                ) : (
                  data?.content.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/pedidos/${order.id}`} className="font-semibold text-primary hover:underline">
                          {order.codigo}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-data-mono text-on-surface-variant text-xs">
                        {order.orcamentoCodigo || order.orcamentoId.split('-')[0].toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <strong className="font-medium text-on-surface">{order.clienteNome}</strong>
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant font-data-mono text-xs">
                        {new Date(order.dataAprovacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant font-data-mono text-xs">
                        {new Date(order.dataPrevisaoEntrega).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant">
                        {order.canalAprovacaoDescricao}
                      </td>
                      <td className="px-5 py-3.5">
                        <strong className="font-data-mono font-medium text-on-surface">{formatBRL(order.valorLiquido)}</strong>
                      </td>
                      <td className="px-5 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/pedidos/${order.id}`}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-outline-variant rounded-md text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors bg-surface"
                            title="Ver Detalhes"
                            aria-label={`Ver detalhes do pedido ${order.codigo}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            Ver
                          </Link>
                          <button
                            className="flex items-center justify-center p-1.5 border border-outline-variant rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors bg-surface"
                            title="Imprimir Comprovante"
                            aria-label={`Imprimir comprovante do pedido ${order.codigo}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
            <div className="text-[13px] text-on-surface-variant">
              Exibindo {startItem}-{endItem} de {totalElements} pedidos
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-[13px] border border-outline-variant bg-surface rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium"
                aria-label="Página anterior"
              >
                &larr; Anterior
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                const pageNumber = idx;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-8 h-8 flex items-center justify-center text-[13px] rounded-md border transition-colors ${
                      page === pageNumber
                        ? 'bg-on-surface text-surface border-on-surface font-bold'
                        : 'border-transparent text-on-surface hover:bg-surface-container'
                    }`}
                    aria-label={`Ir para página ${pageNumber + 1}`}
                    aria-current={page === pageNumber ? 'page' : undefined}
                  >
                    {pageNumber + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-[13px] border border-outline-variant bg-surface rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium"
                aria-label="Próxima página"
              >
                Próximo &rarr;
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}