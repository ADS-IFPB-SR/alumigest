import type { HandleConfig } from '../../../types';
import { HANDLE_COLOR, HANDLE_STROKE, COTA_COLOR, COTA_STROKE } from './svgConstants';

export interface HandleElementProps {
  readonly handleConfig: HandleConfig;
  readonly svgH: number;
  readonly frameW: number;
  readonly posX: number;
  readonly mirrored?: boolean;
  readonly heightMm?: number;
}

function computeHandleHeight(handleConfig: HandleConfig, innerH: number, heightMm: number): number {
  if (handleConfig.coverage === 'FULL') {
    return innerH * 0.88;
  }
  if (handleConfig.coverage === 'PIECE' && handleConfig.pieceLengthCm) {
    const pieceLengthMm = handleConfig.pieceLengthCm * 10;
    const ratio = Math.min(Math.max(pieceLengthMm / Math.max(heightMm || 2100, 100), 0.05), 0.9);
    return ratio * innerH;
  }
  if (handleConfig.handleType === 'SHELL_LOCK' || handleConfig.handleType === 'LEVER_HANDLE') {
    return Math.min(20, innerH * 0.15);
  }
  return innerH * 0.25;
}

function computeHandleY(vPos: string | undefined, frameW: number, svgH: number, innerH: number, handleH: number): number {
  if (vPos === 'TOP') {
    return frameW + 10;
  }
  if (vPos === 'BOTTOM') {
    return svgH - frameW - handleH - 10;
  }
  return frameW + (innerH - handleH) / 2;
}

interface SpecificHandleProps {
  readonly hx: number;
  readonly handleW: number;
  readonly handleY: number;
  readonly handleH: number;
  readonly mirrored: boolean;
  readonly isBothSides: boolean;
}

const ShellLockHandle: React.FC<SpecificHandleProps> = ({ hx, handleW, handleY, handleH, mirrored, isBothSides }) => {
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
};

const LeverHandle: React.FC<SpecificHandleProps> = ({ hx, handleW, handleY, handleH, mirrored, isBothSides }) => {
  const hy = handleY + handleH / 2;
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
};

const BarTubularHandle: React.FC<SpecificHandleProps> = ({ hx, handleW, handleY, handleH, mirrored, isBothSides }) => {
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
            y={handleY + handleH / 2 + 3}
            textAnchor={mirrored ? 'start' : 'end'}
            fontSize={10}
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

/** Puxador renderizado na folha móvel com suporte a 1 Lado ou 2 Lados (Ambos os Lados) */
export const HandleElement: React.FC<HandleElementProps> = ({
  handleConfig,
  svgH,
  frameW,
  posX,
  mirrored = false,
  heightMm = 2100,
}) => {
  if (handleConfig.handleType === 'NONE') return null;

  const innerH = svgH - frameW * 2;
  const handleW = 5;
  const handleH = computeHandleHeight(handleConfig, innerH, heightMm);
  const vPos = handleConfig.handlePosition || handleConfig.position;
  const handleY = computeHandleY(vPos, frameW, svgH, innerH, handleH);

  const hx = mirrored ? posX - handleW : posX;
  const isBothSides = handleConfig.side === 'BOTH_SIDES';

  const props: SpecificHandleProps = { hx, handleW, handleY, handleH, mirrored, isBothSides };

  if (handleConfig.handleType === 'SHELL_LOCK') {
    return <ShellLockHandle {...props} />;
  }

  if (handleConfig.handleType === 'LEVER_HANDLE') {
    return <LeverHandle {...props} />;
  }

  return <BarTubularHandle {...props} />;
};

export interface HandlePieceDimensionProps {
  readonly svgH: number;
  readonly frameW: number;
  readonly posX: number;
  readonly handleConfig: HandleConfig;
  readonly heightMm: number;
  readonly mirrored?: boolean;
}

/** Cota de puxador PIECE com medida em mm */
export const HandlePieceDimension: React.FC<HandlePieceDimensionProps> = ({
  svgH,
  frameW,
  posX,
  handleConfig,
  heightMm,
  mirrored = false,
}) => {
  if (
    handleConfig.handleType !== 'BAR_TUBULAR' ||
    handleConfig.coverage !== 'PIECE' ||
    !handleConfig.pieceLengthCm ||
    handleConfig.pieceLengthCm <= 0
  ) return null;

  const innerH = svgH - frameW * 2;
  const pieceLengthMm = handleConfig.pieceLengthCm * 10;
  const ratio = Math.min(Math.max(pieceLengthMm / Math.max(heightMm || 2100, 100), 0.05), 0.9);
  const handleH = ratio * innerH;
  const handleY = frameW + (innerH - handleH) / 2;
  const cotaX = mirrored ? posX - 18 : posX + 18;
  const textAnchor = mirrored ? 'end' : 'start';

  return (
    <g opacity={0.85}>
      <line x1={cotaX} y1={handleY} x2={cotaX} y2={handleY + handleH} stroke={COTA_STROKE} strokeWidth={0.7} />
      <line x1={posX} y1={handleY} x2={cotaX} y2={handleY} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" />
      <line x1={posX} y1={handleY + handleH} x2={cotaX} y2={handleY + handleH} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" />
      <polygon points={`${cotaX},${handleY} ${cotaX - 2},${handleY + 3} ${cotaX + 2},${handleY + 3}`} fill={COTA_STROKE} />
      <polygon points={`${cotaX},${handleY + handleH} ${cotaX - 2},${handleY + handleH - 3} ${cotaX + 2},${handleY + handleH - 3}`} fill={COTA_STROKE} />
      <text
        x={cotaX + (mirrored ? -3 : 3)}
        y={handleY + handleH / 2 + 3.5}
        textAnchor={textAnchor}
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="bold"
        fill={COTA_COLOR}
      >
        {pieceLengthMm}mm
      </text>
    </g>
  );
};
