import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHandleBuilder } from '@/features/budgets/components/builder/hooks/useHandleBuilder';

describe('useHandleBuilder Hook', () => {
  const defaultProps = {
    allowedHandlePositions: ['LEFT', 'RIGHT'] as const,
    defaultHandlePosition: 'RIGHT' as const,
    onConfigChange: vi.fn(),
  };

  describe('Técnica: Tabela de Decisão - Regras de Puxador e Orientação Automática', () => {
    it('deve inicializar com BAR_TUBULAR e valores default', () => {
      const { result } = renderHook(() => useHandleBuilder(defaultProps));

      expect(result.current.handleConfig.handleType).toBe('BAR_TUBULAR');
      expect(result.current.handleConfig.side).toBe('ONE_SIDE');
      expect(result.current.handleConfig.coverage).toBe('FULL');
      expect(result.current.handleConfig.pieceLengthCm).toBe(40);
    });

    it('Regra: Posição TOP ou BOTTOM força orientação HORIZONTAL para maçanetas/fechos', () => {
      const { result } = renderHook(() =>
        useHandleBuilder({
          allowedHandlePositions: ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'],
          defaultHandlePosition: 'RIGHT',
        })
      );

      // Muda para LATCH (fecho concha)
      act(() => {
        result.current.handleHandleTypeChange('LATCH');
      });

      // Transição para TOP
      act(() => {
        result.current.handleHandlePositionChange('TOP');
      });

      expect(result.current.handleConfig.orientation).toBe('HORIZONTAL');

      // Transição para LEFT -> deve forçar VERTICAL
      act(() => {
        result.current.handleHandlePositionChange('LEFT');
      });

      expect(result.current.handleConfig.orientation).toBe('VERTICAL');
    });

    it('Regra: PROFILE_HANDLE com cobertura PIECE preserva pieceLengthCm', () => {
      const { result } = renderHook(() => useHandleBuilder(defaultProps));

      act(() => {
        result.current.handleHandleTypeChange('PROFILE_HANDLE');
      });

      expect(result.current.handleConfig.coverage).toBe('FULL');

      // Altera cobertura para PIECE
      act(() => {
        result.current.handleHandleCoverageChange('PIECE');
      });

      expect(result.current.handleConfig.coverage).toBe('PIECE');
      expect(result.current.handleConfig.pieceLengthCm).toBe(40);

      // Altera o tamanho da peça
      act(() => {
        result.current.handleHandlePieceLengthChange(60);
      });

      expect(result.current.handleConfig.pieceLengthCm).toBe(60);
    });

    it('Regra: Seleção de tipo que não é PROFILE_HANDLE remove coverage e pieceLengthCm', () => {
      const { result } = renderHook(() => useHandleBuilder(defaultProps));

      // Configura como PROFILE_HANDLE e PIECE
      act(() => {
        result.current.handleHandleTypeChange('PROFILE_HANDLE');
        result.current.handleHandleCoverageChange('PIECE');
      });

      expect(result.current.handleConfig.coverage).toBe('PIECE');

      // Troca para KNOB
      act(() => {
        result.current.handleHandleTypeChange('KNOB');
      });

      expect(result.current.handleConfig.coverage).toBeUndefined();
      expect(result.current.handleConfig.pieceLengthCm).toBeUndefined();
    });

    it('Regra: Se posição atual não for permitida para novo tipo, usa defaultHandlePosition', () => {
      const onConfigChange = vi.fn();
      const { result } = renderHook(() =>
        useHandleBuilder({
          allowedHandlePositions: ['RIGHT'],
          defaultHandlePosition: 'RIGHT',
          onConfigChange,
        })
      );

      act(() => {
        result.current.handleHandleTypeChange('BAR_TUBULAR');
      });

      expect(result.current.handleConfig.position).toBe('RIGHT');
      expect(onConfigChange).toHaveBeenCalled();
    });
  });

  describe('Técnica: Particionamento em Classes de Equivalência - Lados de Instalação', () => {
    it('deve alternar entre ONE_SIDE e BOTH_SIDES', () => {
      const { result } = renderHook(() => useHandleBuilder(defaultProps));

      act(() => {
        result.current.handleHandleSideChange('BOTH_SIDES');
      });

      expect(result.current.handleConfig.side).toBe('BOTH_SIDES');

      act(() => {
        result.current.handleHandleSideChange('ONE_SIDE');
      });

      expect(result.current.handleConfig.side).toBe('ONE_SIDE');
    });
  });
});
