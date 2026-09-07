import React from 'react';
import type { 
  DoorTemplateType, 
  TemplateConfig, 
  AluminumColor, 
  GlassFinish, 
  HandleType, 
  HandleConfig, 
  HoleDrillingConfig,
  OpeningDirection 
} from '../../types';
import { ALUMINUM_COLORS, GLASS_FINISHES, getTemplateDefinition } from './templateDefinitions';

interface DoorTemplateSvgProps {
  templateType?: DoorTemplateType;
  widthMm?: number;
  heightMm?: number;
  config?: TemplateConfig;
  showDimensions?: boolean;
  className?: string;
}

export function DoorTemplateSvg({
  templateType = 'SLIDING_DOOR_2F',
  widthMm,
  heightMm,
  config,
  showDimensions = false,
  className = 'w-full h-full',
}: DoorTemplateSvgProps) {
  const def = getTemplateDefinition(templateType);
  const effectiveWidth = widthMm || def.defaultWidth;
  const effectiveHeight = heightMm || def.defaultHeight;

  // Colors
  const aluminumColorKey: AluminumColor = config?.aluminumColor || 'BLACK';
  const glassFinishKey: GlassFinish = config?.glassFinish || 'CLEAR';

  const alu = ALUMINUM_COLORS.find((c) => c.id === aluminumColorKey) || ALUMINUM_COLORS[0];
  const glass = GLASS_FINISHES.find((g) => g.id === glassFinishKey) || GLASS_FINISHES[0];

  const openingDirection: OpeningDirection = config?.openingDirection || def.supportedOpeningDirections[0] || 'LEFT_TO_RIGHT';
  const handleType: HandleType = config?.handleType || config?.handleConfig?.handleType || def.supportedHandles[0] || 'BAR_TUBULAR';
  const isSlatted = config?.isSlatted ?? (templateType === 'PIVOTING_DOOR');

  const handleConfig: HandleConfig = config?.handleConfig || {
    handleType,
    side: 'ONE_SIDE',
    coverage: 'FULL',
    pieceLengthCm: 20,
  };

  const drillingConfig: HoleDrillingConfig = config?.drillingConfig || {
    holeCount: templateType === 'PIVOTING_DOOR' ? 3 : 2,
    divisionType: 'EQUAL',
  };

  // Aspect ratio calculation
  const aspect = Math.max(0.35, Math.min(2.4, effectiveWidth / effectiveHeight));

  // Canvas bounds inside SVG
  const padLeft = showDimensions ? 52 : 14;
  const padTop = showDimensions ? 42 : 14;
  const padRight = showDimensions ? 22 : 14;
  const padBottom = showDimensions ? 32 : 14;

  const baseHeight = 240;
  const baseWidth = Math.round(baseHeight * aspect);

  const totalSvgWidth = baseWidth + padLeft + padRight;
  const totalSvgHeight = baseHeight + padTop + padBottom;

  const frameX = padLeft;
  const frameY = padTop;
  const frameW = baseWidth;
  const frameH = baseHeight;

  // Frame thickness
  const frameBorder = Math.max(4, Math.round(baseHeight * 0.032));
  const innerX = frameX + frameBorder;
  const innerY = frameY + frameBorder;
  const innerW = frameW - frameBorder * 2;
  const innerH = frameH - frameBorder * 2;

  // Unique ID prefix for gradients
  const uniqueId = React.useId().replace(/:/g, '');

  // ─── HELPER: Render Handle ────────────────────────────────
  const renderHandle = (
    centerX: number,
    topY: number,
    leafH: number,
    hType: HandleType = handleType,
    hCfg: HandleConfig = handleConfig
  ) => {
    if (hType === 'NONE') return null;

    let hLength: number;
    let startY: number;

    if (hCfg.coverage === 'FULL') {
      hLength = leafH * 0.76;
      startY = topY + (leafH - hLength) / 2;
    } else {
      const pieceCm = hCfg.pieceLengthCm || 20;
      const ratio = Math.max(0.12, Math.min(0.65, (pieceCm * 10) / effectiveHeight));
      hLength = leafH * ratio;
      startY = topY + (leafH - hLength) / 2;
    }

    const isBothSides = hCfg.side === 'BOTH_SIDES';

    if (hType === 'BAR_TUBULAR') {
      const barW = 5;
      return (
        <g id="tubular-handle" className="select-none">
          {/* Dual side shadow indicator */}
          {isBothSides && (
            <rect
              x={centerX - barW / 2 - 2}
              y={startY - 2}
              width={barW + 4}
              height={hLength + 4}
              fill="#94A3B8"
              opacity="0.3"
              rx="3"
            />
          )}
          {/* Upper Mounting Flange */}
          <rect x={centerX - 5} y={startY + 4} width="10" height="5" fill="#475569" rx="1.5" />
          <circle cx={centerX} cy={startY + 6.5} r="1.5" fill="#F8FAFC" />

          {/* Lower Mounting Flange */}
          <rect x={centerX - 5} y={startY + hLength - 9} width="10" height="5" fill="#475569" rx="1.5" />
          <circle cx={centerX} cy={startY + hLength - 6.5} r="1.5" fill="#F8FAFC" />

          {/* Main Tubular Stainless Rod */}
          <rect
            x={centerX - barW / 2}
            y={startY}
            width={barW}
            height={hLength}
            fill={`url(#inox-grad-${uniqueId})`}
            stroke="#475569"
            strokeWidth="0.9"
            rx="2.5"
          />
          {/* Highlight line along rod */}
          <line
            x1={centerX - 0.5}
            y1={startY + 3}
            x2={centerX - 0.5}
            y2={startY + hLength - 3}
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeOpacity="0.8"
          />
          {/* Size Tag (if piece) */}
          {hCfg.coverage === 'PIECE' && (
            <text
              x={centerX + 8}
              y={startY + hLength / 2 + 3}
              fill="#0369A1"
              fontSize="7"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {hCfg.pieceLengthCm}cm
            </text>
          )}
        </g>
      );
    }

    if (hType === 'SHELL_LOCK') {
      const lockH = Math.min(32, leafH * 0.22);
      const lockY = topY + (leafH - lockH) / 2;
      return (
        <g id="shell-lock" className="select-none">
          <rect
            x={centerX - 4}
            y={lockY}
            width="8"
            height={lockH}
            fill={alu.borderHex}
            stroke="#CBD5E1"
            strokeWidth="0.8"
            rx="3"
          />
          <rect
            x={centerX - 2}
            y={lockY + 4}
            width="4"
            height={lockH - 8}
            fill="#0F172A"
            rx="1.5"
          />
          {/* Toggle lever */}
          <circle cx={centerX} cy={lockY + lockH / 2} r="2" fill="#E2E8F0" />
        </g>
      );
    }

    if (hType === 'LEVER_HANDLE') {
      const leverY = topY + leafH * 0.5;
      return (
        <g id="lever-handle" className="select-none">
          <rect x={centerX - 4} y={leverY - 10} width="8" height="20" fill="#64748B" rx="2" stroke="#334155" strokeWidth="0.8" />
          <circle cx={centerX} cy={leverY - 3} r="3" fill="#E2E8F0" />
          {/* Lever arm */}
          <rect x={centerX - 2} y={leverY - 5} width="16" height="4" fill={`url(#inox-grad-${uniqueId})`} rx="1.5" stroke="#475569" strokeWidth="0.6" />
        </g>
      );
    }

    return null;
  };

  // ─── HELPER: Render Drilling Holes ────────────────────────
  const renderDrillingHoles = (
    centerX: number,
    topY: number,
    leafH: number,
    dCfg: HoleDrillingConfig = drillingConfig
  ) => {
    const count = dCfg.holeCount ?? 2;
    if (count <= 0) return null;

    // Calculate Y positions for holes
    const yPositions: number[] = [];

    if (dCfg.divisionType === 'CUSTOM_DISTANCE' && dCfg.customDistancesMm && dCfg.customDistancesMm.length > 0) {
      // Scale user distances (in mm) to SVG pixels
      let accumMm = 0;
      dCfg.customDistancesMm.slice(0, count).forEach((d) => {
        accumMm += d;
        const ratio = Math.min(0.95, accumMm / effectiveHeight);
        yPositions.push(topY + leafH * ratio);
      });
    } else {
      // EQUAL distribution with nice engineering margins (e.g. 15% to 85%)
      if (count === 1) {
        yPositions.push(topY + leafH * 0.5);
      } else {
        const startMargin = leafH * 0.14;
        const usableH = leafH * 0.72;
        const step = usableH / (count - 1);
        for (let i = 0; i < count; i++) {
          yPositions.push(topY + startMargin + i * step);
        }
      }
    }

    return (
      <g id="drilling-holes" className="select-none">
        {/* Vertical Center Axis Line */}
        {yPositions.length > 1 && (
          <line
            x1={centerX}
            y1={yPositions[0] - 6}
            x2={centerX}
            y2={yPositions[yPositions.length - 1] + 6}
            stroke="#0284C7"
            strokeWidth="0.8"
            strokeDasharray="3 2"
            opacity="0.8"
          />
        )}

        {/* Drill Hole Marks */}
        {yPositions.map((py, idx) => (
          <g key={idx} transform={`translate(${centerX}, ${py})`}>
            {/* Outer Crosshair Circle */}
            <circle cx="0" cy="0" r="4.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
            {/* Center Punch */}
            <circle cx="0" cy="0" r="1.5" fill="#0369A1" />
            {/* Crosshairs */}
            <line x1="-6" y1="0" x2="6" y2="0" stroke="#0284C7" strokeWidth="0.6" strokeDasharray="1 1" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="#0284C7" strokeWidth="0.6" strokeDasharray="1 1" />
            {/* Hole Index Indicator */}
            <text x="7" y="3" fill="#0284C7" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
              Ø{idx + 1}
            </text>
          </g>
        ))}
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Aluminum Gradient */}
        <linearGradient id={`alu-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={alu.hex} />
          <stop offset="50%" stopColor={alu.hex} stopOpacity="0.92" />
          <stop offset="100%" stopColor={alu.borderHex} />
        </linearGradient>

        {/* Glass Gradient & Reflection */}
        <linearGradient id={`glass-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={glass.fillColor} stopOpacity={glass.opacity} />
          <stop offset="100%" stopColor={glass.fillColor} stopOpacity={Math.max(0.18, glass.opacity - 0.12)} />
        </linearGradient>

        {/* Stainless Steel Handle Gradient */}
        <linearGradient id={`inox-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="35%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Slatted Pattern (for ripado) */}
        <pattern id={`slat-pat-${uniqueId}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke={alu.borderHex} strokeWidth="2.5" />
          <line x1="5" y1="0" x2="5" y2="10" stroke={alu.hex} strokeWidth="3" />
        </pattern>

        {/* Arrow Marker for Dimensions */}
        <marker id={`arrow-${uniqueId}`} viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 1.5 L 4.5 3 L 0 4.5 z" fill="#0284C7" />
        </marker>
      </defs>

      {/* Grid Blueprint Background */}
      <rect
        x={frameX - 4}
        y={frameY - 4}
        width={frameW + 8}
        height={frameH + 8}
        fill="#F8FAFC"
        rx="4"
        stroke="#E2E8F0"
        strokeWidth="1"
      />

      {/* ─── RENDERING BY TEMPLATE TYPE ──────────────────────── */}

      {/* 1. PORTA DE CORRER 2 FOLHAS */}
      {templateType === 'SLIDING_DOOR_2F' && (
        <g id="sliding-door-2f">
          {/* Main Outer Frame */}
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          <line x1={innerX} y1={innerY + 2} x2={innerX + innerW} y2={innerY + 2} stroke={alu.borderHex} strokeWidth="2" strokeDasharray="3 2" />
          <line x1={innerX} y1={innerY + innerH - 2} x2={innerX + innerW} y2={innerY + innerH - 2} stroke={alu.borderHex} strokeWidth="2" />

          {(() => {
            const leafW = innerW / 2 + 4;
            const isLeftOpening = openingDirection === 'RIGHT_TO_LEFT';
            
            // Fixed leaf vs Sliding leaf coordinates
            const fixedX = isLeftOpening ? innerX + innerW / 2 - 4 : innerX;
            const slidingX = isLeftOpening ? innerX : innerX + innerW / 2 - 4;

            // Handle is on the closing edge of sliding door
            const handleX = isLeftOpening 
              ? slidingX + leafW - frameBorder - 6 
              : slidingX + frameBorder + 6;

            // Drilling is on the OPPOSITE OUTER EDGE (wall side)
            const drillX = isLeftOpening
              ? fixedX + leafW - frameBorder - 6
              : fixedX + frameBorder + 6;

            return (
              <>
                {/* Fixed Leaf */}
                <g id="leaf-fixed">
                  <rect x={fixedX} y={innerY + 2} width={leafW} height={innerH - 4} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" />
                  <rect x={fixedX + frameBorder} y={innerY + frameBorder + 2} width={leafW - frameBorder * 2} height={innerH - frameBorder * 2 - 4} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                  {/* Drilling holes on outer edge */}
                  {renderDrillingHoles(drillX, innerY + frameBorder + 2, innerH - frameBorder * 2 - 4)}
                </g>

                {/* Sliding Leaf */}
                <g id="leaf-sliding">
                  <rect x={slidingX} y={innerY + 2} width={leafW} height={innerH - 4} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" />
                  <rect x={slidingX + frameBorder} y={innerY + frameBorder + 2} width={leafW - frameBorder * 2} height={innerH - frameBorder * 2 - 4} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                  {/* Glare Line */}
                  <line x1={slidingX + frameBorder + 4} y1={innerY + frameBorder + 6} x2={slidingX + leafW - frameBorder - 4} y2={innerY + innerH - frameBorder - 10} stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
                  
                  {/* Handle */}
                  {renderHandle(handleX, innerY + frameBorder + 2, innerH - frameBorder * 2 - 4)}

                  {/* Motion Arrow */}
                  <g transform={`translate(${slidingX + leafW / 2}, ${innerY + innerH / 2})`}>
                    <line
                      x1={isLeftOpening ? 15 : -15}
                      y1="0"
                      x2={isLeftOpening ? -15 : 15}
                      y2="0"
                      stroke="#0284C7"
                      strokeWidth="2"
                      markerEnd={`url(#arrow-${uniqueId})`}
                    />
                  </g>
                </g>
              </>
            );
          })()}
        </g>
      )}

      {/* 2. PORTA DE CORRER 4 FOLHAS */}
      {templateType === 'SLIDING_DOOR_4F' && (
        <g id="sliding-door-4f">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          {(() => {
            const numLeaves = 4;
            const singleW = (innerW + 12) / numLeaves;
            const leafH = innerH - frameBorder * 2 - 4;

            // Drilling holes on the 2 outer fixed leaves (leftmost and rightmost edges)
            const leftDrillX = innerX + frameBorder + 4;
            const rightDrillX = innerX + 3 * (singleW - 4) + singleW - frameBorder - 4;

            return (
              <>
                {[0, 1, 2, 3].map((idx) => {
                  const lx = innerX + idx * (singleW - 4);
                  const isCentral = idx === 1 || idx === 2;
                  return (
                    <g key={idx}>
                      <rect x={lx} y={innerY + 2} width={singleW} height={innerH - 4} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.2" />
                      <rect x={lx + frameBorder} y={innerY + frameBorder + 2} width={singleW - frameBorder * 2} height={leafH} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                      
                      {/* Central Leaves Have Handles */}
                      {isCentral && (
                        <g>
                          {renderHandle(
                            idx === 1 ? lx + singleW - frameBorder - 5 : lx + frameBorder + 5,
                            innerY + frameBorder + 2,
                            leafH
                          )}
                          <line
                            x1={idx === 1 ? lx + singleW / 2 + 8 : lx + singleW / 2 - 8}
                            y1={innerY + innerH / 2}
                            x2={idx === 1 ? lx + singleW / 2 - 12 : lx + singleW / 2 + 12}
                            y2={innerY + innerH / 2}
                            stroke="#0284C7"
                            strokeWidth="1.8"
                            markerEnd={`url(#arrow-${uniqueId})`}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Drilling on Outer Opposite Sides */}
                {renderDrillingHoles(leftDrillX, innerY + frameBorder + 2, leafH)}
                {renderDrillingHoles(rightDrillX, innerY + frameBorder + 2, leafH)}
              </>
            );
          })()}
        </g>
      )}

      {/* 3. PORTA PIVOTANTE */}
      {templateType === 'PIVOTING_DOOR' && (
        <g id="pivoting-door">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          {(() => {
            const isLeftHinged = openingDirection !== 'RIGHT_TO_LEFT';
            const pivotOffset = Math.max(14, Math.round(innerW * 0.16));
            const leafX = innerX + 2;
            const leafW = innerW - 4;
            const leafH = innerH - 4;

            // Pivot axis X
            const pivotAxisX = isLeftHinged ? leafX + pivotOffset : leafX + leafW - pivotOffset;

            // Handle position: OPPOSITE TO PIVOT AXIS
            const handleX = isLeftHinged 
              ? leafX + leafW - Math.max(14, Math.round(leafW * 0.14)) 
              : leafX + Math.max(14, Math.round(leafW * 0.14));

            // Drilling holes: ON THE PIVOT / HINGE EDGE (OPPOSITE TO HANDLE)
            const drillX = isLeftHinged ? leafX + 6 : leafX + leafW - 6;

            return (
              <g>
                {/* Leaf body */}
                <rect
                  x={leafX}
                  y={innerY + 2}
                  width={leafW}
                  height={leafH}
                  fill={isSlatted ? `url(#slat-pat-${uniqueId})` : `url(#alu-grad-${uniqueId})`}
                  stroke={alu.borderHex}
                  strokeWidth="2"
                />

                {/* Horizontal Grooves if smooth */}
                {!isSlatted && (
                  <>
                    <line x1={leafX} y1={innerY + leafH * 0.25} x2={leafX + leafW} y2={innerY + leafH * 0.25} stroke={alu.borderHex} strokeWidth="1.5" />
                    <line x1={leafX} y1={innerY + leafH * 0.5} x2={leafX + leafW} y2={innerY + leafH * 0.5} stroke={alu.borderHex} strokeWidth="1.5" />
                    <line x1={leafX} y1={innerY + leafH * 0.75} x2={leafX + leafW} y2={innerY + leafH * 0.75} stroke={alu.borderHex} strokeWidth="1.5" />
                  </>
                )}

                {/* Pivot Axis (Dashed Line) */}
                <line
                  x1={pivotAxisX}
                  y1={innerY - 2}
                  x2={pivotAxisX}
                  y2={innerY + leafH + 6}
                  stroke="#0284C7"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <circle cx={pivotAxisX} cy={innerY + 2} r="3.5" fill="#0284C7" />
                <circle cx={pivotAxisX} cy={innerY + leafH + 2} r="3.5" fill="#0284C7" />

                {/* Handle (Rendered properly with config) */}
                {renderHandle(handleX, innerY + 4, leafH - 8)}

                {/* Drilling Holes on the Hinge / Pivot Edge (Opposite to handle) */}
                {renderDrillingHoles(drillX, innerY + 4, leafH - 8)}

                {/* Pivot Swing Arc */}
                <path
                  d={isLeftHinged
                    ? `M ${leafX + leafW} ${innerY + leafH} A ${leafW * 0.8} ${leafW * 0.8} 0 0 1 ${leafX + leafW * 0.3} ${innerY + leafH + 18}`
                    : `M ${leafX} ${innerY + leafH} A ${leafW * 0.8} ${leafW * 0.8} 0 0 0 ${leafX + leafW * 0.7} ${innerY + leafH + 18}`
                  }
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                  markerEnd={`url(#arrow-${uniqueId})`}
                />
              </g>
            );
          })()}
        </g>
      )}

      {/* 4. PORTA DE GIRO 1 FOLHA */}
      {templateType === 'SWING_DOOR_1F' && (
        <g id="swing-door-1f">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          {(() => {
            const isLeftHinged = openingDirection !== 'RIGHT_TO_LEFT';
            const doorX = innerX + 2;
            const doorW = innerW - 4;
            const doorH = innerH - 4;

            const handleX = isLeftHinged ? doorX + doorW - frameBorder - 5 : doorX + frameBorder + 5;
            const drillX = isLeftHinged ? doorX + frameBorder + 4 : doorX + doorW - frameBorder - 4;

            return (
              <>
                <rect x={doorX} y={innerY + 2} width={doorW} height={doorH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" />
                <rect x={doorX + frameBorder} y={innerY + frameBorder + 2} width={doorW - frameBorder * 2} height={doorH - frameBorder * 2} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                
                {/* Handle on opening side */}
                {renderHandle(handleX, innerY + frameBorder + 2, doorH - frameBorder * 2)}

                {/* Drilling holes on opposite hinge side */}
                {renderDrillingHoles(drillX, innerY + frameBorder + 2, doorH - frameBorder * 2)}

                {/* Swing Arc */}
                <path
                  d={isLeftHinged
                    ? `M ${doorX + doorW} ${innerY + doorH} A ${doorW * 0.7} ${doorW * 0.7} 0 0 1 ${doorX + doorW * 0.4} ${innerY + doorH + 16}`
                    : `M ${doorX} ${innerY + doorH} A ${doorW * 0.7} ${doorW * 0.7} 0 0 0 ${doorX + doorW * 0.6} ${innerY + doorH + 16}`
                  }
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                  markerEnd={`url(#arrow-${uniqueId})`}
                />
              </>
            );
          })()}
        </g>
      )}

      {/* 5. PORTA DE GIRO 2 FOLHAS */}
      {templateType === 'SWING_DOOR_2F' && (
        <g id="swing-door-2f">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          {(() => {
            const singleW = (innerW - 2) / 2;
            const leftX = innerX + 1;
            const rightX = innerX + singleW + 2;
            const doorH = innerH - 4;

            // Handles in the center meeting edge
            const leftHandleX = leftX + singleW - frameBorder - 5;
            const rightHandleX = rightX + frameBorder + 5;

            // Drilling on outer hinge edges
            const leftDrillX = leftX + frameBorder + 4;
            const rightDrillX = rightX + singleW - frameBorder - 4;

            return (
              <>
                {/* Left Door */}
                <rect x={leftX} y={innerY + 2} width={singleW} height={doorH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" />
                <rect x={leftX + frameBorder} y={innerY + frameBorder + 2} width={singleW - frameBorder * 2} height={doorH - frameBorder * 2} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                {renderHandle(leftHandleX, innerY + frameBorder + 2, doorH - frameBorder * 2)}
                {renderDrillingHoles(leftDrillX, innerY + frameBorder + 2, doorH - frameBorder * 2)}

                {/* Right Door */}
                <rect x={rightX} y={innerY + 2} width={singleW} height={doorH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" />
                <rect x={rightX + frameBorder} y={innerY + frameBorder + 2} width={singleW - frameBorder * 2} height={doorH - frameBorder * 2} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                {renderHandle(rightHandleX, innerY + frameBorder + 2, doorH - frameBorder * 2)}
                {renderDrillingHoles(rightDrillX, innerY + frameBorder + 2, doorH - frameBorder * 2)}
              </>
            );
          })()}
        </g>
      )}

      {/* 6. JANELA DE CORRER 2 FOLHAS */}
      {templateType === 'SLIDING_WINDOW_2F' && (
        <g id="sliding-window-2f">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          <rect x={frameX - 2} y={frameY + frameH - 3} width={frameW + 4} height="5" fill={alu.borderHex} rx="1" />
          {(() => {
            const singleW = innerW / 2 + 3;
            const isLeftOpening = openingDirection === 'RIGHT_TO_LEFT';
            const fixedX = isLeftOpening ? innerX + innerW / 2 - 3 : innerX;
            const slideX = isLeftOpening ? innerX : innerX + innerW / 2 - 3;
            const winH = innerH - frameBorder * 2 - 4;

            const handleX = isLeftOpening ? slideX + singleW - frameBorder - 5 : slideX + frameBorder + 5;
            const drillX = isLeftOpening ? fixedX + singleW - frameBorder - 5 : fixedX + frameBorder + 5;

            return (
              <>
                <rect x={fixedX} y={innerY + 2} width={singleW} height={innerH - 4} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.2" />
                <rect x={fixedX + frameBorder} y={innerY + frameBorder + 2} width={singleW - frameBorder * 2} height={winH} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                {renderDrillingHoles(drillX, innerY + frameBorder + 2, winH)}

                <rect x={slideX} y={innerY + 2} width={singleW} height={innerH - 4} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.2" />
                <rect x={slideX + frameBorder} y={innerY + frameBorder + 2} width={singleW - frameBorder * 2} height={winH} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                {renderHandle(handleX, innerY + frameBorder + 2, winH, 'SHELL_LOCK')}
              </>
            );
          })()}
        </g>
      )}

      {/* 7. JANELA DE CORRER 4 FOLHAS */}
      {templateType === 'SLIDING_WINDOW_4F' && (
        <g id="sliding-window-4f">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          <rect x={frameX - 2} y={frameY + frameH - 3} width={frameW + 4} height="5" fill={alu.borderHex} rx="1" />
          {(() => {
            const singleW = (innerW + 12) / 4;
            const winH = innerH - frameBorder * 2 - 4;
            return (
              <>
                {[0, 1, 2, 3].map((idx) => {
                  const lx = innerX + idx * (singleW - 4);
                  return (
                    <g key={idx}>
                      <rect x={lx} y={innerY + 2} width={singleW} height={innerH - 4} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.2" />
                      <rect x={lx + frameBorder} y={innerY + frameBorder + 2} width={singleW - frameBorder * 2} height={winH} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
                      {(idx === 1 || idx === 2) && (
                        renderHandle(idx === 1 ? lx + singleW - frameBorder - 5 : lx + frameBorder + 5, innerY + frameBorder + 2, winH, 'SHELL_LOCK')
                      )}
                    </g>
                  );
                })}
                {renderDrillingHoles(innerX + frameBorder + 4, innerY + frameBorder + 2, winH)}
                {renderDrillingHoles(innerX + 3 * (singleW - 4) + singleW - frameBorder - 4, innerY + frameBorder + 2, winH)}
              </>
            );
          })()}
        </g>
      )}

      {/* 8. JANELA MAXIM-AR */}
      {templateType === 'MAXIM_AR_WINDOW' && (
        <g id="maxim-ar-window">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.5" rx="2" />
          <rect x={innerX + 2} y={innerY + 2} width={innerW - 4} height={innerH - 4} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="1.2" />
          <rect x={innerX + frameBorder + 2} y={innerY + frameBorder + 2} width={innerW - frameBorder * 2 - 4} height={innerH - frameBorder * 2 - 4} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
          {/* Top Pivot / Friction Arm */}
          <line x1={innerX + 4} y1={innerY + 4} x2={innerX + innerW / 2} y2={innerY + innerH - 6} stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1={innerX + innerW - 4} y1={innerY + 4} x2={innerX + innerW / 2} y2={innerY + innerH - 6} stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx={innerX + innerW / 2} cy={innerY + innerH - 10} r="3" fill="#0284C7" />
          {/* Drilling on top mounting edge */}
          {renderDrillingHoles(innerX + 8, innerY + 4, innerH - 8)}
        </g>
      )}

      {/* 9. BOX DE BANHEIRO FRONTAL F1 */}
      {templateType === 'GLASS_BOX_FRONTAL' && (
        <g id="glass-box-frontal">
          {/* Top Heavy-Duty Stainless Track */}
          <rect x={frameX} y={frameY} width={frameW} height="12" fill={`url(#inox-grad-${uniqueId})`} stroke="#64748B" strokeWidth="1" rx="2" />
          {/* Wall Profiles */}
          <rect x={frameX} y={frameY + 12} width="6" height={frameH - 14} fill={alu.borderHex} />
          <rect x={frameX + frameW - 6} y={frameY + 12} width="6" height={frameH - 14} fill={alu.borderHex} />
          {/* Bottom Water Guide */}
          <rect x={frameX} y={frameY + frameH - 4} width={frameW} height="6" fill={`url(#inox-grad-${uniqueId})`} />

          {(() => {
            const fixW = innerW * 0.48;
            const doorW = innerW * 0.54;
            const isLeftOpening = openingDirection === 'RIGHT_TO_LEFT';

            const fixX = isLeftOpening ? innerX + innerW - fixW : innerX + 4;
            const doorX = isLeftOpening ? innerX + 4 : innerX + fixW - 6;

            const handleX = isLeftOpening ? doorX + 16 : doorX + doorW - 16;
            const drillX = isLeftOpening ? fixX + fixW - 8 : fixX + 8;

            return (
              <>
                {/* Fixed Glass Panel */}
                <rect x={fixX} y={frameY + 14} width={fixW} height={frameH - 20} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1.5" rx="1" />
                
                {/* Drilling / Wall Clamp Marks on Fixed Glass (Opposite side to handle) */}
                {renderDrillingHoles(drillX, frameY + 16, frameH - 24)}

                {/* Sliding Door Panel with Rollers */}
                <rect x={doorX} y={frameY + 16} width={doorW} height={frameH - 22} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1.8" rx="1" />

                {/* Exposed Stainless Rollers (Roldanas Aparentes) */}
                <circle cx={doorX + 16} cy={frameY + 6} r="5.5" fill={`url(#inox-grad-${uniqueId})`} stroke="#475569" strokeWidth="1" />
                <circle cx={doorX + doorW - 16} cy={frameY + 6} r="5.5" fill={`url(#inox-grad-${uniqueId})`} stroke="#475569" strokeWidth="1" />

                {/* Handle on Sliding Door */}
                {renderHandle(handleX, frameY + 20, frameH - 32)}

                {/* Motion Arrow */}
                <line
                  x1={doorX + doorW / 2 + (isLeftOpening ? 15 : -15)}
                  y1={frameY + frameH / 2}
                  x2={doorX + doorW / 2 + (isLeftOpening ? -15 : 15)}
                  y2={frameY + frameH / 2}
                  stroke="#0284C7"
                  strokeWidth="2"
                  markerEnd={`url(#arrow-${uniqueId})`}
                />
              </>
            );
          })()}
        </g>
      )}

      {/* 10. BOX DE BANHEIRO CANTO EM L */}
      {templateType === 'GLASS_BOX_CORNER' && (
        <g id="glass-box-corner">
          {/* Top Corner Header Rails */}
          <rect x={frameX} y={frameY} width={frameW} height="12" fill={`url(#inox-grad-${uniqueId})`} stroke="#64748B" strokeWidth="1" rx="2" />
          <rect x={frameX} y={frameY + 12} width="6" height={frameH - 14} fill={alu.borderHex} />
          <rect x={frameX + frameW - 6} y={frameY + 12} width="6" height={frameH - 14} fill={alu.borderHex} />
          <rect x={frameX} y={frameY + frameH - 4} width={frameW} height="6" fill={`url(#inox-grad-${uniqueId})`} />

          {(() => {
            const singleW = (innerW - 8) / 4;
            const h = frameH - 22;

            // 4 Panels: Left Fix, Left Door, Right Door, Right Fix
            const p1X = innerX + 2;
            const p2X = innerX + 2 + singleW;
            const p3X = innerX + 4 + singleW * 2;
            const p4X = innerX + 4 + singleW * 3;

            return (
              <>
                {/* Panel 1: Left Fixed Glass */}
                <rect x={p1X} y={frameY + 14} width={singleW} height={h} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1.4" rx="1" />
                {renderDrillingHoles(p1X + 6, frameY + 16, h - 8)}

                {/* Panel 2: Left Sliding Door */}
                <rect x={p2X} y={frameY + 16} width={singleW + 2} height={h - 2} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1.8" rx="1" />
                <circle cx={p2X + 8} cy={frameY + 6} r="4.5" fill={`url(#inox-grad-${uniqueId})`} stroke="#475569" strokeWidth="0.8" />
                <circle cx={p2X + singleW - 6} cy={frameY + 6} r="4.5" fill={`url(#inox-grad-${uniqueId})`} stroke="#475569" strokeWidth="0.8" />
                {renderHandle(p2X + singleW - 6, frameY + 20, h - 16)}

                {/* Panel 3: Right Sliding Door */}
                <rect x={p3X} y={frameY + 16} width={singleW + 2} height={h - 2} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1.8" rx="1" />
                <circle cx={p3X + 8} cy={frameY + 6} r="4.5" fill={`url(#inox-grad-${uniqueId})`} stroke="#475569" strokeWidth="0.8" />
                <circle cx={p3X + singleW - 6} cy={frameY + 6} r="4.5" fill={`url(#inox-grad-${uniqueId})`} stroke="#475569" strokeWidth="0.8" />
                {renderHandle(p3X + 8, frameY + 20, h - 16)}

                {/* Panel 4: Right Fixed Glass */}
                <rect x={p4X} y={frameY + 14} width={singleW} height={h} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1.4" rx="1" />
                {renderDrillingHoles(p4X + singleW - 6, frameY + 16, h - 8)}

                {/* Corner Meeting Badge */}
                <g transform={`translate(${innerX + innerW / 2}, ${frameY + frameH / 2})`}>
                  <line x1="-12" y1="0" x2="-2" y2="0" stroke="#0284C7" strokeWidth="1.5" markerStart={`url(#arrow-${uniqueId})`} />
                  <line x1="2" y1="0" x2="12" y2="0" stroke="#0284C7" strokeWidth="1.5" markerEnd={`url(#arrow-${uniqueId})`} />
                </g>
              </>
            );
          })()}
        </g>
      )}

      {/* 11. PAINEL FIXO / FACHADA */}
      {templateType === 'FIXED_GLASS_FACADE' && (
        <g id="fixed-glass-facade">
          <rect x={frameX} y={frameY} width={frameW} height={frameH} fill={`url(#alu-grad-${uniqueId})`} stroke={alu.borderHex} strokeWidth="2" rx="2" />
          <line x1={innerX + innerW / 2} y1={frameY} x2={innerX + innerW / 2} y2={frameY + frameH} stroke={alu.borderHex} strokeWidth="5" />
          <line x1={frameX} y1={innerY + innerH / 2} x2={frameX + frameW} y2={innerY + innerH / 2} stroke={alu.borderHex} strokeWidth="5" />

          {(() => {
            const pw = innerW / 2 - 4;
            const ph = innerH / 2 - 4;
            return [
              { x: innerX, y: innerY },
              { x: innerX + innerW / 2 + 3, y: innerY },
              { x: innerX, y: innerY + innerH / 2 + 3 },
              { x: innerX + innerW / 2 + 3, y: innerY + innerH / 2 + 3 },
            ].map((pos, idx) => (
              <rect key={idx} x={pos.x} y={pos.y} width={pw} height={ph} fill={`url(#glass-grad-${uniqueId})`} stroke={glass.strokeColor} strokeWidth="1" />
            ));
          })()}

          {/* Facade Wall Mounting Anchors / Drilling */}
          {renderDrillingHoles(innerX + 6, innerY + 6, innerH - 12)}
          {renderDrillingHoles(innerX + innerW - 6, innerY + 6, innerH - 12)}
        </g>
      )}

      {/* ─── DIMENSION LINES (COTAS TÉCNICAS) ───────────────── */}
      {showDimensions && (
        <g id="technical-dimensions" className="select-none font-mono">
          {/* Top Width Dimension */}
          <g>
            <line x1={frameX} y1={frameY - 2} x2={frameX} y2={frameY - 22} stroke="#0284C7" strokeWidth="0.8" />
            <line x1={frameX + frameW} y1={frameY - 2} x2={frameX + frameW} y2={frameY - 22} stroke="#0284C7" strokeWidth="0.8" />
            <line
              x1={frameX + 3}
              y1={frameY - 14}
              x2={frameX + frameW - 3}
              y2={frameY - 14}
              stroke="#0284C7"
              strokeWidth="1.2"
              markerStart={`url(#arrow-${uniqueId})`}
              markerEnd={`url(#arrow-${uniqueId})`}
            />
            <rect
              x={frameX + frameW / 2 - 34}
              y={frameY - 25}
              width="68"
              height="16"
              fill="#FFFFFF"
              rx="3"
              stroke="#BAE6FD"
              strokeWidth="1"
            />
            <text
              x={frameX + frameW / 2}
              y={frameY - 13}
              textAnchor="middle"
              fill="#0369A1"
              fontSize="10"
              fontWeight="bold"
            >
              {effectiveWidth} mm
            </text>
          </g>

          {/* Left Height Dimension */}
          <g>
            <line x1={frameX - 2} y1={frameY} x2={frameX - 24} y2={frameY} stroke="#0284C7" strokeWidth="0.8" />
            <line x1={frameX - 2} y1={frameY + frameH} x2={frameX - 24} y2={frameY + frameH} stroke="#0284C7" strokeWidth="0.8" />
            <line
              x1={frameX - 14}
              y1={frameY + 3}
              x2={frameX - 14}
              y2={frameY + frameH - 3}
              stroke="#0284C7"
              strokeWidth="1.2"
              markerStart={`url(#arrow-${uniqueId})`}
              markerEnd={`url(#arrow-${uniqueId})`}
            />
            <g transform={`translate(${frameX - 24}, ${frameY + frameH / 2}) rotate(-90)`}>
              <rect x="-32" y="-8" width="64" height="16" fill="#FFFFFF" rx="3" stroke="#BAE6FD" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="bold">
                {effectiveHeight} mm
              </text>
            </g>
          </g>

          {/* Blueprint Tag / Code in Corner */}
          <text
            x={frameX + frameW}
            y={frameY + frameH + 18}
            textAnchor="end"
            fill="#64748B"
            fontSize="9"
            fontWeight="500"
          >
            {def.name} · {alu.name}
          </text>
        </g>
      )}
    </svg>
  );
}
