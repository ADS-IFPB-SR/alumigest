import React from 'react';
import { HANDLE_POSITION_LABELS } from '../../../../types';
import type {
  HandleConfig,
  HandleType,
  HandlePosition,
  HandleOrientation,
  HandleSide,
  HandleCoverage,
  MaterialSelection,
} from '../../../../types';

/**
 * Propriedades para a seção de configuração do puxador e insumo vinculado.
 */
export interface HandleConfigSectionProps {
  readonly handleConfig: HandleConfig;
  readonly handleMaterial?: MaterialSelection | null;
  readonly availableHandleProfiles?: readonly {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly unit: string;
    readonly colorFinish?: string;
  }[];
  readonly availableHandleHardwares?: readonly {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly unit: string;
  }[];
  readonly allowedHandlePositions?: readonly HandlePosition[];
  readonly onHandleTypeChange: (type: HandleType) => void;
  readonly onHandlePositionChange: (pos: HandlePosition) => void;
  readonly onHandleOrientationChange?: (orientation: HandleOrientation) => void;
  readonly onHandleSideChange: (side: HandleSide) => void;
  readonly onHandleCoverageChange: (coverage: HandleCoverage) => void;
  readonly onHandlePieceLengthChange: (length: number) => void;
  readonly onSelectHandleMaterial?: (materialId: string) => void;
  readonly onGoToMaterials?: () => void;
}

/**
 * Subcomponente especializado do Step 3:
 * 1. Vinculação do insumo de estoque (perfil cobrado por metro vs ferragem unitária).
 * 2. Formato no desenho técnico CAD (Perfil, Tubular, Fecho Concha, Maçaneta, Sem Puxador).
 * 3. Parâmetros geométricos de instalação (posição, orientação, lados e extensão total vs pedaço).
 */
export const HandleConfigSection: React.FC<HandleConfigSectionProps> = ({
  handleConfig,
  handleMaterial,
  availableHandleProfiles,
  availableHandleHardwares,
  allowedHandlePositions,
  onHandleTypeChange,
  onHandlePositionChange,
  onHandleOrientationChange,
  onHandleSideChange,
  onHandleCoverageChange,
  onHandlePieceLengthChange,
  onSelectHandleMaterial,
  onGoToMaterials,
}) => {
  return (
    <div className="flex flex-col gap-sm">
      {/* Seletor do Insumo de Estoque Vinculado */}
      <div className="flex flex-col gap-1.5 p-2.5 bg-surface-container-low border border-outline-variant rounded-lg min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <label htmlFor="select-handle-material" className="text-xs font-label font-bold text-on-surface flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">inventory_2</span>
            {' '}Insumo do Puxador (Estoque / Orçamento)
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
          {' '}Formato no Desenho Técnico (Gabarito CAD)
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

          let cardStyle = 'bg-surface border-outline-variant hover:bg-surface-container hover:border-primary/50 cursor-pointer';
          if (!isAllowed) {
            cardStyle = 'opacity-35 cursor-not-allowed bg-surface-container/40 border-dashed border-outline-variant/60';
          } else if (isSelected) {
            cardStyle = 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40 cursor-pointer';
          }

          return (
            <button
              key={item.type}
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && onHandleTypeChange(item.type)}
              aria-pressed={isSelected}
              title={!isAllowed ? restrictionNotice : undefined}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${cardStyle}`}
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
                  const positionIcons: Record<string, string> = {
                    BOTTOM: 'vertical_align_bottom',
                    TOP: 'vertical_align_top',
                    LEFT: 'dock_to_left',
                    RIGHT: 'dock_to_right',
                    CENTER: 'filter_center_focus',
                  };
                  const icon = positionIcons[pos] ?? 'filter_center_focus';

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
                Orientação do Puxador / Barra
              </span>
              <div className="grid grid-cols-2 gap-xs">
                {(() => {
                  const activeOrientation = handleConfig.orientation ?? (
                    handleConfig.position === 'TOP' || handleConfig.position === 'BOTTOM' ? 'HORIZONTAL' : 'VERTICAL'
                  );
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => onHandleOrientationChange?.('HORIZONTAL')}
                        aria-pressed={activeOrientation === 'HORIZONTAL'}
                        className={`py-2 px-2.5 rounded-lg border text-left flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeOrientation === 'HORIZONTAL'
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
                        aria-pressed={activeOrientation === 'VERTICAL'}
                        className={`py-2 px-2.5 rounded-lg border text-left flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeOrientation === 'VERTICAL'
                            ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40 font-bold'
                            : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">vertical_distribute</span>
                        <span className="text-xs font-label">Em pé (Vertical)</span>
                      </button>
                    </>
                  );
                })()}
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

            {/* Extensão no Gabarito (Exclusivo para Perfil Puxador) */}
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

          {/* Medida do Pedaço (cm) — Apenas para Perfil Puxador em Pedaço */}
          {handleConfig.handleType === 'PROFILE_HANDLE' &&
            handleConfig.coverage === 'PIECE' && (
              <div className="mt-1">
                <label htmlFor="handle-length-input" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                  Comprimento do Pedaço (cm) — Reflete fielmente no corte e consumo
                </label>
                <input
                  id="handle-length-input"
                  type="number"
                  min={10}
                  max={300}
                  value={handleConfig.pieceLengthCm ?? 40}
                  onChange={(e) => onHandlePieceLengthChange(Number.parseInt(e.target.value, 10) || 40)}
                  aria-label="Comprimento do Puxador em centímetros"
                  className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            )}
        </div>
      )}
    </div>
  );
};
