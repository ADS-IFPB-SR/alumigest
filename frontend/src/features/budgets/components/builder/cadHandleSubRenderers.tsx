import React from 'react';
import type { HandlePosition, HandleType, HandleCoverage } from '../../types';
import type { LeafBounds } from './CadHandleRenderer';

const COTA_COLOR = '#475569';
const COTA_STROKE = '#64748b';

export interface CadHandleSubRendererTheme {
  frameFill: string;
  frameStroke: string;
}

function getHorizontalShellY(position: HandlePosition, leafBounds: LeafBounds, shellH: number): number {
  if (position === 'TOP') return leafBounds.y + 4;
  if (position === 'BOTTOM') return leafBounds.y + leafBounds.height - shellH - 4;
  return leafBounds.y + (leafBounds.height - shellH) / 2;
}

function getHorizontalShellX(position: HandlePosition, leafBounds: LeafBounds, shellW: number): number {
  if (position === 'LEFT') return leafBounds.x + 8;
  if (position === 'RIGHT') return leafBounds.x + leafBounds.width - shellW - 8;
  return leafBounds.x + (leafBounds.width - shellW) / 2;
}

function getVerticalShellY(position: HandlePosition, leafBounds: LeafBounds, shellH: number): number {
  if (position === 'BOTTOM') return leafBounds.y + leafBounds.height - shellH - 8;
  if (position === 'TOP') return leafBounds.y + 8;
  return leafBounds.y + (leafBounds.height - shellH) / 2;
}

function getVerticalShellX(position: HandlePosition, leafBounds: LeafBounds, shellW: number): number {
  if (position === 'LEFT') return leafBounds.x + 4;
  if (position === 'RIGHT') return leafBounds.x + leafBounds.width - shellW - 4;
  return leafBounds.x + (leafBounds.width - shellW) / 2;
}

function getVerticalLeverY(position: HandlePosition, leafBounds: LeafBounds, roseteH: number): number {
  if (position === 'BOTTOM') return leafBounds.y + leafBounds.height - roseteH - 6;
  if (position === 'TOP') return leafBounds.y + 6;
  return leafBounds.y + (leafBounds.height - roseteH) / 2;
}

function getVerticalLeverX(position: HandlePosition, leafBounds: LeafBounds, roseteW: number): number {
  if (position === 'LEFT') return leafBounds.x + 3;
  if (position === 'RIGHT') return leafBounds.x + leafBounds.width - roseteW - 3;
  return leafBounds.x + (leafBounds.width - roseteW) / 2;
}

export interface HorizontalShellLockProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly theme: CadHandleSubRendererTheme;
}

export const HorizontalShellLock: React.FC<HorizontalShellLockProps> = ({ leafBounds, position, theme }) => {
  const shellH = 10;
  const shellW = Math.min(Math.max(leafBounds.width * 0.3, 44), 58);
  const shellY = getHorizontalShellY(position, leafBounds, shellH);
  const shellX = getHorizontalShellX(position, leafBounds, shellW);

  const centerY = shellY + shellH / 2;
  const cavW = shellW - 18;
  const cavH = shellH - 3.6;
  const cavX = shellX + 9;
  const cavY = shellY + 1.8;

  const trigW = 11;
  const trigH = cavH - 0.8;
  const trigX = cavX + (cavW - trigW) / 2;
  const trigY = cavY + 0.4;

  return (
    <g className="cad-handle-horizontal-shell" filter="url(#shadow)">
      <rect
        x={shellX}
        y={shellY}
        width={shellW}
        height={shellH}
        rx={2.8}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={0.9}
      />
      <circle cx={shellX + 4.5} cy={centerY} r={1.2} fill="#334155" opacity={0.7} />
      <line x1={shellX + 4.5} y1={centerY - 0.7} x2={shellX + 4.5} y2={centerY + 0.7} stroke="#0f172a" strokeWidth={0.5} />
      <circle cx={shellX + shellW - 4.5} cy={centerY} r={1.2} fill="#334155" opacity={0.7} />
      <line x1={shellX + shellW - 4.5} y1={centerY - 0.7} x2={shellX + shellW - 4.5} y2={centerY + 0.7} stroke="#0f172a" strokeWidth={0.5} />
      <rect
        x={cavX}
        y={cavY}
        width={cavW}
        height={cavH}
        rx={2}
        fill="#090d16"
        stroke={theme.frameStroke}
        strokeWidth={0.6}
        opacity={0.95}
      />
      <rect
        x={cavX + 0.5}
        y={cavY + 0.5}
        width={cavW - 1}
        height={cavH - 1}
        rx={1.5}
        fill="#1e293b"
        opacity={0.8}
      />
      <rect
        x={trigX}
        y={trigY}
        width={trigW}
        height={trigH}
        rx={1.5}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={0.7}
      />
      <line x1={trigX + 3} y1={trigY + 1} x2={trigX + 3} y2={trigY + trigH - 1} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
      <line x1={trigX + 5.5} y1={trigY + 1} x2={trigX + 5.5} y2={trigY + trigH - 1} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
      <line x1={trigX + 8} y1={trigY + 1} x2={trigX + 8} y2={trigY + trigH - 1} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
      <circle cx={trigX + trigW - 1.6} cy={centerY} r={0.6} fill="#dc2626" opacity={0.9} />
    </g>
  );
};

