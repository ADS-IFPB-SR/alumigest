import React from 'react';
import type {
  DoorTemplateType,
  OpeningDirection,
  HandleConfig,
  DrillingConfig,
} from '../../types';

interface WindowSvgPreviewProps {
  templateType: DoorTemplateType;
  widthMm: number;
  heightMm: number;
  openingDirection: OpeningDirection;
  handleConfig: HandleConfig;
  drillingConfig: DrillingConfig;
}

// ─── Constantes visuais ────────────────────────────────────────────────────
const FRAME_STROKE = '#1b2b48';
const FRAME_FILL = '#374765';
const GLASS_FILL = '#c5dcf5';
const GLASS_STROKE = '#93b8e0';
const FIXED_GLASS_FILL = '#d8eaf8';
const HANDLE_COLOR = '#c0c0c0';
const HANDLE_STROKE = '#888';
const HOLE_COLOR = '#fff';
const HOLE_STROKE = '#555';
const ARROW_COLOR = '#0040a4';
const FRAME_W = 10; // Espessura do caixilho em unidades SVG
const RAIL_H = 8;   // Altura do trilho

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
      strokeWidth={1.5}
      strokeDasharray="4 2"
      opacity={0.6}
    />
  );
};

/** Furos renderizados na borda com cotas técnicas */
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
  const holeR = Math.min(3.5, innerH / (count * 4));

  interface HolePosition {
    py: number;
    distMm: number;
  }

  const positions: HolePosition[] = [];
  if (divisionType === 'EQUAL') {
    const stepPx = innerH / (count + 1);
    const stepMm = Math.round(heightMm / (count + 1));
    for (let i = 1; i <= count; i++) {
      positions.push({
        py: frameW + stepPx * i,
        distMm: Math.round(stepMm * i),
      });
    }
  } else if (divisionType === 'CUSTOM_DISTANCE' && customDistancesMm?.length) {
    const scale = innerH / Math.max(heightMm, 1);
    customDistancesMm.forEach((d) => {
      const y = frameW + d * scale;
      if (y >= frameW && y <= svgH - frameW) {
        positions.push({
          py: y,
          distMm: d,
        });
      }
    });
  } else {
    const stepPx = innerH / (count + 1);
    const stepMm = Math.round(heightMm / (count + 1));
    for (let i = 1; i <= count; i++) {
      positions.push({
        py: frameW + stepPx * i,
        distMm: Math.round(stepMm * i),
      });
    }
  }

  const cotaOffset = mirrored ? 14 : -14;
  const textAnchor = mirrored ? 'start' : 'end';

  return (
    <g className="drilling-holes-layer">
      {positions.map((pos, i) => (
        <g key={i}>
          {/* Furo e mira técnica */}
          <circle cx={posX} cy={pos.py} r={holeR + 1} fill={FRAME_STROKE} />
          <circle cx={posX} cy={pos.py} r={holeR} fill={HOLE_COLOR} stroke={HOLE_STROKE} strokeWidth={0.6} />
          <line x1={posX - holeR * 0.7} y1={pos.py} x2={posX + holeR * 0.7} y2={pos.py} stroke={HOLE_STROKE} strokeWidth={0.4} />
          <line x1={posX} y1={pos.py - holeR * 0.7} x2={posX} y2={pos.py + holeR * 0.7} stroke={HOLE_STROKE} strokeWidth={0.4} />

          {/* Linha de cota e medição em mm */}
          <line
            x1={posX}
            y1={pos.py}
            x2={posX + cotaOffset}
            y2={pos.py}
            stroke="#0284c7"
            strokeWidth={0.5}
            strokeDasharray="2 1"
            opacity={0.8}
          />
          <text
            x={posX + cotaOffset + (mirrored ? 2 : -2)}
            y={pos.py + 2.5}
            textAnchor={textAnchor}
            fontSize={6.5}
            fontFamily="monospace"
            fontWeight="bold"
            fill="#0369a1"
          >
            {pos.distMm}
          </text>
        </g>
      ))}
    </g>
  );
};

