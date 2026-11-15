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
        console.log('Resultado do cálculo do item:', data);
      } catch (err) {
        setResult(null);
        setError('Não foi possível calcular o item.');
        console.error('Erro ao calcular o item:', err);
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