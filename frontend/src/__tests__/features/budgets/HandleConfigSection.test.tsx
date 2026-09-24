import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HandleConfigSection } from '../../../features/budgets/components/builder/steps/mechanics/HandleConfigSection';
import type { HandlePosition } from '../../../features/budgets/types';

describe('HandleConfigSection [Joseph Nichollas]', () => {
  const defaultProps = {
    handleConfig: {
      handleType: 'BAR_TUBULAR' as const,
      side: 'ONE_SIDE' as const,
      position: 'RIGHT' as HandlePosition,
    },
    allowedHandlePositions: ['LEFT', 'RIGHT', 'CENTER'] as readonly HandlePosition[],
    onHandleTypeChange: vi.fn(),
    onHandlePositionChange: vi.fn(),
    onHandleOrientationChange: vi.fn(),
    onHandleSideChange: vi.fn(),
    onHandleCoverageChange: vi.fn(),
    onHandlePieceLengthChange: vi.fn(),
    onSelectHandleMaterial: vi.fn(),
    onGoToMaterials: vi.fn(),
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
    const onLengthChange = vi.fn();
    render(
      <HandleConfigSection
        {...defaultProps}
        onHandlePieceLengthChange={onLengthChange}
        handleConfig={{
          handleType: 'PROFILE_HANDLE',
          side: 'ONE_SIDE',
          coverage: 'PIECE',
          pieceLengthCm: 40,
        }}
      />
    );

    const lengthInput = screen.getByLabelText(/Comprimento do Peda/i);
    expect(lengthInput).toBeInTheDocument();

    fireEvent.change(lengthInput, { target: { value: '60' } });
    expect(onLengthChange).toHaveBeenCalledWith(60);
  });

  it('deve renderizar insumos vinculados (perfis e ferragens) e acionar onSelectHandleMaterial', () => {
    const onSelect = vi.fn();
    const onGoTo = vi.fn();

    render(
      <HandleConfigSection
        {...defaultProps}
        onSelectHandleMaterial={onSelect}
        onGoToMaterials={onGoTo}
        availableHandleProfiles={[
          { id: 'prof-1', name: 'Perfil Puxador Y', price: 45.0, unit: 'm' },
        ]}
        availableHandleHardwares={[
          { id: 'hw-1', name: 'Puxador Inox 40cm', price: 120.0, unit: 'un' },
        ]}
        handleMaterial={{
          materialId: 'prof-1',
          materialName: 'Perfil Puxador Y',
          categoryType: 'PROFILE',
          unitMeasure: 'm',
          unitPrice: 45,
          quantity: 2,
          totalPrice: 90,
        }}
      />
    );

    expect(screen.getByText('PERFIL DE ALUMÍNIO (M)')).toBeInTheDocument();
    expect(screen.getByText('Restrito a Perfil de Alumínio')).toBeInTheDocument();
    expect(screen.getByText(/Consumo:/i)).toBeInTheDocument();
    expect(screen.getByText('2 m')).toBeInTheDocument();

    // Selecionar outro insumo
    const select = screen.getByLabelText(/Insumo do Puxador/i);
    fireEvent.change(select, { target: { value: 'hw-1' } });
    expect(onSelect).toHaveBeenCalledWith('hw-1');

    // Botão de ir para materiais
    const goToBtn = screen.getByTitle('Gerenciar insumos no Passo 2');
    fireEvent.click(goToBtn);
    expect(onGoTo).toHaveBeenCalledTimes(1);
  });

  it('deve exibir badge FERRAGEM quando insumo for do tipo HARDWARE', () => {
    render(
      <HandleConfigSection
        {...defaultProps}
        handleMaterial={{
          materialId: 'hw-1',
          materialName: 'Fecho Concha',
          categoryType: 'HARDWARE',
          unitMeasure: 'un',
          unitPrice: 35,
          quantity: 1,
          totalPrice: 35,
        }}
      />
    );

    expect(screen.getByText('FERRAGEM (UN/PAR)')).toBeInTheDocument();
    expect(screen.getByText('Restrito a Ferragem')).toBeInTheDocument();
  });

  it('deve disparar onHandleTypeChange ao selecionar um tipo permitido e desabilitar os restritos', () => {
    const onTypeChange = vi.fn();

    render(
      <HandleConfigSection
        {...defaultProps}
        onHandleTypeChange={onTypeChange}
        handleConfig={{ handleType: 'NONE' }}
        handleMaterial={{
          materialId: 'hw-1',
          materialName: 'Fecho Concha',
          categoryType: 'HARDWARE',
          unitMeasure: 'un',
          unitPrice: 35,
          quantity: 1,
          totalPrice: 35,
        }}
      />
    );

    // PROFILE_HANDLE deve estar desabilitado porque o material é HARDWARE
    const profileBtn = screen.getByRole('button', { name: /Perfil Puxador/i });
    expect(profileBtn).toBeDisabled();

    // SHELL_LOCK deve estar habilitado
    const shellBtn = screen.getByRole('button', { name: /Fecho Concha/i });
    expect(shellBtn).not.toBeDisabled();
    fireEvent.click(shellBtn);
    expect(onTypeChange).toHaveBeenCalledWith('SHELL_LOCK');
  });

  it('deve alterar a posição de instalação e a orientação do puxador', () => {
    const onPositionChange = vi.fn();
    const onOrientationChange = vi.fn();
    const onSideChange = vi.fn();
    const onCoverageChange = vi.fn();

    render(
      <HandleConfigSection
        {...defaultProps}
        onHandlePositionChange={onPositionChange}
        onHandleOrientationChange={onOrientationChange}
        onHandleSideChange={onSideChange}
        onHandleCoverageChange={onCoverageChange}
        handleConfig={{
          handleType: 'PROFILE_HANDLE',
          position: 'LEFT',
          side: 'ONE_SIDE',
          coverage: 'FULL',
        }}
      />
    );

    // Posição
    const posBtn = screen.getByRole('button', { name: /Direita/i });
    fireEvent.click(posBtn);
    expect(onPositionChange).toHaveBeenCalledWith('RIGHT');

    // Orientação
    const deitadaBtn = screen.getByRole('button', { name: /Deitada \(Horizontal\)/i });
    fireEvent.click(deitadaBtn);
    expect(onOrientationChange).toHaveBeenCalledWith('HORIZONTAL');

    const emPeBtn = screen.getByRole('button', { name: /Em pé \(Vertical\)/i });
    fireEvent.click(emPeBtn);
    expect(onOrientationChange).toHaveBeenCalledWith('VERTICAL');

    // Lados (Pegada)
    const sideSelect = screen.getByLabelText(/Lados do Puxador/i);
    fireEvent.change(sideSelect, { target: { value: 'BOTH_SIDES' } });
    expect(onSideChange).toHaveBeenCalledWith('BOTH_SIDES');

    // Extensão no gabarito
    const covSelect = screen.getByLabelText(/Extensão do Puxador/i);
    fireEvent.change(covSelect, { target: { value: 'PIECE' } });
    expect(onCoverageChange).toHaveBeenCalledWith('PIECE');
  });
});