/** Puxador renderizado na folha móvel */
const HandleElement = ({
  handleConfig, svgH, frameW, posX, mirrored = false, heightMm = 2100,
}: {
  handleConfig: HandleConfig; svgH: number; frameW: number; posX: number; mirrored?: boolean; heightMm?: number;
}) => {
  if (handleConfig.handleType === 'NONE') return null;

  const innerH = svgH - frameW * 2;
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

  if (handleConfig.handleType === 'SHELL_LOCK') {
    const cy = handleY + handleH / 2;
    return (
      <ellipse
        cx={hx + handleW / 2}
        cy={cy}
        rx={handleW / 2 + 1}
        ry={handleH / 2}
        fill={HANDLE_COLOR}
        stroke={HANDLE_STROKE}
        strokeWidth={0.8}
      />
    );
  }

  if (handleConfig.handleType === 'LEVER_HANDLE') {
    const hy = handleY + handleH / 2;
    const dir = mirrored ? 1 : -1;
    return (
      <g>
        <rect x={hx} y={hy - handleW / 2} width={handleW} height={handleW} rx={1} fill={HANDLE_COLOR} stroke={HANDLE_STROKE} strokeWidth={0.8} />
        <line x1={hx + handleW / 2} y1={hy} x2={hx + handleW / 2 + dir * 8} y2={hy + 6} stroke={HANDLE_COLOR} strokeWidth={2} strokeLinecap="round" />
      </g>
    );
  }

  // BAR_TUBULAR (default)
  return (
    <g>
      <rect x={hx} y={handleY} width={handleW} height={handleH} rx={handleW / 2} fill={HANDLE_COLOR} stroke={HANDLE_STROKE} strokeWidth={0.8} />
      {/* Double side indicator */}
      {handleConfig.side === 'BOTH_SIDES' && (
        <rect
          x={mirrored ? hx + handleW + 1 : hx - handleW - 1}
          y={handleY}
          width={handleW}
          height={handleH}
          rx={handleW / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={0.8}
          opacity={0.5}
        />
      )}
    </g>
  );
};

// ─── Renderers por tipo ────────────────────────────────────────────────────

function renderSlidingDoor2F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig, heightMm: number,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const halfW = innerW / 2;

  // Se inverted: folha móvel à esquerda, fixa à direita; senão: fixa esquerda, móvel direita
  const fixedX = inverted ? fw + halfW : fw;
  const mobileX = inverted ? fw : fw + halfW;

  // Trilhos
  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  return (
    <>
      {/* Fundo da esquadria */}
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.5} />

      {/* Trilho superior */}
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />
      {/* Trilho inferior */}
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />

      {/* Folha fixa */}
      <rect x={fixedX} y={fw} width={halfW} height={innerH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
      <text x={fixedX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={9} fill={FRAME_STROKE} opacity={0.5}>F</text>

      {/* Folha móvel */}
      <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <text x={mobileX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={9} fill={FRAME_STROKE} opacity={0.5}>M</text>

      {/* Divisória central */}
      <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} opacity={0.8} />

      {/* Puxador na folha móvel */}
      <HandleElement
        handleConfig={handleConfig}
        svgH={svgH}
        frameW={fw}
        posX={inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5}
        mirrored={!inverted}
        heightMm={heightMm}
      />

      {/* Furação no lado oposto ao puxador (folha fixa) */}
      <DrillingHoles
        svgH={svgH}
        svgW={svgW}
        frameW={fw}
        count={drillingConfig.holeCount}
        divisionType={drillingConfig.divisionType}
        customDistancesMm={drillingConfig.customDistancesMm}
        heightMm={heightMm}
        posX={inverted ? fixedX + halfW - fw : fixedX + fw / 2}
        mirrored={!inverted}
      />

      {/* Seta de abertura */}
      <text
        x={mobileX + halfW / 2}
        y={svgH - fw - RAIL_H - 8}
        textAnchor="middle"
        fontSize={12}
        fill={ARROW_COLOR}
        fontWeight="bold"
      >
        {inverted ? '←' : '→'}
      </text>
    </>
  );
}

function renderSlidingDoor4F(
  svgW: number, svgH: number,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig, heightMm: number,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const qW = innerW / 4;

  const xs = [fw, fw + qW, fw + qW * 2, fw + qW * 3];
  const isFixed = [true, false, false, true];

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.5} />
      <rect x={fw} y={fw} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />
      <rect x={fw} y={svgH - fw - RAIL_H} width={innerW} height={RAIL_H} fill={FRAME_FILL} opacity={0.6} />

      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x} y={fw} width={qW} height={innerH} fill={isFixed[i] ? FIXED_GLASS_FILL : GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
          <text x={x + qW / 2} y={svgH / 2} textAnchor="middle" fontSize={8} fill={FRAME_STROKE} opacity={0.4}>
            {isFixed[i] ? 'F' : 'M'}
          </text>
          {i < 3 && <rect x={x + qW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} opacity={0.7} />}
        </g>
      ))}

      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW + qW * 0.1} heightMm={heightMm} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW * 3 - fw * 1.5} mirrored heightMm={heightMm} />

      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + fw / 2} mirrored />

      <text x={svgW / 2} y={svgH - fw - RAIL_H - 8} textAnchor="middle" fontSize={10} fill={ARROW_COLOR} fontWeight="bold">← →</text>
    </>
  );
}

