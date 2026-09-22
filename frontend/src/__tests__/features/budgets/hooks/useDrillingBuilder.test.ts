import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDrillingBuilder, getDefaultHoleDistances } from '@/features/budgets/components/builder/hooks/useDrillingBuilder';

describe('useDrillingBuilder Hook', () => {
  describe('Técnica: Análise do Valor Limite (BVA) - getDefaultHoleDistances', () => {
    it('deve retornar array vazio se a quantidade de furos for zero ou negativa (Limite Inferior)', () => {
      // [BVA: count <= 0]
      expect(getDefaultHoleDistances(0, 2100)).toEqual([]);
      expect(getDefaultHoleDistances(-1, 2100)).toEqual([]);
    });

    it('deve calcular distância equidistante para 1 furo (centro)', () => {
      // [BVA: count = 1]
      // step = 2100 / (1 + 1) = 1050
      const dists = getDefaultHoleDistances(1, 2100);
      expect(dists).toEqual([1050]);
    });

    it('deve calcular distâncias equidistantes para múltiplos furos', () => {
      // [Equivalência: count = 2]
      // step = 2100 / (2 + 1) = 700 -> [700, 1400]
      const dists = getDefaultHoleDistances(2, 2100);
      expect(dists).toEqual([700, 1400]);
    });
  });

  describe('Técnica: Transição de Estados - useDrillingBuilder', () => {
    it('deve inicializar com configuração padrão de 2 furos equidistantes', () => {
      const { result } = renderHook(() => useDrillingBuilder({ heightMm: 2100 }));

      expect(result.current.drillingConfig.holeCount).toBe(2);
      expect(result.current.drillingConfig.divisionType).toBe('EQUAL');
      expect(result.current.drillingConfig.customDistancesMm).toEqual([700, 1400]);
      expect(result.current.holeDistanceInputs).toEqual(['700', '1400']);
    });

    it('deve atualizar distâncias ao alterar quantidade de furos preservando furos anteriores', () => {
      const { result } = renderHook(() => useDrillingBuilder({ heightMm: 2100 }));

      act(() => {
        result.current.handleHoleCountChange(3);
      });

      expect(result.current.drillingConfig.holeCount).toBe(3);
      // Mantém [700, 1400] e calcula o terceiro baseado nos defaults de 3 furos (step=525, 3º=1575)
      expect(result.current.drillingConfig.customDistancesMm).toEqual([700, 1400, 1575]);
      expect(result.current.holeDistanceInputs).toEqual(['700', '1400', '1575']);
    });

    it('deve alterar o tipo de divisão para CUSTOM_DISTANCE e sincronizar inputs', () => {
      const { result } = renderHook(() => useDrillingBuilder({ heightMm: 2100 }));

      act(() => {
        result.current.handleDivisionTypeChange('CUSTOM_DISTANCE');
      });

      expect(result.current.drillingConfig.divisionType).toBe('CUSTOM_DISTANCE');
      expect(result.current.holeDistanceInputs).toEqual(['700', '1400']);
    });

    it('deve permitir atualizar a distância de um furo individualmente', () => {
      const { result } = renderHook(() => useDrillingBuilder({ heightMm: 2100 }));

      act(() => {
        result.current.handleSingleHoleDistanceChange(0, '500');
      });

      expect(result.current.holeDistanceInputs[0]).toBe('500');
      expect(result.current.drillingConfig.customDistancesMm?.[0]).toBe(500);
    });

    it('deve inicializar configuração externa via initDrilling', () => {
      const { result } = renderHook(() => useDrillingBuilder({ heightMm: 2100 }));

      act(() => {
        result.current.initDrilling({
          holeCount: 1,
          divisionType: 'CUSTOM_DISTANCE',
          customDistancesMm: [950],
        });
      });

      expect(result.current.drillingConfig.holeCount).toBe(1);
      expect(result.current.drillingConfig.divisionType).toBe('CUSTOM_DISTANCE');
      expect(result.current.drillingConfig.customDistancesMm).toEqual([950]);
      expect(result.current.holeDistanceInputs).toEqual(['950']);
    });
  });
});
