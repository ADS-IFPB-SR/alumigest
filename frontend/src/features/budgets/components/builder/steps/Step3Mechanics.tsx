import React from 'react';
import { HANDLE_POSITION_LABELS } from '../../../types';
import type {
  OpeningDirection,
  HandleConfig,
  HandleType,
  HandlePosition,
  HandleOrientation,
  DrillingConfig,
  HandleSide,
  HandleCoverage,
  DivisionType,
  MaterialSelection,
} from '../../../types';

export interface Step3MechanicsProps {
  openingDirection: OpeningDirection;
  supportedDirections: OpeningDirection[];
  handleConfig: HandleConfig;
  handleMaterial?: MaterialSelection | null;
  availableHandleProfiles?: Array<{ id: string; name: string; price: number; unit: string; colorFinish?: string }>;
  availableHandleHardwares?: Array<{ id: string; name: string; price: number; unit: string }>;
  allowedHandlePositions?: HandlePosition[];
  drillingConfig: DrillingConfig;
  holeDistanceInputs: string[];
  heightMm: number | '';
  notes: string;
  defaultHeight: number;
  onOpeningDirectionChange: (dir: OpeningDirection) => void;
  onHandleTypeChange: (type: HandleType) => void;
  onHandlePositionChange: (pos: HandlePosition) => void;
  onHandleOrientationChange?: (orientation: HandleOrientation) => void;
  onHandleSideChange: (side: HandleSide) => void;
  onHandleCoverageChange: (coverage: HandleCoverage) => void;
  onHandlePieceLengthChange: (length: number) => void;
  onSelectHandleMaterial?: (materialId: string) => void;
  onHoleCountChange: (count: number) => void;
  onDivisionTypeChange: (type: DivisionType) => void;
  onSingleHoleDistanceChange: (index: number, val: string) => void;
  onNotesChange: (notes: string) => void;
  onGoToMaterials?: () => void;
}