function renderSwingDoor(
  svgW: number, svgH: number, leafCount: 1 | 2, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig, heightMm: number,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  if (leafCount === 1) {
    const hingeSide = inverted ? fw + innerW : fw;
    const doorEnd = inverted ? fw : fw + innerW;
    const arcRadius = innerW;

    return (
      <>
        <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
        {/* Linha de dobradiça */}
        <line x1={hingeSide} y1={fw} x2={hingeSide} y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={3} />
        {/* Arco de abertura */}
        <SwingArc x={hingeSide} y={svgH - fw} radius={arcRadius} startAngle={inverted ? -90 : -90} endAngle={inverted ? -180 : 0} />
        {/* Puxador no lado oposto à dobradiça */}
        <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? doorEnd + 2 : doorEnd - fw * 1.5} mirrored={!inverted} heightMm={heightMm} />
        <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? fw + fw / 2 : svgW - fw - fw / 2} mirrored={!inverted} />
        <text x={svgW / 2} y={fw + 16} textAnchor="middle" fontSize={9} fill={ARROW_COLOR}>{inverted ? '← Abrir p/ Esq' : 'Abrir p/ Dir →'}</text>
      </>
    );
  }

  // 2 folhas
  const halfW = innerW / 2;
  return (
    <>
      <rect x={fw} y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <rect x={fw + halfW} y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <line x1={fw} y1={fw} x2={fw} y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={3} />
      <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={3} />
      <SwingArc x={fw} y={svgH - fw} radius={halfW} startAngle={-90} endAngle={0} />
      <SwingArc x={svgW - fw} y={svgH - fw} radius={halfW} startAngle={-90} endAngle={-180} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + halfW - fw} heightMm={heightMm} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + halfW + 2} mirrored heightMm={heightMm} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + fw / 2} mirrored />
    </>
  );
}

function renderPivotingDoor(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig, heightMm: number,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  // Eixo deslocado 1/3 da largura
  const pivotX = inverted ? fw + innerW * 2 / 3 : fw + innerW / 3;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      {/* Eixo pivô */}
      <circle cx={pivotX} cy={svgH - fw} r={4} fill={FRAME_STROKE} />
      <line x1={pivotX} y1={fw} x2={pivotX} y2={svgH - fw} stroke={FRAME_STROKE} strokeWidth={2} strokeDasharray="4 2" />
      {/* Arco de abertura */}
      <SwingArc x={pivotX} y={svgH - fw} radius={inverted ? innerW / 3 : innerW * 2 / 3} startAngle={-90} endAngle={inverted ? -180 : 0} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? fw + fw : svgW - fw * 2.5} mirrored={!inverted} heightMm={heightMm} />
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? svgW - fw - fw / 2 : fw + fw / 2} mirrored={!inverted} />
    </>
  );
}

