import React, { useState } from 'react';
import { FullscreenPreviewModal } from './FullscreenPreviewModal';
import { HANDLE_POSITION_LABELS } from '../../types';
import type {
  OpeningDirection,
  HandleConfig,
  HandlePosition,
  HandleSide,
  HandleCoverage,
  HandleType,
  DrillingConfig,
  DoorTemplateType,
  MaterialSelection,
  HandleOrientation,
} from '../../types';
import { CadHandleRenderer, type LeafBounds } from './CadHandleRenderer';


import { getSvgTheme } from '../../utils/svgTheme';
import type { SvgTheme } from '../../utils/svgTheme';

export type { SvgTheme };

// ─── Constantes visuais Blueprint / CAD ─────────────────────────────────────
const HOLE_COLOR        = '#ffffff';
const HOLE_STROKE       = '#374151';
const ARROW_COLOR       = '#0284c7';
const COTA_COLOR        = '#0369a1';
const COTA_STROKE       = '#0284c7';
const FRAME_W           = 10; // espessura do caixilho em unidades SVG
const RAIL_H            = 8;  // altura do trilho

// ─── Componentes SVG auxiliares ────────────────────────────────────────────

/** Arco de abertura (swing door) */
const SwingArc = ({
  x, y, radius, startAngle, endAngle, color = ARROW_COLOR,
}: {
  x: number; y: number; radius: number;
  startAngle: number; endAngle: number; color?: string;
}) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = x + radius * Math.cos(toRad(startAngle));
  const y1 = y + radius * Math.sin(toRad(startAngle));
  const x2 = x + radius * Math.cos(toRad(endAngle));
  const y2 = y + radius * Math.sin(toRad(endAngle));
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return (
    <path
      d={`M ${x} ${y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
      fill="none"
      stroke={color}
      strokeWidth={1.2}
      strokeDasharray="3 2"
      opacity={0.7}
    />
  );
};

/**
 * Cota horizontal com linhas de extensão, setas de CAD e label mm.
 * offsetDir 'above' = acima; 'below' = abaixo.
 */
const HorizontalDimension = ({
  x1, x2, y, label, offsetDir = 'above', offsetDist = 12,
}: {
  x1: number; x2: number; y: number; label: string; offsetDir?: 'above' | 'below'; offsetDist?: number;
}) => {
  const sign   = offsetDir === 'above' ? -1 : 1;
  const lineY  = y + sign * offsetDist;
  const tickH  = 4;
  const mid    = (x1 + x2) / 2;
  return (
    <g className="dimension-horizontal">
      <line x1={x1} y1={y} x2={x1} y2={lineY + sign * 2} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      <line x1={x2} y1={y} x2={x2} y2={lineY + sign * 2} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      <line x1={x1} y1={lineY} x2={x2} y2={lineY} stroke={COTA_STROKE} strokeWidth={0.7} opacity={0.9} />
      <polygon points={`${x1},${lineY} ${x1 + tickH},${lineY - 2} ${x1 + tickH},${lineY + 2}`} fill={COTA_STROKE} opacity={0.9} />
      <polygon points={`${x2},${lineY} ${x2 - tickH},${lineY - 2} ${x2 - tickH},${lineY + 2}`} fill={COTA_STROKE} opacity={0.9} />
      <rect
        x={mid - (label.length * 3.5)}
        y={lineY - 5}
        width={label.length * 7}
        height={10}
        fill="#ffffff"
        opacity={0.85}
        rx={1.5}
      />
      <text
        x={mid}
        y={lineY + 3.5}
        textAnchor="middle"
        fontSize={12}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
        fill={COTA_COLOR}
        opacity={0.95}
      >
        {label}
      </text>
    </g>
  );
};

/**
 * Cota vertical com linhas de extensão, setas de CAD e label mm rotacionado.
 */
const VerticalDimension = ({
  x, y1, y2, label, offsetDir = 'left', offsetDist = 12,
}: {
  x: number; y1: number; y2: number; label: string; offsetDir?: 'left' | 'right'; offsetDist?: number;
}) => {
  const sign  = offsetDir === 'left' ? -1 : 1;
  const lineX = x + sign * offsetDist;
  const tickH = 4;
  const mid   = (y1 + y2) / 2;
  return (
    <g className="dimension-vertical">
      <line x1={x} y1={y1} x2={lineX + sign * 2} y2={y1} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      <line x1={x} y1={y2} x2={lineX + sign * 2} y2={y2} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      <line x1={lineX} y1={y1} x2={lineX} y2={y2} stroke={COTA_STROKE} strokeWidth={0.7} opacity={0.9} />
      <polygon points={`${lineX},${y1} ${lineX - 2},${y1 + tickH} ${lineX + 2},${y1 + tickH}`} fill={COTA_STROKE} opacity={0.9} />
      <polygon points={`${lineX},${y2} ${lineX - 2},${y2 - tickH} ${lineX + 2},${y2 - tickH}`} fill={COTA_STROKE} opacity={0.9} />
      <g transform={`rotate(-90, ${lineX}, ${mid})`}>
        <rect
          x={lineX - (label.length * 3.5)}
          y={mid - 5}
          width={label.length * 7}
          height={10}
          fill="#ffffff"
          opacity={0.85}
          rx={1.5}
        />
        <text
          x={lineX}
          y={mid + 3.5}
          textAnchor="middle"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
          fill={COTA_COLOR}
          opacity={0.95}
        >
          {label}
        </text>
      </g>
    </g>
  );
};

/** Furos renderizados na borda com cotas técnicas de distâncias em mm */
const DrillingHoles = ({
  svgH, svgW = 400, frameW, count, divisionType, customDistancesMm, heightMm, posX,
}: {
  svgH: number; svgW?: number; frameW: number;
  count: number; divisionType: string;
  customDistancesMm?: number[];
  heightMm: number; posX: number; mirrored?: boolean;
}) => {
  if (count <= 0) return null;

  const innerH = svgH - frameW * 2;
  const holeR  = Math.min(3.5, innerH / (count * 4));

  interface HolePosition { py: number; distMm: number; }
  const positions: HolePosition[] = [];

  if (divisionType === 'EQUAL') {
    const stepPx = innerH / (count + 1);
    const stepMm = Math.round(heightMm / (count + 1));
    for (let i = 1; i <= count; i++) {
      positions.push({ py: frameW + stepPx * i, distMm: Math.round(stepMm * i) });
    }
  } else if (divisionType === 'CUSTOM_DISTANCE' && customDistancesMm?.length) {
    const scale = innerH / Math.max(heightMm, 1);
    customDistancesMm.forEach((d) => {
      const y = frameW + d * scale;
      if (y >= frameW && y <= svgH - frameW) positions.push({ py: y, distMm: d });
    });
  } else {
    const stepPx = innerH / (count + 1);
    const stepMm = Math.round(heightMm / (count + 1));
    for (let i = 1; i <= count; i++) {
      positions.push({ py: frameW + stepPx * i, distMm: Math.round(stepMm * i) });
    }
  }

  const isLeftSide = posX < (svgW ? svgW / 2 : 200);
  const cotaOffset = isLeftSide ? 14 : -14;
  const textAnchor = isLeftSide ? 'start' : 'end';

  return (
    <g className="drilling-holes-layer">
      {positions.map((pos) => {
        const textX = posX + cotaOffset + (isLeftSide ? 2 : -2);
        const textStr = `${pos.distMm}mm`;
        const badgeWidth = textStr.length * 6.5 + 4;
        const badgeX = isLeftSide ? textX - 2 : textX - badgeWidth + 2;

        return (
          <g key={`hole-${pos.py}-${pos.distMm}`}>
            <circle cx={posX} cy={pos.py} r={holeR + 1} fill="#1e293b" />
            <circle cx={posX} cy={pos.py} r={holeR}     fill={HOLE_COLOR}   stroke={HOLE_STROKE} strokeWidth={0.6} />
            <line x1={posX - holeR * 0.7} y1={pos.py} x2={posX + holeR * 0.7} y2={pos.py} stroke={HOLE_STROKE} strokeWidth={0.4} />
            <line x1={posX} y1={pos.py - holeR * 0.7}  x2={posX} y2={pos.py + holeR * 0.7}  stroke={HOLE_STROKE} strokeWidth={0.4} />
            <line x1={posX} y1={pos.py} x2={posX + cotaOffset} y2={pos.py} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" opacity={0.8} />
            <rect
              x={badgeX}
              y={pos.py - 6.5}
              width={badgeWidth}
              height={12}
              fill="#ffffff"
              fillOpacity={0.9}
              rx={2}
            />
            <text
              x={textX}
              y={pos.py + 3}
              textAnchor={textAnchor}
              fontSize={10.5}
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
              fill={COTA_COLOR}
            >
              {textStr}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export interface ResolvedHandleInfo {
  handleType: HandleType;
  position: HandlePosition;
  orientation?: HandleOrientation;
  side: HandleSide;
  coverage: HandleCoverage;
  pieceLengthMm: number;
  label: string;
}

/** Resolve tipo de puxador, dimensões e lado a partir da config técnica do Step 3 e do material */
function resolveHandleInfo(
  handleConfig?: HandleConfig,
  handleMaterial?: MaterialSelection | null,
  heightMm: number = 2100,
  defaultPosition: HandlePosition = 'RIGHT',
): ResolvedHandleInfo {
  const safeHeight = typeof heightMm === 'number' && heightMm > 0 ? heightMm : 2100;
  const side: HandleSide = handleConfig?.side ?? 'ONE_SIDE';
  const position: HandlePosition = handleConfig?.position ?? defaultPosition;
  const orientation = handleConfig?.orientation;
  const handleType: HandleType = handleConfig?.handleType ?? 'BAR_TUBULAR';

  // Se o tipo for explicitamente 'NONE' ou se a quantidade do insumo foi zerada
  if (handleType === 'NONE' || (handleMaterial !== undefined && handleMaterial !== null && handleMaterial.quantity !== undefined && handleMaterial.quantity <= 0)) {
    return {
      handleType: 'NONE',
      position,
      orientation,
      side,
      coverage: 'FULL',
      pieceLengthMm: safeHeight,
      label: 'Sem Puxador',
    };
  }

  // Cobertura e comprimento em mm
  const isLinear = handleType === 'PROFILE_HANDLE' || handleType === 'BAR_TUBULAR';
  const coverage: HandleCoverage = isLinear ? (handleConfig?.coverage ?? 'FULL') : 'FULL';

  let pieceLengthMm = safeHeight;
  if (isLinear && coverage === 'PIECE') {
    if (handleConfig?.pieceLengthCm) {
      pieceLengthMm = handleConfig.pieceLengthCm * 10;
    } else {
      pieceLengthMm = 400; // fallback padrão de 40cm
    }
  }

  let typeName = 'Puxador';
  if (handleType === 'PROFILE_HANDLE') typeName = 'Puxador Perfil';
  else if (handleType === 'SHELL_LOCK') typeName = 'Fecho Concha';
  else if (handleType === 'LEVER_HANDLE') typeName = 'Maçaneta';
  else if (handleType === 'BAR_TUBULAR') typeName = 'Puxador Tubular';

  const dimLabel = isLinear
    ? (coverage === 'FULL' ? '(Total)' : `(${pieceLengthMm}mm)`)
    : '';

  return {
    handleType,
    position,
    orientation,
    side,
    coverage,
    pieceLengthMm,
    label: `${typeName} ${dimLabel}`.trim(),
  };
}

// ─── Renderers por Tipo de Template com Tema Dinâmico ─────────────────────────

function renderSlidingDoor2F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const halfW  = innerW / 2;

  const fixedX  = inverted ? fw + halfW : fw;
  const mobileX = inverted ? fw : fw + halfW;
  const railY1  = fw;
  const railY2  = svgH - fw - RAIL_H;

  const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;
  const drillingPosX  = inverted ? fixedX + halfW - fw : fixedX + fw / 2;
  const leafWidthMm = Math.round(widthMm / 2);

  const mobileBounds: LeafBounds = {
    x: mobileX,
    y: fw,
    width: halfW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {/* Folha fixa */}
      <rect x={fixedX}  y={fw} width={halfW} height={innerH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
      <text x={fixedX + halfW / 2}  y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>FIXA</text>

      {/* Folha móvel */}
      <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={mobileX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL</text>

      {/* Divisória central */}
      <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.8} />

      {/* Puxador Declarativo */}
      <CadHandleRenderer
        leafBounds={mobileBounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      {/* Furação */}
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={drillingPosX} mirrored={!inverted} />

      {/* Seta de abertura */}
      <text x={mobileX + halfW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={16.5} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? '← Correr' : 'Correr →'}
      </text>

      {/* Cotas individuais das 2 folhas */}
      <HorizontalDimension x1={fixedX}  x2={fixedX + halfW}  y={svgH - fw - RAIL_H - 1} label={`F: ${leafWidthMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={mobileX} x2={mobileX + halfW} y={fw + RAIL_H + 1}         label={`M: ${leafWidthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

function renderSlidingDoor1F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;

  const leafBounds: LeafBounds = {
    x: fw,
    y: fw,
    width: innerW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {/* Folha móvel única */}
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={fw + innerW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL</text>

      <CadHandleRenderer
        leafBounds={leafBounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      {drillingConfig.holeCount > 0 && <DrillingHoles svgH={svgH} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + innerW / 2} />}
      <text x={fw + innerW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
    </>
  );
}

function renderSlidingDoor3F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const thirdW = innerW / 3;

  const fixedX   = inverted ? fw + thirdW * 2 : fw;
  const mobile1X = fw + thirdW;
  const mobile2X = inverted ? fw : fw + thirdW * 2;

  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;

  const mobile2Bounds: LeafBounds = {
    x: mobile2X,
    y: fw,
    width: thirdW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {/* Folha fixa */}
      <rect x={fixedX} y={fw} width={thirdW} height={innerH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
      <text x={fixedX + thirdW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>FIXA</text>

      {/* Folha móvel 1 */}
      <rect x={mobile1X} y={fw} width={thirdW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={mobile1X + thirdW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL 1</text>

      {/* Folha móvel 2 */}
      <rect x={mobile2X} y={fw} width={thirdW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={mobile2X + thirdW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL 2</text>

      <rect x={fw + thirdW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.8} />
      <rect x={fw + thirdW * 2 - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.8} />

      <CadHandleRenderer
        leafBounds={mobile2Bounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      {drillingConfig.holeCount > 0 && <DrillingHoles svgH={svgH} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fixedX + thirdW / 2} />}
      <text x={mobile1X + thirdW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
      <text x={mobile2X + thirdW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
    </>
  );
}

function renderSlidingDoor4F(
  svgW: number, svgH: number,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const qW     = innerW / 4;
  const xs     = [fw, fw + qW, fw + qW * 2, fw + qW * 3];
  const isFixed = [true, false, false, true];
  const leafMm  = Math.round(widthMm / 4);

  const leftMobileBounds: LeafBounds = { x: fw + qW, y: fw, width: qW, height: innerH };
  const rightMobileBounds: LeafBounds = { x: fw + qW * 2, y: fw, width: qW, height: innerH };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={fw} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={svgH - fw - RAIL_H} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {xs.map((x, i) => (
        <g key={`leaf-panel-${x}`}>
          <rect x={x} y={fw} width={qW} height={innerH} fill={isFixed[i] ? theme.fixedGlassFill : theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
          <text x={x + qW / 2} y={svgH / 2} textAnchor="middle" fontSize={10.5} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.4}>
            {isFixed[i] ? 'F' : 'M'}
          </text>
          {i < 3 && <rect x={x + qW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.7} />}
        </g>
      ))}

      {/* Puxadores no encontro central das duas folhas móveis */}
      <CadHandleRenderer
        leafBounds={leftMobileBounds}
        position="RIGHT"
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />
      <CadHandleRenderer
        leafBounds={rightMobileBounds}
        position="LEFT"
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + fw / 2} mirrored />
      <text x={svgW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={13.5} fill={ARROW_COLOR} fontWeight="bold">← Abertura Central →</text>

      {xs.map((x) => (
        <HorizontalDimension key={`leaf-dim-${x}`} x1={x} x2={x + qW} y={fw + RAIL_H + 1} label={`${leafMm}mm`} offsetDir="below" offsetDist={6} />
      ))}
    </>
  );
}

function renderSwingDoor(
  svgW: number, svgH: number, leafCount: 1 | 2, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  if (leafCount === 1) {
    const hingeSide = inverted ? fw + innerW : fw;
    const arcRadius = innerW;
    const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
    const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;

    const doorBounds: LeafBounds = {
      x: fw,
      y: fw,
      width: innerW,
      height: innerH,
    };

    return (
      <>
        <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
        <line x1={hingeSide} y1={fw} x2={hingeSide} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
        <SwingArc x={hingeSide} y={svgH - fw} radius={arcRadius} startAngle={-90} endAngle={inverted ? -180 : 0} />
        
        <CadHandleRenderer
          leafBounds={doorBounds}
          position={pos}
          orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
          handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
          coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
          pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
          heightMm={heightMm}
          widthMm={widthMm}
          side={resolvedHandle?.side ?? handleConfig.side}
          theme={theme}
        />

        {/* Furação no lado oposto do puxador */}
        <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={pos === 'RIGHT' ? fw + fw / 2 : svgW - fw - fw / 2} mirrored={pos === 'LEFT'} />
        <text x={svgW / 2} y={fw + 14} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={ARROW_COLOR}>{inverted ? '← Giro p/ Esquerda' : 'Giro p/ Direita →'}</text>
        <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Vão Único: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
      </>
    );
  }

  const halfW = innerW / 2;
  const leafMm = Math.round(widthMm / 2);
  const leftLeafBounds: LeafBounds = { x: fw, y: fw, width: halfW, height: innerH };
  const rightLeafBounds: LeafBounds = { x: fw + halfW, y: fw, width: halfW, height: innerH };

  return (
    <>
      <rect x={fw}         y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + halfW} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <line x1={fw}        y1={fw} x2={fw}        y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <SwingArc x={fw}        y={svgH - fw} radius={halfW} startAngle={-90} endAngle={0} />
      <SwingArc x={svgW - fw} y={svgH - fw} radius={halfW} startAngle={-90} endAngle={-180} />
      
      {/* Puxadores no encontro central das duas folhas */}
      <CadHandleRenderer
        leafBounds={leftLeafBounds}
        position="RIGHT"
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />
      <CadHandleRenderer
        leafBounds={rightLeafBounds}
        position="LEFT"
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + fw / 2} mirrored />
      <HorizontalDimension x1={fw} x2={fw + halfW} y={fw} label={`F1: ${leafMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={fw + halfW} x2={svgW - fw} y={svgH - fw} label={`F2: ${leafMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

function renderAwningWindow1F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  // Posição de instalação (Inferior, Superior, Direita, Esquerda ou Centro)
  const defaultPos: HandlePosition = inverted ? 'TOP' : 'BOTTOM';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultPos;

  let labelText = inverted ? '⤓ Tombar p/ Dentro' : '↓ Projeção p/ Fora';
  if (pos === 'TOP') labelText = inverted ? '⤓ Tombar p/ Dentro (Superior)' : '↑ Projeção p/ Fora (Superior)';
  else if (pos === 'BOTTOM') labelText = inverted ? '↥ Tombar p/ Dentro (Inferior)' : '↓ Projeção p/ Fora (Inferior)';
  else if (pos === 'RIGHT') labelText = inverted ? '↶ Abrir p/ Dentro (Direita)' : '→ Projeção Direita';
  else if (pos === 'LEFT') labelText = inverted ? '↷ Abrir p/ Dentro (Esquerda)' : '← Projeção Esquerda';
  else if (pos === 'CENTER') labelText = inverted ? 'Tombar p/ Dentro' : 'Projeção p/ Fora';

  const leafBounds: LeafBounds = {
    x: fw,
    y: fw,
    width: innerW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={svgW / 2} y={svgH / 2 + 4} textAnchor="middle" fontSize={13} fill={ARROW_COLOR} fontWeight="bold">
        {labelText}
      </text>

      {/* Linha tracejada indicando o eixo de articulação no lado oposto ao puxador */}
      {pos === 'LEFT' && (
        <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}
      {pos === 'RIGHT' && (
        <line x1={fw} y1={fw} x2={fw} y2={svgH - fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}
      {pos === 'TOP' && (
        <line x1={fw} y1={svgH - fw} x2={svgW - fw} y2={svgH - fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}
      {(pos === 'BOTTOM' || pos === 'CENTER') && (
        <line x1={fw} y1={fw} x2={svgW - fw} y2={fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}

      {/* Puxador / Fecho renderizado via CadHandleRenderer (suporta deitado/horizontal ou em pé/vertical) */}
      <CadHandleRenderer
        leafBounds={leafBounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      {/* Furação da Esquadria posicionada no lado oposto do puxador quando vertical */}
      <DrillingHoles
        svgH={svgH}
        svgW={svgW}
        frameW={fw}
        count={drillingConfig.holeCount}
        divisionType={drillingConfig.divisionType}
        customDistancesMm={drillingConfig.customDistancesMm}
        heightMm={heightMm}
        posX={pos === 'RIGHT' ? fw + fw * 0.5 : svgW - fw - fw * 0.5}
        mirrored={pos === 'LEFT'}
      />
    </>
  );
}

function renderDrawerFront(
  svgW: number, svgH: number,
  handleConfig: HandleConfig, _drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? 'CENTER';

  const leafBounds: LeafBounds = {
    x: fw,
    y: fw,
    width: innerW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + 6} y={fw + 6} width={innerW - 12} height={innerH - 12} fill="none" stroke={theme.frameStroke} strokeWidth={1} opacity={0.6} strokeDasharray="3 2" />

      <CadHandleRenderer
        leafBounds={leafBounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      <text x={svgW / 2} y={svgH - fw - 12} textAnchor="middle" fontSize={14} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.6} fontWeight="bold">
        FRENTE DE GAVETA
      </text>
      <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Gaveta: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

function renderFixedFacade(svgW: number, svgH: number, theme: SvgTheme) {
  const fw        = FRAME_W;
  const innerW    = svgW - fw * 2;
  const innerH    = svgH - fw * 2;
  const panelOffsets = [0, 1, 2] as const;
  const panelW    = innerW / panelOffsets.length;

  return (
    <>
      {panelOffsets.map((panelIndex) => {
        const px = fw + panelIndex * panelW;
        return (
          <g key={`facade-panel-${px}`}>
            <rect x={px} y={fw} width={panelW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
            {panelIndex > 0 && <rect x={px - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} />}
          </g>
        );
      })}
    </>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────

interface SvgRenderContext {
  svgW: number;
  svgH: number;
  inverted: boolean;
  handleConfig: HandleConfig;
  resolvedHandle: ResolvedHandleInfo;
  drillingConfig: DrillingConfig;
  widthMm: number;
  heightMm: number;
  theme: SvgTheme;
}

type SvgTemplateRenderer = (ctx: SvgRenderContext) => React.ReactNode;

const SVG_RENDERERS: Record<DoorTemplateType, SvgTemplateRenderer> = {
  SLIDING_DOOR_1F: (ctx) => renderSlidingDoor1F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SLIDING_DOOR_2F: (ctx) => renderSlidingDoor2F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SLIDING_DOOR_3F: (ctx) => renderSlidingDoor3F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SLIDING_DOOR_4F: (ctx) => renderSlidingDoor4F(ctx.svgW, ctx.svgH, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SWING_DOOR_1F: (ctx) => renderSwingDoor(ctx.svgW, ctx.svgH, 1, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  SWING_DOOR_2F: (ctx) => renderSwingDoor(ctx.svgW, ctx.svgH, 2, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  AWNING_WINDOW_1F: (ctx) => renderAwningWindow1F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  AWNING_WINDOW_1F_INV: (ctx) => renderAwningWindow1F(ctx.svgW, ctx.svgH, true, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  FRONT_DRAWER: (ctx) => renderDrawerFront(ctx.svgW, ctx.svgH, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme, ctx.resolvedHandle),
  FIXED_PANEL: (ctx) => renderFixedFacade(ctx.svgW, ctx.svgH, ctx.theme),
};

export interface WindowSvgPreviewProps {
  templateType: string;
  widthMm?: number;
  heightMm?: number;
  openingDirection?: OpeningDirection;
  handleConfig?: HandleConfig;
  handleMaterial?: MaterialSelection | null;
  drillingConfig?: DrillingConfig;
  templateName?: string;
  aluminumColor?: string;
  glassFinish?: string;
  baseWidth?: string | number;
  maxHeight?: string | number;
}

export const WindowSvgPreview: React.FC<WindowSvgPreviewProps> = ({
  templateType,
  widthMm = 0,
  heightMm = 0,
  openingDirection = 'LEFT_TO_RIGHT',
  handleConfig = { handleType: 'BAR_TUBULAR', side: 'ONE_SIDE', pieceLengthCm: 40, coverage: 'PIECE' },
  handleMaterial,
  drillingConfig = { holeCount: 2, divisionType: 'EQUAL' },
  templateName,
  aluminumColor,
  glassFinish,
  baseWidth = '100%',
  maxHeight = '100%',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = getSvgTheme(aluminumColor, glassFinish);
  const resolvedHandle = resolveHandleInfo(handleConfig, handleMaterial, heightMm);

  // Margens internas para acomodar cotas externas sem cortar
  const MARGIN  = 26;
  const SVG_W   = 240;
  const ratio   = Math.min(Math.max((widthMm || 1) / (heightMm || 1), 0.4), 2.0);
  const SVG_H   = Math.round(SVG_W / ratio);
  const fw      = FRAME_W;
  const VB_W    = SVG_W + MARGIN * 2;
  const VB_H    = SVG_H + MARGIN * 2;

  const inverted = openingDirection === 'RIGHT_TO_LEFT' || openingDirection === 'INSIDE';

  const renderContent = () => {
    const renderer = (SVG_RENDERERS as Record<string, SvgTemplateRenderer>)[templateType];
    return renderer
      ? renderer({
          svgW: SVG_W,
          svgH: SVG_H,
          inverted,
          handleConfig,
          resolvedHandle,
          drillingConfig,
          widthMm,
          heightMm,
          theme,
        })
      : null;
  };

  const hasDimensions = widthMm > 0 && heightMm > 0;
  const captionText = `${templateName ?? 'Esquadria'} · ${aluminumColor ?? 'Alumínio'}`;

  const svgContent = (
    <svg
      width="100%"
      viewBox={`${-MARGIN} ${-MARGIN} ${VB_W} ${VB_H}`}
      aria-label={`Preview da esquadria ${widthMm}×${heightMm}mm`}
    >
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Caixilho externo com cor real do alumínio */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} rx={3} fill={theme.frameFill} stroke={theme.frameStroke} strokeWidth={1.5} filter="url(#shadow)" />
      {/* Área interna com cor real do acabamento do vidro */}
      <rect x={fw} y={fw} width={SVG_W - fw * 2} height={SVG_H - fw * 2} fill={theme.glassFill} />

      {renderContent()}

      {/* Cotas externas principais */}
      {hasDimensions && (
        <>
          <HorizontalDimension
            x1={0} x2={SVG_W}
            y={0}
            label={`L: ${widthMm} mm`}
            offsetDir="above"
            offsetDist={14}
          />
          <VerticalDimension
            x={drillingConfig.holeCount > 0 ? SVG_W : 0}
            y1={0} y2={SVG_H}
            label={`A: ${heightMm} mm`}
            offsetDir={drillingConfig.holeCount > 0 ? 'right' : 'left'}
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
        Móvel
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: theme.fixedGlassFill, border: `1px solid ${theme.glassStroke}` }} />
        Fixo
      </span>
      {resolvedHandle.handleType !== 'NONE' && (
        <span className="flex items-center gap-1 text-primary font-medium">
          <span className="material-symbols-outlined text-[14px]">hardware</span>
          {resolvedHandle.label} • {HANDLE_POSITION_LABELS[resolvedHandle.position] ?? resolvedHandle.position}
        </span>
      )}
      {drillingConfig.holeCount > 0 && (
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-on-surface" />
          {drillingConfig.holeCount} Furo{drillingConfig.holeCount > 1 ? 's' : ''}
        </span>
      )}
    </>
  );

  return (
    <div className="flex flex-col items-center gap-xs w-full max-h-full relative group">
      <button
        type="button"
        onClick={() => setIsFullscreen(true)}
        className="absolute top-0 right-0 p-1 bg-surface-container border border-outline-variant rounded-bl text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