export interface HorizontalLeverHandleProps {
  readonly leafBounds: LeafBounds;
  readonly barY: number;
  readonly theme: CadHandleSubRendererTheme;
}

export const HorizontalLeverHandle: React.FC<HorizontalLeverHandleProps> = ({ leafBounds, barY, theme }) => {
  const roseteW = 12;
  const roseteH = 10;
  const rX = leafBounds.x + (leafBounds.width - roseteW) / 2;
  const rY = barY - 1;
  const leverLength = 22;

  return (
    <g className="cad-handle-horizontal-lever">
      <rect
        x={rX}
        y={rY}
        width={roseteW}
        height={roseteH}
        rx={2}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={1}
        filter="url(#shadow)"
      />
      <line
        x1={rX + roseteW / 2}
        y1={rY + roseteH / 2}
        x2={rX + roseteW / 2 + leverLength}
        y2={rY + roseteH / 2}
        stroke={theme.frameStroke}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <line
        x1={rX + roseteW / 2}
        y1={rY + roseteH / 2}
        x2={rX + roseteW / 2 + leverLength}
        y2={rY + roseteH / 2}
        stroke={theme.frameFill}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
};

export interface HorizontalLinearHandleProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly handleType: HandleType;
  readonly coverage: HandleCoverage;
  readonly pieceLengthMm: number;
  readonly widthMm: number;
  readonly isBothSides: boolean;
  readonly theme: CadHandleSubRendererTheme;
  readonly barY: number;
  readonly barThickness: number;
}

function calculateHorizontalLinearBar(
  isProfile: boolean,
  coverage: HandleCoverage,
  leafBounds: LeafBounds,
  widthMm: number,
  pieceLengthMm: number,
  position: HandlePosition,
): { barW: number; barX: number } {
  if (isProfile) {
    if (coverage === 'FULL') {
      return {
        barW: leafBounds.width - 12,
        barX: leafBounds.x + 6,
      };
    }
    const scaleX = leafBounds.width / Math.max(widthMm, 1);
    const scaledW = pieceLengthMm * scaleX;
    const barW = Math.max(Math.min(scaledW, leafBounds.width - 12), 28);
    let barX = leafBounds.x + (leafBounds.width - barW) / 2;
    if (position === 'LEFT') {
      barX = leafBounds.x + 6;
    } else if (position === 'RIGHT') {
      barX = leafBounds.x + leafBounds.width - barW - 6;
    }
    return { barW, barX };
  }

  const barW = Math.min(Math.max(leafBounds.width * 0.35, 36), 56);
  let barX = leafBounds.x + (leafBounds.width - barW) / 2;
  if (position === 'LEFT') {
    barX = leafBounds.x + 8;
  } else if (position === 'RIGHT') {
    barX = leafBounds.x + leafBounds.width - barW - 8;
  }
  return { barW, barX };
}

