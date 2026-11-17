import React from 'react';

interface LegendItem {
  readonly label: string;
  readonly description: string;
  readonly dotClass: string;
}

const LEGEND_ITEMS: readonly LegendItem[] = [
  {
    label: 'Em Estoque:',
    description: 'disponível acima do mínimo',
    dotClass: 'bg-emerald-500',
  },
  {
    label: 'Ponto de Pedido:',
    description: 'no limite mínimo',
    dotClass: 'bg-amber-500',
  },
  {
    label: 'Falta:',
    description: 'demanda de O.S. supera físico',
    dotClass: 'bg-rose-500',
  },
  {
    label: 'Sem Saldo:',
    description: 'sem movimentação',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
  },
];

/**
 * Legenda visual dos indicadores semânticos de estoque no rodapé das abas do catálogo.
 */
export const StockAlertLegend: React.FC = () => (
  <div
    data-testid="stock-alert-legend"
    className="mt-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-md flex flex-wrap items-center gap-x-lg gap-y-xs text-[11px] text-on-surface-variant flex-none"
  >
    {LEGEND_ITEMS.map((item) => (
      <span key={item.label} className="inline-flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotClass}`} aria-hidden="true" />
        <strong className="text-on-surface">{item.label}</strong>
        <span>{item.description}</span>
      </span>
    ))}
  </div>
);
