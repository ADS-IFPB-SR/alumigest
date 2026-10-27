import React from 'react';
import { Search, X, Calendar, Filter, RotateCcw } from 'lucide-react';
import type { DeadlineFilterOption, ProductionStatus } from '../types';

export interface ProductionKanbanFiltersProps {
    /** Termo de busca textual atual */
    searchTerm: string;
    /** Callback acionado ao alterar o texto de busca */
    onSearchChange: (value: string) => void;
    /** Filtro de prazo selecionado */
    deadlineFilter: DeadlineFilterOption;
    /** Callback acionado ao alterar o filtro de prazo */
    onDeadlineFilterChange: (value: DeadlineFilterOption) => void;
    /** Filtro de etapa/status de produção selecionado */
    statusFilter: 'ALL' | ProductionStatus;
    /** Callback acionado ao alterar o filtro de status */
    onStatusFilterChange: (value: 'ALL' | ProductionStatus) => void;
    /** Total geral de ordens carregadas */
    totalOrders: number;
    /** Quantidade de ordens visíveis após aplicação dos filtros */
    filteredOrdersCount: number;
    /** Callback para resetar todos os filtros para os valores padrão */
    onClearFilters: () => void;
    /** Classes CSS adicionais */
    className?: string;
}

/**
 * Barra de Filtros e Busca em Tempo Real do Kanban de Produção (US-18.5).
 * Alinhada ao estilo visual do protótipo com busca ampla e seletores refinados.
 */
export const ProductionKanbanFilters: React.FC<ProductionKanbanFiltersProps> = ({
    searchTerm,
    onSearchChange,
    deadlineFilter,
    onDeadlineFilterChange,
    statusFilter,
    onStatusFilterChange,
    totalOrders,
    filteredOrdersCount,
    onClearFilters,
    className = '',
}) => {
    const hasActiveFilters =
        searchTerm.trim().length > 0 ||
        deadlineFilter !== 'ALL' ||
        statusFilter !== 'ALL';

    return (
        <div
            data-testid="production-kanban-filters"
            className={`flex flex-col lg:flex-row gap-3 pt-2 ${className}`}
        >
            {/* 1. Campo de Busca Ampla (Código OS, Cliente, Orçamento ou Esquadria) */}
            <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    data-testid="input-search-kanban"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por código de OS, cliente ou esquadria..."
                    className="w-full pl-10 pr-9 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition shadow-2xs"
                    aria-label="Buscar por código de OS, cliente ou esquadria"
                />
                {searchTerm.length > 0 && (
                    <button
                        type="button"
                        data-testid="btn-clear-search-text"
                        onClick={() => onSearchChange('')}
                        aria-label="Limpar campo de busca"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* 2. Seletores de Filtro Rápidos */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Filtro por Prazo / Urgência */}
                <div className="relative inline-flex items-center">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                        data-testid="select-filter-deadline"
                        value={deadlineFilter}
                        onChange={(e) => onDeadlineFilterChange(e.target.value as DeadlineFilterOption)}
                        className="pl-8 pr-7 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition cursor-pointer shadow-2xs"
                        aria-label="Filtrar por prazo de entrega"
                    >
                        <option value="ALL">Prioridade / Prazo</option>
                        <option value="LATE">🔴 Atrasados (&lt; 0 dias)</option>
                        <option value="CRITICAL">🟡 Prazo Crítico (0 a 3 dias)</option>
                        <option value="NORMAL">🟢 No Prazo (&gt; 3 dias)</option>
                    </select>
                </div>

                {/* Filtro por Etapa de Fabricação */}
                <div className="relative inline-flex items-center">
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                        data-testid="select-filter-status"
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | ProductionStatus)}
                        className="pl-8 pr-7 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition cursor-pointer shadow-2xs"
                        aria-label="Filtrar por etapa de produção"
                    >
                        <option value="ALL">Todas as Etapas</option>
                        <option value="WAITING_PRODUCTION">Aguardando Produção</option>
                        <option value="IN_PRODUCTION">Em Produção</option>
                        <option value="COMPLETED">Concluído</option>
                    </select>
                </div>

                {/* 3. Indicador e Botão Reset */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        data-testid="btn-clear-all-filters"
                        onClick={onClearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-300 rounded-xl hover:bg-rose-100 transition shadow-2xs"
                        title="Limpar todos os filtros ativos"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Limpar</span>
                    </button>
                )}

                <span
                    data-testid="filter-counter-badge"
                    className="text-sm font-medium text-slate-700 whitespace-nowrap ml-1 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg shadow-2xs"
                >
                    <strong className="text-slate-900">{filteredOrdersCount}</strong> de {totalOrders}
                </span>
            </div>
        </div>
    );
};
