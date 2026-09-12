import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Step4Summary } from '../../../features/budgets/components/builder/steps/Step4Summary';
import type { BuilderState } from '../../../features/budgets/types';

describe('Step4Summary', () => {
  const baseState: BuilderState = {
    template: null,
    templateType: 'SLIDING_DOOR_2F',
    widthMm: 1600,
    heightMm: 2100,
    quantity: 1,
    openingDirection: 'LEFT_TO_RIGHT',
    aluminumColor: 'Branco',
    glassFinish: 'Incolor 8mm',
    materialSelections: [],
    handleConfig: {
      handleType: 'PROFILE_HANDLE',
      side: 'ONE_SIDE',
      coverage: 'FULL',
      orientation: 'VERTICAL',
      position: 'RIGHT',
    },
    drillingConfig: {
      holeCount: 3,
      divisionType: 'EQUAL',
      drillingPosition: 'SUPERIOR',
    },
    notes: '',
  };

  it('deve exibir label amigavel "Puxador Perfil • 3 furos" em vez do enum bruto', () => {
    render(
      <Step4Summary
        state={baseState}
        svgW={1600}
        svgH={2100}
        unitAreaM2="3.36"
        totalQty={1}
      />
    );

    expect(screen.queryByText(/PROFILE_HANDLE/)).not.toBeInTheDocument();
    expect(screen.getByText(/Puxador Perfil • 3 furos/i)).toBeInTheDocument();
  });

  it('deve exibir "Sem Puxador • Sem furos" quando nao houver puxador nem furacao', () => {
    render(
      <Step4Summary
        state={{
          ...baseState,
          handleConfig: { handleType: 'NONE' },
          drillingConfig: { holeCount: 0, divisionType: 'EQUAL' },
        }}
        svgW={1600}
        svgH={2100}
        unitAreaM2="3.36"
        totalQty={1}
      />
    );

    expect(screen.getByText(/Sem Puxador • Sem furos/i)).toBeInTheDocument();
  });
});