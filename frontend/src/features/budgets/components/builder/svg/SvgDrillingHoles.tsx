import type { DrillingPosition } from '../../../types';
import { HOLE_COLOR, HOLE_STROKE, COTA_COLOR, COTA_STROKE } from './svgConstants';

export interface DrillingHolesProps {
  svgH: number;
  svgW?: number;
  frameW: number;
  count: number;
  divisionType?: string;
  drillingPosition?: DrillingPosition;
  customDistancesMm?: number[];
  widthMm?: number;
  heightMm: number;
  posX: number;
  mirrored?: boolean;
}

/** Furos técnicos paramétricos renderizados de acordo com a posição (SUPERIOR, FRONTAL ou LATERAL) */
export const DrillingHoles: React.FC<DrillingHolesProps> = ({
  svgH,
  svgW = 240,
  frameW,
  count,
  divisionType,
  drillingPosition = 'LATERAL',
  customDistancesMm,
  widthMm = 1000,
  heightMm,
  posX,
  mirrored = false,
}) => {
  if (count <= 0) return null;

  // CASO 1: SUPERIOR (Roldanas / Trilho)
  if (drillingPosition === 'SUPERIOR') {
    const innerW = svgW - frameW * 2;
    const holeR = Math.min(3.2, innerW / (count * 6));
    const py = frameW + 4;

    interface TopHolePosition { px: number; distMm: number; }
    const topPositions: TopHolePosition[] = [];

    if (divisionType === 'CUSTOM_DISTANCE' && customDistancesMm?.length) {
      const scale = innerW / Math.max(widthMm, 1);
      customDistancesMm.forEach((d) => {
        const x = frameW + d * scale;
        if (x >= frameW && x <= svgW - frameW) topPositions.push({ px: x, distMm: d });
      });
    } else {
      const stepPx = innerW / (count + 1);
      const stepMm = Math.round(widthMm / (count + 1));
      for (let i = 1; i <= count; i++) {
        topPositions.push({ px: frameW + stepPx * i, distMm: Math.round(stepMm * i) });
      }
    }

    return (
      <g className="drilling-holes-layer-superior">
        {topPositions.map((pos) => (
          <g key={`hole-top-${pos.px}-${pos.distMm}`}>
            <circle cx={pos.px} cy={py} r={holeR + 1} fill="#1e293b" />
            <circle cx={pos.px} cy={py} r={holeR} fill={HOLE_COLOR} stroke={HOLE_STROKE} strokeWidth={0.6} />
            <line x1={pos.px - holeR * 0.7} y1={py} x2={pos.px + holeR * 0.7} y2={py} stroke={HOLE_STROKE} strokeWidth={0.4} />
            <line x1={pos.px} y1={py - holeR * 0.7} x2={pos.px} y2={py + holeR * 0.7} stroke={HOLE_STROKE} strokeWidth={0.4} />
            <line x1={pos.px} y1={py} x2={pos.px} y2={py + 8} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" opacity={0.8} />
            <text
              x={pos.px}
              y={py + 17}
              textAnchor="middle"
              fontSize={8.5}
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
  }

  // CASO 2: FRONTAL (Spider Glass / 1 Furo em Cada Extremidade da Folha)
  if (drillingPosition === 'FRONTAL') {
    const innerW = svgW - frameW * 2;
    const innerH = svgH - frameW * 2;
    const holeR = 3.2;

    const insetX = Math.min(20, Math.max(12, innerW * 0.10));
    const insetY = Math.min(20, Math.max(12, innerH * 0.10));
    const edgeDistMm = Math.round((Math.min(widthMm, heightMm) || 1000) * 0.08);

    interface FrontHolePosition {
      px: number;
      py: number;
      cornerX: number;
      cornerY: number;
      label: string;
    }

    const frontPositions: FrontHolePosition[] = [
      {
        px: frameW + insetX,
        py: frameW + insetY,
        cornerX: frameW,
        cornerY: frameW,
        label: 'Sup. Esq.',
      },
      {
        px: frameW + innerW - insetX,
        py: frameW + insetY,
        cornerX: frameW + innerW,
        cornerY: frameW,
        label: 'Sup. Dir.',
      },
      {
        px: frameW + insetX,
        py: frameW + innerH - insetY,
        cornerX: frameW,
        cornerY: frameW + innerH,
        label: 'Inf. Esq.',
      },
      {
        px: frameW + innerW - insetX,
        py: frameW + innerH - insetY,
        cornerX: frameW + innerW,
        cornerY: frameW + innerH,
        label: 'Inf. Dir.',
      },
    ];

    if (count > 4) {
      frontPositions.push({
        px: frameW + insetX,
        py: frameW + innerH / 2,
        cornerX: frameW,
        cornerY: frameW + innerH / 2,
        label: 'Médio Esq.',
      });
      frontPositions.push({
        px: frameW + innerW - insetX,
        py: frameW + innerH / 2,
        cornerX: frameW + innerW,
        cornerY: frameW + innerH / 2,
        label: 'Médio Dir.',
      });
    }

    return (
      <g className="drilling-holes-layer-frontal">
        {frontPositions.map((pos, idx) => (
          <g key={`hole-front-${idx}-${pos.px}-${pos.py}`}>
            <line
              x1={pos.cornerX}
              y1={pos.cornerY}
              x2={pos.px}
              y2={pos.py}
              stroke="#0284c7"
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.8}
            />

            <circle
              cx={pos.px}
              cy={pos.py}
              r={holeR + 4.5}
              fill="#0284c7"
              fillOpacity={0.18}
              stroke="#0284c7"
              strokeWidth={1}
              strokeDasharray="2 1.5"
            />
            <circle
              cx={pos.px}
              cy={pos.py}
              r={holeR + 1.8}
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth={0.8}
            />
            <circle
              cx={pos.px}
              cy={pos.py}
              r={holeR}
              fill="#ffffff"
              stroke="#374151"
              strokeWidth={0.6}
            />
            <line
              x1={pos.px - holeR - 2.5}
              y1={pos.py}
              x2={pos.px + holeR + 2.5}
              y2={pos.py}
              stroke="#0284c7"
              strokeWidth={0.6}
            />
            <line
              x1={pos.px}
              y1={pos.py - holeR - 2.5}
              x2={pos.px}
              y2={pos.py + holeR + 2.5}
              stroke="#0284c7"
              strokeWidth={0.6}
            />

            <text
              x={pos.px + (pos.px > svgW / 2 ? -holeR - 6 : holeR + 6)}
              y={pos.py + (pos.py > svgH / 2 ? -holeR - 3 : holeR + 9)}
              textAnchor={pos.px > svgW / 2 ? 'end' : 'start'}
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
              fill={COTA_COLOR}
              opacity={0.9}
            >
              {edgeDistMm}mm
            </text>
          </g>
        ))}
      </g>
    );
  }

  // CASO 3: LATERAL (Dobradiças / Pivô / Batente Lateral)
  const innerH = svgH - frameW * 2;
  const holeR = Math.min(3.5, innerH / (count * 4));

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

  const cotaOffset = mirrored ? 14 : -14;
  const textAnchor = mirrored ? 'start' : 'end';

  return (
    <g className="drilling-holes-layer">
      {positions.map((pos) => (
        <g key={`hole-${pos.py}-${pos.distMm}`}>
          <circle cx={posX} cy={pos.py} r={holeR + 1.2} fill="#1e293b" />
          <circle cx={posX} cy={pos.py} r={holeR} fill={HOLE_COLOR} stroke={HOLE_STROKE} strokeWidth={0.6} />
          <line x1={posX - holeR * 0.8} y1={pos.py} x2={posX + holeR * 0.8} y2={pos.py} stroke={HOLE_STROKE} strokeWidth={0.4} />
          <line x1={posX} y1={pos.py - holeR * 0.8} x2={posX} y2={pos.py + holeR * 0.8} stroke={HOLE_STROKE} strokeWidth={0.4} />
          <line x1={posX} y1={pos.py} x2={posX + cotaOffset} y2={pos.py} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" opacity={0.8} />
          <rect
            x={mirrored ? posX + cotaOffset : posX + cotaOffset - 36}
            y={pos.py - 5}
            width={38}
            height={10}
            fill="var(--color-surface-container-lowest, #ffffff)"
            opacity={0.85}
            rx={1.5}
          />
          <text
            x={posX + cotaOffset + (mirrored ? 2 : -2)}
            y={pos.py + 3.5}
            textAnchor={textAnchor}
            fontSize={10.5}
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
