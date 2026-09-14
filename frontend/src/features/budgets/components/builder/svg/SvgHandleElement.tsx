import type { HandleConfig } from '../../../types';
import { HANDLE_COLOR, HANDLE_STROKE, COTA_COLOR, COTA_STROKE } from './svgConstants';

export interface HandleElementProps {
  readonly handleConfig: HandleConfig;
  readonly svgH: number;
  readonly frameW: number;
  readonly posX: number;
  readonly mirrored?: boolean;
  readonly heightMm?: number;
  readonly widthMm?: number;
  readonly leafW?: number;
  readonly leafX?: number;
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

interface HorizontalHandleProps {
  barX: number;
  barY: number;
  barW: number;
  barH: number;
  isBothSides: boolean;
  isProfile?: boolean;
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

const ShellLockHorizontal: React.FC<HorizontalHandleProps> = ({ barX, barY, barW, barH, isBothSides }) => {
  const cx = barX + barW / 2;
  const cy = barY + barH / 2;
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={Math.max(barW / 2, 8)}
        ry={barH / 2 + 1}
        fill={HANDLE_COLOR}
        stroke={HANDLE_STROKE}
        strokeWidth={0.8}
      />
      {isBothSides && (
        <ellipse
          cx={cx}
          cy={cy + barH + 2}
          rx={Math.max(barW / 2, 8)}
          ry={barH / 2 + 1}
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

const LeverHorizontal: React.FC<HorizontalHandleProps> = ({ barX, barY, barH, isBothSides }) => {
  return (
    <g>
      <rect x={barX} y={barY} width={barH} height={barH} rx={1} fill={HANDLE_COLOR} stroke={HANDLE_STROKE} strokeWidth={0.8} />
      <line x1={barX + barH / 2} y1={barY + barH / 2} x2={barX + barH / 2 + 16} y2={barY + barH / 2} stroke={HANDLE_COLOR} strokeWidth={2} strokeLinecap="round" />
      {isBothSides && (
        <g opacity={0.4}>
          <line x1={barX + barH / 2} y1={barY + barH / 2 + 3} x2={barX + barH / 2 + 16} y2={barY + barH / 2 + 3} stroke={HANDLE_COLOR} strokeWidth={1.5} strokeDasharray="2 1" strokeLinecap="round" />
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

const ProfileHandleVertical: React.FC<SpecificHandleProps> = ({ hx, handleW, handleY, handleH, mirrored, isBothSides }) => {
  return (
    <g>
      <rect x={hx} y={handleY} width={handleW} height={handleH} rx={1} fill={HANDLE_COLOR} stroke={HANDLE_STROKE} strokeWidth={0.8} />
      <line x1={hx + handleW / 2} y1={handleY + 2} x2={hx + handleW / 2} y2={handleY + handleH - 2} stroke={HANDLE_STROKE} strokeWidth={0.6} opacity={0.6} />
      {isBothSides && (
        <>
          <rect
            x={mirrored ? hx + handleW + 2 : hx - handleW - 2}
            y={handleY}
            width={handleW}
            height={handleH}
            rx={1}
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

const BarTubularHorizontal: React.FC<HorizontalHandleProps> = ({ barX, barY, barW, barH, isBothSides, isProfile }) => {
  return (
    <g>
      <rect
        x={barX}
        y={barY}
        width={barW}
        height={barH}
        rx={isProfile ? 1 : barH / 2}
        fill={HANDLE_COLOR}
        stroke={HANDLE_STROKE}
        strokeWidth={0.8}
      />
      {isProfile && (
        <line
          x1={barX + 2}
          y1={barY + barH / 2}
          x2={barX + barW - 2}
          y2={barY + barH / 2}
          stroke={HANDLE_STROKE}
          strokeWidth={0.6}
          opacity={0.6}
        />
      )}
      {isBothSides && (
        <>
          <rect
            x={barX}
            y={barY + barH + 2}
            width={barW}
            height={barH}
            rx={isProfile ? 1 : barH / 2}
            fill={HANDLE_COLOR}
            stroke={HANDLE_STROKE}
            strokeWidth={0.8}
            opacity={0.4}
            strokeDasharray="2 2"
          />
          <text
            x={barX + barW + 7}
            y={barY + barH + 1}
            textAnchor="start"
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

/** Puxador renderizado na folha móvel com suporte a 1 Lado ou 2 Lados (Ambos os Lados) e orientação Horizontal ou Vertical */
function computeHorizontalBarBounds(
  vPos: string | undefined,
  handleConfig: HandleConfig,
  frameW: number,
  svgH: number,
  effectiveLeafW: number,
  effectiveLeafX: number,
  heightMm: number,
  widthMm?: number
): { barX: number; barY: number; barW: number; barH: number } {
  const barH = 5;
  const innerH = svgH - frameW * 2;

  let barW: number;
  if (handleConfig.coverage === 'FULL') {
    barW = Math.max(effectiveLeafW - 16, 20);
  } else if (handleConfig.coverage === 'PIECE' && handleConfig.pieceLengthCm) {
    const pieceLengthMm = handleConfig.pieceLengthCm * 10;
    const leafWidthMm = (widthMm && widthMm > 0)
      ? Math.max(widthMm * (effectiveLeafW / Math.max(effectiveLeafW, 100)), 100)
      : Math.max(heightMm || 2100, 100);
    const ratio = Math.min(Math.max(pieceLengthMm / leafWidthMm, 0.08), 0.95);
    barW = ratio * effectiveLeafW;
  } else {
    barW = Math.min(Math.max(effectiveLeafW * 0.35, 25), 60);
  }

  let barX: number;
  if (vPos === 'LEFT') {
    barX = effectiveLeafX + 8;
  } else if (vPos === 'RIGHT') {
    barX = effectiveLeafX + effectiveLeafW - barW - 8;
  } else {
    barX = effectiveLeafX + (effectiveLeafW - barW) / 2;
  }

  let barY: number;
  if (vPos === 'TOP') {
    barY = frameW + 12;
  } else if (vPos === 'BOTTOM') {
    barY = svgH - frameW - barH - 12;
  } else {
    barY = frameW + (innerH - barH) / 2;
  }

  return { barX, barY, barW, barH };
}

export const HandleElement: React.FC<HandleElementProps> = ({
  handleConfig,
  svgH,
  frameW,
  posX,
  mirrored = false,
  heightMm = 2100,
  widthMm,
  leafW,
  leafX,
}) => {
  if (handleConfig.handleType === 'NONE') return null;

  const innerH = svgH - frameW * 2;
  const vPos = handleConfig.handlePosition || handleConfig.position;
  const isBothSides = handleConfig.side === 'BOTH_SIDES';

  const isHorizontal =
    handleConfig.orientation === 'HORIZONTAL' ||
    ((vPos === 'TOP' || vPos === 'BOTTOM') && handleConfig.orientation !== 'VERTICAL');

  if (isHorizontal) {
    const effectiveLeafW = leafW ?? Math.min(svgH * 0.5, 120);
    const effectiveLeafX = leafX ?? (posX - effectiveLeafW / 2);
    const { barX, barY, barW, barH } = computeHorizontalBarBounds(
      vPos,
      handleConfig,
      frameW,
      svgH,
      effectiveLeafW,
      effectiveLeafX,
      heightMm,
      widthMm
    );

    const horizProps: HorizontalHandleProps = {
      barX,
      barY,
      barW,
      barH,
      isBothSides,
      isProfile: handleConfig.handleType === 'PROFILE_HANDLE',
    };

    if (handleConfig.handleType === 'SHELL_LOCK') {
      return <ShellLockHorizontal {...horizProps} />;
    }
    if (handleConfig.handleType === 'LEVER_HANDLE') {
      return <LeverHorizontal {...horizProps} />;
    }
    return <BarTubularHorizontal {...horizProps} />;
  }

  // Orientação Vertical (padrão)
  const handleW = 5;
  const handleH = computeHandleHeight(handleConfig, innerH, heightMm);
  const handleY = computeHandleY(vPos, frameW, svgH, innerH, handleH);

  const hx = mirrored ? posX - handleW : posX;
  const props: SpecificHandleProps = { hx, handleW, handleY, handleH, mirrored, isBothSides };

  if (handleConfig.handleType === 'SHELL_LOCK') {
    return <ShellLockHandle {...props} />;
  }

  if (handleConfig.handleType === 'LEVER_HANDLE') {
    return <LeverHandle {...props} />;
  }

  if (handleConfig.handleType === 'PROFILE_HANDLE') {
    return <ProfileHandleVertical {...props} />;
  }

  return <BarTubularHandle {...props} />;
};

export interface HandlePieceDimensionProps {
  readonly svgH: number;
  readonly frameW: number;
  readonly posX: number;
  readonly handleConfig: HandleConfig;
  readonly heightMm: number;
  readonly widthMm?: number;
  readonly leafW?: number;
  readonly leafX?: number;
  readonly mirrored?: boolean;
}

function computeHorizontalDimensionBounds(
  vPos: string | undefined,
  handleConfig: HandleConfig,
  frameW: number,
  svgH: number,
  effectiveLeafW: number,
  effectiveLeafX: number,
  heightMm: number,
  widthMm?: number
): { barX: number; barY: number; barW: number; cotaY: number } {
  const barH = 5;
  const innerH = svgH - frameW * 2;
  const pieceLengthMm = (handleConfig.pieceLengthCm ?? 0) * 10;

  const leafWidthMm = (widthMm && widthMm > 0)
    ? Math.max(widthMm * (effectiveLeafW / Math.max(effectiveLeafW, 100)), 100)
    : Math.max(heightMm || 2100, 100);
  const ratio = Math.min(Math.max(pieceLengthMm / leafWidthMm, 0.08), 0.95);
  const barW = ratio * effectiveLeafW;

  let barX: number;
  if (vPos === 'LEFT') {
    barX = effectiveLeafX + 8;
  } else if (vPos === 'RIGHT') {
    barX = effectiveLeafX + effectiveLeafW - barW - 8;
  } else {
    barX = effectiveLeafX + (effectiveLeafW - barW) / 2;
  }

  let barY: number;
  if (vPos === 'TOP') {
    barY = frameW + 12;
  } else if (vPos === 'BOTTOM') {
    barY = svgH - frameW - barH - 12;
  } else {
    barY = frameW + (innerH - barH) / 2;
  }

  const cotaY = vPos === 'TOP' ? barY + barH + 12 : barY - 10;

  return { barX, barY, barW, cotaY };
}

/** Cota de puxador PIECE com medida em mm (suporte a Horizontal e Vertical) */
export const HandlePieceDimension: React.FC<HandlePieceDimensionProps> = ({
  svgH,
  frameW,
  posX,
  handleConfig,
  heightMm,
  widthMm,
  leafW,
  leafX,
  mirrored = false,
}) => {
  if (
    (handleConfig.handleType !== 'BAR_TUBULAR' && handleConfig.handleType !== 'PROFILE_HANDLE') ||
    handleConfig.coverage !== 'PIECE' ||
    !handleConfig.pieceLengthCm ||
    handleConfig.pieceLengthCm <= 0
  ) return null;

  const innerH = svgH - frameW * 2;
  const pieceLengthMm = handleConfig.pieceLengthCm * 10;
  const vPos = handleConfig.handlePosition || handleConfig.position;

  const isHorizontal =
    handleConfig.orientation === 'HORIZONTAL' ||
    ((vPos === 'TOP' || vPos === 'BOTTOM') && handleConfig.orientation !== 'VERTICAL');

  if (isHorizontal) {
    const effectiveLeafW = leafW ?? Math.min(svgH * 0.5, 120);
    const effectiveLeafX = leafX ?? (posX - effectiveLeafW / 2);
    const { barX, barY, barW, cotaY } = computeHorizontalDimensionBounds(
      vPos,
      handleConfig,
      frameW,
      svgH,
      effectiveLeafW,
      effectiveLeafX,
      heightMm,
      widthMm
    );

    return (
      <g opacity={0.85}>
        <line x1={barX} y1={cotaY} x2={barX + barW} y2={cotaY} stroke={COTA_STROKE} strokeWidth={0.7} />
        <line x1={barX} y1={barY} x2={barX} y2={cotaY} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" />
        <line x1={barX + barW} y1={barY} x2={barX + barW} y2={cotaY} stroke={COTA_STROKE} strokeWidth={0.5} strokeDasharray="2 1" />
        <polygon points={`${barX},${cotaY} ${barX + 3},${cotaY - 2} ${barX + 3},${cotaY + 2}`} fill={COTA_STROKE} />
        <polygon points={`${barX + barW},${cotaY} ${barX + barW - 3},${cotaY - 2} ${barX + barW - 3},${cotaY + 2}`} fill={COTA_STROKE} />
        <text
          x={barX + barW / 2}
          y={cotaY - 3}
          textAnchor="middle"
          fontSize={11}
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
          fill={COTA_COLOR}
        >
          {pieceLengthMm}mm
        </text>
      </g>
    );
  }

  // Cota Vertical
  const ratio = Math.min(Math.max(pieceLengthMm / Math.max(heightMm || 2100, 100), 0.05), 0.9);
  const handleH = ratio * innerH;
  const handleY = computeHandleY(vPos, frameW, svgH, innerH, handleH);
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
