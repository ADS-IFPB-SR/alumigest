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
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs transition">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          Total Contratado
        </span>
        <div className="mt-2 text-2xl font-extrabold text-on-surface tracking-tight">
          {formatCurrency(totalContratado)}
        </div>
      </div>

      {/* KPI 2: Ordens de Serviço */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs transition">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          Ordens de Serviço
        </span>
        <div className="mt-2 text-2xl font-extrabold text-on-surface tracking-tight">
          {quantidadeOrdensServico} O.S.
        </div>
      </div>

      {/* KPI 3: Orçamentos Vinculados */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs transition">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          Orçamentos Vinculados
        </span>
        <div className="mt-2 text-2xl font-extrabold text-on-surface tracking-tight">
          {quantidadeOrcamentos} {quantidadeOrcamentos === 1 ? 'Proposta' : 'Propostas'}
        </div>
      </div>
    </div>
  );
};