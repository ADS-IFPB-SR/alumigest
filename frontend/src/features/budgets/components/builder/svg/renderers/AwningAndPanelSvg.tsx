import type { HandleConfig, DrillingConfig } from '../../../../types';
import type { SvgTheme } from '../../../../utils/svgTheme';
import { FRAME_W, ARROW_COLOR, COTA_COLOR } from '../svgConstants';
import { HorizontalDimension } from '../SvgDimensions';
import { DrillingHoles } from '../SvgDrillingHoles';
import { HandleElement, HandlePieceDimension } from '../SvgHandleElement';

export function renderAwningWindow1F(
  svgW: number, svgH: number, inverted: boolean,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  heightMm: number,
  theme: SvgTheme,
  widthMm?: number,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const pos = handleConfig.handlePosition || handleConfig.position;

  let handlePosX = fw + innerW / 2 - 2.5;
  if (pos === 'LEFT') handlePosX = fw + fw * 1.5;
  else if (pos === 'RIGHT') handlePosX = fw + innerW - fw * 2.5;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <text x={svgW / 2} y={svgH / 2 + 4} textAnchor="middle" fontSize={13} fill={ARROW_COLOR} fontWeight="bold">
        {inverted ? '↑ Basculante Inv.' : '↓ Basculante'}
      </text>
      <line x1={fw} y1={inverted ? svgH - fw : fw} x2={svgW - fw} y2={inverted ? svgH - fw : fw} stroke={ARROW_COLOR} strokeWidth={2} strokeDasharray="4 4" opacity={0.6} />
      {handleConfig.handleType !== 'NONE' && (
        <>
          <HandleElement handleConfig={handleConfig} svgH={svgH} frameW={fw} posX={handlePosX} heightMm={heightMm} widthMm={widthMm} leafW={innerW} leafX={fw} />
          <HandlePieceDimension svgH={svgH} frameW={fw} posX={handlePosX} handleConfig={handleConfig} heightMm={heightMm} widthMm={widthMm} leafW={innerW} leafX={fw} />
        </>
      )}
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'LATERAL'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={svgW}
          heightMm={heightMm}
          posX={fw + innerW / 2}
        />
      )}
    </>
  );
}

export function renderDrawerFront(
  svgW: number, svgH: number,
  handleConfig: HandleConfig, drillingConfig: DrillingConfig,
  widthMm: number, _heightMm: number,
  theme: SvgTheme,
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;
  const handleW = Math.min(innerW * 0.6, 140);
  const handleH = 10;

  const pos = handleConfig.handlePosition || handleConfig.position;
  let handleY = (svgH - handleH) / 2;
  if (pos === 'TOP') handleY = fw + 10;
  else if (pos === 'BOTTOM') handleY = svgH - fw - handleH - 10;

  let handleX = (svgW - handleW) / 2;
  if (pos === 'LEFT') handleX = fw + 16;
  else if (pos === 'RIGHT') handleX = svgW - fw - handleW - 16;

  return (
    <>
      <rect x={fw} y={fw} width={innerW} height={innerH} fill={theme.glassFill} stroke={theme.glassStroke} strokeWidth={1} />
      <rect x={fw + 6} y={fw + 6} width={innerW - 12} height={innerH - 12} fill="none" stroke={theme.frameStroke} strokeWidth={1} opacity={0.6} strokeDasharray="3 2" />
      <rect x={handleX} y={handleY} width={handleW} height={handleH} rx={3} fill={theme.frameFill} stroke={theme.frameStroke} strokeWidth={1} filter="url(#shadow)" />
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'FRONTAL'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm}
          heightMm={svgH}
          posX={svgW / 2}
        />
      )}
      <text x={svgW / 2} y={svgH - fw - 12} textAnchor="middle" fontSize={16} fontFamily="JetBrains Mono, monospace" fill={theme.frameStroke} opacity={0.6} fontWeight="bold">
        FRENTE DE GAVETA
      </text>
      <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Gaveta: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}

export function renderFixedFacade(
  svgW: number, svgH: number,
  drillingConfig: DrillingConfig,
  widthMm: number, heightMm: number,
  theme: SvgTheme
) {
  const fw = FRAME_W;
  const innerW = svgW - fw * 2;
  const innerH = svgH - fw * 2;

  return (
    <>
      {/* Folha de Vidro Temperado Estrutural (Painel Spider Glass) */}
      <rect
        x={fw}
        y={fw}
        width={innerW}
        height={innerH}
        fill={theme.glassFill}
        stroke={theme.glassStroke}
        strokeWidth={1}
      />

      {/* Borda Lapidada / Chanfro de Vidro Temperado */}
      <rect
        x={fw + 3}
        y={fw + 3}
        width={innerW - 6}
        height={innerH - 6}
        fill="none"
        stroke={theme.glassStroke}
        strokeWidth={0.5}
        opacity={0.4}
        strokeDasharray="4 2"
      />

      {/* Reflexo luminoso sutil de vidro arquitetônico */}
      <polygon
        points={`${fw + 8},${fw} ${fw + 40},${fw} ${fw},${fw + 40} ${fw},${fw + 8}`}
        fill="#ffffff"
        opacity={0.12}
      />

      {/* Rótulo Técnico Central */}
      <text
        x={svgW / 2}
        y={svgH / 2}
        textAnchor="middle"
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fill={theme.frameStroke}
        opacity={0.45}
        fontWeight="bold"
      >
        PAINEL FIXO DE VIDRO
      </text>
      <text
        x={svgW / 2}
        y={svgH / 2 + 13}
        textAnchor="middle"
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        fill={COTA_COLOR}
        opacity={0.65}
      >
        SISTEMA SPIDER GLASS
      </text>

      {/* Furação Spider Glass: 1 furo em cada extremidade da folha */}
      {drillingConfig.holeCount > 0 && (
        <DrillingHoles
          svgH={svgH}
          svgW={svgW}
          frameW={fw}
          count={drillingConfig.holeCount || 4}
          divisionType={drillingConfig.divisionType}
          drillingPosition={drillingConfig.drillingPosition || 'FRONTAL'}
          customDistancesMm={drillingConfig.customDistancesMm}
          widthMm={widthMm}
          heightMm={heightMm}
          posX={fw + 14}
        />
      )}

      <HorizontalDimension x1={fw} x2={svgW - fw} y={svgH - fw} label={`Painel: ${widthMm}mm`} offsetDir="below" offsetDist={8} />
    </>
  );
}
