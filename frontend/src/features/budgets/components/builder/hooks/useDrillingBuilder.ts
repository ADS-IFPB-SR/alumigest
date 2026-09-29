import { useState, useCallback } from 'react';
import type { DrillingConfig, DivisionType } from '../../../types';

import { DEFAULT_HEIGHT } from '../constants';

/**
 * Calcula as distâncias padrão equidistantes entre furos com base na altura total da esquadria.
 * @param count Quantidade de furos
 * @param height Altura da esquadria em milímetros
 */
export const getDefaultHoleDistances = (count: number, height: number): number[] => {
  if (count <= 0) return [];
  const step = Math.round(height / (count + 1));
  const dists: number[] = [];
  for (let i = 1; i <= count; i++) {
    dists.push(step * i);
  }
  return dists;
};

/**
 * Propriedades para o hook useDrillingBuilder.
 */
export interface UseDrillingBuilderProps {
  heightMm: number | '';
}

/**
 * Subhook especializado na furação técnica do vidro e perfil:
 * - Controle da quantidade de furos (1 a 8).
 * - Modos de distribuição: Equidistante (automático) ou Personalizado (medidas customizadas).
 * - Buffer de strings nos inputs para digitação suave em tempo real.
 */
export function useDrillingBuilder({ heightMm }: UseDrillingBuilderProps) {
  const [drillingConfig, setDrillingConfig] = useState<DrillingConfig>({
    holeCount: 2,
    divisionType: 'EQUAL',
    customDistancesMm: [700, 1400],
  });

  const [holeDistanceInputs, setHoleDistanceInputs] = useState<string[]>(['700', '1400']);

  const currentH = typeof heightMm === 'number' && heightMm > 0 ? heightMm : DEFAULT_HEIGHT;

  const handleHoleCountChange = useCallback((count: number) => {
    const defaults = getDefaultHoleDistances(count, currentH);

    setHoleDistanceInputs((prev) => {
      const next: string[] = [];
      for (let i = 0; i < count; i++) {
        if (prev[i] !== undefined && prev[i] !== '' && prev[i] !== '0') {
          next.push(prev[i]);
        } else {
          next.push(String(defaults[i]));
        }
      }
      return next;
    });

    setDrillingConfig((prev) => {
      const currentDists = prev.customDistancesMm ?? [];
      const nextDists: number[] = [];
      for (let i = 0; i < count; i++) {
        if (currentDists[i] !== undefined && currentDists[i] > 0) {
          nextDists.push(currentDists[i]);
        } else {
          nextDists.push(defaults[i]);
        }
      }

      return {
        ...prev,
        holeCount: count,
        customDistancesMm: nextDists,
      };
    });
  }, [currentH]);

  const handleDivisionTypeChange = useCallback((type: DivisionType) => {
    setDrillingConfig((prev) => {
      const count = prev.holeCount;
      const defaults = getDefaultHoleDistances(count, currentH);
      const nextDists = prev.customDistancesMm?.length === count ? prev.customDistancesMm : defaults;

      if (type === 'CUSTOM_DISTANCE') {
        setHoleDistanceInputs(nextDists.map(String));
      }

      return {
        ...prev,
        divisionType: type,
        customDistancesMm: nextDists,
      };
    });
  }, [currentH]);

  const handleSingleHoleDistanceChange = useCallback((index: number, val: string) => {
    setHoleDistanceInputs((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });

    const parsed = Number.parseInt(val, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setDrillingConfig((prev) => {
        const nextDists = [...(prev.customDistancesMm ?? [])];
        nextDists[index] = parsed;
        return {
          ...prev,
          customDistancesMm: nextDists,
        };
      });
    }
  }, []);

  const initDrilling = useCallback((config?: DrillingConfig) => {
    if (!config) return;
    setDrillingConfig(config);
    if (config.customDistancesMm && config.customDistancesMm.length > 0) {
      setHoleDistanceInputs(config.customDistancesMm.map(String));
    } else {
      const defaults = getDefaultHoleDistances(config.holeCount, currentH);
      setHoleDistanceInputs(defaults.map(String));
    }
  }, [currentH]);

  return {
    drillingConfig,
    setDrillingConfig,
    holeDistanceInputs,
    setHoleDistanceInputs,
    handleHoleCountChange,
    handleDivisionTypeChange,
    handleSingleHoleDistanceChange,
    initDrilling,
  };
}
