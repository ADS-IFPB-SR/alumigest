import React from 'react';
import type { HandlePosition, HandleType, HandleCoverage, HandleSide, HandleOrientation } from '../../types';

export interface LeafBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CadHandleRendererProps {
  leafBounds: LeafBounds;
  position: HandlePosition;
  orientation?: HandleOrientation;
  handleType: HandleType;
  coverage?: HandleCoverage;
  pieceLengthMm?: number;
  heightMm: number;
  widthMm: number;
  side?: HandleSide;
  theme: {
    frameFill: string;
    frameStroke: string;
  };
  mirrored?: boolean;
}

const COTA_COLOR = '#475569';
const COTA_STROKE = '#64748b';

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
  const isHorizontal = position === 'TOP' || position === 'BOTTOM';
  const isCenter = position === 'CENTER';
  const isActuallyHorizontal = orientation
    ? orientation === 'HORIZONTAL'
    : (isHorizontal || (isCenter && widthMm >= heightMm));

  // ──────────────────────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO HORIZONTAL (Deitado - Basculante / Maxim-ar / Base ou Topo / Barra Horizontal)
  // ──────────────────────────────────────────────────────────────────────────
  if (isActuallyHorizontal) {
    const barThickness = 7;
    let barY: number;

    if (position === 'TOP') {
      barY = leafBounds.y + 4;
    } else if (position === 'BOTTOM') {
      barY = leafBounds.y + leafBounds.height - barThickness - 4;
    } else {
      barY = leafBounds.y + (leafBounds.height - barThickness) / 2;
    }

    let barW: number;
    let barX: number;

    if (handleType === 'SHELL_LOCK') {
      const shellH = 10;
      const shellW = Math.min(Math.max(leafBounds.width * 0.3, 44), 58);
      const shellY = position === 'TOP'
        ? leafBounds.y + 4
        : position === 'BOTTOM'
        ? leafBounds.y + leafBounds.height - shellH - 4
        : leafBounds.y + (leafBounds.height - shellH) / 2;
      const shellX = position === 'LEFT'
        ? leafBounds.x + 8
        : position === 'RIGHT'
        ? leafBounds.x + leafBounds.width - shellW - 8
        : leafBounds.x + (leafBounds.width - shellW) / 2;

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
          {/* Espelho Externo de Fixação (cantos arredondados) */}
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

          {/* Parafusos Escareados Laterais */}
          <circle cx={shellX + 4.5} cy={centerY} r={1.2} fill="#334155" opacity={0.7} />
          <line x1={shellX + 4.5} y1={centerY - 0.7} x2={shellX + 4.5} y2={centerY + 0.7} stroke="#0f172a" strokeWidth={0.5} />

          <circle cx={shellX + shellW - 4.5} cy={centerY} r={1.2} fill="#334155" opacity={0.7} />
          <line x1={shellX + shellW - 4.5} y1={centerY - 0.7} x2={shellX + shellW - 4.5} y2={centerY + 0.7} stroke="#0f172a" strokeWidth={0.5} />

          {/* Cava / Concha Recuada Profunda */}
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

          {/* Gatilho Deslizante Central (Trava Automática) */}
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

          {/* Estrias de Pega Ergonômica Verticais */}
          <line x1={trigX + 3} y1={trigY + 1} x2={trigX + 3} y2={trigY + trigH - 1} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
          <line x1={trigX + 5.5} y1={trigY + 1} x2={trigX + 5.5} y2={trigY + trigH - 1} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
          <line x1={trigX + 8} y1={trigY + 1} x2={trigX + 8} y2={trigY + trigH - 1} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />

          {/* Indicador sutil de trava */}
          <circle cx={trigX + trigW - 1.6} cy={centerY} r={0.6} fill="#dc2626" opacity={0.9} />
        </g>
      );
    }

    if (handleType === 'LEVER_HANDLE') {
      const roseteW = 12;
      const roseteH = 10;
      const rX = leafBounds.x + (leafBounds.width - roseteW) / 2;
      const rY = barY - 1;
      const leverLength = 22;

      return (
        <g className="cad-handle-horizontal-lever">
          {/* Roseta / base do fecho basculante */}
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
          {/* Manípulo / Alavanca basculante */}
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
    }

    const isProfile = handleType === 'PROFILE_HANDLE';

    // Puxador Perfil ou Tubular Horizontal
    if (isProfile) {
      if (coverage === 'FULL') {
        barW = leafBounds.width - 12;
        barX = leafBounds.x + 6;
      } else {
        const scaleX = leafBounds.width / Math.max(widthMm, 1);
        const scaledW = pieceLengthMm * scaleX;
        barW = Math.max(Math.min(scaledW, leafBounds.width - 12), 28);
        if (position === 'LEFT') {
          barX = leafBounds.x + 6;
        } else if (position === 'RIGHT') {
          barX = leafBounds.x + leafBounds.width - barW - 6;
        } else {
          barX = leafBounds.x + (leafBounds.width - barW) / 2;
        }
      }
    } else {
      // Puxador Tubular Horizontal (ferragem pré-fabricada de tamanho padrão)
      barW = Math.min(Math.max(leafBounds.width * 0.35, 36), 56);
      if (position === 'LEFT') {
        barX = leafBounds.x + 8;
      } else if (position === 'RIGHT') {
        barX = leafBounds.x + leafBounds.width - barW - 8;
      } else {
        barX = leafBounds.x + (leafBounds.width - barW) / 2;
      }
    }

    return (
      <g className="cad-handle-horizontal-linear">
        {/* Corpo principal do puxador */}
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

        {/* Cava longitudinal ergonômica para perfil */}
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

        {/* Suportes para puxador tubular horizontal */}
        {!isProfile && (
          <>
            <rect x={barX + 4} y={barY - 2} width={3} height={barThickness + 4} fill={theme.frameStroke} rx={0.5} />
            <rect x={barX + barW - 7} y={barY - 2} width={3} height={barThickness + 4} fill={theme.frameStroke} rx={0.5} />
          </>
        )}

        {/* Indicador de 2 Lados */}
        {isBothSides && (
          <g transform={`translate(${barX + barW - 14}, ${barY - 5})`}>
            <rect width={12} height={8} rx={1.5} fill={theme.frameStroke} opacity={0.9} />
            <text x={6} y={6} textAnchor="middle" fontSize={6} fontWeight="bold" fill="#ffffff">2L</text>
          </g>
        )}

        {/* Cota horizontal de comprimento quando em PEDAÇO de PERFIL */}
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
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. RENDERIZAÇÃO VERTICAL (Portas e Janelas de Correr, Giro e Pivotantes)
  // ──────────────────────────────────────────────────────────────────────────
  const barThickness = 7;
  let barX: number;

  if (position === 'LEFT') {
    barX = leafBounds.x + 3;
  } else if (position === 'RIGHT') {
    barX = leafBounds.x + leafBounds.width - barThickness - 3;
  } else {
    // CENTER em folha vertical
    barX = leafBounds.x + (leafBounds.width - barThickness) / 2;
  }

  // A. Fecho Concha Vertical (Espelho com cantos arredondados, parafusos escareados, concha recuada e gatilho com estrias)
  if (handleType === 'SHELL_LOCK') {
    const shellW = 10;
    const shellH = Math.min(Math.max(leafBounds.height * 0.28, 42), 52);
    let shellY: number;
    if (position === 'BOTTOM') {
      shellY = leafBounds.y + leafBounds.height - shellH - 8;
    } else if (position === 'TOP') {
      shellY = leafBounds.y + 8;
    } else {
      shellY = leafBounds.y + (leafBounds.height - shellH) / 2;
    }
    const actualX = position === 'LEFT'
      ? leafBounds.x + 4
      : position === 'RIGHT'
      ? leafBounds.x + leafBounds.width - shellW - 4
      : leafBounds.x + (leafBounds.width - shellW) / 2;

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
        {/* 1. Espelho Externo de Fixação (Alumínio injetado com cantos arredondados) */}
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

        {/* 2. Parafuso Escareado Superior */}
        <circle cx={centerX} cy={shellY + 4.5} r={1.2} fill="#334155" opacity={0.7} />
        <line x1={centerX - 0.7} y1={shellY + 4.5} x2={centerX + 0.7} y2={shellY + 4.5} stroke="#0f172a" strokeWidth={0.5} />

        {/* 3. Parafuso Escareado Inferior */}
        <circle cx={centerX} cy={shellY + shellH - 4.5} r={1.2} fill="#334155" opacity={0.7} />
        <line x1={centerX - 0.7} y1={shellY + shellH - 4.5} x2={centerX + 0.7} y2={shellY + shellH - 4.5} stroke="#0f172a" strokeWidth={0.5} />

        {/* 4. Cava / Concha Recuada Profunda (onde o usuário encaixa o dedo) */}
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
        {/* Chanfro interno / profundidade */}
        <rect
          x={cavX + 0.5}
          y={cavY + 0.5}
          width={cavW - 1}
          height={cavH - 1}
          rx={1.5}
          fill="#1e293b"
          opacity={0.8}
        />

        {/* 5. Gatilho Deslizante de Travamento Automático (Concha Suprema) */}
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

        {/* Frisos / Estrias de Pega Ergonômica (Grip Ridges no Gatilho) */}
        <line x1={trigX + 1} y1={trigY + 3} x2={trigX + trigW - 1} y2={trigY + 3} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
        <line x1={trigX + 1} y1={trigY + 5.5} x2={trigX + trigW - 1} y2={trigY + 5.5} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />
        <line x1={trigX + 1} y1={trigY + 8} x2={trigX + trigW - 1} y2={trigY + 8} stroke={theme.frameStroke} strokeWidth={0.7} strokeLinecap="round" />

        {/* Pequeno indicador de travamento mecânico */}
        <circle cx={centerX} cy={trigY + trigH - 1.6} r={0.6} fill="#dc2626" opacity={0.9} />
      </g>
    );
  }

  // B. Maçaneta / Alavanca Vertical
  if (handleType === 'LEVER_HANDLE') {
    const roseteW = 9;
    const roseteH = 14;
    let actualY: number;
    if (position === 'BOTTOM') {
      actualY = leafBounds.y + leafBounds.height - roseteH - 6;
    } else if (position === 'TOP') {
      actualY = leafBounds.y + 6;
    } else {
      actualY = leafBounds.y + (leafBounds.height - roseteH) / 2;
    }
    const actualX = position === 'LEFT'
      ? leafBounds.x + 3
      : position === 'RIGHT'
      ? leafBounds.x + leafBounds.width - roseteW - 3
      : leafBounds.x + (leafBounds.width - roseteW) / 2;
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
  }

  const isProfile = handleType === 'PROFILE_HANDLE';

  // C. Puxador Perfil ou Tubular Vertical
  let barH: number;
  let barY: number;

  if (isProfile) {
    if (coverage === 'FULL') {
      barH = leafBounds.height - 12;
      barY = leafBounds.y + 6;
    } else {
      const scaleY = leafBounds.height / Math.max(heightMm, 1);
      const scaledH = pieceLengthMm * scaleY;
      barH = Math.max(Math.min(scaledH, leafBounds.height - 12), 24);

      if (position === 'BOTTOM') {
        barY = leafBounds.y + leafBounds.height - barH - 6;
      } else if (position === 'TOP') {
        barY = leafBounds.y + 6;
      } else {
        barY = leafBounds.y + (leafBounds.height - barH) / 2;
      }
    }
  } else {
    // Puxador Tubular Vertical (ferragem pré-fabricada de tamanho padrão proporcional)
    barH = Math.min(Math.max(leafBounds.height * 0.3, 38), 58);
    if (position === 'BOTTOM') {
      barY = leafBounds.y + leafBounds.height - barH - 8;
    } else if (position === 'TOP') {
      barY = leafBounds.y + 8;
    } else {
      barY = leafBounds.y + (leafBounds.height - barH) / 2;
    }
  }

  return (
    <g className="cad-handle-vertical-linear">
      {/* Puxador principal */}
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

      {/* Cava longitudinal para Perfil Puxador */}
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

      {/* Suportes para Tubular Vertical */}
      {!isProfile && (
        <>
          <rect x={barX - 2} y={barY + 4} width={barThickness + 4} height={3} fill={theme.frameStroke} rx={0.5} />
          <rect x={barX - 2} y={barY + barH - 7} width={barThickness + 4} height={3} fill={theme.frameStroke} rx={0.5} />
        </>
      )}

      {/* Indicador de 2 Lados */}
      {isBothSides && (
        <g transform={`translate(${position === 'LEFT' ? barX + barThickness + 1 : barX - 13}, ${barY + 2})`}>
          <rect width={12} height={8} rx={1.5} fill={theme.frameStroke} opacity={0.9} />
          <text x={6} y={6} textAnchor="middle" fontSize={6} fontWeight="bold" fill="#ffffff">2L</text>
        </g>
      )}

      {/* Cota vertical de comprimento quando em PEDAÇO de PERFIL */}
      {isProfile && coverage === 'PIECE' && (
        <g className="cad-handle-vertical-cota">
          {(() => {
            const cotaOffset = position === 'LEFT' ? 14 : -14;
            const lineX = barX + (position === 'LEFT' ? barThickness + 8 : -8);
            const textAnchor = position === 'LEFT' ? 'start' : 'end';
            return (
              <>
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
              </>
            );
          })()}
        </g>
      )}
    </g>
  );
};