export const Step3Mechanics: React.FC<Step3MechanicsProps> = ({
  openingDirection,
  supportedDirections,
  handleConfig,
  handleMaterial,
  availableHandleProfiles,
  availableHandleHardwares,
  allowedHandlePositions,
  drillingConfig,
  holeDistanceInputs,
  heightMm,
  notes,
  defaultHeight,
  onOpeningDirectionChange,
  onHandleTypeChange,
  onHandlePositionChange,
  onHandleOrientationChange,
  onHandleSideChange,
  onHandleCoverageChange,
  onHandlePieceLengthChange,
  onSelectHandleMaterial,
  onHoleCountChange,
  onDivisionTypeChange,
  onSingleHoleDistanceChange,
  onNotesChange,
  onGoToMaterials,
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

        {/* Sentido de Abertura (Apenas se houver mais de uma opção real) */}
        {supportedDirections.length > 1 && (
          <div className="flex flex-col gap-xs pb-xs border-b border-outline-variant/50">
            <div className="text-xs sm:text-sm font-label font-semibold text-on-surface flex items-center gap-xs mb-1">
              <span className="material-symbols-outlined text-[16px] text-primary">swap_horiz</span>
              Sentido de Abertura da Folha
            </div>
            <div className="grid grid-cols-2 gap-xs">
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
        )}

        {/* Puxador — Representação Técnica no Desenho & Instalação */}
        <div className="flex flex-col gap-sm">
          {/* Seletor do Insumo de Estoque Vinculado */}
          <div className="flex flex-col gap-1.5 p-2.5 bg-surface-container-low border border-outline-variant rounded-lg min-w-0">
            <div className="flex items-center justify-between min-w-0">
              <label htmlFor="select-handle-material" className="text-xs font-label font-bold text-on-surface flex items-center gap-1.5 truncate">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0">inventory_2</span>
                Insumo do Puxador (Estoque / Orçamento)
              </label>
              {handleMaterial && (
                <span className={`text-[10px] font-label font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  handleMaterial.categoryType === 'PROFILE'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                }`}>
                  {handleMaterial.categoryType === 'PROFILE' ? 'PERFIL DE ALUMÍNIO (M)' : 'FERRAGEM (UN/PAR)'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full min-w-0">
              <select
                id="select-handle-material"
                value={handleMaterial?.materialId ?? ''}
                onChange={(e) => onSelectHandleMaterial?.(e.target.value)}
                aria-label="Insumo do Puxador"
                className="flex-1 min-w-0 w-full text-xs sm:text-sm py-1.5 px-2 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none truncate"
              >
                <option value="">-- Nenhum insumo vinculado (Desenho livre) --</option>
                {availableHandleProfiles && availableHandleProfiles.length > 0 && (
                  <optgroup label="Perfis de Alumínio (Perfil Puxador - Cobrado por metro)">
                    {availableHandleProfiles.map((p) => (
                      <option key={`opt-prof-${p.id}`} value={p.id}>
                        {p.name} (R$ {p.price.toFixed(2)}/{p.unit})
                      </option>
                    ))}
                  </optgroup>
                )}
                {availableHandleHardwares && availableHandleHardwares.length > 0 && (
                  <optgroup label="Ferragens & Fechos (Tubular / Concha / Maçaneta - Unidade)">
                    {availableHandleHardwares.map((h) => (
                      <option key={`opt-hw-${h.id}`} value={h.id}>
                        {h.name} (R$ {h.price.toFixed(2)}/{h.unit})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {onGoToMaterials && (
                <button
                  type="button"
                  onClick={onGoToMaterials}
                  title="Gerenciar insumos no Passo 2"
                  className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded border border-outline-variant/60 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </button>
              )}
            </div>

            {handleMaterial && (
              <div className="flex items-center justify-between text-[11px] font-data-mono text-secondary pt-0.5">
                <span>
                  Consumo: <strong>{handleMaterial.quantity ?? 1} {handleMaterial.unitMeasure}</strong>
                </span>
                <span>
                  Subtotal: <strong>R$ {handleMaterial.totalPrice?.toFixed(2) ?? '0.00'}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-xs border-t border-outline-variant/40">
            <div className="text-xs sm:text-sm font-label font-semibold text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-primary">hardware</span>
              Formato no Desenho Técnico (Gabarito CAD)
            </div>
            {handleMaterial?.categoryType === 'PROFILE' && (
              <span className="text-[11px] font-label font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                Restrito a Perfil de Alumínio
              </span>
            )}
            {handleMaterial?.categoryType === 'HARDWARE' && (
              <span className="text-[11px] font-label font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                Restrito a Ferragem
              </span>
            )}
          </div>

          {/* Seletor Visual dos Tipos de Representação Técnica */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-xs">
            {[
              { type: 'PROFILE_HANDLE' as HandleType, label: 'Perfil Puxador', icon: 'view_sidebar', desc: 'Cava no perfil' },
              { type: 'BAR_TUBULAR' as HandleType, label: 'Tubular / Barra', icon: 'drag_handle', desc: 'Barra cilíndrica' },
              { type: 'SHELL_LOCK' as HandleType, label: 'Fecho Concha', icon: 'radio_button_checked', desc: 'Embutido' },
              { type: 'LEVER_HANDLE' as HandleType, label: 'Maçaneta', icon: 'turn_slight_right', desc: 'Alavanca' },
              { type: 'NONE' as HandleType, label: 'Sem Puxador', icon: 'block', desc: 'Folha limpa' },
            ].map((item) => {
              const isSelected = handleConfig.handleType === item.type;
              const isProfileMat = handleMaterial?.categoryType === 'PROFILE';
              const isHardwareMat = handleMaterial?.categoryType === 'HARDWARE';

              let isAllowed = true;
              let restrictionNotice = item.desc;
              if (item.type !== 'NONE') {
                if (isProfileMat && item.type !== 'PROFILE_HANDLE') {
                  isAllowed = false;
                  restrictionNotice = 'Requer ferragem';
                } else if (isHardwareMat && item.type === 'PROFILE_HANDLE') {
                  isAllowed = false;
                  restrictionNotice = 'Requer perfil';
                }
              }

              return (
                <button
                  key={item.type}
                  type="button"
                  disabled={!isAllowed}
                  onClick={() => isAllowed && onHandleTypeChange(item.type)}
                  aria-pressed={isSelected}
                  title={!isAllowed ? restrictionNotice : undefined}
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                    !isAllowed
                      ? 'opacity-35 cursor-not-allowed bg-surface-container/40 border-dashed border-outline-variant/60'
                      : isSelected
                      ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40 cursor-pointer'
                      : 'bg-surface border-outline-variant hover:bg-surface-container hover:border-primary/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                      {item.icon}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check_circle
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-label font-bold leading-tight ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] font-body text-secondary truncate">
                    {!isAllowed ? restrictionNotice : item.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Parâmetros de Instalação (se houver puxador ativo) */}
          {handleConfig.handleType !== 'NONE' && (
            <div className="flex flex-col gap-sm pt-xs border-t border-outline-variant/40">
              {/* Posição de Instalação Filtrada pela Tipologia Mecânica */}
              {allowedHandlePositions && allowedHandlePositions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs sm:text-sm font-label font-medium text-on-surface block">
                    Posição de Instalação na Folha
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-xs">
                    {allowedHandlePositions.map((pos) => {
                      const isSelected = (handleConfig.position ?? allowedHandlePositions[0]) === pos;
                      const icon =
                        pos === 'BOTTOM' ? 'vertical_align_bottom' :
                        pos === 'TOP' ? 'vertical_align_top' :
                        pos === 'LEFT' ? 'dock_to_left' :
                        pos === 'RIGHT' ? 'dock_to_right' : 'filter_center_focus';

                      return (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => onHandlePositionChange(pos)}
                          aria-pressed={isSelected}
                          className={`py-2 px-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40 font-semibold'
                              : 'bg-surface border-outline-variant hover:bg-surface-container text-on-surface'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                            {icon}
                          </span>
                          <span className="text-xs font-label">
                            {HANDLE_POSITION_LABELS[pos] ?? pos}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Orientação da Barra / Perfil (Deitada vs Em pé) */}
              {(handleConfig.handleType === 'PROFILE_HANDLE' || handleConfig.handleType === 'BAR_TUBULAR') && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs sm:text-sm font-label font-medium text-on-surface block">
                    Orientação da Barra no Gabarito CAD
                  </span>
                  <div className="grid grid-cols-2 gap-xs">
                    <button
                      type="button"
                      onClick={() => onHandleOrientationChange?.('HORIZONTAL')}
                      aria-pressed={(handleConfig.orientation ?? (handleConfig.position === 'TOP' || handleConfig.position === 'BOTTOM' ? 'HORIZONTAL' : 'VERTICAL')) === 'HORIZONTAL'}
                      className={`py-2 px-2.5 rounded-lg border text-left flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        (handleConfig.orientation ?? (handleConfig.position === 'TOP' || handleConfig.position === 'BOTTOM' ? 'HORIZONTAL' : 'VERTICAL')) === 'HORIZONTAL'
                          ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40 font-bold'
                          : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">horizontal_distribute</span>
                      <span className="text-xs font-label">Deitada (Horizontal)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onHandleOrientationChange?.('VERTICAL')}
                      aria-pressed={(handleConfig.orientation ?? (handleConfig.position === 'TOP' || handleConfig.position === 'BOTTOM' ? 'HORIZONTAL' : 'VERTICAL')) === 'VERTICAL'}
                      className={`py-2 px-2.5 rounded-lg border text-left flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        (handleConfig.orientation ?? (handleConfig.position === 'TOP' || handleConfig.position === 'BOTTOM' ? 'HORIZONTAL' : 'VERTICAL')) === 'VERTICAL'
                          ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40 font-bold'
                          : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">vertical_distribute</span>
                      <span className="text-xs font-label">Em pé (Vertical)</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div>
                  <label htmlFor="handle-side-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                    Lados de Instalação (Pegada)
                  </label>
                  <select
                    id="handle-side-select"
                    value={handleConfig.side ?? 'ONE_SIDE'}
                    onChange={(e) => onHandleSideChange(e.target.value as HandleSide)}
                    aria-label="Lados do Puxador"
                    className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="ONE_SIDE">1 Lado (Face Única)</option>
                    <option value="BOTH_SIDES">2 Lados (Frente e Verso / Par)</option>
                  </select>
                </div>

                {/* Extensão no Gabarito (Apenas para Perfil Puxador de Alumínio) */}
                {handleConfig.handleType === 'PROFILE_HANDLE' && (
                  <div>
                    <label htmlFor="handle-coverage-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                      Extensão no Gabarito
                    </label>
                    <select
                      id="handle-coverage-select"
                      value={handleConfig.coverage ?? 'FULL'}
                      onChange={(e) => onHandleCoverageChange(e.target.value as HandleCoverage)}
                      aria-label="Extensão do Puxador"
                      className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="FULL">Extensão Total da Folha</option>
                      <option value="PIECE">Pedaço (Medida em cm)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Medida do Pedaço (cm) — Exclusivo para Perfil Puxador em Pedaço */}
              {handleConfig.handleType === 'PROFILE_HANDLE' &&
                handleConfig.coverage === 'PIECE' && (
                  <div className="mt-1">
                    <label htmlFor="handle-length-input" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                      Comprimento do Pedaço (cm) — Reflete fielmente no corte e SVG
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
