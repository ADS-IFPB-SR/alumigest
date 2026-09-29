import type { HandleConfig, DrillingConfig } from '../../../../types';
import type { SvgTheme } from '../../../../utils/svgTheme';
import { FRAME_W, RAIL_H, ARROW_COLOR } from '../svgConstants';
import { HorizontalDimension } from '../SvgDimensions';
import { DrillingHoles } from '../SvgDrillingHoles';
import { HandleElement, HandlePieceDimension } from '../SvgHandleElement';

export interface SlidingDoorRenderProps {
  readonly svgW: number;
  readonly svgH: number;
  readonly inverted?: boolean;
  readonly handleConfig: HandleConfig;
  readonly drillingConfig: DrillingConfig;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly theme: SvgTheme;
}

export function renderSlidingDoor1F(props: SlidingDoorRenderProps) {
  const { svgW, svgH, inverted = false, handleConfig, drillingConfig, widthMm, heightMm, theme } = props;
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  const pos = handleConfig.handlePosition || handleConfig.position;
  let handlePosX: number;
  let handleMirr: boolean;
  if (pos === 'LEFT') {
    handlePosX = fw + fw * 0.8;
    handleMirr = false;
  } else if (pos === 'RIGHT') {
    handlePosX = fw + innerW - fw * 1.8;
    handleMirr = true;
  } else if (pos === 'CENTER') {
    handlePosX = fw + innerW / 2 - 2.5;
    handleMirr = false;
  } else {
    handlePosX = inverted ? fw + innerW - fw * 1.5 : fw + fw * 0.5;
    handleMirr = !inverted;
  }

  let drillingPosX: number;
  let drillingMirr: boolean;
  if (pos === 'LEFT') {
    drillingPosX = fw + innerW - 14;
    drillingMirr = false;
  } else if (pos === 'RIGHT') {
    drillingPosX = fw + 14;
    drillingMirr = true;
  } else {
    drillingPosX = inverted ? fw + innerW - 14 : fw + 14;
    drillingMirr = !inverted;
  }

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      
      {drillingConfig.holeCount > 0 && drillingConfig.drillingPosition === 'LATERAL' && (
        <rect
          x={drillingMirr ? fw : fw + innerW - 20}
          y={fw}
          width={20}
          height={innerH}
          fill={theme.frameStroke}
          opacity={0.06}
        />
      )}

      <text x={fw + innerW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL</text>

      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={handlePosX} mirrored={handleMirr} heightMm={heightMm} widthMm={widthMm} leafW={innerW} leafX={fw} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={handlePosX} handleConfig={handleConfig} heightMm={heightMm} widthMm={widthMm} leafW={innerW} leafX={fw} mirrored={handleMirr} />
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'SUPERIOR'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm || 1000}
          heightMm={heightMm}
          posX={drillingPosX}
          mirrored={drillingMirr}
        />
      )}
      <text x={fw + innerW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
    </>
  );
}