export const HorizontalLinearHandle: React.FC<HorizontalLinearHandleProps> = ({
  leafBounds,
  position,
  handleType,
  coverage,
  pieceLengthMm,
  widthMm,
  isBothSides,
  theme,
  barY,
  barThickness,
}) => {
  const isProfile = handleType === 'PROFILE_HANDLE';
  const { barW, barX } = calculateHorizontalLinearBar(isProfile, coverage, leafBounds, widthMm, pieceLengthMm, position);

  return (
    <g className="cad-handle-horizontal-linear">
      <rect
        x={barX}
        y={barY}
        width={barW}
        height={barThickness}
        rx={isProfile ? 1 : 3}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={1}
        filter="url(#shadow)"
      />

      {isProfile && (
        <>
          <line
            x1={barX + 3}
            y1={barY + barThickness / 2}
            x2={barX + barW - 3}
            y2={barY + barThickness / 2}
            stroke={theme.frameStroke}
            strokeWidth={1.2}
            opacity={0.8}
          />
          <line
            x1={barX + 4}
            y1={barY + barThickness / 2 + 1}
            x2={barX + barW - 4}
            y2={barY + barThickness / 2 + 1}
            stroke="#ffffff"
            strokeWidth={0.6}
            opacity={0.6}
          />
        </>
      )}

      {!isProfile && (
        <>
          <rect x={barX + 4} y={barY - 2} width={3} height={barThickness + 4} fill={theme.frameStroke} rx={0.5} />
          <rect x={barX + barW - 7} y={barY - 2} width={3} height={barThickness + 4} fill={theme.frameStroke} rx={0.5} />
        </>
      )}

      {isBothSides && (
        <g transform={`translate(${barX + barW - 14}, ${barY - 5})`}>
          <rect width={12} height={8} rx={1.5} fill={theme.frameStroke} opacity={0.9} />
          <text x={6} y={6} textAnchor="middle" fontSize={6} fontWeight="bold" fill="#ffffff">2L</text>
        </g>
      )}

      {isProfile && coverage === 'PIECE' && (
        <g className="cad-handle-horizontal-cota">
          <line x1={barX} y1={barY - 3} x2={barX} y2={barY - 8} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.7} />
          <line x1={barX + barW} y1={barY - 3} x2={barX + barW} y2={barY - 8} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.7} />
          <line x1={barX} y1={barY - 6} x2={barX + barW} y2={barY - 6} stroke={COTA_STROKE} strokeWidth={0.6} strokeDasharray="1.5 1" opacity={0.8} />
          <rect
            x={barX + barW / 2 - 14}
            y={barY - 12}
            width={28}
            height={9}
            rx={1.5}
            fill="#ffffff"
            fillOpacity={0.9}
          />
          <text
            x={barX + barW / 2}
            y={barY - 5}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            fill={COTA_COLOR}
          >
            {pieceLengthMm}mm
          </text>
        </g>
      )}
    </g>
  );
};

export interface VerticalShellLockProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly theme: CadHandleSubRendererTheme;
}

