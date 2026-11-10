import React from 'react';
import { formatCurrency } from '../utils/customerHubUtils';

interface CustomerKpiGridProps {
  totalContratado: number;
  quantidadeOrdensServico: number;
  quantidadeOrcamentos: number;
}

export const CustomerKpiGrid: React.FC<CustomerKpiGridProps> = ({
  totalContratado,
  quantidadeOrdensServico,
  quantidadeOrcamentos,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* KPI 1: Total Contratado */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Total Contratado
        </span>
        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCurrency(totalContratado)}
        </div>
      </div>

      {/* KPI 2: Ordens de Serviço */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Ordens de Serviço
        </span>
        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {quantidadeOrdensServico} O.S.
        </div>
      </div>

      {/* KPI 3: Orçamentos Vinculados */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Orçamentos Vinculados
        </span>
        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {quantidadeOrcamentos} {quantidadeOrcamentos === 1 ? 'Proposta' : 'Propostas'}
        </div>
      </div>
    </div>
  );
};
