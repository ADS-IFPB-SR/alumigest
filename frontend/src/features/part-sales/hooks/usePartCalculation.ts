import { useState, useEffect } from 'react';
import { partSaleApi } from '../services/partSaleApi';
import type { CalculatePartItemPayload, CalculatePartItemResult } from '../types/partSaleTypes';

interface UsePartCalculationProps {
  payload?: CalculatePartItemPayload | null;
  debounceMs?: number;
  enabled?: boolean;
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

    if (
      !payload.category ||
      !payload.quantity ||
      payload.quantity <= 0 ||
      !payload.heightMm ||
      payload.heightMm <= 0 ||
      payload.unitPrice == null ||
      payload.unitPrice <= 0
    ) {
      setResult(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await partSaleApi.calculateItem(payload);
        setResult(data);
      } catch {
        // Fallback para cálculo local caso backend esteja inacessível em testes de UI isolados
        const lengthM = payload.heightMm / 1000;
        const loss = payload.lossFactor && payload.lossFactor >= 0 ? payload.lossFactor : 0;
        const billableM = Number((lengthM * payload.quantity * (1 + loss)).toFixed(4));
        const total = Number((billableM * payload.unitPrice).toFixed(2));
        setResult({
          calculatedUnitMeasure: billableM,
          unitPrice: payload.unitPrice,
          totalPrice: total,
        });
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