export const VerticalShellLock: React.FC<VerticalShellLockProps> = ({ leafBounds, position, theme }) => {
  const shellW = 10;
  const shellH = Math.min(Math.max(leafBounds.height * 0.28, 42), 52);
  const shellY = getVerticalShellY(position, leafBounds, shellH);
  const actualX = getVerticalShellX(position, leafBounds, shellW);

  const centerX = actualX + shellW / 2;
  const cavW = shellW - 3.6;
  const cavH = shellH - 18;
  const cavX = actualX + 1.8;
  const cavY = shellY + 9;

  const trigH = 11;
  const trigW = cavW - 0.8;
  const trigX = cavX + 0.4;
  const trigY = cavY + (cavH - trigH) / 2;

  return (
    <g className="cad-handle-vertical-shell" filter="url(#shadow)">
      <rect
        x={actualX}
        y={shellY}
        width={shellW}
        height={shellH}
        rx={2.8}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={0.9}
      />
      <circle cx={centerX} cy={shellY + 4.5} r={1.2} fill="#334155" opacity={0.7} />
      <line x1={centerX - 0.7} y1={shellY + 4.5} x2={centerX + 0.7} y2={shellY + 4.5} stroke="#0f172a" strokeWidth={0.5} />
      <circle cx={centerX} cy={shellY + shellH - 4.5} r={1.2} fill="#334155" opacity={0.7} />
      <line x1={centerX - 0.7} y1={shellY + shellH - 4.5} x2={centerX + 0.7} y2={shellY + shellH - 4.5} stroke="#0f172a" strokeWidth={0.5} />
      <rect
        x={cavX}
        y={cavY}
        width={cavW}
        height={cavH}
        rx={2}
        fill="#090d16"
        stroke={theme.frameStroke}
        strokeWidth={0.6}
        opacity={0.95}
      />
      <rect
        x={cavX + 0.5}
        y={cavY + 0.5}
        width={cavW - 1}
        height={cavH - 1}
        rx={1.5}
        fill="#1e293b"
        opacity={0.8}
      />
      <rect
        x={trigX}
        y={trigY}
        width={trigW}
        height={trigH}
        rx={1.5}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={0.7}
      />
      <line x1={trigX + 1} y1={trigY + 3} x2={trigX + trigW - 1} y2={trigY + 3} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
      <line x1={trigX + 1} y1={trigY + 5.5} x2={trigX + trigW - 1} y2={trigY + 5.5} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
      <line x1={trigX + 1} y1={trigY + 8} x2={trigX + trigW - 1} y2={trigY + 8} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
      <circle cx={centerX} cy={trigY + trigH - 1.6} r={0.6} fill="#dc2626" opacity={0.9} />
    </g>
  );
};

export interface VerticalLeverHandleProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly theme: CadHandleSubRendererTheme;
}

export const VerticalLeverHandle: React.FC<VerticalLeverHandleProps> = ({ leafBounds, position, theme }) => {
  const roseteW = 9;
  const roseteH = 14;
  const actualY = getVerticalLeverY(position, leafBounds, roseteH);
  const actualX = getVerticalLeverX(position, leafBounds, roseteW);
  const leverDir = position === 'LEFT' ? 1 : -1;

  return (
    <g className="cad-handle-vertical-lever">
      <rect
        x={actualX}
        y={actualY}
        width={roseteW}
        height={roseteH}
        rx={2}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={1}
        filter="url(#shadow)"
      />
      <line
        x1={actualX + roseteW / 2}
        y1={actualY + roseteH / 2}
        x2={actualX + roseteW / 2 + 18 * leverDir}
        y2={actualY + roseteH / 2}
        stroke={theme.frameStroke}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={actualX + roseteW / 2}
        y1={actualY + roseteH / 2}
        x2={actualX + roseteW / 2 + 18 * leverDir}
        y2={actualY + roseteH / 2}
        stroke={theme.frameFill}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>
  );
};

export interface VerticalLinearHandleProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly handleType: HandleType;
  readonly coverage: HandleCoverage;
  readonly pieceLengthMm: number;
  readonly heightMm: number;
  readonly isBothSides: boolean;
  readonly theme: CadHandleSubRendererTheme;
  readonly barX: number;
  readonly barThickness: number;
}

