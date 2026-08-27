import React from 'react';
import type { OpeningDirection, DoorTemplateType } from '../../types';
import { OPENING_DIRECTION_LABELS, TEMPLATE_TYPE_INFO } from '../../types';

interface OpeningDirectionSelectorProps {
  templateType: DoorTemplateType;
  value: OpeningDirection;
  onChange: (dir: OpeningDirection) => void;
}

export const OpeningDirectionSelector: React.FC<OpeningDirectionSelectorProps> = ({
  templateType,
  value,
  onChange,
}) => {
  const info = TEMPLATE_TYPE_INFO[templateType];
  const supportedDirections = info?.supportedDirections ?? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];

  // Apenas exibe se há mais de uma opção suportada
  if (supportedDirections.length <= 1) {
    return (
      <div className="flex items-center gap-sm bg-surface-container p-sm rounded-md text-xs text-on-surface-variant border border-outline-variant">
        <span className="material-symbols-outlined text-[16px]">info</span>
        <span>
          Sentido de abertura:{' '}
          <strong className="text-on-surface">{OPENING_DIRECTION_LABELS[supportedDirections[0] ?? value]}</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
        Sentido de Abertura
      </p>
      <div className="flex flex-wrap gap-sm">
        {supportedDirections.map((dir) => {
          const isSelected = value === dir;
          const label = OPENING_DIRECTION_LABELS[dir];
          const icon =
            dir === 'LEFT_TO_RIGHT' ? 'arrow_forward' :
            dir === 'RIGHT_TO_LEFT' ? 'arrow_back' :
            dir === 'CENTER_TO_SIDES' ? 'unfold_more_double' :
            dir === 'OUTSIDE' ? 'open_in_new' :
            'open_in_full';

          return (
            <button
              key={dir}
              type="button"
              onClick={() => onChange(dir)}
              className={`
                flex items-center gap-xs px-md py-sm rounded-md border-2 text-sm font-label transition-all
                hover:border-primary active:scale-95
                ${isSelected
                  ? 'border-primary bg-secondary-container/40 text-on-surface font-semibold shadow-sm'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
