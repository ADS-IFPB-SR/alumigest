import React, { useState } from 'react';
import { FullscreenPreviewModal } from './FullscreenPreviewModal';
import type {
  OpeningDirection,
  HandleConfig,
  DrillingConfig,
  DoorTemplateType,
} from '../../types';

export interface WindowSvgPreviewProps {
  templateType: string;
  widthMm?: number;
  heightMm?: number;
  openingDirection?: OpeningDirection;
  handleConfig: HandleConfig;
  drillingConfig: DrillingConfig;
  templateName?: string;
  aluminumColor?: string;
  glassFinish?: string;
}

import { getSvgTheme } from '../../utils/svgTheme';
import type { SvgTheme } from '../../utils/svgTheme';

export type { SvgTheme };

// ─── Constantes visuais Blueprint / CAD ─────────────────────────────────────
const HANDLE_COLOR      = '#d1d5db';
const HANDLE_STROKE     = '#4b5563';
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
        x={mid - (label.length * 2.5)}
        y={lineY - 3.5}
        width={label.length * 5}
        height={7}
        fill="#ffffff"
        opacity={0.85}
        rx={1}
      />
      <text
        x={mid}
        y={lineY + 2}
        textAnchor="middle"
        fontSize={9}
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
          x={lineX - (label.length * 2.5)}
          y={mid - 3.5}
          width={label.length * 5}
          height={7}
          fill="#ffffff"
          opacity={0.85}
          rx={1}
        />
        <text
          x={lineX}
          y={mid + 2}
          textAnchor="middle"
          fontSize={9}
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
  svgH, frameW, count, divisionType, customDistancesMm, heightMm, posX, mirrored = false,
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

  const cotaOffset  = mirrored ? 14 : -14;
  const textAnchor  = mirrored ? 'start' : 'end';

  return (
    <g className="drilling-holes-layer">
      {positions.map((pos) => (
        <g key={`hole-${pos.py}-${pos.distMm}`}>
          <circle cx={posX} cy={pos.py} r={holeR + 1} fill="#1e293b" />
          <circle cx={posX} cy={pos.py} r={holeR}     fill={HOLE_COLOR}   stroke={HOLE_STROKE} strokeWidth={0.6} />
          <line x1={posX - holeR * 0.7} y1={pos.py} x2={posX + holeR * 0.7} y2={pos.py} stroke={HOLE_STROKE} strokeWidth={0.4} />
          <line x1={posX} y1={pos.py - holeR * 0.7}  x2={posX} y2={pos.py + holeR * 0.7}  stroke={HOLE_STROKE} strokeWidth={0.4} />
          <line x1={posX} y1={pos.py} x2={posX + cotaOffset} y2={pos.py} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" opacity={0.8} />
          <text
            x={posX + cotaOffset + (mirrored ? 2 : -2)}
            y={pos.py + 2.5}
            textAnchor={textAnchor}
            fontSize={8.2}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            fill={COTA_COLOR}
          >
            {pos.distMm}mm
          </text>
        </g>
      ))}
    </g>
  );
};

