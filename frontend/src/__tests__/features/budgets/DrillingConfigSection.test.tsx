import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DrillingConfigSection } from '../../../features/budgets/components/builder/steps/mechanics/DrillingConfigSection';
import { renderWithProviders } from '../../../test/test-utils';
import type { DrillingConfig } from '../../../features/budgets/types';

describe('DrillingConfigSection', () => {
  const defaultDrillingConfig: DrillingConfig = {
    holeCount: 3,
    divisionType: 'EQUAL',
    customDistancesMm: [],
  };

  const defaultProps = {
    drillingConfig: defaultDrillingConfig,
    holeDistanceInputs: ['200', '600', '1000'],
    heightMm: 2100,
    defaultHeight: 2100,
    onHoleCountChange: vi.fn(),
    onDivisionTypeChange: vi.fn(),
    onSingleHoleDistanceChange: vi.fn(),
  };

  it('deve renderizar os botões de atalho de quantidade de furos', () => {
    renderWithProviders(<DrillingConfigSection {...defaultProps} />);

    expect(screen.getByRole('button', { name: /sem furos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
  });

  it('deve disparar onHoleCountChange ao clicar em um atalho de furação', async () => {
    const user = userEvent.setup();
    const handleHoleCount = vi.fn();

    renderWithProviders(
      <DrillingConfigSection {...defaultProps} onHoleCountChange={handleHoleCount} />
    );

    const btn4 = screen.getByRole('button', { name: '4' });
    await user.click(btn4);

    expect(handleHoleCount).toHaveBeenCalledWith(4);
  });

  it('deve alternar para modo personalizado e disparar onDivisionTypeChange', async () => {
    const user = userEvent.setup();
    const handleDivisionType = vi.fn();

    renderWithProviders(
      <DrillingConfigSection
        {...defaultProps}
        onDivisionTypeChange={handleDivisionType}
      />
    );

    const select = screen.getByLabelText(/divisão dos furos/i);
    await user.selectOptions(select, 'CUSTOM_DISTANCE');

    expect(handleDivisionType).toHaveBeenCalledWith('CUSTOM_DISTANCE');
  });

  it('deve exibir inputs individuais de cota no modo CUSTOM_DISTANCE e disparar onSingleHoleDistanceChange', async () => {
    const user = userEvent.setup();
    const handleSingleDistance = vi.fn();

    renderWithProviders(
      <DrillingConfigSection
        {...defaultProps}
        drillingConfig={{
          ...defaultDrillingConfig,
          divisionType: 'CUSTOM_DISTANCE',
        }}
        onSingleHoleDistanceChange={handleSingleDistance}
      />
    );

    expect(screen.getByText(/Furo 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Furo 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Furo 3/i)).toBeInTheDocument();

    const inputFuro1 = screen.getByDisplayValue('200');
    await user.clear(inputFuro1);
    await user.type(inputFuro1, '250');

    expect(handleSingleDistance).toHaveBeenCalled();
  });
});
