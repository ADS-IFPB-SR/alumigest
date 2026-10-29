import { useState, useEffect } from 'react';
import { partSaleApi } from '../services/partSaleApi';
import type { CalculatePartItemPayload, CalculatePartItemResult } from '../types/partSaleTypes';

interface UsePartCalculationProps {
  payload?: CalculatePartItemPayload | null;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Cálculo local resiliente para testes isolados de UI ou quando o backend estiver temporariamente offline.
 * Segue as regras de negócio de cada tipo de insumo da US-46.
 */
function calculateLocalFallback(payload: CalculatePartItemPayload): CalculatePartItemResult {
  const qty = payload.quantity;
  const price = payload.unitPrice;
  const loss = payload.lossFactor && payload.lossFactor >= 0 ? payload.lossFactor : 0;
  const height = payload.heightMm || 0;
  const width = payload.widthMm || 0;

  let measure = 0;

  switch (payload.category) {
    case 'PROFILE': {
      // Metro Linear: (Comprimento em mm / 1000) * Qtd * (1 + Perda)
      const lengthM = height / 1000;
      measure = Number((lengthM * qty * (1 + loss)).toFixed(4));
      break;
    }
    case 'GLASS': {
      // Vidro em m²: Área física com piso mínimo industrial de 0.25 m² por peça
      const physicalArea = (height / 1000) * (width / 1000);
      const billableArea = Math.max(0.25, physicalArea);
      measure = Number((billableArea * qty).toFixed(4));
      break;
    }
    case 'FILM': {
      // Película em m²: Área * Qtd * (1 + Perda de bobina)
      const area = (height / 1000) * (width / 1000);
      measure = Number((area * qty * (1 + loss)).toFixed(4));
      break;
    }
    case 'HARDWARE':
    default: {
      // Ferragens: contagem por unidade inteira
      measure = qty;
      break;
    }
  }

  const total = Number((measure * price).toFixed(2));
  return {
    calculatedUnitMeasure: measure,
    unitPrice: price,
    totalPrice: total,
  };
}

export function usePartCalculation({
  payload,
  debounceMs = 250,
  enabled = true,
}: UsePartCalculationProps) {
  const [result, setResult] = useState<CalculatePartItemResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !payload) {
      setResult(null);
      setError(null);
      return;
    }

    // 1. Validação genérica de quantidade e preço
    if (
      !payload.category ||
      !payload.quantity ||
      payload.quantity <= 0 ||
      payload.unitPrice == null ||
      payload.unitPrice <= 0
    ) {
      setResult(null);
      setError(null);
      return;
    }

    // 2. Validações dimensionais contextuais por categoria de insumo
    if (payload.category === 'PROFILE') {
      if (!payload.heightMm || payload.heightMm <= 0) {
        setResult(null);
        setError(null);
        return;
      }
    } else if (payload.category === 'GLASS' || payload.category === 'FILM') {
      if (!payload.heightMm || payload.heightMm <= 0 || !payload.widthMm || payload.widthMm <= 0) {
        setResult(null);
        setError(null);
        return;
      }
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await partSaleApi.calculateItem(payload);
        setResult(data);
      } catch {
        // Fallback resiliente para cálculo local conforme a categoria do material
        const fallback = calculateLocalFallback(payload);
        setResult(fallback);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    payload,
    debounceMs,
    enabled,
  ]);

  return {
    calculation: result,
    isLoading,
    error,
  };
}
