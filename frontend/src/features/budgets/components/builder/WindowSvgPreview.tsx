import React, { useState } from 'react';
import { FullscreenPreviewModal } from './FullscreenPreviewModal';
import type {
  OpeningDirection,
  HandleConfig,
  DrillingConfig,
  DoorTemplateType,
} from '../../types';
import { getSvgTheme } from '../../utils/svgTheme';
import type { SvgTheme } from '../../utils/svgTheme';

import { FRAME_W } from './svg/svgConstants';

const DRILLING_POS_LABELS: Record<string, string> = {
  SUPERIOR: 'Borda Superior',
  FRONTAL: 'Frontal',
  LATERAL: 'Lateral',
};
import { SvgDefs } from './svg/SvgDefs';
import { HorizontalDimension, VerticalDimension } from './svg/SvgDimensions';
import {
  renderSlidingDoor1F,
  renderSlidingDoor2F,
  renderSlidingDoor3F,
  renderSlidingDoor4F,
} from './svg/renderers/SlidingDoorSvg';
import { renderSwingDoor } from './svg/renderers/PivotDoorSvg';
import {
  renderAwningWindow1F,
  renderDrawerFront,
  renderFixedFacade,
} from './svg/renderers/AwningAndPanelSvg';

export type { SvgTheme };

interface SvgRenderContext {
  readonly svgW: number;
  readonly svgH: number;
  readonly inverted: boolean;
  readonly handleConfig: HandleConfig;
  readonly drillingConfig: DrillingConfig;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly theme: SvgTheme;
}

type SvgTemplateRenderer = (ctx: SvgRenderContext) => React.ReactNode;

