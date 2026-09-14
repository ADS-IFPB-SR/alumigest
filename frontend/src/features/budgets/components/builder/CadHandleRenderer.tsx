import React from 'react';
import type { HandlePosition, HandleType, HandleCoverage, HandleSide, HandleOrientation } from '../../types';
import {
  HorizontalShellLock,
  HorizontalLeverHandle,
  HorizontalLinearHandle,
  VerticalShellLock,
  VerticalLeverHandle,
  VerticalLinearHandle,
} from './cadHandleSubRenderers';

export interface LeafBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CadHandleRendererProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly orientation?: HandleOrientation;
  readonly handleType: HandleType;
  readonly coverage?: HandleCoverage;
  readonly pieceLengthMm?: number;
  readonly heightMm: number;
  readonly widthMm: number;
  readonly side?: HandleSide;
  readonly theme: {
    frameFill: string;
    frameStroke: string;
  };
  readonly mirrored?: boolean;
}

interface CadHorizontalHandleProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly handleType: HandleType;
  readonly coverage: HandleCoverage;
  readonly pieceLengthMm: number;
  readonly widthMm: number;
  readonly isBothSides: boolean;
  readonly theme: { frameFill: string; frameStroke: string };
}

const CadHorizontalHandle: React.FC<CadHorizontalHandleProps> = ({
  leafBounds,
  position,
  handleType,
  coverage,
  pieceLengthMm,
  widthMm,
  isBothSides,
  theme,
}) => {
  const barThickness = 7;
  let barY: number;

  if (position === 'TOP') {
    barY = leafBounds.y + 4;
  } else if (position === 'BOTTOM') {
    barY = leafBounds.y + leafBounds.height - barThickness - 4;
  } else {
    barY = leafBounds.y + (leafBounds.height - barThickness) / 2;
  }

  if (handleType === 'SHELL_LOCK') {
    return <HorizontalShellLock leafBounds={leafBounds} position={position} theme={theme} />;
  }

  if (handleType === 'LEVER_HANDLE') {
    return <HorizontalLeverHandle leafBounds={leafBounds} barY={barY} theme={theme} />;
  }

  return (
    <HorizontalLinearHandle
      leafBounds={leafBounds}
      position={position}
      handleType={handleType}
      coverage={coverage}
      pieceLengthMm={pieceLengthMm}
      widthMm={widthMm}
      isBothSides={isBothSides}
      theme={theme}
      barY={barY}
      barThickness={barThickness}
    />
  );
};

interface CadVerticalHandleProps {
  readonly leafBounds: LeafBounds;
  readonly position: HandlePosition;
  readonly handleType: HandleType;
  readonly coverage: HandleCoverage;
  readonly pieceLengthMm: number;
  readonly heightMm: number;
  readonly isBothSides: boolean;
  readonly theme: { frameFill: string; frameStroke: string };
}

const CadVerticalHandle: React.FC<CadVerticalHandleProps> = ({
  leafBounds,
  position,
  handleType,
  coverage,
  pieceLengthMm,
  heightMm,
  isBothSides,
  theme,
}) => {
  const barThickness = 7;
  let barX: number;

  if (position === 'LEFT') {
    barX = leafBounds.x + 3;
  } else if (position === 'RIGHT') {
    barX = leafBounds.x + leafBounds.width - barThickness - 3;
  } else {
    barX = leafBounds.x + (leafBounds.width - barThickness) / 2;
  }

  if (handleType === 'SHELL_LOCK') {
    return <VerticalShellLock leafBounds={leafBounds} position={position} theme={theme} />;
  }

  if (handleType === 'LEVER_HANDLE') {
    return <VerticalLeverHandle leafBounds={leafBounds} position={position} theme={theme} />;
  }

  return (
    <VerticalLinearHandle
      leafBounds={leafBounds}
      position={position}
      handleType={handleType}
      coverage={coverage}
      pieceLengthMm={pieceLengthMm}
      heightMm={heightMm}
      isBothSides={isBothSides}
      theme={theme}
      barX={barX}
      barThickness={barThickness}
    />
  );
};

function checkIsActuallyHorizontal(
  orientation: HandleOrientation | undefined,
  handleType: HandleType,
  position: HandlePosition,
  widthMm: number,
  heightMm: number,
): boolean {
  if (orientation) {
    return orientation === 'HORIZONTAL';
  }
  const isProfileOrBar = handleType === 'PROFILE_HANDLE' || handleType === 'BAR_TUBULAR';
  const isHorizontal = position === 'TOP' || position === 'BOTTOM';
  const isCenter = position === 'CENTER';
  return !isProfileOrBar && (isHorizontal || (isCenter && widthMm >= heightMm));
}

/**
 * Componente declarativo e profissional para renderização vetorial de puxadores no CAD.
 * Suporta orientação mecânica horizontal (deitada), vertical (em pé) e centro.
 */
export const CadHandleRenderer: React.FC<CadHandleRendererProps> = ({
  leafBounds,
  position,
  orientation,
  handleType,
  coverage = 'FULL',
  pieceLengthMm = 400,
  heightMm,
  widthMm,
  side = 'ONE_SIDE',
  theme,
}) => {
  if (handleType === 'NONE') return null;

  const isBothSides = side === 'BOTH_SIDES';
  const isActuallyHorizontal = checkIsActuallyHorizontal(orientation, handleType, position, widthMm, heightMm);

  if (isActuallyHorizontal) {
    return (
      <CadHorizontalHandle
        leafBounds={leafBounds}
        position={position}
        handleType={handleType}
        coverage={coverage}
        pieceLengthMm={pieceLengthMm}
        widthMm={widthMm}
        isBothSides={isBothSides}
        theme={theme}
      />
    );
  }

  return (
    <CadVerticalHandle
      leafBounds={leafBounds}
      position={position}
      handleType={handleType}
      coverage={coverage}
      pieceLengthMm={pieceLengthMm}
      heightMm={heightMm}
      isBothSides={isBothSides}
      theme={theme}
    />
  );
};
