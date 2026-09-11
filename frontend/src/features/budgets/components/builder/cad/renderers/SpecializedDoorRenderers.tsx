import type { HandleConfig, HandlePosition, DrillingConfig } from '../../../../types';
import type { SvgTheme } from '../../../../utils/svgTheme';
import { CadHandleRenderer, type LeafBounds } from '../../CadHandleRenderer';
import { HorizontalDimension, SwingArc } from '../CadDimensions';
import { DrillingHoles } from '../DrillingHoles';
import type { ResolvedHandleInfo } from '../resolveHandleInfo';
import { ARROW_COLOR, FRAME_W } from '../CadConstants';

export function renderSwingDoor(
  svgW: number,
  svgH: number,
  leafCount: 1 | 2,
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

  if (leafCount === 1) {
    const hingeSide = inverted ? fw + innerW : fw;
    const arcRadius = innerW;
    const defaultSide: HandlePosition = inverted ? 'LEFT' : 'RIGHT';
    const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultSide;

    const doorBounds: LeafBounds = {
      x: fw,
      y: fw,
      width: innerW,
      height: innerH,
    };

    return (
      <>
        <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
        <line x1={hingeSide} y1={fw} x2={hingeSide} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
        <SwingArc x={hingeSide} y={svgH - fw} radius={arcRadius} startAngle={-90} endAngle={inverted ? -180 : 0} />
        
        <CadHandleRenderer
          leafBounds={doorBounds}
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

        {/* Furação no lado oposto do puxador */}
        <DrillingHoles svgH={svgH} svgW={svgW} frameW={fw} count={drillingConfig.holeCount} divisionType={drillingConfig.divisionType} customDistancesMm={drillingConfig.customDistancesMm} heightMm={heightMm} posX={pos === 'RIGHT' ? fw + fw / 2 : svgW - fw - fw / 2} mirrored={pos === 'LEFT'} />
        <text x={svgW / 2} y={fw + 14} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono, monospace" fill={ARROW_COLOR}>{inverted ? '← Giro p/ Esquerda' : 'Giro p/ Direita →'}</text>
        <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Vão Único: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
      </>
    );
  }

  const halfW = innerW / 2;
  const leafMm = Math.round(widthMm / 2);
  const leftLeafBounds: LeafBounds = { x: fw, y: fw, width: halfW, height: innerH };
  const rightLeafBounds: LeafBounds = { x: fw + halfW, y: fw, width: halfW, height: innerH };

  return (
    <>
      <rect x={fw}         y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + halfW} y={fw} width={halfW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <line x1={fw}        y1={fw} x2={fw}        y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={theme.frameStroke} strokeWidth={3} />
      <SwingArc x={fw}        y={svgH - fw} radius={halfW} startAngle={-90} endAngle={0} />
      <SwingArc x={svgW - fw} y={svgH - fw} radius={halfW} startAngle={-90} endAngle={-180} />
      
      {/* Puxadores no encontro central das duas folhas */}
      <CadHandleRenderer
        leafBounds={leftLeafBounds}
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
        leafBounds={rightLeafBounds}
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
      <HorizontalDimension x1={fw} x2={fw + halfW} y={fw} label={`F1: ${leafMm}mm`} offsetDir="above" offsetDist={8} />
      <HorizontalDimension x1={fw + halfW} x2={svgW - fw} y={svgH - fw} label={`F2: ${leafMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

export function renderAwningWindow1F(
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

  // Posição de instalação (Inferior, Superior, Direita, Esquerda ou Centro)
  const defaultPos: HandlePosition = inverted ? 'TOP' : 'BOTTOM';
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? defaultPos;

  let labelText = inverted ? '⤓ Tombar p/ Dentro' : '↓ Projeção p/ Fora';
  if (pos === 'TOP') labelText = inverted ? '⤓ Tombar p/ Dentro (Superior)' : '↑ Projeção p/ Fora (Superior)';
  else if (pos === 'BOTTOM') labelText = inverted ? '↥ Tombar p/ Dentro (Inferior)' : '↓ Projeção p/ Fora (Inferior)';
  else if (pos === 'RIGHT') labelText = inverted ? '↶ Abrir p/ Dentro (Direita)' : '→ Projeção Direita';
  else if (pos === 'LEFT') labelText = inverted ? '↷ Abrir p/ Dentro (Esquerda)' : '← Projeção Esquerda';
  else if (pos === 'CENTER') labelText = inverted ? 'Tombar p/ Dentro' : 'Projeção p/ Fora';

  const leafBounds: LeafBounds = {
    x: fw,
    y: fw,
    width: innerW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={svgW / 2} y={svgH / 2 + 4} textAnchor="middle" fontSize={13} fill={ARROW_COLOR} fontWeight="bold">
        {labelText}
      </text>

      {/* Linha tracejada indicando o eixo de articulação no lado oposto ao puxador */}
      {pos === 'LEFT' && (
        <line x1={svgW - fw} y1={fw} x2={svgW - fw} y2={svgH - fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}
      {pos === 'RIGHT' && (
        <line x1={fw} y1={fw} x2={fw} y2={svgH - fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}
      {pos === 'TOP' && (
        <line x1={fw} y1={svgH - fw} x2={svgW - fw} y2={svgH - fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}
      {(pos === 'BOTTOM' || pos === 'CENTER') && (
        <line x1={fw} y1={fw} x2={svgW - fw} y2={fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      )}

      {/* Puxador / Fecho renderizado via CadHandleRenderer (suporta deitado/horizontal ou em pé/vertical) */}
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

      {/* Furação da Esquadria posicionada no lado oposto do puxador quando vertical */}
      <DrillingHoles
        svgH={svgH}
        svgW={svgW}
        frameW={fw}
        count={drillingConfig.holeCount}
        divisionType={drillingConfig.divisionType}
        customDistancesMm={drillingConfig.customDistancesMm}
        heightMm={heightMm}
        posX={pos === 'RIGHT' ? fw + fw * 0.5 : svgW - fw - fw * 0.5}
        mirrored={pos === 'LEFT'}
      />
    </>
  );
}

export function renderDrawerFront(
  svgW: number,
  svgH: number,
  handleConfig: HandleConfig,
  _drillingConfig: DrillingConfig,
  widthMm: number,
  heightMm: number,
  theme: SvgTheme,
  resolvedHandle?: ResolvedHandleInfo,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const pos: HandlePosition = resolvedHandle?.position ?? handleConfig.position ?? 'CENTER';

  const leafBounds: LeafBounds = {
    x: fw,
    y: fw,
    width: innerW,
    height: innerH,
  };

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + 6} y={fw + 6} width={innerW - 12} height={innerH - 12} fill="none" stroke={theme.frameStroke} strokeWidth={1} opacity={0.6} strokeDasharray="3 2" />

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

      <text x={svgW / 2} y={svgH - fw - 12} textAnchor="middle" fontSize={14} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.6} fontWeight="bold">
        FRENTE DE GAVETA
      </text>
      <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Gaveta: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

export function renderFixedFacade(svgW: number, svgH: number, theme: SvgTheme) {
  const fw        = FRAME_W;
  const innerW    = svgW - fw * 2;
  const innerH    = svgH - fw * 2;
  const panelOffsets = [0, 1, 2] as const;
  const panelW    = innerW / panelOffsets.length;

  return (
    <>
      {panelOffsets.map((panelIndex) => {
        const px = fw + panelIndex * panelW;
        return (
          <g key={`facade-panel-${px}`}>
            <rect x={px} y={fw} width={panelW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={0.8} />
            {panelIndex > 0 && <rect x={px - 1} y={fw} width={2} height={innerH} fill={theme.frameStroke} />}
          </g>
        );
      })}
    </>
  );
}