const SVG_RENDERERS: Record<DoorTemplateType, SvgTemplateRenderer> = {
  SLIDING_DOOR_1F: (ctx) => renderSlidingDoor1F(ctx),
  SLIDING_DOOR_2F: (ctx) => renderSlidingDoor2F(ctx),
  SLIDING_DOOR_3F: (ctx) => renderSlidingDoor3F(ctx),
  SLIDING_DOOR_4F: (ctx) => renderSlidingDoor4F(ctx),
  SWING_DOOR_1F: (ctx) => renderSwingDoor(1, ctx),
  SWING_DOOR_2F: (ctx) => renderSwingDoor(2, ctx),
  AWNING_WINDOW_1F: (ctx) =>
    renderAwningWindow1F(ctx.svgW, ctx.svgH, false, ctx.handleConfig, ctx.drillingConfig, ctx.heightMm, ctx.theme),
  AWNING_WINDOW_1F_INV: (ctx) =>
    renderAwningWindow1F(ctx.svgW, ctx.svgH, true, ctx.handleConfig, ctx.drillingConfig, ctx.heightMm, ctx.theme),
  FRONT_DRAWER: (ctx) =>
    renderDrawerFront(ctx.svgW, ctx.svgH, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  FIXED_PANEL: (ctx) =>
    renderFixedFacade(ctx.svgW, ctx.svgH, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
};

export interface WindowSvgPreviewProps {
  readonly templateType: string;
  readonly widthMm?: number;
  readonly heightMm?: number;
  readonly openingDirection?: OpeningDirection;
  readonly handleConfig?: HandleConfig;
  readonly drillingConfig?: DrillingConfig;
  readonly templateName?: string;
  readonly aluminumColor?: string;
  readonly glassFinish?: string;
  readonly baseWidth?: string | number;
  readonly maxHeight?: string | number;
  readonly minimal?: boolean;
}

const WindowSvgPreviewComponent: React.FC<WindowSvgPreviewProps> = ({
  templateType,
  widthMm = 0,
  heightMm = 0,
  openingDirection = 'LEFT_TO_RIGHT',
  handleConfig = { handleType: 'BAR_TUBULAR', side: 'ONE_SIDE', pieceLengthCm: 40, coverage: 'PIECE' },
  drillingConfig = { holeCount: 2, divisionType: 'EQUAL' },
  templateName,
  aluminumColor,
  glassFinish,
  baseWidth = '100%',
  maxHeight = '100%',
  minimal = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = getSvgTheme(aluminumColor, glassFinish);

  // Margens internas para acomodar cotas externas sem cortar
  const MARGIN = 34;
  const SVG_W = 240;
  const ratio = Math.min(Math.max((widthMm || 1) / (heightMm || 1), 0.4), 2.0);
  const SVG_H = Math.round(SVG_W / ratio);
  const fw = FRAME_W;
  const VB_W = SVG_W + MARGIN * 2;
  const VB_H = SVG_H + MARGIN * 2;

  const inverted = openingDirection === 'RIGHT_TO_LEFT' || openingDirection === 'INSIDE';

  const renderContent = () => {
    const renderer = (SVG_RENDERERS as Record<string, SvgTemplateRenderer>)[templateType];
    return renderer ? renderer({ svgW: SVG_W, svgH: SVG_H, inverted, handleConfig, drillingConfig, widthMm, heightMm, theme }) : null;
  };

  const hasDimensions = widthMm > 0 && heightMm > 0;
  const captionText = `${templateName ?? 'Esquadria'} · ${aluminumColor ?? 'Alumínio'}`;

  const svgContent = (
    <svg
      viewBox={`${-MARGIN} ${-MARGIN} ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full max-w-full max-h-full"
      style={{ display: 'block' }}
      aria-label={`Preview da esquadria ${widthMm}×${heightMm}mm`}
    >
      <SvgDefs />

      {/* Caixilho externo com cor real do alumínio */}
      <rect
        x={0}
        y={0}
        width={SVG_W}
        height={SVG_H}
        rx={3}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={1.5}
        filter="url(#shadow)"
      />
      {/* Área interna com cor real do acabamento do vidro */}
      <rect x={fw} y={fw} width={SVG_W - fw * 2} height={SVG_H - fw * 2} fill={theme.glassFill} />

      {renderContent()}

      {/* Cotas externas principais */}
      {hasDimensions && (
        <>
          <HorizontalDimension
            x1={0}
            x2={SVG_W}
            y={0}
            label={`L: ${widthMm} mm`}
            offsetDir="above"
            offsetDist={14}
          />
          <VerticalDimension
            x={0}
            y1={0}
            y2={SVG_H}
            label={`A: ${heightMm} mm`}
            offsetDir="left"
            offsetDist={14}
          />
        </>
      )}
    </svg>
  );

  const legend = (
    <>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: theme.glassFill, border: `1px solid ${theme.glassStroke}` }} />
        <span>Móvel</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: theme.fixedGlassFill, border: `1px solid ${theme.glassStroke}` }} />
        <span>Fixo</span>
      </span>
      {handleConfig.handleType !== 'NONE' && (
        <span className="flex items-center gap-1 text-primary">
          <span className="material-symbols-outlined text-[14px]">hardware</span>
          <span>{handleConfig.side === 'BOTH_SIDES' ? 'Puxador 2 Lados' : 'Puxador 1 Lado'}</span>
        </span>
      )}
      {drillingConfig.holeCount > 0 && (
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-on-surface" />
          <span>{drillingConfig.holeCount} Furo{drillingConfig.holeCount > 1 ? 's' : ''}</span>
          {drillingConfig.drillingPosition &&
            <span>{` (${DRILLING_POS_LABELS[drillingConfig.drillingPosition] || 'Lateral'})`}</span>}
        </span>
      )}
    </>
  );

  if (minimal) {
    return (
      <div style={{ maxWidth: baseWidth, maxHeight }} className="w-full h-full flex items-center justify-center pointer-events-none">
        {svgContent}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-xs w-full max-h-full relative group">
      <button
        type="button"
        onClick={() => setIsFullscreen(true)}
        className="absolute top-0 right-0 p-1 bg-surface-container border border-outline-variant rounded-bl text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
        title="Abrir em tela cheia"
      >
        <span className="material-symbols-outlined text-[18px]">fullscreen</span>
      </button>

      <div style={{ maxWidth: baseWidth, maxHeight }} className="w-full flex justify-center">
        {svgContent}
      </div>

      <p className="text-xs font-body text-on-surface-variant text-center opacity-85 truncate max-w-full">
        {captionText}
      </p>

      <div className="flex items-center gap-sm text-xs font-data-mono text-on-surface-variant flex-wrap justify-center">
        {legend}
      </div>

      <FullscreenPreviewModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={captionText}
        legend={legend}
      >
        {svgContent}
      </FullscreenPreviewModal>
    </div>
  );
};

export const WindowSvgPreview = React.memo(WindowSvgPreviewComponent);
WindowSvgPreview.displayName = 'WindowSvgPreview';
