// frontend/src/pages/PartSaleListPage.tsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  FileText,
  Printer,
  Ban,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Download,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  usePartSalesList,
  useUpdatePartSaleStatus,
  partSaleApi,
  type PartSaleResponse,
  type PartSaleStatus,
} from '@/features/part-sales';
import { formatBRL } from '@/features/budgets/utils/calculations';
import { formatDate } from '@/features/orders/utils/formatDate';
import { getVisiblePages } from './OrderListPage';

const STATUS_LABELS: Record<PartSaleStatus, string> = {
  APPROVED: 'Concluída',
  DRAFT: 'Rascunho / Orçamento',
  CANCELLED: 'Cancelada',
};

const CATEGORY_NAMES: Record<string, string> = {
  PROFILE: 'Alumínio',
  GLASS: 'Vidro',
  FILM: 'Película',
  HARDWARE: 'Ferragem',
};

const CATEGORY_CHIP_COLORS: Record<string, string> = {
  PROFILE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  GLASS: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  FILM: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  HARDWARE: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
};

function formatItemDimensions(it: {
  materialType: string;
  widthMm?: number | null;
  heightMm?: number | null;
}): string {
  if (it.materialType === 'PROFILE') {
    return `${it.heightMm ?? 0} mm (Comp.)`;
  }
  if (it.materialType === 'HARDWARE') {
    return 'Unidade';
  }
  if (it.widthMm && it.heightMm) {
    return `${it.heightMm} × ${it.widthMm} mm`;
  }
  return '—';
}

