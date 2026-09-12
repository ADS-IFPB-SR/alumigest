import React from 'react';
import type { DrillingConfig, DivisionType } from '../../../../types';

/**
 * Propriedades para a seção de furação técnica do Step 3.
 */
export interface DrillingConfigSectionProps {
  /** Configuração ativa de furação */
  readonly drillingConfig: DrillingConfig;
  /** Buffer de valores milimetrados para digitação */
  readonly holeDistanceInputs: readonly string[];
  /** Altura da esquadria em mm */
  readonly heightMm: number | '';
  /** Altura padrão de fallback */
  readonly defaultHeight: number;
  readonly onHoleCountChange: (count: number) => void;
  readonly onDivisionTypeChange: (type: DivisionType) => void;
  readonly onSingleHoleDistanceChange: (index: number, val: string) => void;
}

/**
 * Subcomponente de furação técnica no alumínio:
 * - Quantidade de furos livre (com clamp de segurança 0 a 20 ou vazio para 0).
 * - Sugestões rápidas de atalho (Sem furos, 2, 3, 4, 6).
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

  // Estado local para digitação suave da quantidade de furos
  const [countInput, setCountInput] = React.useState<string>(
    drillingConfig.holeCount > 0 ? String(drillingConfig.holeCount) : ''
  );

  React.useEffect(() => {
    setCountInput(drillingConfig.holeCount > 0 ? String(drillingConfig.holeCount) : '');
  }, [drillingConfig.holeCount]);

  const handleCountChange = (valueStr: string) => {
    setCountInput(valueStr);
    const trimmed = valueStr.trim();
    if (trimmed === '') {
      onHoleCountChange(0);
      return;
    }
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      // Clamp para segurança da UI e renderização do SVG
      const clamped = Math.min(20, Math.max(0, parsed));
      onHoleCountChange(clamped);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
      <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
        <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px] text-primary">adjust</span>
          Furação no Alumínio
        </h3>
        <span className="text-xs font-data-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">
          {drillingConfig.holeCount === 0
            ? 'Sem furação'
            : `${drillingConfig.holeCount} ${drillingConfig.holeCount === 1 ? 'furo' : 'furos'}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
        <div>
          <label htmlFor="hole-count-input" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
            Qtd de Furos
          </label>
          <div className="relative">
            <input
              id="hole-count-input"
              type="number"
              min={0}
              max={20}
              value={countInput}
              onChange={(e) => handleCountChange(e.target.value)}
              placeholder="0 (Sem furação)"
              aria-label="Quantidade de Furos no Alumínio"
              className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
            />
            {drillingConfig.holeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCountInput('');
                  onHoleCountChange(0);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-error transition-colors p-1"
                title="Limpar (Sem furação)"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          {/* Sugestões rápidas de quantidade */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <span className="text-[11px] text-on-surface-variant font-label mr-0.5">Atalhos:</span>
            <button
              type="button"
              onClick={() => {
                setCountInput('');
                onHoleCountChange(0);
              }}
              className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                drillingConfig.holeCount === 0
                  ? 'bg-primary text-on-primary border-primary font-medium'
                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              Sem furos
            </button>
            {[2, 3, 4, 6].map((num) => (
              <button
                key={`preset-${num}`}
                type="button"
                onClick={() => {
                  setCountInput(String(num));
                  onHoleCountChange(num);
                }}
                className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                  drillingConfig.holeCount === num
                    ? 'bg-primary text-on-primary border-primary font-medium'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
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
          <span className="text-[11px] text-on-surface-variant font-data-mono block mt-1.5">
            {drillingConfig.holeCount === 0
              ? 'Defina a quantidade para habilitar a distribuição.'
              : drillingConfig.divisionType === 'EQUAL'
              ? 'Espaçamento automático pela altura.'
              : 'Informe a cota individual de cada furo.'}
          </span>
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
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-sm mt-xs max-h-60 overflow-y-auto pr-1"
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
          <span className="material-symbols-outlined text-[16px] text-primary">straighten</span>
          <span>
            Espaçamento médio calculado: ~
            {Math.round(currentHeight / (drillingConfig.holeCount + 1))} mm entre centros
          </span>
        </div>
      )}
    </div>
  );
};
