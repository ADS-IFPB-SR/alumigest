import React from 'react';
import type {
  OpeningDirection,
  HandleConfig,
  DrillingConfig,
} from '../../types';

interface WindowSvgPreviewProps {
  templateType: string;
  widthMm: number;
  heightMm: number;
  openingDirection: OpeningDirection;
  handleConfig: HandleConfig;
  drillingConfig: DrillingConfig;
  templateName?: string;
  aluminumColor?: string;
}

// ─── Constantes visuais Blueprint / CAD ─────────────────────────────────────
const FRAME_STROKE      = '#1b2b48';
const FRAME_FILL        = '#374765';
const GLASS_FILL        = '#c5dcf5';
const GLASS_STROKE      = '#93b8e0';
const FIXED_GLASS_FILL  = '#d8eaf8';
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
      {/* Linhas de extensão técnica */}
      <line x1={x1} y1={y} x2={x1} y2={lineY + sign * 2} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      <line x1={x2} y1={y} x2={x2} y2={lineY + sign * 2} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      {/* Linha de cota com setas */}
      <line x1={x1} y1={lineY} x2={x2} y2={lineY} stroke={COTA_STROKE} strokeWidth={0.7} opacity={0.9} />
      <polygon points={`${x1},${lineY} ${x1 + tickH},${lineY - 2} ${x1 + tickH},${lineY + 2}`} fill={COTA_STROKE} opacity={0.9} />
      <polygon points={`${x2},${lineY} ${x2 - tickH},${lineY - 2} ${x2 - tickH},${lineY + 2}`} fill={COTA_STROKE} opacity={0.9} />
      {/* Texto de cota */}
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
        fontSize={6}
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
      {/* Linhas de extensão técnica */}
      <line x1={x} y1={y1} x2={lineX + sign * 2} y2={y1} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      <line x1={x} y1={y2} x2={lineX + sign * 2} y2={y2} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.75} />
      {/* Linha de cota com setas */}
      <line x1={lineX} y1={y1} x2={lineX} y2={y2} stroke={COTA_STROKE} strokeWidth={0.7} opacity={0.9} />
      <polygon points={`${lineX},${y1} ${lineX - 2},${y1 + tickH} ${lineX + 2},${y1 + tickH}`} fill={COTA_STROKE} opacity={0.9} />
      <polygon points={`${lineX},${y2} ${lineX - 2},${y2 - tickH} ${lineX + 2},${y2 - tickH}`} fill={COTA_STROKE} opacity={0.9} />
      {/* Texto rotacionado de cota */}
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
          fontSize={6}
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
      {positions.map((pos, i) => (
        <g key={i}>
          {/* Furo e mira técnica */}
          <circle cx={posX} cy={pos.py} r={holeR + 1} fill={FRAME_STROKE} />
          <circle cx={posX} cy={pos.py} r={holeR}     fill={HOLE_COLOR}   stroke={HOLE_STROKE} strokeWidth={0.6} />
          <line x1={posX - holeR * 0.7} y1={pos.py} x2={posX + holeR * 0.7} y2={pos.py} stroke={HOLE_STROKE} strokeWidth={0.4} />
          <line x1={posX} y1={pos.py - holeR * 0.7}  x2={posX} y2={pos.py + holeR * 0.7}  stroke={HOLE_STROKE} strokeWidth={0.4} />
          {/* Cota de distância em mm */}
          <line x1={posX} y1={pos.py} x2={posX + cotaOffset} y2={pos.py} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" opacity={0.8} />
          <text
            x={posX + cotaOffset + (mirrored ? 2 : -2)}
            y={pos.py + 2.5}
            textAnchor={textAnchor}
            fontSize={5.5}
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
      {/* Puxador Face Frontal */}
      <rect x={hx} y={handleY} width={handleW} height={handleH} rx={handleW / 2} fill={HANDLE_COLOR} stroke={HANDLE_STROKE} strokeWidth={0.8} />
      {/* Ambos os Lados: Puxador Face Verso */}
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
          {/* Badge / Indicador 2L (Ambos os Lados) */}
          <text
            x={mirrored ? hx + handleW * 2 + 7 : hx - handleW * 2 - 7}
            y={handleY + handleH / 2 + 2}
            textAnchor={mirrored ? 'start' : 'end'}
            fontSize={5}
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
        fontSize={5.5}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
        fill={COTA_COLOR}
      >
        {pieceLengthMm}mm
      </text>
    </g>
  );
};

// ─── Renderers por Tipo de Template com Detalhes de Medidas (Item 7) ────────

function renderSlidingDoor2F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
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
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />

      {/* Folha fixa */}
      <rect x={fixedX}  y={fw} width={halfW} height={innerH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
      <text x={fixedX + halfW / 2}  y={svgH / 2} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fill={FRAME_STROKE} opacity={0.5}>FIXA</text>

      {/* Folha móvel */}
      <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <text x={mobileX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fill={FRAME_STROKE} opacity={0.5}>MÓVEL</text>

      {/* Divisória central */}
      <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} opacity={0.8} />

      {/* Puxador */}
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={handlePosX} mirrored={handleMirr} heightMm={heightMm} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={handlePosX} handleConfig={handleConfig} heightMm={heightMm} mirrored={handleMirr} />

      {/* Furação */}
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={drillingPosX} mirrored={!inverted} />

      {/* Seta de abertura */}
      <text x={mobileX + halfW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={11} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? '← Correr' : 'Correr →'}
      </text>

      {/* Cotas individuais das 2 folhas (Item 7) */}
      <HorizontalDimension x1={fixedX}  x2={fixedX + halfW}  y={svgH - fw - RAIL_H - 1} label={`F: ${leafWidthMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={mobileX} x2={mobileX + halfW} y={fw + RAIL_H + 1}         label={`M: ${leafWidthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

function renderSlidingDoor4F(
  svgW: number, svgH: number,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
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
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.5} />
      <rect x={fw} y={fw} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />
      <rect x={fw} y={svgH - fw - RAIL_H} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />

      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x} y={fw} width={qW} height={innerH} fill={isFixed[i] ? FIXED_GLASS_FILL : GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
          <text x={x + qW / 2} y={svgH / 2} textAnchor="middle" fontSize={7} fontFamily="JetBrains Mono, monospace" fill={FRAME_STROKE} opacity={0.4}>
            {isFixed[i] ? 'F' : 'M'}
          </text>
          {i < 3 && <rect x={x + qW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} opacity={0.7} />}
        </g>
      ))}

      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW + qW * 0.1} heightMm={heightMm} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW * 3 - fw * 1.5} mirrored heightMm={heightMm} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + fw / 2} mirrored />
      <text x={svgW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={9} fill={ARROW_COLOR} fontWeight="bold">← Abertura Central →</text>

      {/* Cotas das 4 folhas (Item 7) */}
      {xs.map((x, i) => (
        <HorizontalDimension key={i} x1={x} x2={x + qW} y={fw + RAIL_H + 1} label={`${leafMm}mm`} offsetDir="below" offsetDist={6} />
      ))}
    </>
  );
}

