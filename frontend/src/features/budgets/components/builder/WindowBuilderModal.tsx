import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { BudgetItem } from '../../types';
import { formatBRL } from '../../utils/calculations';
import { Button } from '../../../../components/ui/Button';
import { WizardStepper } from './WizardStepper';
import { CadPreviewPanel } from './CadPreviewPanel';
import { Step1Dimensions } from './steps/Step1Dimensions';
import { Step2Materials } from './steps/Step2Materials';
import { Step3Mechanics } from './steps/Step3Mechanics';
import { Step4Summary } from './steps/Step4Summary';
import {
  useWindowBuilderState,
  CATEGORY_ICONS,
  DEFAULT_HEIGHT,
} from './hooks/useWindowBuilderState';

export interface WindowBuilderModalProps {
  isOpen: boolean;
  selectedProductId?: string | null;
  onClose: () => void;
  onAddItem: (item: BudgetItem) => void;
  editingItem?: BudgetItem | null;
}

export const WindowBuilderModal: React.FC<WindowBuilderModalProps> = ({
  isOpen,
  selectedProductId,
  onClose,
  onAddItem,
  editingItem,
}) => {
  const {
    state,
    setState,
    errors,
    currentStep,
    isMobileCadExpanded,
    setIsMobileCadExpanded,
    svgTemplate,
    supportedDirections,
    dynamicAluminumColors,
    dynamicGlassFinishes,
    glasses,
    profiles,
    hardwares,
    films,
    holeDistanceInputs,
    itemSubtotalEstimate,
    svgW,
    svgH,
    unitAreaM2,
    totalQty,
    handleMaterialChange,
    handleMaterialQtyChange,
    handleAddMaterial,
    handleRemoveMaterial,
    handleHandleTypeChange,
    handleHandleSideChange,
    handleHandleCoverageChange,
    handleHandlePieceLengthChange,
    handleHoleCountChange,
    handleDivisionTypeChange,
    handleSingleHoleDistanceChange,
    handleNextStep,
    handlePrevStep,
    handleGoToStep,
    handleSubmit,
  } = useWindowBuilderState({
    isOpen,
    selectedProductId,
    editingItem,
    onAddItem,
    onClose,
  });

  // Bloqueio de scroll e tecla ESC para fechar
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-xs sm:p-md bg-black/75 backdrop-blur-sm animate-fadeIn">
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-transparent border-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />

      <div
        className="relative bg-surface border border-outline-variant rounded-xl w-full h-[96vh] sm:h-auto sm:max-h-[92vh] shadow-2xl flex flex-col overflow-hidden z-10"
        style={{ maxWidth: '1380px' }}
        aria-modal="true"
      >
        {/* ── Header do Modal ────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-sm sm:px-lg py-sm border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-xs sm:gap-sm flex-1 min-w-0">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-primary shrink-0">tune</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-xs flex-wrap">
                <h2 className="font-headline text-base sm:text-title-md font-bold text-on-surface truncate">
                  {state.template?.name ?? 'Configurar Esquadria'}
                </h2>
              </div>
              <p className="font-body text-[11px] sm:text-xs text-on-surface-variant truncate">
                Configure os insumos, medidas e parâmetros técnicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-xs shrink-0 ml-xs sm:ml-sm">
            <button
              type="button"
              onClick={onClose}
              className="p-1 sm:p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
              aria-label="Fechar"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">close</span>
            </button>
          </div>
        </header>

        {/* ── Stepper do Wizard (Totalmente Responsivo) ────────────────────── */}
        <WizardStepper currentStep={currentStep} onGoToStep={handleGoToStep} />

        {/* ── Corpo do Modal: Desktop (50/50 lado a lado) / Mobile (Stack Vertical inteligente) ── */}
        <main className="flex-1 overflow-y-auto p-sm sm:p-md lg:p-lg min-h-0 bg-surface">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md sm:gap-lg items-stretch">
            {/* Metade Esquerda: Gabarito CAD */}
            <CadPreviewPanel
              svgTemplate={svgTemplate}
              svgW={svgW}
              svgH={svgH}
              openingDirection={state.openingDirection}
              handleConfig={state.handleConfig}
              drillingConfig={state.drillingConfig}
              templateName={state.template?.name}
              aluminumColor={state.aluminumColor}
              glassFinish={state.glassFinish}
              unitAreaM2={unitAreaM2}
              totalQty={totalQty}
              currentStep={currentStep}
              isMobileCadExpanded={isMobileCadExpanded}
              onToggleMobileCad={() => setIsMobileCadExpanded((p) => !p)}
            />

            {/* Metade Direita: Conteúdo por Etapa do Wizard */}
            <div className="lg:col-span-6 flex flex-col gap-md">
              {currentStep === 1 && (
                <Step1Dimensions
                  widthMm={state.widthMm}
                  heightMm={state.heightMm}
                  quantity={state.quantity}
                  errors={errors}
                  unitAreaM2={unitAreaM2}
                  totalQty={totalQty}
                  onWidthChange={(w) => setState((p) => ({ ...p, widthMm: w }))}
                  onHeightChange={(h) => setState((p) => ({ ...p, heightMm: h }))}
                  onQuantityChange={(q) => setState((p) => ({ ...p, quantity: q as number }))}
                />
              )}

              {currentStep === 2 && (
                <Step2Materials
                  aluminumColor={state.aluminumColor}
                  glassFinish={state.glassFinish}
                  dynamicAluminumColors={dynamicAluminumColors}
                  dynamicGlassFinishes={dynamicGlassFinishes}
                  materialSelections={state.materialSelections}
                  glasses={glasses}
                  profiles={profiles}
                  hardwares={hardwares}
                  films={films}
                  categoryIcons={CATEGORY_ICONS}
                  onAluminumColorChange={(c) => setState((p) => ({ ...p, aluminumColor: c }))}
                  onGlassFinishChange={(g) => setState((p) => ({ ...p, glassFinish: g }))}
                  onAddMaterial={handleAddMaterial}
                  onRemoveMaterial={handleRemoveMaterial}
                  onMaterialChange={handleMaterialChange}
                  onMaterialQtyChange={handleMaterialQtyChange}
                />
              )}

              {currentStep === 3 && (
                <Step3Mechanics
                  openingDirection={state.openingDirection}
                  supportedDirections={supportedDirections}
                  handleConfig={state.handleConfig}
                  drillingConfig={state.drillingConfig}
                  holeDistanceInputs={holeDistanceInputs}
                  heightMm={state.heightMm}
                  notes={state.notes ?? ''}
                  defaultHeight={DEFAULT_HEIGHT}
                  onOpeningDirectionChange={(d) => setState((p) => ({ ...p, openingDirection: d }))}
                  onHandleTypeChange={handleHandleTypeChange}
                  onHandleSideChange={handleHandleSideChange}
                  onHandleCoverageChange={handleHandleCoverageChange}
                  onHandlePieceLengthChange={handleHandlePieceLengthChange}
                  onHoleCountChange={handleHoleCountChange}
                  onDivisionTypeChange={handleDivisionTypeChange}
                  onSingleHoleDistanceChange={handleSingleHoleDistanceChange}
                  onNotesChange={(n) => setState((p) => ({ ...p, notes: n }))}
                />
              )}

              {currentStep === 4 && (
                <Step4Summary
                  state={state}
                  svgW={svgW}
                  svgH={svgH}
                  unitAreaM2={unitAreaM2}
                  totalQty={totalQty}
                />
              )}
            </div>
          </div>
        </main>

        {/* ── Footer Actions: Navegação do Wizard & Subtotal Único ──────────── */}
        <footer className="sticky bottom-0 z-20 flex items-center justify-between gap-xs sm:gap-sm px-sm sm:px-lg py-2.5 sm:py-md border-t border-outline-variant bg-surface-container-low flex-shrink-0 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-xs min-w-0">
            <span className="text-[11px] sm:text-sm font-label text-on-surface-variant font-medium leading-tight">Subtotal:</span>
            <div className="flex items-baseline gap-1">
              <span className="font-data-mono font-bold text-primary text-lg sm:text-2xl leading-none">
                {formatBRL(itemSubtotalEstimate)}
              </span>
              {totalQty > 1 && (
                <span className="text-[10px] sm:text-xs font-data-mono text-on-surface-variant">
                  ({totalQty}×)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-sm shrink-0">
            {currentStep > 1 ? (
              <Button variant="outline" icon="arrow_back" onClick={handlePrevStep} className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm">
                Voltar
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose} className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm">
                Cancelar
              </Button>
            )}

            {currentStep < 4 ? (
              <Button variant="primary" icon="arrow_forward" onClick={handleNextStep} className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
                Próximo
              </Button>
            ) : (
              <Button variant="primary" icon="check" onClick={handleSubmit} className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
                {editingItem ? 'Salvar' : 'Adicionar'}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
