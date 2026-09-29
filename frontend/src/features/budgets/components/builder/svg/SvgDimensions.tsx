import React from 'react';
import { ARROW_COLOR, COTA_COLOR, COTA_STROKE } from './svgConstants';

/** Arco de abertura (swing door) */
export const SwingArc = ({
  x, y, radius, startAngle, endAngle, color = ARROW_COLOR,
}: {
  readonly x: number; readonly y: number; readonly radius: number;
  readonly startAngle: number; readonly endAngle: number; readonly color?: string;
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

export interface HorizontalDimensionProps {
  readonly x1: number;
  readonly x2: number;
  readonly y: number;
  readonly label: string;
  readonly offsetDir?: 'above' | 'below';
  readonly offsetDist?: number;
}

/**
 * Cota horizontal com linhas de extensão, setas de CAD e label mm.
 */
export const HorizontalDimension: React.FC<HorizontalDimensionProps> = ({
  x1, x2, y, label, offsetDir = 'above', offsetDist = 12,
}) => {
  const sign = offsetDir === 'above' ? -1 : 1;
  const lineY = y + sign * offsetDist;
  const tickH = 4;
  const mid = (x1 + x2) / 2;
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
        fill="var(--color-surface-container-lowest, #ffffff)"
        opacity={0.92}
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

export interface VerticalDimensionProps {
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly label: string;
  readonly offsetDir?: 'left' | 'right';
  readonly offsetDist?: number;
}

/**
 * Cota vertical com linhas de extensão, setas de CAD e label mm rotacionado.
 */
export const VerticalDimension: React.FC<VerticalDimensionProps> = ({
  x, y1, y2, label, offsetDir = 'left', offsetDist = 12,
}) => {
  const sign = offsetDir === 'left' ? -1 : 1;
  const lineX = x + sign * offsetDist;
  const tickH = 4;
  const mid = (y1 + y2) / 2;
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
          fill="var(--color-surface-container-lowest, #ffffff)"
          opacity={0.92}
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
