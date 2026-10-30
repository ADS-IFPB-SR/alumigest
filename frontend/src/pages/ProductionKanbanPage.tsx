import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Printer, Plus, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { useProductionKanban } from '../features/production/hooks/useProductionKanban';
import {
    ProductionKanbanBoard,
    ProductionKanbanMetrics,
    ProductionKanbanFilters,
} from '../features/production/components';
import {
    type DeadlineFilterOption,
    type ProductionStatus,
    normalizeProductionStatus,
} from '../features/production/types';
import { getDeadlineStatus } from '../features/production/utils/deadlineUtils';

/**
 * Página Principal do Painel Kanban de Acompanhamento Fabril (US-18.5 / #456).
 * Ocupa 100% da largura útil sem margens excessivas, integrado ao DashboardLayout.
 */
export function ProductionKanbanPage() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilterOption>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | ProductionStatus>('ALL');

    const {
        orders,
        isLoading,
        isError,
        error,
        refetchKanban,
        onMoveOrder,
    } = useProductionKanban();

    const filteredOrders = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return orders.filter((order) => {
            if (term.length > 0) {
                const matchCodigo = order.codigo?.toLowerCase().includes(term);
                const matchCliente = order.clienteNome?.toLowerCase().includes(term);
                const matchOrcamento = order.orcamentoCodigo?.toLowerCase().includes(term);

                if (!matchCodigo && !matchCliente && !matchOrcamento) {
                    return false;
                }
            }

            if (deadlineFilter !== 'ALL') {
                const orderDeadline = getDeadlineStatus(order.dataPrevisaoEntrega);
                if (orderDeadline !== deadlineFilter) {
                    return false;
                }
            }

            if (statusFilter !== 'ALL') {
                const orderStatus = normalizeProductionStatus(order.status);
                if (orderStatus !== statusFilter) {
                    return false;
                }
            }

            return true;
        });
    }, [orders, searchTerm, deadlineFilter, statusFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setDeadlineFilter('ALL');
        setStatusFilter('ALL');
    };

    const handleNavigateDetails = (orderId: string) => {
        navigate(`/ordens-servico/${orderId}`);
    };

    const handlePrintKanban = () => {
        window.print();
    };

    const handleNavigateNewOrder = () => {
        // No domínio do AlumiGest, Ordens de Serviço nascem de Orçamentos Aprovados
        navigate('/orcamentos');
    };

    return (
        <div
            data-testid="production-kanban-page"
            className="flex-1 flex flex-col h-full min-h-0 w-full space-y-4 overflow-y-auto"
        >
            {/* 1. Breadcrumbs, Título e Ações do Topo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-none">
                <div>
                    {/* Breadcrumbs */}
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-1"
                    >
                        <Link to="/" className="hover:text-slate-800 transition">
                            Início
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                            Kanban
                        </span>
                    </nav>
                    <h1
                        id="kanban-page-title"
                        className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
                    >
                        Ordens de Serviço (Kanban)
                    </h1>
                    <p className="text-sm text-slate-600 mt-0.5">
                        Gerencie e acompanhe a fabricação das ordens de serviço geradas a partir de orçamentos aprovados.
                    </p>
                </div>

                {/* Botões de Ação do Topo */}
                <div className="flex items-center gap-2">
                    {/* Botão Imprimir Fichas PCP */}
                    <button
                        type="button"
                        data-testid="btn-print-kanban"
                        onClick={handlePrintKanban}
                        className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-2xs transition flex items-center gap-2"
                        title="Imprimir visualização consolidada do PCP"
                    >
                        <Printer className="w-4 h-4 text-slate-500" />
                        <span>Imprimir Fichas PCP</span>
                    </button>

                    {/* Botão Nova Ordem de Serviço */}
                    <button
                        type="button"
                        data-testid="btn-new-order"
                        onClick={handleNavigateNewOrder}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-2xs transition flex items-center gap-2"
                        title="Ordens de serviço são geradas a partir de orçamentos aprovados"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nova Ordem de Serviço</span>
                    </button>

                    {/* Botão Atualizar (Discreto) */}
                    <button
                        type="button"
                        data-testid="btn-refresh-kanban"
                        onClick={() => refetchKanban()}
                        disabled={isLoading}
                        aria-label="Atualizar dados do Kanban"
                        className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg shadow-2xs transition disabled:opacity-50"
                        title="Atualizar dados do Kanban"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* 2. Barra de Indicadores Gerenciais (Métricas Reais) */}
            <ProductionKanbanMetrics orders={orders} />

            {/* 3. Barra de Filtros e Busca em Tempo Real */}
            <ProductionKanbanFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                deadlineFilter={deadlineFilter}
                onDeadlineFilterChange={setDeadlineFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                totalOrders={orders.length}
                filteredOrdersCount={filteredOrders.length}
                onClearFilters={handleClearFilters}
            />

            {/* 4. Tratamento de Erro de Conexão com o Backend */}
            {isError && (
                <div
                    data-testid="kanban-error-state"
                    role="alert"
                    className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-800"
                >
                    <div className="flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                            <p className="text-xs font-bold">Falha ao carregar ordens de produção</p>
                            <p className="text-xs text-rose-600">
                                {error?.message || 'Verifique sua conexão ou tente novamente em instantes.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => refetchKanban()}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition shrink-0"
                    >
                        Tentar Novamente
                    </button>
                </div>
            )}

            {/* 5. Quadro Kanban Interativo (3 Colunas + Drag and Drop) — ocupa o espaço restante via flexbox; rolagem concentrada nas colunas (min-h é só salvaguarda p/ janelas baixas, quando a página assume a rolagem) */}
            <div data-testid="kanban-board-wrapper" className="flex flex-col md:flex-1 md:min-h-[320px]">
                <ProductionKanbanBoard
                    orders={filteredOrders}
                    isLoading={isLoading}
                    onMoveOrder={onMoveOrder}
                    onClickDetails={handleNavigateDetails}
                />
            </div>
        </div>
    );
}
