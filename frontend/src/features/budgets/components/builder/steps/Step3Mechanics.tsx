import React from 'react';
import type {
  OpeningDirection,
  HandleConfig,
  DrillingConfig,
  HandleType,
  HandleSide,
  HandleCoverage,
  DivisionType,
} from '../../../types';

export interface Step3MechanicsProps {
  openingDirection: OpeningDirection;
  supportedDirections: OpeningDirection[];
  handleConfig: HandleConfig;
  drillingConfig: DrillingConfig;
  holeDistanceInputs: string[];
  heightMm: number | '';
  notes: string;
  defaultHeight: number;
  onOpeningDirectionChange: (dir: OpeningDirection) => void;
  onHandleTypeChange: (type: HandleType) => void;
  onHandleSideChange: (side: HandleSide) => void;
  onHandleCoverageChange: (coverage: HandleCoverage) => void;
  onHandlePieceLengthChange: (length: number) => void;
  onHoleCountChange: (count: number) => void;
  onDivisionTypeChange: (type: DivisionType) => void;
  onSingleHoleDistanceChange: (index: number, val: string) => void;
  onNotesChange: (notes: string) => void;
}

export const Step3Mechanics: React.FC<Step3MechanicsProps> = ({
  openingDirection,
  supportedDirections,
  handleConfig,
  drillingConfig,
  holeDistanceInputs,
  heightMm,
  notes,
  defaultHeight,
  onOpeningDirectionChange,
  onHandleTypeChange,
  onHandleSideChange,
  onHandleCoverageChange,
  onHandlePieceLengthChange,
  onHoleCountChange,
  onDivisionTypeChange,
  onSingleHoleDistanceChange,
  onNotesChange,
}) => {
  return (
    <div className="flex flex-col gap-md animate-fadeIn">
      {/* Sentido de Abertura & Puxador */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
        <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
          <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            Mecânica da Folha & Puxador
          </h3>
        </div>

        {/* Sentido de Abertura */}
        <div className="flex flex-col gap-xs">
          <div className="text-xs sm:text-sm font-label font-semibold text-on-surface flex items-center gap-xs mb-1">
            <span className="material-symbols-outlined text-[16px] text-primary">swap_horiz</span>
            Sentido de Abertura da Folha
          </div>
          <div className={`grid ${supportedDirections.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-xs`}>
            {supportedDirections.map((dir) => {
              const isSelected = openingDirection === dir;
              let label = 'Abrir';
              let icon = 'swap_horiz';
              if (dir === 'LEFT_TO_RIGHT') { label = 'Abrir p/ Direita'; icon = 'arrow_forward'; }
              else if (dir === 'RIGHT_TO_LEFT') { label = 'Abrir p/ Esquerda'; icon = 'arrow_back'; }
              else if (dir === 'OUTSIDE') { label = 'Para Fora'; icon = 'open_in_new'; }
              else if (dir === 'INSIDE') { label = 'Para Dentro'; icon = 'login'; }
              else if (dir === 'CENTER_TO_SIDES') { label = 'Centro p/ Lados'; icon = 'unfold_more'; }

              return (
                <button
                  key={dir}
                  type="button"
                  onClick={() => onOpeningDirectionChange(dir)}
                  aria-pressed={isSelected}
                  className={`py-2 px-3 rounded border text-xs sm:text-sm font-label font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Puxador */}
        <div className="pt-xs border-t border-outline-variant/50 flex flex-col gap-xs">
          <div className="text-xs sm:text-sm font-label font-semibold text-on-surface flex items-center gap-xs mb-1">
            <span className="material-symbols-outlined text-[16px] text-primary">hardware</span>
            Puxador & Ferragens de Manuseio
          </div>
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label htmlFor="handle-type-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                Tipo de Puxador
              </label>
              <select
                id="handle-type-select"
                value={handleConfig.handleType}
                onChange={(e) => onHandleTypeChange(e.target.value as HandleType)}
                aria-label="Tipo de Puxador"
                className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                <option value="BAR_TUBULAR">Tubular Inox</option>
                <option value="SHELL_LOCK">Fecho Concha</option>
                <option value="LEVER_HANDLE">Maçaneta</option>
                <option value="NONE">Sem Puxador</option>
              </select>
            </div>

            <div>
              <label htmlFor="handle-side-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                Lados do Puxador
              </label>
              <select
                id="handle-side-select"
                value={handleConfig.side ?? 'ONE_SIDE'}
                onChange={(e) => onHandleSideChange(e.target.value as HandleSide)}
                disabled={handleConfig.handleType === 'NONE'}
                aria-label="Lados do Puxador"
                className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none disabled:opacity-50 transition-colors"
              >
                <option value="ONE_SIDE">1 Lado (Face Única)</option>
                <option value="BOTH_SIDES">2 Lados (Frente e Verso)</option>
              </select>
            </div>
          </div>

          {handleConfig.handleType === 'BAR_TUBULAR' && (
            <div className="grid grid-cols-2 gap-sm pt-xs border-t border-outline-variant/40">
              <div>
                <label htmlFor="handle-coverage-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                  Extensão do Puxador
                </label>
                <select
                  id="handle-coverage-select"
                  value={handleConfig.coverage ?? 'FULL'}
                  onChange={(e) => onHandleCoverageChange(e.target.value as HandleCoverage)}
                  aria-label="Extensão do Puxador"
                  className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="FULL">Extensão Total da Folha</option>
                  <option value="PIECE">Pedaço / Tamanho Fixo</option>
                </select>
              </div>

              {handleConfig.coverage === 'PIECE' && (
                <div>
                  <label htmlFor="handle-length-input" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                    Comprimento (cm)
                  </label>
                  <input
                    id="handle-length-input"
                    type="number"
                    min={10}
                    max={300}
                    value={handleConfig.pieceLengthCm ?? 40}
                    onChange={(e) => onHandlePieceLengthChange(parseInt(e.target.value, 10) || 40)}
                    aria-label="Comprimento do Puxador em centímetros"
                    className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Furação da Esquadria */}
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
                Topo até base (máx {typeof heightMm === 'number' ? heightMm : defaultHeight} mm)
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
                      max={typeof heightMm === 'number' ? heightMm : 9999}
                      step={10}
                      value={val}
                      onChange={(e) => onSingleHoleDistanceChange(i, e.target.value)}
                      placeholder={`Ex: ${Math.round(
                        ((typeof heightMm === 'number' ? heightMm : defaultHeight) /
                          (drillingConfig.holeCount + 1)) *
                          holeNum,
                      )}`}
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
              {drillingConfig.holeCount} {drillingConfig.holeCount === 1 ? 'furo centralizado' : 'furos distribuídos por igual'} (~{Math.round((typeof heightMm === 'number' ? heightMm : defaultHeight) / (drillingConfig.holeCount + 1))} mm entre furos).
            </span>
          </div>
        )}
      </div>

      {/* Observações da Esquadria */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-xs">
        <div className="flex items-center gap-xs pb-xs border-b border-outline-variant/50">
          <span className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
          <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider">
            Observações da Esquadria
          </h3>
          <span className="text-xs font-label text-secondary lowercase ml-auto">(opcional)</span>
        </div>
        <div>
          <input
            id="modal-notes-input"
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Ex: Vidro temperado jateado, puxador especial, instalação urgente..."
            aria-label="Observações do Item"
            className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