function renderSwingDoor(
  svgW: number, svgH: number, leafCount: 1 | 2, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
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
        <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
        <line x1={hingeSide} y1={fw} x2={hingeSide} y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={3} />
        <SwingArc x={hingeSide} y={svgH - fw} radius={arcRadius} startAngle={-90} endAngle={inverted ? -180 : 0} />
        <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? doorEnd + 2 : doorEnd - fw * 1.5} mirrored={!inverted} heightMm={heightMm} />
        <HandlePieceDimension svgH={svgH} frameW={fw} posX={inverted ? doorEnd + 2 : doorEnd - fw * 1.5} handleConfig={handleConfig} heightMm={heightMm} mirrored={!inverted} />
        <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? fw + fw / 2 : svgW - fw - fw / 2} mirrored={!inverted} />
        <text x={svgW / 2} y={fw + 14} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fill={ARROW_COLOR}>{inverted ? '← Giro p/ Esquerda' : 'Giro p/ Direita →'}</text>
        <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Vão Único: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
      </>
    );
  }

  const halfW = innerW / 2;
  const leafMm = Math.round(widthMm / 2);
  return (
    <>
      <rect x={fw}         y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <rect x={fw + halfW} y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <line x1={fw}        y1={fw} x2={fw}        y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={3} />
      <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={3} />
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
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const pivotX = inverted ? fw + innerW * 2 / 3 : fw + innerW / 3;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <circle cx={pivotX} cy={svgH - fw} r={4} fill={FRAME_STROKE} />
      <line x1={pivotX} y1={fw} x2={pivotX} y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={2} strokeDasharray="4 2" />
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
) {
  if (leafCount === 4) return renderSlidingDoor4F(svgW, svgH, handleConfig, drillingConfig, widthMm, heightMm);

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
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.5} />
      <rect x={fw} y={fw} width={innerW} height={batente} fill={FRAME_FILL} opacity={0.7} />
      <rect x={fw} y={svgH - fw - batente} width={innerW} height={batente} fill={FRAME_FILL} opacity={0.7} />
      <rect x={fixedX}  y={fw} width={halfW} height={innerH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
      <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} opacity={0.7} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5} mirrored={!inverted} heightMm={heightMm} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5} handleConfig={handleConfig} heightMm={heightMm} mirrored={!inverted} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? fixedX + halfW - fw : fixedX + fw / 2} mirrored={!inverted} />
      <text x={mobileX + halfW / 2} y={svgH - fw - batente - 5} textAnchor="middle" fontSize={9} fill={ARROW_COLOR} fontWeight="bold">{inverted ? '←' : '→'}</text>
      <HorizontalDimension x1={fixedX}  x2={fixedX + halfW}  y={fw} label={`F: ${leafMm}mm`} offsetDir="above" offsetDist={6} />
      <HorizontalDimension x1={mobileX} x2={mobileX + halfW} y={fw} label={`M: ${leafMm}mm`} offsetDir="above" offsetDist={6} />
    </>
  );
}

