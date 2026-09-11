import React from 'react';
import { WindowSvgPreview } from './WindowSvgPreview';
import type { DoorTemplateType, HandleConfig, DrillingConfig, OpeningDirection, MaterialSelection } from '../../types';

export interface CadPreviewPanelProps {
  svgTemplate: DoorTemplateType;
  svgW: number;
  svgH: number;
  openingDirection: OpeningDirection;
  handleConfig: HandleConfig;
  handleMaterial?: MaterialSelection | null;
  drillingConfig: DrillingConfig;
  templateName?: string;
  aluminumColor?: string;
  glassFinish?: string;
  unitAreaM2: string;
  totalQty: number;
  currentStep: 1 | 2 | 3 | 4;
  isMobileCadExpanded: boolean;
  onToggleMobileCad: () => void;
}

export const CadPreviewPanel: React.FC<CadPreviewPanelProps> = ({
  svgTemplate,
  svgW,
  svgH,
  openingDirection,
  handleConfig,
  handleMaterial,
  drillingConfig,
  templateName,
  aluminumColor,
  glassFinish,
  unitAreaM2,
  totalQty,
  currentStep,
  isMobileCadExpanded,
  onToggleMobileCad,
}) => {
  return (
    <div className="lg:col-span-6 flex flex-col gap-sm">
      {/* Botão de Toggle do CAD em Telas Pequenas (Mobile) */}
      <div className="lg:hidden bg-surface-container-low border border-outline-variant rounded-lg p-2 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={onToggleMobileCad}
          className="flex items-center gap-2 text-xs font-label font-bold text-on-surface hover:text-primary transition-colors focus:outline-none w-full justify-between"
          aria-expanded={isMobileCadExpanded}
          aria-label="Alternar visualização do gabarito CAD"
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">architecture</span>
            <span>Gabarito CAD ({svgW} × {svgH} mm)</span>
          </div>
          <div className="flex items-center gap-1 text-secondary font-data-mono">
            <span>{unitAreaM2} m²</span>
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                isMobileCadExpanded ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </div>
        </button>
      </div>

      {/* Card do CAD (Sempre visível no Desktop; no Mobile só aparece se expandido) */}
      <div
        className={`${
          isMobileCadExpanded ? 'flex' : 'hidden lg:flex'
        } bg-surface-container-lowest border border-outline-variant rounded-xl p-sm sm:p-md lg:p-lg shadow-sm flex-col gap-sm flex-1 min-h-[280px] sm:min-h-[380px] lg:min-h-[500px] transition-all`}
      >
        <div className="hidden lg:flex items-center justify-between pb-xs border-b border-outline-variant/50">
          <h3 className="text-sm font-label font-bold text-on-surface flex items-center gap-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[20px] text-primary">architecture</span>
            Gabarito Técnico CAD
          </h3>
          <div className="flex items-center gap-xs">
            <span className="text-xs font-data-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/30">
              {svgW} × {svgH} mm
            </span>
            <span className="text-xs font-data-mono text-secondary bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/60">
              {unitAreaM2} m²
            </span>
          </div>
        </div>

        {/* Container Principal do SVG com altura elástica */}
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[220px] sm:min-h-[300px] lg:min-h-[340px] p-xs sm:p-sm overflow-hidden bg-surface-container-lowest/50 rounded-lg">
          <WindowSvgPreview
            templateType={svgTemplate}
            widthMm={svgW}
            heightMm={svgH}
            openingDirection={openingDirection}
            handleConfig={handleConfig}
            handleMaterial={handleMaterial}
            drillingConfig={drillingConfig}
            templateName={templateName}
            aluminumColor={aluminumColor}
            glassFinish={glassFinish}
            baseWidth="100%"
            maxHeight={420}
          />
        </div>

        {/* Badge de Resumo Inferior */}
        <div className="flex items-center justify-between text-xs font-data-mono text-on-surface-variant bg-surface-container-low px-sm sm:px-md py-1.5 sm:py-2 rounded-lg border border-outline-variant/60">
          <span className="truncate max-w-[180px] sm:max-w-none">
            Modelo: <strong className="text-on-surface">{templateName ?? 'Base'}</strong>
          </span>
          <span>
            Qtd: <strong className="text-primary font-bold">{totalQty} {totalQty > 1 ? 'unidades' : 'un'}</strong>
          </span>
        </div>
      </div>

      {/* Dica da Etapa Atual (Desktop) */}
      <div className="hidden lg:flex bg-surface-container-low border border-outline-variant/60 rounded-lg p-sm items-start gap-xs text-xs font-body text-on-surface-variant shrink-0">
        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">info</span>
        <div>
          {currentStep === 1 && <p>Defina as dimensões e quantidade para calcularmos os insumos exatos do vão.</p>}
          {currentStep === 2 && <p>Confirme os materiais (vidro, perfis, ferragens) e seus acabamentos estéticos.</p>}
          {currentStep === 3 && <p>Configure os sentidos de abertura, modelo do puxador e parâmetros de furação.</p>}
          {currentStep === 4 && <p>Revise a ficha técnica completa antes de adicionar ao orçamento.</p>}
        </div>
      </div>
    </div>
  );
};