export function renderSlidingDoor2F(props: SlidingDoorRenderProps) {
  const { svgW, svgH, inverted = false, handleConfig, drillingConfig, widthMm, heightMm, theme } = props;
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const halfW = innerW / 2;

  const fixedX = inverted ? fw + halfW : fw;
  const mobileX = inverted ? fw : fw + halfW;
  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  const pos = handleConfig.handlePosition || handleConfig.position;
  let handlePosX: number;
  let handleMirr: boolean;
  if (pos === 'LEFT') {
    handlePosX = mobileX + fw * 0.8;
    handleMirr = false;
  } else if (pos === 'RIGHT') {
    handlePosX = mobileX + halfW - fw * 1.8;
    handleMirr = true;
  } else if (pos === 'CENTER') {
    handlePosX = mobileX + halfW / 2 - 2.5;
    handleMirr = false;
  } else {
    handlePosX = inverted ? mobileX + halfW - fw * 1.5 : mobileX + fw * 0.5;
    handleMirr = !inverted;
  }

  const drillingPosX = inverted ? fixedX + halfW - fw : fixedX + fw / 2;
  const leafWidthMm = Math.round(widthMm / 2);

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.5} />
      <rect x={fw} y={railY1} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />
      <rect x={fw} y={railY2} width={innerW} height={RAIL_H} fill={theme.railFill} opacity={0.6} />

      {/* Folha fixa */}
      <rect x={fixedX} y={fw} width={halfW} height={innerH} fill={theme.fixedGlassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
      <text x={fixedX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>FIXA</text>

      {/* Folha móvel */}
      <rect x={mobileX} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={mobileX + halfW / 2} y={svgH / 2} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.5}>MÓVEL</text>

      {/* Divisória central */}
      <rect x={fw + halfW - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} opacity={0.8} />

      {/* Puxador */}
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={handlePosX} mirrored={handleMirr} heightMm={heightMm} widthMm={widthMm} leafW={halfW} leafX={mobileX} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={handlePosX} handleConfig={handleConfig} heightMm={heightMm} widthMm={widthMm} leafW={halfW} leafX={mobileX} mirrored={handleMirr} />

      {/* Furação */}
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'SUPERIOR'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm}
          heightMm={heightMm}
          posX={drillingPosX}
          mirrored={!inverted}
        />
      )}

      {/* Seta de abertura */}
      <text x={mobileX + halfW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={16.5} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? '← Correr' : 'Correr →'}
      </text>

      {/* Cotas individuais das 2 folhas */}
      <HorizontalDimension x1={fixedX} x2={fixedX + halfW} y={svgH - fw - RAIL_H - 1} label={`F: ${leafWidthMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={mobileX} x2={mobileX + halfW} y={fw + RAIL_H + 1} label={`M: ${leafWidthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

export function renderSlidingDoor3F(props: SlidingDoorRenderProps) {
  const { svgW, svgH, inverted = false, handleConfig, drillingConfig, widthMm, heightMm, theme } = props;
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const thirdW = innerW / 3;

  const fixedX = inverted ? fw + thirdW * 2 : fw;
  const mobile1X = fw + thirdW;
  const mobile2X = inverted ? fw : fw + thirdW * 2;

  const railY1 = fw;
  const railY2 = svgH - fw - RAIL_H;

  const pos = handleConfig.handlePosition || handleConfig.position;
  let handlePosX: number;
  let handleMirr: boolean;
  if (pos === 'LEFT') {
    handlePosX = mobile2X + fw * 0.8;
    handleMirr = false;
  } else if (pos === 'RIGHT') {
    handlePosX = mobile2X + thirdW - fw * 1.8;
    handleMirr = true;
  } else if (pos === 'CENTER') {
    handlePosX = mobile2X + thirdW / 2 - 2.5;
    handleMirr = false;
  } else {
    handlePosX = inverted ? mobile2X + thirdW - fw * 1.5 : mobile2X + fw * 0.5;
    handleMirr = !inverted;
  }

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

      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={handlePosX} mirrored={handleMirr} heightMm={heightMm} widthMm={widthMm} leafW={thirdW} leafX={mobile2X} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={handlePosX} handleConfig={handleConfig} heightMm={heightMm} widthMm={widthMm} leafW={thirdW} leafX={mobile2X} mirrored={handleMirr} />
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'SUPERIOR'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm || 1500}
          heightMm={heightMm}
          posX={inverted ? fixedX + thirdW - fw * 1.5 : fixedX + fw * 1.5}
          mirrored={inverted}
        />
      )}
      <text x={mobile1X + thirdW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
      <text x={mobile2X + thirdW / 2} y={svgH - fw - 10} textAnchor="middle" fontSize={15} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? 'Correr ⟶' : '⟵ Correr'}
      </text>
    </>
  );
}

export function renderSlidingDoor4F(props: SlidingDoorRenderProps) {
  const { svgW, svgH, handleConfig, drillingConfig, widthMm, heightMm, theme } = props;
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const qW = innerW / 4;
  const xs = [fw, fw + qW, fw + qW * 2, fw + qW * 3];
  const isFixed = [true, false, false, true];
  const leafMm = Math.round(widthMm / 4);

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

      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW + qW * 0.1} heightMm={heightMm} widthMm={widthMm} leafW={qW} leafX={fw + qW} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={fw + qW + qW * 0.1} handleConfig={handleConfig} heightMm={heightMm} widthMm={widthMm} leafW={qW} leafX={fw + qW} />
      <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={fw + qW * 3 - fw * 1.5} mirrored heightMm={heightMm} widthMm={widthMm} leafW={qW} leafX={fw + qW * 2} />
      <HandlePieceDimension svgH={svgH} frameW={fw} posX={fw + qW * 3 - fw * 1.5} mirrored handleConfig={handleConfig} heightMm={heightMm} widthMm={widthMm} leafW={qW} leafX={fw + qW * 2} />
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'SUPERIOR'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm}
          heightMm={heightMm}
          posX={fw + fw / 2}
          mirrored
        />
      )}
      <text x={svgW / 2} y={svgH - fw - RAIL_H - 6} textAnchor="middle" fontSize={13.5} fill={ARROW_COLOR} fontWeight="bold">← Abertura Central →</text>

      {xs.map((x) => (
        <HorizontalDimension key={`leaf-dim-${x}`} x1={x} x2={x + qW} y={fw + RAIL_H + 1} label={`${leafMm}mm`} offsetDir="below" offsetDist={6} />
      ))}
    </>
  );
}
