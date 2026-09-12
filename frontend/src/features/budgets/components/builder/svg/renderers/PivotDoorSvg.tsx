import type { HandleConfig, DrillingConfig } from '../../../../types';
import type { SvgTheme } from '../../../../utils/svgTheme';
import { FRAME_W, ARROW_COLOR } from '../svgConstants';
import { SwingArc, HorizontalDimension } from '../SvgDimensions';
import { DrillingHoles } from '../SvgDrillingHoles';
import { HandleElement } from '../SvgHandleElement';

function computeSingleLeafHandle(
  pos: string | undefined,
  fw: number,
  innerW: number,
  inverted: boolean,
  doorEnd: number,
) {
  if (pos === 'LEFT') {
    return { posX: fw + fw * 0.8, mirrored: false };
  }
  if (pos === 'RIGHT') {
    return { posX: fw + innerW - fw * 1.8, mirrored: true };
  }
  if (pos === 'CENTER') {
    return { posX: fw + innerW / 2 - 2.5, mirrored: false };
  }
  return {
    posX: inverted ? doorEnd + 2 : doorEnd - fw * 1.5,
    mirrored: !inverted,
  };
}

interface SwingDoorRenderProps {
  readonly svgW: number;
  readonly svgH: number;
  readonly inverted?: boolean;
  readonly handleConfig: HandleConfig;
  readonly drillingConfig: DrillingConfig;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly theme: SvgTheme;
}

function renderSingleLeafSwingDoor({
  svgW,
  svgH,
  inverted = false,
  handleConfig,
  drillingConfig,
  widthMm,
  heightMm,
  theme,
}: SwingDoorRenderProps) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const hingeSide = inverted ? fw + innerW : fw;
  const doorEnd = inverted ? fw : fw + innerW;
  const arcRadius = innerW;

  const pos = handleConfig.handlePosition || handleConfig.position;
  const { posX, mirrored: mirr } = computeSingleLeafHandle(pos, fw, innerW, inverted, doorEnd);

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <line x1={hingeSide} y1={fw} x2={hingeSide} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <SwingArc x={hingeSide} y={svgH - fw} radius={arcRadius} startAngle={-90} endAngle={inverted ? -180 : 0} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={posX} mirrored={mirr} heightMm={heightMm} />
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'LATERAL'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm}
          heightMm={heightMm}
          posX={inverted ? svgW - fw - fw / 2 : fw + fw / 2}
          mirrored={inverted}
        />
      )}
      <text x={svgW / 2} y={fw + 14} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={ARROW_COLOR}>{inverted ? '← Giro p/ Esquerda' : 'Giro p/ Direita →'}</text>
      <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Vão Único: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

function renderDoubleLeafSwingDoor({
  svgW,
  svgH,
  handleConfig,
  drillingConfig,
  widthMm,
  heightMm,
  theme,
}: SwingDoorRenderProps) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const halfW = innerW / 2;
  const leafMm = Math.round(widthMm / 2);

  return (
    <>
      <rect x={fw} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + halfW} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <line x1={fw} y1={fw} x2={fw} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <SwingArc x={fw} y={svgH - fw} radius={halfW} startAngle={-90} endAngle={0} />
      <SwingArc x={svgW - fw} y={svgH - fw} radius={halfW} startAngle={-90} endAngle={-180} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + halfW - fw} heightMm={heightMm} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + halfW + 2} mirrored heightMm={heightMm} />
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'LATERAL'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm}
          heightMm={heightMm}
          posX={fw + fw / 2}
          mirrored
        />
      )}
      <HorizontalDimension x1={fw} x2={fw + halfW} y={fw} label={`F1: ${leafMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={fw + halfW} x2={svgW - fw} y={fw} label={`F2: ${leafMm}mm`} offsetDir="above" offsetDist={8} />
    </>
  );
}

export type { SwingDoorRenderProps };

export function renderSwingDoor(leafCount: 1 | 2, props: SwingDoorRenderProps) {
  if (leafCount === 1) {
    return renderSingleLeafSwingDoor(props);
  }

  return renderDoubleLeafSwingDoor(props);
}
