import React from 'react';
import { HOLE_COLOR, HOLE_STROKE, COTA_COLOR, COTA_STROKE } from './CadConstants';

export interface DrillingHolesProps {
  svgH: number;
  svgW?: number;
  frameW: number;
  count: number;
  divisionType: string;
  customDistancesMm?: number[];
  heightMm: number;
  posX: number;
  mirrored?: boolean;
}

/** Furos renderizados na borda com cotas técnicas de distâncias em mm */
export const DrillingHoles: React.FC<DrillingHolesProps> = ({
  svgH,
  svgW = 400,
  frameW,
  count,
  divisionType,
  customDistancesMm,
  heightMm,
  posX,
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
