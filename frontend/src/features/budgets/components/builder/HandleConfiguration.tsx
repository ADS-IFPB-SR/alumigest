import React from 'react';
import type { HandleConfig, HandleType, HandleSide, HandleCoverage } from '../../types';
import {
  HANDLE_TYPE_LABELS,
  HANDLE_SIDE_LABELS,
  HANDLE_COVERAGE_LABELS,
} from '../../types';

interface HandleConfigurationProps {
  value: HandleConfig;
  onChange: (config: HandleConfig) => void;
  errors?: { handleType?: string; side?: string; coverage?: string; pieceLengthCm?: string };
}

const HANDLE_TYPES: HandleType[] = ['BAR_TUBULAR', 'SHELL_LOCK', 'LEVER_HANDLE', 'NONE'];
const HANDLE_SIDES: HandleSide[] = ['ONE_SIDE', 'BOTH_SIDES'];
const HANDLE_COVERAGES: HandleCoverage[] = ['FULL', 'PIECE'];

const HANDLE_ICONS: Record<HandleType, string> = {
  BAR_TUBULAR: 'linear_scale',
  SHELL_LOCK: 'radio_button_checked',
  LEVER_HANDLE: 'rotate_right',
  NONE: 'block',
};

export const HandleConfiguration: React.FC<HandleConfigurationProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  const isTubular = value.handleType === 'BAR_TUBULAR';

  const handleTypeChange = (type: HandleType) => {
    if (type === 'BAR_TUBULAR') {
      onChange({
        handleType: type,
        side: value.side ?? 'ONE_SIDE',
        coverage: value.coverage ?? 'FULL',
        pieceLengthCm: value.coverage === 'PIECE' ? (value.pieceLengthCm ?? 40) : undefined,
      });
    } else {
      // Para SHELL_LOCK, LEVER_HANDLE ou NONE, limpa propriedades específicas de barra tubular
      onChange({
        handleType: type,
        side: undefined,
        coverage: undefined,
        pieceLengthCm: undefined,
      });
    }
  };

  const handleSideChange = (side: HandleSide) => {
    onChange({ ...value, side });
  };

  const handleCoverageChange = (coverage: HandleCoverage) => {
    onChange({
      ...value,
      coverage,
      pieceLengthCm: coverage === 'PIECE' ? (value.pieceLengthCm ?? 40) : undefined,
    });
  };

  const handlePieceLengthChange = (lenStr: string) => {
    const len = parseInt(lenStr.replace(/\D/g, ''), 10);
    if (!isNaN(len) && len > 0 && len <= 500) {
      onChange({ ...value, pieceLengthCm: len });
    } else if (lenStr === '') {
      onChange({ ...value, pieceLengthCm: undefined });
    }
  };

  return (
    <div className="flex flex-col gap-md">
      {/* Tipo de puxador */}
      <div>
        <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
          Tipo de Puxador *
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
          {HANDLE_TYPES.map((type) => {
            const isSelected = value.handleType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`
                  flex flex-col items-center gap-xs p-sm rounded-lg border-2 transition-all text-center
                  hover:border-primary active:scale-95
                  ${isSelected
                    ? 'border-primary bg-secondary-container/30 shadow-sm text-on-surface'
                    : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                  }
                `}
              >
                <span className={`material-symbols-outlined text-[22px] ${isSelected ? 'text-primary' : ''}`}>
                  {HANDLE_ICONS[type]}
                </span>
                <span className="text-xs font-label font-medium leading-tight">
                  {HANDLE_TYPE_LABELS[type]}
                </span>
              </button>
            );
          })}
        </div>
        {errors.handleType && (
          <span className="text-error text-xs mt-xs block">{errors.handleType}</span>
        )}
      </div>

      {/* Configurações adicionais (apenas para puxador tubular) */}
      {isTubular && (
        <>
          {/* Lados */}
          <div>
            <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
              Lados
            </p>
            <div className="flex gap-sm">
              {HANDLE_SIDES.map((side) => {
                const isSelected = value.side === side;
                return (
                  <button
                    key={side}
                    type="button"
                    onClick={() => handleSideChange(side)}
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
                      {side === 'ONE_SIDE' ? 'looks_one' : 'looks_two'}
                    </span>
                    {HANDLE_SIDE_LABELS[side]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cobertura */}
          <div>
            <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
              Cobertura
            </p>
            <div className="flex flex-col sm:flex-row gap-sm">
              {HANDLE_COVERAGES.map((cov) => {
                const isSelected = value.coverage === cov;
                return (
                  <button
                    key={cov}
                    type="button"
                    onClick={() => handleCoverageChange(cov)}
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
                      {cov === 'FULL' ? 'align_justify_stretch' : 'horizontal_rule'}
                    </span>
                    {HANDLE_COVERAGE_LABELS[cov]}
                  </button>
                );
              })}
            </div>

            {/* Campo tamanho em cm (apenas quando PIECE) */}
            {value.coverage === 'PIECE' && (
              <div className="mt-sm flex items-center gap-sm">
                <label htmlFor="piece-length" className="text-xs text-on-surface-variant font-label whitespace-nowrap">
                  Tamanho do puxador:
                </label>
                <div className="relative w-32">
                  <input
                    id="piece-length"
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={500}
                    value={value.pieceLengthCm ?? ''}
                    onChange={(e) => handlePieceLengthChange(e.target.value)}
                    className={`w-full pr-[2.5rem] px-sm py-xs bg-surface-container-lowest border rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:outline-none transition-all ${errors.pieceLengthCm ? 'border-error' : 'border-outline-variant'}`}
                    placeholder="40"
                  />
                  <span className="absolute right-sm top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">
                    cm
                  </span>
                </div>
                {errors.pieceLengthCm && (
                  <span className="text-error text-xs">{errors.pieceLengthCm}</span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