function calculateVerticalLinearBar(
  isProfile: boolean,
  coverage: HandleCoverage,
  leafBounds: LeafBounds,
  heightMm: number,
  pieceLengthMm: number,
  position: HandlePosition,
): { barH: number; barY: number } {
  if (isProfile) {
    if (coverage === 'FULL') {
      return {
        barH: leafBounds.height - 12,
        barY: leafBounds.y + 6,
      };
    }
    const scaleY = leafBounds.height / Math.max(heightMm, 1);
    const scaledH = pieceLengthMm * scaleY;
    const barH = Math.max(Math.min(scaledH, leafBounds.height - 12), 24);
    let barY = leafBounds.y + (leafBounds.height - barH) / 2;
    if (position === 'BOTTOM') {
      barY = leafBounds.y + leafBounds.height - barH - 6;
    } else if (position === 'TOP') {
      barY = leafBounds.y + 6;
    }
    return { barH, barY };
  }

  const barH = Math.min(Math.max(leafBounds.height * 0.3, 38), 58);
  let barY = leafBounds.y + (leafBounds.height - barH) / 2;
  if (position === 'BOTTOM') {
    barY = leafBounds.y + leafBounds.height - barH - 8;
  } else if (position === 'TOP') {
    barY = leafBounds.y + 8;
  }
  return { barH, barY };
}

export const VerticalLinearHandle: React.FC<VerticalLinearHandleProps> = ({
  leafBounds,
  position,
  handleType,
  coverage,
  pieceLengthMm,
  heightMm,
  isBothSides,
  theme,
  barX,
  barThickness,
}) => {
  const isProfile = handleType === 'PROFILE_HANDLE';
  const { barH, barY } = calculateVerticalLinearBar(isProfile, coverage, leafBounds, heightMm, pieceLengthMm, position);

  const cotaOffset = position === 'LEFT' ? 14 : -14;
  const lineX = barX + (position === 'LEFT' ? barThickness + 8 : -8);
  const textAnchor = position === 'LEFT' ? 'start' : 'end';

  return (
    <g className="cad-handle-vertical-linear">
      <rect
        x={barX}
        y={barY}
        width={barThickness}
        height={barH}
        rx={isProfile ? 1 : 3}
        fill={theme.frameFill}
        stroke={theme.frameStroke}
        strokeWidth={1}
        filter="url(#shadow)"
      />

      {isProfile && (
        <>
          <line
            x1={barX + barThickness / 2}
            y1={barY + 3}
            x2={barX + barThickness / 2}
            y2={barY + barH - 3}
            stroke={theme.frameStroke}
            strokeWidth={1.2}
            opacity={0.8}
          />
          <line
            x1={barX + barThickness / 2 + 0.8}
            y1={barY + 4}
            x2={barX + barThickness / 2 + 0.8}
            y2={barY + barH - 4}
            stroke="#ffffff"
            strokeWidth={0.6}
            opacity={0.6}
          />
        </>
      )}

      {!isProfile && (
        <>
          <rect x={barX - 2} y={barY + 4} width={barThickness + 4} height={3} fill={theme.frameStroke} rx={0.5} />
          <rect x={barX - 2} y={barY + barH - 7} width={barThickness + 4} height={3} fill={theme.frameStroke} rx={0.5} />
        </>
      )}

      {isBothSides && (
        <g transform={`translate(${position === 'LEFT' ? barX + barThickness + 1 : barX - 13}, ${barY + 2})`}>
          <rect width={12} height={8} rx={1.5} fill={theme.frameStroke} opacity={0.9} />
          <text x={6} y={6} textAnchor="middle" fontSize={6} fontWeight="bold" fill="#ffffff">2L</text>
        </g>
      )}

      {isProfile && coverage === 'PIECE' && (
        <g className="cad-handle-vertical-cota">
          <line x1={barX} y1={barY} x2={lineX + cotaOffset * 0.3} y2={barY} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.7} />
          <line x1={barX} y1={barY + barH} x2={lineX + cotaOffset * 0.3} y2={barY + barH} stroke={COTA_STROKE} strokeWidth={0.5} opacity={0.7} />
          <line x1={lineX} y1={barY} x2={lineX} y2={barY + barH} stroke={COTA_STROKE} strokeWidth={0.6} strokeDasharray="1.5 1" opacity={0.8} />
          <text
            x={lineX + (position === 'LEFT' ? 3 : -3)}
            y={barY + barH / 2 + 3}
            textAnchor={textAnchor}
            fontSize={8.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            fill={COTA_COLOR}
          >
            {pieceLengthMm}mm
          </text>
        </g>
      )}
    </g>
  );
};
