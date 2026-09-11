import type { HandleConfig, HandlePosition, DrillingConfig } from '../../../../types';
import type { SvgTheme } from '../../../../utils/svgTheme';
import { CadHandleRenderer, type LeafBounds } from '../../CadHandleRenderer';
import { HorizontalDimension } from '../CadDimensions';
import { DrillingHoles } from '../DrillingHoles';
import type { ResolvedHandleInfo } from '../resolveHandleInfo';
import { ARROW_COLOR, FRAME_W, RAIL_H } from '../CadConstants';

export function renderSlidingDoor2F(
  svgW: number,
  svgH: number,
  inverted: boolean,
  handleConfig: HandleConfig,
  drillingConfig: DrillingConfig,
  widthMm: number,
  heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const halfW  = innerW / 2;

  const fixedX  = inverted ? fw + halfW : fw;
  const mobileX = inverted ? fw : fw + halfW;
  const railY1  = fw;
  const railY2  = svgH - fw - RAIL_H;

  const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;
  const drillingPosX  = inverted ? fixedX + halfW - fw : fixedX + fw / 2;
  const leafWidthMm = Math.round(widthMm / 2);

  const mobileBounds: LeafBounds = {
    x: mobileX,
    y: fw,
    width: halfW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {/* Folha fixa */}
      <rect x={fixedX}  y={fw} width={halfW} height={innerH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
      <text x={fixedX + halfW / 2}  y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>FIXA</text>

      {/* Folha móvel */}
      <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={mobileX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL</text>

      {/* Divisória central */}
      <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.8} />

      {/* Puxador Declarativo */}
      <CadHandleRenderer
        leafBounds={mobileBounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      {/* Furação */}
      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={drillingPosX} mirrored={!inverted} />

      {/* Seta de abertura */}
      <text x={mobileX + halfW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={16.5} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? '← Correr' : 'Correr →'}
      </text>

      {/* Cotas individuais das 2 folhas */}
      <HorizontalDimension x1={fixedX}  x2={fixedX + halfW}  y={svgH - fw - RAIL_H - 1} label={`F: ${leafWidthMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={mobileX} x2={mobileX + halfW} y={fw + RAIL_H + 1}         label={`M: ${leafWidthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

export function renderSlidingDoor1F(
  svgW: number,
  svgH: number,
  inverted: boolean,
  handleConfig: HandleConfig,
  drillingConfig: DrillingConfig,
  widthMm: number,
  heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;

  const leafBounds: LeafBounds = {
    x: fw,
    y: fw,
    width: innerW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {/* Folha móvel única */}
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={fw + innerW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL</text>

      <CadHandleRenderer
        leafBounds={leafBounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      {drillingConfig.holeCount > 0 && <DrillingHoles svgH={svgH} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + innerW / 2} />}
      <text x={fw + innerW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
    </>
  );
}

export function renderSlidingDoor3F(
  svgW: number,
  svgH: number,
  inverted: boolean,
  handleConfig: HandleConfig,
  drillingConfig: DrillingConfig,
  widthMm: number,
  heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const thirdW = innerW / 3;

  const fixedX   = inverted ? fw + thirdW * 2 : fw;
  const mobile1X = fw + thirdW;
  const mobile2X = inverted ? fw : fw + thirdW * 2;

  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;

  const mobile2Bounds: LeafBounds = {
    x: mobile2X,
    y: fw,
    width: thirdW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {/* Folha fixa */}
      <rect x={fixedX} y={fw} width={thirdW} height={innerH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
      <text x={fixedX + thirdW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>FIXA</text>

      {/* Folha móvel 1 */}
      <rect x={mobile1X} y={fw} width={thirdW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={mobile1X + thirdW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL 1</text>

      {/* Folha móvel 2 */}
      <rect x={mobile2X} y={fw} width={thirdW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={mobile2X + thirdW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL 2</text>

      <rect x={fw + thirdW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.8} />
      <rect x={fw + thirdW * 2 - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.8} />

      <CadHandleRenderer
        leafBounds={mobile2Bounds}
        position={pos}
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      {drillingConfig.holeCount > 0 && <DrillingHoles svgH={svgH} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fixedX + thirdW / 2} />}
      <text x={mobile1X + thirdW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
      <text x={mobile2X + thirdW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
    </>
  );
}

export function renderSlidingDoor4F(
  svgW: number,
  svgH: number,
  handleConfig: HandleConfig,
  drillingConfig: DrillingConfig,
  widthMm: number,
  heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw     = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const qW     = innerW / 4;
  const xs     = [fw, fw + qW, fw + qW * 2, fw + qW * 3];
  const isFixed = [true, false, false, true];
  const leafMm  = Math.round(widthMm / 4);

  const leftMobileBounds: LeafBounds = { x: fw + qW, y: fw, width: qW, height: innerH };
  const rightMobileBounds: LeafBounds = { x: fw + qW * 2, y: fw, width: qW, height: innerH };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={fw} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={svgH - fw - RAIL_H} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {xs.map((x, i) => (
        <g key={`leaf-panel-${x}`}>
          <rect x={x} y={fw} width={qW} height={innerH} fill={isFixed[i] ? theme.fixedGlassFill : theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
          <text x={x + qW / 2} y={svgH / 2} textAnchor="middle" fontSize={10.5} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.4}>
            {isFixed[i] ? 'F' : 'M'}
          </text>
          {i < 3 && <rect x={x + qW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.7} />}
        </g>
      ))}

      {/* Puxadores no encontro central das duas folhas móveis */}
      <CadHandleRenderer
        leafBounds={leftMobileBounds}
        position="RIGHT"
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />
      <CadHandleRenderer
        leafBounds={rightMobileBounds}
        position="LEFT"
        orientation={resolvedHandle?.orientation ?? handleConfig.orientation}
        handleType={resolvedHandle?.handleType ?? handleConfig.handleType}
        coverage={resolvedHandle?.coverage ?? handleConfig.coverage}
        pieceLengthMm={resolvedHandle?.pieceLengthMm ?? (handleConfig.pieceLengthCm ? handleConfig.pieceLengthCm * 10 : 400)}
        heightMm={heightMm}
        widthMm={widthMm}
        side={resolvedHandle?.side ?? handleConfig.side}
        theme={theme}
      />

      <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={fw + fw / 2} mirrored />
      <text x={svgW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={13.5} fill={ARROW_COLOR} fontWeight="bold">← Abertura Central →</text>

      {xs.map((x) => (
        <HorizontalDimension key={`leaf-dim-${x}`} x1={x} x2={x + qW} y={fw + RAIL_H + 1} label={`${leafMm}mm`} offsetDir="below" offsetDist={6} />
      ))}
    </>
  );
}