function renderSlidingWindow(
  svgW: number, svgH: number, leafCount: 2 | 4, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig, heightMm: number,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  // Janelas têm batente mais visível
  const batente = 6;

  if (leafCount === 2) {
    const halfW = innerW / 2;
    const fixedX = inverted ? fw + halfW : fw;
    const mobileX = inverted ? fw : fw + halfW;

    return (
      <>
        <rect x={fw} y={fw} width={innerW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.5} />
        {/* Batente */}
        <rect x={fw} y={fw} width={innerW} height={batente} fill={FRAME_FILL} opacity={0.7} />
        <rect x={fw} y={svgH - fw - batente} width={innerW} height={batente} fill={FRAME_FILL} opacity={0.7} />
        <rect x={fixedX} y={fw} width={halfW} height={innerH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
        <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
        <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} opacity={0.7} />
        <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5} mirrored={!inverted} heightMm={heightMm} />
        <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={inverted ? fixedX + halfW - fw : fixedX + fw / 2} mirrored={!inverted} />
        <text x={mobileX + halfW / 2} y={svgH - fw - batente - 6} textAnchor="middle" fontSize={10} fill={ARROW_COLOR} fontWeight="bold">{inverted ? '←' : '→'}</text>
      </>
    );
  }

  // 4 folhas — similar ao door 4F
  return renderSlidingDoor4F(svgW, svgH, handleConfig, drillingConfig, heightMm);
}

function renderMaximAr(svgW: number, svgH: number) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const topH = innerH * 0.35;
  const botH = innerH * 0.65;

  return (
    <>
      {/* Parte superior — basculante */}
      <rect x={fw} y={fw} width={innerW} height={topH} fill="#b8d9f5" stroke={GLASS_STROKE} strokeWidth={1} />
      {/* Linha de abertura basculante */}
      <line x1={fw} y1={fw + topH} x2={svgW - fw} y2={fw + topH} stroke={FRAME_STROKE} strokeWidth={2} />
      {/* Seta indicando abertura superior */}
      <text x={svgW / 2} y={fw + topH / 2 + 4} textAnchor="middle" fontSize={10} fill={ARROW_COLOR}>↑</text>
      {/* Parte inferior — fixa */}
      <rect x={fw} y={fw + topH} width={innerW} height={botH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
      <text x={svgW / 2} y={fw + topH + botH / 2 + 4} textAnchor="middle" fontSize={8} fill={FRAME_STROKE} opacity={0.4}>F</text>
    </>
  );
}

function renderBoxFrontal(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig, heightMm: number,
) {
  // Similar ao sliding door 2F mas com proporção de box e sem trilho visível
  return renderSlidingDoor2F(svgW, svgH, inverted, handleConfig, drillingConfig, heightMm);
}

