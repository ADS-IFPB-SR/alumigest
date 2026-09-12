import React from 'react';
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
import { OpeningDirectionSelector } from './mechanics/OpeningDirectionSelector';
import { HandleConfigSection } from './mechanics/HandleConfigSection';
import { DrillingConfigSection } from './mechanics/DrillingConfigSection';

/**
 * Propriedades para o componente Step3Mechanics (Passo 3: Mecânica da Folha, Puxador & Furação).
 */
export interface Step3MechanicsProps {
  /** Sentido de abertura atual */
  readonly openingDirection: OpeningDirection;
  /** Opções de sentido de abertura suportadas pela tipologia */
  readonly supportedDirections: readonly OpeningDirection[];
  /** Configuração geométrica do puxador */
  readonly handleConfig: HandleConfig;
  /** Material de puxador atualmente vinculado (se houver) */
  readonly handleMaterial?: MaterialSelection | null;
  /** Perfis de puxador disponíveis no catálogo */
  readonly availableHandleProfiles?: ReadonlyArray<{ id: string; name: string; price: number; unit: string; colorFinish?: string }>;
  /** Ferragens de puxador disponíveis no catálogo */
  readonly availableHandleHardwares?: ReadonlyArray<{ id: string; name: string; price: number; unit: string }>;
  /** Posições de puxador autorizadas pela tipologia */
  readonly allowedHandlePositions?: readonly HandlePosition[];
  /** Configuração de furação */
  readonly drillingConfig: DrillingConfig;
  /** Buffer de valores milimetrados das distâncias dos furos */
  readonly holeDistanceInputs: readonly string[];
  /** Altura da esquadria em mm */
  readonly heightMm: number | '';
  /** Observações técnicas livres */
  readonly notes: string;
  /** Altura padrão de fallback */
  readonly defaultHeight: number;
  readonly onOpeningDirectionChange: (dir: OpeningDirection) => void;
  readonly onHandleTypeChange: (type: HandleType) => void;
  readonly onHandlePositionChange: (pos: HandlePosition) => void;
  readonly onHandleOrientationChange?: (orientation: HandleOrientation) => void;
  readonly onHandleSideChange: (side: HandleSide) => void;
  readonly onHandleCoverageChange: (coverage: HandleCoverage) => void;
  readonly onHandlePieceLengthChange: (length: number) => void;
  readonly onSelectHandleMaterial?: (materialId: string) => void;
  readonly onHoleCountChange: (count: number) => void;
  readonly onDivisionTypeChange: (type: DivisionType) => void;
  readonly onSingleHoleDistanceChange: (index: number, val: string) => void;
  readonly onNotesChange: (notes: string) => void;
  readonly onGoToMaterials?: () => void;
}

/**
 * Passo 3 do Wizard de Esquadrias: Mecânica da Folha & Puxador.
 * Orquestra de forma modular:
 * 1. `OpeningDirectionSelector`: Sentido de abertura.
 * 2. `HandleConfigSection`: Tipo, insumo vinculado e geometria do puxador.
 * 3. `DrillingConfigSection`: Furação técnica e distâncias.
 * 4. Observações livres da esquadria.
 */
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
            <span>Mecânica da Folha & Puxador</span>
          </h3>
        </div>

        {/* Sentido de Abertura */}
        <OpeningDirectionSelector
          openingDirection={openingDirection}
          supportedDirections={supportedDirections}
          onOpeningDirectionChange={onOpeningDirectionChange}
        />

        {/* Puxador — Representação Técnica no Desenho & Instalação */}
        <HandleConfigSection
          handleConfig={handleConfig}
          handleMaterial={handleMaterial}
          availableHandleProfiles={availableHandleProfiles}
          availableHandleHardwares={availableHandleHardwares}
          allowedHandlePositions={allowedHandlePositions}
          onHandleTypeChange={onHandleTypeChange}
          onHandlePositionChange={onHandlePositionChange}
          onHandleOrientationChange={onHandleOrientationChange}
          onHandleSideChange={onHandleSideChange}
          onHandleCoverageChange={onHandleCoverageChange}
          onHandlePieceLengthChange={onHandlePieceLengthChange}
          onSelectHandleMaterial={onSelectHandleMaterial}
          onGoToMaterials={onGoToMaterials}
        />
      </div>

      {/* Furação da Esquadria */}
      <DrillingConfigSection
        drillingConfig={drillingConfig}
        holeDistanceInputs={holeDistanceInputs}
        heightMm={heightMm}
        defaultHeight={defaultHeight}
        onHoleCountChange={onHoleCountChange}
        onDivisionTypeChange={onDivisionTypeChange}
        onSingleHoleDistanceChange={onSingleHoleDistanceChange}
      />

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
