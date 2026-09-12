import React from 'react';
import type { OpeningDirection } from '../../../../types';

/**
 * Propriedades para o seletor de sentido de abertura.
 */
export interface OpeningDirectionSelectorProps {
  /** Sentido de abertura selecionado */
  readonly openingDirection: OpeningDirection;
  /** Opções de sentido de abertura suportadas pelo template */
  readonly supportedDirections: readonly OpeningDirection[];
  /** Callback notificado ao alternar o sentido */
  readonly onOpeningDirectionChange: (dir: OpeningDirection) => void;
}

/**
 * Seletor dinâmico de sentido de abertura da esquadria.
 * É renderizado condicionalmente apenas se a tipologia tiver 2 ou mais opções reais de abertura.
 */
export const OpeningDirectionSelector: React.FC<OpeningDirectionSelectorProps> = ({
  openingDirection,
  supportedDirections,
  onOpeningDirectionChange,
}) => {
  if (supportedDirections.length <= 1) return null;

  return (
    <div className="flex flex-col gap-xs pb-xs border-b border-outline-variant/50">
      <div className="text-xs sm:text-sm font-label font-semibold text-on-surface flex items-center gap-xs mb-1">
        <span className="material-symbols-outlined text-[16px] text-primary">swap_horiz</span>
        Sentido de Abertura da Folha
      </div>
      <div className="grid grid-cols-2 gap-xs">
        {supportedDirections.map((dir) => {
          const isSelected = openingDirection === dir;
          let label = 'Abrir';
          let icon = 'swap_horiz';
          if (dir === 'LEFT_TO_RIGHT') {
            label = 'Abrir p/ Direita';
            icon = 'arrow_forward';
          } else if (dir === 'RIGHT_TO_LEFT') {
            label = 'Abrir p/ Esquerda';
            icon = 'arrow_back';
          } else if (dir === 'OUTSIDE') {
            label = 'Para Fora';
            icon = 'open_in_new';
          } else if (dir === 'INSIDE') {
            label = 'Para Dentro';
            icon = 'login';
          } else if (dir === 'CENTER_TO_SIDES') {
            label = 'Centro p/ Lados';
            icon = 'unfold_more';
          }

          return (
            <button
              key={dir}
              type="button"
              onClick={() => onOpeningDirectionChange(dir)}
              className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary-container/20 text-on-surface shadow-xs font-semibold'
                  : 'border-outline-variant hover:border-outline text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isSelected ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {icon}
              </span>
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