export function PartSaleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const recentId = searchParams.get('recentId');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Estados dos modais de ação rápida
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState<PartSaleResponse | null>(null);
  const [selectedSaleForPdf, setSelectedSaleForPdf] = useState<PartSaleResponse | null>(null);
  const [selectedSaleForLabels, setSelectedSaleForLabels] = useState<PartSaleResponse | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<PartSaleResponse | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async (sale: PartSaleResponse) => {
    try {
      setIsDownloadingPdf(true);
      await partSaleApi.downloadPdf(sale.id, sale.code);
      toast.success('Download do PDF A4 iniciado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF da venda avulsa:', error);
      toast.error('Erro ao gerar/baixar PDF da venda avulsa.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const updateStatusMutation = useUpdatePartSaleStatus();

  // Debounce de 500ms na pesquisa textual
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, isError } = usePartSalesList({
    page,
    size,
    search: debouncedSearch || undefined,
    status: (statusFilter as PartSaleStatus) || undefined,
    sort: 'createdAt,desc',
  });

  const totalElements = data?.totalElements ?? 0;
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);
  const totalPages = data?.totalPages ?? 1;

  const handleConfirmCancel = async () => {
    if (!saleToCancel) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: saleToCancel.id,
        status: 'CANCELLED',
      });
      setSaleToCancel(null);
    } catch {
      // Erro tratado no hook
    }
  };

  const renderStatusBadge = (status: PartSaleStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{STATUS_LABELS.APPROVED}</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{STATUS_LABELS.DRAFT}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
            <Ban className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>{STATUS_LABELS.CANCELLED}</span>
          </span>
        );
      default:
        return <span className="text-xs text-on-surface-variant font-mono">{status}</span>;
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} aria-label="Carregando vendas avulsas" className="p-10 text-center text-on-surface-variant">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]" aria-hidden="true">
                progress_activity
              </span>
              <span>Carregando vendas avulsas...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={7} className="p-10 text-center text-error font-medium">
            Erro ao carregar a lista de vendas avulsas. Verifique a conexão com o servidor.
          </td>
        </tr>
      );
    }

    if (!data?.content || data.content.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="p-12 text-center text-on-surface-variant">
            <div className="flex flex-col items-center justify-center gap-2">
              <ShoppingCart className="w-10 h-10 text-outline" />
              <p className="font-semibold text-sm">Nenhuma venda avulsa encontrada</p>
              <p className="text-xs max-w-sm text-on-surface-variant/80">
                Tente ajustar os filtros ou clique no botão acima para registrar uma nova venda de partes.
              </p>
              <Link
                to="/vendas/avulsa/nova"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-on-primary rounded-md shadow-xs hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Venda Avulsa</span>
              </Link>
            </div>
          </td>
        </tr>
      );
    }

    return data.content.map((sale) => {
      const isRecent = recentId === sale.id;

      // Agrupar itens por categoria para resumo visual
      const categoryCounts = (sale.items || []).reduce((acc, it) => {
        const cat = it.materialType;
        acc[cat] = (acc[cat] || 0) + it.quantity;
        return acc;
      }, {} as Record<string, number>);

      return (
        <tr
          key={sale.id}
          data-testid={`row-part-sale-${sale.code}`}
          className={`transition-colors border-b border-outline-variant/60 ${
            isRecent
              ? 'bg-primary/10 border-l-4 border-l-primary font-medium'
              : 'hover:bg-surface-container-low/40'
          }`}
        >
          {/* Código da Venda */}
          <td className="px-3 py-2.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setSelectedSaleForDetails(sale)}
              className="font-data-mono font-bold text-primary hover:underline text-xs cursor-pointer flex items-center gap-1"
              title="Ver detalhes da venda"
            >
              <span>{sale.code}</span>
              {isRecent && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-primary text-on-primary rounded uppercase">
                  Novo
                </span>
              )}
            </button>
          </td>

          {/* Data de Registro */}
          <td className="px-3 py-2.5 text-on-surface-variant font-data-mono text-xs whitespace-nowrap">
            {formatDate(sale.createdAt)}
          </td>

          {/* Nome do Cliente */}
          <td className="px-3 py-2.5 max-w-[200px] truncate" title={sale.clientName || 'Cliente Balcão'}>
            <span className="font-semibold text-on-surface text-xs block truncate">
              {sale.clientName || 'Cliente Balcão'}
            </span>
          </td>

          {/* Resumo de Insumos / Categorias */}
          <td className="px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1 max-w-[280px]">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <span
                  key={cat}
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap ${
                    CATEGORY_CHIP_COLORS[cat] || 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {count}x {CATEGORY_NAMES[cat] || cat}
                </span>
              ))}
              {(!sale.items || sale.items.length === 0) && (
                <span className="text-[11px] text-on-surface-variant italic">Sem itens</span>
              )}
            </div>
          </td>

          {/* Valor Total */}
          <td className="px-3 py-2.5 whitespace-nowrap">
            <strong className="font-data-mono font-bold text-on-surface text-xs text-emerald-700 dark:text-emerald-400">
              {formatBRL(sale.totalAmount ?? 0)}
            </strong>
          </td>

          {/* Status */}
          <td className="px-3 py-2.5 whitespace-nowrap">
            {renderStatusBadge(sale.status)}
          </td>

          {/* Ações Rápidas */}
          <td className="px-3 py-2.5 text-right whitespace-nowrap">
            <div className="flex items-center justify-end gap-1">
              {/* Botão Ver Detalhes */}
              <button
                type="button"
                onClick={() => setSelectedSaleForDetails(sale)}
                className="flex items-center gap-1 px-2 py-1 border border-outline-variant rounded text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors bg-surface cursor-pointer"
                title="Visualizar itens e cálculo detalhado"
                aria-label={`Ver detalhes da venda ${sale.code}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver</span>
              </button>

              {/* Botão PDF */}
              <button
                type="button"
                onClick={() => setSelectedSaleForPdf(sale)}
                className="flex items-center justify-center p-1 border border-outline-variant rounded text-rose-600 dark:text-rose-400 bg-surface hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Imprimir espelho PDF"
                aria-label={`Imprimir PDF da venda ${sale.code}`}
              >
                <FileText className="w-3.5 h-3.5" />
              </button>

              {/* Botão Etiquetas Elgin */}
              <button
                type="button"
                onClick={() => setSelectedSaleForLabels(sale)}
                className="flex items-center justify-center p-1 border border-outline-variant rounded text-amber-600 dark:text-amber-400 bg-surface hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                title="Emitir etiquetas térmicas Elgin (100x60mm)"
                aria-label={`Emitir etiquetas Elgin da venda ${sale.code}`}
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Botão Cancelar (com placeholder invisível em vendas canceladas para manter alinhamento estrito do botão Ver) */}
              {sale.status !== 'CANCELLED' ? (
                <button
                  type="button"
                  onClick={() => setSaleToCancel(sale)}
                  className="flex items-center justify-center p-1 border border-outline-variant rounded text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors bg-surface cursor-pointer"
                  title="Cancelar venda"
                  aria-label={`Cancelar venda ${sale.code}`}
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  tabIndex={-1}
                  aria-hidden="true"
                  className="flex items-center justify-center p-1 border border-transparent rounded invisible pointer-events-none select-none"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Cabeçalho com Breadcrumb e Título */}
      <div className="flex flex-col gap-1 mb-3 flex-none">
        <nav className="flex items-center gap-1.5 text-xs font-body text-on-surface-variant" aria-label="Breadcrumb">
          <span>Início</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-primary font-semibold">Vendas Avulsas de Partes</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
          <div>
            <h2 id="page-title" className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <span>Vendas Avulsas de Partes</span>
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 font-body">
              Histórico, emissão e controle comercial de cortes avulsos de vidros, perfis de alumínio, ferragens e películas.
            </p>
          </div>

          <Link
            to="/vendas/avulsa/nova"
            data-testid="btn-new-part-sale"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg shadow-xs hover:bg-primary/90 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Venda Avulsa</span>
          </Link>
        </div>
      </div>

      {/* Banner de Destaque para Venda Recente */}
      {recentId && (
        <div className="p-3 mb-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between flex-none animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Venda registrada com sucesso!</strong> A venda está destacada na lista abaixo pronta para visualização, emissão de PDF ou impressão de etiquetas.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              searchParams.delete('recentId');
              setSearchParams(searchParams);
            }}
            className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Fechar aviso</span>
          </button>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="p-3 bg-surface-container-low/40 border border-outline-variant rounded-lg mb-3 flex-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Filtro de Pesquisa Textual com Debounce */}
          <div className="relative w-full sm:w-[320px]">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <label htmlFor="partsale-search-input" className="sr-only">
              Buscar vendas avulsas
            </label>
            <input
              id="partsale-search-input"
              data-testid="input-search-part-sales"
              type="text"
              placeholder="Buscar por código (VP-...) ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Filtro por Status Comercial */}
          <label htmlFor="filter-status-select" className="w-full sm:w-auto">
            <span className="sr-only">Filtrar por status</span>
            <select
              id="filter-status-select"
              data-testid="select-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-md text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="">Todos os Status</option>
              <option value="APPROVED">Aprovadas / Faturadas</option>
              <option value="DRAFT">Rascunhos / Orçamentos</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </label>
        </div>

        <div className="text-[13px] text-on-surface-variant font-body whitespace-nowrap">
          Total: <strong className="text-on-surface font-semibold">{totalElements}</strong> vendas avulsas
        </div>
      </div>

      {/* Tabela de Vendas Avulsas com Scroll Interno */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-surface border border-outline-variant rounded-lg shadow-xs">
        <div className="flex-1 overflow-auto relative">
          {/* Indicador de carregamento lazy */}
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-20">
              <div className="h-full bg-primary animate-pulse w-1/3" />
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 border-b border-outline-variant">
              <tr className="bg-surface-container-low">
                <th scope="col" className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Nº Venda</th>
                <th scope="col" className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Data</th>
                <th scope="col" className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Cliente</th>
                <th scope="col" className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Insumos & Categorias</th>
                <th scope="col" className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Valor Total</th>
                <th scope="col" className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap bg-surface-container-low">Status</th>
                <th scope="col" className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right whitespace-nowrap bg-surface-container-low">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-outline-variant text-[13px] transition-opacity duration-150 ${isFetching ? 'opacity-75' : 'opacity-100'}`}>
              {renderTableContent()}
            </tbody>
          </table>
        </div>

        {/* Rodapé Fixo de Paginação Canônica (Idêntica à de Ordens de Serviço) */}
        <div className="flex-none px-4 py-2.5 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[13px] text-on-surface-variant">
            <span>Exibindo {startItem}-{endItem} de {totalElements} vendas avulsas</span>
            <div className="flex items-center gap-1.5 border-l border-outline-variant pl-3">
              <label htmlFor="partsale-page-size-select" className="text-xs text-on-surface-variant">Por página:</label>
              <select
                id="partsale-page-size-select"
                data-testid="select-page-size"
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
              data-testid="btn-prev-page"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 text-xs border border-outline-variant bg-surface rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium cursor-pointer"
              aria-label="Página anterior"
            >
              &larr; Anterior
            </button>

            {getVisiblePages(page, totalPages).map((pageItem) => {
              if (typeof pageItem === 'string') {
                return (
                  <span
                    key={pageItem}
                    data-testid={`pagination-${pageItem}`}
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
                  data-testid={`pagination-btn-${pageNumber}`}
                  onClick={() => setPage(pageNumber)}
                  className={`w-7 h-7 flex items-center justify-center text-xs rounded-md border transition-colors cursor-pointer ${
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
              data-testid="btn-next-page"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-xs border border-outline-variant bg-surface rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors text-on-surface font-medium cursor-pointer"
              aria-label="Próxima página"
            >
              Próximo &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: DETALHES COMPLETOS DA VENDA AVULSA */}
      {selectedSaleForDetails && (
        <div data-testid="modal-details-part-sale" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Detalhes da Venda {selectedSaleForDetails.code}
                </h3>
              </div>
              <button
                type="button"
                data-testid="btn-close-details-modal"
                onClick={() => setSelectedSaleForDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Cliente:</span>
                  <strong className="text-sm font-semibold">{selectedSaleForDetails.clientName || 'Cliente Balcão'}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Status:</span>
                  <div className="mt-0.5">{renderStatusBadge(selectedSaleForDetails.status)}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Data de Emissão:</span>
                  <strong className="text-sm font-mono">{formatDate(selectedSaleForDetails.createdAt)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Final:</span>
                  <strong className="text-sm font-mono text-emerald-600 font-bold">{formatBRL(selectedSaleForDetails.totalAmount)}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Itens da Venda ({selectedSaleForDetails.items?.length ?? 0})
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5">Item / Insumo</th>
                        <th className="p-2.5">Categoria</th>
                        <th className="p-2.5">Dimensões</th>
                        <th className="p-2.5 text-center">Qtd</th>
                        <th className="p-2.5 text-right">Unitário</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {(selectedSaleForDetails.items || []).map((it) => (
                        <tr key={it.id}>
                          <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-slate-100">{it.description}</td>
                          <td className="p-2.5 font-sans">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CATEGORY_CHIP_COLORS[it.materialType] || 'bg-slate-100'}`}>
                              {CATEGORY_NAMES[it.materialType] || it.materialType}
                            </span>
                          </td>
                          <td className="p-2.5">{formatItemDimensions(it)}</td>
                          <td className="p-2.5 text-center">{it.quantity}</td>
                          <td className="p-2.5 text-right">{formatBRL(it.unitPrice)}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">{formatBRL(it.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bloco de Resumo Financeiro */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Total de Itens: <strong className="text-slate-800 dark:text-slate-200">{selectedSaleForDetails.items?.length ?? 0}</strong>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-sans">Subtotal Bruto:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBRL(selectedSaleForDetails.subtotalAmount ?? 0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-sans">Desconto:</span>
                    {selectedSaleForDetails.discountAmount > 0 ? (
                      <span className="text-rose-600 font-bold">- {formatBRL(selectedSaleForDetails.discountAmount)}</span>
                    ) : (
                      <span className="text-slate-500">R$ 0,00</span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600 dark:text-slate-300 mr-1.5 font-sans font-bold">Total a Pagar:</span>
                    <strong className="text-emerald-600 font-extrabold text-base">{formatBRL(selectedSaleForDetails.totalAmount ?? 0)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSaleForPdf(selectedSaleForDetails);
                  setSelectedSaleForDetails(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold border border-outline-variant bg-surface rounded-md hover:bg-surface-container text-on-surface flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Imprimir PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSaleForLabels(selectedSaleForDetails);
                  setSelectedSaleForDetails(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold border border-outline-variant bg-surface rounded-md hover:bg-surface-container text-on-surface flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-500" />
                <span>Etiquetas Elgin</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSaleForDetails(null)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRÉ-VISUALIZAÇÃO / EXPORTAÇÃO PDF */}
      {selectedSaleForPdf && (
        <div data-testid="modal-pdf-part-sale" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Espelho de Venda Avulsa / Impressão PDF</span>
              </h3>
              <button
                type="button"
                data-testid="btn-close-pdf-modal"
                onClick={() => setSelectedSaleForPdf(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="pdfContent" className="p-8 overflow-y-auto flex-1 bg-white dark:bg-slate-950 space-y-6 text-xs text-slate-800 dark:text-slate-200">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">AlumiGest ERP</h1>
                  <p className="text-slate-500 text-[11px]">Gestão de Vidros e Alumínio</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">
                    VENDA {selectedSaleForPdf.code}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">{formatDate(selectedSaleForPdf.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Dados do Cliente</span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">{selectedSaleForPdf.clientName || 'Cliente Balcão'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">Status Comercial</span>
                  <div>{renderStatusBadge(selectedSaleForPdf.status)}</div>
                </div>
              </div>

              <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Categoria</th>
                    <th className="p-2">Dimensões</th>
                    <th className="p-2 text-center">Qtd</th>
                    <th className="p-2 text-right">Unitário</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {(selectedSaleForPdf.items || []).map((it) => (
                    <tr key={it.id}>
                      <td className="p-2 font-sans font-medium text-slate-800 dark:text-slate-200">{it.description}</td>
                      <td className="p-2 font-sans text-slate-600 dark:text-slate-400 text-[11px]">{CATEGORY_NAMES[it.materialType] || it.materialType}</td>
                      <td className="p-2">{formatItemDimensions(it)}</td>
                      <td className="p-2 text-center">{it.quantity}</td>
                      <td className="p-2 text-right">{formatBRL(it.unitPrice)}</td>
                      <td className="p-2 text-right font-bold">{formatBRL(it.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatBRL(selectedSaleForPdf.subtotalAmount ?? 0)}</span>
                  </div>
                  {selectedSaleForPdf.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Desconto:</span>
                      <span className="font-mono text-rose-600">- {formatBRL(selectedSaleForPdf.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold text-sm border-t border-slate-300 dark:border-slate-700 pt-1">
                    <span>Total Final:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">{formatBRL(selectedSaleForPdf.totalAmount ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedSaleForPdf(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Documento</span>
              </button>
              <button
                type="button"
                data-testid="btn-download-pdf-official"
                disabled={isDownloadingPdf}
                onClick={() => handleDownloadPdf(selectedSaleForPdf)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando PDF A4...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF A4 Oficial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ETIQUETAS TÉRMICAS ELGIN L42 (100x60mm) */}
      {selectedSaleForLabels && (
        <div data-testid="modal-thermal-labels" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-500" />
                <span>Etiquetas Térmicas Elgin L42 (100×60mm)</span>
              </h3>
              <button
                type="button"
                data-testid="btn-close-labels-modal"
                onClick={() => setSelectedSaleForLabels(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Venda {selectedSaleForLabels.code} | {selectedSaleForLabels.items?.length ?? 0} item(ns) formatados para corte e expedição rápida.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-950 text-xs">
              {(selectedSaleForLabels.items || []).map((it) => (
                <div
                  key={it.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded shadow-xs flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <strong className="text-slate-800 dark:text-slate-100 font-bold block">{it.description}</strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Cliente: {selectedSaleForLabels.clientName || 'Cliente Balcão'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono font-medium block">
                      Dimensões: {formatItemDimensions(it)} | Qtd: {it.quantity} un
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                      100×60mm
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">{selectedSaleForLabels.code}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSaleForLabels(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setSelectedSaleForLabels(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Imprimir Etiquetas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMAÇÃO DE CANCELAMENTO */}
      {saleToCancel && (
        <div data-testid="modal-cancel-sale" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/50 rounded-full">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Confirmar Cancelamento
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tem certeza de que deseja cancelar a venda <strong>{saleToCancel.code}</strong> (Cliente: {saleToCancel.clientName || 'Cliente Balcão'}, Total: {formatBRL(saleToCancel.totalAmount)})? Esta ação é irreversível.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                data-testid="btn-cancel-modal-dismiss"
                onClick={() => setSaleToCancel(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                data-testid="btn-confirm-cancel-sale"
                disabled={updateStatusMutation.isPending}
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{updateStatusMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
