import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HandleConfigSection } from '../../../features/budgets/components/builder/steps/mechanics/HandleConfigSection';

describe('HandleConfigSection', () => {
  const defaultProps = {
    handleConfig: {
      handleType: 'BAR_TUBULAR' as const,
      side: 'ONE_SIDE' as const,
    },
    allowedHandlePositions: ['LEFT', 'RIGHT', 'CENTER'] as any,
    onHandleTypeChange: vi.fn(),
    onHandlePositionChange: vi.fn(),
    onHandleSideChange: vi.fn(),
    onHandleCoverageChange: vi.fn(),
    onHandlePieceLengthChange: vi.fn(),
  };

  it('NAO deve exibir o select de Extensao no Gabarito para puxador tubular inox (BAR_TUBULAR)', () => {
    render(<HandleConfigSection {...defaultProps} handleConfig={{ handleType: 'BAR_TUBULAR', side: 'ONE_SIDE' }} />);

    expect(screen.queryByLabelText(/Extens/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Extens/i)).not.toBeInTheDocument();
  });

  it('DEVE exibir o select de Extensao no Gabarito exclusivamente para perfil puxador (PROFILE_HANDLE)', () => {
    render(
      <HandleConfigSection
        {...defaultProps}
        handleConfig={{
          handleType: 'PROFILE_HANDLE',
          side: 'ONE_SIDE',
          coverage: 'FULL',
        }}
      />
    );

    expect(screen.getByLabelText(/Extens/i)).toBeInTheDocument();
    expect(screen.getByText(/Extens.*no Gabarito/i)).toBeInTheDocument();
  });

  it('DEVE exibir o input de Comprimento do Pedaco para perfil puxador em PIECE', () => {
    render(
      <HandleConfigSection
        {...defaultProps}
        handleConfig={{
          handleType: 'PROFILE_HANDLE',
          side: 'ONE_SIDE',
          coverage: 'PIECE',
          pieceLengthCm: 40,
        }}
      />
    );

    expect(screen.getByLabelText(/Comprimento do Peda/i)).toBeInTheDocument();
  });
});