// frontend/src/pages/OrderListPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../features/orders/hooks/useOrders';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { formatBRL } from '../features/budgets/utils/calculations';
import { formatDate } from '../features/orders/utils/formatDate';
import {
  ORDER_STATUS_LABELS,
  APPROVAL_CHANNEL_LABELS,
  type OrderStatus,
  type ApprovalChannel,
} from '../features/orders/types';

export function OrderListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, isError } = useOrders({
    page,
    size,
    search: debouncedSearch,
    status: (statusFilter as OrderStatus) || undefined,
    channel: (channelFilter as ApprovalChannel) || undefined,
  });

  const totalElements = data?.totalElements ?? data?.page?.totalElements ?? 0;
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);
  const totalPages = data?.totalPages ?? data?.page?.totalPages ?? 1;

  const getVisiblePages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [0];

    if (page > 2) {
      pages.push('ellipsis-start');
    }

    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages - 2, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 3) {
      pages.push('ellipsis-end');
    }

    pages.push(totalPages - 1);

    return pages;
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={9} aria-label="Carregando ordens de serviço" className="p-8 text-center text-on-surface-variant">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]" aria-hidden="true">progress_activity</span>
              <span>Carregando ordens de serviço...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={9} className="p-8 text-center text-error">Erro ao carregar a lista de ordens de serviço.</td>
        </tr>
      );
    }

    if (!data?.content || data.content.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="p-10 text-center text-on-surface-variant">Nenhuma ordem de serviço encontrada.</td>
        </tr>
      );
    }

    return data.content.map((order) => (
      <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
        <td className="px-2.5 py-2 whitespace-nowrap">
          <Link to={`/work-orders/${order.id}`} className="font-semibold text-primary hover:underline text-xs">
            #{order.codigo}
          </Link>
        </td>
        <td className="px-2.5 py-2 font-data-mono text-on-surface-variant text-xs whitespace-nowrap">
          {order.orcamentoCodigo || order.orcamentoId.split('-')[0].toUpperCase()}
        </td>
        <td className="px-2.5 py-2 max-w-[170px] truncate" title={order.clienteNome}>
          <strong className="font-medium text-on-surface text-xs">{order.clienteNome}</strong>
        </td>
        <td className="px-2.5 py-2 text-on-surface-variant font-data-mono text-xs whitespace-nowrap">
          {formatDate(order.dataAprovacao)}
        </td>
        <td className="px-2.5 py-2 text-on-surface-variant font-data-mono text-xs whitespace-nowrap">
          {formatDate(order.dataPrevisaoEntrega)}
        </td>
        <td className="px-2.5 py-2 text-on-surface-variant text-xs whitespace-nowrap">
          {order.canalAprovacaoDescricao || APPROVAL_CHANNEL_LABELS[order.canalAprovacao] || order.canalAprovacao}
        </td>
        <td className="px-2.5 py-2 whitespace-nowrap">
          <strong className="font-data-mono font-medium text-on-surface text-xs">{formatBRL(order.valorLiquido)}</strong>
        </td>
        <td className="px-2.5 py-2 whitespace-nowrap">
          <OrderStatusBadge status={order.status} />
        </td>
        <td className="px-2.5 py-2 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1">
            <Link
              to={`/work-orders/${order.id}`}
              className="flex items-center gap-1 px-2 py-0.5 border border-outline-variant rounded text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors bg-surface"
              title="Ver Detalhes"
              aria-label={`Ver detalhes da ordem de serviço ${order.codigo}`}
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">visibility</span>
              <span>Ver</span>
            </Link>
            <button
              type="button"
              disabled
              className="flex items-center justify-center p-0.5 border border-outline-variant rounded text-on-surface-variant bg-surface opacity-50 cursor-not-allowed select-none"
              title="Impressão em PDF disponível na US-16.1"
              aria-label={`Impressão em PDF disponível na US-16.1 (Ordem de Serviço ${order.codigo})`}
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">print</span>
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Cabeçalho com Breadcrumb e Título */}
      <div className="flex flex-col gap-1 mb-3 flex-none">
        <nav className="flex items-center gap-1.5 text-xs font-body text-on-surface-variant" aria-label="Breadcrumb">
          <span>Início</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-primary font-semibold">Ordens de Serviço</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
          <div>
            <h2 id="page-title" className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              Ordens de Serviço
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 font-body">
              Acompanhe e gerencie a fila de ordens de serviço confirmadas para produção e entrega.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-3 bg-surface-container-low/40 border border-outline-variant rounded-lg mb-3 flex-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Filtro de Pesquisa Textual */}
          <div className="relative w-full sm:w-[280px]">
            <span id="search-icon" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" aria-hidden="true">
              search
            </span>

            <label htmlFor="order-search-input" className="sr-only">Buscar ordens de serviço</label>
            <input
              id="order-search-input"
              type="text"
              placeholder="Buscar por código, cliente ou orçamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Filtro de Status Fabril */}
          <label htmlFor="filter-status-select" className="w-full sm:w-auto">
            <span className="sr-only">Filtrar por status da ordem de serviço</span>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
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
              className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
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
          Total: <strong className="text-on-surface font-semibold">{totalElements}</strong> ordens de serviço
        </div>
      </div>

      {/* Container da Tabela e Paginação com Scroll Interno */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-surface border border-outline-variant rounded-lg shadow-xs">
        <div className="flex-1 overflow-auto relative">
          {/* Indicador sutil de carregamento lazy */}
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-20">
              <div className="h-full bg-primary animate-pulse w-1/3" />
            </div>
          )}

          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead className="sticky top-0 z-10 border-b border-outline-variant">
              <tr className="bg-surface-container-low">
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Nº O.S.</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Orçamento</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Cliente</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Aprovação</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Entrega</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Canal</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Valor Total</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Status</th>
                <th scope="col" className="px-2.5 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right whitespace-nowrap bg-surface-container-low">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-outline-variant text-[13px] transition-opacity duration-150 ${isFetching ? 'opacity-75' : 'opacity-100'}`}>
              {renderTableContent()}
            </tbody>
          </table>
        </div>

        {/* Rodapé Fixo de Paginação com Seletor de Tamanho */}
        <div className="flex-none px-4 py-2.5 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[13px] text-on-surface-variant">
            <span>Exibindo {startItem}-{endItem} de {totalElements} ordens de serviço</span>
            <div className="flex items-center gap-1.5 border-l border-outline-variant pl-3">
              <label htmlFor="page-size-select" className="text-xs text-on-surface-variant">Por página:</label>
              <select
                id="page-size-select"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-1 bg-surface border border-outline-variant rounded text-xs text-on-surface cursor-pointer focus:outline-none focus:border-primary"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 text-xs border border-outline-variant bg-surface rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium"
              aria-label="Página anterior"
            >
              &larr; Anterior
            </button>

            {getVisiblePages().map((pageItem) => {
              if (typeof pageItem === 'string') {
                return (
                  <span
                    key={pageItem}
                    className="w-7 h-7 flex items-center justify-center text-xs text-on-surface-variant select-none"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }
              const pageNumber = pageItem;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`w-7 h-7 flex items-center justify-center text-xs rounded-md border transition-colors ${
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
              type="button"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-xs border border-outline-variant bg-surface rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium"
              aria-label="Próxima página"
            >
              Próximo &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}