function renderBoxCorner(svgW: number, svgH: number) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const frontW = innerW * 0.55;
  const sideW = innerW * 0.45;

  return (
    <>
      {/* Painel frontal */}
      <rect x={fw} y={fw} width={frontW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <text x={fw + frontW / 2} y={svgH / 2} textAnchor="middle" fontSize={8} fill={FRAME_STROKE} opacity={0.4}>Frontal</text>
      {/* Painel lateral (em perspectiva simplificada) */}
      <rect x={fw + frontW} y={fw} width={sideW} height={innerH} fill={FIXED_GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={1} />
      <text x={fw + frontW + sideW / 2} y={svgH / 2} textAnchor="middle" fontSize={8} fill={FRAME_STROKE} opacity={0.4}>Lateral</text>
      {/* Canto L */}
      <rect x={fw + frontW - 2} y={fw} width={4} height={innerH} fill={FRAME_STROKE} />
    </>
  );
}

function renderFixedFacade(svgW: number, svgH: number) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const numPanels = 3;
  const panelW = innerW / numPanels;

  return (
    <>
      {Array.from({ length: numPanels }).map((_, i) => (
        <g key={i}>
          <rect x={fw + i * panelW} y={fw} width={panelW} height={innerH} fill={GLASS_FILL} stroke={GLASS_STROKE} strokeWidth={0.8} />
          {i > 0 && <rect x={fw + i * panelW - 1} y={fw} width={2} height={innerH} fill={FRAME_STROKE} opacity={0.7} />}
        </g>
      ))}
      <text x={svgW / 2} y={svgH / 2} textAnchor="middle" fontSize={8} fill={FRAME_STROKE} opacity={0.4}>Painel Fixo</text>
    </>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export const WindowSvgPreview: React.FC<WindowSvgPreviewProps> = ({
  templateType,
  widthMm,
  heightMm,
  openingDirection,
  handleConfig,
  drillingConfig,
}) => {
  const SVG_W = 240;
  // Proporção real largura:altura, limitada entre 0.4 e 2.0
  const ratio = Math.min(Math.max((widthMm || 1) / (heightMm || 1), 0.4), 2.0);
  const SVG_H = Math.round(SVG_W / ratio);
  const fw = FRAME_W;

  const inverted = openingDirection === 'RIGHT_TO_LEFT' || openingDirection === 'INSIDE';

  const renderContent = () => {
    switch (templateType) {
      case 'SLIDING_DOOR_2F':
        return renderSlidingDoor2F(SVG_W, SVG_H, inverted, handleConfig, drillingConfig, heightMm);
      case 'SLIDING_DOOR_4F':
        return renderSlidingDoor4F(SVG_W, SVG_H, handleConfig, drillingConfig, heightMm);
      case 'SWING_DOOR_1F':
        return renderSwingDoor(SVG_W, SVG_H, 1, inverted, handleConfig, drillingConfig, heightMm);
      case 'SWING_DOOR_2F':
        return renderSwingDoor(SVG_W, SVG_H, 2, inverted, handleConfig, drillingConfig, heightMm);
      case 'PIVOTING_DOOR':
        return renderPivotingDoor(SVG_W, SVG_H, inverted, handleConfig, drillingConfig, heightMm);
      case 'SLIDING_WINDOW_2F':
        return renderSlidingWindow(SVG_W, SVG_H, 2, inverted, handleConfig, drillingConfig, heightMm);
      case 'SLIDING_WINDOW_4F':
        return renderSlidingWindow(SVG_W, SVG_H, 4, inverted, handleConfig, drillingConfig, heightMm);
      case 'MAXIM_AR_WINDOW':
        return renderMaximAr(SVG_W, SVG_H);
      case 'GLASS_BOX_FRONTAL':
        return renderBoxFrontal(SVG_W, SVG_H, inverted, handleConfig, drillingConfig, heightMm);
      case 'GLASS_BOX_CORNER':
        return renderBoxCorner(SVG_W, SVG_H);
      case 'FIXED_GLASS_FACADE':
        return renderFixedFacade(SVG_W, SVG_H);
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-sm">
      <svg
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxWidth: SVG_W, minHeight: 100 }}
        aria-label="Preview da Esquadria"
      >
        {/* Sombra externa */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Caixilho externo */}
        <rect
          x={0} y={0}
          width={SVG_W} height={SVG_H}
          rx={3}
          fill={FRAME_FILL}
          filter="url(#shadow)"
        />
        {/* Área interna de vidro / conteúdo */}
        <rect x={fw} y={fw} width={SVG_W - fw * 2} height={SVG_H - fw * 2} fill={GLASS_FILL} />

        {renderContent()}

        {/* Cotas mm */}
        {widthMm > 0 && heightMm > 0 && (
          <>
            {/* Cota largura */}
            <text x={SVG_W / 2} y={SVG_H - 2} textAnchor="middle" fontSize={7} fill={FRAME_STROKE} fontFamily="JetBrains Mono, monospace">
              {widthMm} mm
            </text>
            {/* Cota altura */}
            <text
              x={5} y={SVG_H / 2}
              textAnchor="middle"
              fontSize={7}
              fill={FRAME_STROKE}
              fontFamily="JetBrains Mono, monospace"
              transform={`rotate(-90, 5, ${SVG_H / 2})`}
            >
              {heightMm} mm
            </text>
          </>
        )}
      </svg>

      {/* Legenda */}
      <div className="flex items-center gap-md text-xs font-data-mono text-on-surface-variant">
        <span className="flex items-center gap-xs">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: GLASS_FILL, border: `1px solid ${GLASS_STROKE}` }} />
          Móvel
        </span>
        <span className="flex items-center gap-xs">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: FIXED_GLASS_FILL, border: `1px solid ${GLASS_STROKE}` }} />
          Fixo
        </span>
      </div>
    </div>
  );
};