function renderMaximAr(svgW: number, svgH: number) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const topH   = innerH * 0.35;
  const botH   = innerH * 0.65;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={topH} fill="#b8d9f5" stroke={GLASS_STROKE} strokeWidth={1} />
      <line x1={fw} y1={fw + topH} x2={svgW - fw} y2={fw + topH} stroke={FRAME_STROKE} strokeWidth={2} />
      <text x={svgW / 2} y={fw + topH / 2 + 4} textAnchor="middle" fontSize={9} fill={ARROW_COLOR}>↑ Basculante</text>
      <rect x={fw} y={fw + topH} width={innerW} height={botH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
      <text x={svgW / 2} y={fw + topH + botH / 2 + 4} textAnchor="middle" fontSize={7} fontFamily="JetBrains Mono, monospace" fill={FRAME_STROKE} opacity={0.4}>FIXO</text>
    </>
  );
}

function renderBoxFrontal(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
) {
  return renderSlidingDoor2F(svgW, svgH, inverted, handleConfig, drillingConfig, widthMm, heightMm);
}

function renderBoxCorner(svgW: number, svgH: number) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const frontW = innerW * 0.55;
  const sideW  = innerW * 0.45;

  return (
    <>
      <rect x={fw} y={fw} width={frontW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <text x={fw + frontW / 2} y={svgH / 2} textAnchor="middle" fontSize={8} fill={FRAME_STROKE} opacity={0.4}>Frontal</text>
      <rect x={fw + frontW} y={fw} width={sideW} height={innerH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <text x={fw + frontW + sideW / 2} y={svgH / 2} textAnchor="middle" fontSize={8} fill={FRAME_STROKE} opacity={0.4}>Lateral</text>
      <rect x={fw + frontW - 2} y={fw} width={4} height={innerH} fill={FRAME_STROKE} />
    </>
  );
}

function renderFixedFacade(svgW: number, svgH: number) {
  const fw        = FRAME_W;
  const innerW    = svgW - fw * 2;
  const innerH    = svgH - fw * 2;
  const numPanels = 3;
  const panelW    = innerW / numPanels;

  return (
    <>
      {Array.from({ length: numPanels }).map((_, i) => (
        <g key={i}>
          <rect x={fw + i * panelW} y={fw} width={panelW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
          {i > 0 && <rect x={fw + i * panelW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} />}
        </g>
      ))}
    </>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────

export const WindowSvgPreview: React.FC<WindowSvgPreviewProps> = ({
  templateType,
  widthMm,
  heightMm,
  openingDirection,
  handleConfig,
  drillingConfig,
  templateName,
  aluminumColor,
}) => {
  // Margens internas para acomodar cotas externas sem cortar
  const MARGIN  = 26;
  const SVG_W   = 240;
  const ratio   = Math.min(Math.max((widthMm || 1) / (heightMm || 1), 0.4), 2.0);
  const SVG_H   = Math.round(SVG_W / ratio);
  const fw      = FRAME_W;
  // viewBox com margem para as cotas externas
  const VB_W    = SVG_W + MARGIN * 2;
  const VB_H    = SVG_H + MARGIN * 2;

  const inverted = openingDirection === 'RIGHT_TO_LEFT' || openingDirection === 'INSIDE';

  const renderContent = () => {
    switch (templateType) {
      case 'SLIDING_DOOR_2F':
        return renderSlidingDoor2F(SVG_W, SVG_H, inverted, handleConfig, drillingConfig, widthMm, heightMm);
      case 'SLIDING_DOOR_4F':
        return renderSlidingDoor4F(SVG_W, SVG_H, handleConfig, drillingConfig, widthMm, heightMm);
      case 'SWING_DOOR_1F':
        return renderSwingDoor(SVG_W, SVG_H, 1, inverted, handleConfig, drillingConfig, widthMm, heightMm);
      case 'SWING_DOOR_2F':
        return renderSwingDoor(SVG_W, SVG_H, 2, inverted, handleConfig, drillingConfig, widthMm, heightMm);
      case 'PIVOTING_DOOR':
        return renderPivotingDoor(SVG_W, SVG_H, inverted, handleConfig, drillingConfig, widthMm, heightMm);
      case 'SLIDING_WINDOW_2F':
        return renderSlidingWindow(SVG_W, SVG_H, 2, inverted, handleConfig, drillingConfig, widthMm, heightMm);
      case 'SLIDING_WINDOW_4F':
        return renderSlidingWindow(SVG_W, SVG_H, 4, inverted, handleConfig, drillingConfig, widthMm, heightMm);
      case 'MAXIM_AR_WINDOW':
        return renderMaximAr(SVG_W, SVG_H);
      case 'GLASS_BOX_FRONTAL':
        return renderBoxFrontal(SVG_W, SVG_H, inverted, handleConfig, drillingConfig, widthMm, heightMm);
      case 'GLASS_BOX_CORNER':
        return renderBoxCorner(SVG_W, SVG_H);
      case 'FIXED_GLASS_FACADE':
        return renderFixedFacade(SVG_W, SVG_H);
      default:
        return null;
    }
  };

  const hasDimensions = widthMm > 0 && heightMm > 0;
  const captionText = `${templateName ?? 'Esquadria'} · ${aluminumColor ?? 'Alumínio'}`;

  return (
    <div className="flex flex-col items-center gap-xs w-full max-h-full">
      <svg
        width="100%"
        viewBox={`${-MARGIN} ${-MARGIN} ${VB_W} ${VB_H}`}
        style={{ maxWidth: SVG_W + MARGIN * 2, maxHeight: '200px' }}
        aria-label={`Preview da esquadria ${widthMm}×${heightMm}mm`}
      >
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Caixilho externo */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} rx={3} fill={FRAME_FILL} filter="url(#shadow)" />
        {/* Área interna */}
        <rect x={fw} y={fw} width={SVG_W - fw * 2} height={SVG_H - fw * 2} fill={GLASS_FILL} />

        {renderContent()}

        {/* ── Cotas externas principais (Largura e Altura Totais em mm) (Item 7) ──── */}
        {hasDimensions && (
          <>
            {/* Cota de largura total — acima da esquadria */}
            <HorizontalDimension
              x1={0} x2={SVG_W}
              y={0}
              label={`L: ${widthMm} mm`}
              offsetDir="above"
              offsetDist={14}
            />
            {/* Cota de altura total — à esquerda da esquadria */}
            <VerticalDimension
              x={0} y1={0} y2={SVG_H}
              label={`A: ${heightMm} mm`}
              offsetDir="left"
              offsetDist={14}
            />
          </>
        )}
      </svg>

      {/* Legenda do template e acabamento */}
      <p className="text-[10px] font-body text-on-surface-variant text-center opacity-85 truncate max-w-full">
        {captionText}
      </p>

      {/* Legenda de elementos técnicos */}
      <div className="flex items-center gap-sm text-[10px] font-data-mono text-on-surface-variant flex-wrap justify-center">
        <span className="flex items-center gap-[3px]">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: GLASS_FILL, border: `1px solid ${GLASS_STROKE}` }} />
          Móvel
        </span>
        <span className="flex items-center gap-[3px]">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: FIXED_GLASS_FILL, border: `1px solid ${GLASS_STROKE}` }} />
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
      </div>
    </div>
  );
};
