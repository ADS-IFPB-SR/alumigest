import React from 'react';
import type { BuilderState } from '../../../types';
import { HANDLE_TYPE_LABELS } from '../../../types';
import { formatBRL } from '../../../utils/calculations';

export interface Step4SummaryProps {
  readonly state: BuilderState;
  readonly svgW: number;
  readonly svgH: number;
  readonly unitAreaM2: string;
  readonly totalQty: number;
}

export const Step4Summary: React.FC<Step4SummaryProps> = ({
  state,
  svgW,
  svgH,
  unitAreaM2,
  totalQty,
}) => {
  const configuredMaterials = state.materialSelections.filter((s) => s.materialId);

  const handleType = state.handleConfig?.handleType;
  const handleLabel = !handleType || handleType === 'NONE'
    ? 'Sem Puxador'
    : (HANDLE_TYPE_LABELS[handleType] ?? handleType);

  const holeCount = state.drillingConfig?.holeCount ?? 0;
  const drillingLabel = holeCount === 0 ? 'Sem furos' : holeCount === 1 ? '1 furo' : `${holeCount} furos`;

  return (
    <div className="flex flex-col gap-md animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md sm:p-lg shadow-xs flex flex-col gap-md">
        <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
          <h3 className="text-base font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
            <span className="material-symbols-outlined text-[20px] text-primary">task_alt</span>
            <span>Ficha Técnica & Resumo</span>
          </h3>
          <span className="text-xs font-label text-primary font-bold uppercase tracking-wider">
            Pronto para salvar
          </span>
        </div>

        {/* Grid de Resumo das Características */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm text-sm">
          <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
            <span className="text-xs text-secondary block font-label">Dimensões do Vão</span>
            <strong className="text-on-surface font-data-mono">{svgW} × {svgH} mm</strong>
          </div>
          <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
            <span className="text-xs text-secondary block font-label">Quantidade</span>
            <strong className="text-on-surface font-data-mono">{totalQty}{' '}{totalQty > 1 ? 'unidades' : 'unidade'}</strong>
          </div>
          <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
            <span className="text-xs text-secondary block font-label">Área Total</span>
            <strong className="text-on-surface font-data-mono">{((+unitAreaM2) * totalQty).toFixed(2)} m²</strong>
          </div>
          <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
            <span className="text-xs text-secondary block font-label">Cor do Alumínio</span>
            <strong className="text-on-surface font-body truncate block">{state.aluminumColor}</strong>
          </div>
          <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
            <span className="text-xs text-secondary block font-label">Vidro</span>
            <strong className="text-on-surface font-body truncate block">{state.glassFinish}</strong>
          </div>
          <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
            <span className="text-xs text-secondary block font-label">Puxador / Furação</span>
            <strong
              className="text-on-surface font-body text-xs sm:text-sm leading-snug block break-words"
              title={`${handleLabel} • ${drillingLabel}`}
            >
              {handleLabel} • {drillingLabel}
            </strong>
          </div>
        </div>

        {/* Resumo dos Insumos Selecionados */}
        <div className="flex flex-col gap-xs pt-xs border-t border-outline-variant/50">
          <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider">
            Insumos Configurados ({configuredMaterials.length})
          </span>
          <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-1 text-xs font-data-mono">
            {configuredMaterials.map((s) => (
              <div key={s.requirementId} className="flex items-center justify-between py-1 border-b border-outline-variant/30">
                <span className="text-on-surface truncate max-w-[240px] sm:max-w-xs">
                  {s.label}: {s.materialName} ({s.quantity} {s.unitMeasure})
                </span>
                <span className="font-bold text-primary shrink-0">
                  {s.totalPrice !== undefined ? formatBRL(s.totalPrice) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Observações se houver */}
        {state.notes && (
          <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50 text-xs">
            <span className="text-secondary font-label block font-semibold">Observações:</span>
            <p className="text-on-surface font-body mt-0.5">{state.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
