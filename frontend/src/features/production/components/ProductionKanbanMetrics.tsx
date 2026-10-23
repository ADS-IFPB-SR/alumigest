import React, { useMemo } from 'react';
import { Factory, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Order, OrderSummary } from '../../orders/types';
import { normalizeProductionStatus } from '../types';
import { calculateTotalPieces } from '../utils/kanbanUtils';
import { getDeadlineStatus } from '../utils/deadlineUtils';

export interface ProductionKanbanMetricsProps {
    /** Lista completa de ordens para consolidação dos indicadores executivos */
    orders: (Order | OrderSummary)[];
    /** Classes CSS opcionais */
    className?: string;
}

/**
 * Barra de Indicadores Gerenciais e KPIs de Produção Fabril (US-18.5).
 * Cartões executivos destacados com alto contraste e legibilidade.
 */
export const ProductionKanbanMetrics: React.FC<ProductionKanbanMetricsProps> = ({
    orders,
    className = '',
}) => {
    const metrics = useMemo(() => {
        const total = orders.length;
        let inProduction = 0;
        let urgentCount = 0;
        let lateCount = 0;

        orders.forEach((order) => {
            const normalized = normalizeProductionStatus(order.status);
            if (normalized === 'IN_PRODUCTION') {
                inProduction++;
            }

            const deadline = getDeadlineStatus(order.dataPrevisaoEntrega);
            if (deadline === 'LATE' || deadline === 'CRITICAL') {
                urgentCount++;
            }
            if (deadline === 'LATE') {
                lateCount++;
            }
        });

        const totalPieces = calculateTotalPieces(orders);

        // Taxa de entrega no prazo baseada no total de pedidos ativos vs pedidos com prazo vencido
        const onTimeRate = total === 0 ? 100 : Math.max(0, Math.round(((total - lateCount) / total) * 1000) / 10);

        return {
            inProduction,
            totalPieces,
            urgentCount,
            onTimeRate: onTimeRate.toFixed(1),
        };
    }, [orders]);

    return (
        <section
            data-testid="production-kanban-metrics"
            aria-label="Indicadores gerenciais de produção"
            className={`grid grid-cols-2 md:grid-cols-4 gap-3.5 ${className}`}
        >
            {/* KPI 1: OSs em Produção */}
            <div className="bg-white border-2 border-slate-200 hover:border-blue-300 rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <Factory className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">OSs em Produção</p>
                    <p data-testid="metric-in-production" className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                        {metrics.inProduction}
                    </p>
                </div>
            </div>

            {/* KPI 2: Total de Esquadrias (Peças Físicas) */}
            <div className="bg-white border-2 border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Total de Esquadrias</p>
                    <p data-testid="metric-total-pieces" className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                        {metrics.totalPieces} <span className="text-sm font-semibold text-slate-500">{metrics.totalPieces === 1 ? 'peça' : 'peças'}</span>
                    </p>
                </div>
            </div>

            {/* KPI 3: OSs Urgentes (Atrasadas ou Críticas) */}
            <div className="bg-white border-2 border-slate-200 hover:border-rose-300 rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">OSs Urgentes</p>
                    <p data-testid="metric-urgent" className="text-2xl font-extrabold text-rose-600 leading-tight mt-0.5">
                        {metrics.urgentCount}
                    </p>
                </div>
            </div>

            {/* KPI 4: Entrega no Prazo (%) */}
            <div className="bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Entrega no Prazo</p>
                    <p data-testid="metric-ontime-rate" className="text-2xl font-extrabold text-emerald-600 leading-tight mt-0.5">
                        {metrics.onTimeRate}%
                    </p>
                </div>
            </div>
        </section>
    );
};
