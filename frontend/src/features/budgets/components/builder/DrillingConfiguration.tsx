import React from 'react';
import type { DrillingConfig, DivisionType } from '../../types';
import { DIVISION_TYPE_LABELS } from '../../types';

interface DrillingConfigurationProps {
  value: DrillingConfig;
  onChange: (config: DrillingConfig) => void;
  heightMm?: number;
  errors?: { holeCount?: string; divisionType?: string; customDistancesMm?: string };
}

const DIVISION_TYPES: DivisionType[] = ['EQUAL', 'CUSTOM_DISTANCE'];

export const DrillingConfiguration: React.FC<DrillingConfigurationProps> = ({
  value,
  onChange,
  heightMm,
  errors = {},
}) => {
  const generateDefaultDistances = (count: number, totalH: number = heightMm || 2100): number[] => {
    if (count <= 0) return [];
    const step = Math.round(totalH / (count + 1));
    return Array.from({ length: count }, (_, i) => Math.round(step * (i + 1)));
  };

  const handleHoleCountChange = (str: string) => {
    const n = parseInt(str.replace(/\D/g, ''), 10);
    const count = !isNaN(n) && n >= 0 && n <= 20 ? n : (str === '' ? 0 : value.holeCount);
    
    if (value.divisionType === 'CUSTOM_DISTANCE') {
      const current = value.customDistancesMm ?? [];
      let updated: number[];
      if (count > current.length) {
        const lastVal = current.length > 0 ? current[current.length - 1] : 0;
        const toAdd = Array.from({ length: count - current.length }, (_, i) => lastVal + 150 * (i + 1));
        updated = [...current, ...toAdd];
      } else {
        updated = current.slice(0, count);
      }
      onChange({
        ...value,
        holeCount: count,
        customDistancesMm: count > 0 ? updated : undefined,
      });
    } else {
      onChange({
        ...value,
        holeCount: count,
        customDistancesMm: undefined,
      });
    }
  };

  const handleDivisionTypeChange = (type: DivisionType) => {
    const count = value.holeCount > 0 ? value.holeCount : 2;
    onChange({
      ...value,
      holeCount: count,
      divisionType: type,
      customDistancesMm: type === 'CUSTOM_DISTANCE'
        ? (value.customDistancesMm?.length === count ? value.customDistancesMm : generateDefaultDistances(count))
        : undefined,
    });
  };

  const handleCustomDistanceChange = (index: number, distStr: string) => {
    const dist = parseInt(distStr.replace(/\D/g, ''), 10);
    const distances = [...(value.customDistancesMm ?? [])];
    if (!isNaN(dist)) {
      distances[index] = dist;
      onChange({ ...value, customDistancesMm: distances });
    } else if (distStr === '') {
      distances[index] = 0;
      onChange({ ...value, customDistancesMm: distances });
    }
  };

  const addCustomDistance = () => {
    if (value.holeCount >= 20) return;
    const distances = [...(value.customDistancesMm ?? [])];
    const last = distances.length > 0 ? distances[distances.length - 1] : 0;
    distances.push(last + 150);
    onChange({
      ...value,
      holeCount: distances.length,
      customDistancesMm: distances,
    });
  };

  const removeCustomDistance = (index: number) => {
    const distances = (value.customDistancesMm ?? []).filter((_, i) => i !== index);
    onChange({
      ...value,
      holeCount: distances.length,
      customDistancesMm: distances.length > 0 ? distances : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-md">
      {/* Quantidade de furos */}
      <div className="flex items-center gap-md">
        <div className="flex flex-col gap-xs">
          <label htmlFor="hole-count" className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
            Quantidade de Furos *
          </label>
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={() => handleHoleCountChange(String(Math.max(0, value.holeCount - 1)))}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              disabled={value.holeCount <= 0}
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <input
              id="hole-count"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              value={value.holeCount}
              onChange={(e) => handleHoleCountChange(e.target.value)}
              className={`w-16 text-center px-sm py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none ${errors.holeCount ? 'border-error' : 'border-outline-variant'}`}
            />
            <button
              type="button"
              onClick={() => handleHoleCountChange(String(Math.min(20, value.holeCount + 1)))}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              disabled={value.holeCount >= 20}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <span className="text-xs text-on-surface-variant">furos</span>
          </div>
          {errors.holeCount && (
            <span className="text-error text-xs">{errors.holeCount}</span>
          )}
        </div>
      </div>

      {/* Tipo de divisão (apenas quando há furos) */}
      {value.holeCount > 0 && (
        <>
          <div>
            <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
              Distribuição
            </p>
            <div className="flex gap-sm">
              {DIVISION_TYPES.map((type) => {
                const isSelected = value.divisionType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleDivisionTypeChange(type)}
                    className={`
                      flex items-center gap-xs px-md py-sm rounded-md border-2 text-sm font-label transition-all
                      hover:border-primary active:scale-95
                      ${isSelected
                        ? 'border-primary bg-secondary-container/30 text-on-surface font-semibold'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {type === 'EQUAL' ? 'view_column' : 'tune'}
                    </span>
                    {DIVISION_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distâncias customizadas */}
          {value.divisionType === 'CUSTOM_DISTANCE' && (
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                  Posições dos Furos (a partir do topo)
                </p>
                {heightMm && (
                  <span className="text-xs font-data-mono text-on-surface-variant">
                    Altura: {heightMm} mm
                  </span>
                )}
              </div>
              {errors.customDistancesMm && (
                <span className="text-error text-xs">{errors.customDistancesMm}</span>
              )}
              <div className="flex flex-col gap-xs">
                {(value.customDistancesMm ?? []).map((dist, i) => {
                  const isOutOfRange = heightMm ? dist > heightMm || dist <= 0 : dist <= 0;
                  return (
                    <div key={i} className="flex items-center gap-sm">
                      <span className="text-xs font-data-mono text-on-surface-variant w-8">#{i + 1}</span>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={heightMm || 9999}
                          value={dist === 0 ? '' : dist}
                          onChange={(e) => handleCustomDistanceChange(i, e.target.value)}
                          className={`w-28 pr-[2.5rem] px-sm py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none ${isOutOfRange ? 'border-error' : 'border-outline-variant'}`}
                        />
                        <span className="absolute right-sm top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
                          mm
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomDistance(i)}
                        aria-label={`Remover furo #${i + 1}`}
                        className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addCustomDistance}
                  className="flex items-center gap-xs text-xs text-primary hover:underline font-label mt-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">add_circle</span>
                  Adicionar posição
                </button>
              </div>
            </div>
          )}

          {/* Prévia da distribuição EQUAL */}
          {value.divisionType === 'EQUAL' && value.holeCount > 0 && (
            <div className="bg-surface-container rounded-md p-sm border border-outline-variant text-xs font-data-mono text-on-surface-variant">
              {value.holeCount} furo{value.holeCount > 1 ? 's' : ''} distribuídos igualmente pela altura da esquadria.
            </div>
          )}
        </>
      )}
    </div>
  );
};