/** Puxador renderizado na folha móvel com suporte a 1 Lado ou 2 Lados (Ambos os Lados) */
const HandleElement = ({
  handleConfig, svgH, frameW, posX, mirrored = false, heightMm = 2100,
}: {
  handleConfig: HandleConfig; svgH: number; frameW: number; posX: number; mirrored?: boolean; heightMm?: number;
}) => {
  if (handleConfig.handleType === 'NONE') return null;

  const innerH  = svgH - frameW * 2;
  const handleW = 5;
  let handleH: number;
  let handleY: number;

  if (handleConfig.coverage === 'FULL') {
    handleH = innerH * 0.88;
    handleY = frameW + (innerH - handleH) / 2;
  } else if (handleConfig.coverage === 'PIECE' && handleConfig.pieceLengthCm) {
    const pieceLengthMm = handleConfig.pieceLengthCm * 10;
    const ratio = Math.min(Math.max(pieceLengthMm / Math.max(heightMm || 2100, 100), 0.05), 0.9);
    handleH = ratio * innerH;
    handleY = frameW + (innerH - handleH) / 2;
  } else if (handleConfig.handleType === 'SHELL_LOCK' || handleConfig.handleType === 'LEVER_HANDLE') {
    handleH = Math.min(20, innerH * 0.15);
    handleY = frameW + (innerH - handleH) / 2;
  } else {
    handleH = innerH * 0.25;
    handleY = frameW + (innerH - handleH) / 2;
  }

  const hx = mirrored ? posX - handleW : posX;
  const isBothSides = handleConfig.side === 'BOTH_SIDES';

  if (handleConfig.handleType === 'SHELL_LOCK') {
    const cy = handleY + handleH / 2;
    return (
      <g>
        <ellipse
          cx={hx + handleW / 2}
          cy={cy}
          rx={handleW / 2 + 1}
          ry={handleH / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={0.8}
        />
        {isBothSides && (
          <ellipse
            cx={mirrored ? hx + handleW + 3 : hx - 3}
            cy={cy}
            rx={handleW / 2 + 1}
            ry={handleH / 2}
            fill={HANDLE_COLOR}
            stroke={HANDLE_STROKE}
            strokeWidth={0.6}
            opacity={0.4}
            strokeDasharray="2 1"
          />
        )}
      </g>
    );
  }

  if (handleConfig.handleType === 'LEVER_HANDLE') {
    const hy  = handleY + handleH / 2;
    const dir = mirrored ? 1 : -1;
    return (
      <g>
        <rect x={hx} y={hy - handleW / 2} width={handleW} height={handleW} rx={1} fill={HANDLE_COLOR} stroke={HANDLE_STROKE} strokeWidth={0.8} />
        <line x1={hx + handleW / 2} y1={hy} x2={hx + handleW / 2 + dir * 8} y2={hy + 6} stroke={HANDLE_COLOR} strokeWidth={2} strokeLinecap="round" />
        {isBothSides && (
          <g opacity={0.4}>
            <line x1={hx + handleW / 2} y1={hy} x2={hx + handleW / 2 - dir * 8} y2={hy + 6} stroke={HANDLE_COLOR} strokeWidth={1.5} strokeDasharray="2 1" strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  }

  // BAR_TUBULAR — Puxador Frontal + Traseiro se Ambos os Lados
  return (
    <g>
      <rect x={hx} y={handleY} width={handleW} height={handleH} rx={handleW / 2} fill={HANDLE_COLOR} stroke={HANDLE_STROKE} strokeWidth={0.8} />
      {isBothSides && (
        <>
          <rect
            x={mirrored ? hx + handleW + 2 : hx - handleW - 2}
            y={handleY}
            width={handleW}
            height={handleH}
            rx={handleW / 2}
            fill={HANDLE_COLOR}
            stroke={HANDLE_STROKE}
            strokeWidth={0.8}
            opacity={0.4}
            strokeDasharray="2 2"
          />
          <text
            x={mirrored ? hx + handleW * 2 + 7 : hx - handleW * 2 - 7}
            y={handleY + handleH / 2 + 2}
            textAnchor={mirrored ? 'start' : 'end'}
            fontSize={7.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            fill={COTA_COLOR}
            opacity={0.85}
          >
            2L
          </text>
        </>
      )}
    </g>
  );
};

/** Cota de puxador PIECE com medida em mm */
const HandlePieceDimension = ({
  svgH, frameW, posX, handleConfig, heightMm, mirrored = false,
}: {
  svgH: number; frameW: number; posX: number; handleConfig: HandleConfig; heightMm: number; mirrored?: boolean;
}) => {
  if (
    handleConfig.handleType !== 'BAR_TUBULAR' ||
    handleConfig.coverage !== 'PIECE' ||
    !handleConfig.pieceLengthCm ||
    handleConfig.pieceLengthCm <= 0
  ) return null;

  const innerH        = svgH - frameW * 2;
  const pieceLengthMm = handleConfig.pieceLengthCm * 10;
  const ratio         = Math.min(Math.max(pieceLengthMm / Math.max(heightMm || 2100, 100), 0.05), 0.9);
  const handleH       = ratio * innerH;
  const handleY       = frameW + (innerH - handleH) / 2;
  const cotaX         = mirrored ? posX - 18 : posX + 18;
  const textAnchor    = mirrored ? 'end' : 'start';

  return (
    <g opacity={0.85}>
      <line x1={cotaX} y1={handleY} x2={cotaX} y2={handleY + handleH} stroke={COTA_STROKE} strokeWidth={0.7} />
      <line x1={posX} y1={handleY}         x2={cotaX} y2={handleY}         stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" />
      <line x1={posX} y1={handleY + handleH} x2={cotaX} y2={handleY + handleH} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" />
      <polygon points={`${cotaX},${handleY} ${cotaX - 2},${handleY + 3} ${cotaX + 2},${handleY + 3}`}                         fill={COTA_STROKE} />
      <polygon points={`${cotaX},${handleY + handleH} ${cotaX - 2},${handleY + handleH - 3} ${cotaX + 2},${handleY + handleH - 3}`} fill={COTA_STROKE} />
      <text
        x={cotaX + (mirrored ? -3 : 3)}
        y={handleY + handleH / 2 + 2}
        textAnchor={textAnchor}
        fontSize={8.2}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
        fill={COTA_COLOR}
      >
        {pieceLengthMm}mm
      </text>
    </g>
  );
};

// ─── Renderers por Tipo de Template com Tema Dinâmico ─────────────────────────

function renderSlidingDoor2F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const halfW  = innerW / 2;

  const fixedX  = inverted ? fw + halfW : fw;
  const mobileX = inverted ? fw : fw + halfW;
  const railY1  = fw;
  const railY2  = svgH - fw - RAIL_H;

  const handlePosX    = inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5;
  const handleMirr    = !inverted;
  const drillingPosX  = inverted ? fixedX + halfW - fw : fixedX + fw / 2;

  const leafWidthMm = Math.round(widthMm / 2);

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

      {/* Puxador */}
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={handlePosX} mirrored={handleMirr} heightMm={heightMm} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={handlePosX} handleConfig={handleConfig} heightMm={heightMm} mirrored={handleMirr} />

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

function renderSlidingDoor4F(
  svgW: number, svgH: number,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const qW     = innerW / 4;
  const xs     = [fw, fw + qW, fw + qW * 2, fw + qW * 3];
  const isFixed = [true, false, false, true];
  const leafMm  = Math.round(widthMm / 4);

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

      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW + qW * 0.1} heightMm={heightMm} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW * 3 - fw * 1.5} mirrored heightMm={heightMm} />
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
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  if (leafCount === 1) {
    const hingeSide = inverted ? fw + innerW : fw;
    const doorEnd   = inverted ? fw : fw + innerW;
    const arcRadius = innerW;

    return (
      <>
        <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
        <line x1={hingeSide} y1={fw} x2={hingeSide} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
        <SwingArc x={hingeSide} y={svgH - fw} radius={arcRadius} startAngle={-90} endAngle={inverted ? -180 : 0} />
        <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? doorEnd + 2 : doorEnd - fw * 1.5} mirrored={!inverted} heightMm={heightMm} />
        <HandlePieceDimension svgH={svgH} frameW={fw} posX={inverted ? doorEnd + 2 : doorEnd - fw * 1.5} handleConfig={handleConfig} heightMm={heightMm} mirrored={!inverted} />
        {/* Furação no lado oposto do puxador */}
        <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? svgW - fw - fw / 2 : fw + fw / 2} mirrored={inverted} />
        <text x={svgW / 2} y={fw + 14} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={ARROW_COLOR}>{inverted ? '← Giro p/ Esquerda' : 'Giro p/ Direita →'}</text>
        <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Vão Único: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
      </>
    );
  }

  const halfW = innerW / 2;
  const leafMm = Math.round(widthMm / 2);
  return (
    <>
      <rect x={fw}         y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + halfW} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <line x1={fw}        y1={fw} x2={fw}        y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <SwingArc x={fw}        y={svgH - fw} radius={halfW} startAngle={-90} endAngle={0} />
      <SwingArc x={svgW - fw} y={svgH - fw} radius={halfW} startAngle={-90} endAngle={-180} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + halfW - fw}     heightMm={heightMm} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + halfW + 2} mirrored heightMm={heightMm} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + fw / 2} mirrored />
      <HorizontalDimension x1={fw} x2={fw + halfW} y={fw} label={`F1: ${leafMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={fw + halfW} x2={svgW - fw} y={fw} label={`F2: ${leafMm}mm`} offsetDir="above" offsetDist={8} />
    </>
  );
}

function renderPivotingDoor(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const pivotX = inverted ? fw + innerW * 2 / 3 : fw + innerW / 3;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <circle cx={pivotX} cy={svgH - fw} r={4} fill={theme.frameStroke} />
      <line x1={pivotX} y1={fw} x2={pivotX} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={2} strokeDasharray="4 2" />
      <SwingArc x={pivotX} y={svgH - fw} radius={inverted ? innerW / 3 : innerW * 2 / 3} startAngle={-90} endAngle={inverted ? -180 : 0} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? fw + fw : svgW - fw * 2.5} mirrored={!inverted} heightMm={heightMm} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={inverted ? fw + fw : svgW - fw * 2.5} handleConfig={handleConfig} heightMm={heightMm} mirrored={!inverted} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? svgW - fw - fw / 2 : fw + fw / 2} mirrored={!inverted} />
      <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Eixo Pivotante: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

function renderSlidingWindow(
  svgW: number, svgH: number, leafCount: 2 | 4, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
) {
  if (leafCount === 4) return renderSlidingDoor4F(svgW, svgH, handleConfig, drillingConfig, widthMm, heightMm, theme);

  const fw      = FRAME_W;
  const innerW  = svgW - fw * 2;
  const innerH  = svgH - fw * 2;
  const batente = 6;
  const halfW   = innerW / 2;
  const fixedX  = inverted ? fw + halfW : fw;
  const mobileX = inverted ? fw : fw + halfW;
  const leafMm  = Math.round(widthMm / 2);

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={fw} width={innerW} height={batente} fill={theme.railFill} opacity={0.7} />
      <rect x={fw} y={svgH - fw - batente} width={innerW} height={batente} fill={theme.railFill} opacity={0.7} />
      <rect x={fixedX}  y={fw} width={halfW} height={innerH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
      <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.7} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5} mirrored={!inverted} heightMm={heightMm} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5} handleConfig={handleConfig} heightMm={heightMm} mirrored={!inverted} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? fixedX + halfW - fw : fixedX + fw / 2} mirrored={!inverted} />
      <text x={mobileX + halfW / 2} y={svgH - fw - batente - 5} textAnchor="middle" fontSize={13.5} fill={ARROW_COLOR} fontWeight="bold">{inverted ? '←' : '→'}</text>
      <HorizontalDimension x1={fixedX}  x2={fixedX + halfW}  y={fw} label={`F: ${leafMm}mm`} offsetDir="above" offsetDist={6} />
      <HorizontalDimension x1={mobileX} x2={mobileX + halfW} y={fw} label={`M: ${leafMm}mm`} offsetDir="above" offsetDist={6} />
    </>
  );
}

function renderMaximAr(svgW: number, svgH: number, theme: SvgTheme) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const topH   = innerH * 0.4;
  const botH   = innerH * 0.6;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={topH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <line x1={fw} y1={fw + topH} x2={svgW - fw} y2={fw + topH} stroke={theme.frameStroke} strokeWidth={2} />
      <text x={svgW / 2} y={fw + topH / 2 + 4} textAnchor="middle" fontSize={13} fill={ARROW_COLOR} fontWeight="bold">↑ Basculante</text>
      <rect x={fw} y={fw + topH} width={innerW} height={botH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
      <text x={svgW / 2} y={fw + topH + botH / 2 + 4} textAnchor="middle" fontSize={10.5} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.4}>FIXO</text>
    </>
  );
}

function renderBoxFrontal(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const halfW  = innerW / 2;

  const fixedX  = inverted ? fw + halfW : fw;
  const mobileX = inverted ? fw : fw + halfW;
  const topRailH = 12;

  const handlePosX    = inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5;
  const handleMirr    = !inverted;
  const drillingPosX  = inverted ? fixedX + halfW - fw : fixedX + fw / 2;
  const leafWidthMm   = Math.round(widthMm / 2);

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      {/* Trilho Superior Box */}
      <rect x={fw} y={fw} width={innerW} height={topRailH} fill={theme.railFill} stroke={theme.frameStroke} strokeWidth={1} />
      <text x={svgW / 2} y={fw + 9} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fill="#ffffff" fontWeight="bold">
        TRILHO BOX
      </text>
      <rect x={fw} y={svgH - fw - 4} width={innerW} height={4} fill={theme.railFill} />

      {/* Folha Fixa Box */}
      <rect x={fixedX}  y={fw + topRailH} width={halfW} height={innerH - topRailH - 4} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={1} opacity={0.9} />
      <text x={fixedX + halfW / 2}  y={svgH / 2} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.6}>VIDRO FIXO</text>

      {/* Folha Móvel Box */}
      <rect x={mobileX} y={fw + topRailH} width={halfW} height={innerH - topRailH - 4} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1.2} />
      <text x={mobileX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.6}>CORRER BOX</text>

      <rect x={fw + halfW - 2} y={fw + topRailH} width={4} height={innerH - topRailH - 4} fill={theme.frameStroke} opacity={0.5} />

      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={handlePosX} mirrored={handleMirr} heightMm={heightMm} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={handlePosX} handleConfig={handleConfig} heightMm={heightMm} mirrored={handleMirr} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={drillingPosX} mirrored={!inverted} />

      <text x={mobileX + halfW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? '← Correr' : 'Correr →'}
      </text>

      <HorizontalDimension x1={fixedX}  x2={fixedX + halfW}  y={svgH - fw - 2} label={`Fixo: ${leafWidthMm}mm`} offsetDir="above" offsetDist={6} />
      <HorizontalDimension x1={mobileX} x2={mobileX + halfW} y={fw + topRailH + 2} label={`Móvel: ${leafWidthMm}mm`} offsetDir="below" offsetDist={6} />
    </>
  );
}

function renderBoxCorner(svgW: number, svgH: number, theme: SvgTheme) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const frontW = innerW * 0.55;
  const sideW  = innerW * 0.45;

  return (
    <>
      <rect x={fw} y={fw} width={frontW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={fw + frontW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fill={theme.frameStroke} opacity={0.4}>Box Frontal</text>
      <rect x={fw + frontW} y={fw} width={sideW} height={innerH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={fw + frontW + sideW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fill={theme.frameStroke} opacity={0.4}>Box Lateral</text>
      <rect x={fw + frontW - 2} y={fw} width={4} height={innerH} fill={theme.frameStroke} />
    </>
  );
}

function renderDrawerFront(
  svgW: number, svgH: number,
  _handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, _heightMm: number,
  theme: SvgTheme,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const handleW = Math.min(innerW * 0.6, 140);
  const handleH = 10;
  const handleX = (svgW - handleW) / 2;
  const handleY = (svgH - handleH) / 2;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + 6} y={fw + 6} width={innerW - 12} height={innerH - 12} fill="none" stroke={theme.frameStroke} strokeWidth={1} opacity={0.6} strokeDasharray="3 2" />
      <rect x={handleX} y={handleY} width={handleW} height={handleH} rx={3} fill={theme.frameFill} stroke={theme.frameStroke} strokeWidth={1} filter="url(#shadow)" />
      {drillingConfig.holeCount > 0 && (
        <>
          <circle cx={handleX + 12} cy={handleY + handleH / 2} r={2.5} fill="#fff" stroke={theme.frameStroke} strokeWidth={1} />
          <circle cx={handleX + handleW - 12} cy={handleY + handleH / 2} r={2.5} fill="#fff" stroke={theme.frameStroke} strokeWidth={1} />
        </>
      )}
      <text x={svgW / 2} y={svgH - fw - 12} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.6} fontWeight="bold">
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
  drillingConfig: DrillingConfig;
  widthMm: number;
  heightMm: number;
  theme: SvgTheme;
}

type SvgTemplateRenderer = (ctx: SvgRenderContext) => React.ReactNode;

const SVG_RENDERERS: Record<DoorTemplateType, SvgTemplateRenderer> = {
  SLIDING_DOOR_2F: (ctx) => renderSlidingDoor2F(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  SLIDING_DOOR_4F: (ctx) => renderSlidingDoor4F(ctx.svgW, ctx.svgH, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  SWING_DOOR_1F: (ctx) => renderSwingDoor(ctx.svgW, ctx.svgH, 1, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  SWING_DOOR_2F: (ctx) => renderSwingDoor(ctx.svgW, ctx.svgH, 2, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  PIVOTING_DOOR: (ctx) => renderPivotingDoor(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  SLIDING_WINDOW_2F: (ctx) => renderSlidingWindow(ctx.svgW, ctx.svgH, 2, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  SLIDING_WINDOW_4F: (ctx) => renderSlidingWindow(ctx.svgW, ctx.svgH, 4, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  MAXIM_AR_WINDOW: (ctx) => renderMaximAr(ctx.svgW, ctx.svgH, ctx.theme),
  GLASS_BOX_FRONTAL: (ctx) => renderBoxFrontal(ctx.svgW, ctx.svgH, ctx.inverted, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  GLASS_BOX_CORNER: (ctx) => renderBoxCorner(ctx.svgW, ctx.svgH, ctx.theme),
  DRAWER_FRONT: (ctx) => renderDrawerFront(ctx.svgW, ctx.svgH, ctx.handleConfig, ctx.drillingConfig, ctx.widthMm, ctx.heightMm, ctx.theme),
  FIXED_GLASS_FACADE: (ctx) => renderFixedFacade(ctx.svgW, ctx.svgH, ctx.theme),
};

export const WindowSvgPreview: React.FC<WindowSvgPreviewProps> = ({
  templateType,
  widthMm = 0,
  heightMm = 0,
  openingDirection = 'LEFT_TO_RIGHT',
  handleConfig,
  drillingConfig,
  templateName,
  aluminumColor,
  glassFinish,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = getSvgTheme(aluminumColor, glassFinish);

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
    return renderer ? renderer({ svgW: SVG_W, svgH: SVG_H, inverted, handleConfig, drillingConfig, widthMm, heightMm, theme }) : null;
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
            x={0} y1={0} y2={SVG_H}
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
      <span className="flex items-center gap-[3px]">
        <span className="inline-block w-2 h-2 rounded-sm" style={{ background: theme.glassFill, border: `1px solid ${theme.glassStroke}` }} />
        Móvel
      </span>
      <span className="flex items-center gap-[3px]">
        <span className="inline-block w-2 h-2 rounded-sm" style={{ background: theme.fixedGlassFill, border: `1px solid ${theme.glassStroke}` }} />
        Fixo
      </span>
      {handleConfig.handleType !== 'NONE' && (
        <span className="flex items-center gap-[3px] text-primary">
          <span className="material-symbols-outlined text-[12px]">hardware</span>
          {handleConfig.side === 'BOTH_SIDES' ? 'Puxador 2 Lados' : 'Puxador 1 Lado'}
        </span>
      )}
      {drillingConfig.holeCount > 0 && (
        <span className="flex items-center gap-[3px]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-on-surface" />
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

      <div style={{ maxWidth: SVG_W + MARGIN * 2, maxHeight: '200px' }} className="w-full flex justify-center">
        {svgContent}
      </div>

      <p className="text-[10px] font-body text-on-surface-variant text-center opacity-85 truncate max-w-full">
        {captionText}
      </p>

      <div className="flex items-center gap-sm text-[10px] font-data-mono text-on-surface-variant flex-wrap justify-center">
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
