import type { DoorTemplateType, HandleConfig, DrillingConfig } from '../../types/templates';

interface DoorTemplateSvgProps {
  templateType: DoorTemplateType;
  widthMm: number;
  heightMm: number;
  profileMm?: number;
  aluminumColor?: string;
  glassColor?: string;
  handleConfig?: HandleConfig;
  drillingConfig?: DrillingConfig;
  showDimensions?: boolean;
  className?: string;
}

/**
 * Componente SVG paramétrico que renderiza esquadrias de alumínio.
 * Port fiel da lógica do gerador_svg_alumiportas_final.html.
 */
export function DoorTemplateSvg({
  templateType,
  widthMm,
  heightMm,
  profileMm = 20,
  aluminumColor = '#212121',
  glassColor = '#e3f2fd',
  handleConfig,
  drillingConfig,
  showDimensions = true,
  className = '',
}: DoorTemplateSvgProps) {
  const w = widthMm || 400;
  const h = heightMm || 600;
  const profile = profileMm || 20;
  const color = aluminumColor;
  const glass = glassColor;

  // Handle defaults
  const handleLength = handleConfig?.handleLengthMm || 150;
  const handlePos = handleConfig?.handlePosition?.toLowerCase() || 'right';
  const handleOffsetMm = handleConfig?.handleOffsetMm;
  const handleThickness = profile * 1.5;

  // Viewbox com margem para cotas
  const marginX = w * 0.25;
  const marginY = h * 0.25;
  const vbW = w + marginX * 2;
  const vbH = h + marginY * 2;

  const fontSize = Math.max(w, h) * 0.05;

  // --- Funções de renderização ---

  const renderGlass = () => (
    <>
      <rect x={0} y={0} width={w} height={h} fill={glass} />
      {/* Brilho translúcido */}
      <polygon
        points={`0,${h * 0.8} ${w * 0.8},0 ${w},0 0,${h}`}
        fill="#ffffff"
        opacity={0.15}
      />
    </>
  );

  const renderFrame = (x: number, y: number, fw: number, fh: number) => {
    const isWhite = color === '#FFFFFF';
    return (
      <>
        {isWhite && (
          <rect
            x={x} y={y} width={fw} height={fh}
            fill="none" stroke="#bdc3c7"
            strokeWidth={(profile * 2) + 2}
          />
        )}
        <rect
          x={x} y={y} width={fw} height={fh}
          fill="none" stroke={color}
          strokeWidth={profile * 2}
        />
      </>
    );
  };

  const renderHandle = (x: number, y: number, hw: number, hh: number) => (
    <g>
      <rect
        x={x} y={y} width={hw} height={hh}
        fill={color} stroke="#000000" strokeWidth={6}
        rx={6} filter="url(#dropShadow)"
      />
      <rect
        x={x + 3} y={y + 3} width={hw - 6} height={hh - 6}
        fill="none" stroke="#ffffff" strokeWidth={2}
        opacity={0.7} rx={3}
      />
    </g>
  );

  const renderHoles = (edgeX: number, isVertical: boolean) => {
    const holeRadius = Math.max(8, profile * 0.5);
    const positionsY: number[] = [];

    const mode = drillingConfig?.drillingMode || 'EQUAL';
    if (mode === 'EQUAL') {
      const count = drillingConfig?.holeCount ?? 2;
      if (count === 1) {
        positionsY.push(h / 2);
      } else if (count > 1) {
        const interval = h / count;
        for (let i = 0; i < count; i++) {
          positionsY.push(interval / 2 + interval * i);
        }
      }
    } else {
      const customVals = drillingConfig?.customPositionsMm || [];
      customVals.forEach(val => positionsY.push(h - val));
    }

    return positionsY.map((cy, i) => {
      const cx = isVertical ? edgeX : w / 2;
      const yPos = isVertical ? cy : edgeX;
      const xPos = isVertical ? cx : cy;
      return (
        <g key={i}>
          <circle cx={xPos} cy={yPos} r={holeRadius} fill="#111" stroke="#fff" strokeWidth={3} />
          <circle cx={xPos} cy={yPos} r={holeRadius * 0.4} fill="#000" />
        </g>
      );
    });
  };

  const renderDimensions = () => {
    if (!showDimensions) return null;
    return (
      <g>
        {/* Cota horizontal (largura) */}
        <line x1={0} y1={-fontSize} x2={w} y2={-fontSize} stroke="#7f8c8d" strokeWidth={2} />
        <line x1={0} y1={-fontSize * 1.2} x2={0} y2={-fontSize * 0.8} stroke="#7f8c8d" strokeWidth={2} />
        <line x1={w} y1={-fontSize * 1.2} x2={w} y2={-fontSize * 0.8} stroke="#7f8c8d" strokeWidth={2} />
        <text
          x={w / 2} y={-fontSize * 1.5}
          fontFamily="Arial" fontSize={fontSize} fill="#2c3e50"
          textAnchor="middle" fontWeight="bold"
        >
          {w} mm
        </text>

        {/* Cota vertical (altura) */}
        <line x1={-fontSize} y1={0} x2={-fontSize} y2={h} stroke="#7f8c8d" strokeWidth={2} />
        <line x1={-fontSize * 1.2} y1={0} x2={-fontSize * 0.8} y2={0} stroke="#7f8c8d" strokeWidth={2} />
        <line x1={-fontSize * 1.2} y1={h} x2={-fontSize * 0.8} y2={h} stroke="#7f8c8d" strokeWidth={2} />
        <text
          x={-fontSize * 1.5} y={h / 2}
          fontFamily="Arial" fontSize={fontSize} fill="#2c3e50"
          textAnchor="middle" fontWeight="bold"
          transform={`rotate(-90 ${-fontSize * 1.5} ${h / 2})`}
        >
          {h} mm
        </text>
      </g>
    );
  };

  // --- Cálculo de posição do puxador ---
  const computeHandlePosition = () => {
    let hX = 0, hY = 0, hw = 0, hh = 0;

    if (handlePos === 'right' || handlePos === 'left') {
      hw = handleThickness;
      hh = handleLength;
      hX = handlePos === 'right' ? w - hw / 2 : -(hw / 2);
      hY = handleOffsetMm != null ? h - handleOffsetMm - hh / 2 : (h - hh) / 2;
    } else if (handlePos === 'top' || handlePos === 'bottom') {
      hw = handleLength;
      hh = handleThickness;
      hY = handlePos === 'bottom' ? h - hh / 2 : -(hh / 2);
      hX = handleOffsetMm != null ? handleOffsetMm - hw / 2 : (w - hw) / 2;
    } else {
      // center
      hw = handleLength;
      hh = handleThickness;
      hX = (w - hw) / 2;
      hY = (h - hh) / 2;
    }

    return { hX, hY, hw, hh };
  };

  // --- Renderização por tipo de template ---
  const renderTemplate = () => {
    if (templateType === 'GIRO' || templateType === 'BASCULANTE' || templateType === 'GAVETA') {
      const { hX, hY, hw, hh } = computeHandlePosition();

      return (
        <>
          {renderFrame(0, 0, w, h)}
          {templateType === 'GIRO' && renderHoles(
            handlePos === 'left' ? w - profile / 2 : profile / 2,
            true
          )}
          {templateType === 'BASCULANTE' && renderHoles(profile / 2, false)}
          {renderHandle(hX, hY, hw, hh)}
        </>
      );
    }

    if (templateType === 'CORRER') {
      const w2 = w / 2;
      const hw = handleThickness;
      const hh = handleLength;
      const hY = handleOffsetMm != null ? h - handleOffsetMm - hh / 2 : (h - hh) / 2;

      return (
        <>
          {renderFrame(0, 0, w2, h)}
          {renderFrame(w2, 0, w2, h)}
          {renderHandle(-(hw / 2), hY, hw, hh)}
          {renderHandle(w - hw / 2, hY, hw, hh)}
          <line
            x1={w2} y1={0} x2={w2} y2={h}
            stroke="rgba(0,0,0,0.6)" strokeWidth={profile}
          />
        </>
      );
    }

    return null;
  };

  const templateLabel = {
    GIRO: 'Porta de Giro',
    CORRER: 'Porta de Correr',
    BASCULANTE: 'Basculante',
    GAVETA: 'Frente de Gaveta',
  }[templateType];

  return (
    <svg
      viewBox={`${-marginX} ${-marginY} ${vbW} ${vbH}`}
      width="100%"
      height="100%"
      role="img"
      aria-label={`Preview SVG: ${templateLabel} ${w}×${h}mm`}
      className={className}
    >
      <defs>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx={3} dy={3} stdDeviation={3} floodColor="#000" floodOpacity={0.5} />
        </filter>
      </defs>

      {renderGlass()}
      {renderTemplate()}
      {renderDimensions()}
    </svg>
  );
}
