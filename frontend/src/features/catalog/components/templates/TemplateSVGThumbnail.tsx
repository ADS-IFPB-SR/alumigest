import { DoorTemplateSvg } from './DoorTemplateSvg';
import type { DoorTemplateType } from '../../types/templates';

interface TemplateSVGThumbnailProps {
  templateType?: DoorTemplateType;
  size?: number;
  className?: string;
}

/**
 * Miniatura SVG compacta para uso em tabelas/cards de listagem.
 * Se templateType for null/undefined, exibe placeholder genérico.
 */
export function TemplateSVGThumbnail({
  templateType,
  size = 48,
  className = '',
}: TemplateSVGThumbnailProps) {
  if (!templateType) {
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-surface-container-low border border-dashed border-outline-variant/60 ${className}`}
        style={{ width: size, height: size }}
        aria-label="Produto sem template"
      >
        <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: size * 0.5 }}>
          window
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-md bg-surface-container-low border border-outline-variant/40 overflow-hidden ${className}`}
      style={{ width: size, height: size, padding: 2 }}
    >
      <DoorTemplateSvg
        templateType={templateType}
        widthMm={400}
        heightMm={600}
        profileMm={20}
        aluminumColor="#212121"
        glassColor="#e3f2fd"
        showDimensions={false}
      />
    </div>
  );
}
