import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpeningDirectionSelector } from '../../../features/budgets/components/builder/steps/mechanics/OpeningDirectionSelector';
import { renderWithProviders } from '../../../test/test-utils';
import type { OpeningDirection } from '../../../features/budgets/types';

describe('OpeningDirectionSelector', () => {
  it('não deve renderizar nada se houver 1 ou nenhuma direção suportada', () => {
    const { container } = renderWithProviders(
      <OpeningDirectionSelector
        openingDirection="LEFT_TO_RIGHT"
        supportedDirections={['LEFT_TO_RIGHT']}
        onOpeningDirectionChange={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar botões de direção quando houver 2 ou mais opções', () => {
    const directions: OpeningDirection[] = ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];
    renderWithProviders(
      <OpeningDirectionSelector
        openingDirection="LEFT_TO_RIGHT"
        supportedDirections={directions}
        onOpeningDirectionChange={vi.fn()}
      />
    );

    expect(screen.getByText('Sentido de Abertura da Folha')).toBeInTheDocument();
    expect(screen.getByText(/Abrir p\/ Direita/i)).toBeInTheDocument();
    expect(screen.getByText(/Abrir p\/ Esquerda/i)).toBeInTheDocument();
  });

  it('deve disparar onOpeningDirectionChange ao selecionar outra direção', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const directions: OpeningDirection[] = ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];

    renderWithProviders(
      <OpeningDirectionSelector
        openingDirection="LEFT_TO_RIGHT"
        supportedDirections={directions}
        onOpeningDirectionChange={handleChange}
      />
    );

    const optionRightToLeft = screen.getByText(/Abrir p\/ Esquerda/i);
    await user.click(optionRightToLeft);

    expect(handleChange).toHaveBeenCalledWith('RIGHT_TO_LEFT');
  });
});
