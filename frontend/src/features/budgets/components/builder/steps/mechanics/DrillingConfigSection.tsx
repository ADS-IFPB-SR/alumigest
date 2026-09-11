import React from 'react';
import type { DrillingConfig, DivisionType } from '../../../../types';

/**
 * Propriedades para a seção de furação técnica do Step 3.
 */
export interface DrillingConfigSectionProps {
  /** Configuração ativa de furação */
  drillingConfig: DrillingConfig;
  /** Buffer de valores milimetrados para digitação */
  holeDistanceInputs: string[];
  /** Altura da esquadria em mm */
  heightMm: number | '';
  /** Altura padrão de fallback */
  defaultHeight: number;
  onHoleCountChange: (count: number) => void;
  onDivisionTypeChange: (type: DivisionType) => void;
  onSingleHoleDistanceChange: (index: number, val: string) => void;
}

/**
 * Subcomponente de furação do vidro:
 * - Quantidade de furos (0 a 4).
 * - Modo de divisão equidistante (automático) vs personalizado (inputs individuais de cota).
 * - Validação visual de limites e cálculo de espaçamento médio em milímetros.
 */
export const DrillingConfigSection: React.FC<DrillingConfigSectionProps> = ({
  drillingConfig,
  holeDistanceInputs,
  heightMm,
  defaultHeight,
  onHoleCountChange,
  onDivisionTypeChange,
  onSingleHoleDistanceChange,
}) => {
  const currentHeight = typeof heightMm === 'number' && heightMm > 0 ? heightMm : defaultHeight;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
      <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
        <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px] text-primary">adjust</span>
          Furação do Vidro
        </h3>
        <span className="text-xs font-data-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">
          {drillingConfig.holeCount === 0
            ? 'Sem furação'
            : `${drillingConfig.holeCount} ${drillingConfig.holeCount === 1 ? 'furo' : 'furos'}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-sm">
        <div>
          <label htmlFor="hole-count-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
            Qtd de Furos
          </label>
          <select
            id="hole-count-select"
            value={drillingConfig.holeCount}
            onChange={(e) => onHoleCountChange(parseInt(e.target.value, 10))}
            aria-label="Quantidade de Furos"
            className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
          >
            <option value={0}>Sem Furação</option>
            <option value={1}>1 Furo</option>
            <option value={2}>2 Furos (Padrão)</option>
            <option value={3}>3 Furos</option>
            <option value={4}>4 Furos</option>
          </select>
        </div>

        <div>
          <label htmlFor="hole-division-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
            Distribuição dos Furos
          </label>
          <select
            id="hole-division-select"
            value={drillingConfig.divisionType}
            onChange={(e) => onDivisionTypeChange(e.target.value as DivisionType)}
            disabled={drillingConfig.holeCount === 0}
            aria-label="Divisão dos Furos"
            className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none disabled:opacity-50"
          >
            <option value="EQUAL">Por igual (Automático)</option>
            <option value="CUSTOM_DISTANCE">Com medida (Distâncias)</option>
          </select>
        </div>
      </div>

      {drillingConfig.holeCount > 0 && drillingConfig.divisionType === 'CUSTOM_DISTANCE' && (
        <div className="pt-xs border-t border-outline-variant/50 flex flex-col gap-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-label font-medium text-on-surface">
              Distâncias dos Furos (mm)
            </span>
            <span className="text-[11px] font-data-mono text-secondary">
              Topo até base (máx {currentHeight} mm)
            </span>
          </div>
          <div
            className={`grid ${
              drillingConfig.holeCount === 1
                ? 'grid-cols-1'
                : drillingConfig.holeCount === 3
                ? 'grid-cols-3'
                : 'grid-cols-2'
            } gap-sm mt-xs`}
          >
            {Array.from({ length: drillingConfig.holeCount }, (_, i) => {
              const holeNum = i + 1;
              const val = holeDistanceInputs[i] ?? '';
              return (
                <div key={`hole-input-${holeNum}`}>
                  <label
                    htmlFor={`hole-distance-input-${holeNum}`}
                    className="text-xs font-label font-medium text-on-surface-variant block mb-1"
                  >
                    Furo {holeNum} (mm)
                  </label>
                  <input
                    id={`hole-distance-input-${holeNum}`}
                    type="number"
                    min={10}
                    max={currentHeight}
                    step={10}
                    value={val}
                    onChange={(e) => onSingleHoleDistanceChange(i, e.target.value)}
                    placeholder={`Ex: ${Math.round((currentHeight / (drillingConfig.holeCount + 1)) * holeNum)}`}
                    aria-label={`Distância do Furo ${holeNum} em milímetros`}
                    className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {drillingConfig.holeCount > 0 && drillingConfig.divisionType === 'EQUAL' && (
        <div className="pt-xs border-t border-outline-variant/40 flex items-center gap-xs text-xs font-data-mono text-on-surface-variant bg-surface-container-low px-sm py-2 rounded border border-outline-variant/60">
          <span className="material-symbols-outlined text-[16px] text-primary">info</span>
          <span>
            {drillingConfig.holeCount} {drillingConfig.holeCount === 1 ? 'furo centralizado' : 'furos distribuídos por igual'} (~{Math.round(currentHeight / (drillingConfig.holeCount + 1))} mm entre furos).
          </span>
        </div>
      )}
    </div>
  );
};
